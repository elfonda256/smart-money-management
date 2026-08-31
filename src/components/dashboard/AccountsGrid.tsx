'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  Smartphone, 
  Wallet, 
  Coins, 
  TrendingUp, 
  Plus, 
  Check, 
  X,
  CreditCard 
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency } from '@/lib/utils/formatters';
import { Account } from '@/types';

export const AccountsGrid: React.FC = () => {
  const { accounts, addAccount, activeProfile, theme } = useFinancial();
  const isLight = theme === 'light';

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [balance, setBalance] = useState('');

  const getAccountIcon = (accType: Account['type']) => {
    switch (accType) {
      case 'bank': return Building;
      case 'ewallet': return Smartphone;
      case 'cash': return Coins;
      case 'investment': return TrendingUp;
      case 'credit': return CreditCard;
      default: return Wallet;
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      currency: 'IDR',
      color: type === 'bank' ? '#005CE6' : type === 'ewallet' ? '#0084FF' : '#10B981',
    });

    setName('');
    setBalance('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Akun Finansial & Dompet {activeProfile.name.split(' ')[0]}
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-blue-200/80'}`}>
            Daftar rekening bank, e-wallet, dan pos kas aktif
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold transition shadow-sm touch-manipulation cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Akun</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          return (
            <div
              key={acc.id}
              className={`p-4 rounded-3xl border transition shadow-sm flex flex-col justify-between ${
                isLight 
                  ? 'bg-white hover:bg-blue-50/30 border-blue-100 shadow-slate-200/40 hover:border-blue-300' 
                  : 'bg-[#0c2658] border-blue-900/40 hover:border-blue-700 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: acc.color || '#005CE6' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isLight ? 'bg-blue-50 text-[#005CE6]' : 'bg-blue-950 text-blue-300'
                }`}>
                  {acc.type}
                </span>
              </div>

              <div>
                <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {acc.name}
                </div>
                <div className={`text-xs sm:text-sm font-black mt-1 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                  {formatCurrency(acc.balance)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                Tambah Akun Baru ({activeProfile.name.split(' ')[0]})
              </h4>
              <button onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nama Akun / Bank
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mandiri Payroll, BCA, GoPay, Dompet Tunai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Tipe Akun
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                >
                  <option value="bank">Bank (Mandiri, BCA, BRI, dll)</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="cash">Tunai / Dompet Saku</option>
                  <option value="investment">Investasi / Reksadana / Saham</option>
                  <option value="credit">Kartu Kredit</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs font-bold focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-600 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] text-white rounded-full text-xs font-bold shadow-md"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
