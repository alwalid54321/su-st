import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
// It defaults to looking for the GEMINI_API_KEY environment variable.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const { text, locale } = await req.json();

        if (!text || !locale) {
            return NextResponse.json({ error: 'Text and locale are required' }, { status: 400 });
        }

        // If English, return as is (assuming base language is English)
        if (locale === 'en') {
            return NextResponse.json({ translatedText: text });
        }

        // 1. Check Database Cache First
        const cachedTranslation = await prisma.translation.findUnique({
            where: {
                key_locale: {
                    key: text,
                    locale: locale
                }
            }
        });

        if (cachedTranslation) {
            return NextResponse.json({ translatedText: cachedTranslation.value, source: 'cache' });
        }

        // 2. If missing, call Gemini 2.5 Flash
        if (!process.env.GEMINI_API_KEY) {
            // Fallback if no API key is set
            console.warn("GEMINI_API_KEY is not set. Falling back to original text.");
            return NextResponse.json({ translatedText: text, source: 'fallback' });
        }

        const prompt = `You are a professional financial translator for a Sudanese commodity market platform called SudaStock.
Translate the following short text or term from English to ${locale.toUpperCase()} (e.g., Arabic).
Do not provide any explanations, notes, or markdown formatting. Just output the translated text. Maintain professional financial terminology.
Text to translate: "${text}"`;

        const result = await model.generateContent(prompt);
        let translatedText = result.response.text().trim();

        // 3. Save to Database Cache
        if (translatedText) {
            await prisma.translation.create({
                data: {
                    key: text,
                    locale: locale,
                    value: translatedText
                }
            });
        }

        return NextResponse.json({ translatedText, source: 'gemini' });
    } catch (error) {
        console.error('Translation Error:', error);
        // Fallback to original text if something goes wrong so the app doesn't break
        return NextResponse.json({ error: 'Internal Server Error', translatedText: 'Error' }, { status: 500 });
    }
}
