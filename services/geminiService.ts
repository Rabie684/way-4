import { GoogleGenAI } from "@google/genai";
import { API_KEY } from '../constants';
import { Language } from '../types';

// Manual base64 encode/decode functions as per Gemini guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Function to simulate audio decoding (not used in this app, but good for completeness for TTS)
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  translateSummary: async (summary: string, targetLanguage: Language): Promise<string> => {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Gemini API key is not configured. Translation will not work.");
      return `[Jarvis Disabled: Please set API_KEY] Original: ${summary}`;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // System instruction to guide the AI, simulating knowledge of Algerian scientific journals
    // IMPORTANT: Actual grounding to "Algerian scientific journals only" is beyond the scope
    // of a frontend-only application using the Gemini API directly without a specific
    // backend RAG (Retrieval-Augmented Generation) system integrated with such a database.
    // This instruction is a simulation for the model's persona.
    const systemInstruction = `أنت مساعد ذكاء اصطناعي متخصص اسمه "جارفس". مهمتك هي ترجمة ملخصات الأوراق العلمية بدقة متناهية، مع الحفاظ على الأسلوب الأكاديمي واستخدام المصطلحات المناسبة للسياقات العلمية، مستقاة من المجلات العلمية الجزائرية فقط. يجب عليك دائماً ترجمة الملخص المقدم إلى اللغة المستهدفة.`;

    const languageMap = {
      [Language.AR]: 'العربية',
      [Language.EN]: 'الإنجليزية',
      [Language.FR]: 'الفرنسية',
    };

    const prompt = `أيها جارفس، يرجى ترجمة الملخص العلمي التالي إلى ${languageMap[targetLanguage]}:
    
    "${summary}"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Suitable for text tasks
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Keep translation more factual
          topP: 0.9,
          topK: 40,
        },
      });

      const translatedText = response.text;
      if (translatedText) {
        return translatedText;
      } else {
        return `فشل جارفس في ترجمة الملخص. الأصل: ${summary}`;
      }
    } catch (error) {
      console.error("خطأ في ترجمة الملخص بواسطة جارفس:", error);
      // Implement robust error handling, e.g., exponential backoff for retries
      return `حدث خطأ أثناء ترجمة الملخص بواسطة جارفس: ${error instanceof Error ? error.message : String(error)}. الأصل: ${summary}`;
    }
  },
};