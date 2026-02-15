
import { Asset, PricePoint, TechnicalIndicators } from '../types';

const INITIAL_ASSETS = [
  { symbol: 'XAU/INR', name: 'Gold Spot', basePrice: 171822.00 }, // ~2070 USD * 83
  { symbol: 'XAG/INR', name: 'Silver Spot', basePrice: 2075.00 },   // ~25 USD * 83
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 15431.00 },     // ~186 USD * 83
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 60268.00 },    // ~726 USD * 83
  { symbol: 'BTC/INR', name: 'Bitcoin', basePrice: 4327620.00 },   // ~52140 USD * 83
  { symbol: 'TSLA', name: 'Tesla, Inc.', basePrice: 16066.00 },     // ~193 USD * 83
];

const generateHistory = (basePrice: number, points: number = 50): PricePoint[] => {
  const history: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000 * 60).toISOString();
    const volatility = basePrice * 0.005;
    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.2);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.2);
    
    history.push({
      time,
      price: close,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000)
    });
    currentPrice = close;
  }
  return history;
};

const calculateIndicators = (history: PricePoint[]): TechnicalIndicators => {
  const prices = history.map(p => p.close);
  const lastPrice = prices[prices.length - 1];
  
  // Simulated Indicators for UI/UX
  return {
    rsi: 45 + Math.random() * 20,
    macd: {
      value: (Math.random() - 0.5) * 5,
      signal: (Math.random() - 0.5) * 4,
      histogram: (Math.random() - 0.5) * 2,
    },
    sma20: lastPrice * (1 + (Math.random() - 0.5) * 0.01),
    sma50: lastPrice * (1 + (Math.random() - 0.5) * 0.02),
    bollingerBands: {
      upper: lastPrice * 1.05,
      middle: lastPrice,
      lower: lastPrice * 0.95,
    }
  };
};

export const fetchAssets = (): Asset[] => {
  return INITIAL_ASSETS.map(base => {
    const history = generateHistory(base.basePrice);
    const lastPoint = history[history.length - 1];
    const prevPoint = history[history.length - 2];
    const change = lastPoint.close - prevPoint.close;
    const changePercent = (change / prevPoint.close) * 100;

    return {
      symbol: base.symbol,
      name: base.name,
      price: lastPoint.close,
      change,
      changePercent,
      high: Math.max(...history.map(p => p.high)),
      low: Math.min(...history.map(p => p.low)),
      volume: lastPoint.volume,
      history,
      indicators: calculateIndicators(history)
    };
  });
};

export const updateAssetPrice = (asset: Asset): Asset => {
  const volatility = asset.price * 0.001;
  const change = (Math.random() - 0.5) * volatility;
  const newPrice = asset.price + change;
  
  const lastHistory = [...asset.history];
  const lastPoint = lastHistory[lastHistory.length - 1];
  
  const updatedLastPoint = {
    ...lastPoint,
    price: newPrice,
    close: newPrice,
    high: Math.max(lastPoint.high, newPrice),
    low: Math.min(lastPoint.low, newPrice)
  };
  
  lastHistory[lastHistory.length - 1] = updatedLastPoint;
  
  return {
    ...asset,
    price: newPrice,
    change: newPrice - lastHistory[0].close,
    changePercent: ((newPrice - lastHistory[0].close) / lastHistory[0].close) * 100,
    history: lastHistory,
    indicators: calculateIndicators(lastHistory)
  };
};
