'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRightLeft, ArrowDownRight, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { Transaction, TransactionType } from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { categories, accounts, addTransaction, updateTransaction, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('Mandiri');
  const [toAccountName, setToAccountName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Account Chips
  const popularAccountSuggestions = ['Mandiri', 'BCA', 'GoPay', 'OVO', 'Cash / Tunai', 'Bank Jago', 'BRI'];

  const filteredCategories = categories.filter(c => type === 'transfer' ? true : c.type === type);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      const acc = accounts.find(a => a.id === initialData.account_id);
      setAccountName(acc?.name || initialData.account_name || 'Mandiri');
      if (initialData.to_account_id) {
        const toAcc = accounts.find(a => a.id === initialData.to_account_id);
        setToAccountName(toAcc?.name || initialData.to_account_name || '');
      }
      setCategoryId(initialData.category_id);
      setDescription(initialData.description);
      setDate(new Date(new Date(initialData.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    } else {
      setAmount('');
      setDescription('');
      setAccountName(accounts[0]?.name || 'Mandiri');
      setToAccountName('');
      setCategoryId('');
      const now = new Date();
      setDate(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
  }, [initialData, isOpen, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Nominal transaksi harus lebih dari 0');
      return;
    }

    if (!accountName.trim()) {
      setErrorMessage('Nama akun / rekening sumber harus diisi');
      return;
    }

    if (type === 'transfer' && !toAccountName.trim()) {
      setErrorMessage('Nama akun / rekening tujuan transfer harus diisi');
      return;
    }

    const selectedCategory = categoryId || filteredCategories[0]?.id || 'cat_general';

    if (initialData) {
      updateTransaction(initialData.id, {
        amount: numAmount,
        type,
        category_id: selectedCategory,
        account_name: accountName.trim(),
        to_account_name: type === 'transfer' ? toAccountName.trim() : undefined,
        description: description.trim() || (type === 'income' ? 'Pemasukan' : type === 'transfer' ? 'Transfer' : 'Pengeluaran'),
        date: new Date(date).toISOString(),
      });
    } else {
      addTransaction({
        amount: numAmount,
        type,
        category_id: selectedCategory,
        account_name: accountName.trim(),
        to_account_name: type === 'transfer' ? toAccountName.trim() : undefined,
        description: description.trim() || (type === 'income' ? 'Pemasukan' : type === 'transfer' ? 'Transfer' : 'Pengeluaran'),
        date: new Date(date).toISOString(),
        source: 'manual',
      });
    }

    // Reset Form
    setAmount('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-amber-500/40 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a1938]/80 border-slate-800'
        }`}>
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{initialData ? 'Edit Transaksi' : 'Catat Transaksi Baru'}</span>
              <span className={`text-xs font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                ({activeProfile.name.split(' ')[0]})
              </span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Rekening dan nominal bebas kamu ketik sendiri
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Type Selector (Tabs) */}
          <div className={`grid grid-cols-3 gap-2 p-1 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Pemasukan
            </button>
            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategoryId('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                type === 'transfer'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Nominal Transaksi (Rp) *
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold ${
                isLight ? 'text-amber-700' : 'text-amber-400'
              }`}>
                Rp
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-2xl font-black text-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* FREE-TEXT ACCOUNT INPUT */}
          <div className="space-y-2">
            <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Nama Akun / Rekening Sumber * (Bebas Isi Sendiri)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Mandiri, BCA, GoPay, Dompet Tunai, Kas Toko"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            />

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className={`text-[10px] self-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pilihan Cepat:
              </span>
              {popularAccountSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setAccountName(sug)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                    accountName.toLowerCase() === sug.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer: Destination Account */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Nama Akun / Rekening Tujuan * (Bebas Isi Sendiri)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: BCA Tabungan, Dompet Istri, OVO, Dana"
                value={toAccountName}
                onChange={(e) => setToAccountName(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Kategori
            </label>
            <select
              value={categoryId || filteredCategories[0]?.id || ''}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Keterangan / Catatan
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan siang rendang, Beli bensin, Gaji bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Tanggal & Waktu
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Check className="w-4 h-4" /> {initialData ? 'Simpan Edit' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
