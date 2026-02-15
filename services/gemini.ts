
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, AIRecommendation, Recommendation, RiskLevel } from "../types";

const RECOMMENDATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendation: {
      type: Type.STRING,
      description: 'The trading recommendation: BUY, HOLD, or SELL.',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence percentage from 0 to 100.',
    },
    reasoning: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-3 short bullet points explaining the rationale.',
    },
    riskLevel: {
      type: Type.STRING,
      description: 'The estimated risk: Low, Medium, or High.',
    },
    targetPrice: {
      type: Type.NUMBER,
      description: 'Optional estimated fair value target price.',
    },
  },
  required: ['recommendation', 'confidence', 'reasoning', 'riskLevel'],
};

export const getMarketAnalysis = async (asset: Asset): Promise<AIRecommendation> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select a key using the setup button.");
  }

  // Mandatory: Create instance right before making the call to capture updated environment keys
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this financial asset and provide a professional trading recommendation. 
    NOTE: All prices are provided in Indian Rupees (INR, ₹).

    Asset Name: ${asset.name} (${asset.symbol})
    Current Price: ₹${asset.price.toFixed(2)}
    24h Change: ${asset.changePercent.toFixed(2)}%
    
    Technical Indicators:
    - RSI: ${asset.indicators.rsi.toFixed(2)}
    - MACD Value: ${asset.indicators.macd.value.toFixed(4)}
    - SMA 20: ${asset.indicators.sma20.toFixed(2)}
    - SMA 50: ${asset.indicators.sma50.toFixed(2)}
    - Bollinger Upper: ${asset.indicators.bollingerBands.upper.toFixed(2)}
    - Bollinger Lower: ${asset.indicators.bollingerBands.lower.toFixed(2)}

    Price History Context (Last few intervals in INR):
    ${asset.history.slice(-5).map(h => `Time: ${h.time}, Close: ₹${h.close.toFixed(2)}, Vol: ${h.volume}`).join('\n')}

    Consider technical analysis, trend direction, and current price position relative to indicators. 
    Provide an actionable, data-backed recommendation in the context of the Indian market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RECOMMENDATION_SCHEMA,
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text);
    return {
      recommendation: result.recommendation as Recommendation,
      confidence: result.confidence,
      reasoning: result.reasoning,
      riskLevel: result.riskLevel as RiskLevel,
      targetPrice: result.targetPrice,
    };
  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    
    // Explicitly re-throw "not found" errors so the UI can trigger key selection
    if (error?.message?.includes("not found") || error?.message?.includes("404")) {
      throw new Error("Requested entity was not found. Please re-select your API key.");
    }

    // Fallback for non-critical errors
    return {
      recommendation: Recommendation.HOLD,
      confidence: 50,
      reasoning: ["Technical signals are currently unstable", "Volume is stabilizing", "Check your API connection or key permissions"],
      riskLevel: RiskLevel.MEDIUM
    };
  }
};
