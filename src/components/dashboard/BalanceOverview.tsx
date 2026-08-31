'use client';

import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  Percent,
  Crown
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency } from '@/lib/utils/formatters';

export const BalanceOverview: React.FC = () => {
  const { 
    totalBalance, 
    currentMonthIncome, 
    currentMonthExpense, 
    currentMonthSavingsRate,
    expenseGrowthPercent,
    accounts,
    activeProfile,
    theme 
  } = useFinancial();

  const isLight = theme === 'light';
  const netCashflow = currentMonthIncome - currentMonthExpense;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Saldo / Net Worth */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition shadow-sm relative overflow-hidden group ${
        isLight
          ? 'bg-gradient-to-br from-sky-50/90 via-white to-blue-50/40 border-sky-200/90 shadow-slate-200/50'
          : 'bg-gradient-to-br from-[#0a2048] to-[#071530] border-sky-500/30 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isLight ? 'text-sky-900' : 'text-sky-300'}`}>
            Total Saldo {activeProfile.name.split(' ')[0]}
          </span>
          <div className="w-9 h-9 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center border border-sky-500/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
            {formatCurrency(totalBalance)}
          </div>
          <div className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-slate-500' : 'text-sky-200/80'}`}>
            <span>{accounts.length} Akun & Dompet Aktif</span>
          </div>
        </div>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition shadow-sm relative overflow-hidden ${
        isLight
          ? 'bg-white border-sky-100/90 shadow-slate-200/50'
          : 'bg-gradient-to-br from-[#091b3e] to-[#061129] border-sky-800/80 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-sky-300'}`}>
            Pemasukan Bulan Ini
          </span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {formatCurrency(currentMonthIncome)}
          </div>
          <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${isLight ? 'text-emerald-700/80' : 'text-emerald-400/90'}`}>
            <span>Kas Masuk Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition shadow-sm relative overflow-hidden ${
        isLight
          ? 'bg-white border-sky-100/90 shadow-slate-200/50'
          : 'bg-gradient-to-br from-[#091b3e] to-[#061129] border-sky-800/80 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-sky-300'}`}>
            Pengeluaran Bulan Ini
          </span>
          <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-500/20">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
            {formatCurrency(currentMonthExpense)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {expenseGrowthPercent !== 0 ? (
              <span className={`font-bold flex items-center gap-0.5 ${
                expenseGrowthPercent > 0 
                  ? isLight ? 'text-amber-700' : 'text-amber-400' 
                  : isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                {expenseGrowthPercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {expenseGrowthPercent > 0 ? `+${expenseGrowthPercent}%` : `${expenseGrowthPercent}%`}
              </span>
            ) : (
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Stabil</span>
            )}
            <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>vs bulan lalu</span>
          </div>
        </div>
      </div>

      {/* 4. Arus Kas Bersih & Savings Rate */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition shadow-sm relative overflow-hidden ${
        isLight
          ? 'bg-white border-sky-100/90 shadow-slate-200/50'
          : 'bg-gradient-to-br from-[#091b3e] to-[#061129] border-sky-800/80 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-sky-300'}`}>
            Tingkat Tabungan
          </span>
          <div className="w-9 h-9 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center border border-sky-500/20">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
            {currentMonthSavingsRate}%
          </div>
          <div className={`mt-1 flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-sky-200/80'}`}>
            <span>Sisa: </span>
            <strong className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCurrency(netCashflow)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
