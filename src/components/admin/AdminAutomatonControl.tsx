import React, { useState } from 'react';
import { KeralaLottery, PurchasedTicket } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { sounds } from '../../utils/audio';
import { Radio, Target, Sparkles, CheckCircle2, Play, Lock, Unlock, RefreshCw, Ticket } from 'lucide-react';

interface AdminAutomatonControlProps {
  lotteries: KeralaLottery[];
  tickets: PurchasedTicket[];
  automatonTarget?: { series: string; number: string; lotteryId?: string } | null;
  onSetAutomatonTarget?: (target: { series: string; number: string; lotteryId?: string } | null) => void;
  onNavigateTab: (tab: 'automaton') => void;
  notify: (msg: string) => void;
}

export const AdminAutomatonControl: React.FC<AdminAutomatonControlProps> = ({
  lotteries,
  tickets,
  automatonTarget,
  onSetAutomatonTarget,
  onNavigateTab,
  notify,
}) => {
  const [targetLotteryId, setTargetLotteryId] = useState<string>(lotteries[0]?.id || '');
  const [targetSeries, setTargetSeries] = useState<string>(automatonTarget?.series || 'WA');
  const [targetNumber, setTargetNumber] = useState<string>(automatonTarget?.number || '482915');

  const selectedLottery = lotteries.find((l) => l.id === targetLotteryId) || lotteries[0];

  const handleApplyTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSeries.trim() || targetNumber.length !== 6) return;

    triggerHaptic('success');
    sounds.playCoinDrop();

    const cleanSeries = targetSeries.trim().toUpperCase();
    const cleanNumber = targetNumber.trim().replace(/[^0-9]/g, '').padStart(6, '0').slice(0, 6);

    onSetAutomatonTarget?.({
      series: cleanSeries,
      number: cleanNumber,
      lotteryId: targetLotteryId,
    });

    notify(`Automaton Target Locked: ${cleanSeries} ${cleanNumber}! Next spin will hit this outcome.`);
  };

  const handleClearTarget = () => {
    triggerHaptic('light');
    onSetAutomatonTarget?.(null);
    notify('Cleared Automaton target. Live machine returned to true random state.');
  };

  const handleMatchUserTicket = (ticket: PurchasedTicket) => {
    triggerHaptic('medium');
    sounds.playCoinDrop();
    setTargetSeries(ticket.series);
    setTargetNumber(ticket.ticketNumber);
    setTargetLotteryId(ticket.lotteryId);

    onSetAutomatonTarget?.({
      series: ticket.series,
      number: ticket.ticketNumber,
      lotteryId: ticket.lotteryId,
    });

    notify(`Target locked to match ticket ${ticket.fullCode} (Guaranteed Jackpot Win)!`);
  };

  const activeTickets = tickets.filter((t) => t.status === 'active');

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Target Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        automatonTarget
          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            automatonTarget ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
          }`}>
            {automatonTarget ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Mechanical Automaton Outcome Control
              </span>
              <span className={`px-2 py-0.2 text-[9px] font-black rounded-full uppercase ${
                automatonTarget ? 'bg-amber-500 text-slate-950' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {automatonTarget ? 'TARGET LOCKED' : 'PURE RANDOM'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {automatonTarget
                ? `Active Target: [ ${automatonTarget.series} ${automatonTarget.number} ] on next spin`
                : 'Drums currently spin with randomized cryptographic entropy.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {automatonTarget && (
            <button
              onClick={handleClearTarget}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              Clear Target
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('medium');
              onNavigateTab('automaton');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live Automaton</span>
          </button>
        </div>
      </div>

      {/* Target Setter Form */}
      <form onSubmit={handleApplyTarget} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Set Custom Drum Winning Target
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Drums 1–7 Override</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Target Lottery */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-bold">Target Lottery Scheme:</label>
            <select
              value={targetLotteryId}
              onChange={(e) => setTargetLotteryId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
            >
              {lotteries.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.drawCode})
                </option>
              ))}
            </select>
          </div>

          {/* Target Series */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-bold">Winning Series (Drum 1):</label>
            <input
              type="text"
              maxLength={2}
              required
              value={targetSeries}
              onChange={(e) => setTargetSeries(e.target.value.toUpperCase())}
              placeholder="WA"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black uppercase outline-none focus:border-amber-400"
            />
          </div>

          {/* Target 6 Digits */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold">6-Digit Lucky Number:</label>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setTargetNumber(String(Math.floor(100000 + Math.random() * 900000)));
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                🎲 Randomize
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              required
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="482915"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-black tracking-widest outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Preview and Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Winning Outcome:</span>
            <div className="px-3 py-1 rounded-lg bg-slate-950 border border-amber-500/50 text-amber-400 font-mono font-black text-sm flex items-center gap-1.5">
              <span>{targetSeries || '??'}</span>
              <span>{targetNumber || '??????'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Target for Next Spin</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Match User Tickets Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              1-Click Guarantee: Match Active User Ticket
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{activeTickets.length} active tickets available</span>
        </div>
        <p className="text-xs text-slate-400">
          Click any active purchased ticket below to instantly rig the 6-drum automaton to land on that exact ticket and trigger a Jackpot payout with confetti!
        </p>

        {activeTickets.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            No active user tickets currently held. Mint a custom ticket first or purchase one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {activeTickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleMatchUserTicket(t)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-left transition-all flex items-center justify-between gap-2 group cursor-pointer"
              >
                <div>
                  <div className="font-mono font-black text-xs text-amber-400 group-hover:text-amber-300">
                    {t.fullCode}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {t.lotteryName} ({t.drawCode})
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[10px] font-bold group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-transparent transition-colors">
                  Rig & Win
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
