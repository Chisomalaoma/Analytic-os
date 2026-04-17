import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function updateNIN() {
  const email = 'chisomalaoma@gmail.com'
  const nin = '27897918926'

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    // Update NIN
    await prisma.user.update({
      where: { email },
      data: { nin }
    })

    console.log(`✅ NIN updated successfully for ${email}`)
    console.log(`   NIN: ${nin}`)
  } catch (error) {
    console.error('❌ Error updating NIN:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateNIN()
