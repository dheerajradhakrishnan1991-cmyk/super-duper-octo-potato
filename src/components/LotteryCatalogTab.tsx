import React, { useState } from 'react';
import { KeralaLottery, RecentWinner } from '../types';
import { RECENT_WINNERS } from '../data/lotteries';
import { OddsCalculator } from './OddsCalculator';
import {
  Sparkles,
  Trophy,
  Clock,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Flame,
  Star,
  Users,
  Calendar,
  Gift,
  Calculator,
  Percent
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface LotteryCatalogTabProps {
  lotteries: KeralaLottery[];
  onSelectLotteryToBuy: (lottery: KeralaLottery) => void;
  onNavigateToAutomaton: (lotteryId?: string) => void;
  onNavigateToAdmin?: (subTab?: string) => void;
  useMalayalam: boolean;
}

export const LotteryCatalogTab: React.FC<LotteryCatalogTabProps> = ({
  lotteries,
  onSelectLotteryToBuy,
  onNavigateToAutomaton,
  onNavigateToAdmin,
  useMalayalam,
}) => {
  const [filter, setFilter] = useState<'all' | 'bumpers' | 'weekly'>('all');

  const filteredLotteries = lotteries.filter((l) => {
    if (filter === 'bumpers') return l.isBumper;
    if (filter === 'weekly') return !l.isBumper;
    return true;
  });

  const bumperLottery = lotteries.find((l) => l.isBumper) || lotteries[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Live Recent Winners Marquee Ticker */}
      <div className="bg-emerald-950/70 border border-emerald-800/50 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden shadow-sm">
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400 shrink-0 uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 animate-bounce" />
          <span>LIVE WINS:</span>
        </div>
        <div className="flex items-center gap-4 text-xs overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
          {RECENT_WINNERS.map((win) => (
            <div key={win.id} className="flex items-center gap-1.5 text-slate-300">
              <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 font-bold text-[9px] flex items-center justify-center">
                {win.avatarLetter}
              </span>
              <span className="font-semibold text-white">{win.username}</span>
              <span className="text-emerald-400 font-bold">won {win.prizeAmount}</span>
              <span className="text-slate-500 text-[10px]">({win.lotteryName})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Directorate Admin Quick Bar */}
      {onNavigateToAdmin && (
        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-600/40 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Directorate Portal:</span>
              <span className="text-slate-400 text-[11px] ml-1 hidden sm:inline">
                Create custom lotteries, mint tickets & conduct gazette draws
              </span>
            </div>
          </div>
          <button
            id="catalog-create-custom-lottery-btn"
            onClick={() => onNavigateToAdmin('lotteries')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Custom Lottery</span>
          </button>
        </div>
      )}

      {/* Featured Kerala Mega Bumper Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-emerald-950 p-4 sm:p-6 text-white border-2 border-amber-400/80 shadow-2xl shadow-amber-600/30">
        {/* Onam Pookkalam / Geometric background texture */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 opacity-10 text-8xl font-black text-white pointer-events-none select-none">
          ₹25Cr
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-slate-950/60 text-amber-300 border border-amber-400/40 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {useMalayalam ? 'മെഗാ ഫെസ്റ്റിവൽ ബമ്പർ' : 'KERALA MEGA FESTIVAL BUMPER'}
            </span>
            <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {bumperLottery.drawDate}
            </span>
          </div>

          <div>
            <div className="text-xs text-amber-100 font-bold uppercase tracking-wider">
              {bumperLottery.name} ({bumperLottery.malayalamName}) • {bumperLottery.drawCode}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
              {bumperLottery.firstPrizeInr}
            </h2>
            <p className="text-xs text-amber-100/90 font-medium mt-0.5">
              1st Prize: ₹25 Crore + 20 Winners of ₹1 Crore Each!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-amber-400/30">
            <div className="flex items-center gap-3 text-xs text-amber-100">
              <div>
                <span className="block text-[10px] text-amber-200/80 uppercase">Ticket Price</span>
                <strong className="text-white font-black text-sm">₹{bumperLottery.ticketPriceInr}</strong>
                <span className="text-amber-300 text-[11px] ml-1">({bumperLottery.ticketPriceTon} TON)</span>
              </div>
              <div className="h-6 w-px bg-amber-400/40" />
              <div>
                <span className="block text-[10px] text-amber-200/80 uppercase">Series</span>
                <strong className="text-white font-black text-sm">12 Series (WA-WM)</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="buy-bumper-btn"
                onClick={() => {
                  triggerHaptic('medium');
                  onSelectLotteryToBuy(bumperLottery);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-950 text-amber-300 hover:bg-slate-900 border border-amber-400/80 text-xs sm:text-sm font-black shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Buy Bumper Ticket</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToAutomaton(bumperLottery.id)}
                title="Watch Automaton Machine"
                className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/40 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All Draws ({lotteries.length})
          </button>
          <button
            onClick={() => setFilter('bumpers')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
              filter === 'bumpers'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Mega Bumpers
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
              filter === 'weekly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Weekly Lotteries
          </button>
        </div>

        <span className="text-[11px] text-emerald-400 font-medium hidden sm:block">
          Official Gorky Bhavan Draws
        </span>
      </div>

      {/* Lotteries Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredLotteries.map((lotto) => {
          const isGold = lotto.colorTheme === 'gold';
          const isAmber = lotto.colorTheme === 'amber';
          const isBlue = lotto.colorTheme === 'blue';
          const isPurple = lotto.colorTheme === 'purple';

          return (
            <div
              key={lotto.id}
              id={`lottery-card-${lotto.id}`}
              className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between gap-3 shadow-lg ${
                lotto.isBumper
                  ? 'bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/50 hover:border-amber-400'
                  : 'bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border-emerald-800/60 hover:border-emerald-600'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {lotto.drawCode}
                    </span>
                    {lotto.isBumper && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        BUMPER
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {lotto.name}
                  </h3>
                  <p className="text-xs text-emerald-400/90 font-medium">
                    {lotto.malayalamName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">First Prize</span>
                  <span className="font-mono text-base font-black text-amber-400">
                    {lotto.firstPrizeInr}
                  </span>
                </div>
              </div>

              {/* Tagline & Prize Breakdown */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex flex-col gap-1">
                <div className="text-slate-300 font-medium flex items-center justify-between">
                  <span>2nd Prize:</span>
                  <span className="font-bold text-white">{lotto.secondPrize}</span>
                </div>
                <div className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Consolation:</span>
                  <span className="font-bold text-emerald-300">{lotto.consolationPrize}</span>
                </div>
              </div>

              {/* Live Sales Pool & Odds Preview */}
              <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sales Pool:
                  </span>
                  <span className="font-mono text-white font-bold">
                    {lotto.ticketsSold.toLocaleString('en-IN')} / {lotto.totalTickets.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                    style={{
                      width: `${Math.round((lotto.ticketsSold / lotto.totalTickets) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>1st Prize Odds: 1 in {lotto.ticketsSold.toLocaleString('en-IN')}</span>
                  <a
                    href="#odds-calculator-container"
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                  >
                    <span>Full Odds</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Card Footer: Price & Buy Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Ticket Price</span>
                  <div className="text-sm font-black text-white">
                    ₹{lotto.ticketPriceInr}{' '}
                    <span className="text-xs text-cyan-300 font-normal">({lotto.ticketPriceTon} TON)</span>
                  </div>
                </div>

                <button
                  id={`buy-btn-${lotto.id}`}
                  onClick={() => {
                    triggerHaptic('medium');
                    onSelectLotteryToBuy(lotto);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Buy Ticket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Sales Odds Calculator */}
      <OddsCalculator
        lotteries={lotteries}
        onSelectLotteryToBuy={onSelectLotteryToBuy}
        useMalayalam={useMalayalam}
      />

      {/* Kerala Syndicate / Group Play Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-900/80 border border-emerald-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">
              Kerala Telegram Lottery Syndicate
            </h4>
            <p className="text-xs text-emerald-300/90">
              Pool tickets together with friends on Telegram to increase winning odds 12x!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            if (lotteries[0]) onSelectLotteryToBuy(lotteries[0]);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md whitespace-nowrap"
        >
          Join Syndicate (0.2 TON)
        </button>
      </div>
    </div>
  );
};
