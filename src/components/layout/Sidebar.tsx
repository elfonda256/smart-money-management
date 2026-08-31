'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  Receipt, 
  FileText, 
  Settings, 
  Sparkles, 
  Mic, 
  Wallet, 
  BookOpen, 
  RefreshCw, 
  Users, 
  Crown, 
  X 
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency } from '@/lib/utils/formatters';

interface SidebarProps {
  onOpenVoiceModal: () => void;
  onOpenTutorialModal?: () => void;
  onOpenFamilyModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenVoiceModal,
  onOpenTutorialModal,
  onOpenFamilyModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { totalBalance, accounts, resetAllData, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';

  const navItems = [
    { href: '/', label: 'Dashboard Utama', icon: LayoutDashboard },
    { href: '/transactions', label: 'Catatan Transaksi', icon: ArrowLeftRight },
    { href: '/budgets', label: 'Batas Anggaran', icon: PieChart },
    { href: '/goals', label: 'Target Tabungan', icon: Target },
    { href: '/debts', label: 'Hutang & Piutang', icon: Receipt },
    { href: '/reports', label: 'Laporan Finansial', icon: FileText },
    { href: '/tutorial', label: 'Panduan & Tutorial', icon: BookOpen, badge: 'PANDUAN' },
    { href: '/settings', label: 'Pengaturan Suara', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop - only rendered when open */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer touch-manipulation animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar: display:none on mobile when closed so it NEVER captures touches */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] flex-col border-r shadow-2xl lg:shadow-sm ${
          isOpenMobile 
            ? 'flex translate-x-0' 
            : 'hidden lg:flex lg:translate-x-0'
        } ${
          isLight 
            ? 'bg-white border-blue-100 text-slate-800' 
            : 'bg-[#061530] border-blue-900/40 text-slate-100'
        }`}
      >
        {/* App Logo & Title */}
        <div className={`h-16 px-5 flex items-center justify-between border-b shrink-0 ${
          isLight ? 'bg-blue-50/40 border-blue-100' : 'bg-[#0a1f46]/50 border-blue-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm p-1 border border-blue-200 shrink-0">
              <Image
                src="/logo.png"
                alt="Smart Money Logo"
                width={34}
                height={34}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className={`text-base font-bold tracking-tight truncate ${
                isLight ? 'text-[#003B99]' : 'text-white'
              }`}>
                SmartMoney
              </h1>
              <p className="text-[10px] font-semibold text-[#005CE6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005CE6] animate-pulse" />
                Voice & Family AI
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-2 rounded-xl lg:hidden touch-manipulation cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Member Selector Card */}
        {onOpenFamilyModal && (
          <div className={`p-3.5 mx-4 mt-4 rounded-2xl border transition shadow-sm shrink-0 ${
            isLight 
              ? 'bg-blue-50/50 border-blue-200/70' 
              : 'bg-gradient-to-r from-[#0c2658]/90 to-[#061530]/90 border-blue-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{activeProfile.avatarEmoji}</span>
                <div className="min-w-0">
                  <div className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                    isLight ? 'text-[#005CE6]' : 'text-blue-400'
                  }`}>
                    {activeProfile.role}
                  </div>
                  <div className={`text-xs font-bold truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {activeProfile.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onOpenFamilyModal();
                  onCloseMobile?.();
                }}
                className="px-3 py-1 bg-[#005CE6] hover:bg-[#004dc2] text-white text-[10px] font-bold rounded-full shadow-sm shrink-0 touch-manipulation cursor-pointer"
              >
                Ganti
              </button>
            </div>
          </div>
        )}

        {/* Active User Total Balance Card */}
        <div className={`p-4 mx-4 mt-3 rounded-2xl border shadow-sm shrink-0 ${
          isLight 
            ? 'bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-200/60' 
            : 'bg-gradient-to-br from-[#0c2658]/90 to-[#061530]/90 border-blue-800/50'
        }`}>
          <div className={`flex items-center justify-between text-xs font-semibold ${
            isLight ? 'text-[#003B99]' : 'text-blue-300'
          }`}>
            <span>Saldo {activeProfile.name.split(' ')[0]}</span>
            <Wallet className={`w-3.5 h-3.5 ${isLight ? 'text-[#005CE6]' : 'text-yellow-400'}`} />
          </div>
          <div className={`mt-1 text-lg font-bold tracking-tight ${
            isLight ? 'text-[#003B99]' : 'text-white'
          }`}>
            {formatCurrency(totalBalance)}
          </div>
          <div className={`mt-1 flex items-center justify-between text-[10px] font-medium ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>{accounts.length} Akun Terhubung</span>
            <span className={isLight ? 'text-emerald-600 font-bold' : 'text-yellow-400 font-bold'}>● Aktif</span>
          </div>
        </div>

        {/* Quick Voice Assistant Banner Button */}
        <div className="px-4 mt-3 shrink-0">
          <button
            onClick={() => {
              onOpenVoiceModal();
              onCloseMobile?.();
            }}
            type="button"
            className="w-full py-2.5 px-4 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition group touch-manipulation cursor-pointer"
          >
            <Mic className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition" />
            <span>Tanya Asisten Suara</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition touch-manipulation ${
                  isActive
                    ? isLight
                      ? 'bg-blue-50 text-[#005CE6] border border-blue-200 font-bold shadow-sm'
                      : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:text-[#005CE6] hover:bg-blue-50/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? isLight ? 'text-[#005CE6]' : 'text-blue-400' 
                      : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isLight 
                      ? 'bg-blue-100 text-[#003B99]' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Reset Data */}
        <div className={`p-4 border-t space-y-2 shrink-0 ${
          isLight ? 'bg-slate-50/80 border-blue-100' : 'bg-[#061530]/80 border-blue-900/40'
        }`}>
          {onOpenTutorialModal && (
            <button
              onClick={() => {
                onOpenTutorialModal();
                onCloseMobile?.();
              }}
              type="button"
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-semibold transition border touch-manipulation cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-blue-50 text-[#003B99] border-blue-200 shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#005CE6]" />
              <span>Buka Panduan Cepat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset ulang semua data ke data simulasi awal keluarga?')) {
                resetAllData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-400 hover:text-rose-500 text-[10px] font-medium transition touch-manipulation cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
