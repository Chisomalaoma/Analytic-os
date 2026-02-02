import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyAndConsumeOTP } from '@/lib/auth/otp'
import crypto from 'crypto'

const verifyResetOTPSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().length(6, 'Please enter the 6-digit code'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token } = verifyResetOTPSchema.parse(body)

    // Verify OTP
    const isValid = await verifyAndConsumeOTP(email, token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please try again.' },
        { status: 400 }
      )
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      resetToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Verify reset OTP error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
