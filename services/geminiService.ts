import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text-to-Speech (TTS) Logic ---

/**
 * Decodes base64 string to Uint8Array
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer
 */
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

/**
 * Generates speech from text using Gemini
 */
export async function generateSpeech(text: string, audioContext: AudioContext): Promise<AudioBuffer> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually good for clarity, or 'Fenrir' for deeper tone
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    const audioBytes = decode(base64Audio);
    
    // Gemini TTS typically returns 24kHz PCM
    const audioBuffer = await decodeAudioData(
      audioBytes,
      audioContext,
      24000,
      1,
    );

    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}

// --- Text Generation (Q&A) Logic ---

export async function askGemini(question: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a helpful assistant for an elderly education course about AI. 
            Keep your answers short, encouraging, simple, and in Traditional Chinese (Taiwan).
            The user asks: ${question}`,
        });
        return response.text || "抱歉，我現在無法回答，請稍後再試。";
    } catch (error) {
        console.error("Error asking Gemini:", error);
        return "發生錯誤，請檢查網路連線。";
    }
}