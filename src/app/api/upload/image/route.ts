import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { image } = await req.json()

    if (!image || !image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables not set')
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 500 }
      )
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(image, 'profile-images')

    return NextResponse.json({
      success: true,
      imageUrl
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
