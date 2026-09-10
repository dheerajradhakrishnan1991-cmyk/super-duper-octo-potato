import React, { useState, useEffect, useRef } from 'react';
import { KeralaLottery, PurchasedTicket, TelegramWalletState } from '../types';
import { KERALA_SERIES } from '../data/lotteries';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { triggerWinnerConfettiExplosion, clearConfetti } from '../utils/confetti';
import {
  Sparkles,
  Trophy,
  Play,
  RotateCw,
  Award,
  Zap,
  CheckCircle,
  HelpCircle,
  Clock,
  Radio,
  Volume2,
  VolumeX,
  Mic,
  Square,
  Volume1,
} from 'lucide-react';
import { speechAnnouncer } from '../utils/speech';

interface DrawAutomatonProps {
  lotteries: KeralaLottery[];
  userTickets: PurchasedTicket[];
  wallet: TelegramWalletState;
  onTicketWon: (ticket: PurchasedTicket, prizeAmountInr: number, prizeAmountTon: number, prizeTier: string) => void;
  selectedTicketForDraw?: PurchasedTicket | null;
  onClearSelectedTicket?: () => void;
  controlledTarget?: { series: string; number: string; lotteryId?: string } | null;
  onClearControlledTarget?: () => void;
  onNavigateToAdmin?: (subTab?: string) => void;
  useMalayalam?: boolean;
}

export const DrawAutomaton: React.FC<DrawAutomatonProps> = ({
  lotteries,
  userTickets,
  wallet,
  onTicketWon,
  selectedTicketForDraw,
  onClearSelectedTicket,
  controlledTarget,
  onClearControlledTarget,
  onNavigateToAdmin,
  useMalayalam = false,
}) => {
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>(
    controlledTarget?.lotteryId || (selectedTicketForDraw ? selectedTicketForDraw.lotteryId : lotteries[0]?.id || 'thiruvonam-br93')
  );

  const currentLottery = lotteries.find((l) => l.id === selectedLotteryId) || lotteries[0];

  // Automaton Drum States: Series + 6 Digits
  const [drumSeries, setDrumSeries] = useState<string>('WA');
  const [drumDigits, setDrumDigits] = useState<string[]>(['4', '8', '2', '9', '1', '5']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lockedDrums, setLockedDrums] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const [drawLog, setDrawLog] = useState<string[]>([]);
  const [drawOutcome, setDrawOutcome] = useState<{
    hasDrawn: boolean;
    winningCode: string;
    prizeTier: string;
    matchedTickets: PurchasedTicket[];
    payoutInr: number;
    payoutTon: number;
  } | null>(null);

  // Text-To-Speech Announcer States
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => speechAnnouncer.isAnnouncerEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [ttsLanguage, setTtsLanguage] = useState<'en' | 'ml'>(useMalayalam ? 'ml' : 'en');

  // Sync TTS language with global Malayalam toggle
  useEffect(() => {
    setTtsLanguage(useMalayalam ? 'ml' : 'en');
  }, [useMalayalam]);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if selectedTicketForDraw changes
  useEffect(() => {
    if (selectedTicketForDraw) {
      setSelectedLotteryId(selectedTicketForDraw.lotteryId);
    }
  }, [selectedTicketForDraw]);

  // Clean up
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      clearConfetti();
      speechAnnouncer.stop();
    };
  }, []);

  // Trigger TTS voice announcement helper
  const triggerDrawSpeechAnnouncement = (opts: {
    lotteryName: string;
    drawCode: string;
    series: string;
    digits: string[];
    hasWinner: boolean;
    prizeTier?: string;
    payoutInr?: number;
    lang?: 'en' | 'ml';
  }) => {
    const lang = opts.lang || ttsLanguage;
    let transcript = '';
    if (lang === 'ml') {
      transcript = opts.hasWinner && opts.payoutInr
        ? `ശ്രദ്ധിക്കുക! ${opts.lotteryName} നറുക്കെടുപ്പിൽ നിങ്ങളുടെ ടിക്കറ്റ് ${opts.prizeTier || 'ഒന്നാം സമ്മാനം'} നേടിയിരിക്കുന്നു! വിജയിച്ച നമ്പർ: സീരീസ് ${opts.series} ${opts.digits.join(' ')}! സമ്മാനത്തുക ₹${opts.payoutInr.toLocaleString('en-IN')}!`
        : `കേരള സംസ്ഥാന ഭാഗ്യക്കുറി നറുക്കെടുപ്പ് ഫലം: ${opts.lotteryName} (${opts.drawCode}). വിജയിച്ച നമ്പർ: സീരീസ് ${opts.series} ${opts.digits.join(' ')}.`;
    } else {
      transcript = opts.hasWinner && opts.payoutInr
        ? `Attention please! Kerala Lottery Winner! Your ticket won ${opts.prizeTier || '1st Prize'} in ${opts.lotteryName}! Winning code: Series ${opts.series} ${opts.digits.join(' ')}! Payout ₹${opts.payoutInr.toLocaleString('en-IN')} credited to your wallet!`
        : `Kerala State Lotteries Directorate official draw for ${opts.lotteryName} (${opts.drawCode}). Winning number: Series ${opts.series} ${opts.digits.join(' ')}.`;
    }
    setSpokenTranscript(transcript);

    speechAnnouncer.announce({
      lotteryName: opts.lotteryName,
      drawCode: opts.drawCode,
      series: opts.series,
      digits: opts.digits,
      hasWinner: opts.hasWinner,
      prizeTier: opts.prizeTier,
      payoutInr: opts.payoutInr,
      useMalayalam: lang === 'ml',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleReplayAnnouncement = (overrideLang?: 'en' | 'ml') => {
    if (!drawOutcome) return;
    const [finalSeries, finalNumber] = drawOutcome.winningCode.split(' ');
    const finalDigits = finalNumber ? finalNumber.split('') : drumDigits;
    const targetLang = overrideLang || ttsLanguage;
    if (overrideLang) {
      setTtsLanguage(overrideLang);
    }
    triggerHaptic('light');
    sounds.playCoinDrop();
    triggerDrawSpeechAnnouncement({
      lotteryName: currentLottery.name,
      drawCode: currentLottery.drawCode,
      series: finalSeries || drumSeries,
      digits: finalDigits,
      hasWinner: drawOutcome.matchedTickets.length > 0,
      prizeTier: drawOutcome.prizeTier,
      payoutInr: drawOutcome.payoutInr,
      lang: targetLang,
    });
  };

  const handleStopSpeech = () => {
    triggerHaptic('light');
    speechAnnouncer.stop();
    setIsSpeaking(false);
  };

  const handleToggleTts = () => {
    triggerHaptic('light');
    const next = !isTtsEnabled;
    setIsTtsEnabled(next);
    speechAnnouncer.setAnnouncerEnabled(next);
    if (!next) {
      handleStopSpeech();
    }
  };

  // Trigger the Automated Mechanical Draw
  const startAutomatonDraw = (forceWinTicket?: PurchasedTicket) => {
    if (isSpinning) return;

    clearConfetti();
    handleStopSpeech();
    setSpokenTranscript('');
    setIsSpinning(true);
    setDrawOutcome(null);
    setLockedDrums([false, false, false, false, false, false, false]);
    sounds.playDrumClick(300);
    triggerHaptic('medium');

    const availableSeries = currentLottery.seriesAvailable.length > 0 ? currentLottery.seriesAvailable : KERALA_SERIES;

    // Target final outcome:
    let finalSeries: string;
    let finalDigits: string[];

    if (controlledTarget) {
      finalSeries = controlledTarget.series;
      finalDigits = controlledTarget.number.split('');
    } else if (forceWinTicket) {
      finalSeries = forceWinTicket.series;
      finalDigits = forceWinTicket.ticketNumber.split('');
    } else {
      finalSeries = availableSeries[Math.floor(Math.random() * availableSeries.length)];
      finalDigits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString());
    }

    let tick = 0;
    const clickSoundInterval = setInterval(() => {
      sounds.playDrumClick(350 + (tick % 5) * 40);
      tick++;
    }, 90);

    // Rapid spinning visual loop
    spinTimerRef.current = setInterval(() => {
      setDrumSeries(availableSeries[Math.floor(Math.random() * availableSeries.length)]);
      setDrumDigits(Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString()));
    }, 70);

    // Sequentially lock each drum like a real mechanical Kerala lottery automaton!
    // Drum 0: Series (at 1.2s)
    setTimeout(() => {
      setDrumSeries(finalSeries);
      setLockedDrums((prev) => [true, prev[1], prev[2], prev[3], prev[4], prev[5], prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 1200);

    // Drum 1: Digit 1 (at 1.7s)
    setTimeout(() => {
      setDrumDigits((prev) => [finalDigits[0], prev[1], prev[2], prev[3], prev[4], prev[5]]);
      setLockedDrums((prev) => [true, true, prev[2], prev[3], prev[4], prev[5], prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 1700);

    // Drum 2: Digit 2 (at 2.1s)
    setTimeout(() => {
      setDrumDigits((prev) => [finalDigits[0], finalDigits[1], prev[2], prev[3], prev[4], prev[5]]);
      setLockedDrums((prev) => [true, true, true, prev[3], prev[4], prev[5], prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 2100);

    // Drum 3: Digit 3 (at 2.5s)
    setTimeout(() => {
      setDrumDigits((prev) => [finalDigits[0], finalDigits[1], finalDigits[2], prev[3], prev[4], prev[5]]);
      setLockedDrums((prev) => [true, true, true, true, prev[4], prev[5], prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 2500);

    // Drum 4: Digit 4 (at 2.9s)
    setTimeout(() => {
      setDrumDigits((prev) => [finalDigits[0], finalDigits[1], finalDigits[2], finalDigits[3], prev[4], prev[5]]);
      setLockedDrums((prev) => [true, true, true, true, true, prev[5], prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 2900);

    // Drum 5: Digit 5 (at 3.3s)
    setTimeout(() => {
      setDrumDigits((prev) => [finalDigits[0], finalDigits[1], finalDigits[2], finalDigits[3], finalDigits[4], prev[5]]);
      setLockedDrums((prev) => [true, true, true, true, true, true, prev[6]]);
      sounds.playDrumLock();
      triggerHaptic('light');
    }, 3300);

    // Drum 6: Digit 6 (Final Jackpot reveal at 3.8s)
    setTimeout(() => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      clearInterval(clickSoundInterval);

      setDrumDigits(finalDigits);
      setLockedDrums([true, true, true, true, true, true, true]);
      setIsSpinning(false);
      sounds.playDrumLock();
      triggerHaptic('heavy');

      const winningCode = `${finalSeries} ${finalDigits.join('')}`;
      const winningNumberOnly = finalDigits.join('');

      // Check user tickets against the drawn outcome
      const matchingTickets: PurchasedTicket[] = [];
      let wonPayoutInr = 0;
      let wonPayoutTon = 0;
      let wonTier = '';

      userTickets.forEach((t) => {
        if (t.lotteryId === currentLottery.id) {
          // Check 1st Prize: Exact Series + Exact 6 Digits
          if (t.series === finalSeries && t.ticketNumber === winningNumberOnly) {
            matchingTickets.push(t);
            wonPayoutInr += currentLottery.firstPrizeAmount;
            wonPayoutTon += Math.round(currentLottery.firstPrizeAmount / 450);
            wonTier = '1st PRIZE MEGA JACKPOT!';
            onTicketWon(t, currentLottery.firstPrizeAmount, Math.round(currentLottery.firstPrizeAmount / 450), '1st Prize');
          }
          // Check Consolation Prize: Same 6 Digits, Different Series
          else if (t.ticketNumber === winningNumberOnly) {
            matchingTickets.push(t);
            const consolationAmt = currentLottery.isBumper ? 500000 : 8000;
            wonPayoutInr += consolationAmt;
            wonPayoutTon += Math.round(consolationAmt / 450);
            wonTier = 'Consolation Prize (Matching 6 Digits)';
            onTicketWon(t, consolationAmt, Math.round(consolationAmt / 450), 'Consolation Prize');
          }
          // Check 4-Digit Match (Last 4 digits)
          else if (t.ticketNumber.slice(-4) === winningNumberOnly.slice(-4)) {
            matchingTickets.push(t);
            const tierAmt = 5000;
            wonPayoutInr += tierAmt;
            wonPayoutTon += 11.1;
            wonTier = '4th Prize (Last 4 Digits Match)';
            onTicketWon(t, tierAmt, 11.1, '4th Prize');
          }
        }
      });

      if (matchingTickets.length > 0) {
        sounds.playWinningFanfare();
        triggerHaptic('success');
        const isJackpot = wonTier.includes('1st PRIZE');
        const isBumper = currentLottery.isBumper || wonTier.includes('Consolation');
        triggerWinnerConfettiExplosion(isJackpot ? 'jackpot' : isBumper ? 'bumper' : 'standard');
      }

      setDrawOutcome({
        hasDrawn: true,
        winningCode,
        prizeTier: wonTier || '1st Prize Official Draw',
        matchedTickets: matchingTickets,
        payoutInr: wonPayoutInr,
        payoutTon: wonPayoutTon,
      });

      setDrawLog((prev) => [
        `[${new Date().toLocaleTimeString('en-IN')}] ${currentLottery.name} (${currentLottery.drawCode}) Drawn: ${winningCode}`,
        ...prev.slice(0, 4),
      ]);

      // Announce result through Text-To-Speech with dramatic timing
      if (isTtsEnabled) {
        setTimeout(() => {
          triggerDrawSpeechAnnouncement({
            lotteryName: currentLottery.name,
            drawCode: currentLottery.drawCode,
            series: finalSeries,
            digits: finalDigits,
            hasWinner: matchingTickets.length > 0,
            prizeTier: wonTier,
            payoutInr: wonPayoutInr,
            lang: ttsLanguage,
          });
        }, 400);
      }
    }, 3800);
  };

  const userTicketsForThisLottery = userTickets.filter((t) => t.lotteryId === currentLottery.id);

  return (
    <div className="flex flex-col gap-4">
      {/* Automaton Machine Stage Box */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-emerald-950/80 to-slate-950 p-4 sm:p-6 border-2 border-amber-500/40 shadow-2xl shadow-emerald-950/80 overflow-hidden">
        {/* Glowing Top Frame with Kerala State Lotteries Marquee */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-400 tracking-wider uppercase">
                  AUTOMATON DRAW SYSTEM • നറുക്കെടുപ്പ് യന്ത്രം
                </span>
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-emerald-300/80">
                Gorky Bhavan Mechanical Drum Chamber • Directorate of State Lotteries
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Announcer Voice Controls */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-full p-0.5 shadow-inner">
              <button
                id="toggle-tts-announcer-btn"
                onClick={handleToggleTts}
                title={isTtsEnabled ? "Disable live draw audio speech announcements" : "Enable live voice announcer"}
                className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isTtsEnabled
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isTtsEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden sm:inline">Announcer</span>
                <span>{isTtsEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {isTtsEnabled && (
                <div className="flex items-center border-l border-slate-800 pl-1 pr-1 text-[10px] font-bold">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setTtsLanguage('en');
                      if (isSpeaking) handleReplayAnnouncement('en');
                    }}
                    title="English live announcer"
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      ttsLanguage === 'en'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setTtsLanguage('ml');
                      if (isSpeaking) handleReplayAnnouncement('ml');
                    }}
                    title="Malayalam live announcer (മലയാളം)"
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      ttsLanguage === 'ml'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    മലയാളം
                  </button>
                </div>
              )}
            </div>

            {/* Speaking Live Soundwave Badge */}
            {isSpeaking && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[10px] font-extrabold animate-pulse shadow-sm">
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '120ms' }} />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '240ms' }} />
                </span>
                <span className="hidden xs:inline">Announcing...</span>
                <button
                  onClick={handleStopSpeech}
                  title="Silence speech"
                  className="ml-1 p-0.5 rounded hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                </button>
              </div>
            )}

            <div className="px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">3:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* Controlled Target / Admin Bar */}
        {controlledTarget ? (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <div>
                <span className="font-bold text-amber-300">Admin Target Locked:</span>
                <span className="font-mono font-black text-white ml-1.5 px-2 py-0.5 rounded bg-slate-950 border border-amber-500/40">
                  {controlledTarget.series} {controlledTarget.number}
                </span>
                <span className="text-[10px] text-amber-400/80 ml-2 hidden sm:inline">(Next spin guaranteed)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onClearControlledTarget && (
                <button
                  onClick={onClearControlledTarget}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 cursor-pointer"
                >
                  Clear Target
                </button>
              )}
              {onNavigateToAdmin && (
                <button
                  onClick={() => onNavigateToAdmin('automaton')}
                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-[10px] font-black text-slate-950 cursor-pointer"
                >
                  Admin Rigging
                </button>
              )}
            </div>
          </div>
        ) : (
          onNavigateToAdmin && (
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={() => onNavigateToAdmin('automaton')}
                className="text-[11px] font-bold text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>⚙️ Directorate Admin: Rig Automaton Outcome</span>
              </button>
            </div>
          )
        )}

        {/* Lottery Selector Dropdown */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-emerald-800/40">
          <div className="text-xs text-slate-300 font-medium">
            Active Draw: <strong className="text-amber-300">{currentLottery.name}</strong> ({currentLottery.malayalamName})
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              id="automaton-lottery-select"
              value={selectedLotteryId}
              onChange={(e) => setSelectedLotteryId(e.target.value)}
              disabled={isSpinning}
              aria-label="Select Kerala lottery for automaton draw"
              className="bg-slate-900 border border-emerald-600/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400 w-full sm:w-auto cursor-pointer"
            >
              {lotteries.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.drawCode}) - 1st Prize {l.firstPrizeInr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The 7 Mechanical Tumbler Drums Display */}
        <div className="relative py-4 px-2 sm:px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-amber-500/50 shadow-inner flex flex-col items-center">
          {/* Machine Header Brass Plate */}
          <div className="mb-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-md">
            1st PRIZE DRUMS • ഒന്നാം സമ്മാന നറുക്കെടുപ്പ്
          </div>

          {/* Drum Cylinders Grid */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
            {/* Drum 0: Series Drum (e.g. WA) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-amber-400/80 mb-1 uppercase tracking-wider">SERIES</span>
              <div
                className={`w-14 sm:w-16 h-20 sm:h-24 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-950 shadow-xl transition-all duration-200 border-2 ${
                  lockedDrums[0]
                    ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border-amber-300 shadow-amber-500/40 ring-2 ring-amber-400/50 scale-105'
                    : 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 border-slate-600 text-slate-300 animate-pulse'
                }`}
              >
                {drumSeries}
              </div>
            </div>

            {/* Visual separator */}
            <div className="h-12 w-0.5 bg-amber-500/30 self-center hidden sm:block mx-1" />

            {/* Drums 1-6: The 6 Digit Wheels */}
            {drumDigits.map((digit, idx) => {
              const isLocked = lockedDrums[idx + 1];
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-400/80 mb-1 uppercase tracking-wider">
                    D{idx + 1}
                  </span>
                  <div
                    className={`w-10 sm:w-12 h-20 sm:h-24 rounded-xl flex items-center justify-center font-mono font-black text-2xl sm:text-3xl shadow-xl transition-all duration-200 border-2 ${
                      isLocked
                        ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 text-slate-950 border-emerald-300 shadow-emerald-500/40 ring-2 ring-emerald-400/40'
                        : 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 text-slate-300 border-slate-600 animate-pulse'
                    }`}
                  >
                    {digit}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winning Code Indicator Bar */}
          <div className="mt-4 flex items-center justify-between w-full px-2 text-xs">
            <span className="text-slate-400">
              Selected 1st Prize: <strong className="text-amber-400 font-mono">{currentLottery.firstPrizeInr}</strong>
            </span>
            <span className="text-emerald-300 font-mono font-bold">
              {lockedDrums.every(Boolean) ? `${drumSeries} ${drumDigits.join('')}` : 'DRAWING IN PROGRESS...'}
            </span>
          </div>
        </div>

        {/* Draw Action Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            <span>You hold </span>
            <strong className="text-amber-400 font-bold">{userTicketsForThisLottery.length} ticket(s)</strong>
            <span> for {currentLottery.name}.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Primary Automaton Draw Button */}
            <button
              id="start-automaton-draw-btn"
              onClick={() => startAutomatonDraw()}
              disabled={isSpinning}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
              }`}
            >
              {isSpinning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Spinning Drums...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Start Automaton Draw
                </>
              )}
            </button>

            {/* Test Win Demo trigger to test winning & confetti */}
            {userTicketsForThisLottery.length > 0 ? (
              <button
                id="test-win-automaton-btn"
                onClick={() => startAutomatonDraw(userTicketsForThisLottery[0])}
                disabled={isSpinning}
                title="Simulate draw matching your ticket to trigger prize win & confetti explosion"
                className="px-3.5 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Test My Ticket (Win Demo)</span>
              </button>
            ) : userTickets.length > 0 ? (
              <button
                id="test-win-automaton-btn"
                onClick={() => {
                  const targetTicket = userTickets[0];
                  setSelectedLotteryId(targetTicket.lotteryId);
                  setTimeout(() => {
                    startAutomatonDraw(targetTicket);
                  }, 60);
                }}
                disabled={isSpinning}
                title="Switch to your active ticket and test winning & confetti explosion"
                className="px-3.5 py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-600/50 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Test Win (My Ticket)</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Draw Outcome Banner if Drawn */}
        {drawOutcome && (
          <div
            className={`mt-4 p-4 rounded-2xl border transition-all ${
              drawOutcome.matchedTickets.length > 0
                ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-amber-400 shadow-xl shadow-amber-500/20'
                : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            {drawOutcome.matchedTickets.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/40 animate-bounce">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-amber-400 font-extrabold text-sm uppercase tracking-wide">
                      🎉 BUMPER WIN CONFIRMED! {drawOutcome.prizeTier}
                    </div>
                    <div className="text-white font-extrabold text-lg">
                      You won ₹{drawOutcome.payoutInr.toLocaleString('en-IN')} ({drawOutcome.payoutTon} TON)!
                    </div>
                    <p className="text-xs text-emerald-300">
                      Auto-credited to your Telegram TON Wallet: <span className="font-mono">{wallet.shortAddress}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="retrigger-tts-btn"
                    onClick={isSpeaking ? handleStopSpeech : () => handleReplayAnnouncement()}
                    title={isSpeaking ? "Stop voice announcement" : "Replay live official announcer voice"}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md ${
                      isSpeaking
                        ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-300'
                        : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/60 text-emerald-200'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>Replay Voice 📢</span>
                      </>
                    )}
                  </button>

                  <button
                    id="retrigger-confetti-btn"
                    onClick={() => {
                      triggerHaptic('success');
                      sounds.playWinningFanfare();
                      const isJackpot = drawOutcome.prizeTier.includes('1st PRIZE');
                      const isBumper = currentLottery.isBumper || drawOutcome.prizeTier.includes('Consolation');
                      triggerWinnerConfettiExplosion(isJackpot ? 'jackpot' : isBumper ? 'bumper' : 'standard');
                    }}
                    title="Explode celebratory confetti again!"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confetti Blast 🎉</span>
                  </button>
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                    CLAIMED TO WALLET
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Official winning number drawn: <strong className="text-amber-300 font-mono text-sm">{drawOutcome.winningCode}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="hear-tts-result-btn"
                    onClick={isSpeaking ? handleStopSpeech : () => handleReplayAnnouncement()}
                    title={isSpeaking ? "Stop voice" : "Hear official draw result spoken aloud"}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm ${
                      isSpeaking
                        ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-3 h-3 text-rose-400 fill-current" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hear Voice Announcement 📢</span>
                      </>
                    )}
                  </button>
                  <span className="text-slate-400 hidden md:inline">Better luck on next draw!</span>
                </div>
              </div>
            )}

            {/* Live Announcer Broadcast Transcript Preview */}
            {spokenTranscript && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/25">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span>🎙️ GORKY BHAVAN OFFICIAL LIVE ANNOUNCEMENT ({ttsLanguage === 'ml' ? 'മലയാളം' : 'ENGLISH'})</span>
                      {isSpeaking && (
                        <span className="flex items-center gap-0.5 h-2">
                          <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-1.5" />
                          <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '120ms' }} />
                          <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '240ms' }} />
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 normal-case">
                      <button
                        onClick={() => handleReplayAnnouncement(ttsLanguage === 'ml' ? 'en' : 'ml')}
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer text-[10px]"
                      >
                        Switch to {ttsLanguage === 'ml' ? 'English' : 'മലയാളം'}
                      </button>
                      {isSpeaking && (
                        <button
                          onClick={handleStopSpeech}
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer text-[10px]"
                        >
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-mono italic leading-relaxed">
                    "{spokenTranscript}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kerala Draw Rules & Information */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col gap-3">
        <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          About Kerala Official Automaton Draw
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Kerala State Lottery draws are conducted transparently using mechanical draw machines (Automaton Drums) at Gorky Bhavan, Thiruvananthapuram. Each digit drum is independently spun and locked, ensuring complete randomness and verifiable fairness. Winnings are automatically settled to your connected Telegram TON Wallet.
        </p>
      </div>
    </div>
  );
};
