import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  companyName: z.string().optional(), // For business accounts
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional(),
  image: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
      'Image must be a valid URL'
    ),
      'Invalid image URL or data URL'
    )
    .optional()
    .nullable(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== session.user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingEmail) {
        return NextResponse.json(
          { error: 'This email is already in use' },
          { status: 400 }
        )
      }
    }

    // Check if username is being changed and if it's already taken
    if (data.username && data.username !== session.user.name) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      })
      if (existingUsername) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        username: data.username,
        email: data.email,
        phone: data.phone || null,
        image: data.image,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        username: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
