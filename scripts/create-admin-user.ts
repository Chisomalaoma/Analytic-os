import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { hash } from 'bcryptjs'

function generateUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'ANALYTI-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function main() {
  const email = 'admin@wtx.com'
  const password = 'Admin123!'
  const username = 'admin'
  const firstName = 'Admin'
  const lastName = 'User'

  // Hash the password
  const hashedPassword = await hash(password, 12)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Update to admin role
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log(`✅ User ${email} updated to ADMIN role`)
  } else {
    // Create new admin user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        userId: generateUserId(),
        firstName,
        lastName,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    console.log(`✅ Admin user created:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Username: ${username}`)
    console.log(`   ID: ${user.id}`)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
