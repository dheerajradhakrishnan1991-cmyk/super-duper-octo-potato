import React, { useState } from 'react';
import { TelegramWalletState, LotteryTransaction } from '../../types';
import { TON_INR_RATE } from '../../data/lotteries';
import { triggerHaptic } from '../../utils/haptics';
import { sounds } from '../../utils/audio';
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, Trash2, CheckCircle2, DollarSign } from 'lucide-react';

interface AdminTreasuryVaultProps {
  wallet: TelegramWalletState;
  onUpdateWallet: (updater: (prev: TelegramWalletState) => TelegramWalletState) => void;
  transactions: LotteryTransaction[];
  onAddTransaction: (tx: LotteryTransaction) => void;
  notify: (msg: string) => void;
}

export const AdminTreasuryVault: React.FC<AdminTreasuryVaultProps> = ({
  wallet,
  onUpdateWallet,
  transactions,
  onAddTransaction,
  notify,
}) => {
  const [customBalanceInput, setCustomBalanceInput] = useState<string>(wallet.balanceTon.toFixed(2));
  const [customAirdropInput, setCustomAirdropInput] = useState<string>('25');
  const [txFilter, setTxFilter] = useState<'all' | 'purchase' | 'win_payout' | 'faucet'>('all');

  const treasuryReserveTon = 15420.5;
  const treasuryReserveInr = Math.round(treasuryReserveTon * TON_INR_RATE);

  const handleSetCustomBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const tonVal = parseFloat(customBalanceInput);
    if (isNaN(tonVal) || tonVal < 0) return;

    triggerHaptic('success');
    sounds.playCoinDrop();

    onUpdateWallet((prev) => ({
      ...prev,
      balanceTon: +tonVal.toFixed(2),
      balanceInr: Math.round(tonVal * TON_INR_RATE),
    }));

    const tx: LotteryTransaction = {
      id: `tx-admin-setbal-${Date.now()}`,
      type: 'faucet',
      title: `Admin Wallet Balance Adjustment`,
      amountTon: +tonVal.toFixed(2),
      amountInr: Math.round(tonVal * TON_INR_RATE),
      timestamp: 'Just now',
      txHash: `ton_balance_set_${Math.random().toString(36).substring(2, 12)}`,
      status: 'confirmed',
    };
    onAddTransaction(tx);

    notify(`Updated wallet balance to ${tonVal.toFixed(2)} TON (₹${Math.round(tonVal * TON_INR_RATE).toLocaleString('en-IN')})`);
  };

  const handleInjectAirdrop = (amount: number) => {
    if (amount <= 0) return;
    triggerHaptic('success');
    sounds.playCoinDrop();

    onUpdateWallet((prev) => ({
      ...prev,
      balanceTon: +(prev.balanceTon + amount).toFixed(2),
      balanceInr: prev.balanceInr + Math.round(amount * TON_INR_RATE),
    }));

    const airdropTx: LotteryTransaction = {
      id: `tx-admin-fund-${Date.now()}`,
      type: 'faucet',
      title: `Directorate Treasury Grant (+${amount} TON)`,
      amountTon: amount,
      amountInr: Math.round(amount * TON_INR_RATE),
      timestamp: 'Just now',
      txHash: `ton_grant_${Math.random().toString(36).substring(2, 12)}`,
      status: 'confirmed',
    };
    onAddTransaction(airdropTx);
    notify(`Airdropped +${amount} TON to connected wallet!`);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter;
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Reserves Overview */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Kerala State Directorate Treasury Reserves
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            100% COLLATERALIZED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Master Smart Contract Liquidity</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              💎 {treasuryReserveTon.toLocaleString()} TON
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              ≈ ₹{treasuryReserveInr.toLocaleString('en-IN')} Collateral Reserve
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Connected User Wallet ({wallet.walletType || 'telegram_wallet'})</span>
            <div className="text-xl font-black text-white font-mono mt-1">
              💎 {wallet.balanceTon.toFixed(2)} TON
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              ₹{wallet.balanceInr.toLocaleString('en-IN')} (Address: {wallet.shortAddress})
            </span>
          </div>
        </div>
      </div>

      {/* Direct Balance Setter & Airdrop Studio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Set Exact Wallet Balance */}
        <form onSubmit={handleSetCustomBalance} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Set Custom Wallet Balance
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Directly set the connected wallet balance to any custom TON value.
          </p>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-xs font-mono text-cyan-400">💎</span>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={customBalanceInput}
                onChange={(e) => setCustomBalanceInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                placeholder="100.00"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Set Balance
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-400">Quick Test:</span>
            <button
              id="admin-test-low-balance-btn"
              type="button"
              onClick={() => {
                setCustomBalanceInput('0.5');
                onUpdateWallet((prev) => ({
                  ...prev,
                  balanceTon: 0.5,
                  balanceInr: Math.round(0.5 * TON_INR_RATE),
                }));
                notify('Set balance to 0.50 TON (< 1.0 TON)! Notice the BottomNav Wallet tab notification indicator.');
              }}
              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-[10px] font-bold cursor-pointer transition-all active:scale-95"
            >
              ⚠️ 0.5 TON (Test Low Alert)
            </button>
            <button
              id="admin-test-restore-balance-btn"
              type="button"
              onClick={() => {
                setCustomBalanceInput('5.0');
                onUpdateWallet((prev) => ({
                  ...prev,
                  balanceTon: 5.0,
                  balanceInr: Math.round(5.0 * TON_INR_RATE),
                }));
                notify('Restored balance to 5.00 TON (> 1.0 TON threshold)');
              }}
              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold cursor-pointer transition-all active:scale-95"
            >
              ✓ 5.0 TON (Normal)
            </button>
          </div>
        </form>

        {/* Custom Airdrop Grants */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Direct Treasury Airdrop Grants
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Quickly inject funds into the user wallet for instant testing:
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[10, 25, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleInjectAirdrop(amount)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black font-mono shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                +{amount} TON
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Ledger Audit */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            Smart Contract Transaction Ledger ({filteredTransactions.length})
          </h3>

          <div className="flex items-center gap-1 text-[11px]">
            {(['all', 'purchase', 'win_payout', 'faucet'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTxFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  txFilter === filter
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'win_payout' ? 'Wins' : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions matching filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{tx.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({tx.timestamp})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Hash: {tx.txHash}</span>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`font-black text-xs block ${
                      tx.type === 'win_payout'
                        ? 'text-emerald-400'
                        : tx.type === 'faucet'
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {tx.type === 'purchase' ? '-' : '+'}
                    {tx.amountTon} TON
                  </span>
                  <span className="text-[10px] text-slate-500">₹{tx.amountInr.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
