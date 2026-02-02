import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { sendPasswordChangeConfirmation } from '@/lib/auth/email'

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/, 'Password must contain at least one symbol'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, password } = resetPasswordSchema.parse(body)

    // Find and verify reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
      },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    // Delete used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    // Send confirmation email
    await sendPasswordChangeConfirmation(email)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
