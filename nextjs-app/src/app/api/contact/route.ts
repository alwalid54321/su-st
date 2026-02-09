
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/mail'

// Schema matches the frontend Yup schema
const contactSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    country: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().trim().min(1, 'Message is required'),
    // Honeypot field - should be empty
    _gotcha: z.string().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = contactSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { name, email, phone, company, country, subject, message, _gotcha } = result.data

        // 1. Honeypot Check
        // If _gotcha is filled, it's likely a bot. Silently reject or simulate success.
        if (_gotcha) {
            console.warn(`[BOT DETECTED] Contact form honeypot triggered by IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)
            // Return success to confuse the bot, but do NOT send email
            return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 })
        }

        // 2. Send Email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">New Contact Message</h2>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Country:</strong> ${country || 'N/A'}</p>
                <br />
                <p><strong>Message:</strong></p>
                <p style="background: #f9f9f9; padding: 15px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
            </div>
        `

        await sendEmail({
            to: process.env.SMTP_FROM || 'info@sudastock.com', // Send to admin
            replyTo: email,
            subject: `[Contact Form] ${subject} - ${name}`,
            html: emailContent
        })

        return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 })

    } catch (error) {
        console.error('Contact API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
