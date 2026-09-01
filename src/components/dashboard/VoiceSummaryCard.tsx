'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Mic, 
  Bot, 
  Users, 
  Crown,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { generateFinancialVoiceReport } from '@/lib/voice/voiceReporter';
import { speechSynth } from '@/lib/voice/speechSynthesis';
import { formatCurrency } from '@/lib/utils/formatters';

interface VoiceSummaryCardProps {
  onOpenVoiceAssistant: () => void;
  onOpenFamilyModal?: () => void;
  onOpenTutorial?: () => void;
}

export const VoiceSummaryCard: React.FC<VoiceSummaryCardProps> = ({
  onOpenVoiceAssistant,
  onOpenFamilyModal,
  onOpenTutorial,
}) => {
  const { 
    accounts, 
    categories, 
    transactions, 
    budgets, 
    goals, 
    debts, 
    voiceSettings,
    activeProfile,
    familyCombinedNetWorth,
    theme 
  } = useFinancial();

  const [isPlaying, setIsPlaying] = useState(false);
  const isLight = theme === 'light';

  const report = generateFinancialVoiceReport({
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    debts,
    period: 'this_month',
    profileName: activeProfile.name,
    familyCombinedNetWorth: familyCombinedNetWorth,
  });

  const handleToggleVoiceReport = () => {
    if (isPlaying) {
      speechSynth.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speechSynth.speak(report.spokenScript, {
        language: voiceSettings.language,
        rate: voiceSettings.speechRate,
        pitch: voiceSettings.speechPitch,
        voiceURI: voiceSettings.voiceURI,
      }).then(() => {
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#005CE6] text-white p-5 sm:p-7 md:p-8 transition-all duration-200 shadow-xl shadow-blue-700/20 space-y-6">
      {/* 1. Fluid Curved Wave Shape (Top-Left Vibrant Cyan Wave matching Mandiri Livin banner) */}
      <div className="absolute -top-16 -left-16 w-80 h-80 rounded-[45%] bg-[#0084FF] opacity-90 blur-xl pointer-events-none transform rotate-12" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-b from-[#0047C2] to-transparent opacity-60 pointer-events-none" />

      {/* Top Bar: Active Persona & Golden Squircle Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          {/* Golden Yellow Squircle Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/30 text-2xl border border-yellow-300">
              {activeProfile.avatarEmoji}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border-2 border-[#005CE6]" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {activeProfile.name}
              </h3>
              {/* Rounded Pill Role Badge */}
              <span className="px-3 py-0.5 rounded-full border border-white/40 bg-white/15 text-[11px] font-semibold text-white backdrop-blur-sm">
                {activeProfile.role}
              </span>
            </div>
            <p className="text-xs text-blue-100 font-normal truncate mt-0.5">
              Asisten Suara Aira siap melayani laporan keuanganmu
            </p>
          </div>
        </div>

        {/* Family Vault Pill Button (Glass style matching screenshot pill buttons) */}
        {onOpenFamilyModal && (
          <button
            onClick={onOpenFamilyModal}
            className="flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs transition backdrop-blur-md shadow-sm touch-manipulation cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-300 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] text-blue-100 font-medium">
                  Kas Total Keluarga
                </div>
                <div className="text-xs font-bold text-yellow-300">
                  {formatCurrency(familyCombinedNetWorth)}
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
          </button>
        )}
      </div>

      {/* Main Dialogue Speech Bubble */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-3.5 max-w-2xl flex-1">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/25 text-white text-xs sm:text-sm leading-relaxed space-y-2 backdrop-blur-md shadow-inner">
            <div className="font-bold text-xs sm:text-sm flex items-center gap-2 text-white">
              <span>💬</span>
              <span>"Hai {activeProfile.name.split(' ')[0]}, berikut laporan kondisi keuanganmu:"</span>
            </div>
            <p className="text-blue-50 italic font-normal">
              {report.spokenScript}
            </p>
          </div>

          {/* Quick interactive voice prompt chips (Pill shaped with white border) */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] font-semibold text-blue-100">
              Tanya Aira:
            </span>
            <button
              onClick={onOpenVoiceAssistant}
              className="px-3.5 py-1.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition backdrop-blur-sm touch-manipulation cursor-pointer"
            >
              "Berapa saldo saya sekarang?"
            </button>
            <button
              onClick={onOpenVoiceAssistant}
              className="px-3.5 py-1.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition backdrop-blur-sm touch-manipulation cursor-pointer"
            >
              "Berapa pengeluaran makan bulan ini?"
            </button>
          </div>
        </div>

        {/* Right Buttons: Golden Yellow FAB & Voice Trigger */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
          {/* Main Gold Audio Play Button (Matching Livin Yellow Logo & Accent) */}
          <button
            type="button"
            onClick={handleToggleVoiceReport}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all transform active:scale-95 touch-manipulation cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 animate-pulse'
                : 'bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Hentikan Suara</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Dengarkan Laporan Audio</span>
              </>
            )}
          </button>

          {/* Secondary Pill Button with White Border */}
          <button
            type="button"
            onClick={onOpenVoiceAssistant}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition shadow-sm touch-manipulation cursor-pointer"
          >
            <Mic className="w-4 h-4 text-yellow-300" />
            <span>Bicara dengan Asisten</span>
          </button>
        </div>
      </div>
    </div>
  );
};
