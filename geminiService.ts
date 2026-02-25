import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIReflection, ImageAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReflection = async (quoteText: string, userMood?: string, deepThink: boolean = false): Promise<AIReflection> => {
  const ai = getAI();
  const model = deepThink ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  
  const prompt = `
    Dada a frase inspiradora: "${quoteText}"
    ${userMood ? `O usuário está se sentindo: ${userMood}` : ''}
    
    Por favor, forneça uma reflexão profunda e um conselho prático baseado nesta mensagem.
    A resposta deve ser em Português.
  `;

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        originalQuote: { type: Type.STRING },
        reflection: { type: Type.STRING },
        advice: { type: Type.STRING }
      },
      required: ["originalQuote", "reflection", "advice"]
    }
  };

  try {
    const response = await ai.models.generateContent({ model, contents: prompt, config });
    return JSON.parse(response.text);
  } catch (error) {
    return {
      originalQuote: quoteText,
      reflection: "A força reside na persistência silenciosa da alma.",
      advice: "Tente respirar fundo e focar no que você pode controlar hoje."
    };
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<ImageAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analise esta imagem e forneça uma interpretação espiritual, uma frase de impacto e um conselho. Responda em JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          suggestedQuote: { type: Type.STRING },
          spiritualAdvice: { type: Type.STRING }
        },
        required: ["description", "suggestedQuote", "spiritualAdvice"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}