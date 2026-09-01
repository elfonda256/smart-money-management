'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, ArrowLeftRight, RefreshCw, TrendingUp } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_RATES: Record<string, number> = {
  IDR: 1,
  USD: 0.000063,      // 1 USD ≈ Rp 15.850
  SGD: 0.000085,      // 1 SGD ≈ Rp 11.750
  EUR: 0.000058,      // 1 EUR ≈ Rp 17.200
  JPY: 0.0097,        // 1 JPY ≈ Rp 103
  MYR: 0.00028,       // 1 MYR ≈ Rp 3.570
  AUD: 0.000096,      // 1 AUD ≈ Rp 10.400
  GBP: 0.000049,      // 1 GBP ≈ Rp 20.400
  BTC: 0.00000000065, // 1 BTC ≈ Rp 1.540.000.000
  USDT: 0.000063      // 1 USDT ≈ Rp 15.850
};

const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah Indonesia', flag: '🇮🇩', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'BTC', name: 'Bitcoin (Crypto)', flag: '🪙', symbol: '₿' },
  { code: 'USDT', name: 'Tether USD', flag: '💵', symbol: '₮' }
];

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose }) => {
  const { accounts, theme } = useFinancial();
  const isLight = theme === 'light';

  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('IDR');
  const [amount, setAmount] = useState<number>(100);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);

  // Fetch live exchange rates on mount
  useEffect(() => {
    if (!isOpen) return;

    const fetchLiveRates = async () => {
      setIsFetchingRates(true);
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/IDR');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            setRates(prev => ({ ...prev, ...data.rates }));
          }
        }
      } catch (e) {
        console.log('[Valas] Using offline fallback rates');
      } finally {
        setIsFetchingRates(false);
      }
    };

    fetchLiveRates();
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculation: From -> IDR -> To
  const rateFromToIdr = 1 / (rates[fromCurr] || DEFAULT_RATES[fromCurr] || 1);
  const amountInIdr = amount * rateFromToIdr;
  const convertedValue = amountInIdr * (rates[toCurr] || DEFAULT_RATES[toCurr] || 1);

  // Total User Balance across all accounts in IDR
  const totalBalanceIdr = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const swapCurrencies = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/50 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#0c2658]/40 border-blue-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kalkulator Kurs Valas & Multi-Currency</h3>
              <p className="text-xs text-slate-500">Nilai tukar mata uang global (USD, SGD, EUR, JPY) & Crypto realtime.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Converter Widget */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border-blue-100' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* From */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Dari Mata Uang:</label>
                <div className="flex gap-2">
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className={`w-32 px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold outline-none ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                    placeholder="Nominal"
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Ke Mata Uang:</label>
                <div className="flex gap-2">
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className={`w-32 px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={swapCurrencies}
                    className={`p-2.5 rounded-xl border transition ${
                      isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-[#005CE6]' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400'
                    }`}
                    title="Tukar Posisi"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Result Display */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Hasil Konversi:</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-500">
                  {toCurr === 'IDR'
                    ? `Rp ${Math.round(convertedValue).toLocaleString('id-ID')}`
                    : toCurr === 'BTC'
                    ? `${convertedValue.toFixed(8)} BTC`
                    : `${convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurr}`}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                  {isFetchingRates ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  )}
                  Kurs: 1 {fromCurr} = {toCurr === 'IDR' ? `Rp ${Math.round(rateFromToIdr * (rates[toCurr] || 1)).toLocaleString('id-ID')}` : (rateFromToIdr * (rates[toCurr] || 1)).toFixed(4) + ' ' + toCurr}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Currency Net Worth Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              🌐 Estimasi Total Saldo Bersihmu (Net Worth Multi-Valas):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
                { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
                { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
                { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
                { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
                { code: 'BTC', name: 'Bitcoin', flag: '🪙', symbol: '₿' }
              ].map(c => {
                const r = rates[c.code] || DEFAULT_RATES[c.code] || 0.000063;
                const converted = totalBalanceIdr * r;
                const displayVal = c.code === 'BTC'
                  ? `${converted.toFixed(6)} BTC`
                  : `${c.symbol} ${Math.round(converted).toLocaleString('en-US')}`;

                return (
                  <div key={c.code} className={`p-3.5 rounded-2xl border text-center transition ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <div className="text-lg mb-1">{c.flag}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{c.name} ({c.code})</div>
                    <div className={`text-sm font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {displayVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
