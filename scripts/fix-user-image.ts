// Script to fix user accounts with corrupted/oversized images
// Run with: npx tsx scripts/fix-user-image.ts <email>

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserImage(email: string) {
  try {
    console.log(`\n🔍 Looking for user: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        image: true,
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('\n✅ User found:')
    console.log(`  - ID: ${user.id}`)
    console.log(`  - Name: ${user.firstName} ${user.lastName}`)
    console.log(`  - Username: ${user.username}`)
    console.log(`  - Image size: ${user.image ? `${user.image.length} characters` : 'No image'}`)

    if (user.image && user.image.length > 500 * 1024) {
      console.log('\n⚠️  Image is too large! Removing it...')
      
      await prisma.user.update({
        where: { id: user.id },
        data: { image: null }
      })
      
      console.log('✅ Image removed successfully')
      console.log('   User can now sign in and upload a smaller image')
    } else if (user.image) {
      console.log('\n✅ Image size is acceptable')
    } else {
      console.log('\n✅ User has no image set')
    }

    console.log('\n✅ Account is accessible')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/fix-user-image.ts <email>')
  process.exit(1)
}

fixUserImage(email)
