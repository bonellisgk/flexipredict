
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Asset, AIRecommendation } from './types';
import { fetchAssets, updateAssetPrice } from './services/marketData';
import { getMarketAnalysis } from './services/gemini';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
  Coins,
  BarChart3,
  Clock,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Sub-components ---

const AssetCard: React.FC<{ 
  asset: Asset; 
  isSelected: boolean; 
  onClick: () => void; 
}> = ({ asset, isSelected, onClick }) => {
  const isPositive = asset.change >= 0;

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-[#1E222D] border-blue-500 shadow-lg shadow-blue-500/10' 
          : 'bg-[#1E222D]/50 border-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-100">{asset.name}</h3>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{asset.symbol}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-[#00FF87]' : 'text-[#FF4B4B]'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(asset.changePercent).toFixed(2)}%
        </div>
      </div>
      <div className="text-xl font-bold font-mono text-white mb-2">
        ₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="h-10 opacity-50 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={asset.history.slice(-10)}>
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#00FF87' : '#FF4B4B'} 
              fill={isPositive ? '#00FF8733' : '#FF4B4B33'} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RecommendationView: React.FC<{ 
  recommendation: AIRecommendation | null; 
  isLoading: boolean;
}> = ({ recommendation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#1E222D] p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <RefreshCw className="text-blue-500 animate-spin mb-4" size={40} />
        <p className="text-gray-400 font-medium">Gemini AI is analyzing market signals...</p>
        <p className="text-xs text-gray-600 mt-2">Correlating RSI, MACD, and Momentum trends</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-[#1E222D] p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center min-h-[300px]">
        <Activity className="text-gray-600 mb-4" size={40} />
        <p className="text-gray-400">Select an asset to generate AI recommendation</p>
      </div>
    );
  }

  const colorMap = {
    BUY: 'bg-[#00FF87]/10 border-[#00FF87] text-[#00FF87]',
    HOLD: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
    SELL: 'bg-[#FF4B4B]/10 border-[#FF4B4B] text-[#FF4B4B]',
  };

  const badgeColor = colorMap[recommendation.recommendation];

  return (
    <div className="bg-[#1E222D] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          <h2 className="font-bold text-gray-100">AI Intelligence Insight</h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500">Confidence: <span className="text-white font-mono">{recommendation.confidence}%</span></span>
          <span className="text-gray-500">Risk: <span className={recommendation.riskLevel === 'High' ? 'text-red-400' : 'text-green-400'}>{recommendation.riskLevel}</span></span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-6 py-3 rounded-lg border-2 font-black text-2xl tracking-widest ${badgeColor}`}>
                {recommendation.recommendation}
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Target Outlook</div>
                <div className="text-xl font-bold font-mono text-white">
                  {recommendation.targetPrice ? `₹${recommendation.targetPrice.toLocaleString('en-IN')}` : 'Market Value'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-tighter flex items-center gap-2">
                <ChevronRight size={16} /> Analysis Reasoning
              </h3>
              <ul className="space-y-3">
                {recommendation.reasoning.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                    <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full md:w-64 bg-[#262730]/50 p-4 rounded-lg border border-gray-800/50">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Sentiment Bias</h4>
             <div className="space-y-4">
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                   <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ${recommendation.recommendation === 'BUY' ? 'bg-[#00FF87]' : recommendation.recommendation === 'SELL' ? 'bg-[#FF4B4B]' : 'bg-yellow-500'}`} 
                    style={{ width: `${recommendation.confidence}%` }} 
                   />
                </div>
                <p className="text-xs text-gray-400 leading-normal italic">
                  Based on current SMA20/50 crossovers and RSI divergence detected by Gemini 3.
                </p>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 uppercase">
                  Execute Trade <ArrowRight size={14} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initialization
  useEffect(() => {
    const initial = fetchAssets();
    setAssets(initial);
    setSelectedSymbol(initial[0].symbol);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(a => updateAssetPrice(a)));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Gemini Analysis when selection changes
  const runAnalysis = useCallback(async (asset: Asset) => {
    setIsAnalysing(true);
    try {
      const result = await getMarketAnalysis(asset);
      setRecommendation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalysing(false);
    }
  }, []);

  useEffect(() => {
    const asset = assets.find(a => a.symbol === selectedSymbol);
    if (asset) {
      runAnalysis(asset);
    }
  }, [selectedSymbol, runAnalysis]);

  const selectedAsset = useMemo(() => 
    assets.find(a => a.symbol === selectedSymbol), 
    [assets, selectedSymbol]
  );

  const filteredAssets = assets.filter(a => 
    a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0E1117] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#161922] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Coins className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">FlexiPredict</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Institutional Hub</p>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E222D] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Watchlist</h3>
            {filteredAssets.map(asset => (
              <AssetCard 
                key={asset.symbol} 
                asset={asset} 
                isSelected={selectedSymbol === asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-gray-800 bg-[#0E1117]/50">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Market (INR)
            </div>
            <span>v1.0.4-BETA</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <LayoutDashboard size={16} />
              <span>Markets / {selectedAsset?.name || 'Dashboard'}</span>
            </div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-4">
              Terminal Overview
              {selectedAsset && (
                <span className="text-sm font-normal bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700 uppercase font-mono tracking-wider">
                  {selectedAsset.symbol}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-[#1E222D] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
               <Clock size={16} className="text-blue-500" />
               <div className="flex flex-col">
                  <span className="text-gray-500 leading-none mb-1">Last Update</span>
                  <span className="text-white font-mono font-medium">{lastUpdated.toLocaleTimeString()}</span>
               </div>
            </div>
            <button 
              onClick={() => selectedAsset && runAnalysis(selectedAsset)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 font-bold"
            >
              <RefreshCw size={18} className={isAnalysing ? 'animate-spin' : ''} />
              <span className="hidden md:inline">Force Re-Analysis</span>
            </button>
          </div>
        </header>

        {selectedAsset ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Chart & Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#1E222D] p-6 rounded-2xl border border-gray-800 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <BarChart3 className="text-blue-400" size={24} />
                    <h3 className="text-xl font-bold">Interactive Chart (₹)</h3>
                  </div>
                  <div className="flex gap-2">
                    {['1H', '1D', '1W', '1M'].map(p => (
                      <button key={p} className={`px-3 py-1 text-[10px] font-bold rounded-lg border ${p === '1H' ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-800 text-gray-500 hover:bg-gray-800'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedAsset.history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262730" />
                      <XAxis 
                        dataKey="time" 
                        hide 
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        orientation="right" 
                        stroke="#4b5563" 
                        tick={{fontSize: 10}}
                        tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E222D', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        strokeWidth={3}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-[#262730]/50 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Volume</span>
                    <span className="text-lg font-mono font-bold text-gray-100">{(selectedAsset.volume / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="p-4 bg-[#262730]/50 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Day High</span>
                    <span className="text-lg font-mono font-bold text-green-400">₹{selectedAsset.high.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 bg-[#262730]/50 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Day Low</span>
                    <span className="text-lg font-mono font-bold text-red-400">₹{selectedAsset.low.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 bg-[#262730]/50 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Volatility</span>
                    <span className="text-lg font-mono font-bold text-blue-400">Low</span>
                  </div>
                </div>
              </div>

              <RecommendationView recommendation={recommendation} isLoading={isAnalysing} />
            </div>

            {/* Right: Indicators & Intelligence */}
            <div className="space-y-8">
               <div className="bg-[#1E222D] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-purple-400" />
                    Market Indicators
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 text-sm">Relative Strength (RSI)</span>
                       <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${selectedAsset.indicators.rsi > 70 ? 'bg-red-500/10 text-red-500' : selectedAsset.indicators.rsi < 30 ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-300'}`}>
                         {selectedAsset.indicators.rsi.toFixed(1)}
                       </span>
                    </div>
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                       <div 
                        className="absolute h-full bg-gradient-to-r from-green-500 via-blue-500 to-red-500" 
                        style={{ width: '100%' }} 
                       />
                       <div 
                        className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-500" 
                        style={{ left: `${selectedAsset.indicators.rsi}%` }} 
                       />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      {[
                        { label: 'SMA (20)', val: selectedAsset.indicators.sma20 },
                        { label: 'SMA (50)', val: selectedAsset.indicators.sma50 },
                        { label: 'BB Upper', val: selectedAsset.indicators.bollingerBands.upper },
                        { label: 'BB Lower', val: selectedAsset.indicators.bollingerBands.lower },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 uppercase">{item.label}</span>
                          <span className="font-mono text-gray-300">₹{item.val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-[#1E222D] to-[#262730] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <ShieldAlert size={150} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={14} /> Risk Disclaimer
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    The FlexiPredict insights are generated by large language models based on mathematical indicators. 
                    This is for educational purposes only and does not constitute financial advice.
                  </p>
                  <p className="text-xs text-gray-400 font-bold border-l-2 border-red-500 pl-3">
                    Trading financial instruments carries a high level of risk and may result in the loss of all invested capital.
                  </p>
               </div>

               <div className="bg-[#1E222D] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold mb-4">Live Activity Feed</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-xs text-gray-300 font-medium">New Analysis cycle completed</p>
                          <span className="text-[10px] text-gray-600 font-mono">2 mins ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <RefreshCw className="animate-spin mb-4" />
            <p>Select an asset from the sidebar to begin analysis</p>
          </div>
        )}
      </main>
    </div>
  );
}
