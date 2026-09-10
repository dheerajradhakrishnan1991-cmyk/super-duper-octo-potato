import React, { useState, useEffect } from 'react';
import { PurchasedTicket } from '../types';
import { KeralaTicketCard } from './KeralaTicketCard';
import { TicketQrScannerModal } from './TicketQrScannerModal';
import { Sparkles, Trophy, Plus, Clock, Filter, ShieldCheck, ShieldAlert, Ticket, Timer, AlertTriangle, ArrowRight, Play, FileDown, Check, ScanLine, QrCode } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/audio';
import { getTimeRemaining } from '../utils/countdown';
import { downloadAllTicketsPdf, downloadTicketPdf } from '../utils/ticketPdf';

interface MyTicketsTabProps {
  tickets: PurchasedTicket[];
  walletOwner?: string;
  onOpenBuyModal: () => void;
  onSelectForAutomaton: (ticket: PurchasedTicket) => void;
  onClaimPrize: (ticket: PurchasedTicket) => void;
  onNavigateToAdmin?: (subTab?: string) => void;
  onImportTicket?: (ticket: PurchasedTicket) => void;
  useMalayalam?: boolean;
}

export const MyTicketsTab: React.FC<MyTicketsTabProps> = ({
  tickets,
  walletOwner,
  onOpenBuyModal,
  onSelectForAutomaton,
  onClaimPrize,
  onNavigateToAdmin,
  onImportTicket,
  useMalayalam = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'won'>('all');
  const [now, setNow] = useState<number>(Date.now());
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [allDownloadSuccess, setAllDownloadSuccess] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'won') return t.status === 'won';
    return true;
  });

  const totalSpentInr = tickets.reduce((acc, t) => acc + t.pricePaidInr, 0);
  const totalWonInr = tickets.reduce((acc, t) => acc + (t.winAmountInr || 0), 0);
  const totalWonTon = tickets.reduce((acc, t) => acc + (t.winAmountTon || 0), 0);

  // Identify active tickets nearing scheduled draw date
  const activeTickets = tickets.filter((t) => t.status === 'active' && t.drawTimestamp);
  const nearestTicket = activeTickets.length > 0
    ? [...activeTickets].sort((a, b) => a.drawTimestamp - b.drawTimestamp)[0]
    : null;
  const nearestCountdown = nearestTicket ? getTimeRemaining(nearestTicket.drawTimestamp, now) : null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleDownloadAll = () => {
    if (filteredTickets.length === 0 || isDownloadingAll) return;
    triggerHaptic('medium');
    sounds.playCoinDrop();
    setIsDownloadingAll(true);
    setAllDownloadSuccess(false);

    try {
      if (filteredTickets.length === 1) {
        downloadTicketPdf(filteredTickets[0], walletOwner);
      } else {
        downloadAllTicketsPdf(filteredTickets, walletOwner);
      }
      setAllDownloadSuccess(true);
      setTimeout(() => setAllDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to download tickets PDF:', err);
    } finally {
      setTimeout(() => setIsDownloadingAll(false), 600);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Tickets
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-baseline gap-1">
            <span>{tickets.length}</span>
            <span className="text-xs text-emerald-400 font-normal">Active</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Invested
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            ₹{totalSpentInr}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-500/40 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            Total Won
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            ₹{totalWonInr.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Prominent Live Draw Countdown Banner for Nearing Draw */}
      {nearestTicket && nearestCountdown && (
        <div
          id="nearing-draw-countdown-banner"
          className={`rounded-2xl p-4 border relative overflow-hidden transition-all duration-300 shadow-xl ${
            nearestCountdown.isUrgent
              ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-900/70 border-amber-500/80 ring-1 ring-amber-500/30'
              : 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-600/50'
          }`}
        >
          {/* Subtle Ambient Light */}
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            {/* Left: Ticket & Draw Identification */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    nearestCountdown.isUrgent
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {nearestCountdown.isUrgent ? 'Draw Approaching Fast' : 'Upcoming Scheduled Draw'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {nearestTicket.drawCode}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {nearestTicket.lotteryName}
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950/70 px-2 py-0.5 rounded border border-emerald-700/40">
                  {nearestTicket.fullCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Scheduled: <strong className="text-white">{nearestTicket.drawDate}</strong></span>
              </p>
            </div>

            {/* Right: Digital Countdown Ticker Boxes & CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Digital Countdown Boxes */}
              <div className="flex items-center gap-1.5 font-mono">
                {nearestCountdown.days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 border border-emerald-700/60 flex items-center justify-center text-lg font-black text-amber-300 shadow-inner">
                        {pad(nearestCountdown.days)}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Days</span>
                    </div>
                    <span className="text-amber-400 font-black text-base self-start mt-2.5">:</span>
                  </>
                )}

                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-emerald-700/60 flex items-center justify-center text-lg font-black text-amber-300 shadow-inner">
                    {pad(nearestCountdown.hours)}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Hours</span>
                </div>

                <span className="text-amber-400 font-black text-base self-start mt-2.5 animate-pulse">:</span>

                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-emerald-700/60 flex items-center justify-center text-lg font-black text-amber-300 shadow-inner">
                    {pad(nearestCountdown.minutes)}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Min</span>
                </div>

                <span className="text-amber-400 font-black text-base self-start mt-2.5 animate-pulse">:</span>

                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-amber-500/60 flex items-center justify-center text-lg font-black text-white shadow-inner bg-gradient-to-b from-slate-950 to-amber-950/40">
                    {pad(nearestCountdown.seconds)}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-amber-400 mt-0.5">Sec</span>
                </div>
              </div>

              {/* Action Buttons: Download PDF & Load in Automaton */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  id={`download-nearest-pdf-${nearestTicket.id}`}
                  onClick={() => {
                    triggerHaptic('light');
                    sounds.playCoinDrop();
                    downloadTicketPdf(nearestTicket, walletOwner);
                  }}
                  title="Download digital PDF for this upcoming draw ticket"
                  className="px-2.5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-emerald-300 hover:text-emerald-100 border border-emerald-600/50 text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Ticket PDF</span>
                </button>

                <button
                  id="enter-automaton-from-timer"
                  onClick={() => {
                    triggerHaptic('success');
                    onSelectForAutomaton(nearestTicket);
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Ready to Spin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Buy More Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setFilter('all');
              triggerHaptic('light');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => {
              setFilter('active');
              triggerHaptic('light');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Active Draws
          </button>
          <button
            onClick={() => {
              setFilter('won');
              triggerHaptic('light');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'won'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Winning Tickets
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* QR Code Hologram Authenticity Scanner Button */}
          <button
            id="scan-ticket-qr-btn"
            onClick={() => {
              triggerHaptic('medium');
              setIsScannerOpen(true);
            }}
            title="Scan ticket QR code using camera to verify holographic authenticity against TON blockchain"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-cyan-900/30 active:scale-95 transition-all cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>{useMalayalam ? 'ക്യുആർ സ്കാനർ' : 'Scan QR Ticket'}</span>
          </button>

          {/* Download Tickets PDF Action */}
          {filteredTickets.length > 0 && (
            <button
              id="download-tickets-pdf-btn"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              title="Download official digital ticket PDF certificates for visible tickets"
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
                allDownloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border-emerald-700/60'
              }`}
            >
              {isDownloadingAll ? (
                <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : allDownloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>
                {allDownloadSuccess
                  ? 'PDF Downloaded!'
                  : filteredTickets.length === 1
                  ? 'Download Ticket PDF'
                  : `Download PDF (${filteredTickets.length})`}
              </span>
            </button>
          )}

          {onNavigateToAdmin && (
            <button
              id="admin-mint-custom-ticket-btn"
              onClick={() => {
                triggerHaptic('light');
                onNavigateToAdmin('tickets');
              }}
              title="Directorate Portal: Mint Custom Ticket"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin:</span>
              <span>Mint Custom</span>
            </button>
          )}

          <button
            id="buy-another-ticket-btn"
            onClick={() => {
              triggerHaptic('medium');
              onOpenBuyModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buy Ticket</span>
          </button>
        </div>
      </div>

      {/* Holographic 3D Tilt Instruction Pill */}
      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-700/30 text-[11px] text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-white">3D Holographic Tilt</span>
            <span className="text-slate-400 hidden sm:inline">• Hover or drag ticket to inspect iridescent security foils</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsScannerOpen(true);
            }}
            className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ScanLine className="w-3 h-3" />
            <span>Verify Hologram</span>
          </button>
        </div>
      )}

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {filteredTickets.map((t) => (
            <KeralaTicketCard
              key={t.id}
              ticket={t}
              walletOwner={walletOwner}
              onSelectForAutomaton={onSelectForAutomaton}
              onClaimPrize={onClaimPrize}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center gap-3 my-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-amber-400">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Tickets in this Filter</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Buy authentic Kerala State Lottery tickets with your Telegram Wallet to participate in the live automaton draw, or verify any physical lottery ticket!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <button
              onClick={onOpenBuyModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buy Thiruvonam Bumper</span>
            </button>

            <button
              id="empty-state-scan-qr-btn"
              onClick={() => {
                triggerHaptic('medium');
                setIsScannerOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify Physical Ticket QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera QR Authenticity Scanner Modal */}
      <TicketQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        walletTickets={tickets}
        walletOwner={walletOwner}
        onSelectForAutomaton={onSelectForAutomaton}
        onImportScannedTicket={onImportTicket}
        useMalayalam={useMalayalam}
      />
    </div>
  );
};
