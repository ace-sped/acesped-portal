import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || typeof file === 'string' || !file.type) {
      return NextResponse.json(
        { success: false, message: 'Invalid file provided' },
        { status: 400 }
      );
    }

    // Validate file type (image or video)
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image or video' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 500MB' },
        { status: 400 }
      );
    }

    // Use unified storage utility (Cloudinary -> R2 -> Local)
    console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
    const result = await uploadFile(file, 'projects');
    console.log('Upload result:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SERVER ERROR - Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload file',
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
