// Text-to-Speech (TTS) Announcement Engine for Kerala Lottery Draw Automaton
// Simulates the dramatic official live draw announcer at Gorky Bhavan, Thiruvananthapuram

export interface DrawAnnouncementParams {
  lotteryName: string;
  drawCode: string;
  series: string;
  digits: string[]; // e.g. ['4', '8', '2', '9', '1', '5']
  hasWinner: boolean;
  prizeTier?: string;
  payoutInr?: number;
  useMalayalam?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

class LotterySpeechAnnouncer {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kl_tts_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        // ignore
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.findBestVoice();
        };
        this.findBestVoice();
      }
    }
  }

  private findBestVoice(forMalayalam: boolean = false): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (forMalayalam) {
      const mlVoice = voices.find((v) => v.lang.startsWith('ml') || v.lang.includes('IN'));
      if (mlVoice) return mlVoice;
    }

    // Try finding Indian English voice first (en-IN) for authentic regional flair
    const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
    if (indianVoice) return indianVoice;

    // Fallback to high quality English voice
    const naturalVoice = voices.find((v) => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
    );
    if (naturalVoice) return naturalVoice;

    return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public isAnnouncerEnabled(): boolean {
    return this.enabled;
  }

  public setAnnouncerEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('kl_tts_enabled', enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
    if (!enabled) {
      this.stop();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }

  // Format Kerala ticket digits with deliberate pacing for clear announcements
  private formatDigitsForSpeech(digits: string[]): string {
    return digits.join(', ');
  }

  // Format currency into spoken words (Crore, Lakhs, Thousands)
  private formatAmountSpoken(amount: number): string {
    if (amount >= 10000000) {
      const crores = (amount / 10000000).toFixed(0);
      return `${crores} Crore Rupees`;
    }
    if (amount >= 100000) {
      const lakhs = (amount / 100000).toFixed(0);
      return `${lakhs} Lakh Rupees`;
    }
    return `${amount.toLocaleString('en-IN')} Rupees`;
  }

  // Main Announcement Generator
  public announce(params: DrawAnnouncementParams) {
    if (!this.isSupported() || !this.enabled) return;

    this.stop();

    const {
      lotteryName,
      drawCode,
      series,
      digits,
      hasWinner,
      prizeTier,
      payoutInr,
      useMalayalam = false,
      onStart,
      onEnd,
    } = params;

    const seriesSpoken = series.split('').join(' ');
    const digitsSpoken = this.formatDigitsForSpeech(digits);

    let speechText = '';

    if (useMalayalam) {
      // Malayalam Announcer Script
      if (hasWinner && payoutInr && payoutInr > 0) {
        speechText = `ശ്രദ്ധിക്കുക! ഭാഗ്യക്കുറി നറുക്കെടുപ്പ് ഫലം! അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ ടിക്കറ്റ് ഒന്നാം സമ്മാനം നേടിയിരിക്കുന്നു! വിജയിച്ച നമ്പർ: സീരീസ് ${seriesSpoken}, ${digitsSpoken}! സമ്മാനത്തുക ${payoutInr.toLocaleString('en-IN')} രൂപ!`;
      } else {
        speechText = `കേരള സംസ്ഥാന ഭാഗ്യക്കുറി നറുക്കെടുപ്പ് ഫലം. ${lotteryName}, ഡ്രോ നമ്പർ ${drawCode}. ഭാഗ്യ നമ്പർ: സീരീസ് ${seriesSpoken}, ${digitsSpoken}!`;
      }
    } else {
      // English Dramatic Official Kerala Lottery Announcer Script
      if (hasWinner && payoutInr && payoutInr > 0) {
        const spokenAmt = this.formatAmountSpoken(payoutInr);
        if (prizeTier?.includes('1st PRIZE')) {
          speechText = `Attention please! Kerala State Lottery Mega Jackpot Winner! Congratulations! Your ticket has struck the First Prize in ${lotteryName}! Winning ticket code: Series ${seriesSpoken}, ${digitsSpoken}! A prize payout of ${spokenAmt} has been credited to your Telegram Wallet!`;
        } else if (prizeTier?.includes('Consolation')) {
          speechText = `Official announcement! Congratulations! Your ticket matched all six lucky digits for the Consolation Prize in ${lotteryName}! Winning code: Series ${seriesSpoken}, ${digitsSpoken}! Payout: ${spokenAmt}!`;
        } else {
          speechText = `Winner announcement! Congratulations! Your ticket matched the lucky winning digits in ${lotteryName}! Winning number: ${digitsSpoken}!`;
        }
      } else {
        speechText = `Kerala State Lotteries Directorate official live draw result for ${lotteryName}, draw code ${drawCode}. The winning lucky number is: Series ${seriesSpoken}, ${digitsSpoken}. Official result confirmed.`;
      }
    }

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      const voice = this.findBestVoice(useMalayalam);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.95; // Slightly measured pacing for clear announcer delivery
      utterance.pitch = hasWinner ? 1.1 : 1.0; // Higher excitement pitch for winners
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

export const speechAnnouncer = new LotterySpeechAnnouncer();
