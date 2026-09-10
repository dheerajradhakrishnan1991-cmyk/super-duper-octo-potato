import React, { useState } from 'react';
import { KeralaLottery, PurchasedTicket, TelegramWalletState } from '../types';
import { KERALA_SERIES, TON_INR_RATE } from '../data/lotteries';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Dices,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Layers,
  Coins,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface TicketBuyModalProps {
  lottery: KeralaLottery;
  isOpen: boolean;
  onClose: () => void;
  wallet: TelegramWalletState;
  onConnectWallet: () => void;
  onSuccessPurchase: (newTickets: PurchasedTicket[]) => void;
  onOpenFaucet: () => void;
}

export const TicketBuyModal: React.FC<TicketBuyModalProps> = ({
  lottery,
  isOpen,
  onClose,
  wallet,
  onConnectWallet,
  onSuccessPurchase,
  onOpenFaucet,
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string>(
    lottery.seriesAvailable[0] || 'WA'
  );
  const [customDigits, setCustomDigits] = useState<string>(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const [buyMode, setBuyMode] = useState<'single' | 'book'>('single'); // single or full 12-series book
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const ticketCount = buyMode === 'book' ? lottery.seriesAvailable.length : 1;
  const totalPriceInr = lottery.ticketPriceInr * ticketCount;
  const totalPriceTon = +(lottery.ticketPriceTon * ticketCount).toFixed(3);

  const hasEnoughTon = wallet.isConnected && wallet.balanceTon >= totalPriceTon;

  // Generate random 6 digits
  const handleQuickPick = () => {
    triggerHaptic('light');
    sounds.playDrumClick(450);
    const randDigits = Math.floor(100000 + Math.random() * 900000).toString();
    setCustomDigits(randDigits);
    const seriesList = lottery.seriesAvailable.length > 0 ? lottery.seriesAvailable : KERALA_SERIES;
    setSelectedSeries(seriesList[Math.floor(Math.random() * seriesList.length)]);
  };

  const handleDigitChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setCustomDigits(cleaned);
  };

  const handlePurchase = async () => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }

    if (customDigits.length !== 6) {
      setErrorMessage('Please enter complete 6 digits for the ticket.');
      triggerHaptic('warning');
      return;
    }

    if (!hasEnoughTon) {
      setErrorMessage(`Insufficient TON balance. You need ${totalPriceTon} TON.`);
      triggerHaptic('warning');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    triggerHaptic('medium');
    sounds.playCoinDrop();

    // Simulate blockchain transaction verification
    setTimeout(() => {
      setIsProcessing(false);
      triggerHaptic('success');
      sounds.playTicketTear();

      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#06b6d4', '#fbbf24'],
        });
      } catch {
        // ignore
      }

      const generatedTickets: PurchasedTicket[] = [];
      const timestamp = Date.now();
      const randomTx = `ton_tx_${Math.random().toString(36).substring(2, 14)}`;

      if (buyMode === 'book') {
        lottery.seriesAvailable.forEach((s) => {
          generatedTickets.push({
            id: `tkt-${s}-${customDigits}-${timestamp}`,
            lotteryId: lottery.id,
            lotteryName: lottery.name,
            malayalamName: lottery.malayalamName,
            drawCode: lottery.drawCode,
            series: s,
            ticketNumber: customDigits,
            fullCode: `${s} ${customDigits}`,
            purchaseDate: 'Just now',
            purchaseTimestamp: timestamp,
            pricePaidInr: lottery.ticketPriceInr,
            pricePaidTon: lottery.ticketPriceTon,
            paymentMethod: 'telegram_wallet',
            transactionHash: randomTx,
            drawDate: lottery.drawDate,
            drawTimestamp: lottery.drawTimestamp,
            status: 'active',
            barcode: '||| ||||| |||| || ||||| |||',
            securityCode: `KL-${s}-${customDigits.slice(0, 3)}`,
          });
        });
      } else {
        generatedTickets.push({
          id: `tkt-${selectedSeries}-${customDigits}-${timestamp}`,
          lotteryId: lottery.id,
          lotteryName: lottery.name,
          malayalamName: lottery.malayalamName,
          drawCode: lottery.drawCode,
          series: selectedSeries,
          ticketNumber: customDigits,
          fullCode: `${selectedSeries} ${customDigits}`,
          purchaseDate: 'Just now',
          purchaseTimestamp: timestamp,
          pricePaidInr: lottery.ticketPriceInr,
          pricePaidTon: lottery.ticketPriceTon,
          paymentMethod: 'telegram_wallet',
          transactionHash: randomTx,
          drawDate: lottery.drawDate,
          drawTimestamp: lottery.drawTimestamp,
          status: 'active',
          barcode: '||| ||||| |||| || ||||| |||',
          securityCode: `KL-${selectedSeries}-${customDigits.slice(0, 3)}`,
        });
      }

      onSuccessPurchase(generatedTickets);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
              🎟️
            </div>
            <div>
              <div className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase">
                Official Kerala State Lottery
              </div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                {lottery.name}
                <span className="text-xs text-amber-400 font-normal">({lottery.drawCode})</span>
              </h3>
            </div>
          </div>

          <button
            id="close-ticket-buy-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Jackpot Highlight */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                1st Prize Mega Jackpot
              </span>
              <div className="text-2xl font-black text-amber-400 drop-shadow-sm">
                {lottery.firstPrizeInr}
              </div>
              <div className="text-[11px] text-slate-300">
                2nd Prize: {lottery.secondPrize}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400">Draw Schedule</span>
              <div className="text-xs font-bold text-white">{lottery.drawDate}</div>
              <span className="text-[10px] text-emerald-400 font-mono">Gorky Bhavan</span>
            </div>
          </div>

          {/* Mode Switch: Single Ticket vs Full Series Book */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setBuyMode('single');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                buyMode === 'single'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Single Ticket</span>
              <span className="text-[10px] opacity-80">(₹{lottery.ticketPriceInr})</span>
            </button>
            <button
              onClick={() => {
                setBuyMode('book');
                triggerHaptic('light');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                buyMode === 'book'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Book ({lottery.seriesAvailable.length} Series)</span>
            </button>
          </div>

          {buyMode === 'book' && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              💡 <strong>Kerala Lottery Special Plan:</strong> Buying the full 12-series book guarantees all 11 consolation prizes if your 6-digit number hits first prize!
            </div>
          )}

          {/* Series Selection (Only for single ticket) */}
          {buyMode === 'single' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Select Series Alphabet (സീരീസ്):</span>
                <span className="text-[11px] text-emerald-400 font-normal">
                  {lottery.seriesAvailable.length} Series Available
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {lottery.seriesAvailable.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSeries(s);
                      triggerHaptic('light');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      selectedSeries === s
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6-Digit Lucky Number Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Lucky 6-Digit Number (ഭാഗ്യ നമ്പർ):
              </label>
              <button
                onClick={handleQuickPick}
                className="flex items-center gap-1 text-xs font-extrabold text-amber-400 hover:text-amber-300"
              >
                <Dices className="w-3.5 h-3.5" />
                Quick Pick (Lucky Dip)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-amber-500 text-slate-950 font-black text-lg rounded-xl shadow-md min-w-[50px] text-center">
                {buyMode === 'book' ? 'ALL' : selectedSeries}
              </div>

              <input
                type="text"
                value={customDigits}
                onChange={(e) => handleDigitChange(e.target.value)}
                placeholder="6 Digits (e.g. 482915)"
                maxLength={6}
                className="flex-1 bg-slate-950 border border-emerald-600/60 rounded-xl px-4 py-2.5 font-mono text-xl font-black tracking-widest text-white text-center focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              Enter any 6 digits (birthday, numerology) or tap Quick Pick.
            </span>
          </div>

          {/* Preview of Ticket Code */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Ticket To Mint:</span>
            <span className="font-mono text-base font-black text-amber-300 tracking-wider">
              {buyMode === 'book' ? `[WA-WM] ${customDigits}` : `${selectedSeries} ${customDigits}`}
            </span>
          </div>

          {/* Telegram Wallet Payment Section */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Payment Method:</span>
              <span className="flex items-center gap-1 font-bold text-cyan-300">
                <Wallet className="w-3.5 h-3.5" />
                Telegram TON Wallet
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Connected Wallet Balance:</span>
              {wallet.isConnected ? (
                <span className="font-mono font-bold text-white">
                  💎 {wallet.balanceTon.toFixed(2)} TON (~₹{wallet.balanceInr})
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Not Connected</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-emerald-800/40 pt-2 text-sm font-extrabold text-white">
              <span>Total Payable:</span>
              <div className="text-right">
                <div className="text-amber-400">
                  💎 {totalPriceTon} TON <span className="text-xs text-slate-300 font-normal">(₹{totalPriceInr})</span>
                </div>
              </div>
            </div>

            {/* Faucet button if insufficient */}
            {!hasEnoughTon && wallet.isConnected && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-xs">
                <span className="text-amber-300">Need more TON to buy?</span>
                <button
                  onClick={onOpenFaucet}
                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1"
                >
                  <Coins className="w-3 h-3" />
                  +5 TON Test AirDrop
                </button>
              </div>
            )}
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            id="confirm-ticket-buy-btn"
            onClick={handlePurchase}
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isProcessing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                Minting Ticket on TON Blockchain...
              </>
            ) : !wallet.isConnected ? (
              <>
                <Wallet className="w-4 h-4" />
                Connect Telegram Wallet & Pay
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Buy Ticket ({totalPriceTon} TON)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
