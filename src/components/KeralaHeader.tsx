import React from 'react';
import { Sparkles, Wallet, Volume2, VolumeX, ShieldCheck, Coins, ShieldAlert } from 'lucide-react';
import { TelegramWalletState } from '../types';
import { sounds } from '../utils/audio';

interface KeralaHeaderProps {
  wallet: TelegramWalletState;
  onOpenWallet: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useMalayalam: boolean;
  onToggleLanguage: () => void;
  onOpenFaucet: () => void;
  onOpenAdmin: () => void;
  isAdminActive?: boolean;
}

export const KeralaHeader: React.FC<KeralaHeaderProps> = ({
  wallet,
  onOpenWallet,
  isMuted,
  onToggleMute,
  useMalayalam,
  onToggleLanguage,
  onOpenFaucet,
  onOpenAdmin,
  isAdminActive = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/60 text-white px-3 sm:px-4 py-2.5 shadow-lg shadow-emerald-950/50">
      <div className="flex items-center justify-between gap-2">
        {/* Kerala Emblem & App Branding */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-700 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
                {/* Kerala State Elephant & Conch stylized symbol */}
                <div className="text-center leading-none">
                  <span className="text-amber-400 font-black text-xs block tracking-tighter">KL</span>
                  <span className="text-[9px] text-emerald-300 font-bold tracking-widest block">LOTTO</span>
                </div>
                {/* Shimmer light */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-emerald-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                {useMalayalam ? 'കേരള ലോട്ടറി ഹബ്' : 'Kerala Lottery Hub'}
              </h1>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                TON WEB3
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>
                {useMalayalam ? 'സർക്കാർ അംഗീകൃത മാതൃക • തത്സമയ നറുക്കെടുപ്പ്' : 'Govt Model • Live Automaton Draws'}
              </span>
            </p>
          </div>
        </div>

        {/* Right actions: Lang, Sound, Telegram Wallet */}
        <div className="flex items-center gap-1.5">
          {/* Admin Portal Toggle */}
          <button
            id="admin-portal-header-btn"
            onClick={onOpenAdmin}
            title="Directorate Smart Contract Admin Panel"
            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
              isAdminActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/30'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border-amber-500/40'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isAdminActive ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            title="Toggle Malayalam / English"
            className="px-2 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-xs font-semibold text-emerald-200 border border-emerald-700/50 transition-colors"
          >
            {useMalayalam ? 'ENG' : 'മല'}
          </button>

          {/* Sound Mute */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Automaton & Ticket Sounds' : 'Mute Sounds'}
            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Faucet / Quick TON Topup button */}
          <button
            id="faucet-topup-btn"
            onClick={onOpenFaucet}
            title="Free TON / INR Test Faucet"
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>+5 TON</span>
          </button>

          {/* Telegram Wallet Pill */}
          <button
            id="telegram-wallet-connect-btn"
            onClick={onOpenWallet}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
              wallet.isConnected
                ? 'bg-gradient-to-r from-emerald-900 to-cyan-950 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-black/20">
              <Wallet className="w-2.5 h-2.5" />
            </div>

            {wallet.isConnected ? (
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-cyan-300 font-medium">{wallet.shortAddress}</span>
                <span className="text-[11px] font-extrabold text-white">
                  💎 {wallet.balanceTon.toFixed(2)} TON <span className="text-[9px] text-emerald-300 font-normal">(`₹${wallet.balanceInr}`)</span>
                </span>
              </div>
            ) : (
              <span className="whitespace-nowrap">Connect Telegram</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
