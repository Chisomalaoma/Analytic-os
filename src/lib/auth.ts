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
          prompt: 'select_account', // Force account selection to avoid cache issues
          access_type: 'offline',
          response_type: 'code'
        },
      },
      profile(profile) {
        console.log('[GOOGLE-PROFILE] Raw profile data:', {
          sub: profile.sub,
          name: profile.name,
          email: profile.email,
          given_name: profile.given_name,
          family_name: profile.family_name,
          picture: profile.picture
        })
        
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Store firstName/lastName in the returned object for later use
          firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
          lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || 'User',
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
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          firstName: profile.first_name || profile.name?.split(' ')[0] || 'User',
          lastName: profile.last_name || profile.name?.split(' ').slice(1).join(' ') || 'User',
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'tweet.read users.read offline.access',
          prompt: 'consent',
        },
      },
      profile(profile) {
        console.log('🐦 [TWITTER-PROFILE] Raw profile data:', {
          id: profile.data?.id,
          name: profile.data?.name,
          username: profile.data?.username,
          profile_image_url: profile.data?.profile_image_url
        })
        
        const userData = {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email || `${profile.data.username}@twitter.placeholder`,
          image: profile.data.profile_image_url,
          firstName: profile.data.name?.split(' ')[0] || 'User',
          lastName: profile.data.name?.split(' ').slice(1).join(' ') || 'User',
        }
        
        console.log('✅ [TWITTER-PROFILE] Processed user data:', userData)
        return userData
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
      // Initial sign in - user object is available
      if (user) {
        console.log('[JWT] Initial sign in, user data:', {
          id: user.id,
          email: user.email,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName
        })
        
        token.id = user.id
        token.userId = (user as any).userId
        token.username = (user as any).username
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.phone = (user as any).phone
        token.walletAddress = (user as any).walletAddress
        token.role = (user as any).role
        // DON'T store image in JWT to prevent header size issues
        // token.image = (user as any).image
      }
      
      // For OAuth users on initial sign in, fetch fresh data from database after a short delay
      // This ensures PrismaAdapter and our signIn callback have completed
      if (user && account?.provider && (account.provider === 'google' || account.provider === 'facebook' || account.provider === 'twitter')) {
        try {
          // Wait for database operations to complete
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              userId: true,
              username: true,
              firstName: true,
              lastName: true,
              phone: true,
              walletAddress: true,
              role: true,
              image: true,
              email: true,
            }
          })
          
          if (dbUser) {
            console.log('[JWT] Fetched fresh OAuth user data:', {
              email: dbUser.email,
              firstName: dbUser.firstName,
              lastName: dbUser.lastName,
              username: dbUser.username
            })
            
            token.userId = dbUser.userId
            token.username = dbUser.username
            token.firstName = dbUser.firstName
            token.lastName = dbUser.lastName
            token.phone = dbUser.phone
            token.walletAddress = dbUser.walletAddress
            token.role = dbUser.role
            // DON'T store image in JWT
            // token.image = dbUser.image
          }
        } catch (error) {
          console.error('[JWT] Failed to fetch user data for OAuth:', error)
        }
      }
      
      // Handle session update trigger (when updateSession is called)
      if (trigger === 'update' && session) {
        token.username = session.user?.name || token.username
        token.firstName = session.user?.firstName || token.firstName
        token.lastName = session.user?.lastName || token.lastName
        token.phone = session.user?.phone || token.phone
        // DON'T store image in JWT
        // token.image = session.user?.image || token.image
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
        // Fetch image from database instead of storing in JWT
        if (token.id) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { image: true }
            })
            session.user.image = user?.image || null
          } catch (error) {
            console.error('[SESSION] Failed to fetch user image:', error)
            session.user.image = null
          }
        }
        session.user.role = token.role as string | null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'twitter') {
        try {
          console.log('[OAUTH-SIGNIN] Starting OAuth sign-in for:', user.email, 'Provider:', account.provider)
          
          // Twitter-specific confirmation
          if (account?.provider === 'twitter') {
            console.log('🎉 [TWITTER-SIGNIN] Twitter OAuth authentication successful!')
            console.log('✅ [TWITTER-SIGNIN] User authenticated:', {
              name: user.name,
              email: user.email,
              provider: account.provider
            })
          }
          
          // Extract first and last name from profile FIRST (most reliable source)
          let firstName = 'User'
          let lastName = 'User'
          
          if (profile) {
            console.log('[OAUTH-SIGNIN] Profile data available:', {
              given_name: (profile as any).given_name,
              family_name: (profile as any).family_name,
              first_name: (profile as any).first_name,
              last_name: (profile as any).last_name,
              name: (profile as any).name
            })
            
            // Google uses given_name and family_name
            firstName = (profile as any).given_name || (profile as any).first_name || firstName
            lastName = (profile as any).family_name || (profile as any).last_name || lastName
          }
          
          // Fallback to parsing user.name if profile didn't provide names
          if ((firstName === 'User' || lastName === 'User') && user.name) {
            const nameParts = user.name.trim().split(' ')
            if (nameParts.length > 0) {
              firstName = nameParts[0] || 'User'
              lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName
            }
          }
          
          console.log('[OAUTH-SIGNIN] Extracted names:', { firstName, lastName })
          
          // Wait for PrismaAdapter to create/update the user
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Check if user exists in database
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { wallet: true, accounts: true }
          })

          // If user doesn't exist yet, wait a bit more and try again
          if (!existingUser) {
            console.log('[OAUTH-SIGNIN] User not found, waiting for PrismaAdapter...')
            await new Promise(resolve => setTimeout(resolve, 500))
            existingUser = await prisma.user.findUnique({
              where: { email: user.email! },
              include: { wallet: true, accounts: true }
            })
          }

          if (!existingUser) {
            console.log('[OAUTH-SIGNIN] User still not found, will be created by adapter')
            return true
          }

          console.log('[OAUTH-SIGNIN] Found user:', {
            email: existingUser.email,
            hasWallet: !!existingUser.wallet,
            hasUserId: !!existingUser.userId,
            hasUsername: !!existingUser.username,
            currentFirstName: existingUser.firstName,
            currentLastName: existingUser.lastName
          })

          // ALWAYS update firstName and lastName from OAuth profile to ensure fresh data
          // This fixes the caching issue where old names persist
          const username = user.email?.split('@')[0] || `user_${Date.now()}`
          const uniqueUsername = existingUser.username || `${username}_${Math.random().toString(36).substring(2, 6)}`

          const updateData: any = {
            userId: existingUser.userId || generateUserId(),
            username: uniqueUsername,
            firstName: firstName, // Always update from OAuth profile
            lastName: lastName,   // Always update from OAuth profile
            image: user.image || existingUser.image,
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: updateData
          })
          
          console.log('[OAUTH-SIGNIN] Updated user with OAuth data:', {
            email: user.email,
            firstName,
            lastName,
            username: uniqueUsername
          })

          // If user exists but has no wallet, create one
          if (!existingUser.wallet) {
            console.log('[OAUTH-SIGNIN] Creating wallet for OAuth user:', existingUser.email)
            const { createWalletWithRetry } = await import('@/lib/wallet-service')
            const walletResult = await createWalletWithRetry({
              userId: existingUser.id,
              email: existingUser.email,
              firstName: firstName,
              lastName: lastName,
              maxRetries: 3
            })
            
            if (walletResult.success) {
              console.log('[OAUTH-SIGNIN] Wallet created successfully')
            } else {
              console.error('[OAUTH-SIGNIN] Failed to create wallet:', walletResult.error)
            }
          }
        } catch (error) {
          console.error('[OAUTH-SIGNIN] Error in signIn callback:', error)
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
      // Note: This runs BEFORE the signIn callback
      if (user.id) {
        try {
          console.log('[OAUTH-CREATE-EVENT] New user created by PrismaAdapter:', {
            id: user.id,
            email: user.email,
            name: user.name
          })
          
          // The signIn callback will handle the full user setup
          // This event is just for logging and initial setup if needed
        } catch (error) {
          console.error('[OAUTH-CREATE-EVENT] Error in createUser event:', error)
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
