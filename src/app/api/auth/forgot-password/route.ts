import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createVerificationToken } from '@/lib/auth/otp'
import { sendPasswordResetOTPEmail } from '@/lib/auth/email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset code.',
      })
    }

    // Generate and store OTP
    const otp = await createVerificationToken(email)

    // Send OTP via email
    const emailSent = await sendPasswordResetOTPEmail(email, otp)
    
    if (!emailSent) {
      console.error('[FORGOT-PASSWORD] Failed to send OTP email')
      return NextResponse.json(
        { error: 'Failed to send reset code. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reset code sent to your email',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
