import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { MarketPrice } from '../types';

export interface MarketTrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  changePercent?: number;
  className?: string;
}

export const MarketTrendIndicator: React.FC<MarketTrendIndicatorProps> = ({
  trend,
  size = 'md',
  showLabel = true,
  changePercent,
  className = ''
}) => {
  const getTheme = () => {
    switch (trend) {
      case 'up':
        return {
          badgeBg: 'bg-emerald-500/15',
          badgeBorder: 'border-emerald-500/30',
          textColor: 'text-emerald-400',
          glowColor: 'rgba(16,185,129,0.3)',
          label: 'ALTA',
          symbol: '+',
          icon: <TrendingUp className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        };
      case 'down':
        return {
          badgeBg: 'bg-rose-500/15',
          badgeBorder: 'border-rose-500/30',
          textColor: 'text-rose-400',
          glowColor: 'rgba(244,63,94,0.3)',
          label: 'BAIXA',
          symbol: '-',
          icon: <TrendingDown className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        };
      case 'stable':
      default:
        return {
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/30',
          textColor: 'text-amber-400',
          glowColor: 'rgba(245,158,11,0.2)',
          label: 'ESTÁVEL',
          symbol: '=',
          icon: <Minus className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={trend}
        initial={{ opacity: 0, scale: 0.85, y: trend === 'up' ? 6 : trend === 'down' ? -6 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: trend === 'up' ? -6 : trend === 'down' ? 6 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeBorder} ${theme.textColor} ${className}`}
      >
        {/* Animated Icon Container with Pulse Glow */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={
              trend === 'up'
                ? { y: [0, -2, 0] }
                : trend === 'down'
                ? { y: [0, 2, 0] }
                : { scale: [1, 1.1, 1] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="z-10"
          >
            {theme.icon}
          </motion.div>

          {/* Background Pulse Aura */}
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-full ${
              trend === 'up' ? 'bg-emerald-400/40' : trend === 'down' ? 'bg-rose-400/40' : 'bg-amber-400/30'
            }`}
          />
        </div>

        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: -3 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[9px] font-bold font-mono tracking-wider uppercase"
          >
            {theme.label}
            {changePercent !== undefined && (
              <span className="ml-1 opacity-90">
                ({theme.symbol}{Math.abs(changePercent).toFixed(1)}%)
              </span>
            )}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export interface MarketVolatilitySummaryProps {
  marketPrices: MarketPrice[];
  onRandomizeTrends?: () => void;
  isFetching?: boolean;
}

export const MarketVolatilitySummary: React.FC<MarketVolatilitySummaryProps> = ({
  marketPrices,
  onRandomizeTrends,
  isFetching
}) => {
  const upCount = marketPrices.filter(p => p.trend === 'up').length;
  const downCount = marketPrices.filter(p => p.trend === 'down').length;
  const stableCount = marketPrices.filter(p => p.trend === 'stable').length;
  const total = marketPrices.length || 1;

  const upPerc = Math.round((upCount / total) * 100);
  const downPerc = Math.round((downCount / total) * 100);
  const stablePerc = Math.round((stableCount / total) * 100);

  // Overall market sentiment
  const dominantTrend = upCount > downCount && upCount > stableCount
    ? 'bullish'
    : downCount > upCount && downCount > stableCount
    ? 'bearish'
    : 'neutral';

  return (
    <div className="bg-[#0a0e1a] p-4 rounded-xl border border-slate-800 space-y-3.5 text-left relative overflow-hidden">
      {/* Subtle background glow based on dominant trend */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          dominantTrend === 'bullish'
            ? 'bg-emerald-500/10'
            : dominantTrend === 'bearish'
            ? 'bg-rose-500/10'
            : 'bg-amber-500/10'
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans flex items-center gap-2">
              Termômetro de Volatilidade & Tendências
              <span className="text-[8px] font-normal px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {total} Praças
              </span>
            </h4>
            <p className="text-[9px] text-slate-400 font-sans">
              Distribuição em tempo real da direção dos preços nas regiões produtoras.
            </p>
          </div>
        </div>

        {onRandomizeTrends && (
          <button
            onClick={onRandomizeTrends}
            disabled={isFetching}
            className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            title="Simula choque de volatilidade no mercado para observar animações em tempo real"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 animate-spin-slow" />
            Simular Volatilidade
          </button>
        )}
      </div>

      {/* Grid of Animated Trend Stat Counters */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {/* Alta */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest font-sans flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Alta (Valorização)
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-400">{upPerc}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={upCount}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="text-lg font-extrabold font-mono text-emerald-300"
              >
                {upCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-[9px] text-emerald-500/80 font-sans">praças</span>
          </div>
        </motion.div>

        {/* Estável */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest font-sans flex items-center gap-1">
              <Minus className="w-3 h-3 text-amber-400" />
              Estável (Equilíbrio)
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-400">{stablePerc}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={stableCount}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-lg font-extrabold font-mono text-amber-300"
              >
                {stableCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-[9px] text-amber-500/80 font-sans">praças</span>
          </div>
        </motion.div>

        {/* Baixa */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest font-sans flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              Baixa (Desvalorização)
            </span>
            <span className="text-[9px] font-mono font-bold text-rose-400">{downPerc}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={downCount}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-lg font-extrabold font-mono text-rose-300"
              >
                {downCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-[9px] text-rose-500/80 font-sans">praças</span>
          </div>
        </motion.div>
      </div>

      {/* Animated Multi-segment Progress Bar */}
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
        <motion.div
          animate={{ width: `${upPerc}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-emerald-500 rounded-l-full"
        />
        <motion.div
          animate={{ width: `${stablePerc}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-amber-500"
        />
        <motion.div
          animate={{ width: `${downPerc}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-rose-500 rounded-r-full"
        />
      </div>
    </div>
  );
};
