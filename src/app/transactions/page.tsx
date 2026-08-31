'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Camera, 
  Mic, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  Wallet,
  Sparkles,
  FileSpreadsheet,
  Check,
  RotateCcw
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { formatCurrency, formatDateTimeIndo } from '@/lib/utils/formatters';
import { Transaction, TransactionType } from '@/types';

export default function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction, addTransaction, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (searchTerm.trim()) {
        const descMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const cat = categories.find(c => c.id === t.category_id);
        const catMatch = cat?.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!descMatch && !catMatch) return false;
      }

      // Type
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // Category
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

      // Account
      if (selectedAccount !== 'all' && t.account_id !== selectedAccount && t.to_account_id !== selectedAccount) return false;

      return true;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedAccount, categories]);

  // Summaries of filtered
  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Akun', 'Nominal (IDR)', 'Sumber'];
    const rows = filteredTransactions.map(t => {
      const cat = categories.find(c => c.id === t.category_id)?.name || '';
      const acc = accounts.find(a => a.id === t.account_id)?.name || '';
      return [
        t.id,
        t.date,
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${acc}"`,
        t.amount,
        t.source,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_${activeProfile.name.split(' ')[0]}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

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
                MUTASI & KAS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Catatan Transaksi ({activeProfile.name})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-0.5">
              Kelola seluruh mutasi pemasukan, pengeluaran & transfer kas keluarga
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Voice Input Button */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 transition touch-manipulation cursor-pointer"
            >
              <Mic className="w-4 h-4 text-slate-950" />
              <span>Input Suara</span>
            </button>

            {/* OCR Receipt Scan Button */}
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Camera className="w-4 h-4 text-yellow-300" />
              <span>Scan Struk</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition touch-manipulation cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Tambah Manual</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 text-white transition backdrop-blur-md touch-manipulation cursor-pointer"
              title="Export ke CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm space-y-3 ${
        isLight 
          ? 'bg-white border-blue-100 shadow-slate-200/50' 
          : 'bg-[#0c2658] border-blue-900/40 shadow-md'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/60 text-white'
              }`}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/60 text-white'
              }`}
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="expense">Pengeluaran Saja</option>
              <option value="income">Pemasukan Saja</option>
              <option value="transfer">Transfer Saja</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/60 text-white'
              }`}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/60 text-white'
              }`}
            >
              <option value="all">Semua Akun / Rekening</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Pill */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
          isLight ? 'border-slate-100 text-slate-600' : 'border-blue-900/40 text-slate-400'
        }`}>
          <div>
            Menampilkan <strong className={isLight ? 'text-[#003B99]' : 'text-white'}>{filteredTransactions.length}</strong> transaksi
          </div>

          <div className="flex items-center gap-4 font-bold">
            <div className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>
              Masuk: +{formatCurrency(totalFilteredIncome)}
            </div>
            <div className={isLight ? 'text-rose-700' : 'text-rose-400'}>
              Keluar: -{formatCurrency(totalFilteredExpense)}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        isLight 
          ? 'bg-white border-blue-100 shadow-slate-200/50' 
          : 'bg-[#0c2658] border-blue-900/40 shadow-lg'
      }`}>
        <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-blue-900/40'}`}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const cat = getCategory(tx.category_id);
              const acc = getAccount(tx.account_id);
              const toAcc = tx.to_account_id ? getAccount(tx.to_account_id) : null;
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isVoice = tx.source === 'voice';

              return (
                <div
                  key={tx.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition group ${
                    isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#061530]/50'
                  }`}
                >
                  {/* Left Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isIncome
                          ? isLight ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isTransfer
                          ? isLight ? 'bg-blue-50 text-[#005CE6] border border-blue-200' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : isLight ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : isTransfer ? (
                        <ArrowRightLeft className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {tx.description || cat?.name || 'Transaksi'}
                        </h3>

                        {isVoice && (
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLight 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            <Mic className="w-2.5 h-2.5" />
                            Voice
                          </span>
                        )}

                        {tx.source === 'receipt_ocr' && (
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLight 
                              ? 'bg-blue-100 text-[#003B99] border border-blue-300' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            <Camera className="w-2.5 h-2.5" />
                            OCR Struk
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 text-xs flex-wrap ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span className={`font-semibold ${isLight ? 'text-[#005CE6]' : 'text-blue-300'}`}>
                          {cat?.name || 'Umum'}
                        </span>
                        <span>•</span>
                        <span>{isTransfer && (toAcc || tx.to_account_name) ? `${acc?.name || tx.account_name} ➔ ${toAcc?.name || tx.to_account_name}` : acc?.name || tx.account_name}</span>
                        <span>•</span>
                        <span>{formatDateTimeIndo(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-extrabold ${
                          isIncome 
                            ? isLight ? 'text-emerald-700' : 'text-emerald-400' 
                            : isTransfer 
                            ? isLight ? 'text-[#005CE6]' : 'text-blue-400' 
                            : isLight ? 'text-rose-700' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className={`p-2 rounded-xl transition touch-manipulation cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-[#005CE6] hover:bg-blue-50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Edit transaksi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Hapus transaksi ini? Saldo akun akan dikembalikan.')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className={`p-2 rounded-xl transition touch-manipulation cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title="Hapus transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`p-12 text-center text-sm space-y-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>Belum ada transaksi tercatat untuk {activeProfile.name}.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-[#005CE6] hover:underline font-bold"
              >
                + Tambah Transaksi Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OCR Struk Scanner Simulation Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-blue-100 text-[#005CE6] flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                  Scan Struk Otomatis (OCR)
                </h3>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Pilih foto struk belanjaan untuk mengekstrak total nominal dan kategori secara otomatis dengan AI OCR.
            </p>

            <div className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-3 cursor-pointer ${
              isLight ? 'bg-slate-50 border-blue-200 hover:border-[#005CE6]' : 'border-blue-800 hover:border-blue-500 bg-[#061530]/50'
            }`}>
              <Camera className="w-8 h-8 text-[#005CE6] mx-auto" />
              <div className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className="font-semibold text-[#005CE6]">Klik untuk upload foto struk</span> atau drag and drop file di sini
              </div>
              <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>PNG, JPG, HEIC hingga 10MB</div>
            </div>

            {/* Quick Simulation Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  addTransaction({
                    account_name: 'Mandiri',
                    category_id: 'cat_shopping',
                    amount: 345000,
                    type: 'expense',
                    date: new Date().toISOString(),
                    description: 'Struk Belanja Superindo (OCR Auto-Extract)',
                    source: 'receipt_ocr',
                  });
                  setIsReceiptModalOpen(false);
                }}
                className="w-full py-3 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Simulasi Auto-Extract Struk (Rp 345.000)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen || !!editingTransaction}
        initialData={editingTransaction}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}
