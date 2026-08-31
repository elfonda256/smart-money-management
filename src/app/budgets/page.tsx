'use client';

import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Trash2, 
  Edit3, 
  ArrowRight,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { formatCurrency, parseNumericInput } from '@/lib/utils/formatters';

export default function BudgetsPage() {
  const { 
    categories, 
    budgets, 
    transactions, 
    setBudget, 
    deleteBudget, 
    voiceSettings,
    activeProfile,
    theme 
  } = useFinancial();

  const isLight = theme === 'light';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories.find(c => c.type === 'expense')?.id || '');
  const [budgetAmount, setBudgetAmount] = useState('');

  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  // Aggregate spending per category for current month
  const categorySpendingMap = React.useMemo(() => {
    const curMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return (d.getMonth() + 1) === currentMonthNum && d.getFullYear() === currentYearNum;
    });

    const map: Record<string, number> = {};
    curMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount;
      });
    return map;
  }, [transactions, currentMonthNum, currentYearNum]);

  // Combined Budget items
  const budgetList = React.useMemo(() => {
    return categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const existingBudget = budgets.find(
          b => b.category_id === cat.id && b.month === currentMonthNum && b.year === currentYearNum
        );
        const spent = categorySpendingMap[cat.id] || 0;
        const limit = existingBudget ? existingBudget.amount : (cat.budgetLimit || 0);
        const remaining = Math.max(0, limit - spent);
        const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        const isOver = limit > 0 && spent > limit;

        return {
          id: existingBudget?.id,
          category: cat,
          limit,
          spent,
          remaining,
          percentage,
          isOver,
          hasBudget: limit > 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categories, budgets, categorySpendingMap, currentMonthNum, currentYearNum]);

  const totalBudgeted = budgetList.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentInBudget = budgetList.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCategories = budgetList.filter(b => b.isOver);

  // Trigger Voice Budget Check-in
  const handleVoiceBudgetCheck = () => {
    let script = '';
    if (overBudgetCategories.length > 0) {
      const topOver = overBudgetCategories[0];
      script = `Peringatan anggaran! Anda telah melebihi batas budget untuk kategori ${topOver.category.name} sebesar ${formatCurrency(topOver.spent - topOver.limit)}. Mohon batasi pengeluaran di pos ini.`;
    } else {
      const highestPct = budgetList.find(b => b.percentage > 75);
      if (highestPct) {
        script = `Perhatian ${activeProfile.name.split(' ')[0]}, Anda sudah menggunakan ${highestPct.percentage}% dari budget kategori ${highestPct.category.name} bulan ini. Sisa anggaran tersisa ${formatCurrency(highestPct.remaining)}.`;
      } else {
        script = `Seluruh pos anggaran ${activeProfile.name.split(' ')[0]} bulan ini masih berada dalam batas aman dan terkendali. Lanjutkan disiplin finansial Anda!`;
      }
    }

    speechSynth.speak(script, {
      language: voiceSettings.language,
      rate: voiceSettings.speechRate,
    });
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumericInput(budgetAmount);
    if (isNaN(amount) || amount <= 0) return;

    setBudget(selectedCategory, amount, currentMonthNum, currentYearNum);
    setIsModalOpen(false);
    setBudgetAmount('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header (Mandiri Royal Cobalt Blue & Wave Shape) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#005CE6] text-white p-6 sm:p-7 shadow-lg shadow-blue-700/20">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-[45%] bg-[#0084FF] opacity-90 blur-xl pointer-events-none transform rotate-12" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-b from-[#0047C2] to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full border border-white/40 bg-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                KONTROL FINANSIAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Batas Anggaran ({activeProfile.name})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-0.5">
              Atur batasan belanja per pos bulanan untuk menjaga stabilitas kas keluarga
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Voice Budget Check */}
            <button
              onClick={handleVoiceBudgetCheck}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-yellow-300" />
              <span>Voice Alert Check</span>
            </button>

            {/* Set Budget Limit */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 transition touch-manipulation cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Atur Limit Budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>
            Total Plafon Anggaran
          </span>
          <div className={`text-xl font-bold mt-1 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            {formatCurrency(totalBudgeted)}
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>
            Total Terpakai Bulan Ini
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalSpentInBudget)}
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>
            Status Anggaran
          </span>
          <div className="text-xl font-bold mt-1 flex items-center gap-2">
            {overBudgetCategories.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm font-bold">
                <AlertTriangle className="w-4 h-4" />
                {overBudgetCategories.length} Pos Overbudget
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Semua Pos Aman
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetList.map((item) => {
          const isOver = item.isOver;
          const isWarning = item.percentage >= 80 && !isOver;

          return (
            <div
              key={item.category.id}
              className={`p-5 rounded-3xl border shadow-sm space-y-4 transition ${
                isLight 
                  ? 'bg-white border-blue-100 shadow-slate-200/50 hover:border-blue-300' 
                  : 'bg-[#0c2658] border-blue-900/40 hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.category.name}
                    </h3>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Bulan ini: {formatCurrency(item.spent)} dari {formatCurrency(item.limit)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isOver
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
                        : isWarning
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 ${
                  isLight ? 'bg-slate-100' : 'bg-[#061530]'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : isWarning
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-[#005CE6] to-[#0084FF]'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                    {isOver ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Melebihi budget sebesar {formatCurrency(item.spent - item.limit)}
                      </span>
                    ) : (
                      <span>Sisa: <strong className={isLight ? 'text-[#003B99]' : 'text-slate-200'}>{formatCurrency(item.remaining)}</strong></span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedCategory(item.category.id);
                      setBudgetAmount(item.limit.toString());
                      setIsModalOpen(true);
                    }}
                    className={`font-bold hover:underline touch-manipulation cursor-pointer ${
                      isLight ? 'text-[#005CE6]' : 'text-blue-400'
                    }`}
                  >
                    Ubah Limit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
              Atur Batas Anggaran Bulanan
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Kategori Pengeluaran
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                >
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Batas Maksimal Bulanan (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 3000000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs font-bold focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-600 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-full text-xs shadow-md"
                >
                  Simpan Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
