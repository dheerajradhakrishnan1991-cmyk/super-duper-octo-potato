import confetti from 'canvas-confetti';

// Kerala Festival & Lottery celebration color palettes
export const KERALA_WIN_COLORS = [
  '#f59e0b', // Amber / Gold
  '#fbbf24', // Warm Gold
  '#10b981', // Kerala Emerald Green
  '#06b6d4', // Kasavu Blue / Cyan
  '#ec4899', // Festivity Pink
  '#8b5cf6', // Royal Violet
  '#ffffff', // Sparkle White
  '#e11d48', // Kumkum Red
];

export const GOLD_STAR_COLORS = ['#ffd700', '#f59e0b', '#fbbf24', '#ffffff', '#fef08a'];

let activeTimeouts: NodeJS.Timeout[] = [];

/**
 * Clear any pending confetti bursts
 */
export function clearConfetti(): void {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];
  try {
    confetti.reset();
  } catch {
    // ignore
  }
}

/**
 * Triggers a multi-stage, high-energy confetti explosion effect
 * specifically crafted for Kerala Lottery prize wins in the Draw Automaton.
 *
 * @param intensity 'jackpot' for 1st Prize Mega Jackpot, 'bumper' for Consolation/Bumper, or 'standard'
 */
export function triggerWinnerConfettiExplosion(
  intensity: 'jackpot' | 'bumper' | 'standard' = 'jackpot'
): void {
  clearConfetti();

  // Helper to schedule a burst and track timeout
  const scheduleBurst = (delayMs: number, options: confetti.Options) => {
    const timeout = setTimeout(() => {
      try {
        confetti({
          zIndex: 9999,
          disableForReducedMotion: true,
          ...options,
        });
      } catch {
        // ignore safely if canvas context is unavailable
      }
    }, delayMs);
    activeTimeouts.push(timeout);
  };

  // Wave 1: Immediate massive central explosion blast
  scheduleBurst(0, {
    particleCount: intensity === 'jackpot' ? 140 : 100,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.55 },
    colors: KERALA_WIN_COLORS,
    ticks: 260,
  });

  // Wave 2: Dual-cannon side blasts shooting up from bottom corners
  scheduleBurst(200, {
    particleCount: intensity === 'jackpot' ? 85 : 60,
    angle: 60,
    spread: 70,
    startVelocity: 55,
    origin: { x: 0.05, y: 0.85 },
    colors: KERALA_WIN_COLORS,
    ticks: 240,
  });

  scheduleBurst(200, {
    particleCount: intensity === 'jackpot' ? 85 : 60,
    angle: 120,
    spread: 70,
    startVelocity: 55,
    origin: { x: 0.95, y: 0.85 },
    colors: KERALA_WIN_COLORS,
    ticks: 240,
  });

  // Wave 3: Golden Star & Coin Shower from upper sky
  scheduleBurst(450, {
    particleCount: intensity === 'jackpot' ? 70 : 45,
    spread: 90,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.3 },
    shapes: ['star', 'circle'],
    colors: GOLD_STAR_COLORS,
    scalar: 1.25,
    gravity: 0.8,
    ticks: 280,
  });

  // Wave 4: Lateral cross-bursts with gentle fluttering drift
  scheduleBurst(700, {
    particleCount: 65,
    angle: 75,
    spread: 60,
    startVelocity: 45,
    origin: { x: 0.15, y: 0.75 },
    colors: KERALA_WIN_COLORS,
    drift: 0.5,
    ticks: 250,
  });

  scheduleBurst(700, {
    particleCount: 65,
    angle: 105,
    spread: 60,
    startVelocity: 45,
    origin: { x: 0.85, y: 0.75 },
    colors: KERALA_WIN_COLORS,
    drift: -0.5,
    ticks: 250,
  });

  // Wave 5: Jackpot extra fireworks finale for bumper / 1st prize wins
  if (intensity === 'jackpot' || intensity === 'bumper') {
    scheduleBurst(1050, {
      particleCount: 110,
      spread: 120,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.45 },
      shapes: ['star', 'square', 'circle'],
      colors: ['#ffd700', '#f59e0b', '#10b981', '#ec4899', '#ffffff'],
      scalar: 1.15,
      ticks: 300,
    });

    scheduleBurst(1400, {
      particleCount: 80,
      spread: 80,
      startVelocity: 38,
      origin: { x: 0.5, y: 0.5 },
      colors: GOLD_STAR_COLORS,
      ticks: 220,
    });
  }
}
