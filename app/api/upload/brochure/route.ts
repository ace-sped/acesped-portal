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

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'File must be a PDF, DOC, or DOCX file' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
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
          Key: `brochures/${filename}`,
          Body: buffer,
          ContentType: file.type,
        });

        await r2Client.send(uploadCommand);

        // Construct public URL
        const publicUrlEndpoint = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
        const publicPath = publicUrlEndpoint
          ? `${publicUrlEndpoint}/brochures/${filename}`
          : `/uploads/brochures/${filename}`;

        return NextResponse.json({
          success: true,
          path: publicPath,
          message: 'Brochure uploaded successfully to R2',
        });
      } catch (r2Error: any) {
        console.error('Error uploading to R2:', r2Error);
        console.warn('Falling back to local storage...');
      }
    }

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'brochures');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/brochures/${filename}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      message: 'Brochure uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading brochure:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload brochure',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}














