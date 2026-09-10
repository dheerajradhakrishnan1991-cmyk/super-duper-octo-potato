import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LotteryTransaction } from '../types';
import { Trophy, TrendingUp, Sparkles, BarChart2, Coins, ArrowUpRight, Award } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface WinningTrendsChartProps {
  transactions: LotteryTransaction[];
  onNavigateToAutomaton?: () => void;
}

export const WinningTrendsChart: React.FC<WinningTrendsChartProps> = ({
  transactions,
  onNavigateToAutomaton,
}) => {
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'TON'>('INR');
  const [chartType, setChartType] = useState<'cumulative' | 'individual'>('cumulative');

  // Filter win_payout transactions and sort chronologically (oldest to newest for trend over time)
  const winTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'win_payout')
      .slice()
      .reverse(); // transactions are stored newest-first, so reverse gives oldest-first
  }, [transactions]);

  // Aggregate data points with cumulative sums
  const chartData = useMemo(() => {
    let runningTotalInr = 0;
    let runningTotalTon = 0;

    return winTransactions.map((tx, idx) => {
      runningTotalInr += tx.amountInr;
      runningTotalTon += tx.amountTon;

      // Extract a short readable label
      let label = tx.timestamp.replace(' IST', '').replace('Today, ', '').replace('Yesterday, ', 'Yday ');
      if (label.length > 12) {
        label = label.slice(0, 10);
      }
      if (!label || label === 'Just now') {
        label = `Win #${idx + 1}`;
      }

      return {
        id: tx.id,
        index: idx + 1,
        label,
        fullTimestamp: tx.timestamp,
        title: tx.title,
        ticketCode: tx.ticketCode,
        amountInr: tx.amountInr,
        amountTon: tx.amountTon,
        cumulativeInr: runningTotalInr,
        cumulativeTon: +runningTotalTon.toFixed(2),
        txHash: tx.txHash,
      };
    });
  }, [winTransactions]);

  // Key metrics
  const totalWonInr = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeInr : 0;
  const totalWonTon = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeTon : 0;
  const maxWinInr = chartData.length > 0 ? Math.max(...chartData.map((d) => d.amountInr)) : 0;
  const maxWinTon = chartData.length > 0 ? Math.max(...chartData.map((d) => d.amountTon)) : 0;
  const avgWinInr = chartData.length > 0 ? Math.round(totalWonInr / chartData.length) : 0;
  const avgWinTon = chartData.length > 0 ? +(totalWonTon / chartData.length).toFixed(2) : 0;

  // Custom Dark Styled Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-slate-950/95 border border-amber-500/50 p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-extrabold text-amber-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Win Event #{data.index}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{data.fullTimestamp}</span>
          </div>

          <div className="font-bold text-white mb-1 leading-snug">{data.title}</div>
          {data.ticketCode && (
            <div className="text-[10px] text-emerald-400 font-mono mb-2">
              Ticket: {data.ticketCode}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block">Payout:</span>
              <span className="font-black text-amber-300 font-mono">
                {currencyMode === 'INR' ? `₹${data.amountInr.toLocaleString('en-IN')}` : `${data.amountTon} TON`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Cumulative:</span>
              <span className="font-black text-emerald-400 font-mono">
                {currencyMode === 'INR' ? `₹${data.cumulativeInr.toLocaleString('en-IN')}` : `${data.cumulativeTon} TON`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col gap-3.5 shadow-xl">
      {/* Header & View Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              Winning Trends Over Time
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                Live Analytics
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Historical lottery payouts from verified automaton draws
            </p>
          </div>
        </div>

        {/* Control Toggles: Cumulative vs Payouts & INR vs TON */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Chart Type Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
            <button
              id="chart-type-cumulative"
              onClick={() => {
                triggerHaptic('light');
                setChartType('cumulative');
              }}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                chartType === 'cumulative'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cumulative
            </button>
            <button
              id="chart-type-individual"
              onClick={() => {
                triggerHaptic('light');
                setChartType('individual');
              }}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                chartType === 'individual'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Per Payout
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
            <button
              id="chart-curr-inr"
              onClick={() => {
                triggerHaptic('light');
                setCurrencyMode('INR');
              }}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                currencyMode === 'INR'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              id="chart-curr-ton"
              onClick={() => {
                triggerHaptic('light');
                setCurrencyMode('TON');
              }}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                currencyMode === 'TON'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💎 TON
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Total Won
          </span>
          <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5">
            {currencyMode === 'INR' ? `₹${totalWonInr.toLocaleString('en-IN')}` : `${totalWonTon} TON`}
          </div>
          <span className="text-[9px] text-emerald-400/90 font-medium">
            {chartData.length} Win Events
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Best Win
          </span>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
            {currencyMode === 'INR' ? `₹${maxWinInr.toLocaleString('en-IN')}` : `${maxWinTon} TON`}
          </div>
          <span className="text-[9px] text-slate-400">Single Draw</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Average / Win
          </span>
          <div className="text-base sm:text-lg font-black text-cyan-400 font-mono mt-0.5">
            {currencyMode === 'INR' ? `₹${avgWinInr.toLocaleString('en-IN')}` : `${avgWinTon} TON`}
          </div>
          <span className="text-[9px] text-slate-400">Yield per win</span>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      {chartData.length > 0 ? (
        <div className="relative w-full h-56 sm:h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'cumulative' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="winGradientInr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="winGradientTon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) =>
                    currencyMode === 'INR'
                      ? val >= 1000
                        ? `₹${val / 1000}k`
                        : `₹${val}`
                      : `${val}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={currencyMode === 'INR' ? 'cumulativeInr' : 'cumulativeTon'}
                  stroke={currencyMode === 'INR' ? '#f59e0b' : '#06b6d4'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(${currencyMode === 'INR' ? '#winGradientInr' : '#winGradientTon'})`}
                  activeDot={{
                    r: 5,
                    fill: currencyMode === 'INR' ? '#f59e0b' : '#06b6d4',
                    stroke: '#020617',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) =>
                    currencyMode === 'INR'
                      ? val >= 1000
                        ? `₹${val / 1000}k`
                        : `₹${val}`
                      : `${val}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={currencyMode === 'INR' ? 'amountInr' : 'amountTon'}
                  fill={currencyMode === 'INR' ? '#10b981' : '#38bdf8'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        /* Empty state when no win transactions */
        <div className="py-8 px-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-white">No Winning Payouts Yet</h4>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Play the live Mechanical Draw Automaton with your Kerala lottery tickets to score prize payouts and see your winning curve rise!
          </p>
          {onNavigateToAutomaton && (
            <button
              onClick={onNavigateToAutomaton}
              className="mt-1 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Spin Automaton
            </button>
          )}
        </div>
      )}

      {/* Sub-label note */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Real-time TON smart contract verification
        </span>
        <span className="font-mono">Rate: 1 TON = ₹450 INR</span>
      </div>
    </div>
  );
};
