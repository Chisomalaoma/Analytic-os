import { PrismaClient } from '../src/generated/prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function resetPassword() {
  const email = 'chisomalaoma@gmail.com'
  const newPassword = 'Xtes.app@123'

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })

    console.log(`✅ Password reset successfully for ${email}`)
    console.log(`   New password: ${newPassword}`)
  } catch (error) {
    console.error('❌ Error resetting password:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
