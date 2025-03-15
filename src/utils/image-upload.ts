import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

export const uploadImage = async (file: File) => {
  const buffer = await file.arrayBuffer();

  const base64Image = Buffer.from(buffer).toString('base64');

  const imageType = file.type.split('/')[1];

  const resp = await cloudinary.uploader.upload(
    `data:image/${imageType};base64,${base64Image}`
  );

  return resp.secure_url;
};

export const deleteImage = async (image: string) => {
  try {
    const imageName = image.split('/').pop() ?? '';

    const imageId = imageName.split('.')[0];

    const resp = await cloudinary.uploader.destroy(imageId);

    return true;
  } catch (error) {
    console.log('Error deleting image', error);
    return false;
  }
};
