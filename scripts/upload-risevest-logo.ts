import { PrismaClient } from '../src/generated/prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'
import * as path from 'path'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

async function uploadAndUpdateLogo() {
  try {
    console.log('📤 Uploading Risevest logo to Cloudinary...')
    
    // Path to the logo image (save the image you provided as risevest-logo.png in public folder)
    const logoPath = path.join(process.cwd(), 'public', 'risevest-logo.png')
    
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo file not found at:', logoPath)
      console.log('   Please save the Risevest logo as public/risevest-logo.png')
      process.exit(1)
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'token-logos',
      public_id: 'risevest-logo',
      overwrite: true,
      resource_type: 'image'
    })

    console.log('✅ Logo uploaded to Cloudinary')
    console.log('   URL:', result.secure_url)

    // Update RSVT token in database
    const updated = await prisma.token.update({
      where: { symbol: 'RSVT' },
      data: {
        logoUrl: result.secure_url
      }
    })

    console.log('✅ RSVT token updated in database')
    console.log('   Symbol:', updated.symbol)
    console.log('   Name:', updated.name)
    console.log('   Logo URL:', updated.logoUrl)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

uploadAndUpdateLogo()
