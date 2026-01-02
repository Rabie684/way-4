import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { API_KEY } from '../constants';
import { Language, ProfileSettings } from '../types';

export const geminiService = {
  getJarvisResponse: async (
    userPrompt: string,
    targetLanguage: Language, // User's preferred display language
    currentSettings: ProfileSettings, // Pass profile settings to determine model response language
  ): Promise<{ text: string; audioBase64?: string; sources: string[] }> => {
    // Define the user-friendly fallback message
    const friendlyFallbackMessage = "رانا نخدمو باش يكون Way أحسن مكان أكاديمي ليك، شكراً على صبرك معايا. تقدر تتصفح قنوات الأساتذة والدروس حالياً، ريثما يكتمل نظام الدردشة الذكي.";

    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn("Gemini API key is not configured. Jarvis will return a friendly fallback message.");
      return { text: friendlyFallbackMessage, sources: [] };
    }

    // Determine the desired output language for Jarvis's text response
    const outputLangMap = {
      [Language.AR]: 'العربية',
      [Language.EN]: 'الإنجليزية',
      [Language.FR]: 'الفرنسية',
    };
    const desiredOutputLanguage = outputLangMap[currentSettings.language];


    // System instruction for Jarvis persona, search priority, and enhanced interaction
    const systemInstruction = `
      أنت مساعد ذكاء اصطناعي متخصص ومستشار أكاديمي خبير، اسمك "جارفس". تعمل كجزء من منصة "جامعتك الرقمية way" الرائدة في الجزائر.
      مهمتك الأساسية هي دعم طلاب وأساتذة الجامعات الجزائرية. تفاعل معهم بود واحترافية عالية، وكن دائمًا جاهزًا للمساعدة.
      في ردودك، يجب عليك:
      1.  التحدث بطلاقة، وود، واحترام، مستخدمًا لغة عربية فصحى أو اللغة المطلوبة.
      2.  تقديم مصادر موثوقة ومحددة للبحوث العلمية والأكاديمية.
      3.  عند البحث عن معلومات (باستخدام الأداة المتوفرة)، أعطِ الأولوية القصوى للمصادر الأكاديمية والعلمية المتوفرة في الجزائر (مثل المنصة الجزائرية للمجلات العلمية ASJP، المجلات الجامعية الجزائرية، بوابات البحث الجزائرية، رسائل الدكتوراه والماجستير الجزائرية)، ثم المصادر العالمية الموثوقة.
      4.  اذكر المصادر (URLs) بوضوح ودقة بعد إجابتك، مع الإشارة إن أمكن إلى طبيعة المصدر (مثلاً: "من مجلة علمية جزائرية" أو "من جامعة كذا").
      5.  يجب أن تكون جميع ردودك باللغة ${desiredOutputLanguage} ما لم يطلب المستخدم لغة أخرى صراحة لسؤال محدد.
      6.  حافظ على لهجة متفائلة ومحفزة، وكن مفصلاً وشاملاً في إجاباتك كلما أمكن.
      7.  تشجع على التساؤلات والمناقشات الأكاديمية.
    `;

    // Check if the prompt suggests a research query to enable googleSearch tool
    const isResearchQuery = /بحث|مصدر|معلومات عن|دراسة عن|ماهو|من هو|ما هي|ابحث لي عن|أريد معرفة|ابحث عن|دلني على|أوضح لي|كيف|لماذا/i.test(userPrompt);

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
      // Return the friendly fallback message on API errors
      return {
        text: friendlyFallbackMessage,
        sources: [],
      };
    }
  },
};