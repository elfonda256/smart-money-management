'use client';

import React, { useState } from 'react';
import { VoiceSummaryCard } from '@/components/dashboard/VoiceSummaryCard';
import { BalanceOverview } from '@/components/dashboard/BalanceOverview';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { AIInsightBanner } from '@/components/dashboard/AIInsightBanner';
import { RecentTransactionsList } from '@/components/dashboard/RecentTransactionsList';
import { AccountsGrid } from '@/components/dashboard/AccountsGrid';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { FamilySwitcherModal } from '@/components/family/FamilySwitcherModal';

export default function DashboardPage() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* 1. Voice Financial Intelligence Summary Banner (Mandiri Livin Gold & Blue) */}
      <VoiceSummaryCard
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenFamilyModal={() => setIsFamilyOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* 2. Key Balance & Financial Metrics */}
      <BalanceOverview />

      {/* 3. AI Insights & Financial Tips */}
      <AIInsightBanner />

      {/* 4. Charts: Cashflow Trends & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      {/* 5. Accounts & E-Wallets */}
      <AccountsGrid />

      {/* 6. Recent Transactions Table */}
      <RecentTransactionsList />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Interactive Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
      />

      {/* Family Multi-User Switcher Modal */}
      <FamilySwitcherModal
        isOpen={isFamilyOpen}
        onClose={() => setIsFamilyOpen(false)}
      />
    </div>
  );
}
