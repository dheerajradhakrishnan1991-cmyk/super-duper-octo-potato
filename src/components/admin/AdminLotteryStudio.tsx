import React, { useState } from 'react';
import { KeralaLottery, TabType } from '../../types';
import { TON_INR_RATE } from '../../data/lotteries';
import { triggerHaptic } from '../../utils/haptics';
import { sounds } from '../../utils/audio';
import { Plus, Edit2, Trash2, ShoppingCart, ExternalLink, Radio, Check, X, Sparkles, Layers, Sliders } from 'lucide-react';

interface AdminLotteryStudioProps {
  lotteries: KeralaLottery[];
  onUpdateLotteries: (updated: KeralaLottery[]) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenBuyModalForLottery?: (lottery: KeralaLottery) => void;
  onSelectForDraw?: (lotteryId: string) => void;
  notify: (msg: string) => void;
}

export const AdminLotteryStudio: React.FC<AdminLotteryStudioProps> = ({
  lotteries,
  onUpdateLotteries,
  onNavigateTab,
  onOpenBuyModalForLottery,
  onSelectForDraw,
  notify,
}) => {
  const [isAddingLottery, setIsAddingLottery] = useState(false);
  const [editingLotteryId, setEditingLotteryId] = useState<string | null>(null);

  // New Custom Lottery State
  const [newLottery, setNewLottery] = useState<{
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
    isBumper: boolean;
    series: string;
    totalTickets: number;
    ticketsSold: number;
    colorTheme: KeralaLottery['colorTheme'];
  }>({
    name: 'Pooja Bumper 2026',
    malayalamName: 'പൂജ ബമ്പർ 2026',
    drawCode: 'BR-94',
    ticketPriceInr: 300,
    ticketPriceTon: +(300 / TON_INR_RATE).toFixed(2),
    firstPrizeInr: '₹12 CRORE',
    firstPrizeAmount: 120000000,
    secondPrize: '₹1 Crore',
    thirdPrize: '₹10 Lakhs',
    consolationPrize: '₹1,00,000',
    drawDate: 'Next Sunday, 15:00 IST',
    isBumper: true,
    series: 'PA, PB, PC, PD, PE, PF',
    totalTickets: 75000,
    ticketsSold: 12500,
    colorTheme: 'gold',
  });

  // Template Loader Helper
  const loadPreset = (preset: 'vishu' | 'pooja' | 'summer' | 'fifty' | 'custom') => {
    triggerHaptic('light');
    if (preset === 'vishu') {
      setNewLottery({
        name: 'Vishu Bumper 2026',
        malayalamName: 'വിഷു ബമ്പർ 2026',
        drawCode: 'VB-12',
        ticketPriceInr: 250,
        ticketPriceTon: +(250 / TON_INR_RATE).toFixed(2),
        firstPrizeInr: '₹12 CRORE',
        firstPrizeAmount: 120000000,
        secondPrize: '₹1 Crore',
        thirdPrize: '₹10 Lakhs',
        consolationPrize: '₹1,00,000',
        drawDate: 'May 24, 2026 • 15:00 IST',
        isBumper: true,
        series: 'VA, VB, VC, VD, VE, VG',
        totalTickets: 80000,
        ticketsSold: 24000,
        colorTheme: 'gold',
      });
    } else if (preset === 'summer') {
      setNewLottery({
        name: 'Summer Dhamaka Bumper',
        malayalamName: 'സമ്മർ ധമാക്ക ബമ്പർ',
        drawCode: 'SD-88',
        ticketPriceInr: 150,
        ticketPriceTon: +(150 / TON_INR_RATE).toFixed(2),
        firstPrizeInr: '₹6 CRORE',
        firstPrizeAmount: 60000000,
        secondPrize: '₹50 Lakhs',
        thirdPrize: '₹5 Lakhs',
        consolationPrize: '₹50,000',
        drawDate: 'June 15, 2026 • 15:00 IST',
        isBumper: true,
        series: 'SA, SB, SC, SD, SE',
        totalTickets: 50000,
        ticketsSold: 18000,
        colorTheme: 'amber',
      });
    } else if (preset === 'fifty') {
      setNewLottery({
        name: 'Fifty-Fifty Weekly',
        malayalamName: 'ഫിഫ്റ്റി-ഫിഫ്റ്റി പ്രതിവാരം',
        drawCode: 'FF-105',
        ticketPriceInr: 50,
        ticketPriceTon: +(50 / TON_INR_RATE).toFixed(2),
        firstPrizeInr: '₹1 CRORE',
        firstPrizeAmount: 10000000,
        secondPrize: '₹10 Lakhs',
        thirdPrize: '₹5,000',
        consolationPrize: '₹8,000',
        drawDate: 'Every Wednesday • 15:00 IST',
        isBumper: false,
        series: 'FA, FB, FC, FD, FE, FG, FH',
        totalTickets: 60000,
        ticketsSold: 35000,
        colorTheme: 'emerald',
      });
    }
  };

  // Create Lottery Submission
  const handleCreateLottery = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    sounds.playWinningFanfare();

    const id = `${newLottery.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const seriesList = newLottery.series
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const created: KeralaLottery = {
      id,
      name: newLottery.name,
      malayalamName: newLottery.malayalamName,
      drawCode: newLottery.drawCode,
      ticketPriceInr: Number(newLottery.ticketPriceInr),
      ticketPriceTon: Number(newLottery.ticketPriceTon),
      firstPrizeInr: newLottery.firstPrizeInr,
      firstPrizeAmount: Number(newLottery.firstPrizeAmount),
      secondPrize: newLottery.secondPrize,
      thirdPrize: newLottery.thirdPrize,
      consolationPrize: newLottery.consolationPrize,
      drawDate: newLottery.drawDate,
      drawTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      colorTheme: newLottery.colorTheme,
      isBumper: newLottery.isBumper,
      seriesAvailable: seriesList.length > 0 ? seriesList : ['PA', 'PB', 'PC', 'PD'],
      ticketsSold: Number(newLottery.ticketsSold),
      totalTickets: Number(newLottery.totalTickets),
      drawStatus: 'upcoming',
      liveDrawTime: '15:00 IST',
      tagline: 'Directorate Gazetted Custom Lottery Scheme',
    };

    onUpdateLotteries([created, ...lotteries]);
    setIsAddingLottery(false);
    notify(`Registered new custom lottery "${created.name}" (${created.drawCode}) into live system!`);
  };

  // Update Lottery Sales Pool
  const handleUpdateSales = (id: string, delta: number) => {
    triggerHaptic('light');
    const updated = lotteries.map((l) => {
      if (l.id === id) {
        const next = Math.max(0, Math.min(l.totalTickets, l.ticketsSold + delta));
        return { ...l, ticketsSold: next };
      }
      return l;
    });
    onUpdateLotteries(updated);
    notify(`Updated ticket sales pool for ${id}`);
  };

  // Delete Lottery
  const handleDeleteLottery = (id: string, name: string) => {
    if (lotteries.length <= 1) {
      notify('Cannot delete the only remaining lottery in the system.');
      return;
    }
    triggerHaptic('medium');
    const updated = lotteries.filter((l) => l.id !== id);
    onUpdateLotteries(updated);
    notify(`Removed lottery "${name}" from system catalog.`);
  };

  // Toggle Draw Status
  const handleToggleStatus = (id: string) => {
    triggerHaptic('light');
    const updated = lotteries.map((l) => {
      if (l.id === id) {
        const nextStatus = l.drawStatus === 'upcoming' ? 'drawing' : l.drawStatus === 'drawing' ? 'drawn' : 'upcoming';
        return { ...l, drawStatus: nextStatus as KeralaLottery['drawStatus'] };
      }
      return l;
    });
    onUpdateLotteries(updated);
    notify(`Updated draw status for ${id}`);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Header & Registration Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Custom Lottery Scheme Studio
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {lotteries.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, customize, edit, and conduct custom Kerala State lottery schemes in real time.
          </p>
        </div>

        <button
          id="admin-create-custom-lottery-btn"
          onClick={() => {
            triggerHaptic('light');
            setIsAddingLottery(!isAddingLottery);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingLottery ? 'Close Studio' : '+ Create Custom Lottery'}</span>
        </button>
      </div>

      {/* Creation Form with Preset Templates */}
      {isAddingLottery && (
        <form
          onSubmit={handleCreateLottery}
          className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/60 shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Register Custom Gazette Lottery</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Choose a pre-filled template or configure a fully customized lottery scheme.
              </span>
            </div>

            {/* Template Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset('vishu')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-400 font-bold border border-slate-700 cursor-pointer"
              >
                Vishu (₹12 Cr)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('summer')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-400 font-bold border border-slate-700 cursor-pointer"
              >
                Summer (₹6 Cr)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('fifty')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-bold border border-slate-700 cursor-pointer"
              >
                Weekly (₹1 Cr)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Lottery Name:</label>
              <input
                type="text"
                required
                value={newLottery.name}
                onChange={(e) => setNewLottery({ ...newLottery, name: e.target.value })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Malayalam Name:</label>
              <input
                type="text"
                required
                value={newLottery.malayalamName}
                onChange={(e) => setNewLottery({ ...newLottery, malayalamName: e.target.value })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Draw Code (Gazette):</label>
              <input
                type="text"
                required
                value={newLottery.drawCode}
                onChange={(e) => setNewLottery({ ...newLottery, drawCode: e.target.value.toUpperCase() })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Ticket Price (₹):</label>
              <input
                type="number"
                required
                min="10"
                value={newLottery.ticketPriceInr}
                onChange={(e) => {
                  const inr = Number(e.target.value);
                  setNewLottery({
                    ...newLottery,
                    ticketPriceInr: inr,
                    ticketPriceTon: +(inr / TON_INR_RATE).toFixed(2),
                  });
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Price in TON (💎):</label>
              <input
                type="number"
                step="0.01"
                required
                value={newLottery.ticketPriceTon}
                onChange={(e) => setNewLottery({ ...newLottery, ticketPriceTon: Number(e.target.value) })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">1st Prize Label:</label>
              <input
                type="text"
                required
                value={newLottery.firstPrizeInr}
                onChange={(e) => setNewLottery({ ...newLottery, firstPrizeInr: e.target.value })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-black outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Available Series (comma-separated):</label>
              <input
                type="text"
                required
                value={newLottery.series}
                onChange={(e) => setNewLottery({ ...newLottery, series: e.target.value.toUpperCase() })}
                placeholder="PA, PB, PC, PD, PE"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Draw Date Text:</label>
              <input
                type="text"
                required
                value={newLottery.drawDate}
                onChange={(e) => setNewLottery({ ...newLottery, drawDate: e.target.value })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Total Ticket Supply:</label>
              <input
                type="number"
                required
                value={newLottery.totalTickets}
                onChange={(e) => setNewLottery({ ...newLottery, totalTickets: Number(e.target.value) })}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newLottery.isBumper}
                onChange={(e) => setNewLottery({ ...newLottery, isBumper: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500"
              />
              <span>Mark as Official Bumper Lottery (Special Gazetted Badge)</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingLottery(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Confirm & Publish Scheme
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lotteries Cards List with Direct Action Links */}
      <div className="flex flex-col gap-3">
        {lotteries.map((l) => (
          <div
            key={l.id}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-white">{l.name}</h4>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {l.drawCode}
                  </span>
                  {l.isBumper && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase">
                      BUMPER
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                    l.drawStatus === 'drawing'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : l.drawStatus === 'drawn'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {l.drawStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>1st Prize: <strong className="text-emerald-400 font-black">{l.firstPrizeInr}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-white">₹{l.ticketPriceInr}</strong> ({l.ticketPriceTon} TON)</span>
                  <span>•</span>
                  <span>Draw: {l.drawDate}</span>
                </div>
              </div>

              {/* Sales Pool Adjuster */}
              <div className="flex items-center gap-2">
                <div className="text-right font-mono text-xs">
                  <div className="text-white font-bold">
                    {l.ticketsSold.toLocaleString()} / {l.totalTickets.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {Math.round((l.ticketsSold / l.totalTickets) * 100)}% sold
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateSales(l.id, -500)}
                    title="Simulate refund (-500)"
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                  >
                    -500
                  </button>
                  <button
                    onClick={() => handleUpdateSales(l.id, 500)}
                    title="Simulate sales (+500)"
                    className="px-2 py-1 rounded bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    +500
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Action Links Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Buy Ticket Directly */}
                <button
                  onClick={() => onOpenBuyModalForLottery?.(l)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer text-[11px]"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Ticket</span>
                </button>

                {/* View in Consumer Catalog */}
                <button
                  onClick={() => onNavigateTab('lotteries')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>View in Catalog</span>
                </button>

                {/* Conduct Draw for this Lottery */}
                <button
                  onClick={() => onSelectForDraw?.(l.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer text-[11px]"
                >
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Conduct Draw</span>
                </button>

                {/* Toggle Status */}
                <button
                  onClick={() => handleToggleStatus(l.id)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium cursor-pointer"
                >
                  Status: {l.drawStatus}
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteLottery(l.id, l.name)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Remove lottery from system"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
