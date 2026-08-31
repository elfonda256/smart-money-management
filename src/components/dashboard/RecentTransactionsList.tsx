'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Mic, 
  Trash2, 
  Camera, 
  ArrowRight, 
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency, formatDateTimeIndo } from '@/lib/utils/formatters';

export const RecentTransactionsList: React.FC = () => {
  const { transactions, categories, accounts, deleteTransaction, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';
  const recentTxs = transactions.slice(0, 7);

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  return (
    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
      isLight 
        ? 'bg-white border-blue-100 shadow-slate-200/50' 
        : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Transaksi Terbaru ({activeProfile.name.split(' ')[0]})
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-blue-200/80'}`}>
            Catatan manual dan mutasi input suara terkini
          </p>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-bold text-[#005CE6] hover:text-[#004dc2] flex items-center gap-1 transition"
        >
          <span>Lihat Semua ({transactions.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-blue-900/40'}`}>
        {recentTxs.length > 0 ? (
          recentTxs.map((tx) => {
            const cat = getCategory(tx.category_id);
            const acc = getAccount(tx.account_id);
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const isVoice = tx.source === 'voice';

            return (
              <div
                key={tx.id}
                className={`py-3.5 flex items-center justify-between gap-3 group px-2 rounded-2xl transition ${
                  isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#061530]/40'
                }`}
              >
                {/* Left Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
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

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {tx.description || cat?.name || 'Transaksi'}
                      </h4>

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
                          OCR
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${
                      isLight ? 'text-slate-500' : 'text-blue-200/70'
                    }`}>
                      <span className={`font-semibold ${isLight ? 'text-[#005CE6]' : 'text-blue-100'}`}>
                        {cat?.name || 'Umum'}
                      </span>
                      <span>•</span>
                      <span>{acc?.name || tx.account_name || 'Akun'}</span>
                      <span>•</span>
                      <span>{formatDateTimeIndo(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-black ${
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

                  <button
                    onClick={() => {
                      if (confirm('Hapus transaksi ini? Saldo akun akan dikembalikan.')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-xl transition touch-manipulation cursor-pointer ${
                      isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title="Hapus transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`py-8 text-center text-xs italic ${
            isLight ? 'text-slate-400' : 'text-blue-200/60'
          }`}>
            Belum ada transaksi tercatat untuk {activeProfile.name}.
          </div>
        )}
      </div>
    </div>
  );
};
