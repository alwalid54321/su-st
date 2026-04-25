type PromiseResolve = (value: string) => void;

interface QueueItem {
    text: string;
    resolve: PromiseResolve;
}

class TranslationQueueManager {
    private queue: Record<string, QueueItem[]> = {}; // Grouped by locale
    private timeoutId: NodeJS.Timeout | null = null;
    public memoryCache: Record<string, string> = {}; // Format: "text_locale" -> "translatedText"

    public async enqueueTranslation(text: string, locale: string): Promise<string> {
        // Return instantly if it's already in memory
        const cacheKey = `${text}_${locale}`;
        if (this.memoryCache[cacheKey]) {
            return this.memoryCache[cacheKey];
        }

        if (locale === 'en') {
            return text;
        }

        return new Promise<string>((resolve) => {
            if (!this.queue[locale]) {
                this.queue[locale] = [];
            }

            this.queue[locale].push({ text, resolve });

            // Set a debounce timeout to flush the queue
            if (!this.timeoutId) {
                this.timeoutId = setTimeout(() => this.flushQueue(), 50); // 50ms batching window
            }
        });
    }

    private async flushQueue() {
        const currentQueue = this.queue;
        this.queue = {};
        this.timeoutId = null;

        // Process each locale batch separately
        for (const [locale, items] of Object.entries(currentQueue)) {
            const uniqueTexts = Array.from(new Set(items.map(item => item.text)));
            
            if (uniqueTexts.length === 0) continue;

            try {
                const response = await fetch('/api/translate-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts: uniqueTexts, locale })
                });

                if (response.ok) {
                    const data = await response.json();
                    const translations: Record<string, string> = data.translations || {};

                    // Resolve promises and update cache
                    items.forEach(item => {
                        const translated = translations[item.text] || item.text;
                        this.memoryCache[`${item.text}_${locale}`] = translated;
                        item.resolve(translated);
                    });

                    // Fire-and-forget: Silently trigger background processing
                    // This tells the server to flush its PendingTranslation database safely
                    fetch('/api/process-translations').catch(err => {
                        console.error("Background translator trigger failed (safe to ignore):", err);
                    });
                } else {
                    // Fallback to original on failure
                    items.forEach(item => item.resolve(item.text));
                }
            } catch (error) {
                console.error("Batch Queue Execution Error:", error);
                // Fallback to original
                items.forEach(item => item.resolve(item.text));
            }
        }
    }
}

// Export a singleton instance
export const TranslationQueue = new TranslationQueueManager();
