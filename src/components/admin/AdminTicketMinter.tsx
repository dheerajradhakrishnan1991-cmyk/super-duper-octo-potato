import React, { useState } from 'react';
import { KeralaLottery, PurchasedTicket, TelegramWalletState, LotteryTransaction, TabType } from '../../types';
import { TON_INR_RATE } from '../../data/lotteries';
import { triggerHaptic } from '../../utils/haptics';
import { sounds } from '../../utils/audio';
import { downloadTicketPdf } from '../../utils/ticketPdf';
import {
  Ticket,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  Play,
  Download,
  Trash2,
  Trophy,
  Award,
  RefreshCw,
  Plus
} from 'lucide-react';

interface AdminTicketMinterProps {
  lotteries: KeralaLottery[];
  tickets: PurchasedTicket[];
  onUpdateTickets: (updated: PurchasedTicket[]) => void;
  wallet: TelegramWalletState;
  onUpdateWallet: (updater: (prev: TelegramWalletState) => TelegramWalletState) => void;
  onAddTransaction: (tx: LotteryTransaction) => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectTicketForAutomaton?: (ticket: PurchasedTicket) => void;
  notify: (msg: string) => void;
}

export const AdminTicketMinter: React.FC<AdminTicketMinterProps> = ({
  lotteries,
  tickets,
  onUpdateTickets,
  wallet,
  onUpdateWallet,
  onAddTransaction,
  onNavigateTab,
  onSelectTicketForAutomaton,
  notify,
}) => {
  const [isMinterOpen, setIsMinterOpen] = useState<boolean>(true);
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>(lotteries[0]?.id || '');
  const [customSeries, setCustomSeries] = useState<string>('TE');
  const [customDigits, setCustomDigits] = useState<string>('482915');
  const [ticketStatus, setTicketStatus] = useState<'active' | 'won'>('active');
  const [winPrizeTier, setWinPrizeTier] = useState<string>('1st Prize Jackpot');
  const [winPrizeAmountInr, setWinPrizeAmountInr] = useState<number>(10000000);
  const [creditWalletOnMint, setCreditWalletOnMint] = useState<boolean>(true);

  // Minted Ticket Banner State
  const [lastMintedTicket, setLastMintedTicket] = useState<PurchasedTicket | null>(null);

  // Filter & Search
  const [ticketFilter, setTicketFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const targetLottery = lotteries.find((l) => l.id === selectedLotteryId) || lotteries[0];

  const handleRandomizeDigits = () => {
    triggerHaptic('light');
    setCustomDigits(String(Math.floor(100000 + Math.random() * 900000)));
  };

  const handleMintTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSeries.trim() || customDigits.length !== 6) return;

    triggerHaptic('success');
    sounds.playCoinDrop();

    const cleanSeries = customSeries.trim().toUpperCase();
    const cleanDigits = customDigits.trim().replace(/[^0-9]/g, '').padStart(6, '0').slice(0, 6);
    const fullCode = `${cleanSeries} ${cleanDigits}`;
    const barcode = `KL-${targetLottery.drawCode.replace(/[^A-Z0-9]/g, '')}-${cleanSeries}${cleanDigits}`;
    const securityCode = Math.floor(1000 + Math.random() * 9000).toString();
    const txHash = `ton_mint_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newTicket: PurchasedTicket = {
      id: `ticket-admin-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotteryId: targetLottery.id,
      lotteryName: targetLottery.name,
      malayalamName: targetLottery.malayalamName,
      drawCode: targetLottery.drawCode,
      series: cleanSeries,
      ticketNumber: cleanDigits,
      fullCode,
      purchaseDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      purchaseTimestamp: Date.now(),
      pricePaidInr: targetLottery.ticketPriceInr,
      pricePaidTon: targetLottery.ticketPriceTon,
      paymentMethod: 'telegram_wallet',
      transactionHash: txHash,
      drawDate: targetLottery.drawDate,
      drawTimestamp: targetLottery.drawTimestamp,
      status: ticketStatus,
      winPrizeTier: ticketStatus === 'won' ? winPrizeTier : undefined,
      winAmountInr: ticketStatus === 'won' ? winPrizeAmountInr : undefined,
      winAmountTon: ticketStatus === 'won' ? +(winPrizeAmountInr / TON_INR_RATE).toFixed(2) : undefined,
      isClaimed: false,
      isScratched: ticketStatus === 'won',
      barcode,
      securityCode,
    };

    onUpdateTickets([newTicket, ...tickets]);
    setLastMintedTicket(newTicket);

    // If pre-marked as won and credit wallet enabled, payout to wallet
    if (ticketStatus === 'won' && creditWalletOnMint) {
      const payoutTon = +(winPrizeAmountInr / TON_INR_RATE).toFixed(2);
      onUpdateWallet((prev) => ({
        ...prev,
        balanceTon: +(prev.balanceTon + payoutTon).toFixed(2),
        balanceInr: prev.balanceInr + winPrizeAmountInr,
      }));

      const payoutTx: LotteryTransaction = {
        id: `tx-win-${Date.now()}`,
        type: 'win_payout',
        title: `Prize Claim: ${winPrizeTier} (${fullCode})`,
        amountTon: payoutTon,
        amountInr: winPrizeAmountInr,
        timestamp: 'Just now',
        txHash: `ton_payout_${Math.random().toString(36).substring(2, 10)}`,
        status: 'confirmed',
      };
      onAddTransaction(payoutTx);
    }

    notify(`Successfully minted custom ticket ${fullCode} for ${targetLottery.name}!`);
  };

  // Force Simulate Win on existing ticket
  const handleSimulateWinOnTicket = (ticketId: string, tier: '1st' | 'consolation' | 'last4') => {
    triggerHaptic('success');
    sounds.playWinningFanfare();

    let prizeInr = 1000;
    let prizeTier = '₹1,000 Win';

    if (tier === '1st') {
      prizeInr = targetLottery.firstPrizeAmount || 10000000;
      prizeTier = `1st Prize (${targetLottery.firstPrizeInr})`;
    } else if (tier === 'consolation') {
      prizeInr = 100000;
      prizeTier = 'Consolation Prize (₹1,00,000)';
    }

    const prizeTon = +(prizeInr / TON_INR_RATE).toFixed(2);

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'won' as const,
          winPrizeTier: prizeTier,
          winAmountInr: prizeInr,
          winAmountTon: prizeTon,
          isScratched: true,
          isClaimed: true,
        };
      }
      return t;
    });

    onUpdateTickets(updated);

    onUpdateWallet((prev) => ({
      ...prev,
      balanceTon: +(prev.balanceTon + prizeTon).toFixed(2),
      balanceInr: prev.balanceInr + prizeInr,
    }));

    const tx: LotteryTransaction = {
      id: `tx-admin-win-${Date.now()}`,
      type: 'win_payout',
      title: `Admin Force Payout: ${prizeTier}`,
      amountTon: prizeTon,
      amountInr: prizeInr,
      timestamp: 'Just now',
      txHash: `ton_admin_win_${Math.random().toString(36).substring(2, 10)}`,
      status: 'confirmed',
    };
    onAddTransaction(tx);

    notify(`Awarded ${prizeTier} (₹${prizeInr.toLocaleString('en-IN')}) to ticket!`);
  };

  // Reset ticket status
  const handleResetTicketStatus = (ticketId: string) => {
    triggerHaptic('light');
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'active' as const,
          winPrizeTier: undefined,
          winAmountInr: undefined,
          winAmountTon: undefined,
          isClaimed: false,
        };
      }
      return t;
    });
    onUpdateTickets(updated);
    notify('Reset ticket back to Active draw status.');
  };

  // Delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    triggerHaptic('medium');
    const updated = tickets.filter((t) => t.id !== ticketId);
    onUpdateTickets(updated);
    notify('Removed ticket from user collection.');
  };

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter !== 'all' && t.status !== ticketFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.fullCode.toLowerCase().includes(q) ||
        t.lotteryName.toLowerCase().includes(q) ||
        t.barcode.toLowerCase().includes(q) ||
        t.securityCode.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Header & Minter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Custom Ticket Minting Studio & Auditor
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {tickets.length} TICKETS IN SYSTEM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mint custom series & lucky numbers, test instant win payouts, download PDFs, and audit active tickets.
          </p>
        </div>

        <button
          onClick={() => setIsMinterOpen(!isMinterOpen)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{isMinterOpen ? 'Hide Minter' : '+ Mint Custom Ticket'}</span>
        </button>
      </div>

      {/* Mint Custom Ticket Form */}
      {isMinterOpen && (
        <form
          onSubmit={handleMintTicket}
          className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-600/60 shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Mint Custom Kerala Lottery Ticket</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Real-time TON Ledger Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Target Lottery */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Target Lottery:</label>
              <select
                value={selectedLotteryId}
                onChange={(e) => setSelectedLotteryId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold outline-none focus:border-emerald-400"
              >
                {lotteries.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.drawCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Series */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Custom Series Letters:</label>
              <input
                type="text"
                maxLength={3}
                required
                value={customSeries}
                onChange={(e) => setCustomSeries(e.target.value.toUpperCase())}
                placeholder="TE"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black uppercase outline-none focus:border-emerald-400"
              />
            </div>

            {/* Custom 6 Digits */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold">6-Digit Lucky Number:</label>
                <button
                  type="button"
                  onClick={handleRandomizeDigits}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                >
                  🎲 Randomize
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                required
                value={customDigits}
                onChange={(e) => setCustomDigits(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="482915"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black tracking-widest outline-none focus:border-emerald-400"
              />
            </div>

            {/* Initial Status */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Initial Ticket Status:</label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value as 'active' | 'won')}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold outline-none focus:border-emerald-400"
              >
                <option value="active">Active (Ready for Draw Automaton)</option>
                <option value="won">Pre-Minted Winner (Instant Payout)</option>
              </select>
            </div>

            {/* If Won: Prize Tier */}
            {ticketStatus === 'won' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300 font-bold">Prize Tier:</label>
                  <select
                    value={winPrizeTier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      setWinPrizeTier(tier);
                      if (tier === '1st Prize Jackpot') setWinPrizeAmountInr(targetLottery.firstPrizeAmount || 10000000);
                      else if (tier === '2nd Prize') setWinPrizeAmountInr(1000000);
                      else if (tier === 'Consolation Prize') setWinPrizeAmountInr(100000);
                      else if (tier === '₹1,000 Win') setWinPrizeAmountInr(1000);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold outline-none focus:border-emerald-400"
                  >
                    <option value="1st Prize Jackpot">1st Prize Jackpot ({targetLottery.firstPrizeInr})</option>
                    <option value="2nd Prize">2nd Prize (₹10 Lakhs - ₹1 Cr)</option>
                    <option value="Consolation Prize">Consolation Prize (₹1,00,000)</option>
                    <option value="₹1,000 Win">₹1,000 Instant Win</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-300 font-bold">Prize Amount (₹):</label>
                  <input
                    type="number"
                    min="100"
                    value={winPrizeAmountInr}
                    onChange={(e) => setWinPrizeAmountInr(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Mint Ticket Code:</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-400 font-mono font-black text-sm">
                {customSeries || '??'} {customDigits || '??????'}
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Mint Official Custom Ticket</span>
            </button>
          </div>
        </form>
      )}

      {/* Immediate Links Banner for Newly Minted Ticket */}
      {lastMintedTicket && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Custom Ticket Minted Successfully!
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500 text-slate-950">
                  {lastMintedTicket.fullCode}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Scheme: {lastMintedTicket.lotteryName} • Security PIN: {lastMintedTicket.securityCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View in My Tickets Link */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigateTab('my_tickets');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View in My Tickets</span>
            </button>

            {/* Load in Automaton Link */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                if (onSelectTicketForAutomaton) {
                  onSelectTicketForAutomaton(lastMintedTicket);
                } else {
                  onNavigateTab('automaton');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load in Automaton</span>
            </button>

            {/* Download Ticket PDF Link */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                downloadTicketPdf(lastMintedTicket, wallet.username || wallet.shortAddress);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Ticket Auditor Controls & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Tickets Auditor & Overrides ({filteredTickets.length})
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, barcode..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 w-44"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              {(['all', 'active', 'won', 'lost'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    ticketFilter === filter ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex flex-col gap-2.5">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
              No tickets matching criteria.
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-700/40 text-emerald-300 font-mono font-black text-sm">
                      {t.fullCode}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{t.lotteryName}</span>
                        <span className="text-[10px] text-amber-400 font-mono">({t.drawCode})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        PIN: {t.securityCode} • Barcode: {t.barcode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                        t.status === 'won'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : t.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>

                    {t.winAmountInr && (
                      <span className="font-mono text-xs font-bold text-amber-400">
                        ₹{t.winAmountInr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Actions Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tx: {t.transactionHash.slice(0, 16)}...
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Load in Automaton */}
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        if (onSelectTicketForAutomaton) {
                          onSelectTicketForAutomaton(t);
                        } else {
                          onNavigateTab('automaton');
                        }
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-amber-400 fill-current" />
                      <span>Automaton</span>
                    </button>

                    {/* Download PDF */}
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        downloadTicketPdf(t, wallet.username || wallet.shortAddress);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>PDF</span>
                    </button>

                    {/* Force Win Overrides */}
                    <button
                      onClick={() => handleSimulateWinOnTicket(t.id, '1st')}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                    >
                      Force 1st Prize
                    </button>
                    <button
                      onClick={() => handleSimulateWinOnTicket(t.id, 'consolation')}
                      className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold cursor-pointer"
                    >
                      Consolation
                    </button>
                    <button
                      onClick={() => handleSimulateWinOnTicket(t.id, 'last4')}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                    >
                      ₹1k Win
                    </button>

                    {t.status === 'won' && (
                      <button
                        onClick={() => handleResetTicketStatus(t.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-medium cursor-pointer"
                      >
                        Reset Active
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
