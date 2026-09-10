import React from 'react';
import { Ticket, Radio, Trophy, FileText, Wallet, Sparkles, ShieldAlert } from 'lucide-react';
import { TabType } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  myTicketsCount: number;
  useMalayalam: boolean;
  walletTonBalance?: number;
  lowBalanceThreshold?: number;
  isWalletConnected?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  myTicketsCount,
  useMalayalam,
  walletTonBalance,
  lowBalanceThreshold = 1.0,
  isWalletConnected = true,
}) => {
  const isLowBalance =
    isWalletConnected &&
    typeof walletTonBalance === 'number' &&
    walletTonBalance < lowBalanceThreshold;

  const tabs: {
    id: TabType;
    label: string;
    malayalamLabel: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'lotteries',
      label: 'Lotteries',
      malayalamLabel: 'ടിക്കറ്റുകൾ',
      icon: Ticket,
      badge: '₹25 Cr',
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'my_tickets',
      label: 'My Tickets',
      malayalamLabel: 'എന്റേത്',
      icon: FileText,
      badge: myTicketsCount > 0 ? `${myTicketsCount}` : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-extrabold',
    },
    {
      id: 'automaton',
      label: 'Automaton',
      malayalamLabel: 'നറുക്കെടുപ്പ്',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-rose-500 text-white font-black animate-pulse',
    },
    {
      id: 'results',
      label: 'Results',
      malayalamLabel: 'ഫലങ്ങൾ',
      icon: Trophy,
    },
    {
      id: 'wallet',
      label: 'TON Wallet',
      malayalamLabel: 'വാലറ്റ്',
      icon: Wallet,
      badge: isLowBalance ? `< ${lowBalanceThreshold} TON` : 'Web3',
      badgeColor: isLowBalance
        ? 'bg-rose-600 text-white font-black border border-rose-400 shadow-md shadow-rose-950/80 animate-pulse'
        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'admin',
      label: 'Admin',
      malayalamLabel: 'അഡ്മിൻ',
      icon: ShieldAlert,
      badge: 'Master',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-800/50 shadow-2xl">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              aria-label={
                tab.id === 'wallet' && isLowBalance
                  ? `${useMalayalam ? tab.malayalamLabel : tab.label} - Low balance alert: ${walletTonBalance?.toFixed(2)} TON`
                  : useMalayalam ? tab.malayalamLabel : tab.label
              }
              title={
                tab.id === 'wallet' && isLowBalance
                  ? `Low TON balance (${walletTonBalance?.toFixed(2)} TON). Threshold: ${lowBalanceThreshold} TON`
                  : undefined
              }
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Notification / Highlights Badge */}
              {tab.badge && (
                <span
                  id={tab.id === 'wallet' && isLowBalance ? 'nav-wallet-low-badge' : undefined}
                  className={`absolute -top-1 right-2 text-[9px] px-1.5 py-0.2 rounded-full uppercase leading-none shadow-sm ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}

              <div
                className={`p-1.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 scale-110 shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-amber-400'
                      : tab.id === 'wallet' && isLowBalance
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                />

                {/* Low Balance Pulsing Alert Notification Pip */}
                {tab.id === 'wallet' && isLowBalance && (
                  <span
                    id="nav-tab-wallet-indicator"
                    className="absolute -top-0.5 -right-0.5 flex h-3 w-3"
                    title={
                      useMalayalam
                        ? `കുറഞ്ഞ ബാലൻസ്: ${walletTonBalance?.toFixed(2)} TON (${lowBalanceThreshold} TON-ൽ താഴെ)`
                        : `Low Balance Alert: ${walletTonBalance?.toFixed(2)} TON (below ${lowBalanceThreshold} TON threshold)`
                    }
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-slate-950 text-[7px] text-white font-black items-center justify-center shadow-sm">
                      !
                    </span>
                  </span>
                )}
              </div>

              <span className={`text-[11px] leading-tight mt-0.5 tracking-tight ${
                tab.id === 'wallet' && isLowBalance && !isActive ? 'text-rose-300 font-semibold' : ''
              }`}>
                {useMalayalam ? tab.malayalamLabel : tab.label}
              </span>

              {/* Indicator glow */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
