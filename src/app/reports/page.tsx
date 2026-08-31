'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Volume2, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieIcon,
  TrendingUp,
  Coins,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { generateFinancialVoiceReport } from '@/lib/voice/voiceReporter';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { formatCurrency } from '@/lib/utils/formatters';

export default function ReportsPage() {
  const { 
    accounts, 
    categories, 
    transactions, 
    budgets, 
    goals, 
    debts, 
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthSavingsRate,
    lastMonthExpense,
    expenseGrowthPercent,
    categorySpending,
    voiceSettings,
    activeProfile,
    resetToZero,
    theme
  } = useFinancial();

  const isLight = theme === 'light';
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year'>('this_month');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const report = generateFinancialVoiceReport({
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    debts,
    period,
  });

  const handlePlayVoiceSummary = () => {
    if (isPlayingVoice) {
      speechSynth.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      speechSynth.speak(report.spokenScript, {
        language: voiceSettings.language,
        rate: voiceSettings.speechRate,
        pitch: voiceSettings.speechPitch,
      }).then(() => {
        setIsPlayingVoice(false);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Kategori', 'Total Pengeluaran (IDR)', 'Porsi (%)'];
    const rows = categorySpending.map(c => [
      `"${c.category.name}"`,
      c.amount,
      `${c.percentage}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_kategori_${activeProfile.name.split(' ')[0]}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteReset = () => {
    resetToZero();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:space-y-4 print:text-black">
      {/* Top Banner Header (Mandiri Royal Cobalt Blue & Wave Shape) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#005CE6] text-white p-6 sm:p-7 shadow-lg shadow-blue-700/20 print:hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-[45%] bg-[#0084FF] opacity-90 blur-xl pointer-events-none transform rotate-12" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-b from-[#0047C2] to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full border border-white/40 bg-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                ANALISIS & AUDIT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Laporan & Analisis ({activeProfile.name})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-0.5">
              Ringkasan komprehensif arus kas, aset, dan kesehatan keuangan keluarga
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Audio Report Button */}
            <button
              onClick={handlePlayVoiceSummary}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold shadow-md transition touch-manipulation cursor-pointer ${
                isPlayingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 shadow-amber-500/30'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingVoice ? 'Stop Suara' : 'Dengarkan Laporan'}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Reset Saldo to 0 Button */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-rose-400 bg-rose-500/20 hover:bg-rose-500/30 text-white text-xs font-bold backdrop-blur-md transition touch-manipulation cursor-pointer"
              title="Reset Saldo Rp 0 & Kosongkan Laporan"
            >
              <RotateCcw className="w-4 h-4 text-rose-300" />
              <span>Reset Saldo Rp 0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Spoken Overview Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
        isLight 
          ? 'bg-gradient-to-r from-blue-50/70 via-white to-blue-50/40 border-blue-200 shadow-slate-200/50' 
          : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
      }`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-blue-100 text-[#005CE6] font-bold">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className={`text-sm font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Ringkasan Narasi Eksekutif (AI Voice Script)
          </h3>
        </div>
        <p className={`text-xs md:text-sm leading-relaxed italic p-4 rounded-2xl border ${
          isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#061530]/60 border-blue-900/50 text-slate-200'
        }`}>
          "{report.spokenScript}"
        </p>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>Total Saldo Terkelola</div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>{formatCurrency(totalBalance)}</div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{accounts.length} Akun Finansial</div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>Pemasukan Periode Ini</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(currentMonthIncome)}</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">Kas Masuk Bersih</div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>Pengeluaran Periode Ini</div>
          <div className="text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-400 mt-1">{formatCurrency(currentMonthExpense)}</div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{expenseGrowthPercent > 0 ? `+${expenseGrowthPercent}%` : `${expenseGrowthPercent}%`} vs bln lalu</div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>Tingkat Tabungan (Savings)</div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${isLight ? 'text-[#005CE6]' : 'text-yellow-400'}`}>{currentMonthSavingsRate}%</div>
          <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{currentMonthSavingsRate >= 20 ? 'Status Sangat Baik' : 'Perlu Ditingkatkan'}</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden space-y-4 p-6 ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-lg'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
              Rincian Pengeluaran per Kategori
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Distribusi alokasi dana dan persentase penggunaan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase border-y ${
              isLight ? 'text-slate-600 bg-blue-50/50 border-blue-100' : 'text-blue-200 bg-[#061530]/60 border-blue-900/60'
            }`}>
              <tr>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Pengeluaran</th>
                <th className="py-3 px-4">Porsi (%)</th>
                <th className="py-3 px-4">Plafon Budget</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-blue-900/40 text-slate-300'}`}>
              {categorySpending.map((item) => {
                const isOver = item.budget && item.amount > item.budget.amount;
                return (
                  <tr key={item.category.id} className={isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#061530]/40'}>
                    <td className={`py-3 px-4 font-semibold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.category.color }} />
                      <span>{item.category.name}</span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(item.amount)}</td>
                    <td className="py-3 px-4 font-medium">{item.percentage}%</td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.budget ? formatCurrency(item.budget.amount) : 'Belum diatur'}
                    </td>
                    <td className="py-3 px-4">
                      {isOver ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 font-semibold text-[10px]">
                          Overbudget
                        </span>
                      ) : item.amount > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold text-[10px]">
                          Aman
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Reset Saldo to 0 */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Reset Saldo ke Rp 0?
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
                Semua saldo rekening <strong>{activeProfile.name}</strong> akan diatur menjadi <strong>Rp 0</strong> dan riwayat transaksi/mutasi akan dikosongkan agar Anda dapat mencatat keuangan riil dari awal.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
              >
                Ya, Reset Jadi Rp 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
