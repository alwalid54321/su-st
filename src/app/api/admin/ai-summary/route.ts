import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
    const session = await auth();

    if (!session || !((session.user as any)?.isStaff || (session.user as any)?.isSuperuser)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Fetch current market data to provide context to Gemini
        const marketData = await prisma.marketData.findMany({
            where: { isCurrent: true },
            select: { name: true, portSudan: true, trend: true, forecast: true }
        });

        if (marketData.length === 0) {
            return NextResponse.json({ summary: "No market data available for analysis." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            As a professional commodities analyst for SudaStock (specializing in Sudanese products like Gum Arabic, Sesame, etc.):
            Analyze the following real-time market data:
            ${JSON.stringify(marketData)}
            
            Provide a concise, strategic 2-sentence summary of the market's current state and a one-word "Market Sentiment" (e.g. Bullish, Bearish, Volatile, Stable).
            Format the output strictly as JSON: {"summary": "...", "sentiment": "..."}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response (Gemini sometimes adds markdown blocks)
        const jsonMatch = text.match(/\{.*\}/s);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, sentiment: "Unknown" };

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('AI Summary Error:', error);
        return NextResponse.json({
            summary: "Unable to generate AI insights at this time. Market appears standard.",
            sentiment: "Unknown"
        });
    }
}
