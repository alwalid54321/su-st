import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationQueue } from '@/lib/TranslationQueue';

export function useDynamicTranslation(text: string | null | undefined) {
    const { language } = useLanguage();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchTranslation() {
            if (!text) {
                if (isMounted) setTranslatedText('');
                return;
            }

            if (language === 'en') {
                if (isMounted) setTranslatedText(text);
                return;
            }

            // Immediately check the queue's memory cache synchronously
            const cacheKey = `${text}_${language}`;
            if (TranslationQueue.memoryCache[cacheKey]) {
                if (isMounted) setTranslatedText(TranslationQueue.memoryCache[cacheKey]);
                return;
            }

            if (isMounted) setLoading(true);
            try {
                // This routes through the smart batch queue
                const result = await TranslationQueue.enqueueTranslation(text, language);
                if (isMounted) setTranslatedText(result);
            } catch (error) {
                console.error("Failed to enqueue translation:", error);
                if (isMounted) setTranslatedText(text);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchTranslation();

        return () => {
            isMounted = false;
        };
    }, [text, language]);

    return { translatedText, loading };
}
