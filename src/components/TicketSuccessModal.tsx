import React, { useState } from 'react';
import { PurchasedTicket } from '../types';
import { KeralaTicketCard } from './KeralaTicketCard';
import {
  Sparkles,
  CheckCircle2,
  Radio,
  X,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/audio';
import { downloadTicketPdf, downloadAllTicketsPdf } from '../utils/ticketPdf';

interface TicketSuccessModalProps {
  tickets: PurchasedTicket[];
  isOpen: boolean;
  onClose: () => void;
  onGoToAutomaton: (ticket: PurchasedTicket) => void;
  onGoToMyTickets: () => void;
}

export const TicketSuccessModal: React.FC<TicketSuccessModalProps> = ({
  tickets,
  isOpen,
  onClose,
  onGoToAutomaton,
  onGoToMyTickets,
}) => {
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || tickets.length === 0) return null;

  const firstTicket = tickets[0];

  const shareTitle = `Kerala State Lottery: ${firstTicket.lotteryName} (${firstTicket.drawCode})`;
  const shareText =
    `🎟️ Just minted my official Kerala State Lottery holographic ticket on TON Blockchain!\n\n` +
    `🎫 Ticket No: ${firstTicket.fullCode}\n` +
    `🏆 Draw: ${firstTicket.lotteryName} (${firstTicket.drawCode})\n` +
    `📅 Draw Date: ${firstTicket.drawDate}\n` +
    `🔐 Security Hash: ${firstTicket.securityCode}\n` +
    `⚡ Minted via TON Telegram Wallet • Kerala Directorate Web3 Portal`;

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n👉 View at: ${appUrl}`)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;

  const handleCopyShareText = async () => {
    triggerHaptic('success');
    sounds.playCoinDrop();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n\n👉 View Ticket: ${appUrl}`);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic('medium');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to showing social buttons
      }
    }
    setShowShareOptions((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col gap-4 p-4 sm:p-6 animate-in fade-in zoom-in duration-200">
        {/* Celebration Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
              🎟️
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OFFICIAL KERALA TICKET MINTED
              </div>
              <h3 className="text-base font-black text-white">
                {tickets.length > 1
                  ? `${tickets.length} Tickets Added to Your Collection!`
                  : `Ticket ${firstTicket.fullCode} Added to App!`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Preview Showcase */}
        <div className="max-h-[48vh] overflow-y-auto flex flex-col gap-3 pr-1">
          {tickets.slice(0, 3).map((t) => (
            <KeralaTicketCard
              key={t.id}
              ticket={t}
              showAutomatonAction={false}
            />
          ))}
          {tickets.length > 3 && (
            <div className="text-center text-xs text-amber-300 font-bold py-1">
              + {tickets.length - 3} more tickets in your collection!
            </div>
          )}
        </div>

        {/* Social Media Share Section */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white uppercase tracking-wide">
                Share Holographic Ticket
              </span>
            </div>
            <button
              id="modal-share-toggle-btn"
              onClick={() => {
                triggerHaptic('light');
                setShowShareOptions((prev) => !prev);
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>{showShareOptions ? 'Hide Options' : 'Social Platforms'}</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          {/* Social Platforms Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Telegram */}
            <a
              id="share-telegram-btn"
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerHaptic('medium');
                sounds.playCoinDrop();
              }}
              className="px-2.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            {/* WhatsApp */}
            <a
              id="share-whatsapp-btn"
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerHaptic('medium');
                sounds.playCoinDrop();
              }}
              className="px-2.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* X / Twitter */}
            <a
              id="share-x-btn"
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerHaptic('medium');
                sounds.playCoinDrop();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>X / Twitter</span>
            </a>

            {/* Copy Ticket Details */}
            <button
              id="share-copy-btn"
              onClick={handleCopyShareText}
              className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                copied
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied!' : 'Copy Info'}</span>
            </button>
          </div>

          {/* Optional Native Share Button for devices that support it */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              id="share-native-system-btn"
              onClick={handleNativeShare}
              className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3 h-3 text-amber-400" />
              <span>Open Device Share Sheet (More Apps)</span>
            </button>
          )}
        </div>

        {/* Action Buttons: Go to Automaton, Download PDF, or View Tickets */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            id="modal-download-ticket-pdf-btn"
            onClick={() => {
              triggerHaptic('medium');
              sounds.playCoinDrop();
              if (tickets.length === 1) {
                downloadTicketPdf(firstTicket);
              } else {
                downloadAllTicketsPdf(tickets);
              }
            }}
            className="w-full sm:w-auto py-3 px-3.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 hover:text-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
            title="Download official digital ticket PDF"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Download PDF</span>
          </button>

          <button
            id="modal-goto-automaton-btn"
            onClick={() => {
              triggerHaptic('medium');
              onGoToAutomaton(firstTicket);
              onClose();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse text-slate-950" />
            <span>Go to Live Automaton Draw</span>
          </button>

          <button
            id="modal-goto-mytickets-btn"
            onClick={() => {
              triggerHaptic('light');
              onGoToMyTickets();
              onClose();
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View My Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

