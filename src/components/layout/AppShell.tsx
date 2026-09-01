'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { FloatingVoiceButton } from '@/components/voice/FloatingVoiceButton';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { FamilySwitcherModal } from '@/components/family/FamilySwitcherModal';
import { BankImporterModal } from '@/components/modals/BankImporterModal';
import { NotificationCenterModal } from '@/components/modals/NotificationCenterModal';
import { CurrencyConverterModal } from '@/components/modals/CurrencyConverterModal';
import { PwaGuideModal } from '@/components/modals/PwaGuideModal';
import { useFinancial } from '@/lib/store/FinancialContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // New Modals
  const [isBankImportOpen, setIsBankImportOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);

  // PWA & Notification States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  const { theme, debts, budgets } = useFinancial();

  // PWA Service Worker Registration & Install Prompt Capture
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[PWA] Service Worker registered:', reg.scope);
      }).catch((err) => {
        console.warn('[PWA] SW register warn:', err);
      });

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const dismissed = localStorage.getItem('sm_pwa_dismissed');
        if (!dismissed) {
          setShowPwaBanner(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  // Compute Unread Notification Count
  useEffect(() => {
    let count = 0;
    const today = new Date();

    // Check debts due within 5 days
    debts.forEach(d => {
      if (d.due_date) {
        const diff = Math.ceil((new Date(d.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 5) count++;
      }
    });

    // Check overbudget
    budgets.forEach(b => {
      if (b.spent_amount > b.allocated_amount) count++;
    });

    // Plus 1 default subscription reminder
    count += 1;

    setUnreadNotifCount(count);
  }, [debts, budgets]);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);
      setDeferredPrompt(null);
      setShowPwaBanner(false);
    } else {
      setIsPwaGuideOpen(true);
    }
  };

  const handleDismissPwaBanner = () => {
    setShowPwaBanner(false);
    localStorage.setItem('sm_pwa_dismissed', 'true');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-[#F4F7FC] text-slate-800 selection:bg-amber-400 selection:text-slate-950' 
        : 'bg-[#061129] text-slate-100 selection:bg-amber-500 selection:text-slate-950'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
          onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
          onOpenAddTransaction={() => setIsTxModalOpen(true)}
          onOpenNotificationModal={() => setIsNotifModalOpen(true)}
          onOpenBankImportModal={() => setIsBankImportOpen(true)}
          onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
          onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
          canInstallPwa={!!deferredPrompt}
          onInstallPwa={handleInstallPwa}
          unreadNotifCount={unreadNotifCount}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Floating Microphone Action Button */}
      <FloatingVoiceButton
        onClick={() => setIsVoiceModalOpen(true)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      {/* Interactive Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
      />

      {/* Multi-User Family Switcher Modal */}
      <FamilySwitcherModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      {/* Bank & E-Wallet Statement Importer Modal */}
      <BankImporterModal
        isOpen={isBankImportOpen}
        onClose={() => setIsBankImportOpen(false)}
      />

      {/* Notification Center & Bill Reminders Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Multi-Currency & Kurs Valas Modal */}
      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />

      {/* PWA Installation Guide Modal */}
      <PwaGuideModal
        isOpen={isPwaGuideOpen}
        onClose={() => setIsPwaGuideOpen(false)}
      />

      {/* Floating PWA Install Banner */}
      {showPwaBanner && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] bg-[#061530]/95 text-white border border-blue-500/40 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-blue-300 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">Install SmartMoney</div>
              <div className="text-[10px] text-blue-200 truncate">Akses cepat & offline di HP Anda</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1.5 bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Install
            </button>
            <button
              onClick={handleDismissPwaBanner}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Nanti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
