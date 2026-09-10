import React, { useState, useEffect } from 'react';
import {
  TabType,
  KeralaLottery,
  PurchasedTicket,
  TelegramWalletState,
  LotteryTransaction,
  OfficialDrawResult,
} from './types';
import {
  OFFICIAL_KERALA_LOTTERIES,
  INITIAL_USER_TICKETS,
  INITIAL_TRANSACTIONS,
  OFFICIAL_PAST_RESULTS,
  TON_INR_RATE,
} from './data/lotteries';
import { sounds } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import { KeralaHeader } from './components/KeralaHeader';
import { BottomNav } from './components/BottomNav';
import { LotteryCatalogTab } from './components/LotteryCatalogTab';
import { MyTicketsTab } from './components/MyTicketsTab';
import { DrawAutomaton } from './components/DrawAutomaton';
import { ResultsArchiveTab } from './components/ResultsArchiveTab';
import { WalletTab } from './components/WalletTab';
import { AdminPanel, AdminSubTab } from './components/AdminPanel';
import { TicketBuyModal } from './components/TicketBuyModal';
import { TicketSuccessModal } from './components/TicketSuccessModal';
import { TelegramWalletModal } from './components/TelegramWalletModal';

export function App() {
  // Telegram Wallet State with local storage persistence
  const [wallet, setWallet] = useState<TelegramWalletState>(() => {
    try {
      const saved = localStorage.getItem('kl_telegram_wallet');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isConnected: true,
      walletType: 'telegram_wallet',
      address: 'EQB48d7992019aF3901bce208c02881a8901',
      shortAddress: 'EQB4...8901',
      username: '@dheeraj_cmyk',
      balanceTon: 8.5,
      balanceInr: 3825,
      network: 'mainnet',
    };
  });

  // User's Purchased Kerala Lottery Tickets
  const [tickets, setTickets] = useState<PurchasedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('kl_user_tickets');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_TICKETS;
  });

  // Transaction Ledger
  const [transactions, setTransactions] = useState<LotteryTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('kl_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // Dynamic Catalog of Kerala Lotteries
  const [lotteries, setLotteries] = useState<KeralaLottery[]>(() => {
    try {
      const saved = localStorage.getItem('kl_lotteries_catalog');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return OFFICIAL_KERALA_LOTTERIES;
  });

  // Official Gazetted Results Archive
  const [officialResults, setOfficialResults] = useState<OfficialDrawResult[]>(() => {
    try {
      const saved = localStorage.getItem('kl_official_results');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((res: OfficialDrawResult, idx: number) => ({
            ...res,
            id: res.id || `res-${res.drawCode || 'draw'}-${res.lotteryId || idx}-${idx}`,
          }));
        }
      }
    } catch {
      // ignore
    }
    return OFFICIAL_PAST_RESULTS;
  });

  // Navigation and UI States
  const [activeTab, setActiveTab] = useState<TabType>('lotteries');
  const [adminInitialSubTab, setAdminInitialSubTab] = useState<AdminSubTab>('overview');
  const [automatonTarget, setAutomatonTarget] = useState<{ series: string; number: string; lotteryId?: string } | null>(null);
  const [selectedLotteryToBuy, setSelectedLotteryToBuy] = useState<KeralaLottery | null>(null);
  const [recentlyBoughtTickets, setRecentlyBoughtTickets] = useState<PurchasedTicket[]>([]);
  const [selectedTicketForAutomaton, setSelectedTicketForAutomaton] = useState<PurchasedTicket | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [useMalayalam, setUseMalayalam] = useState<boolean>(false);

  const handleNavigateToAdmin = (subTab?: string) => {
    if (subTab) {
      setAdminInitialSubTab(subTab as AdminSubTab);
    }
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kl_telegram_wallet', JSON.stringify(wallet));
      localStorage.setItem('kl_user_tickets', JSON.stringify(tickets));
      localStorage.setItem('kl_transactions', JSON.stringify(transactions));
      localStorage.setItem('kl_lotteries_catalog', JSON.stringify(lotteries));
      localStorage.setItem('kl_official_results', JSON.stringify(officialResults));
    } catch {
      // ignore
    }
  }, [wallet, tickets, transactions, lotteries, officialResults]);

  // Audio mute sync
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  // Language toggle
  const handleToggleLanguage = () => {
    triggerHaptic('light');
    setUseMalayalam((prev) => !prev);
  };

  // Connect Telegram Wallet
  const handleConnectWallet = (walletType: 'telegram_wallet' | 'tonkeeper' | 'ton_space' | 'mytonwallet') => {
    triggerHaptic('success');
    sounds.playCoinDrop();
    setWallet((prev) => ({
      ...prev,
      isConnected: true,
      walletType,
      balanceTon: prev.balanceTon > 0 ? prev.balanceTon : 5.0,
      balanceInr: prev.balanceTon > 0 ? prev.balanceInr : 2250,
    }));
    setIsWalletModalOpen(false);
  };

  // Disconnect Telegram Wallet
  const handleDisconnectWallet = () => {
    triggerHaptic('light');
    setWallet((prev) => ({
      ...prev,
      isConnected: false,
      walletType: null,
    }));
  };

  // Top-up Test AirDrop TON Faucet
  const handleAddFaucetTon = (amountTon: number) => {
    const addedInr = Math.round(amountTon * TON_INR_RATE);
    setWallet((prev) => ({
      ...prev,
      balanceTon: +(prev.balanceTon + amountTon).toFixed(2),
      balanceInr: prev.balanceInr + addedInr,
    }));

    const newTx: LotteryTransaction = {
      id: `tx-faucet-${Date.now()}`,
      type: 'faucet',
      title: `Telegram AirDrop Faucet (+${amountTon} TON)`,
      amountTon,
      amountInr: addedInr,
      timestamp: 'Just now',
      txHash: `0x${Math.random().toString(36).substring(2, 16)}...`,
      status: 'confirmed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Successfully Purchased Ticket Flow
  const handleSuccessPurchase = (newTickets: PurchasedTicket[]) => {
    const totalTon = newTickets.reduce((acc, t) => acc + t.pricePaidTon, 0);
    const totalInr = newTickets.reduce((acc, t) => acc + t.pricePaidInr, 0);

    // Deduct from wallet
    setWallet((prev) => ({
      ...prev,
      balanceTon: Math.max(0, +(prev.balanceTon - totalTon).toFixed(3)),
      balanceInr: Math.max(0, prev.balanceInr - totalInr),
    }));

    // Add tickets
    setTickets((prev) => [...newTickets, ...prev]);

    // Add transactions
    const newTxs: LotteryTransaction[] = newTickets.map((t) => ({
      id: `tx-buy-${t.id}`,
      type: 'purchase',
      title: `${t.lotteryName} (${t.fullCode})`,
      ticketCode: t.fullCode,
      amountTon: t.pricePaidTon,
      amountInr: t.pricePaidInr,
      timestamp: 'Just now',
      txHash: t.transactionHash,
      status: 'confirmed',
    }));

    setTransactions((prev) => [...newTxs, ...prev]);

    // Show newly bought tickets in modal and set state so it shows up
    setRecentlyBoughtTickets(newTickets);
  };

  // Handle Win in Automaton Draw
  const handleTicketWon = (
    winningTicket: PurchasedTicket,
    prizeAmountInr: number,
    prizeAmountTon: number,
    prizeTier: string
  ) => {
    // Update ticket state
    setTickets((prev) =>
      prev.map((t) =>
        t.id === winningTicket.id
          ? {
              ...t,
              status: 'won',
              winAmountInr: prizeAmountInr,
              winAmountTon: prizeAmountTon,
              winPrizeTier: prizeTier,
              isClaimed: true,
            }
          : t
      )
    );

    // Automatically credit Telegram Wallet!
    setWallet((prev) => ({
      ...prev,
      balanceTon: +(prev.balanceTon + prizeAmountTon).toFixed(2),
      balanceInr: prev.balanceInr + prizeAmountInr,
    }));

    // Log payout transaction
    const newTx: LotteryTransaction = {
      id: `tx-win-${Date.now()}`,
      type: 'win_payout',
      title: `🎉 Won ${prizeTier} in ${winningTicket.lotteryName}!`,
      ticketCode: winningTicket.fullCode,
      amountTon: prizeAmountTon,
      amountInr: prizeAmountInr,
      timestamp: 'Just now',
      txHash: `ton_payout_${Math.random().toString(36).substring(2, 14)}`,
      status: 'confirmed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Claim Prize explicitly if needed
  const handleClaimPrize = (ticket: PurchasedTicket) => {
    triggerHaptic('success');
    sounds.playCoinDrop();
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, isClaimed: true } : t))
    );
  };

  // Navigate directly to Automaton with specific ticket
  const handleSelectForAutomaton = (ticket: PurchasedTicket) => {
    triggerHaptic('medium');
    setSelectedTicketForAutomaton(ticket);
    setActiveTab('automaton');
  };

  // Import a verified scanned ticket into user's wallet
  const handleImportScannedTicket = (ticket: PurchasedTicket) => {
    setTickets((prev) => {
      if (prev.some((t) => t.id === ticket.id || t.fullCode === ticket.fullCode)) {
        return prev;
      }
      return [ticket, ...prev];
    });
  };

  // Reset Demo State
  const handleResetData = () => {
    localStorage.removeItem('kl_telegram_wallet');
    localStorage.removeItem('kl_user_tickets');
    localStorage.removeItem('kl_transactions');
    localStorage.removeItem('kl_lotteries_catalog');
    localStorage.removeItem('kl_official_results');
    setWallet({
      isConnected: true,
      walletType: 'telegram_wallet',
      address: 'EQB48d7992019aF3901bce208c02881a8901',
      shortAddress: 'EQB4...8901',
      username: '@dheeraj_cmyk',
      balanceTon: 8.5,
      balanceInr: 3825,
      network: 'mainnet',
    });
    setTickets(INITIAL_USER_TICKETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setLotteries(OFFICIAL_KERALA_LOTTERIES);
    setOfficialResults(OFFICIAL_PAST_RESULTS);
    triggerHaptic('light');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Mobile-first and desktop-friendly container */}
      <div className="w-full max-w-2xl bg-slate-900 border-x-0 sm:border-x border-emerald-900/60 shadow-2xl flex flex-col min-h-screen pb-20">
        {/* App Header */}
        <KeralaHeader
          wallet={wallet}
          onOpenWallet={() => setIsWalletModalOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          useMalayalam={useMalayalam}
          onToggleLanguage={handleToggleLanguage}
          onOpenFaucet={() => handleAddFaucetTon(5.0)}
          onOpenAdmin={() => setActiveTab('admin')}
          isAdminActive={activeTab === 'admin'}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {activeTab === 'lotteries' && (
            <LotteryCatalogTab
              lotteries={lotteries}
              onSelectLotteryToBuy={(lottery) => setSelectedLotteryToBuy(lottery)}
              onNavigateToAutomaton={(lotteryId) => {
                setActiveTab('automaton');
              }}
              onNavigateToAdmin={handleNavigateToAdmin}
              useMalayalam={useMalayalam}
            />
          )}

          {activeTab === 'my_tickets' && (
            <MyTicketsTab
              tickets={tickets}
              walletOwner={wallet.username || wallet.shortAddress}
              onOpenBuyModal={() => setSelectedLotteryToBuy(lotteries[0])}
              onSelectForAutomaton={handleSelectForAutomaton}
              onClaimPrize={handleClaimPrize}
              onNavigateToAdmin={handleNavigateToAdmin}
              onImportTicket={handleImportScannedTicket}
              useMalayalam={useMalayalam}
            />
          )}

          {activeTab === 'automaton' && (
            <DrawAutomaton
              lotteries={lotteries}
              userTickets={tickets}
              wallet={wallet}
              onTicketWon={handleTicketWon}
              selectedTicketForDraw={selectedTicketForAutomaton}
              onClearSelectedTicket={() => setSelectedTicketForAutomaton(null)}
              controlledTarget={automatonTarget}
              onClearControlledTarget={() => setAutomatonTarget(null)}
              onNavigateToAdmin={handleNavigateToAdmin}
              useMalayalam={useMalayalam}
            />
          )}

          {activeTab === 'results' && (
            <ResultsArchiveTab
              useMalayalam={useMalayalam}
              officialResults={officialResults}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletTab
              wallet={wallet}
              transactions={transactions}
              tickets={tickets}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              onAddFaucet={handleAddFaucetTon}
              onResetData={handleResetData}
              onNavigateToAutomaton={() => setActiveTab('automaton')}
              onNavigateToAdmin={() => handleNavigateToAdmin('treasury')}
              lowBalanceThreshold={1.0}
              useMalayalam={useMalayalam}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              lotteries={lotteries}
              onUpdateLotteries={setLotteries}
              tickets={tickets}
              onUpdateTickets={setTickets}
              transactions={transactions}
              onAddTransaction={(tx) => setTransactions((prev) => [tx, ...prev])}
              wallet={wallet}
              onUpdateWallet={setWallet}
              officialResults={officialResults}
              onPublishResult={(newRes) => {
                const withId: OfficialDrawResult = {
                  ...newRes,
                  id: newRes.id || `res-${newRes.drawCode || 'draw'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                };
                setOfficialResults((prev) => [withId, ...prev]);
              }}
              onDeleteResult={(id) => {
                setOfficialResults((prev) => prev.filter((r) => r.id !== id));
              }}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              initialSubTab={adminInitialSubTab}
              onSelectTicketForAutomaton={handleSelectForAutomaton}
              onOpenBuyModalForLottery={(l) => setSelectedLotteryToBuy(l)}
              onSetAutomatonTarget={setAutomatonTarget}
              automatonTarget={automatonTarget}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          myTicketsCount={tickets.filter((t) => t.status === 'active').length}
          useMalayalam={useMalayalam}
          walletTonBalance={wallet.balanceTon}
          lowBalanceThreshold={1.0}
          isWalletConnected={wallet.isConnected}
        />
      </div>

      {/* Ticket Purchase Modal */}
      {selectedLotteryToBuy && (
        <TicketBuyModal
          lottery={selectedLotteryToBuy}
          isOpen={Boolean(selectedLotteryToBuy)}
          onClose={() => setSelectedLotteryToBuy(null)}
          wallet={wallet}
          onConnectWallet={() => {
            setSelectedLotteryToBuy(null);
            setIsWalletModalOpen(true);
          }}
          onSuccessPurchase={handleSuccessPurchase}
          onOpenFaucet={() => handleAddFaucetTon(5.0)}
        />
      )}

      {/* Ticket Success Modal (After Buy Show App Showcase) */}
      <TicketSuccessModal
        tickets={recentlyBoughtTickets}
        isOpen={recentlyBoughtTickets.length > 0}
        onClose={() => setRecentlyBoughtTickets([])}
        onGoToAutomaton={(ticket) => {
          setSelectedTicketForAutomaton(ticket);
          setActiveTab('automaton');
        }}
        onGoToMyTickets={() => {
          setActiveTab('my_tickets');
        }}
      />

      {/* Telegram Wallet Modal */}
      <TelegramWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onAddFaucetTon={handleAddFaucetTon}
        transactions={transactions}
      />
    </div>
  );
}

export default App;
