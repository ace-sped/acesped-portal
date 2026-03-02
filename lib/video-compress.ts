/**
 * Client-side video compression using the browser's MediaRecorder API.
 *
 * How it works:
 *  1. Loads the video into a hidden <video> element
 *  2. Draws each frame onto a smaller <canvas>
 *  3. Captures the canvas stream + audio via MediaRecorder
 *  4. Returns a compressed WebM file
 *
 * Note: compression runs in approximately real-time (a 60 s video ≈ 60 s).
 */

export interface CompressProgress {
    phase: 'loading' | 'compressing' | 'finalising' | 'done' | 'skipped';
    progress: number;   // 0 – 1
    message: string;
}

export interface CompressOptions {
    /** Max output width (default 1280) */
    maxWidth?: number;
    /** Max output height (default 720) */
    maxHeight?: number;
    /** Target video bitrate in bps (default 1 500 000 = 1.5 Mbps) */
    videoBitsPerSecond?: number;
    /** Files smaller than this (bytes) are returned unchanged (default 20 MB) */
    skipBelowBytes?: number;
    /** Progress callback */
    onProgress?: (info: CompressProgress) => void;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function compressVideo(
    file: File,
    options: CompressOptions = {},
): Promise<File> {
    const {
        maxWidth = 1280,
        maxHeight = 720,
        videoBitsPerSecond = 1_500_000,
        skipBelowBytes = 20 * 1024 * 1024, // 20 MB
        onProgress,
    } = options;

    // 1. Skip if already small
    if (file.size < skipBelowBytes) {
        onProgress?.({ phase: 'skipped', progress: 1, message: 'File is small enough — skipping compression' });
        return file;
    }

    // 2. Check browser support
    if (typeof MediaRecorder === 'undefined' || typeof document === 'undefined') {
        console.warn('[video-compress] MediaRecorder not available, returning original file');
        onProgress?.({ phase: 'skipped', progress: 1, message: 'Browser does not support compression' });
        return file;
    }

    onProgress?.({ phase: 'loading', progress: 0, message: 'Loading video…' });

    return new Promise<File>((resolve, reject) => {
        // ---------- set up the <video> ----------
        const video = document.createElement('video');
        video.playsInline = true;
        video.preload = 'auto';
        // Mute: allows autoplay in all browsers
        video.muted = true;
        // We will unmute later via the AudioContext path
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        document.body.appendChild(video);

        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        const cleanup = () => {
            URL.revokeObjectURL(objectUrl);
            video.pause();
            video.removeAttribute('src');
            video.load();
            video.remove();
        };

        video.onerror = () => {
            cleanup();
            // Don't reject — fall back to original file
            console.warn('[video-compress] Could not decode video, returning original');
            onProgress?.({ phase: 'skipped', progress: 1, message: 'Could not decode video' });
            resolve(file);
        };

        video.onloadedmetadata = () => {
            // ---------- calculate target dimensions ----------
            let w = video.videoWidth;
            let h = video.videoHeight;

            if (w > maxWidth || h > maxHeight) {
                const scale = Math.min(maxWidth / w, maxHeight / h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }
            w -= w % 2; // must be even
            h -= h % 2;

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;

            // ---------- build the combined stream ----------
            const canvasStream = canvas.captureStream(30); // 30 fps
            const combinedStream = new MediaStream(canvasStream.getVideoTracks());

            // Try to capture audio
            try {
                video.muted = false;
                video.volume = 0; // silent output but audio data still flows
                const audioCtx = new AudioContext();
                const src = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                src.connect(dest);
                // Do NOT connect to audioCtx.destination — keeps audio silent
                dest.stream.getAudioTracks().forEach(t => combinedStream.addTrack(t));
            } catch {
                // Audio capture failed — compress video-only
                video.muted = true;
            }

            // ---------- MediaRecorder ----------
            const mimeType =
                ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
                    .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

            let recorder: MediaRecorder;
            try {
                recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond });
            } catch {
                cleanup();
                onProgress?.({ phase: 'skipped', progress: 1, message: 'Codec not supported' });
                resolve(file);
                return;
            }

            const chunks: Blob[] = [];

            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                cleanup();
                onProgress?.({ phase: 'finalising', progress: 0.95, message: 'Finalising…' });

                const blob = new Blob(chunks, { type: 'video/webm' });
                const ext = '.webm';
                const baseName = file.name.replace(/\.[^.]+$/, '');
                const compressed = new File([blob], baseName + ext, {
                    type: 'video/webm',
                    lastModified: Date.now(),
                });

                const ratio = ((1 - compressed.size / file.size) * 100).toFixed(0);
                onProgress?.({
                    phase: 'done',
                    progress: 1,
                    message: `Compressed ${fmtSize(file.size)} → ${fmtSize(compressed.size)} (${ratio}% smaller)`,
                });

                // If the "compressed" file ended up bigger or near original, return original
                if (compressed.size >= file.size * 0.9) {
                    resolve(file);
                } else {
                    resolve(compressed);
                }
            };

            recorder.onerror = () => {
                cleanup();
                onProgress?.({ phase: 'skipped', progress: 1, message: 'Compression failed — uploading original' });
                resolve(file); // graceful fallback
            };

            // ---------- Start ----------
            recorder.start(500); // gather data every 500 ms
            const duration = video.duration;

            onProgress?.({ phase: 'compressing', progress: 0, message: 'Compressing video (0%)…' });

            // Render loop: draws each video frame onto the canvas
            let animId: number;
            const draw = () => {
                if (video.ended || video.paused) {
                    // Small delay to flush the last frames
                    setTimeout(() => {
                        if (recorder.state === 'recording') recorder.stop();
                    }, 300);
                    return;
                }

                ctx.drawImage(video, 0, 0, w, h);

                if (duration && duration > 0) {
                    const pct = Math.min(video.currentTime / duration, 1);
                    const remaining = Math.ceil((duration - video.currentTime));
                    onProgress?.({
                        phase: 'compressing',
                        progress: pct,
                        message: `Compressing… ${Math.round(pct * 100)}% — ~${remaining}s remaining`,
                    });
                }

                animId = requestAnimationFrame(draw);
            };

            // Wait until enough data is buffered, then play
            video.oncanplay = () => {
                video.play()
                    .then(() => { draw(); })
                    .catch(() => {
                        // autoplay blocked — fall back to original
                        cleanup();
                        onProgress?.({ phase: 'skipped', progress: 1, message: 'Autoplay blocked — uploading original' });
                        resolve(file);
                    });
            };

            // When the video reaches the end, stop recording
            video.onended = () => {
                cancelAnimationFrame(animId);
                onProgress?.({ phase: 'compressing', progress: 1, message: 'Finishing compression…' });
                setTimeout(() => {
                    if (recorder.state === 'recording') recorder.stop();
                }, 300);
            };
        };
    });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
