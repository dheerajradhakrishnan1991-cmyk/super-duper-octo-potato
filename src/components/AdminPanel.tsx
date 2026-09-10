import React, { useState, useEffect } from 'react';
import { KeralaLottery, PurchasedTicket, LotteryTransaction, TelegramWalletState, OfficialDrawResult, TabType } from '../types';
import { TON_INR_RATE } from '../data/lotteries';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/audio';
import { AdminLotteryStudio } from './admin/AdminLotteryStudio';
import { AdminTicketMinter } from './admin/AdminTicketMinter';
import { AdminDrawConductor } from './admin/AdminDrawConductor';
import { AdminAutomatonControl } from './admin/AdminAutomatonControl';
import { AdminTreasuryVault } from './admin/AdminTreasuryVault';
import {
  ShieldAlert,
  Layers,
  Ticket,
  Radio,
  Target,
  Wallet,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users,
  Coins,
  Play
} from 'lucide-react';

export type AdminSubTab = 'overview' | 'lotteries' | 'tickets' | 'draws' | 'automaton' | 'treasury';

export interface AdminPanelProps {
  lotteries: KeralaLottery[];
  onUpdateLotteries: (updated: KeralaLottery[]) => void;
  tickets: PurchasedTicket[];
  onUpdateTickets: (updated: PurchasedTicket[]) => void;
  transactions: LotteryTransaction[];
  onAddTransaction: (tx: LotteryTransaction) => void;
  wallet: TelegramWalletState;
  onUpdateWallet: (updater: (prev: TelegramWalletState) => TelegramWalletState) => void;
  officialResults: OfficialDrawResult[];
  onPublishResult: (result: OfficialDrawResult) => void;
  onDeleteResult?: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
  initialSubTab?: AdminSubTab;
  onSelectTicketForAutomaton?: (ticket: PurchasedTicket) => void;
  onOpenBuyModalForLottery?: (lottery: KeralaLottery) => void;
  onSetAutomatonTarget?: (target: { series: string; number: string; lotteryId?: string } | null) => void;
  automatonTarget?: { series: string; number: string; lotteryId?: string } | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lotteries,
  onUpdateLotteries,
  tickets,
  onUpdateTickets,
  transactions,
  onAddTransaction,
  wallet,
  onUpdateWallet,
  officialResults,
  onPublishResult,
  onDeleteResult,
  onNavigateTab,
  initialSubTab = 'overview',
  onSelectTicketForAutomaton,
  onOpenBuyModalForLottery,
  onSetAutomatonTarget,
  automatonTarget,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);
  const [notification, setNotification] = useState<string | null>(null);
  const [preSelectedDrawLotteryId, setPreSelectedDrawLotteryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick Action Hub Handlers
  const handleQuickAction = (subTab: AdminSubTab) => {
    triggerHaptic('light');
    setActiveSubTab(subTab);
  };

  // Simulation helpers for Overview tab
  const handleSimulateMarketRush = () => {
    triggerHaptic('success');
    sounds.playCoinDrop();
    const updated = lotteries.map((l) => ({
      ...l,
      ticketsSold: Math.min(l.totalTickets, l.ticketsSold + Math.floor(1500 + Math.random() * 2500)),
    }));
    onUpdateLotteries(updated);
    notify('Simulated state-wide lottery ticket rush (+2,000 avg tickets sold across all schemes)');
  };

  const handleSimulateWinTicket = () => {
    const active = tickets.find((t) => t.status === 'active');
    if (!active) {
      notify('No active ticket found. Mint a custom ticket first!');
      return;
    }
    triggerHaptic('success');
    sounds.playWinningFanfare();

    const winAmount = 100000;
    const winTon = +(winAmount / TON_INR_RATE).toFixed(2);

    const updated = tickets.map((t) => {
      if (t.id === active.id) {
        return {
          ...t,
          status: 'won' as const,
          winPrizeTier: 'Consolation Prize (₹1,00,000)',
          winAmountInr: winAmount,
          winAmountTon: winTon,
          isScratched: true,
          isClaimed: true,
        };
      }
      return t;
    });
    onUpdateTickets(updated);

    onUpdateWallet((prev) => ({
      ...prev,
      balanceTon: +(prev.balanceTon + winTon).toFixed(2),
      balanceInr: prev.balanceInr + winAmount,
    }));

    const tx: LotteryTransaction = {
      id: `tx-win-${Date.now()}`,
      type: 'win_payout',
      title: `Prize Claim: Consolation Win (${active.fullCode})`,
      amountTon: winTon,
      amountInr: winAmount,
      timestamp: 'Just now',
      txHash: `ton_payout_${Math.random().toString(36).substring(2, 10)}`,
      status: 'confirmed',
    };
    onAddTransaction(tx);

    notify(`Awarded Consolation Prize of ₹1,00,000 to ticket ${active.fullCode}!`);
  };

  // Metrics
  const totalTicketsIssued = lotteries.reduce((acc, l) => acc + l.ticketsSold, 0);
  const totalGrossRevenueInr = lotteries.reduce((acc, l) => acc + l.ticketsSold * l.ticketPriceInr, 0);
  const totalUserTickets = tickets.length;
  const totalWinningTickets = tickets.filter((t) => t.status === 'won').length;

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto pb-12">
      {/* Top Directorate Master Control Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-emerald-500/15 border-2 border-amber-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Directorate Master Administration
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase font-mono">
                ROOT PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Full control suite: Create custom lotteries, mint tickets, conduct gazette draws & rig automaton.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Wallet: </span>
            <span className="text-emerald-400 font-bold">💎 {wallet.balanceTon.toFixed(2)} TON</span>
          </div>

          <button
            onClick={() => onNavigateTab('lotteries')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Exit to App
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Create All Custom Hub */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Custom Creation Hub:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Control</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <button
            id="admin-quick-custom-lottery-btn"
            onClick={() => handleQuickAction('lotteries')}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
              activeSubTab === 'lotteries'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">+ Custom Lottery</span>
          </button>

          <button
            id="admin-quick-mint-ticket-btn"
            onClick={() => handleQuickAction('tickets')}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
              activeSubTab === 'tickets'
                ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">+ Mint Ticket</span>
          </button>

          <button
            id="admin-quick-conduct-draw-btn"
            onClick={() => handleQuickAction('draws')}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
              activeSubTab === 'draws'
                ? 'bg-rose-600 text-white border-rose-500 font-black shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span className="text-[11px]">+ Gazette Draw</span>
          </button>

          <button
            id="admin-quick-rig-automaton-btn"
            onClick={() => handleQuickAction('automaton')}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
              activeSubTab === 'automaton'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">+ Rig Automaton</span>
          </button>

          <button
            id="admin-quick-airdrop-btn"
            onClick={() => handleQuickAction('treasury')}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeSubTab === 'treasury'
                ? 'bg-cyan-600 text-white border-cyan-500 font-black shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px]">+ TON Airdrop</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 no-scrollbar">
        {[
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'lotteries' as const, label: 'Custom Lotteries', icon: Layers, badge: `${lotteries.length}` },
          { id: 'tickets' as const, label: 'Custom Tickets', icon: Ticket, badge: `${tickets.length}` },
          { id: 'draws' as const, label: 'Gazette Draws', icon: Radio, badge: `${officialResults.length}` },
          { id: 'automaton' as const, label: 'Automaton Target', icon: Target, badge: automatonTarget ? 'LOCKED' : undefined },
          { id: 'treasury' as const, label: 'Treasury & Wallet', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveSubTab(tab.id);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: OVERVIEW ===================== */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total System Revenue</span>
              <div className="text-lg font-black text-amber-400 font-mono mt-1">
                ₹{(totalGrossRevenueInr / 10000000).toFixed(2)} Cr
              </div>
              <span className="text-[10px] text-slate-500">Gross ticket volume</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Tickets Sold</span>
              <div className="text-lg font-black text-white font-mono mt-1">
                {totalTicketsIssued.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400">Live ledger pool</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Active Schemes</span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {lotteries.length} Lotteries
              </div>
              <span className="text-[10px] text-slate-500">
                {lotteries.filter((l) => l.isBumper).length} Bumpers
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Player Collection</span>
              <div className="text-lg font-black text-cyan-400 font-mono mt-1">
                {totalUserTickets} Tickets
              </div>
              <span className="text-[10px] text-amber-400">
                {totalWinningTickets} Won ({Math.round((totalWinningTickets / (totalUserTickets || 1)) * 100)}%)
              </span>
            </div>
          </div>

          {/* Real-time Simulators Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Live State Simulation Engines
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Deterministic Triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="font-bold text-xs text-white">Simulate Market Ticket Rush</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Inject +2,000 avg tickets sold across all active schemes.
                  </p>
                </div>
                <button
                  onClick={handleSimulateMarketRush}
                  className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  ⚡ Trigger Rush (+2k)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="font-bold text-xs text-white">Trigger User Consolation Win</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Award ₹1,00,000 + TON payout to first active user ticket.
                  </p>
                </div>
                <button
                  onClick={handleSimulateWinTicket}
                  className="w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  🏆 Force Win (₹1 Lakh)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="font-bold text-xs text-white">Airdrop +50 TON Faucet</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Credit +50 TON (₹22,500) into player wallet immediately.
                  </p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('success');
                    sounds.playCoinDrop();
                    onUpdateWallet((prev) => ({
                      ...prev,
                      balanceTon: +(prev.balanceTon + 50).toFixed(2),
                      balanceInr: prev.balanceInr + 22500,
                    }));
                    notify('Airdropped +50 TON to connected wallet!');
                  }}
                  className="w-full py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  💎 Inject +50 TON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CUSTOM LOTTERIES ===================== */}
      {activeSubTab === 'lotteries' && (
        <AdminLotteryStudio
          lotteries={lotteries}
          onUpdateLotteries={onUpdateLotteries}
          onNavigateTab={onNavigateTab}
          onOpenBuyModalForLottery={onOpenBuyModalForLottery}
          onSelectForDraw={(lotteryId) => {
            setPreSelectedDrawLotteryId(lotteryId);
            setActiveSubTab('draws');
          }}
          notify={notify}
        />
      )}

      {/* ===================== TAB 3: CUSTOM TICKETS ===================== */}
      {activeSubTab === 'tickets' && (
        <AdminTicketMinter
          lotteries={lotteries}
          tickets={tickets}
          onUpdateTickets={onUpdateTickets}
          wallet={wallet}
          onUpdateWallet={onUpdateWallet}
          onAddTransaction={onAddTransaction}
          onNavigateTab={onNavigateTab}
          onSelectTicketForAutomaton={onSelectTicketForAutomaton}
          notify={notify}
        />
      )}

      {/* ===================== TAB 4: GAZETTE DRAWS ===================== */}
      {activeSubTab === 'draws' && (
        <AdminDrawConductor
          lotteries={lotteries}
          onUpdateLotteries={onUpdateLotteries}
          tickets={tickets}
          onUpdateTickets={onUpdateTickets}
          wallet={wallet}
          onUpdateWallet={onUpdateWallet}
          onAddTransaction={onAddTransaction}
          officialResults={officialResults}
          onPublishResult={onPublishResult}
          onDeleteResult={onDeleteResult}
          onNavigateTab={onNavigateTab}
          notify={notify}
          preSelectedLotteryId={preSelectedDrawLotteryId}
        />
      )}

      {/* ===================== TAB 5: AUTOMATON CONTROL ===================== */}
      {activeSubTab === 'automaton' && (
        <AdminAutomatonControl
          lotteries={lotteries}
          tickets={tickets}
          automatonTarget={automatonTarget}
          onSetAutomatonTarget={onSetAutomatonTarget}
          onNavigateTab={() => onNavigateTab('automaton')}
          notify={notify}
        />
      )}

      {/* ===================== TAB 6: TREASURY & VAULT ===================== */}
      {activeSubTab === 'treasury' && (
        <AdminTreasuryVault
          wallet={wallet}
          onUpdateWallet={onUpdateWallet}
          transactions={transactions}
          onAddTransaction={onAddTransaction}
          notify={notify}
        />
      )}
    </div>
  );
};
