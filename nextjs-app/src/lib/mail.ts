
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Generic send email function
export async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  // Development fallback
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
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
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">Welcome to SudaStock</h1>
          </div>
          <p>Hello,</p>
          <p>Thank you for registering. Please use the following code to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0070f3;">${otp}</span>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; ${new Date().getFullYear()} SudaStock. All rights reserved.</p>
        </div>
      `

  await sendEmail({ to: email, subject: 'Verify your SudaStock account', html })
}
