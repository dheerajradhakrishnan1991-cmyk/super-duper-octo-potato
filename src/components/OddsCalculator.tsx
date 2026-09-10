import React, { useState, useMemo } from 'react';
import { KeralaLottery } from '../types';
import { triggerHaptic } from '../utils/haptics';
import {
  Calculator,
  Trophy,
  Percent,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface OddsCalculatorProps {
  lotteries: KeralaLottery[];
  onSelectLotteryToBuy: (lottery: KeralaLottery) => void;
  useMalayalam?: boolean;
}

interface PrizeTierOdds {
  name: string;
  malayalamName?: string;
  prizeAmount: string;
  winnerCount: number;
  oddsRatioText: string;
  probabilityPercent: number;
  description: string;
}

export const OddsCalculator: React.FC<OddsCalculatorProps> = ({
  lotteries,
  onSelectLotteryToBuy,
  useMalayalam = false,
}) => {
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>(
    lotteries[0]?.id || 'thiruvonam-br93'
  );
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const selectedLottery = useMemo(() => {
    return lotteries.find((l) => l.id === selectedLotteryId) || lotteries[0];
  }, [lotteries, selectedLotteryId]);

  // Derive dynamic prize tier probabilities based on current sales
  const calculationData = useMemo(() => {
    const sold = selectedLottery.ticketsSold || 80000;
    const seriesCount = selectedLottery.seriesAvailable?.length || 12;
    const k = ticketCount;

    // Helper to calculate odds string and percentage
    const calcOdds = (winnerCount: number) => {
      const totalWinningChances = Math.min(sold, winnerCount * k);
      const ratio = Math.max(1, Math.round(sold / totalWinningChances));
      const pct = Math.min(100, (totalWinningChances / sold) * 100);
      return {
        ratioText: `1 in ${ratio.toLocaleString('en-IN')}`,
        pct,
      };
    };

    // Determine tier configurations based on whether it's a bumper or weekly draw
    let secondPrizeWinners = 1;
    let thirdPrizeWinners = 12;
    let lowerTierWinners = Math.round(sold * 0.08); // 8% of pool wins minor tiers
    let anyPrizeBaselineProb = 0.098; // ~1 in 10.2 tickets wins any prize

    if (selectedLottery.isBumper) {
      secondPrizeWinners = 20;
      thirdPrizeWinners = 20;
      lowerTierWinners = Math.round(sold * 0.11);
      anyPrizeBaselineProb = 0.118; // ~1 in 8.5 tickets for bumpers
    }

    const first = calcOdds(1);
    const consolation = calcOdds(seriesCount - 1);
    const second = calcOdds(secondPrizeWinners);
    const third = calcOdds(thirdPrizeWinners);
    const lower = calcOdds(lowerTierWinners);

    // Probability of winning at least one prize with K tickets: 1 - (1 - p)^K
    const overallWinProb = (1 - Math.pow(1 - anyPrizeBaselineProb, k)) * 100;
    const overallRatio = Math.max(1, Math.round(1 / (1 - Math.pow(1 - anyPrizeBaselineProb, k))));

    const tiers: PrizeTierOdds[] = [
      {
        name: '1st Prize (Jackpot)',
        malayalamName: 'ഒന്നാം സമ്മാനം',
        prizeAmount: selectedLottery.firstPrizeInr,
        winnerCount: 1,
        oddsRatioText: first.ratioText,
        probabilityPercent: first.pct,
        description: 'Single winning series + 6-digit number drawn from mechanical drum',
      },
      {
        name: 'Consolation Prize',
        malayalamName: 'സമാശ്വാസ സമ്മാനം',
        prizeAmount: selectedLottery.consolationPrize,
        winnerCount: seriesCount - 1,
        oddsRatioText: consolation.ratioText,
        probabilityPercent: consolation.pct,
        description: `Same 6 digits in the other ${seriesCount - 1} official ticket series`,
      },
      {
        name: '2nd Prize',
        malayalamName: 'രണ്ടാം സമ്മാനം',
        prizeAmount: selectedLottery.secondPrize,
        winnerCount: secondPrizeWinners,
        oddsRatioText: second.ratioText,
        probabilityPercent: second.pct,
        description: selectedLottery.isBumper
          ? '20 distinct winning ticket codes across all series'
          : 'Official 2nd prize draw code',
      },
      {
        name: '3rd Prize',
        malayalamName: 'മൂന്നാം സമ്മാനം',
        prizeAmount: selectedLottery.thirdPrize,
        winnerCount: thirdPrizeWinners,
        oddsRatioText: third.ratioText,
        probabilityPercent: third.pct,
        description: 'Selected 6-digit combinations drawn across registered series',
      },
      {
        name: '4th to 8th / Last 4 Digits',
        malayalamName: 'മറ്റു സമ്മാനങ്ങൾ',
        prizeAmount: '₹500 - ₹5,000',
        winnerCount: lowerTierWinners,
        oddsRatioText: lower.ratioText,
        probabilityPercent: lower.pct,
        description: 'Matching last 4 digits drawn multiple times for broad payout yield',
      },
    ];

    const totalPriceInr = selectedLottery.ticketPriceInr * k;
    const totalPriceTon = +(selectedLottery.ticketPriceTon * k).toFixed(2);
    const percentSold = Math.round((selectedLottery.ticketsSold / selectedLottery.totalTickets) * 100);

    return {
      tiers,
      overallWinProb: +overallWinProb.toFixed(1),
      overallRatioText: `1 in ${overallRatio}`,
      totalPriceInr,
      totalPriceTon,
      percentSold,
    };
  }, [selectedLottery, ticketCount]);

  const presetCounts = [1, 3, 5, 10, 25];

  return (
    <div
      id="odds-calculator-container"
      className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-700/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex items-center justify-between border-b border-emerald-800/40 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 text-amber-400 flex items-center justify-center shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                {useMalayalam ? 'വിജയ സാധ്യത കാൽക്കുലേറ്റർ' : 'Kerala Lottery Odds Calculator'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                Live Sales Math
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time probabilities computed from circulating ticket pools
            </p>
          </div>
        </div>

        <button
          id="toggle-odds-calculator"
          onClick={() => {
            triggerHaptic('light');
            setIsExpanded(!isExpanded);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="relative z-10 flex flex-col gap-4">
          {/* Controls: Lottery Selection & Ticket Count Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Choose Lottery */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="odds-lottery-select"
                className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
              >
                <span>Select Draw:</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {selectedLottery.drawCode}
                </span>
              </label>

              <select
                id="odds-lottery-select"
                value={selectedLotteryId}
                onChange={(e) => {
                  triggerHaptic('light');
                  setSelectedLotteryId(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-600 focus:border-emerald-500 text-xs font-bold text-white outline-none transition-colors"
              >
                {lotteries.map((lotto) => (
                  <option key={lotto.id} value={lotto.id} className="bg-slate-950 text-white">
                    {lotto.name} ({lotto.drawCode}) — 1st: {lotto.firstPrizeInr}
                  </option>
                ))}
              </select>

              {/* Current Sales Progress Meter */}
              <div className="mt-1 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Sales Pool:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {selectedLottery.ticketsSold.toLocaleString('en-IN')} /{' '}
                    {selectedLottery.totalTickets.toLocaleString('en-IN')}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                    style={{ width: `${calculationData.percentSold}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{calculationData.percentSold}% Sold Out</span>
                  <span>{selectedLottery.seriesAvailable.length} Series (WA-WM)</span>
                </div>
              </div>
            </div>

            {/* Choose Number of Tickets */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="odds-ticket-slider"
                  className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your Ticket Holdings:</span>
                </label>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (₹{calculationData.totalPriceInr} / {calculationData.totalPriceTon} TON)
                  </span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="py-1">
                <input
                  id="odds-ticket-slider"
                  type="range"
                  min="1"
                  max="50"
                  value={ticketCount}
                  onChange={(e) => {
                    setTicketCount(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Preset Quick Buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400">Quick Select:</span>
                <div className="flex items-center gap-1 flex-1">
                  {presetCounts.map((count) => (
                    <button
                      key={count}
                      id={`odds-preset-${count}`}
                      onClick={() => {
                        triggerHaptic('light');
                        setTicketCount(count);
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                        ticketCount === count
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {count}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Probability Spotlight Box */}
              <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-600/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                    Overall Win Probability
                  </span>
                  <div className="text-xs text-slate-300">
                    Chance of winning <strong>any prize tier</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {calculationData.overallWinProb}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {calculationData.overallRatioText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prize Tiers Probabilities Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              <span>Prize Tier Odds Breakdown</span>
              <span className="text-amber-400 font-mono">Holding {ticketCount}x</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {calculationData.tiers.map((tier, idx) => (
                <div
                  key={tier.name}
                  id={`odds-tier-${idx}`}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-emerald-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* Left: Tier Name & Description */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : idx === 1
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">
                          {useMalayalam && tier.malayalamName ? tier.malayalamName : tier.name}
                        </span>
                        <span className="font-mono text-xs font-black text-amber-400">
                          {tier.prizeAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Calculated Odds and Probability Bar */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:min-w-[170px] pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-black text-emerald-300 font-mono">
                        {tier.oddsRatioText}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tier.probabilityPercent < 0.0001
                          ? '< 0.0001%'
                          : `${tier.probabilityPercent.toFixed(4)}%`}
                      </span>
                    </div>

                    <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden shrink-0">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-amber-400'
                            : idx === 1
                            ? 'bg-cyan-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{
                          width: `${Math.max(4, Math.min(100, tier.probabilityPercent * 50))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Insight & CTA */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Odds calculated on the current circulating pool of{' '}
                <strong className="text-slate-200">
                  {selectedLottery.ticketsSold.toLocaleString('en-IN')} tickets
                </strong>
                . Governed by Kerala State Lotteries rules.
              </span>
            </div>

            <button
              id={`odds-buy-cta-${selectedLottery.id}`}
              onClick={() => {
                triggerHaptic('medium');
                onSelectLotteryToBuy(selectedLottery);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Buy {ticketCount > 1 ? `${ticketCount}x Tickets` : 'Ticket'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
