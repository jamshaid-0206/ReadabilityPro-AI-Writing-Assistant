import { GoogleGenAI, Type } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '';
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export type RefineMode = 'general' | 'professional' | 'simple' | 'academic' | 'seo' | 'urdu';

export interface ImproveSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface IntelligenceTip {
  type: 'clarity' | 'grammar' | 'style' | 'seo' | 'passive_voice';
  title: string;
  message: string;
}

export interface ImproveResult {
  improvedText: string;
  alternateVersions: {
    label: string;
    text: string;
  }[];
  suggestions: ImproveSuggestion[];
  intelligenceTips: IntelligenceTip[];
  meta: {
    seoScore?: number;
    toneLabel?: string;
  };
}

export async function getAISuggestions(text: string, mode: RefineMode = 'general'): Promise<ImproveResult> {
  const model = "gemini-3-flash-preview";
  
  let modeInstruction = "";
  switch(mode) {
    case 'professional':
      modeInstruction = "Elevate the text to a professional business standard. Focus on clarity, directness, and authoritative tone.";
      break;
    case 'simple':
      modeInstruction = "Simplify the text for an 8th-grade reading level. Use common words and shorter sentences.";
      break;
    case 'academic':
      modeInstruction = "Rewrite with academic rigor. Use formal vocabulary, objective tone, and sophisticated sentence structures.";
      break;
    case 'seo':
      modeInstruction = "Optimize for SEO. Improve keyword density naturally, add scannable headers if appropriate, and focus on high-impact language.";
      break;
    case 'urdu':
      modeInstruction = "Translate the essence of this text into high-quality, natural Urdu while maintaining the original tone and context.";
      break;
    default:
      modeInstruction = "Provide general improvements for readability, grammar, and engagement.";
  }

  const prompt = `
    Analyze the following text and provide improvements according to this mode: ${modeInstruction}

    Return a JSON object following this schema:
    {
      "improvedText": "The main optimized version of the text",
      "alternateVersions": [
        {"label": "Direct/Concise", "text": "..."},
        {"label": "Engaging/Punchy", "text": "..."}
      ],
      "suggestions": [
        {"original": "string", "suggested": "string", "reason": "string"}
      ],
      "intelligenceTips": [
        {"type": "clarity", "title": "Avoid passive voice", "message": "Stronger verbs make your writing more convincing."}
      ],
      "meta": {
        "seoScore": 0-100,
        "toneLabel": "e.g. Formal, Casual, Cold, Warm"
      }
    }

    Text to process:
    "${text}"
  `;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedText: { type: Type.STRING },
            alternateVersions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            intelligenceTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  message: { type: Type.STRING }
                }
              }
            },
            meta: {
              type: Type.OBJECT,
              properties: {
                seoScore: { type: Type.NUMBER },
                toneLabel: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const resultStr = response.text || "{}";
    const data = JSON.parse(resultStr);
    
    // Ensure arrays exist to prevent .map() errors in UI
    return {
      improvedText: data.improvedText || "",
      alternateVersions: data.alternateVersions || [],
      suggestions: data.suggestions || [],
      intelligenceTips: data.intelligenceTips || [],
      meta: data.meta || {}
    } as ImproveResult;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to get AI suggestions");
  }
}
