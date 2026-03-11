import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const FOLDER = 'dli';
const MAX_SIZE = 50 * 1024 * 1024; // 50MB per file

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || typeof file === 'string' || !file.size) {
      return NextResponse.json(
        { success: false, path: '', message: 'Invalid file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, path: '', message: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') || 'document';
    const filename = `${timestamp}-${originalName}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', FOLDER);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const path = `/uploads/${FOLDER}/${filename}`;
    return NextResponse.json({
      success: true,
      path,
      message: 'Uploaded to uploads folder',
    });
  } catch (err) {
    console.error('DLI upload error:', err);
    return NextResponse.json(
      {
        success: false,
        path: '',
        message: err instanceof Error ? err.message : 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}
