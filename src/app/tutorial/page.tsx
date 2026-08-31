'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Mic, 
  Volume2, 
  Target, 
  PieChart, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Lightbulb, 
  MessageSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { useFinancial } from '@/lib/store/FinancialContext';

export default function TutorialPage() {
  const { theme, activeProfile } = useFinancial();
  const isLight = theme === 'light';

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<string | undefined>(undefined);

  const handlePlayVoice = (text: string) => {
    speechSynth.speak(text, { language: 'id-ID' });
  };

  const handleTryInAssistant = (text: string) => {
    setSelectedCommand(text);
    setIsVoiceModalOpen(true);
  };

  const commandCategories = [
    {
      category: '1. Pencatatan Pengeluaran & Pemasukan (Voice Input)',
      icon: Mic,
      color: 'bg-[#005CE6] text-white',
      commands: [
        {
          command: 'Catat pengeluaran makan siang 50 ribu dari cash',
          purpose: 'Mencatat makan siang Rp 50.000 memotong akun Kas Tunai.',
          categoryTag: 'Kuliner',
        },
        {
          command: 'Beli bensin tiga ratus ribu rupiah lewat rekening mandiri',
          purpose: 'Mencatat BBM Rp 300.000 memotong rekening Bank Mandiri.',
          categoryTag: 'Transportasi',
        },
        {
          command: 'Tambah pemasukan gaji lima belas juta ke rekening BCA',
          purpose: 'Mencatat gaji bulanan masuk ke rekening BCA.',
          categoryTag: 'Gaji',
        },
        {
          command: 'Bayar tagihan listrik satu juta dua ratus ribu dari BCA',
          purpose: 'Mencatat tagihan utilitas Rp 1.200.000.',
          categoryTag: 'Tagihan',
        },
        {
          command: 'Transfer dua ratus ribu dari BCA ke GoPay',
          purpose: 'Memindahkan saldo Rp 200.000 antar akun.',
          categoryTag: 'Transfer',
        },
      ],
    },
    {
      category: '2. Pertanyaan & Laporan Finansial (Voice Reporting)',
      icon: Volume2,
      color: 'bg-[#0084FF] text-white',
      commands: [
        {
          command: 'Bagaimana kondisi keuangan saya bulan ini?',
          purpose: 'Menghasilkan analisis komprehensif: saldo, tren pertumbuhan, pos terbesar, dan tingkat tabungan.',
          categoryTag: 'Laporan',
        },
        {
          command: 'Berapa total saldo saya sekarang?',
          purpose: 'Menyebutkan kekayaan bersih dan ringkasan saldo seluruh akun aktif.',
          categoryTag: 'Saldo',
        },
        {
          command: 'Berapa yang saya habiskan untuk makanan bulan ini?',
          purpose: 'Menyajikan total pengeluaran kategori Makanan & Minuman.',
          categoryTag: 'Analisis Pos',
        },
        {
          command: 'Berapa sisa budget bensin saya?',
          purpose: 'Mengecek kuota anggaran yang tersisa untuk transportasi.',
          categoryTag: 'Budget Check',
        },
        {
          command: 'Berapa lama lagi target dana darurat tercapai?',
          purpose: 'Menghitung estimasi sisa bulan menuju target dana darurat.',
          categoryTag: 'Target Check',
        },
      ],
    },
    {
      category: '3. Navigasi Halaman Cepat via Suara',
      icon: Zap,
      color: 'bg-[#FFB800] text-slate-950',
      commands: [
        {
          command: 'Buka halaman transaksi',
          purpose: 'Mengarahkan langsung ke daftar lengkap riwayat transaksi.',
          categoryTag: 'Navigasi',
        },
        {
          command: 'Buka menu anggaran',
          purpose: 'Membuka pengaturan limit anggaran bulanan.',
          categoryTag: 'Navigasi',
        },
        {
          command: 'Buka target tabungan',
          purpose: 'Membuka dashboard target financial goals.',
          categoryTag: 'Navigasi',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Header (Mandiri Royal Cobalt Blue & Wave Shape) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#005CE6] text-white p-6 sm:p-8 shadow-lg shadow-blue-700/20">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-[45%] bg-[#0084FF] opacity-90 blur-xl pointer-events-none transform rotate-12" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-b from-[#0047C2] to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full border border-white/40 bg-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              PUSAT EDUKASI & TUTORIAL
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Panduan Lengkap: Cara Berinteraksi Cerdas dengan Suara
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
            SmartMoney dirancang agar Anda sekeluarga (Agus, Merys, Elfano, Sheila, Nail) bisa mengelola keuangan secara alami. Cukup bicara dan dengarkan laporan kapan pun dibutuhkan.
          </p>
        </div>
      </div>

      {/* 3 Steps Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border space-y-2.5 shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#005CE6] flex items-center justify-center font-black text-sm">
            1
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Tekan Tombol Mikrofon</h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Klik floating mic oranye di pojok kanan bawah atau tombol "Perintah Suara" di header kapan saja.
          </p>
        </div>

        <div className={`p-5 rounded-3xl border space-y-2.5 shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#005CE6] flex items-center justify-center font-black text-sm">
            2
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Bicara dengan Santai</h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Ucapkan transaksi (e.g. "Catat beli bensin 100rb dari cash") atau pertanyaan ("Bagaimana kondisi keuangan saya?").
          </p>
        </div>

        <div className={`p-5 rounded-3xl border space-y-2.5 shadow-sm ${
          isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40'
        }`}>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
            3
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Konfirmasi & Dengar Jawaban</h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Sistem otomatis mengekstrak nominal dan akun, lalu Aira membacakan laporan audio ke telingamu.
          </p>
        </div>
      </div>

      {/* Cheat-sheet of Voice Commands */}
      <div className="space-y-6">
        <div>
          <h2 className={`text-lg md:text-xl font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Katalog Contoh Perintah Suara
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Klik tombol "Dengar" untuk menyimak atau "Coba Sekarang" untuk mengetes
          </p>
        </div>

        <div className="space-y-6">
          {commandCategories.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
                isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl ${group.color} font-black flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {group.category}
                  </h3>
                </div>

                <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-blue-900/40'}`}>
                  {group.commands.map((cmd, cIdx) => (
                    <div
                      key={cIdx}
                      className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 rounded-2xl transition ${
                        isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#061530]/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            "{cmd.command}"
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLight ? 'bg-blue-50 text-[#005CE6] border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                          }`}>
                            {cmd.categoryTag}
                          </span>
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{cmd.purpose}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handlePlayVoice(cmd.command)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition touch-manipulation cursor-pointer ${
                            isLight 
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 text-[#005CE6]" />
                          <span>Dengar</span>
                        </button>

                        <button
                          onClick={() => handleTryInAssistant(cmd.command)}
                          className="px-4 py-1.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition touch-manipulation cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Coba Sekarang</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        initialCommand={selectedCommand}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setSelectedCommand(undefined);
        }}
      />
    </div>
  );
}
