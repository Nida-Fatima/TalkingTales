import OpenAI from 'openai';

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  error?: string;
}

// Cache to avoid repeated API calls for the same sentences
const translationCache = new Map<string, string>();

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Check if OpenRouter is configured
 */
export function isTranslationConfigured(): boolean {
  return !!import.meta.env.VITE_OPENROUTER_API_KEY;
}

/**
 * Translate text using OpenRouter AI (GPT-4 or Claude Haiku)
 */
export async function translateText(text: string, sourceLang: string = 'de', targetLang: string = 'en'): Promise<TranslationResult> {
  // Check if OpenRouter is configured
  if (!isTranslationConfigured()) {
    return {
      success: false,
      error: 'OpenRouter API key not configured'
    };
  }

  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return {
      success: true,
      translatedText: translationCache.get(cacheKey)!
    };
  }

  try {
    const languageNames = {
      'de': 'German',
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian'
    };

    const sourceLanguage = languageNames[sourceLang as keyof typeof languageNames] || sourceLang;
    const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;

    const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}. Provide only the translation, no explanations or additional text:

"${text}"`;

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3-haiku", // Fast and cost-effective
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate text accurately from ${sourceLanguage} to ${targetLanguage}. Respond with only the translation, no additional text or explanations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent translations
      max_tokens: 200
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation returned from AI');
    }

    // Remove quotes if the AI wrapped the translation in them
    const cleanTranslation = translatedText.replace(/^["']|["']$/g, '');

    // Cache the successful translation
    translationCache.set(cacheKey, cleanTranslation);
    
    return {
      success: true,
      translatedText: cleanTranslation
    };

  } catch (error) {
    console.error('AI translation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Translation failed';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API quota exceeded';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Fallback translation using word-by-word approach
 */
export function fallbackTranslation(words: Array<{ text: string; translation: string }>): string {
  return words.map(word => word.translation).join(' ');
}

/**
 * Clear the translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache size for debugging
 */
export function getTranslationCacheSize(): number {
  return translationCache.size;
}

/**
 * Batch translate multiple sentences (more efficient for multiple translations)
 */
export async function batchTranslateText(texts: string[], sourceLang: string = 'de', targetLang: string = 'en'): Promise<TranslationResult[]> {
  if (!isTranslationConfigured()) {
    return texts.map(() => ({
      success: false,
      error: 'OpenRouter API key not configured'
    }));
  }

  // Check cache for all texts first
  const results: TranslationResult[] = [];
  const textsToTranslate: { index: number; text: string }[] = [];

  texts.forEach((text, index) => {
    const cacheKey = `${sourceLang}-${targetLang}-${text}`;
    if (translationCache.has(cacheKey)) {
      results[index] = {
        success: true,
        translatedText: translationCache.get(cacheKey)!
      };
    } else {
      textsToTranslate.push({ index, text });
      results[index] = { success: false }; // Placeholder
    }
  });

  // If all texts are cached, return immediately
  if (textsToTranslate.length === 0) {
    return results;
  }

  try {
    const languageNames = {
      'de': 'German',
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian'
    };

    const sourceLanguage = languageNames[sourceLang as keyof typeof languageNames] || sourceLang;
    const targetLanguage = languageNames[targetLang as keyof typeof languageNames] || targetLang;

    // Create batch prompt
    const batchPrompt = textsToTranslate.map((item, i) => 
      `${i + 1}. "${item.text}"`
    ).join('\n');

    const prompt = `Translate the following ${sourceLanguage} sentences to ${targetLanguage}. Provide only the translations in the same numbered format, no explanations:

${batchPrompt}`;

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3-haiku",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate text accurately from ${sourceLanguage} to ${targetLanguage}. Respond with only the translations in numbered format, no additional text or explanations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('No translation returned from AI');
    }

    // Parse the numbered response
    const lines = response.split('\n').filter(line => line.trim());
    
    textsToTranslate.forEach((item, i) => {
      const line = lines[i];
      if (line) {
        // Extract translation from numbered format (e.g., "1. Translation text")
        const translation = line.replace(/^\d+\.\s*["']?|["']?$/g, '').trim();
        
        if (translation) {
          // Cache the translation
          const cacheKey = `${sourceLang}-${targetLang}-${item.text}`;
          translationCache.set(cacheKey, translation);
          
          results[item.index] = {
            success: true,
            translatedText: translation
          };
        } else {
          results[item.index] = {
            success: false,
            error: 'Failed to parse translation'
          };
        }
      } else {
        results[item.index] = {
          success: false,
          error: 'Translation not found in response'
        };
      }
    });

    return results;

  } catch (error) {
    console.error('Batch AI translation error:', error);
    
    // Fill remaining results with error
    textsToTranslate.forEach(item => {
      results[item.index] = {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed'
      };
    });

    return results;
  }
}