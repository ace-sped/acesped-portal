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
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
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
