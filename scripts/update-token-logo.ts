import { prisma } from '../src/lib/prisma'

/**
 * Update token logo URL
 * Usage: npx tsx scripts/update-token-logo.ts <symbol> <logoUrl>
 * Example: npx tsx scripts/update-token-logo.ts RSVT https://res.cloudinary.com/xxx/image/upload/v123/rsvt-logo.png
 */

async function updateTokenLogo() {
  const symbol = process.argv[2]
  const logoUrl = process.argv[3]

  if (!symbol || !logoUrl) {
    console.error('Usage: npx tsx scripts/update-token-logo.ts <symbol> <logoUrl>')
    console.error('Example: npx tsx scripts/update-token-logo.ts RSVT https://res.cloudinary.com/xxx/image/upload/v123/logo.png')
    process.exit(1)
  }

  try {
    const token = await prisma.token.update({
      where: { symbol },
      data: { logoUrl },
    })

    console.log(`✅ Successfully updated logo for ${token.name} (${token.symbol})`)
    console.log(`   Logo URL: ${logoUrl}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTokenLogo()
