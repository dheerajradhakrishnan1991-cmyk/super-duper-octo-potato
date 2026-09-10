import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { PurchasedTicket } from '../types';
import { Sparkles, CheckCircle2, Trophy, Clock, Share2, Eye, ShieldCheck, QrCode, Timer, AlertCircle, FileDown, Check } from 'lucide-react';
import { triggerHaptic, shareContent } from '../utils/haptics';
import { sounds } from '../utils/audio';
import { getTimeRemaining } from '../utils/countdown';
import { downloadTicketPdf } from '../utils/ticketPdf';

interface KeralaTicketCardProps {
  ticket: PurchasedTicket;
  walletOwner?: string;
  onSelectForAutomaton?: (ticket: PurchasedTicket) => void;
  onClaimPrize?: (ticket: PurchasedTicket) => void;
  showAutomatonAction?: boolean;
  enableTilt?: boolean;
}

export const KeralaTicketCard: React.FC<KeralaTicketCardProps> = ({
  ticket,
  walletOwner,
  onSelectForAutomaton,
  onClaimPrize,
  showAutomatonAction = true,
  enableTilt = true,
}) => {
  const [isScratched, setIsScratched] = useState<boolean>(ticket.isScratched || false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (showQrModal) {
      const payload = JSON.stringify({
        type: 'kerala_state_lottery_v1',
        ticketId: ticket.id,
        lotteryName: ticket.lotteryName,
        drawCode: ticket.drawCode,
        series: ticket.series,
        ticketNumber: ticket.ticketNumber,
        fullCode: ticket.fullCode,
        contract: 'kerala_lotto.ton',
        txHash: ticket.transactionHash,
        securityCode: ticket.securityCode,
        hologramId: `HOLO-${ticket.series}-${ticket.ticketNumber}`,
        status: ticket.status,
      });

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#022c22',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate ticket QR code:', err));
    }
  }, [showQrModal, ticket]);

  // 3D Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number; sheenX: number; sheenY: number }>({
    x: 0,
    y: 0,
    sheenX: 50,
    sheenY: 50,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleScratch = () => {
    if (!isScratched) {
      triggerHaptic('success');
      sounds.playTicketTear();
      setIsScratched(true);
    }
  };

  const handleShare = async () => {
    triggerHaptic('light');
    const shareText = `🎟️ My Kerala Lottery Ticket: ${ticket.fullCode} for ${ticket.lotteryName}! 1st Prize ₹25 Crore. Verified on Telegram TON Wallet.`;
    await shareContent(
      `Kerala Lottery ${ticket.lotteryName}`,
      shareText,
      window.location.href
    );
  };

  const handleDownloadPdf = () => {
    if (isDownloadingPdf) return;
    triggerHaptic('medium');
    sounds.playCoinDrop();
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    try {
      downloadTicketPdf(ticket, walletOwner);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to generate ticket PDF:', err);
    } finally {
      setTimeout(() => {
        setIsDownloadingPdf(false);
      }, 600);
    }
  };

  // 3D Tilt mouse move calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Tilt range: -12deg to +12deg for Y-axis, -10deg to +10deg for X-axis
    const tiltX = (x - 0.5) * 24;
    const tiltY = -(y - 0.5) * 20;

    setTilt({
      x: tiltX,
      y: tiltY,
      sheenX: x * 100,
      sheenY: y * 100,
    });
  };

  const handleMouseEnter = () => {
    if (enableTilt) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    setIsHovered(false);
    setTilt({
      x: 0,
      y: 0,
      sheenX: 50,
      sheenY: 50,
    });
  };

  // Touch support for mobile 3D tilt
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    const tiltX = (x - 0.5) * 24;
    const tiltY = -(y - 0.5) * 20;

    setTilt({
      x: tiltX,
      y: tiltY,
      sheenX: x * 100,
      sheenY: y * 100,
    });
  };

  const handleTouchStart = () => {
    if (enableTilt) {
      setIsHovered(true);
    }
  };

  const handleTouchEnd = () => {
    if (!enableTilt) return;
    setIsHovered(false);
    setTilt({
      x: 0,
      y: 0,
      sheenX: 50,
      sheenY: 50,
    });
  };

  const isWon = ticket.status === 'won';
  const isActive = ticket.status === 'active';
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  const countdown = isActive && ticket.drawTimestamp ? getTimeRemaining(ticket.drawTimestamp, now) : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: '1200px' }}
      className="w-full select-none"
    >
      <div
        id={`ticket-card-${ticket.id}`}
        style={{
          transform: enableTilt
            ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`
            : undefined,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease-out',
        }}
        className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 ${
          isWon
            ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-900/60 border-amber-400/80 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-700/50 hover:border-emerald-500/70'
        } ${isHovered ? 'shadow-2xl shadow-emerald-900/50' : ''}`}
      >
        {/* Dynamic Holographic Iridescent Glare Layer */}
        {enableTilt && (
          <div
            className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden"
            style={{
              opacity: isHovered ? 0.75 : 0.18,
              background: `
                radial-gradient(
                  circle at ${tilt.sheenX}% ${tilt.sheenY}%,
                  rgba(255, 255, 255, 0.42) 0%,
                  rgba(251, 191, 36, 0.28) 22%,
                  rgba(56, 189, 248, 0.24) 45%,
                  rgba(168, 85, 247, 0.18) 65%,
                  transparent 85%
                ),
                linear-gradient(
                  ${tilt.x * 3 + 60}deg,
                  rgba(255,255,255,0.08) 0%,
                  rgba(245,158,11,0.09) 30%,
                  rgba(52,211,153,0.09) 60%,
                  rgba(56,189,248,0.08) 100%
                )
              `,
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Top Holographic Security Ribbon */}
        <div
          style={{ transform: 'translateZ(14px)' }}
          className="relative h-2.5 w-full overflow-hidden bg-gradient-to-r from-amber-400 via-cyan-300 via-purple-400 via-emerald-400 to-amber-400 bg-[length:300%_100%] animate-[shimmer_6s_infinite_linear]"
        >
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
        </div>

        {/* Main Ticket Container with Perforated Ticket Aesthetics */}
        <div className="p-3.5 sm:p-4.5 flex flex-col gap-3 relative z-10">
          {/* Government Header Stamp */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="flex items-start justify-between border-b border-emerald-800/40 pb-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-500/40 flex items-center justify-center p-1 shadow-inner">
                <span className="text-[9px] font-black text-amber-400 tracking-tighter">KL GOVT</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                  Kerala State Lotteries • {ticket.drawCode}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                  {ticket.lotteryName}
                  <span className="text-xs font-normal text-emerald-400/90">({ticket.malayalamName})</span>
                </h3>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {isWon ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 animate-pulse">
                  <Trophy className="w-3.5 h-3.5" />
                  WINNER ₹{ticket.winAmountInr?.toLocaleString('en-IN')}
                </span>
              ) : isActive ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                    countdown?.isUrgent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <Timer className={`w-3 h-3 ${countdown?.isUrgent ? 'text-amber-400' : 'text-emerald-400'}`} />
                  {countdown ? (
                    countdown.isExpired ? (
                      <span>Draw Ready</span>
                    ) : (
                      <span>Draw in {countdown.formattedShort}</span>
                    )
                  ) : (
                    <span>In Active Draw</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Draw Completed
                </span>
              )}
            </div>
          </div>

          {/* Center: The Grand Kerala Lottery Number Display */}
          <div
            style={{ transform: 'translateZ(28px)' }}
            className="bg-slate-950/80 rounded-xl p-3 border border-emerald-900/80 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner"
          >
            {/* Watermark Emblem in Background */}
            <div className="absolute right-4 -bottom-4 opacity-5 pointer-events-none select-none text-7xl font-black text-amber-400">
              KL
            </div>

            {/* Ticket Serial & Big Lucky Digits */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider">
                Official Ticket Number • സീരിയൽ നമ്പർ
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Series badge (e.g. WA) */}
                <div
                  style={{ transform: 'translateZ(14px)' }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-lg sm:text-xl tracking-wider shadow-md"
                >
                  {ticket.series}
                </div>
                {/* 6 Digits */}
                <div
                  style={{ transform: 'translateZ(18px)' }}
                  className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                >
                  {ticket.ticketNumber}
                </div>
              </div>
            </div>

            {/* Security Barcode, Draw Time & Live Countdown */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
              <div className="font-mono text-[11px] text-slate-400 tracking-widest select-none">
                {ticket.barcode}
              </div>
              <span className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Draw: <strong className="text-amber-300">{ticket.drawDate}</strong>
              </span>

              {/* Live Countdown Clock for active ticket */}
              {countdown && (
                <div
                  className={`mt-1.5 px-2 py-0.5 rounded-md flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-sm ${
                    countdown.isUrgent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-slate-900/90 text-emerald-300 border border-emerald-600/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      countdown.isUrgent ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-slate-400 text-[9px] uppercase font-sans">Timer:</span>
                  <span className="text-white font-extrabold tracking-wider">
                    {countdown.formattedShort}
                  </span>
                </div>
              )}

              <span className="text-[10px] text-emerald-400/70 font-mono mt-0.5">
                TON Tx: {ticket.transactionHash.slice(0, 12)}...
              </span>
            </div>
          </div>

          {/* Interactive Scratch-to-Verify Security Strip */}
          <div
            style={{ transform: 'translateZ(22px)' }}
            className="bg-emerald-950/50 rounded-xl p-2.5 border border-emerald-800/40 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-white">Government Holographic Security Foil</div>
                <div className="text-[10px] text-emerald-300/80">
                  {isScratched ? 'Authenticated & Verified on Blockchain' : 'Tap to scratch & reveal security PIN'}
                </div>
              </div>
            </div>

            <div>
              {isScratched ? (
                <div className="px-2.5 py-1 rounded-md bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 font-mono text-xs font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {ticket.securityCode}
                </div>
              ) : (
                <button
                  id={`scratch-btn-${ticket.id}`}
                  onClick={handleScratch}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black tracking-wide shadow-md transition-all active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Scratch Foil
                </button>
              )}
            </div>
          </div>

          {/* Perforated Divider Tear Line */}
          <div
            style={{ transform: 'translateZ(10px)' }}
            className="relative py-1 flex items-center justify-center"
          >
            <div className="w-full border-t-2 border-dashed border-emerald-800/50" />
            <div className="absolute -left-5 w-3 h-6 bg-slate-900 rounded-r-full border-r border-emerald-800/50" />
            <div className="absolute -right-5 w-3 h-6 bg-slate-900 rounded-l-full border-l border-emerald-800/50" />
            <span className="absolute px-2 bg-slate-900 text-[9px] text-emerald-400/60 font-mono uppercase tracking-widest">
              OFFICIAL STUB • TEAR HERE
            </span>
          </div>

          {/* Action Row */}
          <div
            style={{ transform: 'translateZ(24px)' }}
            className="flex items-center justify-between gap-2 pt-0.5"
          >
            <div className="text-[11px] text-slate-400">
              Paid: <strong className="text-white">₹{ticket.pricePaidInr}</strong> ({ticket.pricePaidTon} TON)
            </div>

            <div className="flex items-center gap-1.5">
              {/* Download Official Ticket PDF */}
              <button
                id={`download-pdf-${ticket.id}`}
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                title="Download Official Ticket PDF Certificate"
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  downloadSuccess
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border-emerald-700/60 shadow-sm'
                }`}
              >
                {isDownloadingPdf ? (
                  <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : downloadSuccess ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <FileDown className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-[10px] font-bold hidden xs:inline">
                  {downloadSuccess ? 'Saved' : 'PDF'}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                title="Share Ticket"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* QR Code view */}
              <button
                onClick={() => setShowQrModal(true)}
                title="View QR Code verification"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Automaton live check button */}
              {showAutomatonAction && onSelectForAutomaton && (
                <button
                  id={`check-automaton-${ticket.id}`}
                  onClick={() => onSelectForAutomaton(ticket)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Automaton Draw
                </button>
              )}

              {isWon && onClaimPrize && !ticket.isClaimed && (
                <button
                  onClick={() => onClaimPrize(ticket)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-emerald-500/30 animate-bounce"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Claim to Telegram Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Verification Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-emerald-600/50 rounded-2xl p-5 max-w-xs w-full text-center shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-amber-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">Blockchain Verification QR</h4>
              <div className="p-3 bg-white rounded-xl shadow-inner my-1 flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Official QR Code for ${ticket.fullCode}`}
                    className="w-40 h-40 object-contain rounded"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 font-mono text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="text-center font-mono text-[10px] text-slate-900 font-black mt-1">
                  {ticket.fullCode}
                </div>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                TON Contract: <span className="text-emerald-400">kerala_lotto.ton</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Scanned at Gorky Bhavan, Directorate of Kerala State Lotteries
              </p>
              <button
                id={`modal-download-pdf-${ticket.id}`}
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : downloadSuccess ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <FileDown className="w-4 h-4 text-white" />
                )}
                <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download Official Ticket PDF'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
