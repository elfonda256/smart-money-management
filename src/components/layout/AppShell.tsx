'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { FloatingVoiceButton } from '@/components/voice/FloatingVoiceButton';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { FamilySwitcherModal } from '@/components/family/FamilySwitcherModal';
import { useFinancial } from '@/lib/store/FinancialContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme } = useFinancial();

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
    </div>
  );
};
