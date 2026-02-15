
export enum Recommendation {
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface PricePoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  history: PricePoint[];
  indicators: TechnicalIndicators;
}

export interface AIRecommendation {
  recommendation: Recommendation;
  confidence: number;
  reasoning: string[];
  riskLevel: RiskLevel;
  targetPrice?: number;
}
