'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Mic, 
  Volume2, 
  PieChart, 
  Target, 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  HelpCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { useFinancial } from '@/lib/store/FinancialContext';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceAssistant?: (sampleCommand?: string) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceAssistant,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useFinancial();
  const isLight = theme === 'light';

  const steps = [
    {
      id: 'intro',
      title: 'Selamat Datang di SmartMoney!',
      badge: 'Perkenalan',
      icon: Sparkles,
      color: 'bg-[#005CE6] text-white',
      description:
        'Aplikasi ini dirancang seperti teman finansial pintar yang siap menemani kamu mencatat pengeluaran dan memberikan laporan langsung via suara.',
      highlights: [
        { title: 'Bicara Santai', desc: 'Catat transaksi tanpa repot mengetik form yang panjang.' },
        { title: 'Dengarkan Laporan', desc: 'Tanya "Bagaimana kondisi keuangan saya?" dan asisten akan menjawab via audio.' },
        { title: 'Multi-User Keluarga', desc: 'Mendukung 5+ profil anggota keluarga (Agus, Merys, Elfano, Sheila, Nail, Kas Bersama).' },
      ],
      tip: 'Kamu bisa mengakses panduan ini kapan saja dari tombol "Panduan" di menu atas.',
    },
    {
      id: 'voice_input',
      title: '1. Cara Mencatat Transaksi via Suara',
      badge: 'Input Suara',
      icon: Mic,
      color: 'bg-[#005CE6] text-white',
      description:
        'Cukup tekan tombol Mikrofon oranye di pojok kanan bawah, lalu bicaralah dengan bahasa sehari-hari seperti:',
      examples: [
        {
          phrase: 'Catat pengeluaran makan siang 50 ribu dari cash',
          result: 'Pengeluaran Rp 50.000 • Kategori Makanan • Akun Dompet Tunai',
        },
        {
          phrase: 'Beli bensin tiga ratus ribu lewat mandiri',
          result: 'Pengeluaran Rp 300.000 • Kategori Transportasi • Akun Mandiri',
        },
        {
          phrase: 'Tambah pemasukan freelance 3.5 juta ke rekening BCA',
          result: 'Pemasukan Rp 3.500.000 • Kategori Freelance • Akun BCA',
        },
        {
          phrase: 'Kopi susu dua puluh dua ribu pakai gopay',
          result: 'Pengeluaran Rp 22.000 • Kategori Makanan • Akun GoPay',
        },
      ],
      tip: 'Sistem akan menampilkan kartu konfirmasi agar kamu bisa mengecek sebelum data disimpan.',
    },
    {
      id: 'voice_reporting',
      title: '2. Cara Bertanya & Mendengarkan Laporan',
      badge: 'Voice Reporting',
      icon: Volume2,
      color: 'bg-[#0084FF] text-white',
      description:
        'Ingin tahu kondisi dompet tanpa pusing membaca tabel? Tanyakan langsung ke asisten suara Aira:',
      examples: [
        {
          phrase: 'Bagaimana kondisi keuangan saya bulan ini?',
          result: 'Membacakan ringkasan total saldo, perbandingan tren belanja, dan pos terbesar.',
        },
        {
          phrase: 'Berapa saldo saya sekarang?',
          result: 'Menyebutkan total saldo di seluruh rekening bank dan dompet digital.',
        },
        {
          phrase: 'Berapa yang saya habiskan untuk makanan bulan ini?',
          result: 'Menganalisis pengeluaran spesifik kategori Makanan & Minuman.',
        },
        {
          phrase: 'Berapa sisa budget bensin saya?',
          result: 'Mengecek sisa kuota anggaran transportasi yang masih aman.',
        },
      ],
      tip: 'Kamu juga bisa klik tombol "Dengarkan Laporan Audio" di bagian atas dashboard untuk laporan instan.',
    },
    {
      id: 'budget_goals',
      title: '3. Atur Anggaran & Raih Target Impian',
      badge: 'Budget & Goals',
      icon: Target,
      color: 'bg-[#FFB800] text-slate-950',
      description:
        'Kunci kebebasan finansial adalah batasan yang jelas dan target tabungan yang terukur:',
      highlights: [
        {
          title: 'Anggaran Bulanan (Budgets)',
          desc: 'Pasang limit pengeluaran per kategori. Indikator warna akan memberitahu saat mendekati batas.',
        },
        {
          title: 'Target Tabungan (Goals)',
          desc: 'Rencanakan Dana Darurat, Liburan, atau DP Rumah. Sistem otomatis menghitung estimasi waktu tercapai.',
        },
        {
          title: 'Hutang & Piutang (Debts)',
          desc: 'Catat pinjaman rekan atau tagihan piutang lengkap dengan tanggal jatuh tempo.',
        },
      ],
      tip: 'Gunakan fitur "Setor Tabungan" di halaman Target untuk memindahkan dana dari rekening ke pos tabungan.',
    },
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const Icon = current.icon;

  const handleTestTTS = (text: string) => {
    speechSynth.speak(text, { language: 'id-ID' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#061530]/70 border-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl ${current.color} flex items-center justify-center shadow-md font-bold`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'text-[#005CE6]' : 'text-blue-300'
              }`}>
                Langkah {currentStep + 1} dari {steps.length} • {current.badge}
              </span>
              <h3 className={`text-base font-bold leading-tight ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition touch-manipulation cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          <p className={`leading-relaxed font-medium ${isLight ? 'text-slate-600' : 'text-slate-200'}`}>
            {current.description}
          </p>

          {/* Highlights layout */}
          {current.highlights && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {current.highlights.map((h, i) => (
                <div key={i} className={`p-4 rounded-2xl border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/50'
                }`}>
                  <div className={`font-bold text-xs flex items-center gap-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#005CE6] shrink-0" />
                    <span>{h.title}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Examples layout */}
          {current.examples && (
            <div className="space-y-2.5">
              <div className={`text-xs font-bold flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <MessageSquare className="w-3.5 h-3.5 text-[#005CE6]" />
                <span>Contoh Percakapan Nyata (Klik "Dengar" untuk tes):</span>
              </div>

              <div className="space-y-2">
                {current.examples.map((ex, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition ${
                      isLight 
                        ? 'bg-slate-50/80 hover:bg-blue-50/40 border-blue-100' 
                        : 'bg-[#061530]/70 border-blue-900/60 hover:border-blue-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className={`font-semibold text-xs flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <span className="text-[#005CE6]">🗣️</span>
                        <span>"{ex.phrase}"</span>
                      </div>
                      <div className={`text-[11px] flex items-center gap-1.5 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span className="text-[#005CE6]">➔</span>
                        <span>{ex.result}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestTTS(ex.phrase)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition border touch-manipulation cursor-pointer ${
                          isLight 
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm' 
                            : 'bg-slate-700/80 hover:bg-slate-600 text-slate-200 border-slate-600'
                        }`}
                        title="Dengarkan pengucapan"
                      >
                        <Play className="w-3 h-3 text-[#005CE6]" />
                        <span>Dengar</span>
                      </button>

                      {onOpenVoiceAssistant && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenVoiceAssistant(ex.phrase);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition touch-manipulation cursor-pointer"
                        >
                          <Mic className="w-3 h-3 text-yellow-300" />
                          <span>Coba Perintah</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friendly Tip Box */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
            isLight ? 'bg-blue-50/70 border-blue-200 text-[#003B99]' : 'bg-[#061530] border-blue-900 text-blue-200'
          }`}>
            <Lightbulb className="w-4 h-4 text-[#005CE6] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Tips: </span>
              {current.tip}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#061530]/90 border-blue-900'
        }`}>
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#005CE6]' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 touch-manipulation cursor-pointer ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 touch-manipulation cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 touch-manipulation cursor-pointer"
              >
                <span>Mulai Gunakan App ✨</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
