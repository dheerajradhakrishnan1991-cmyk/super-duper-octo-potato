import React, { useState } from 'react';
import { TelegramWalletState, LotteryTransaction } from '../types';
import { triggerHaptic, copyToClipboard } from '../utils/haptics';
import { sounds } from '../utils/audio';
import {
  X,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';

interface TelegramWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: TelegramWalletState;
  onConnect: (walletType: 'telegram_wallet' | 'tonkeeper' | 'ton_space' | 'mytonwallet') => void;
  onDisconnect: () => void;
  onAddFaucetTon: (amountTon: number) => void;
  transactions: LotteryTransaction[];
}

export const TelegramWalletModal: React.FC<TelegramWalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnect,
  onDisconnect,
  onAddFaucetTon,
  transactions,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isFauceting, setIsFauceting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    triggerHaptic('light');
    const success = await copyToClipboard(wallet.address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFaucet = (amount: number) => {
    setIsFauceting(true);
    triggerHaptic('success');
    sounds.playCoinDrop();
    setTimeout(() => {
      onAddFaucetTon(amount);
      setIsFauceting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Telegram TON Wallet</h3>
              <p className="text-[11px] text-cyan-300">Fast, secure Web3 lottery payments</p>
            </div>
          </div>

          <button
            id="close-wallet-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          {/* If Connected */}
          {wallet.isConnected ? (
            <>
              {/* Balance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/60 border border-cyan-500/40 shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Telegram User & Account</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    TON Mainnet
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
                      <span>💎</span>
                      <span>{wallet.balanceTon.toFixed(2)}</span>
                      <span className="text-xs font-normal text-slate-400">TON</span>
                      {wallet.balanceTon < 1.0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                          Low &lt; 1.0
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-400 font-bold">
                      ≈ ₹{wallet.balanceInr.toLocaleString('en-IN')} INR
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-bold block">{wallet.username}</span>
                    <button
                      onClick={handleCopy}
                      className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : wallet.shortAddress}</span>
                    </button>
                  </div>
                </div>

                {/* Free TON Faucet Shortcut */}
                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">Test AirDrop Faucet:</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      id="faucet-5-btn"
                      onClick={() => handleFaucet(5.0)}
                      disabled={isFauceting}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95"
                    >
                      +5 TON (₹2,250)
                    </button>
                    <button
                      id="faucet-20-btn"
                      onClick={() => handleFaucet(20.0)}
                      disabled={isFauceting}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95"
                    >
                      +20 TON
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions History */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Recent Activity</span>
                  <span>{transactions.length} Txs</span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === 'win_payout'
                              ? 'bg-amber-500/20 text-amber-400'
                              : tx.type === 'faucet'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {tx.type === 'win_payout' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'faucet' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white truncate max-w-[170px]">{tx.title}</div>
                          <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-mono font-bold ${
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

              {/* Disconnect Button */}
              <button
                onClick={onDisconnect}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 hover:border-red-500/40 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Disconnect Wallet
              </button>
            </>
          ) : (
            <>
              {/* Wallet Select Providers */}
              <p className="text-xs text-slate-300">
                Connect your Telegram or TON wallet to buy Kerala Lottery tickets with instant cryptographic proof and automated prize payouts.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  id="connect-tg-wallet-provider"
                  onClick={() => onConnect('telegram_wallet')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/40 hover:border-blue-400 flex items-center justify-between text-left transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold group-hover:scale-110 transition-transform">
                      ✈️
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>Telegram Wallet (@wallet)</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/30 text-blue-300 font-bold">
                          Recommended
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">Built directly inside Telegram app</div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  id="connect-tonkeeper-provider"
                  onClick={() => onConnect('tonkeeper')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between text-left transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg font-bold group-hover:scale-110 transition-transform">
                      💎
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">Tonkeeper</div>
                      <div className="text-xs text-slate-400">Most popular standalone TON wallet</div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  id="connect-tonspace-provider"
                  onClick={() => onConnect('ton_space')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between text-left transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg font-bold group-hover:scale-110 transition-transform">
                      🪐
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">TON Space (Self-Custodial)</div>
                      <div className="text-xs text-slate-400">Non-custodial wallet inside Telegram</div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* Faucet teaser */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                <Coins className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  New to TON? Free test funds will be granted automatically upon connecting so you can purchase tickets instantly!
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
