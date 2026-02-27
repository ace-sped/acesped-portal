import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/storage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;

    // Check if R2 is configured
    if (r2Client) {
      try {
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: `services/${filename}`,
          Body: buffer,
          ContentType: file.type,
        });

        await r2Client.send(uploadCommand);

        // Construct public URL
        const publicUrlEndpoint = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
        const publicPath = publicUrlEndpoint
          ? `${publicUrlEndpoint}/services/${filename}`
          : `/uploads/services/${filename}`;

        return NextResponse.json({
          success: true,
          path: publicPath,
          message: 'File uploaded successfully to R2',
        });
      } catch (r2Error: any) {
        console.error('Error uploading to R2:', r2Error);
        console.warn('Falling back to local storage...');
      }
    }

    // Default: Save to local filesystem
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'services');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/services/${filename}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      message: 'File uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload file',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}














