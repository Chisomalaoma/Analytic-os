import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param folder - Folder name in Cloudinary (default: 'profile-images')
 * @returns Cloudinary URL of uploaded image
 */
export async function uploadToCloudinary(
  base64Image: string,
  folder: string = 'profile-images'
): Promise<string> {
  try {
    console.log('Starting Cloudinary upload...')
    console.log('Folder:', folder)
    console.log('Image size:', base64Image.length)
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    })

    console.log('Upload successful:', result.secure_url)
    return result.secure_url
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    console.error('Error message:', error.message)
    console.error('Error details:', error.error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

/**
 * Delete image from Cloudinary
 * @param imageUrl - Cloudinary image URL
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from URL
    const parts = imageUrl.split('/')
    const filename = parts[parts.length - 1].split('.')[0]
    const folder = parts[parts.length - 2]
    const publicId = `${folder}/${filename}`

    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    // Don't throw error, just log it
  }
}

export default cloudinary
