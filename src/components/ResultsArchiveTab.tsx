import React, { useState } from 'react';
import { OfficialDrawResult } from '../types';
import { OFFICIAL_PAST_RESULTS } from '../data/lotteries';
import { Search, Trophy, CheckCircle2, XCircle, Calendar, MapPin, Award, ExternalLink } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ResultsArchiveTabProps {
  useMalayalam: boolean;
  officialResults?: OfficialDrawResult[];
}

export const ResultsArchiveTab: React.FC<ResultsArchiveTabProps> = ({ useMalayalam, officialResults = OFFICIAL_PAST_RESULTS }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    isWinner: boolean;
    prizeDetails?: string;
    ticketCode: string;
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    triggerHaptic('medium');
    const cleanQuery = searchQuery.trim().toUpperCase();

    // Check if query matches any first prize or consolation in past results
    let winnerFound = false;
    let details = '';

    for (const res of officialResults) {
      if (cleanQuery.includes(res.firstPrize.number) || cleanQuery === res.firstPrize.fullCode) {
        winnerFound = true;
        details = `1st Prize Winner in ${res.lotteryName} (${res.firstPrize.amount})!`;
        break;
      }
      if (res.consolationPrizes.some((p) => cleanQuery.includes(p))) {
        winnerFound = true;
        details = `Consolation Prize Winner in ${res.lotteryName}!`;
        break;
      }
      if (res.lastFourDigits.some((d) => cleanQuery.endsWith(d))) {
        winnerFound = true;
        details = `Last 4 Digits Prize Winner in ${res.lotteryName} (₹5,000)!`;
        break;
      }
    }

    setSearchResult({
      searched: true,
      isWinner: winnerFound,
      prizeDetails: details,
      ticketCode: cleanQuery,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Official Government Draw Results Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-700/60 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              🏛️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {useMalayalam ? 'ഔദ്യോഗിക ഫലങ്ങൾ' : 'Official Kerala Lottery Gazette Results'}
              </h3>
              <p className="text-[11px] text-emerald-300">
                Conducted at Gorky Bhavan, Thiruvananthapuram • Daily 3:00 PM IST
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            Live Verified
          </span>
        </div>

        {/* Quick Ticket Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Check Ticket Number (e.g. TE 230662 or 230662)"
              className="w-full bg-slate-950 border border-emerald-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
          >
            Check
          </button>
        </form>

        {/* Search Result Banner */}
        {searchResult && searchResult.searched && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              searchResult.isWinner
                ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            {searchResult.isWinner ? (
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <div>
              <div className="font-bold">
                Ticket: <span className="font-mono text-white">{searchResult.ticketCode}</span>
              </div>
              <div>{searchResult.isWinner ? searchResult.prizeDetails : 'No prize match found in the gazette.'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Official Past Draw Gazettes */}
      <div className="flex flex-col gap-3.5">
        {officialResults.map((res, idx) => (
          <div
            key={res.id || `${res.lotteryId}-${res.drawCode}-${idx}`}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3 shadow-md"
          >
            {/* Draw Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400">{res.drawCode}</span>
                  <h4 className="text-sm font-extrabold text-white">{res.lotteryName}</h4>
                </div>
                <div className="text-xs text-emerald-400 font-medium">{res.malayalamName}</div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{res.drawDate}</span>
                </div>
                <span className="text-[10px] text-slate-500">{res.venue}</span>
              </div>
            </div>

            {/* First Prize Highlight */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  1st Prize Winner (ഒന്നാം സമ്മാനം)
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-white">
                  {res.firstPrize.fullCode}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-amber-400 block">
                  {res.firstPrize.amount}
                </span>
                <span className="text-[10px] text-emerald-300">Govt Verified</span>
              </div>
            </div>

            {/* Consolation Prizes & 2nd Prize */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Consolation Prizes:</span>
                <div className="font-mono text-[11px] text-emerald-300 flex flex-wrap gap-1">
                  {res.consolationPrizes.slice(0, 4).map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Last 4 Digits (₹5,000):</span>
                <div className="font-mono text-[11px] text-amber-300 flex flex-wrap gap-1">
                  {res.lastFourDigits.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
