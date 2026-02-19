# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your application.

## Why Cloudinary?

- Free tier includes 25GB storage and 25GB bandwidth per month
- Automatic image optimization and transformation
- CDN delivery for fast image loading
- No database bloat from storing base64 images
- Better performance and scalability

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. After logging in, go to your Dashboard
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Add Credentials to Your Environment

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Configure Upload Presets (Optional)

1. Go to Settings > Upload
2. Scroll to "Upload presets"
3. Create a new preset with:
   - Mode: Unsigned (for client-side uploads) or Signed (for server-side)
   - Folder: `profile-images`
   - Transformations: 400x400 crop, auto quality

## Features Implemented

### Image Upload Flow

1. User selects an image (up to 10MB)
2. Image is compressed locally for preview
3. On save, image is uploaded to Cloudinary
4. Cloudinary returns a secure URL
5. URL is saved to database (not the image data)

### Automatic Optimizations

- Images are resized to 400x400 for profile pictures
- Face detection for smart cropping
- Automatic format selection (WebP for modern browsers)
- Quality optimization

### Benefits

- **No size limits**: Store images up to 10MB (vs 512KB before)
- **Fast loading**: CDN delivery worldwide
- **Database efficiency**: Only URLs stored, not image data
- **Better UX**: Users can upload higher quality images

## Free Tier Limits

- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for most applications. Monitor usage in your Cloudinary dashboard.

## Troubleshooting

### Upload fails with "Invalid credentials"
- Check that your API key and secret are correct
- Ensure there are no extra spaces in your .env file

### Images not displaying
- Check that the Cloudinary URL is being saved correctly
- Verify the image is public (not restricted)

### Slow uploads
- Cloudinary automatically optimizes images, which may take a moment
- Consider adding a loading indicator during upload

## Migration from Base64

If you have existing users with base64 images:

1. They will continue to work (backward compatible)
2. When users update their profile, new images will use Cloudinary
3. Old base64 images will be replaced with Cloudinary URLs

## Next Steps

- Monitor your Cloudinary usage in the dashboard
- Set up webhooks for advanced features (optional)
- Configure additional transformations as needed
