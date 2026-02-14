
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/mail'

// Schema matches the frontend state in quote/page.tsx
const quoteSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    email: z.string().email('Invalid email address'),
    companyName: z.string().min(1, 'Company name is required'),
    country: z.string().min(1, 'Country is required'),
    product: z.string().min(1, 'Product is required'),
    productVariation: z.string().optional(),
    quantity: z.string().min(1, 'Quantity is required'),
    port: z.string().min(1, 'Port is required'),
    services: z.string().optional(),
    currency: z.string().optional(),
    specifications: z.string().optional(),
    note: z.string().optional(),
    // Honeypot field
    _gotcha: z.string().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = quoteSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const data = result.data

        // 1. Honeypot Check
        if (data._gotcha) {
            console.warn(`[BOT DETECTED] Quote form honeypot triggered by IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)
            return NextResponse.json({ message: 'Request submitted successfully' }, { status: 200 })
        }

        // 2. Send Email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #1B1464;">New Quote Request</h2>
                <hr />
                <h3 style="color: #786D3C;">Client Details</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Company:</strong> ${data.companyName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.contactNumber}</p>
                <p><strong>Country:</strong> ${data.country}</p>
                
                <h3 style="color: #786D3C;">Request Details</h3>
                <p><strong>Product:</strong> ${data.product}</p>
                ${data.productVariation ? `<p><strong>Variation:</strong> ${data.productVariation}</p>` : ''}
                <p><strong>Quantity:</strong> ${data.quantity} Tons</p>
                <p><strong>Port:</strong> ${data.port}</p>
                ${data.services ? `<p><strong>Add-on Services:</strong> ${data.services}</p>` : ''}
                ${data.currency ? `<p><strong>Preferred Currency:</strong> ${data.currency}</p>` : ''}
                
                ${data.specifications ? `<p><strong>Specifications:</strong><br>${data.specifications}</p>` : ''}
                ${data.note ? `<p><strong>Additional Notes:</strong><br>${data.note}</p>` : ''}
            </div>
        `

        await sendEmail({
            to: process.env.SMTP_FROM || 'sales@sudastock.com', // Send to sales
            replyTo: data.email,
            subject: `[Quote Request] ${data.companyName} - ${data.product}`,
            html: emailContent
        })

        return NextResponse.json({ message: 'Request submitted successfully' }, { status: 200 })

    } catch (error) {
        console.error('Quote API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
