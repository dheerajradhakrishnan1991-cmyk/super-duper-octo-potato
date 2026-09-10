import React, { useState } from 'react';
import { TelegramWalletState, LotteryTransaction, PurchasedTicket } from '../types';
import { triggerHaptic, copyToClipboard } from '../utils/haptics';
import { sounds } from '../utils/audio';
import { WinningTrendsChart } from './WinningTrendsChart';
import {
  Wallet,
  Coins,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Trophy,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ShieldCheck,
  Check,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface WalletTabProps {
  wallet: TelegramWalletState;
  transactions: LotteryTransaction[];
  tickets: PurchasedTicket[];
  onOpenWalletModal: () => void;
  onAddFaucet: (amountTon: number) => void;
  onResetData: () => void;
  onNavigateToAutomaton?: () => void;
  onNavigateToAdmin?: () => void;
  lowBalanceThreshold?: number;
  useMalayalam?: boolean;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  wallet,
  transactions,
  tickets,
  onOpenWalletModal,
  onAddFaucet,
  onResetData,
  onNavigateToAutomaton,
  onNavigateToAdmin,
  lowBalanceThreshold = 1.0,
  useMalayalam = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const isLowBalance =
    wallet.isConnected && wallet.balanceTon < lowBalanceThreshold;

  const handleCopy = async () => {
    triggerHaptic('light');
    const success = await copyToClipboard(wallet.address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTopup = (amount: number) => {
    setIsAdding(true);
    triggerHaptic('success');
    sounds.playCoinDrop();
    setTimeout(() => {
      onAddFaucet(amount);
      setIsAdding(false);
    }, 400);
  };

  const totalWon = tickets.reduce((acc, t) => acc + (t.winAmountInr || 0), 0);
  const totalSpent = tickets.reduce((acc, t) => acc + t.pricePaidInr, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Low TON Balance Alert Banner */}
      {isLowBalance && (
        <div
          id="wallet-low-balance-alert-banner"
          className="rounded-2xl p-3.5 bg-rose-950/80 border-2 border-rose-500/60 shadow-xl shadow-rose-950/50 flex items-start gap-3 text-rose-200 animate-fadeIn"
        >
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>{useMalayalam ? 'കുറഞ്ഞ ടി.ഒ.എൻ ബാലൻസ് മുന്നറിയിപ്പ്' : 'Low TON Balance Alert'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500/40 text-rose-200 border border-rose-400">
                  {wallet.balanceTon.toFixed(2)} TON &lt; {lowBalanceThreshold.toFixed(1)} TON
                </span>
              </span>
            </div>
            <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
              {useMalayalam
                ? `നിങ്ങളുടെ ടി.ഒ.എൻ വാലറ്റ് ബാലൻസ് ${lowBalanceThreshold.toFixed(1)} TON-ൽ താഴെയാണ്. ടിക്കറ്റുകൾ വാങ്ങുന്നതിനും ഡ്രോകളിലെ സ്വയംപ്രേരിത വിതരണത്തിനും താഴെയുള്ള എയർഡ്രോപ്പ് വഴി റീഫിൽ ചെയ്യുക.`
                : `Your TON wallet balance is currently below the ${lowBalanceThreshold.toFixed(1)} TON threshold. Quick top up using the instant faucet below to ensure uninterrupted ticket purchases.`}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                id="low-balance-faucet-5-btn"
                onClick={() => handleTopup(5.0)}
                disabled={isAdding}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-300" />
                <span>+5 TON Quick Refill (₹2,250)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-900 border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/40 relative overflow-hidden">
        {/* Shimmer Light */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
              💎
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{wallet.username}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/30 text-cyan-300 font-bold">
                  {wallet.network.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] text-emerald-300">Telegram Web3 Identity</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : wallet.shortAddress}</span>
          </button>
        </div>

        {/* TON and INR Balances */}
        <div className="flex flex-col gap-1 my-2">
          <span className="text-xs text-slate-400">Available Balance</span>
          <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-2">
            <span>💎 {wallet.balanceTon.toFixed(2)}</span>
            <span className="text-sm font-bold text-cyan-400">TON</span>
          </div>
          <div className="text-sm text-emerald-400 font-extrabold">
            ≈ ₹{wallet.balanceInr.toLocaleString('en-IN')} INR
            <span className="text-xs text-slate-400 font-normal ml-1.5">(1 TON = ₹450)</span>
          </div>
        </div>

        {/* Quick Faucet Actions */}
        <div className="mt-4 pt-3 border-t border-emerald-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <span className="text-xs text-slate-300 flex items-center gap-1">
            <Coins className="w-4 h-4 text-amber-400" />
            AirDrop Test TON:
          </span>

          <div className="flex items-center gap-2">
            <button
              id="wallet-add-5-ton"
              onClick={() => handleTopup(5.0)}
              disabled={isAdding}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95"
            >
              +5 TON (₹2,250)
            </button>
            <button
              id="wallet-add-20-ton"
              onClick={() => handleTopup(20.0)}
              disabled={isAdding}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95"
            >
              +20 TON (₹9,000)
            </button>
          </div>
        </div>
      </div>

      {/* Lottery Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Total Tickets Bought
          </span>
          <div className="mt-2 text-2xl font-black text-white">{tickets.length} Tickets</div>
          <span className="text-[11px] text-slate-400">Total Spent: ₹{totalSpent}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40 flex flex-col justify-between">
          <span className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Automaton Wins
          </span>
          <div className="mt-2 text-2xl font-black text-amber-400">
            ₹{totalWon.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-300">
            Auto-credited to TON Address
          </span>
        </div>
      </div>

      {/* Winning Trends Analytics Chart */}
      <WinningTrendsChart
        transactions={transactions}
        onNavigateToAutomaton={onNavigateToAutomaton}
      />

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <span>Transactions & Proofs</span>
          <span className="text-emerald-400">{transactions.length} Activity Logs</span>
        </div>

        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'win_payout'
                      ? 'bg-amber-500/20 text-amber-400'
                      : tx.type === 'faucet'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {tx.type === 'win_payout' ? (
                    <Trophy className="w-4 h-4" />
                  ) : tx.type === 'faucet' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-white">{tx.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span>{tx.timestamp}</span>
                    <span>•</span>
                    <span className="text-emerald-400/80">{tx.txHash.slice(0, 14)}...</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-mono font-black text-sm ${
                    tx.type === 'win_payout' || tx.type === 'faucet'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {tx.type === 'purchase' ? '-' : '+'}
                  {tx.amountTon} TON
                </div>
                <div className="text-[10px] text-slate-400">₹{tx.amountInr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directorate Admin Portal Shortcut Card */}
      {onNavigateToAdmin && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-700/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Directorate Admin Console</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  MASTER
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Manage lotteries, conduct draws, verify tickets & treasury reserves.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAdmin}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 flex items-center gap-1 transition-all shadow-sm"
          >
            <span>Open</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Reset State Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 py-1 px-3 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Wallet & Tickets</span>
        </button>
      </div>
    </div>
  );
};
