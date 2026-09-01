'use client';

import React from 'react';
import { X, Smartphone, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useFinancial();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/50 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#0c2658]/40 border-blue-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005CE6]/15 text-[#005CE6] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Install di Layar Utama HP</h3>
              <p className="text-xs text-slate-500">Akses cepat & bebas kuota seperti aplikasi native.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* iOS Safari */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#0c2658]/30 border-blue-900/40'
          }`}>
            <h4 className="font-bold text-sm text-[#005CE6] flex items-center gap-1.5">
              <span>🍎 Pengguna iPhone / iPad (Safari):</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Buka website ini di browser <strong>Safari</strong>.</li>
              <li className="flex items-center gap-1">
                <span>Ketuk ikon</span> <Share className="w-3.5 h-3.5 inline text-[#005CE6]" /> <strong>Share (Bagikan)</strong> di bar menu bawah.
              </li>
              <li className="flex items-center gap-1">
                <span>Gulir ke bawah lalu pilih</span> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-500" /> <strong>"Add to Home Screen"</strong>.
              </li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/40'
          }`}>
            <h4 className="font-bold text-sm text-emerald-500 flex items-center gap-1.5">
              <span>🤖 Pengguna Android (Chrome):</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1">
                <span>Ketuk ikon</span> <MoreVertical className="w-3.5 h-3.5 inline text-slate-400" /> <strong>Menu (Titik Tiga)</strong> di pojok kanan atas.
              </li>
              <li className="flex items-center gap-1">
                <span>Pilih opsi</span> <Download className="w-3.5 h-3.5 inline text-emerald-500" /> <strong>"Install app"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end ${
          isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#0c2658]/20 border-slate-800'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold transition shadow-md"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
