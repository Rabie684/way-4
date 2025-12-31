import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { API_KEY } from '../constants';
import { Language, ProfileSettings } from '../types';

export const geminiService = {
  getJarvisResponse: async (
    userPrompt: string,
    targetLanguage: Language, // User's preferred display language
    currentSettings: ProfileSettings, // Pass profile settings to determine model response language
  ): Promise<{ text: string; audioBase64?: string; sources: string[] }> => {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Gemini API key is not configured. Jarvis will be limited.");
      return { text: `[Jarvis Disabled: Please set API_KEY]`, sources: [] };
    }

    // Determine the desired output language for Jarvis's text response
    const outputLangMap = {
      [Language.AR]: 'العربية',
      [Language.EN]: 'الإنجليزية',
      [Language.FR]: 'الفرنسية',
    };
    const desiredOutputLanguage = outputLangMap[currentSettings.language];


    // System instruction for Jarvis persona and search priority
    const systemInstruction = `
      أنت مساعد ذكاء اصطناعي متخصص اسمه "جارفس" لمساعدة طلاب وأساتذة "جامعتك الرقمية way".
      مهمتك هي:
      1. التحدث بطلاقة وود مع المستخدمين.
      2. تقديم مصادر موثوقة للبحوث العلمية.
      3. البحث في المصادر الأكاديمية العلمية في الجزائر بدرجة أولى، ثم العالمية.
      4. كن ودودًا، متعاونًا، ومفصلاً في إجاباتك.
      5. إذا قمت بالبحث (عبر استخدام الأداة المتوفرة)، اذكر المصادر (URLs) بوضوح بعد إجابتك، مع الإشارة إن كانت من مصادر جزائرية أكاديمية.
      6. يجب أن تكون جميع ردودك باللغة ${desiredOutputLanguage} ما لم يطلب المستخدم لغة أخرى صراحة لسؤال محدد.
    `;

    // Check if the prompt suggests a research query to enable googleSearch tool
    const isResearchQuery = /بحث|مصدر|معلومات عن|دراسة عن|ماهو|من هو|ما هي|ابحث لي عن|أريد معرفة/i.test(userPrompt);

    const modelConfig: any = { // Use 'any' for now to allow `tools` config
      systemInstruction: systemInstruction,
      temperature: 0.7, // More creative and conversational
      topP: 0.95,
      topK: 64,
      responseMimeType: "text/plain", // Default to text
    };

    const tools = [];

    if (isResearchQuery) {
      tools.push({ googleSearch: {} });
      // If a research query, enable googleSearch tool
      modelConfig.tools = tools;
    }

    let textResponse = '';
    let audioBase64: string | undefined;
    let sources: string[] = [];

    try {
      // Step 1: Get the conversational text response with potential grounding
      const textAi = new GoogleGenAI({ apiKey: API_KEY });
      const textResponseObj: GenerateContentResponse = await textAi.models.generateContent({
        model: "gemini-3-pro-preview", // Using gemini-3-pro-preview for better reasoning and research
        contents: userPrompt,
        config: modelConfig,
      });

      textResponse = textResponseObj.text || 'لم أتمكن من توليد رد نصي.';

      // Extract sources if available
      if (textResponseObj.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        sources = textResponseObj.candidates[0].groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web?.uri) // Assuming web links, can be extended for maps etc.
          .filter(Boolean); // Filter out null/undefined
      }

      // Step 2: Get the audio for the generated text response
      const audioAi = new GoogleGenAI({ apiKey: API_KEY });
      const audioResponse: GenerateContentResponse = await audioAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts", // Specific model for TTS
        contents: [{ parts: [{ text: textResponse }] }],
        config: {
          responseModalities: [Modality.AUDIO], // Request audio output
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, // A pleasant voice
          },
        },
      });

      audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      return { text: textResponse, audioBase64, sources };

    } catch (error) {
      console.error("خطأ في معالجة طلب جارفس:", error);
      // More detailed error message for better user experience
      return {
        text: `عذراً، حدث خطأ أثناء معالجة طلبك بواسطة جارفس. قد تكون المشكلة في الاتصال بالخدمة أو في مفتاح API. التفاصيل: ${error instanceof Error ? error.message : String(error)}.`,
        sources: [],
      };
    }
  },
};