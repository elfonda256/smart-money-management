'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency, formatDateIndo } from '@/lib/utils/formatters';
import { Debt } from '@/types';

export default function DebtsPage() {
  const { debts, addDebt, deleteDebt, settleDebt, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [type, setType] = useState<'debt' | 'receivable'>('receivable');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const totalReceivables = debts
    .filter(d => d.type === 'receivable' && d.status === 'unpaid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPayables = debts
    .filter(d => d.type === 'debt' && d.status === 'unpaid')
    .reduce((sum, d) => sum + d.amount, 0);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !person.trim()) return;

    addDebt({
      type,
      person: person.trim(),
      amount: numAmount,
      due_date: dueDate || new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
      status: 'unpaid',
      notes: notes.trim(),
    });

    setPerson('');
    setAmount('');
    setDueDate('');
    setNotes('');
    setIsAddModalOpen(false);
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
                KEWAJIBAN & TAGIHAN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Hutang & Piutang ({activeProfile.name})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-0.5">
              Pantau pinjaman yang harus dibayar dan tagihan piutang keluarga
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 transition touch-manipulation cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Catat Hutang / Piutang</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-blue-200'}`}>
              Piutang (Orang Berhutang ke {activeProfile.name.split(' ')[0]})
            </span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(totalReceivables)}
          </div>
          <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Uang yang akan diterima
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-blue-200'}`}>
              Hutang (Kewajiban {activeProfile.name.split(' ')[0]})
            </span>
            <div className="w-8 h-8 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">
            {formatCurrency(totalPayables)}
          </div>
          <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Kewajiban yang perlu dilunasi
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
      }`}>
        <div className={`p-5 border-b ${isLight ? 'border-blue-100' : 'border-blue-900/40'}`}>
          <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Daftar Catatan Hutang & Piutang
          </h3>
        </div>

        <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-blue-900/40'}`}>
          {debts.length > 0 ? (
            debts.map((item) => {
              const isReceivable = item.type === 'receivable';
              const isPaid = item.status === 'paid';
              const isOverdue = !isPaid && new Date(item.due_date) < new Date();

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition group ${
                    isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#061530]/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isPaid
                          ? isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-400'
                          : isReceivable
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isLight ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-5 h-5" /> : isReceivable ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold truncate ${
                          isPaid 
                            ? 'line-through text-slate-400' 
                            : isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {item.person}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isReceivable
                              ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                              : isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isReceivable ? 'Piutang' : 'Hutang'}
                        </span>
                        {isPaid && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
                          }`}>
                            Lunas
                          </span>
                        )}
                        {isOverdue && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            Jatuh Tempo!
                          </span>
                        )}
                      </div>

                      <div className={`text-xs flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>Jatuh Tempo: {formatDateIndo(item.due_date)}</span>
                        {item.notes && <span>• {item.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-extrabold ${
                          isPaid
                            ? 'text-slate-400'
                            : isReceivable
                            ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                            : isLight ? 'text-rose-700' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(item.amount)}
                      </div>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => settleDebt(item.id)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition touch-manipulation cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tandai Lunas</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan hutang/piutang ${item.person}?`)) {
                          deleteDebt(item.id);
                        }
                      }}
                      className={`p-2 rounded-xl transition touch-manipulation cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`p-8 text-center text-xs italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Belum ada data hutang atau piutang.
            </div>
          )}
        </div>
      </div>

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                Catat Hutang / Piutang
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3.5">
              {/* Type Switcher */}
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
                isLight ? 'bg-slate-100 border-blue-100' : 'bg-[#061530] border-blue-900'
              }`}>
                <button
                  type="button"
                  onClick={() => setType('receivable')}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    type === 'receivable' ? 'bg-emerald-600 text-white shadow-sm' : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Piutang (Orang Lain Hutang)
                </button>
                <button
                  type="button"
                  onClick={() => setType('debt')}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    type === 'debt' ? 'bg-rose-600 text-white shadow-sm' : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Hutang (Saya Berhutang)
                </button>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {type === 'receivable' ? 'Nama Peminjam' : 'Nama Pemberi Pinjaman / Institusi'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama, Mandiri Kartu Kredit"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs font-bold focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Catatan / Keperluan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Patungan liburan, cicilan 0%"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
