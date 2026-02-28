import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // If URL is provided, it handles everything
  cloudinary.config({
    secure: true
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Log configuration status (without secrets)
console.log('Cloudinary initialized with cloud_name:', cloudinary.config().cloud_name);

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<any> => {
  const options: any = {
    folder,
    resource_type: resourceType,
  };

  // If it's a video, add eager transformations for adaptive streaming (HLS)
  if (resourceType === 'video') {
    options.eager = [
      { streaming_profile: 'full_hd', format: 'm3u8' }, // Adaptive Bitrate Streaming (HLS)
      { quality: 'auto', fetch_format: 'auto' }        // Optimized standard MP4
    ];
    options.eager_async = true; // Process in background for better response time
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(`Cloudinary ${resourceType} upload error:`, error);
          return reject(error);
        }
        console.log(`Cloudinary ${resourceType} upload success:`, result?.secure_url);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
