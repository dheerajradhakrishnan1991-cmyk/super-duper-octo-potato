import React, { useState } from 'react';
import { KeralaLottery, OfficialDrawResult, PurchasedTicket, TelegramWalletState, LotteryTransaction, TabType } from '../../types';
import { TON_INR_RATE } from '../../data/lotteries';
import { triggerHaptic } from '../../utils/haptics';
import { sounds } from '../../utils/audio';
import { Radio, Sparkles, Trophy, CheckCircle2, ExternalLink, Play, Trash2, Award, Calendar, MapPin } from 'lucide-react';

interface AdminDrawConductorProps {
  lotteries: KeralaLottery[];
  onUpdateLotteries: (updated: KeralaLottery[]) => void;
  tickets: PurchasedTicket[];
  onUpdateTickets: (updated: PurchasedTicket[]) => void;
  wallet: TelegramWalletState;
  onUpdateWallet: (updater: (prev: TelegramWalletState) => TelegramWalletState) => void;
  onAddTransaction: (tx: LotteryTransaction) => void;
  officialResults: OfficialDrawResult[];
  onPublishResult: (result: OfficialDrawResult) => void;
  onDeleteResult?: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
  notify: (msg: string) => void;
  preSelectedLotteryId?: string;
}

export const AdminDrawConductor: React.FC<AdminDrawConductorProps> = ({
  lotteries,
  onUpdateLotteries,
  tickets,
  onUpdateTickets,
  wallet,
  onUpdateWallet,
  onAddTransaction,
  officialResults,
  onPublishResult,
  onDeleteResult,
  onNavigateTab,
  notify,
  preSelectedLotteryId,
}) => {
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>(preSelectedLotteryId || lotteries[0]?.id || '');
  const [firstPrizeSeries, setFirstPrizeSeries] = useState<string>('WA');
  const [firstPrizeNumber, setFirstPrizeNumber] = useState<string>('482915');
  const [venue, setVenue] = useState<string>('Gorky Bhavan, Thiruvananthapuram');
  const [autoPayoutMatching, setAutoPayoutMatching] = useState<boolean>(true);

  const selectedLottery = lotteries.find((l) => l.id === selectedLotteryId) || lotteries[0];

  const handleRandomizeFirstPrize = () => {
    triggerHaptic('light');
    const seriesPool = selectedLottery.seriesAvailable.length > 0 ? selectedLottery.seriesAvailable : ['WA', 'WB', 'WC', 'WD', 'WE'];
    const randSeries = seriesPool[Math.floor(Math.random() * seriesPool.length)];
    const randNum = String(Math.floor(100000 + Math.random() * 900000));
    setFirstPrizeSeries(randSeries);
    setFirstPrizeNumber(randNum);
  };

  const handlePublishGazette = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstPrizeSeries.trim() || firstPrizeNumber.length !== 6) return;

    triggerHaptic('success');
    sounds.playWinningFanfare();

    const cleanSeries = firstPrizeSeries.trim().toUpperCase();
    const cleanNumber = firstPrizeNumber.trim().replace(/[^0-9]/g, '').padStart(6, '0').slice(0, 6);
    const fullCode = `${cleanSeries} ${cleanNumber}`;

    // Auto-generate consolation numbers
    const seriesPool = selectedLottery.seriesAvailable.length > 0 ? selectedLottery.seriesAvailable : ['WA', 'WB', 'WC', 'WD', 'WE', 'WG', 'WH'];
    const consolationPrizes = seriesPool
      .filter((s) => s !== cleanSeries)
      .slice(0, 8)
      .map((s) => `${s} ${cleanNumber}`);

    // Generate 2nd & 3rd prizes
    const secondPrizeNums = Array.from({ length: 3 }, () => String(Math.floor(100000 + Math.random() * 900000)));
    const thirdPrizeNums = Array.from({ length: 4 }, () => String(Math.floor(100000 + Math.random() * 900000)));
    const last4Nums = Array.from({ length: 10 }, () => String(Math.floor(1000 + Math.random() * 9000)));

    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newResult: OfficialDrawResult = {
      id: `res-${selectedLottery.drawCode}-${Date.now()}`,
      lotteryId: selectedLottery.id,
      lotteryName: selectedLottery.name,
      malayalamName: selectedLottery.malayalamName,
      drawCode: selectedLottery.drawCode,
      drawDate: nowStr,
      venue,
      firstPrize: {
        series: cleanSeries,
        number: cleanNumber,
        fullCode,
        amount: selectedLottery.firstPrizeInr,
      },
      consolationPrizes,
      secondPrize: {
        numbers: secondPrizeNums,
        amount: selectedLottery.secondPrize,
      },
      thirdPrize: {
        numbers: thirdPrizeNums,
        amount: selectedLottery.thirdPrize,
      },
      lastFourDigits: last4Nums,
    };

    onPublishResult(newResult);

    // Update lottery status to 'drawn'
    const updatedLotteries = lotteries.map((l) => {
      if (l.id === selectedLottery.id) {
        return { ...l, drawStatus: 'drawn' as const };
      }
      return l;
    });
    onUpdateLotteries(updatedLotteries);

    // Scan user tickets if auto payout is checked
    if (autoPayoutMatching) {
      let matchingCount = 0;
      let totalPayoutInr = 0;

      const updatedTickets = tickets.map((t) => {
        if (t.status === 'active' && t.lotteryId === selectedLottery.id) {
          // Check 1st Prize
          if (t.series === cleanSeries && t.ticketNumber === cleanNumber) {
            matchingCount++;
            const winInr = selectedLottery.firstPrizeAmount || 10000000;
            totalPayoutInr += winInr;
            return {
              ...t,
              status: 'won' as const,
              winPrizeTier: `1st Prize Jackpot (${selectedLottery.firstPrizeInr})`,
              winAmountInr: winInr,
              winAmountTon: +(winInr / TON_INR_RATE).toFixed(2),
              isScratched: true,
              isClaimed: true,
            };
          }
          // Check Consolation
          if (t.ticketNumber === cleanNumber) {
            matchingCount++;
            const winInr = 100000;
            totalPayoutInr += winInr;
            return {
              ...t,
              status: 'won' as const,
              winPrizeTier: 'Consolation Prize (₹1,00,000)',
              winAmountInr: winInr,
              winAmountTon: +(winInr / TON_INR_RATE).toFixed(2),
              isScratched: true,
              isClaimed: true,
            };
          }
          // Check Last 4 digits
          const last4 = t.ticketNumber.slice(-4);
          if (last4Nums.includes(last4)) {
            matchingCount++;
            const winInr = 1000;
            totalPayoutInr += winInr;
            return {
              ...t,
              status: 'won' as const,
              winPrizeTier: '4th Prize Last 4 Digits (₹1,000)',
              winAmountInr: winInr,
              winAmountTon: +(winInr / TON_INR_RATE).toFixed(2),
              isScratched: true,
              isClaimed: true,
            };
          }
        }
        return t;
      });

      if (matchingCount > 0) {
        onUpdateTickets(updatedTickets);
        const payoutTon = +(totalPayoutInr / TON_INR_RATE).toFixed(2);
        onUpdateWallet((prev) => ({
          ...prev,
          balanceTon: +(prev.balanceTon + payoutTon).toFixed(2),
          balanceInr: prev.balanceInr + totalPayoutInr,
        }));

        const payoutTx: LotteryTransaction = {
          id: `tx-gazette-payout-${Date.now()}`,
          type: 'win_payout',
          title: `Gazette Payout: ${matchingCount} winning tickets in ${selectedLottery.name}`,
          amountTon: payoutTon,
          amountInr: totalPayoutInr,
          timestamp: 'Just now',
          txHash: `ton_gazette_${Math.random().toString(36).substring(2, 10)}`,
          status: 'confirmed',
        };
        onAddTransaction(payoutTx);

        notify(`Published Gazette! Matched ${matchingCount} user tickets with total payout of ₹${totalPayoutInr.toLocaleString('en-IN')}`);
      } else {
        notify(`Published Gazette Draw for ${selectedLottery.name}! Winning code: ${fullCode}`);
      }
    } else {
      notify(`Published Gazette Draw for ${selectedLottery.name}! Winning code: ${fullCode}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Conductor Form */}
      <form
        onSubmit={handlePublishGazette}
        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Conduct Official Gazette Draw & Publish
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            DIRECTORATE ORACLE V2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Target Lottery */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-bold">Select Lottery Scheme:</label>
            <select
              value={selectedLotteryId}
              onChange={(e) => setSelectedLotteryId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
            >
              {lotteries.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.drawCode}) - 1st: {l.firstPrizeInr}
                </option>
              ))}
            </select>
          </div>

          {/* 1st Prize Series */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-bold">1st Prize Series (Drum 1):</label>
            <input
              type="text"
              maxLength={3}
              required
              value={firstPrizeSeries}
              onChange={(e) => setFirstPrizeSeries(e.target.value.toUpperCase())}
              placeholder="WA"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black uppercase outline-none focus:border-amber-400"
            />
          </div>

          {/* 1st Prize 6 Digits */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold">1st Prize Number (Drums 2–7):</label>
              <button
                type="button"
                onClick={handleRandomizeFirstPrize}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                🎲 Randomize
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              required
              value={firstPrizeNumber}
              onChange={(e) => setFirstPrizeNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="482915"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-black tracking-widest outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Venue & Auto Payout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-bold">Draw Hall Venue:</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPayoutMatching}
                onChange={(e) => setAutoPayoutMatching(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Auto-scan and immediately credit all matching user tickets</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Winning Gazette Code:</span>
            <div className="px-3 py-1 rounded-lg bg-slate-950 border border-rose-500/50 text-amber-400 font-mono font-black text-sm">
              {firstPrizeSeries || '??'} {firstPrizeNumber || '??????'}
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>🚀 Publish Gazette & Execute Payouts</span>
          </button>
        </div>
      </form>

      {/* Published Official Results Archive */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            Official Gazette Archive ({officialResults.length} Results)
          </h3>

          <button
            onClick={() => onNavigateTab('results')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>View in Public Archive Tab</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          {officialResults.map((res, idx) => (
            <div
              key={res.id || idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{res.lotteryName}</span>
                  <span className="font-mono text-[10px] text-amber-400">({res.drawCode})</span>
                  <span className="text-[10px] text-slate-500 font-mono">• {res.drawDate}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400">1st Prize:</span>
                  <span className="font-mono font-black text-emerald-400 text-xs">
                    {res.firstPrize.fullCode}
                  </span>
                  <span className="text-amber-400 font-bold">({res.firstPrize.amount})</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigateTab('automaton')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-amber-400 fill-current" />
                  <span>Automaton</span>
                </button>

                {onDeleteResult && res.id && (
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      onDeleteResult(res.id!);
                      notify(`Revoked gazette draw result ${res.drawCode}`);
                    }}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                    title="Revoke gazette result"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
