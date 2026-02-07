import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { sendWelcomeEmail } from '@/lib/auth/email'
import { generateUserId } from '@/lib/user-id'
import { createWalletWithRetry } from '@/lib/wallet-service'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  companyName: z.string().optional(), // For business accounts
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/, 'Password must contain at least one symbol'),
  role: z.enum(['USER', 'INVESTOR', 'ADMIN']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Generate unique user ID
    const userId = generateUserId()

    // Create user (email verification required via OTP)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        userId: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName || null, // Store company name for business accounts
        phone: data.phone || null,
        passwordHash,
        emailVerified: null, // Require OTP verification
        role: data.role || 'USER',
      },
    })

    // Send OTP verification email
    const { createVerificationToken } = await import('@/lib/auth/otp')
    const { sendOTPEmail } = await import('@/lib/auth/email')
    
    const otp = await createVerificationToken(data.email)
    const emailSent = await sendOTPEmail(data.email, otp)
    
    if (!emailSent) {
      console.error('[REGISTRATION] Failed to send OTP email')
      // Continue anyway - user can request new OTP
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Please verify your email.',
      requiresVerification: true,
      user: {
        email: user.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
