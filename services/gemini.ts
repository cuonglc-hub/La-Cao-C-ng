import { GoogleGenAI } from "@google/genai";

// Helper to strip the Data URL prefix to get raw base64
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const swapCharacterInThumbnail = async (
  thumbnailBase64: string,
  characterBase64: string,
  mimeTypeThumb: string = 'image/png',
  mimeTypeChar: string = 'image/png'
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. The environment must provide process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prompt engineering is crucial here. 
  // We need to instruct the model to use the first image as the base (composition, text) 
  // and the second image as the source for the new subject.
  const prompt = `
    You are an expert graphic designer and image editor.
    
    I am providing two images:
    1. A YouTube thumbnail with specific text, layout, and background.
    2. A portrait of a character.

    **Task:**
    Create a new version of the first image (the thumbnail) by replacing the main character in it with the character from the second image.

    **Strict Requirements:**
    - PRESERVE the exact text, fonts, and their placement from the original thumbnail.
    - PRESERVE the original background, color scheme, and graphical elements (arrows, shapes, logos).
    - PRESERVE the aspect ratio (19:9 or 16:9).
    - REPLACE only the person/character. 
    - The new character should have a similar pose and scale to fit the composition naturally.
    - Match the lighting, saturation, and artistic style of the thumbnail so the new character looks like they belong there.
    
    Output ONLY the generated image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeTypeThumb,
              data: cleanBase64(thumbnailBase64)
            }
          },
          {
            inlineData: {
              mimeType: mimeTypeChar,
              data: cleanBase64(characterBase64)
            }
          }
        ]
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The model did not return an image. It might have refused the request or returned text only.");
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};