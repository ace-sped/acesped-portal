import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

// Standard video optimization transformation string
// - c_limit: don't upscale, only downscale
// - w_1280: max width 1280px (720p/HD)
// - q_auto: automatic quality selection
// - vc_auto: automatic codec selection (e.g. H.265 for smaller files)
// - br_2000k: cap bitrate at 2 Mbps for web-friendly size
const VIDEO_TRANSFORMATION = 'c_limit,w_1280,q_auto,vc_auto,br_2000k';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder') || 'uploads';
        const resourceType = searchParams.get('resourceType') || 'auto';
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramsToSign: Record<string, any> = {
            timestamp,
            folder,
        };

        // For video uploads, include an incoming transformation to
        // automatically compress and optimise the stored file.
        // NOTE: resource_type is NOT signed — it is part of the upload URL path,
        // not a form body parameter.  Including it causes a signature mismatch.
        if (resourceType === 'video') {
            paramsToSign.transformation = VIDEO_TRANSFORMATION;
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            success: true,
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
            resourceType,
            // Send the transformation string so the client can include it
            ...(resourceType === 'video' && { transformation: VIDEO_TRANSFORMATION }),
        });
    } catch (error: any) {
        console.error('Error generating signature:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate signature' },
            { status: 500 }
        );
    }
}
