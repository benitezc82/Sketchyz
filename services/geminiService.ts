import { GoogleGenAI, Type } from "@google/genai";
import { AI_BRAIN_SYSTEM_INSTRUCTION } from "../constants";
import { BrainMode, BrainContext, BrainResponse } from "../types";

// Helper to remove base64 prefix
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

/**
 * 1. Identify the subject of the drawing using Gemini 3 Vision.
 */
// Helper to get API key using Vite's import.meta.env
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

// Helper: Check if we have a key
export const hasGeminiKey = (): boolean => {
  return !!getApiKey();
};

/**
 * 1. Identify the subject of the drawing using Gemini 3 Vision.
 */
export const identifySubject = async (imageBase64: string): Promise<string> => {
  // Always create a new instance right before use to ensure we use the latest key
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(imageBase64),
              mimeType: getMimeType(imageBase64),
            },
          },
          {
            text: "Identify the main subject of this child's drawing. Answer in 2-4 simple words (e.g., 'happy dragon', 'racecar'). Do NOT include 'a', 'an', or 'the'. Do not add punctuation."
          },
        ],
      },
    });

    return response.text?.trim() || "a masterpiece";
  } catch (error) {
    console.error("Error identifying subject:", error);
    return "a creative drawing";
  }
};

/**
 * 2. Consult the 'AI Brain' (Gemini 3) to get prompts or messages.
 */
export const getBrainResponse = async (
  mode: BrainMode,
  styleId: string | null,
  subject: string,
  context: BrainContext
): Promise<BrainResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    const inputPayload = JSON.stringify({
      mode,
      style_id: styleId || "unknown",
      drawing_subject: subject,
      context
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Gemini 3 Tech Preview
      config: {
        systemInstruction: AI_BRAIN_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style_prompt: { type: Type.STRING },
            kid_message: { type: Type.STRING },
          }
        }
      },
      contents: inputPayload,
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as BrainResponse;
  } catch (error) {
    console.error("Error asking AI Brain:", error);
    if (mode === 'kid_message') {
      return { kid_message: "Wow! You made something amazing!" };
    }
    return { style_prompt: `A ${styleId} style version of ${subject}, appropriate for kids.` };
  }
};

/**
 * 3. Generate the styled image using Nano Banana Pro (Gemini 3 Pro Image).
 */
export const generateStyledImage = async (
  originalImageBase64: string,
  stylePrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    /*
       Configuration for Nano Banana Pro (Gemini 3 Pro Image)
       Model ID: gemini-3-pro-image-preview
    */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(originalImageBase64),
              mimeType: getMimeType(originalImageBase64),
            },
          },
          {
            text: "RENDER STYLE: " + stylePrompt + "\n\nINPUT IMAGE REFERENCE: Use the attached image ONLY for composition and pose. \n\nIMPORTANT: IGNORE the photorealism, texture, and lighting of the input image. You MUST completely re-render the subject in the requested style. If the style is cartoon/3D/drawing, the output must NOT look like a photo."
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" // Nano Banana Pro supports native 4K, but we request 1K for speed/stability in preview
        }
      }
    });

    console.log("📸 API RESPONSE:", response); // Log the full object

    // Check candidates
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned");

    for (const part of candidate.content?.parts || []) {
      // Check for image
      if (part.inlineData && part.inlineData.data) {
        console.log("🎉 Image found!");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      // Check for refusal/text
      if (part.text) {
        console.warn("⚠️ Model returned text instead of image:", part.text);
      }
    }

    throw new Error("Model returned text/data but NO image. Check console for '⚠️ Model returned text'.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * 4. "Smart Face Fix" - Uses Dual Image Input (Style Ref + Identity Ref)
 */
export const fixFaceInImage = async (
  styledImageBase64: string,
  originalImageBase64: string,
  styleContext: string = "photorealistic" // Default fallback
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          // Image 1: The target styled body (Structure Reference)
          {
            inlineData: {
              data: cleanBase64(styledImageBase64),
              mimeType: getMimeType(styledImageBase64),
            },
          },
          // Image 2: The original face (Identity Reference)
          {
            inlineData: {
              data: cleanBase64(originalImageBase64),
              mimeType: getMimeType(originalImageBase64),
            },
          },
          // Instructions
          {
            text: "CRITICAL OBJECTIVE: High-Fidelity Identity Transfer (Face Swap) in specific art style.\n" +
              "Source 1: A " + styleContext + " artwork (Target Body/Composition).\n" +
              "Source 2: A photo of a person (Source Identity/Face).\n\n" +
              "Instructions:\n" +
              "1. REPLACE the face in Source 1 with the precise identity from Source 2.\n" +
              "2. TARGET STYLE: The new face MUST be rendered in the style of '" + styleContext + "'. match the texture, lighting, and shading of Source 1 perfectly.\n" +
              "3. PRESERVE STRICT IDENTITY: The facial features (eyes, nose, mouth structure) must represent the person in Source 2.\n" +
              "4. SEAMLESS COMPOSITION: Keep the exact head angle, lighting direction, and neck connection of Source 1.\n" +
              "5. IGNORE the photo-realism of Source 2 if the target style is not realistic. Adapt the identity to the style."
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    console.log("📸 FACE FIX RESPONSE:", response);

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned");

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Model returned no image for Face Fix.");
  } catch (error) {
    console.error("Error fixing face:", error);
    throw error;
  }
};