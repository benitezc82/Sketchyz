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
            loading_message: { type: Type.STRING },
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
  stylePrompt: string,
  styleId?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Conditional System Instruction based on style
  let systemConstraint = "\n\nIMPORTANT: IGNORE the photorealism, texture, and lighting of the input image. You MUST completely re-render the subject in the requested style. If the style is cartoon/3D/drawing, the output must NOT look like a photo.";

  if (styleId === 'realism') {
    systemConstraint = "\n\nIMPORTANT: PRESERVE and ENHANCE the photorealism. Do NOT turn this into a drawing or painting. Output must look like a high-end RAW photograph taken with a DSLR camera. Improve texture, lighting, and detail to 8k quality.";
  }

  try {
    // ATTEMPT 1: Gemini 3 Pro Image (The "Latest")
    console.log("🎨 Attempting generation with Gemini 3 Pro Image...");
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
            text: "Generate an image based on this input. RENDER STYLE: " + stylePrompt + "\n\nINPUT IMAGE REFERENCE: Use the attached image ONLY for composition and pose. " + systemConstraint
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

    console.log("📸 API RESPONSE (G3):", response);

    // Validate G3 response
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.inlineData?.data) {
      return `data:image/png;base64,${candidate.content.parts[0].inlineData.data}`;
    }
    throw new Error("Gemini 3 returned no image.");

  } catch (g3Error) {
    console.warn("⚠️ Gemini 3 Failed, falling back to Gemini 2.0 Flash:", g3Error);

    // ATTEMPT 2: Gemini 2.0 Flash (Stable Fallback)
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64(originalImageBase64),
                mimeType: getMimeType(originalImageBase64),
              },
            },
            {
              text: "Generate an image based on this input. RENDER STYLE: " + stylePrompt + "\n\nINPUT IMAGE REFERENCE: Use the attached image ONLY for composition and pose. " + systemConstraint
            },
          ],
        },
        config: {
          responseMimeType: 'image/jpeg'
        }
      });

      console.log("📸 API RESPONSE (G2):", response);
      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("No candidates returned from fallback.");

      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Fallback model returned text/data but NO image.");

    } catch (fallbackError) {
      console.error("Critical Failure:", fallbackError);
      // Throw the original error if it was permission related, or the fallback error?
      // Let's throw a combined message so the user sees both if needed.
      throw new Error(`Generation failed. Primary: ${(g3Error as any).message}. Fallback: ${(fallbackError as any).message}`);
    }
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