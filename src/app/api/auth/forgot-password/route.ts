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
    console.log('[FORGOT-PASSWORD] API called')
    const body = await request.json()
    console.log('[FORGOT-PASSWORD] Email:', body.email)
    
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    console.log('[FORGOT-PASSWORD] User found:', !!user)

    // Don't reveal if user exists or not for security
    if (!user) {
      console.log('[FORGOT-PASSWORD] User not found, returning success anyway')
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset code.',
      })
    }

    // Generate and store OTP
    console.log('[FORGOT-PASSWORD] Generating OTP...')
    const otp = await createVerificationToken(email)
    console.log('[FORGOT-PASSWORD] OTP generated:', otp)

    // Send OTP via email
    console.log('[FORGOT-PASSWORD] Sending email...')
    const emailSent = await sendPasswordResetOTPEmail(email, otp)
    console.log('[FORGOT-PASSWORD] Email sent:', emailSent)
    
    if (!emailSent) {
      console.error('[FORGOT-PASSWORD] Failed to send OTP email')
      return NextResponse.json(
        { error: 'Failed to send reset code. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[FORGOT-PASSWORD] Success!')
    return NextResponse.json({
      success: true,
      message: 'Reset code sent to your email',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[FORGOT-PASSWORD] Validation error:', error.errors)
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('[FORGOT-PASSWORD] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
