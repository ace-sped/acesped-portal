import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

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

    // Use unified storage utility (Cloudinary -> R2 -> Local)
    const result = await uploadFile(file, 'brochures');

    return NextResponse.json(result);
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














