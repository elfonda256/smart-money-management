'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu, 
  Mic, 
  Plus, 
  Users, 
  BookOpen, 
  ChevronDown, 
  Sun, 
  Moon, 
  Cloud, 
  RefreshCw,
  Bell,
  FileSpreadsheet,
  Coins,
  Smartphone,
  SlidersHorizontal,
  MoreVertical,
  Check
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenVoiceModal: () => void;
  onOpenTutorialModal: () => void;
  onOpenFamilyModal: () => void;
  onOpenAddTransaction?: () => void;
  onOpenNotificationModal?: () => void;
  onOpenBankImportModal?: () => void;
  onOpenCurrencyModal?: () => void;
  onOpenPwaGuide?: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  unreadNotifCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenVoiceModal,
  onOpenTutorialModal,
  onOpenFamilyModal,
  onOpenAddTransaction,
  onOpenNotificationModal,
  onOpenBankImportModal,
  onOpenCurrencyModal,
  onOpenPwaGuide,
  canInstallPwa,
  onInstallPwa,
  unreadNotifCount = 0,
}) => {
  const { activeProfile, theme, toggleTheme, cloudSyncStatus, triggerManualSync } = useFinancial();
  const isLight = theme === 'light';
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`h-16 px-4 sm:px-6 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between transition-colors duration-200 border-b shadow-sm ${
      isLight 
        ? 'bg-white/90 border-slate-200/80 text-slate-800' 
        : 'bg-[#061530]/90 border-blue-900/40 text-slate-100'
    }`}>
      {/* Left section: Mobile menu & User Profile Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className={`p-2 rounded-xl lg:hidden transition touch-manipulation cursor-pointer shrink-0 ${
            isLight ? 'text-[#005CE6] hover:bg-blue-50 active:bg-blue-100' : 'text-blue-300 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile App Brand Indicator */}
        <div className="lg:hidden flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-blue-200 flex items-center justify-center shadow-sm shrink-0">
            <Image src="/logo.png" alt="Logo" width={22} height={22} className="object-contain" />
          </div>
          <span className={`font-bold text-sm truncate ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            SmartMoney
          </span>
        </div>

        {/* Desktop Active User Profile Pill */}
        <button
          onClick={onOpenFamilyModal}
          className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition text-left group touch-manipulation cursor-pointer ${
            isLight 
              ? 'bg-slate-50/80 hover:bg-blue-50/80 border-slate-200 hover:border-blue-300 text-slate-900 shadow-sm' 
              : 'bg-[#0c2658]/70 hover:bg-[#12367c] border-blue-500/30 text-white'
          }`}
          title="Klik untuk ganti profil atau edit nama anggota keluarga"
        >
          <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-base shadow-sm shrink-0 ${
            isLight ? 'bg-white border-blue-200 text-[#005CE6]' : 'bg-slate-800 border-blue-700'
          }`}>
            {activeProfile.avatarEmoji || '👤'}
          </div>

          <div className="min-w-0">
            <div className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              isLight ? 'text-[#005CE6]' : 'text-blue-400'
            }`}>
              <span>{activeProfile.role}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#005CE6] transition" />
            </div>
            <h2 className={`text-xs font-bold leading-tight truncate max-w-[120px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {activeProfile.name}
            </h2>
          </div>
        </button>
      </div>

      {/* Right section: Streamlined, Organized Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Icon Group (Notification Bell, Theme, Cloud) */}
        <div className="flex items-center gap-1.5">
          {/* Notification Center Bell with Badge */}
          {onOpenNotificationModal && (
            <button
              onClick={onOpenNotificationModal}
              className={`relative p-2 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
                isLight 
                  ? 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200' 
                  : 'bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border-slate-700'
              }`}
              title="Pusat Notifikasi & Pengingat Tagihan"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Switcher (Siang / Malam) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
              isLight 
                ? 'bg-slate-50 hover:bg-amber-50 text-amber-600 border-slate-200' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
            title={isLight ? 'Ganti ke Mode Malam' : 'Ganti ke Mode Siang'}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Cloud Sync Indicator */}
          {cloudSyncStatus === 'local' ? (
            <Link
              href="/settings"
              className={`p-2 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer flex items-center gap-1 ${
                isLight ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-800'
              }`}
              title="Hubungkan ke Cloud Supabase"
            >
              <Cloud className="w-4 h-4 text-amber-500" />
            </Link>
          ) : (
            <button
              onClick={() => triggerManualSync()}
              className={`p-2 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
                isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              }`}
              title="Sinkronisasi Cloud Aktif"
            >
              <RefreshCw className={`w-4 h-4 ${cloudSyncStatus === 'syncing' ? 'animate-spin text-blue-500' : 'text-emerald-500'}`} />
            </button>
          )}
        </div>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Financial Tools Dropdown Menu (Sleek & Uncluttered) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsToolsDropdownOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition touch-manipulation cursor-pointer ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alat Tambahan (Import Mutasi, Kurs Valas, PWA, Panduan)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#005CE6]" />
            <span className="hidden sm:inline">Fitur Tambahan</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Tools Popover Dropdown */}
          {isToolsDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl py-2 z-50 animate-fade-in ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0a1f46] border-blue-900/60 text-slate-100'
            }`}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                Alat & Utilitas
              </div>

              {/* Import Mutasi Bank */}
              {onOpenBankImportModal && (
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenBankImportModal();
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                    isLight ? 'hover:bg-blue-50 text-slate-700' : 'hover:bg-blue-900/40 text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#005CE6]" />
                  <div>
                    <div className="font-bold">Import Mutasi Bank</div>
                    <div className="text-[10px] text-slate-400">BCA, Mandiri, BRI, GoPay (CSV)</div>
                  </div>
                </button>
              )}

              {/* Kurs Valas Converter */}
              {onOpenCurrencyModal && (
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenCurrencyModal();
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                    isLight ? 'hover:bg-blue-50 text-slate-700' : 'hover:bg-blue-900/40 text-slate-200'
                  }`}
                >
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">Kalkulator Kurs Valas</div>
                    <div className="text-[10px] text-slate-400">USD, SGD, EUR, Crypto realtime</div>
                  </div>
                </button>
              )}

              {/* Install PWA */}
              {(canInstallPwa || onOpenPwaGuide) && (
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    if (canInstallPwa && onInstallPwa) onInstallPwa();
                    else if (onOpenPwaGuide) onOpenPwaGuide();
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                    isLight ? 'hover:bg-blue-50 text-slate-700' : 'hover:bg-blue-900/40 text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-violet-500" />
                  <div>
                    <div className="font-bold">Install Aplikasi</div>
                    <div className="text-[10px] text-slate-400">Pasang ke Layar Utama HP/Laptop</div>
                  </div>
                </button>
              )}

              {/* Panduan */}
              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenTutorialModal();
                }}
                className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 ${
                  isLight ? 'hover:bg-blue-50 text-slate-700' : 'hover:bg-blue-900/40 text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span className="font-bold">Panduan Penggunaan</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Button: Voice Assistant (Mandiri Royal Cobalt Blue) */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#005CE6] to-[#004dc2] hover:from-[#004dc2] hover:to-[#003B99] text-white text-xs font-bold shadow-md shadow-blue-600/20 transition group touch-manipulation cursor-pointer shrink-0 active:scale-95"
        >
          <Mic className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Perintah Suara</span>
        </button>

        {/* Quick Add Transaction Button */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className={`flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition touch-manipulation cursor-pointer shrink-0 shadow-sm active:scale-95 ${
              isLight 
                ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
            title="Tambah Transaksi Manual"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline ml-1">Transaksi</span>
          </button>
        )}
      </div>
    </header>
  );
};
