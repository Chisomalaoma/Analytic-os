import { prisma } from '../src/lib/prisma'

async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'chisomalaoma@gmail.com' },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    if (user) {
      console.log('User ID:', user.id)
      console.log('Name:', user.firstName, user.lastName)
      console.log('Email:', user.email)
    } else {
      console.log('User not found')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getUserId()