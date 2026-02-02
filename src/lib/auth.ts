import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Twitter from 'next-auth/providers/twitter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { generateUserId } from '@/lib/user-id'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
        }
      },
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth to existing email accounts
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'email,public_profile',
          prompt: 'consent',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'tweet.read users.read offline.access',
          prompt: 'consent',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          throw new Error('No account found with this email')
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.email.split('@')[0],
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          walletAddress: user.walletAddress,
          role: user.role,
        } as any
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id
        token.userId = (user as any).userId
        token.username = (user as any).username
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.phone = (user as any).phone
        token.walletAddress = (user as any).walletAddress
        token.role = (user as any).role
        token.image = (user as any).image
      }
      
      // For OAuth users, fetch fresh data from database
      if (token.id && account?.provider && (account.provider === 'google' || account.provider === 'facebook' || account.provider === 'twitter')) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              userId: true,
              username: true,
              firstName: true,
              lastName: true,
              phone: true,
              walletAddress: true,
              role: true,
              image: true,
            }
          })
          
          if (dbUser) {
            token.userId = dbUser.userId
            token.username = dbUser.username
            token.firstName = dbUser.firstName
            token.lastName = dbUser.lastName
            token.phone = dbUser.phone
            token.walletAddress = dbUser.walletAddress
            token.role = dbUser.role
            token.image = dbUser.image
          }
        } catch (error) {
          console.error('Failed to fetch user data for JWT:', error)
        }
      }
      
      // Handle session update trigger (when updateSession is called)
      if (trigger === 'update' && session) {
        token.username = session.user?.name || token.username
        token.firstName = session.user?.firstName || token.firstName
        token.lastName = session.user?.lastName || token.lastName
        token.phone = session.user?.phone || token.phone
        token.image = session.user?.image || token.image
      }
      
      // Fetch fresh role from database for existing sessions
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      
      // Update image from OAuth provider
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'twitter') {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.userId = token.userId as string | null
        session.user.name = token.username as string
        session.user.username = token.username as string | null
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.phone = token.phone as string | null
        session.user.walletAddress = token.walletAddress as string | null
        session.user.image = token.image as string | null
        session.user.role = token.role as string | null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in - let PrismaAdapter handle user creation
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'twitter') {
        try {
          // Wait a moment for PrismaAdapter to create the user if it's a new signup
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Check if user exists in database (PrismaAdapter may have just created it)
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { wallet: true }
          })

          if (!existingUser) {
            console.log('[OAUTH] User not found after wait, will be created by adapter')
            return true
          }

          console.log('[OAUTH] Found user:', existingUser.email, 'Has wallet:', !!existingUser.wallet)

          // Extract first and last name from profile or user.name
          let firstName = 'User'
          let lastName = 'User'
          
          // Try to get from OAuth profile first (Google provides given_name, family_name)
          if (profile) {
            firstName = (profile as any).given_name || (profile as any).firstName || firstName
            lastName = (profile as any).family_name || (profile as any).lastName || lastName
          }
          
          // If still default, try parsing user.name
          if ((firstName === 'User' || lastName === 'User') && user.name) {
            const nameParts = user.name.trim().split(' ')
            if (nameParts.length > 0) {
              firstName = nameParts[0] || 'User'
              lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName
            }
          }

          // Update user with additional fields if they're missing
          if (!existingUser.userId || !existingUser.username || !existingUser.firstName || !existingUser.lastName) {
            const username = user.email?.split('@')[0] || `user_${Date.now()}`
            const uniqueUsername = `${username}_${Math.random().toString(36).substring(2, 6)}`

            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                userId: existingUser.userId || generateUserId(),
                username: existingUser.username || uniqueUsername,
                firstName: existingUser.firstName || firstName,
                lastName: existingUser.lastName || lastName,
                image: user.image || existingUser.image,
              }
            })
            console.log('[OAUTH] Updated OAuth user with missing fields:', user.email, 'Name:', firstName, lastName)
          }

          // If user exists but has no wallet, create one
          if (!existingUser.wallet) {
            console.log('[OAUTH] Creating wallet for OAuth user:', existingUser.email)
            const { createWalletWithRetry } = await import('@/lib/wallet-service')
            const walletResult = await createWalletWithRetry({
              userId: existingUser.id,
              email: existingUser.email,
              firstName: existingUser.firstName || user.name?.split(' ')[0] || 'User',
              lastName: existingUser.lastName || user.name?.split(' ').slice(1).join(' ') || 'User',
              maxRetries: 3
            })
            
            if (walletResult.success) {
              console.log('[OAUTH] Wallet created successfully for:', existingUser.email)
            } else {
              console.error('[OAUTH] Failed to create wallet:', walletResult.error)
              // Don't block sign-in even if wallet creation fails
            }
          } else {
            console.log('[OAUTH] User already has wallet')
          }
        } catch (error) {
          console.error('[OAUTH] Error in signIn callback:', error)
          // Don't block sign-in on errors
        }
        return true
      }
      // Credentials handled separately
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // This event fires when NextAuth/PrismaAdapter creates a new user
      if (user.id) {
        try {
          // Generate username from email or name
          const username = user.email?.split('@')[0] || `user_${Date.now()}`
          const uniqueUsername = `${username}_${Math.random().toString(36).substring(2, 6)}`
          
          // Parse name into first and last - use better parsing
          let firstName = 'User'
          let lastName = 'User'
          
          if (user.name) {
            const nameParts = user.name.trim().split(' ')
            firstName = nameParts[0] || 'User'
            lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName
          }

          // Update user with userId, username, and name fields
          await prisma.user.update({
            where: { id: user.id },
            data: {
              userId: generateUserId(),
              username: uniqueUsername,
              firstName: firstName,
              lastName: lastName,
            }
          })
          console.log('Updated new OAuth user with userId and username:', user.email, 'Name:', firstName, lastName)

          // Create wallet for new user
          console.log('[OAUTH-CREATE] Creating wallet for new user:', user.email)
          const { createWalletWithRetry } = await import('@/lib/wallet-service')
          const walletResult = await createWalletWithRetry({
            userId: user.id,
            email: user.email!,
            firstName: firstName,
            lastName: lastName,
            maxRetries: 3
          })
          
          if (walletResult.success) {
            console.log('[OAUTH-CREATE] Wallet created for new OAuth user:', user.email)
          } else {
            console.error('[OAUTH-CREATE] Failed to create wallet:', walletResult.error)
          }
        } catch (error) {
          console.error('Failed to update new OAuth user:', error)
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
})

// Export authOptions for API routes (NextAuth v5 format)
interface JWTPayload {
  id?: string
  userId?: string | null
  firstName?: string | null
  lastName?: string | null
  walletAddress?: string | null
}

interface UserPayload {
  id: string
  email: string
  name: string
  userId?: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  walletAddress?: string | null
}

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          throw new Error('No account found with this email')
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.email.split('@')[0],
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          walletAddress: user.walletAddress,
        } as UserPayload
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWTPayload; user?: UserPayload }) {
      if (user) {
        token.id = user.id
        token.userId = user.userId
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.walletAddress = user.walletAddress
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWTPayload }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.userId = token.userId as string | null
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.walletAddress = token.walletAddress as string | null
      }
      return session
    },
  },
}
