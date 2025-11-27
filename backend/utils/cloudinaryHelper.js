const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Upload buffer to Cloudinary
exports.uploadToCloudinary = async (buffer, folder = 'emmidev-codebridge') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            cloudinaryId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Delete from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

// Upload multiple files
exports.uploadMultipleToCloudinary = async (files, folder = 'emmidev-codebridge') => {
  try {
    const uploadPromises = files.map(file => 
      this.uploadToCloudinary(file.buffer, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};
