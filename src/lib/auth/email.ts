import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WTX <support@wtxonline.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: white; }
        .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #1A1A1A; border-radius: 12px; padding: 32px; border: 1px solid #23262F; }
        .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #fff; }
        .footer { margin-top: 24px; font-size: 14px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px; color: white;">Verify your email</h2>
          <p style="color: #888; margin-bottom: 24px;">Enter this code to complete your sign-up:</p>
          <div class="otp">${otp}</div>
          <p style="color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Your verification code',
    html,
  })
}

/**
 * Send password reset OTP email
 */
export async function sendPasswordResetOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: white; }
        .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #1A1A1A; border-radius: 12px; padding: 32px; border: 1px solid #23262F; }
        .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #fff; }
        .footer { margin-top: 24px; font-size: 14px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px; color: white;">Reset your password</h2>
          <p style="color: #888; margin-bottom: 24px;">Enter this code to reset your password:</p>
          <div class="otp">${otp}</div>
          <p style="color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset your AnalytiOS password',
    html,
  })
}

/**
 * Send password reset email (legacy - with link)
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: white; }
        .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #1A1A1A; border-radius: 12px; padding: 32px; border: 1px solid #23262F; }
        .button { display: inline-block; background: white; color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
        .footer { margin-top: 24px; font-size: 14px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px; color: white;">Reset your password</h2>
          <p style="color: #888; margin-bottom: 24px;">Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 14px; margin-top: 24px;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 12px; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset your AnalytiOS password',
    html,
  })
}

/**
 * Send welcome email after successful sign-up
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: white; }
        .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #1A1A1A; border-radius: 12px; padding: 32px; border: 1px solid #23262F; }
        .button { display: inline-block; background: white; color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
        .footer { margin-top: 24px; font-size: 14px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px; color: white;">Welcome to AnalytiOS, ${firstName}!</h2>
          <p style="color: #888; margin-bottom: 24px;">Your account has been created successfully.</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>Start exploring crypto analytics today!</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to AnalytiOS!',
    html,
  })
}

/**
 * Send password change confirmation email
 */
export async function sendPasswordChangeConfirmation(email: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: white; }
        .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #1A1A1A; border-radius: 12px; padding: 32px; border: 1px solid #23262F; }
        .footer { margin-top: 24px; font-size: 14px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px; color: white;">Password changed</h2>
          <p style="color: #888;">Your password has been changed successfully.</p>
          <p style="color: #666; font-size: 14px; margin-top: 16px;">If you didn't make this change, please contact support immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Your AnalytiOS password has been changed',
    html,
  })
}
