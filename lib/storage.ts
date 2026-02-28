import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { uploadToCloudinary } from './cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'aceportal-uploads';

export const r2Client = (accountId && accessKeyId && secretAccessKey)
    ? new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    })
    : null;

/**
 * Universal upload function that prioritizes Cloudinary, 
 * then falls back to R2, and finally local storage.
 */
export async function uploadFile(
    file: File,
    folder: string
): Promise<{ success: boolean; path: string; message: string }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Cloudinary (Primary)
    try {
        const isVideo = file.type.startsWith('video/');
        const result = await uploadToCloudinary(buffer, folder, isVideo ? 'video' : 'auto');
        if (result && result.secure_url) {
            return {
                success: true,
                path: result.secure_url,
                message: 'Uploaded to Cloudinary',
            };
        }
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
    }

    // 2. Fallback to R2
    if (r2Client) {
        try {
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}-${originalName}`;
            const key = `${folder}/${filename}`;

            const uploadCommand = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            });

            await r2Client.send(uploadCommand);

            const publicUrlEndpoint = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
            const publicPath = publicUrlEndpoint
                ? `${publicUrlEndpoint}/${key}`
                : `/uploads/${key}`;

            return {
                success: true,
                path: publicPath,
                message: 'Uploaded to R2',
            };
        } catch (error) {
            console.error('R2 upload failed:', error);
        }
    }

    // 3. Last resort: Local Storage
    try {
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${originalName}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return {
            success: true,
            path: `/uploads/${folder}/${filename}`,
            message: 'Uploaded to local storage',
        };
    } catch (error) {
        console.error('Local upload failed:', error);
        throw new Error('All storage methods failed');
    }
}

/**
 * Uploads a base64 string to Cloudinary.
 * Used for passport photographs and other base64-encoded files.
 */
export async function uploadBase64(
    base64String: string,
    folder: string
): Promise<{ success: boolean; path: string; message: string }> {
    try {
        // Cloudinary handles base64 directly
        const result = await new Promise((resolve, reject) => {
            require('cloudinary').v2.uploader.upload(
                base64String,
                {
                    folder,
                    resource_type: 'auto'
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        if (result && (result as any).secure_url) {
            return {
                success: true,
                path: (result as any).secure_url,
                message: 'Uploaded to Cloudinary',
            };
        }
        throw new Error('Upload failed');
    } catch (error) {
        console.error('Base64 upload failed:', error);
        return {
            success: false,
            path: base64String, // Return original if upload fails? Or handle as error.
            message: 'Failed to upload to Cloudinary',
        };
    }
}
