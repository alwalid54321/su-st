import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // --- 1. RATE LIMITING PROTECTION ---
        const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
        // Allow max 30 translation batch requests per minute per IP
        const rateLimit = checkRateLimit(`translate_api_${ip}`, 30, 60 * 1000); 

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many translation requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { texts, locale } = await req.json();

        // --- 2. INPUT VALIDATION (DoS PROTECTION) ---
        if (!Array.isArray(texts) || texts.length === 0 || !locale) {
            return NextResponse.json({ error: 'Array of texts and locale are required' }, { status: 400 });
        }

        if (texts.length > 50) {
            return NextResponse.json({ error: 'Maximum 50 texts per batch allowed' }, { status: 400 });
        }

        // Filter out absurdly long strings and non-strings to protect database storage
        const validTexts = texts.filter(text => 
            typeof text === 'string' && text.length > 0 && text.length <= 150
        );

        if (validTexts.length === 0) {
            // All texts were invalid, just return them as-is
            const fallback: Record<string, string> = {};
            texts.forEach(t => { if (typeof t === 'string') fallback[t] = t; });
            return NextResponse.json({ translations: fallback });
        }

        if (!Array.isArray(texts) || texts.length === 0 || !locale) {
            return NextResponse.json({ error: 'Array of texts and locale are required' }, { status: 400 });
        }

        // 3. Return English immediately for 'en'
        if (locale === 'en') {
            const resultRecord: Record<string, string> = {};
            validTexts.forEach(t => resultRecord[t] = t);
            return NextResponse.json({ translations: resultRecord });
        }

        // Remove duplicates
        const uniqueTexts = Array.from(new Set(validTexts));
        const finalTranslations: Record<string, string> = {};

        // 4. Query Prisma for existing cache
        const existingTranslations = await prisma.translation.findMany({
            where: {
                locale: locale,
                key: { in: uniqueTexts as string[] }
            }
        });

        const missingTexts: string[] = [];

        // Map existing translations and identify missing ones
        uniqueTexts.forEach(text => {
            const found = existingTranslations.find((t: any) => t.key === text);
            if (found) {
                finalTranslations[text as string] = found.value;
            } else {
                missingTexts.push(text as string);
                // Return English fallback immediately so UI isn't blocked
                finalTranslations[text as string] = text as string;
            }
        });

        // 5. Fire and Forget: Queue missing texts into Database without blocking
        if (missingTexts.length > 0) {
            const pendingData = missingTexts.map(text => ({
                key: text,
                locale: locale
            }));

            // Save to pending queue silently
            // Uses skipDuplicates: true so we don't crash on identical concurrent requests
            await prisma.pendingTranslation.createMany({
                data: pendingData,
                skipDuplicates: true 
            }).catch((err: any) => console.error("Error queueing pending translations:", err));
        }

        // Return immediately (Stale-While-Revalidate pattern)
        return NextResponse.json({ translations: finalTranslations });

    } catch (error) {
        console.error('Batch Translation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
