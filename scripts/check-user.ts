import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  const email1 = 'chisomalaoma@gmail.com'
  const email2 = 'Chisomalaoma@gmail.com'

  try {
    const user1 = await prisma.user.findUnique({
      where: { email: email1 },
      select: { id: true, email: true, passwordHash: true }
    })

    const user2 = await prisma.user.findUnique({
      where: { email: email2 },
      select: { id: true, email: true, passwordHash: true }
    })

    console.log('User with lowercase email:', user1 ? '✅ Found' : '❌ Not found')
    if (user1) {
      console.log('  Email:', user1.email)
      console.log('  Has password:', !!user1.passwordHash)
    }

    console.log('\nUser with capital C email:', user2 ? '✅ Found' : '❌ Not found')
    if (user2) {
      console.log('  Email:', user2.email)
      console.log('  Has password:', !!user2.passwordHash)
    }

    // Search for any user with similar email (case-insensitive)
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'chisomalaoma',
          mode: 'insensitive'
        }
      },
      select: { id: true, email: true, passwordHash: true }
    })

    console.log('\n📋 All matching users:')
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (has password: ${!!user.passwordHash})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
