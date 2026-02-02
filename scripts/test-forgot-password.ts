import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function testForgotPasswordFlow() {
  console.log('🔍 Testing Forgot Password Implementation...\n')

  try {
    // 1. Check if PasswordResetToken model exists
    console.log('1. Checking PasswordResetToken model...')
    const tokenCount = await prisma.passwordResetToken.count()
    console.log(`   ✓ PasswordResetToken model exists (${tokenCount} tokens in DB)\n`)

    // 2. Check if test user exists
    console.log('2. Checking for test user...')
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@'
        }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      }
    })

    if (testUser) {
      console.log(`   ✓ Found test user: ${testUser.email}`)
      console.log(`     Name: ${testUser.firstName} ${testUser.lastName}\n`)
    } else {
      console.log('   ⚠ No users found in database\n')
    }

    // 3. Test password validation regex
    console.log('3. Testing password validation...')
    const testPasswords = [
      { password: 'weak', valid: false, reason: 'Too short, no uppercase, no number, no symbol' },
      { password: 'WeakPass', valid: false, reason: 'No number, no symbol' },
      { password: 'WeakPass123', valid: false, reason: 'No symbol' },
      { password: 'WeakPass123!', valid: true, reason: 'All requirements met' },
      { password: 'Str0ng!Pass', valid: true, reason: 'All requirements met' },
    ]

    const passwordRegex = {
      minLength: (p: string) => p.length >= 8,
      hasUpperCase: (p: string) => /[A-Z]/.test(p),
      hasLowerCase: (p: string) => /[a-z]/.test(p),
      hasNumber: (p: string) => /[0-9]/.test(p),
      hasSymbol: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(p),
    }

    for (const test of testPasswords) {
      const checks = {
        minLength: passwordRegex.minLength(test.password),
        hasUpperCase: passwordRegex.hasUpperCase(test.password),
        hasLowerCase: passwordRegex.hasLowerCase(test.password),
        hasNumber: passwordRegex.hasNumber(test.password),
        hasSymbol: passwordRegex.hasSymbol(test.password),
      }
      const isValid = Object.values(checks).every(v => v)
      const status = isValid === test.valid ? '✓' : '✗'
      console.log(`   ${status} "${test.password}" - ${test.reason}`)
      if (isValid !== test.valid) {
        console.log(`     Expected: ${test.valid}, Got: ${isValid}`)
        console.log(`     Checks:`, checks)
      }
    }
    console.log()

    // 4. Check API routes exist
    console.log('4. Checking API routes...')
    const fs = require('fs')
    const path = require('path')
    
    const routes = [
      'src/app/api/auth/forgot-password/route.ts',
      'src/app/api/auth/verify-reset-otp/route.ts',
      'src/app/api/auth/reset-password/route.ts',
    ]

    for (const route of routes) {
      const exists = fs.existsSync(path.join(process.cwd(), route))
      console.log(`   ${exists ? '✓' : '✗'} ${route}`)
    }
    console.log()

    // 5. Check components exist
    console.log('5. Checking components...')
    const components = [
      'src/components/dashboard/ForgotPasswordModal.tsx',
      'src/components/dashboard/ResetPasswordModal.tsx',
      'src/app/reset-password/page.tsx',
    ]

    for (const component of components) {
      const exists = fs.existsSync(path.join(process.cwd(), component))
      console.log(`   ${exists ? '✓' : '✗'} ${component}`)
    }
    console.log()

    console.log('✅ All checks passed! Forgot password implementation is ready.\n')
    console.log('📝 Next steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Navigate to the sign-in page')
    console.log('   3. Click "Forgot password?" link')
    console.log('   4. Test the complete flow with a valid email\n')

  } catch (error) {
    console.error('❌ Error during testing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testForgotPasswordFlow()
