// src/app/api/wallet/info/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getReservedAccountDetails, createReservedAccount } from '@/lib/monnify'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    })

    if (!wallet) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          accountNumber: null,
          bankName: null,
          accountName: null
        }
      })
    }

    // Use user's full name from database instead of Monnify's abbreviated name
    const firstName = wallet.user.firstName || wallet.user.username || 'User'
    const lastName = wallet.user.lastName || wallet.user.username || 'User'
    const fullName = `${firstName} ${lastName}`

    // Verify the wallet exists on Monnify - if not, create it
    if (wallet.accountRef) {
      const monnifyAccount = await getReservedAccountDetails(wallet.accountRef)
      
      if (!monnifyAccount.exists) {
        // Wallet exists in DB but not on Monnify - need to recreate
        const user = await prisma.user.findUnique({
          where: { id: session.user.id }
        })

        if (user) {
          try {
            const newAccount = await createReservedAccount({
              email: user.email,
              firstName: user.firstName || user.username || 'User',
              lastName: user.lastName || user.firstName || 'User',
              reference: `WALLET_${session.user.id}_${Date.now()}`
            })

            // Update wallet with new Monnify account details
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                accountNumber: newAccount.accountNumber,
                bankName: newAccount.bankName,
                accountName: newAccount.accountName,
                accountRef: newAccount.accountReference
              }
            })

            return NextResponse.json({
              success: true,
              data: {
                exists: true,
                accountNumber: newAccount.accountNumber,
                bankName: newAccount.bankName,
                accountName: fullName // Use our full name, not Monnify's
              }
            })
          } catch (error) {
            console.error('Failed to recreate Monnify account:', error)
            // Return existing wallet data even if Monnify sync failed
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        accountNumber: wallet.accountNumber,
        bankName: wallet.bankName,
        accountName: fullName // Use our full name, not Monnify's
      }
    })
  } catch (error) {
    console.error('Get wallet info error:', error)
    return NextResponse.json({ success: false, error: 'Failed to get wallet info' }, { status: 500 })
  }
}
