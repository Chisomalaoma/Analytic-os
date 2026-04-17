import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function updateRSVTLogo() {
  try {
    // Risevest logo URL (you'll need to upload this to Cloudinary or use a public URL)
    const logoUrl = 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/risevest-logo.png'
    
    // Update RSVT token with logo
    const updated = await prisma.token.update({
      where: { symbol: 'RSVT' },
      data: {
        logoUrl: logoUrl
      }
    })

    console.log('✅ RSVT token updated with logo')
    console.log('   Symbol:', updated.symbol)
    console.log('   Name:', updated.name)
    console.log('   Logo URL:', updated.logoUrl)
  } catch (error) {
    console.error('❌ Error updating RSVT logo:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateRSVTLogo()
