'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, AlertTriangle, Clock, ShieldCheck, CheckCircle2, PieChart } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'success';
  title: string;
  message: string;
  icon: 'alert' | 'clock' | 'shield' | 'budget';
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const { debts, budgets, transactions, goals, theme } = useFinancial();
  const isLight = theme === 'light';

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const generatedAlerts: AlertItem[] = [];
    const today = new Date();
    const currentDay = today.getDate();

    // 1. Scan Debts / Cicilan / Bills Due Dates
    debts.forEach(d => {
      if (d.due_date) {
        const dueDate = new Date(d.due_date);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          generatedAlerts.push({
            id: `debt-${d.id}`,
            type: 'danger',
            title: `⚡ Jatuh Tempo Hari Ini: ${d.name}`,
            message: `Tagihan / cicilan ${d.name} sebesar Rp ${Number(d.minimum_payment || d.remaining_amount).toLocaleString('id-ID')} jatuh tempo hari ini!`,
            icon: 'alert'
          });
        } else if (diffDays <= 5) {
          generatedAlerts.push({
            id: `debt-${d.id}`,
            type: 'warning',
            title: `⏰ Pengingat Tagihan (H-${diffDays}): ${d.name}`,
            message: `Tagihan ${d.name} (Rp ${Number(d.minimum_payment || d.remaining_amount).toLocaleString('id-ID')}) akan jatuh tempo dalam ${diffDays} hari lagi.`,
            icon: 'clock'
          });
        }
      }
    });

    // Default Recurring Subscriptions Simulation Check
    const defaultSubs = [
      { name: 'Netflix Premium', amount: 186000, dueDay: 5 },
      { name: 'BPJS Kesehatan', amount: 150000, dueDay: 10 },
      { name: 'Wi-Fi / IndiHome', amount: 375000, dueDay: 20 }
    ];

    defaultSubs.forEach(sub => {
      let daysLeft = sub.dueDay - currentDay;
      if (daysLeft < 0) daysLeft += 30;

      if (daysLeft === 0) {
        generatedAlerts.push({
          id: `sub-${sub.name}`,
          type: 'danger',
          title: `⚡ Langganan ${sub.name} Jatuh Tempo!`,
          message: `Biaya ${sub.name} sebesar Rp ${sub.amount.toLocaleString('id-ID')} jatuh tempo hari ini.`,
          icon: 'alert'
        });
      } else if (daysLeft <= 3) {
        generatedAlerts.push({
          id: `sub-${sub.name}`,
          type: 'warning',
          title: `⏰ Pengingat Langganan (H-${daysLeft}): ${sub.name}`,
          message: `${sub.name} (Rp ${sub.amount.toLocaleString('id-ID')}) akan jatuh tempo tgl ${sub.dueDay}.`,
          icon: 'clock'
        });
      }
    });

    // 2. Scan Budget Overspending
    budgets.forEach(b => {
      if (b.spent_amount > b.allocated_amount) {
        generatedAlerts.push({
          id: `budget-${b.id}`,
          type: 'warning',
          title: `⚠️ Anggaran ${b.category} Melebihi Batas`,
          message: `Realisasi pengeluaran (Rp ${Number(b.spent_amount).toLocaleString('id-ID')}) telah melampaui alokasi target (Rp ${Number(b.allocated_amount).toLocaleString('id-ID')}).`,
          icon: 'budget'
        });
      }
    });

    // 3. Scan Goal Milestones
    goals.forEach(g => {
      if (g.current_amount >= g.target_amount) {
        generatedAlerts.push({
          id: `goal-${g.id}`,
          type: 'success',
          title: `🎉 Target ${g.name} Tercapai 100%!`,
          message: `Selamat! Target impian ${g.name} sebesar Rp ${Number(g.target_amount).toLocaleString('id-ID')} telah berhasil terkumpul penuh.`,
          icon: 'shield'
        });
      }
    });

    setAlerts(generatedAlerts);
  }, [isOpen, debts, budgets, goals]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser ini tidak mendukung Web Notification API.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      new Notification('Smart Money Management', {
        body: '🔔 Pengingat tagihan dan alarm finansial harian Anda telah aktif!',
        icon: '/icons/icon-192.svg'
      });
    }
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/50 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#0c2658]/40 border-blue-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pusat Notifikasi & Tagihan</h3>
              <p className="text-xs text-slate-500">Pengingat jatuh tempo & evaluasi kesehatan anggaran.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
          isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#091e42]/60 border-slate-800'
        }`}>
          <span className="text-slate-500 font-medium">Notifikasi Sistem Browser:</span>
          {notifPermission === 'granted' ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Push Aktif
            </span>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold transition shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Aktifkan Alarm</span>
            </button>
          )}
        </div>

        {/* List of Alerts */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Semua Aman & Terkendali!</h4>
              <p className="text-xs max-w-xs mx-auto">Tidak ada tagihan yang mendekati jatuh tempo atau pos anggaran yang melebihi batas.</p>
            </div>
          ) : (
            alerts.map((a) => {
              const borderCol = a.type === 'danger' ? 'border-rose-500' : a.type === 'warning' ? 'border-amber-500' : 'border-emerald-500';
              const textCol = a.type === 'danger' ? 'text-rose-500' : a.type === 'warning' ? 'text-amber-500' : 'text-emerald-500';
              const bgCol = a.type === 'danger' ? (isLight ? 'bg-rose-50/70' : 'bg-rose-950/20') : a.type === 'warning' ? (isLight ? 'bg-amber-50/70' : 'bg-amber-950/20') : (isLight ? 'bg-emerald-50/70' : 'bg-emerald-950/20');

              return (
                <div key={a.id} className={`p-4 rounded-2xl border-l-4 border ${borderCol} ${bgCol} space-y-1 relative group`}>
                  <div className="flex items-center justify-between pr-6">
                    <div className={`flex items-center gap-2 font-bold text-xs ${textCol}`}>
                      {a.icon === 'alert' && <AlertTriangle className="w-4 h-4" />}
                      {a.icon === 'clock' && <Clock className="w-4 h-4" />}
                      {a.icon === 'budget' && <PieChart className="w-4 h-4" />}
                      {a.icon === 'shield' && <ShieldCheck className="w-4 h-4" />}
                      <span>{a.title}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">{a.message}</p>
                  <button
                    onClick={() => handleDismiss(a.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    title="Tutup notifikasi ini"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end ${
          isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#0c2658]/20 border-slate-800'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
