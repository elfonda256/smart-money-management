'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

export const AIInsightBanner: React.FC = () => {
  const { aiInsights, theme } = useFinancial();
  const isLight = theme === 'light';

  if (!aiInsights || aiInsights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-blue-100 text-[#005CE6] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            AI Financial Insights & Rekomendasi
          </h3>
        </div>
        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-blue-200/70'}`}>
          Diperbarui secara otomatis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {aiInsights.map((insight) => {
          const isWarning = insight.type === 'warning';
          const isPraise = insight.type === 'praise';
          const isTip = insight.type === 'tip';

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-3xl border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                isLight
                  ? isWarning
                    ? 'bg-amber-50/80 border-amber-200 text-slate-800'
                    : isPraise
                    ? 'bg-emerald-50/80 border-emerald-200 text-slate-800'
                    : 'bg-white border-blue-100 text-slate-800 shadow-slate-200/40'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : isPraise
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#0c2658] border-blue-900/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isWarning && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />}
                  {isPraise && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                  {isTip && <Lightbulb className="w-4 h-4 shrink-0 text-[#005CE6] dark:text-blue-400" />}

                  <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {insight.title}
                  </h4>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {insight.message}
                </p>
              </div>

              {insight.actionUrl && (
                <div className={`mt-3 pt-2 border-t flex items-center justify-end ${
                  isLight ? 'border-slate-100' : 'border-blue-900/40'
                }`}>
                  <Link
                    href={insight.actionUrl}
                    className="text-xs font-bold text-[#005CE6] hover:text-[#004dc2] flex items-center gap-1 transition"
                  >
                    <span>{insight.actionLabel || 'Lihat Detail'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
