'use client';

import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface FloatingVoiceButtonProps {
  onClick: () => void;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ onClick }) => {
  const { theme } = useFinancial();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 pointer-events-none">
      {/* Floating CTA Tooltip */}
      <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#003B99]/90 text-white border border-white/20 text-xs font-semibold shadow-lg backdrop-blur-md animate-bounce pointer-events-auto">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Bicara dengan Asisten</span>
      </div>

      {/* Pulsing ring animation */}
      <div className="relative pointer-events-auto">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40" />
        <button
          onClick={onClick}
          className="relative w-14 h-14 rounded-full bg-[#FF9800] hover:bg-[#F57C00] text-white flex items-center justify-center shadow-xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer border-2 border-white/30"
          title="Buka Asisten Suara (Voice Command)"
        >
          <Mic className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};
