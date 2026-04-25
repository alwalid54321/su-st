
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
})

// Generic send email function
export async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  // Development fallback
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD
  if (!process.env.SMTP_USER || !pass) {
    console.log('====================================================')
    console.log('📧 EMAIL MOCK (SMTP not configured)')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Reply-To: ${replyTo || 'N/A'}`)
    console.log('--- HTML Content ---')
    console.log(html)
    console.log('====================================================')
    return
  }

  try {
    await transporter.verify()
  } catch (error) {
    console.error('SMTP Connection Error:', error)
    throw new Error('Failed to connect to email server')
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SudaStock" <noreply@sudastock.com>',
      to,
      replyTo,
      subject,
      html,
    })
    console.log(`Email sent to ${to} with subject: "${subject}"`)
  } catch (error) {
    console.error('Send Mail Error:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendVerificationEmail(email: string, otp: string) {
  const goldColor = '#786D3C'
  const textColor = '#1B1464'
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
          .header { background-color: ${textColor}; padding: 40px 20px; text-align: center; }
          .content { padding: 40px; color: #333; line-height: 1.6; }
          .otp-box { background-color: #f8f9fa; border: 2px dashed ${goldColor}; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: ${textColor}; margin: 0; }
          .footer { background-color: #fdfdfd; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
          .button { display: inline-block; padding: 12px 30px; background-color: ${goldColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .logo-text { color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">SUDASTOCK</h1>
          </div>
          <div class="content">
            <h2 style="color: ${textColor}; margin-top: 0;">Verify Your Identity</h2>
            <p>Hello,</p>
            <p>To complete your secure sign-in to SudaStock, please use the following verification code. This code will expire in <strong>15 minutes</strong>.</p>
            <div class="otp-box">
              <p style="margin-bottom: 10px; font-size: 14px; text-transform: uppercase; color: #666; font-weight: 600;">Your Verification Code</p>
              <h3 class="otp-code">${otp}</h3>
            </div>
            <p>If you did not request this code, your account security may be at risk. Please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The SudaStock Security Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SudaStock Global. All rights reserved.</p>
            <p>This is an automated security notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({ to: email, subject: 'Verify your SudaStock account', html })
}
