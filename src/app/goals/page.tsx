'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  ShieldCheck, 
  Plane, 
  Home, 
  Sparkles, 
  Volume2, 
  Calendar, 
  ArrowRight, 
  Coins, 
  Check, 
  X,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinancial } from '@/lib/store/FinancialContext';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { formatCurrency, formatDateIndo, parseNumericInput } from '@/lib/utils/formatters';
import { FinancialGoal } from '@/types';

export default function GoalsPage() {
  const { 
    goals, 
    accounts, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    depositToGoal, 
    currentMonthIncome, 
    currentMonthExpense,
    voiceSettings,
    activeProfile,
    theme 
  } = useFinancial();

  const isLight = theme === 'light';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<FinancialGoal | null>(null);

  // Form states
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Safety');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');

  // Monthly savings potential
  const monthlySavingsPotential = Math.max(currentMonthIncome - currentMonthExpense, 2000000);

  const handleVoiceCheckGoals = () => {
    if (goals.length === 0) return;
    const topGoal = goals[0];
    const pct = Math.round((topGoal.current_amount / topGoal.target_amount) * 100);
    const remaining = topGoal.target_amount - topGoal.current_amount;
    const monthsToFinish = Math.ceil(remaining / monthlySavingsPotential);

    const script = `Target tabungan utama ${activeProfile.name.split(' ')[0]}, yaitu ${topGoal.name}, saat ini telah terkumpul ${pct}% sebesar ${formatCurrency(topGoal.current_amount)}. Dengan kemampuan menabung bulanan saat ini, target diproyeksikan tercapai dalam waktu sekitar ${monthsToFinish} bulan lagi.`;

    speechSynth.speak(script, {
      language: voiceSettings.language,
      rate: voiceSettings.speechRate,
    });
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseNumericInput(targetAmount);
    if (isNaN(target) || target <= 0) return;

    addGoal({
      name: goalName.trim(),
      target_amount: target,
      current_amount: parseNumericInput(initialAmount) || 0,
      deadline: deadline || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      category,
      color: category === 'Safety' ? '#005CE6' : category === 'Travel' ? '#EC4899' : '#0084FF',
    });

    setGoalName('');
    setTargetAmount('');
    setInitialAmount('');
    setDeadline('');
    setIsAddModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amount = parseNumericInput(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    depositToGoal(depositModalGoal.id, amount, fromAccount);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    setDepositModalGoal(null);
    setDepositAmount('');
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
                IMPIAN & TABUNGAN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Target Finansial & Tabungan ({activeProfile.name})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-0.5">
              Rencanakan dana darurat, liburan, dan akumulasi aset masa depan keluarga
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Voice Goal Check */}
            <button
              onClick={handleVoiceCheckGoals}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-yellow-300" />
              <span>Voice Goal Check</span>
            </button>

            {/* Create Goal Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 transition touch-manipulation cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Buat Target Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const monthsLeft = Math.ceil(remaining / monthlySavingsPotential);

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 transition relative overflow-hidden ${
                isLight 
                  ? 'bg-white border-blue-100 shadow-slate-200/50 hover:border-blue-300' 
                  : 'bg-[#0c2658] border-blue-900/40 shadow-xl hover:border-blue-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    isLight ? 'bg-blue-50 text-[#005CE6] border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    {goal.category}
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-[#005CE6]' : 'text-yellow-400'}`}>
                    {percentage}% Tercapai
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {goal.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={`text-xl font-black ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                      {formatCurrency(goal.current_amount)}
                    </span>
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      / {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 ${
                    isLight ? 'bg-slate-100' : 'bg-[#061530]'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#005CE6] to-[#0084FF] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className={`flex items-center justify-between text-[11px] pt-1 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <span>Sisa: <strong className={isLight ? 'text-[#003B99]' : 'text-slate-200'}>{formatCurrency(remaining)}</strong></span>
                    <span>Deadline: {formatDateIndo(goal.deadline)}</span>
                  </div>
                </div>

                {/* Estimation box */}
                <div className={`p-3 rounded-2xl border text-[11px] flex items-center gap-2 ${
                  isLight ? 'bg-blue-50/60 border-blue-200 text-[#003B99]' : 'bg-[#061530]/60 border-blue-900/50 text-blue-200'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-[#005CE6] shrink-0" />
                  <span>
                    Estimasi tercapai dalam <strong className={isLight ? 'text-[#005CE6] font-black' : 'text-yellow-400'}>~{monthsLeft} bulan</strong>.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-between pt-2 border-t ${
                isLight ? 'border-slate-100' : 'border-blue-900/40'
              }`}>
                <button
                  onClick={() => {
                    if (confirm(`Hapus target "${goal.name}"?`)) {
                      deleteGoal(goal.id);
                    }
                  }}
                  className={`text-xs transition touch-manipulation cursor-pointer ${isLight ? 'text-slate-400 hover:text-rose-600' : 'text-slate-500 hover:text-rose-400'}`}
                >
                  Hapus
                </button>

                <button
                  onClick={() => setDepositModalGoal(goal)}
                  className="px-4 py-2 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition touch-manipulation cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Setor Tabungan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setor Tabungan Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                Setor Tabungan: {depositModalGoal.name}
              </h3>
              <button onClick={() => setDepositModalGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nominal Setoran (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-base font-bold focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Ambil dari Akun / Rekening
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-600 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] text-white rounded-full text-xs font-bold shadow-md"
                >
                  Konfirmasi Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                Buat Target Tabungan Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat 6 Bulan, DP Rumah, Liburan Jepang"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                >
                  <option value="Safety">Safety (Dana Darurat / Proteksi)</option>
                  <option value="Travel">Travel & Liburan</option>
                  <option value="Asset">Aset & Properti (Rumah / Kendaraan)</option>
                  <option value="Gadget">Gadget & Elektronik</option>
                  <option value="Education">Pendidikan</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 50000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs font-bold focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Terkumpul Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Target Tanggal Selesai (Deadline)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-600 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-full text-xs shadow-md"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
