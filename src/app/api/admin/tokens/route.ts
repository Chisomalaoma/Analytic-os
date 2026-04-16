import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNewTokenListed } from '@/lib/notifications'
import crypto from 'crypto'

const createTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(2, 'Symbol must be at least 2 characters').max(10, 'Symbol max 10 chars'),
  price: z.number().min(1, 'Price must be positive'),
  annualYield: z.number().min(0).max(100, 'Yield must be 0-100'),
  industry: z.string().min(1, 'Industry is required'),
  payoutFrequency: z.string().min(1, 'Payout frequency is required'),
  investmentType: z.string().min(1, 'Investment type is required'),
  riskLevel: z.string().min(1, 'Risk level is required'),
  listingDate: z.string().transform((str) => new Date(str)),
  closeDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  logoUrl: z.string().url().optional().or(z.literal('')),
  minimumInvestment: z.number().min(1, 'Minimum investment must be positive'),
  employeeCount: z.number().int().min(0, 'Employee count must be positive'),
  description: z.string().optional(),
  contractAddress: z.string().optional().nullable(),
})

type CreateTokenInput = z.infer<typeof createTokenSchema>

interface TokenResponse {
  id: string
  tokenId: string | null
  name: string
  symbol: string
  price: number
  annualYield: number
  industry: string
  payoutFrequency: string
  investmentType: string
  riskLevel: string
  listingDate: string
  closeDate: string | null
  logoUrl: string | null
  minimumInvestment: number
  employeeCount: number
  description: string | null
  volume: number
  transactionCount: number
  isActive: boolean
  createdAt: string
}

function formatTokenResponse(token: any): TokenResponse {
  return {
    id: token.id,
    tokenId: token.tokenId,
    name: token.name,
    symbol: token.symbol,
    price: token.price,
    annualYield: Number(token.annualYield),
    industry: token.industry,
    payoutFrequency: token.payoutFrequency,
    investmentType: token.investmentType,
    riskLevel: token.riskLevel,
    listingDate: token.listingDate.toISOString(),
    closeDate: token.closeDate?.toISOString() || null,
    logoUrl: token.logoUrl || null,
    minimumInvestment: token.minimumInvestment,
    employeeCount: token.employeeCount,
    description: token.description || null,
    volume: token.volume || 0,
    transactionCount: token.transactionCount || 0,
    isActive: token.isActive,
    createdAt: token.createdAt.toISOString(),
  }
}

// Generate unique tokenId (e.g., FCMB-001, PYSK-002)
async function generateTokenId(symbol: string): Promise<string> {
  const prefix = symbol.toUpperCase().slice(0, 4)

  // Get existing tokens with this prefix
  const existing = await prisma.token.findMany({
    where: {
      tokenId: { startsWith: `${prefix}-` },
    },
    orderBy: { tokenId: 'desc' },
    take: 1,
  })

  let nextNum = 1
  if (existing.length > 0 && existing[0].tokenId) {
    const lastNum = parseInt(existing[0].tokenId.split('-')[1] || '0')
    nextNum = lastNum + 1
  }

  return `${prefix}-${String(nextNum).padStart(3, '0')}`
}

/**
 * GET /api/admin/tokens - List all tokens (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    // Dev bypass: skip auth in development
    if (!session?.user?.id && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check when user roles are implemented
    // if (!session.user.role === 'admin') { ... }

    const tokens = await prisma.token.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      tokens: tokens.map(formatTokenResponse),
    })
  } catch (error) {
    console.error('List tokens error:', error)
    return NextResponse.json({ error: 'Failed to list tokens' }, { status: 500 })
  }
}

/**
 * POST /api/admin/tokens - Create new token (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    // Dev bypass: skip auth in development
    if (!session?.user?.id && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check when user roles are implemented

    const body = await request.json()
    const data: CreateTokenInput = createTokenSchema.parse(body)

    // Check for duplicate symbol
    const existing = await prisma.token.findUnique({
      where: { symbol: data.symbol.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Token symbol already exists' },
        { status: 400 }
      )
    }

    // Generate unique tokenId
    const tokenId = await generateTokenId(data.symbol)

    // Auto-generate contract address (Ethereum-style)
    const contractAddress = data.contractAddress || `0x${crypto.randomBytes(20).toString('hex')}`

    // Create token
    const token = await prisma.token.create({
      data: {
        tokenId,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        price: data.price, // already in kobo
        annualYield: data.annualYield,
        industry: data.industry,
        payoutFrequency: data.payoutFrequency,
        investmentType: data.investmentType,
        riskLevel: data.riskLevel,
        listingDate: data.listingDate,
        closeDate: data.closeDate,
        logoUrl: data.logoUrl || null,
        minimumInvestment: data.minimumInvestment,
        employeeCount: data.employeeCount,
        description: data.description || null,
        contractAddress,
        volume: 0,
        transactionCount: 0,
      },
    })

    // Notify all active users about the new token
    try {
      const users = await prisma.user.findMany({
        where: { role: { in: ['USER', 'INVESTOR'] } },
        select: { id: true },
      })

      await Promise.all(
        users.map((user) =>
          notifyNewTokenListed(
            user.id,
            data.name,
            data.symbol.toUpperCase(),
            data.price,
            data.annualYield
          )
        )
      )
    } catch (notifyError) {
      console.error('Failed to send new token notifications:', notifyError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      token: formatTokenResponse(token),
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create token error:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
}
