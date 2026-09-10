export type TabType = 'lotteries' | 'my_tickets' | 'automaton' | 'results' | 'wallet' | 'admin';

export interface TelegramWalletState {
  isConnected: boolean;
  walletType: 'telegram_wallet' | 'tonkeeper' | 'ton_space' | 'mytonwallet' | null;
  address: string;
  shortAddress: string;
  username: string;
  balanceTon: number;
  balanceInr: number;
  network: 'mainnet' | 'testnet';
}

export interface KeralaLottery {
  id: string;
  name: string;
  malayalamName: string;
  drawCode: string;
  ticketPriceInr: number;
  ticketPriceTon: number;
  firstPrizeInr: string;
  firstPrizeAmount: number;
  secondPrize: string;
  thirdPrize: string;
  consolationPrize: string;
  drawDate: string;
  drawTimestamp: number;
  colorTheme: 'emerald' | 'gold' | 'blue' | 'purple' | 'amber';
  isBumper: boolean;
  seriesAvailable: string[];
  ticketsSold: number;
  totalTickets: number;
  drawStatus: 'upcoming' | 'drawing' | 'drawn';
  liveDrawTime: string;
  tagline: string;
}

export interface PurchasedTicket {
  id: string;
  lotteryId: string;
  lotteryName: string;
  malayalamName: string;
  drawCode: string;
  series: string;
  ticketNumber: string;
  fullCode: string; // e.g. "WA 459203"
  purchaseDate: string;
  purchaseTimestamp: number;
  pricePaidInr: number;
  pricePaidTon: number;
  paymentMethod: 'telegram_wallet' | 'ton_space' | 'tonkeeper' | 'inr_wallet';
  transactionHash: string;
  drawDate: string;
  drawTimestamp: number;
  status: 'active' | 'won' | 'lost' | 'drawn';
  winPrizeTier?: string;
  winAmountInr?: number;
  winAmountTon?: number;
  isClaimed?: boolean;
  isScratched?: boolean;
  barcode: string;
  securityCode: string;
}

export interface DrawAutomatonState {
  isSpinning: boolean;
  activeLotteryId: string;
  step: 'idle' | 'spinning_series' | 'spinning_digits' | 'complete';
  drumRotations: number[];
  revealedSeries: string;
  revealedDigits: string[];
  winningFullCode: string;
  currentPrizeTier: string;
  matchedWinningTickets: PurchasedTicket[];
  totalPayoutWonInr: number;
  totalPayoutWonTon: number;
}

export interface OfficialDrawResult {
  id?: string;
  lotteryId: string;
  lotteryName: string;
  malayalamName: string;
  drawCode: string;
  drawDate: string;
  venue: string;
  firstPrize: {
    series: string;
    number: string;
    fullCode: string;
    amount: string;
  };
  consolationPrizes: string[];
  secondPrize: {
    numbers: string[];
    amount: string;
  };
  thirdPrize: {
    numbers: string[];
    amount: string;
  };
  lastFourDigits: string[];
}

export interface LotteryTransaction {
  id: string;
  type: 'purchase' | 'win_payout' | 'faucet' | 'wallet_credit';
  title: string;
  ticketCode?: string;
  amountTon: number;
  amountInr: number;
  timestamp: string;
  txHash: string;
  status: 'confirmed' | 'pending';
}

export interface RecentWinner {
  id: string;
  username: string;
  avatarLetter: string;
  lotteryName: string;
  ticketCode: string;
  prizeAmount: string;
  timeAgo: string;
  isBumper?: boolean;
}
