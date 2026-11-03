import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import cloudinary from '@/lib/cloudinary';

const ALLOWED_HOSTS = [
  'res.cloudinary.com',
  'res-1.cloudinary.com',
  'res-2.cloudinary.com',
  'res-3.cloudinary.com',
  'res-4.cloudinary.com',
  'res-5.cloudinary.com',
  'api.cloudinary.com',
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

/** If url is a path (e.g. "73071587/dli/file.pdf"), build full Cloudinary URL. */
function resolveUrl(urlParam: string): string {
  const decoded = decodeURIComponent(urlParam);
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded;
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.config().cloud_name;
  if (!cloudName) return urlParam;
  const path = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${path}`;
}

/** Strip delivery transforms so Cloudinary returns the original file, not an image preview. */
function stripCloudinaryTransforms(url: string): string {
  try {
    const u = new URL(url);
    u.pathname = u.pathname.replace(/\/upload\/(?:[^/]+\/)*?(v\d+\/)/, '/upload/$1');
    u.pathname = u.pathname.replace(
      /\/upload\/(?:(?:f_|q_|fl_|w_|h_|c_|dpr_|e_|s--)[^/,]+,?)+\/(?!v\d+)/,
      '/upload/'
    );
    return u.toString();
  } catch {
    return url;
  }
}

function getFilenameFromUrl(url: string, fallback = 'brochure.pdf'): string {
  try {
    const pathname = new URL(url).pathname;
    const last = pathname.split('/').pop() || fallback;
    return decodeURIComponent(last.split('?')[0] || fallback);
  } catch {
    return fallback;
  }
}

/** Extract Cloudinary public_id + resource type from a delivery URL. */
function parseCloudinaryAsset(url: string): {
  publicId: string;
  resourceType: 'image' | 'raw' | 'video';
  format?: string;
} | null {
  try {
    const u = new URL(stripCloudinaryTransforms(url));
    const parts = u.pathname.split('/').filter(Boolean);
    // [cloud, resourceType, 'upload', ...publicIdParts]
    if (parts.length < 4) return null;
    const resourceType = parts[1] as 'image' | 'raw' | 'video';
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex < 0) return null;
    let publicParts = parts.slice(uploadIndex + 1);
    if (publicParts[0] && /^v\d+$/.test(publicParts[0])) {
      publicParts = publicParts.slice(1);
    }
    if (publicParts.length === 0) return null;
    const last = publicParts[publicParts.length - 1];
    const formatMatch = last.match(/\.([a-z0-9]+)$/i);
    const format = formatMatch?.[1]?.toLowerCase();
    if (format) {
      publicParts[publicParts.length - 1] = last.replace(/\.[a-z0-9]+$/i, '');
    }
    return {
      publicId: publicParts.join('/'),
      resourceType: resourceType === 'raw' || resourceType === 'video' ? resourceType : 'image',
      format,
    };
  } catch {
    return null;
  }
}

/** Build signed authenticated URL for 401 fallback. */
function getSignedAuthenticatedUrls(cloudinaryUrl: string): string[] {
  const out: string[] = [];
  try {
    const u = new URL(cloudinaryUrl);
    const pathParts = u.pathname.split('/').filter(Boolean);
    if (pathParts.length < 5) return out;
    const cloudName = pathParts[0];
    const pathAfterUpload = pathParts.slice(3).join('/');
    const secret = process.env.CLOUDINARY_API_SECRET || cloudinary.config().api_secret;
    if (!secret) return out;
    const toSign = pathAfterUpload + secret;
    const hash = crypto.createHash('sha1').update(toSign).digest();
    const signature = hash
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
      .slice(0, 8);
    for (const resourceType of ['image', 'raw']) {
      const signedPath = `/${cloudName}/${resourceType}/authenticated/s--${signature}--/${pathAfterUpload}`;
      out.push(`https://${u.host}${signedPath}`);
    }
    return out;
  } catch {
    return out;
  }
}

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

async function fetchDocumentBuffer(
  url: string,
  signal: AbortSignal
): Promise<{ status: number; contentType: string; contentDisposition: string | null; buffer: Buffer }> {
  const res = await fetch(url, { signal, headers: FETCH_HEADERS });
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    status: res.status,
    contentType: res.headers.get('content-type') || '',
    contentDisposition: res.headers.get('content-disposition'),
    buffer,
  };
}

function isPdfBuffer(buffer: Buffer) {
  return buffer.subarray(0, 5).toString() === '%PDF-';
}

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get('url');
    const forceDownload = request.nextUrl.searchParams.get('download') === '1';
    if (!urlParam || typeof urlParam !== 'string') {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const resolvedUrl = resolveUrl(urlParam);
    const originalUrl = stripCloudinaryTransforms(resolvedUrl);
    const asset = parseCloudinaryAsset(originalUrl);

    const candidates: string[] = [];

    // Prefer Cloudinary private download for original PDFs (avoids f_auto PNG previews + ACL blocks).
    if (asset && (forceDownload || asset.format === 'pdf')) {
      try {
        const privateUrl = cloudinary.utils.private_download_url(
          asset.publicId,
          asset.format || 'pdf',
          {
            resource_type: asset.resourceType,
            type: 'upload',
            attachment: forceDownload,
          }
        );
        candidates.push(privateUrl);
      } catch (error) {
        console.error('private_download_url failed:', error);
      }
    }

    candidates.push(originalUrl, ...getSignedAuthenticatedUrls(originalUrl));

    const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));
    if (!uniqueCandidates.every(isAllowedUrl)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }

    let selected: {
      status: number;
      contentType: string;
      contentDisposition: string | null;
      buffer: Buffer;
    } | null = null;

    for (const candidate of uniqueCandidates) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const result = await fetchDocumentBuffer(candidate, controller.signal);
        if (result.status === 200 && result.buffer.length > 0) {
          selected = result;
          break;
        }
      } catch (error) {
        console.error('view-document candidate failed:', candidate, error);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!selected) {
      return NextResponse.json(
        {
          error:
            'Full PDF brochure is not available from storage. Please re-upload the brochure as a PDF.',
        },
        { status: 502 }
      );
    }

    const filename = getFilenameFromUrl(originalUrl);
    const looksLikePdf = isPdfBuffer(selected.buffer);
    if (forceDownload && filename.toLowerCase().endsWith('.pdf') && !looksLikePdf) {
      return NextResponse.json(
        {
          error:
            'Full PDF brochure is not available from storage. Please re-upload the brochure as a PDF.',
        },
        { status: 502 }
      );
    }

    const safeName = filename.replace(/"/g, '');
    const contentType = looksLikePdf
      ? 'application/pdf'
      : selected.contentType || 'application/octet-stream';
    const contentDisposition =
      forceDownload || looksLikePdf
        ? selected.contentDisposition?.includes('filename=')
          ? selected.contentDisposition.replace(/inline/i, forceDownload ? 'attachment' : 'inline')
          : `${forceDownload ? 'attachment' : 'inline'}; filename="${safeName}"`
        : selected.contentDisposition || `attachment; filename="${safeName}"`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', contentDisposition);
    headers.set('Content-Length', String(selected.buffer.length));
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(selected.buffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('view-document proxy error:', message);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
