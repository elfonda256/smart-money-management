'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, Mic, Plus, Users, BookOpen, ChevronDown, Sun, Moon, Cloud, RefreshCw } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenVoiceModal: () => void;
  onOpenTutorialModal: () => void;
  onOpenFamilyModal: () => void;
  onOpenAddTransaction?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenVoiceModal,
  onOpenTutorialModal,
  onOpenFamilyModal,
  onOpenAddTransaction,
}) => {
  const { activeProfile, theme, toggleTheme, cloudSyncStatus, triggerManualSync } = useFinancial();
  const isLight = theme === 'light';

  return (
    <header className={`h-16 px-3 sm:px-6 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between transition-colors duration-200 border-b shadow-sm ${
      isLight 
        ? 'bg-white/95 border-blue-100 text-slate-800' 
        : 'bg-[#061530]/90 border-blue-900/40 text-slate-100'
    }`}>
      {/* Left side: Mobile menu & Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className={`p-2.5 rounded-2xl lg:hidden transition touch-manipulation cursor-pointer shrink-0 ${
            isLight ? 'text-[#005CE6] hover:bg-blue-50 active:bg-blue-100' : 'text-blue-300 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo Indicator */}
        <div className="lg:hidden flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-blue-200 flex items-center justify-center shadow-sm shrink-0">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className={`font-bold text-sm truncate ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            SmartMoney
          </span>
        </div>

        {/* Desktop User Switcher Trigger Button (Pill shaped) */}
        <button
          onClick={onOpenFamilyModal}
          className={`hidden sm:flex items-center gap-2.5 p-1.5 pr-4 rounded-full border transition text-left group touch-manipulation cursor-pointer ${
            isLight 
              ? 'bg-blue-50/60 hover:bg-blue-100/60 border-blue-200 text-slate-900 shadow-sm' 
              : 'bg-[#0c2658]/80 hover:bg-[#12367c] border-blue-500/30 text-white'
          }`}
          title="Klik untuk ganti profil atau edit nama anggota keluarga"
        >
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg shadow-sm shrink-0 ${
            isLight ? 'bg-white border-blue-200 text-[#005CE6]' : 'bg-slate-800 border-blue-700'
          }`}>
            {activeProfile.avatarEmoji || '👤'}
          </div>

          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              isLight ? 'text-[#005CE6]' : 'text-blue-400'
            }`}>
              <span>{activeProfile.role}</span>
              <ChevronDown className="w-3 h-3 text-blue-400 group-hover:text-[#005CE6] transition" />
            </div>
            <h2 className={`text-xs font-bold leading-tight truncate max-w-[150px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {activeProfile.name}
            </h2>
          </div>
        </button>
      </div>

      {/* Right side: Actions (Pill shaped buttons) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Cloud Sync Status Indicator */}
        <button
          onClick={() => triggerManualSync()}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold transition shadow-sm touch-manipulation cursor-pointer flex items-center gap-1.5 ${
            cloudSyncStatus === 'connected'
              ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : cloudSyncStatus === 'syncing'
              ? isLight ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' : 'bg-blue-950/40 text-blue-300 border-blue-800/60'
              : isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Status Sinkronisasi Cloud Supabase (Klik untuk Sync manual)"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin text-blue-500' : cloudSyncStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span className="hidden md:inline text-[11px]">
            {cloudSyncStatus === 'connected' ? 'Cloud Terhubung' : cloudSyncStatus === 'syncing' ? 'Menyinkronkan...' : 'Mode Lokal'}
          </span>
        </button>

        {/* Day / Night Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold transition shadow-sm touch-manipulation cursor-pointer ${
            isLight 
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' 
              : 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700'
          }`}
          title={isLight ? 'Ganti ke Mode Malam' : 'Ganti ke Mode Siang'}
        >
          {isLight ? (
            <div className="flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Malam</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Siang</span>
            </div>
          )}
        </button>

        {/* Family Switcher Mobile/Desktop Quick Button */}
        <button
          onClick={onOpenFamilyModal}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer flex items-center gap-1.5 ${
            isLight 
              ? 'bg-blue-50 hover:bg-blue-100 text-[#005CE6] border-blue-200' 
              : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 hover:text-white border-blue-800/60'
          }`}
          title="Ganti Profil Anggota Keluarga"
        >
          <Users className="w-4 h-4 text-[#005CE6]" />
          <span className="text-xs">{activeProfile.avatarEmoji}</span>
          <span className="hidden md:inline">Keluarga</span>
        </button>

        {/* Tutorial Button (Desktop) */}
        <button
          onClick={onOpenTutorialModal}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
            isLight 
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200' 
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
          }`}
          title="Buka panduan cara penggunaan"
        >
          <BookOpen className="w-4 h-4 text-[#005CE6]" />
          <span className="hidden md:inline">Panduan</span>
        </button>

        {/* Voice Trigger Button (Mandiri Royal Cobalt Blue) */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-md shadow-blue-600/25 transition group touch-manipulation cursor-pointer shrink-0"
        >
          <Mic className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition" />
          <span className="hidden sm:inline">Perintah Suara</span>
        </button>

        {/* Quick Add Transaction */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className={`flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
              isLight 
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
            }`}
            title="Tambah Transaksi"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline ml-1">Transaksi</span>
          </button>
        )}
      </div>
    </header>
  );
};
