import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

async function main() {
  const p = new PrismaClient()

  // Check if admin already exists
  const existing = await p.user.findFirst({
    where: { email: 'admin@wtx.com' }
  })

  if (existing) {
    console.log('Admin user already exists:', existing.email)
    console.log('Role:', (existing as any).role || 'USER')
    return
  }

  const hashedPassword = await hash('Admin@123', 10)

  const admin = await p.user.create({
    data: {
      email: 'admin@wtx.com',
      username: 'admin',
      userId: 'ADMIN001',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date()
    }
  })

  console.log('✅ Admin created successfully!')
  console.log('Email: admin@wtx.com')
  console.log('Password: Admin@123')
  console.log('User ID:', admin.id)
}

main().catch(console.error)
