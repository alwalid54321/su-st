import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export async function GET() {
    try {
        // 1. Fetch up to 50 pending translations
        const pendingItems = await prisma.pendingTranslation.findMany({
            take: 50,
            orderBy: { createdAt: 'asc' }
        });

        if (pendingItems.length === 0) {
            return NextResponse.json({ message: 'No pending translations to process.' });
        }

        // 2. Group by locale to minimize Gemini calls
        const localeGroups: Record<string, string[]> = {};
        const pendingIdsToDelete: number[] = [];

        for (const item of pendingItems) {
            if (!localeGroups[item.locale]) {
                localeGroups[item.locale] = [];
            }
            if (!localeGroups[item.locale].includes(item.key)) {
                localeGroups[item.locale].push(item.key);
            }
            pendingIdsToDelete.push(item.id);
        }

        const dataToSave: { key: string; locale: string; value: string }[] = [];

        // 3. Process each locale group with Gemini
        for (const locale of Object.keys(localeGroups)) {
            const textsToTranslate = localeGroups[locale];

            if (!process.env.GEMINI_API_KEY) {
                console.warn(`[Process-Tr] No GEMINI_API_KEY. Skipping ${textsToTranslate.length} texts for ${locale}`);
                continue;
            }

            const prompt = `You are a professional financial translator for a Sudanese commodity platform. 
Translate the following array of English strings to ${locale.toUpperCase()} (e.g., Arabic). 
Return ONLY a raw JSON object where the keys are the exact English original strings, and the values are the translated strings. Do not include markdown formatting around the JSON.
Maintain professional and accurate financial terminology.

Strings to translate:
${JSON.stringify(textsToTranslate, null, 2)}`;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const llmTranslations: Record<string, string> = JSON.parse(responseText);

                for (const originalText of textsToTranslate) {
                    const translatedText = llmTranslations[originalText];
                    if (translatedText && typeof translatedText === 'string') {
                        dataToSave.push({
                            key: originalText,
                            locale: locale,
                            value: translatedText
                        });
                    }
                }
            } catch (err: any) {
                console.error(`[Process-Tr] Failed to process Gemini response for ${locale}:`, err);
            }
        }

        // 4. Save the successful translations to the cached Translation table
        if (dataToSave.length > 0) {
            await prisma.translation.createMany({
                data: dataToSave,
                skipDuplicates: true
            });
        }

        // 5. Delete the processed items from the pending queue
        await prisma.pendingTranslation.deleteMany({
            where: {
                id: { in: pendingIdsToDelete }
            }
        });

        return NextResponse.json({
            message: 'Processed translations successfully',
            processedCount: dataToSave.length
        });

    } catch (error) {
        console.error('[Process-Tr] Fatal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
