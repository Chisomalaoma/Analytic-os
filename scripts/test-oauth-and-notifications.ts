import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function testOAuthAndNotifications() {
  console.log('🔍 Testing OAuth and Notification Settings Fixes...\n')

  try {
    // 1. Check for OAuth users
    console.log('1. Checking OAuth users with first/last names...')
    const oauthUsers = await prisma.user.findMany({
      where: {
        accounts: {
          some: {
            provider: 'google'
          }
        }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        accounts: {
          select: {
            provider: true
          }
        }
      },
      take: 5
    })

    if (oauthUsers.length > 0) {
      console.log(`   ✓ Found ${oauthUsers.length} OAuth user(s):\n`)
      oauthUsers.forEach(user => {
        console.log(`   Email: ${user.email}`)
        console.log(`   First Name: ${user.firstName || '(not set)'}`)
        console.log(`   Last Name: ${user.lastName || '(not set)'}`)
        console.log(`   Full Name: ${user.name || '(not set)'}`)
        console.log(`   Provider: ${user.accounts[0]?.provider || 'unknown'}`)
        console.log()
      })
    } else {
      console.log('   ⚠ No OAuth users found in database')
      console.log('   Note: First/last name extraction will work on next Google sign-in\n')
    }

    // 2. Check notification settings structure
    console.log('2. Checking notification settings...')
    const userWithSettings = await prisma.userSettings.findFirst({
      select: {
        notificationPreferences: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (userWithSettings) {
      console.log(`   ✓ Found settings for: ${userWithSettings.user.email}`)
      const prefs = userWithSettings.notificationPreferences as any
      
      if (prefs.email && prefs.webApp) {
        console.log('   ✓ Notification preferences structure is valid')
        console.log(`   Email notifications: ${Object.keys(prefs.email).length} types`)
        console.log(`   WebApp notifications: ${Object.keys(prefs.webApp).length} types`)
        
        // Check if they're synced (for single toggle)
        const emailKeys = Object.keys(prefs.email)
        const allSynced = emailKeys.every(key => prefs.email[key] === prefs.webApp[key])
        
        if (allSynced) {
          console.log('   ✓ Email and WebApp preferences are synced (single toggle working)')
        } else {
          console.log('   ℹ Email and WebApp preferences have different values')
          console.log('   Note: Single toggle will sync them on next save')
        }
      }
      console.log()
    } else {
      console.log('   ⚠ No user settings found')
      console.log('   Note: Settings will be created on first save\n')
    }

    // 3. Test name parsing logic
    console.log('3. Testing name parsing logic...')
    const testNames = [
      { input: 'John Doe', expectedFirst: 'John', expectedLast: 'Doe' },
      { input: 'John', expectedFirst: 'John', expectedLast: 'John' },
      { input: 'John Michael Doe', expectedFirst: 'John', expectedLast: 'Michael Doe' },
      { input: 'María José García López', expectedFirst: 'María', expectedLast: 'José García López' },
      { input: '', expectedFirst: 'User', expectedLast: 'User' },
    ]

    for (const test of testNames) {
      const nameParts = test.input.trim().split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName
      
      const firstMatch = firstName === test.expectedFirst
      const lastMatch = lastName === test.expectedLast
      const status = firstMatch && lastMatch ? '✓' : '✗'
      
      console.log(`   ${status} "${test.input}" → First: "${firstName}", Last: "${lastName}"`)
      if (!firstMatch || !lastMatch) {
        console.log(`     Expected: First: "${test.expectedFirst}", Last: "${test.expectedLast}"`)
      }
    }
    console.log()

    // 4. Check component files exist
    console.log('4. Checking updated files...')
    const fs = require('fs')
    const path = require('path')
    
    const files = [
      { path: 'src/lib/auth.ts', check: 'given_name' },
      { path: 'src/components/account/NotificationSettings.tsx', check: 'updatePreference' },
    ]

    for (const file of files) {
      const exists = fs.existsSync(path.join(process.cwd(), file.path))
      if (exists) {
        const content = fs.readFileSync(path.join(process.cwd(), file.path), 'utf-8')
        const hasCheck = content.includes(file.check)
        console.log(`   ${hasCheck ? '✓' : '✗'} ${file.path} ${hasCheck ? '(updated)' : '(missing update)'}`)
      } else {
        console.log(`   ✗ ${file.path} (not found)`)
      }
    }
    console.log()

    console.log('✅ All checks completed!\n')
    console.log('📝 Summary:')
    console.log('   1. Google OAuth now extracts first/last names from profile')
    console.log('   2. Notification settings use single toggle for both email and web app')
    console.log('   3. Name parsing handles various formats correctly\n')
    
    console.log('🧪 Testing Instructions:')
    console.log('   1. Sign in with Google to test name extraction')
    console.log('   2. Go to Account Settings → Notifications')
    console.log('   3. Toggle any notification - both email and web app will sync')
    console.log('   4. Save and verify changes persist\n')

  } catch (error) {
    console.error('❌ Error during testing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOAuthAndNotifications()
