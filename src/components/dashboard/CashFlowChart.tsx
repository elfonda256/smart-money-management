'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency, formatShortNumber } from '@/lib/utils/formatters';

export const CashFlowChart: React.FC = () => {
  const { transactions, theme } = useFinancial();
  const isLight = theme === 'light';

  const monthlyData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const curDate = new Date();
    const curMonth = curDate.getMonth();
    const curYear = curDate.getFullYear();

    const dataMap: { [key: string]: { name: string; income: number; expense: number } } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dataMap[key] = {
        name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        income: 0,
        expense: 0,
      };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (dataMap[key]) {
        if (t.type === 'income') {
          dataMap[key].income += t.amount;
        } else if (t.type === 'expense') {
          dataMap[key].expense += t.amount;
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-1.5 border ${
          isLight 
            ? 'bg-white/95 border-blue-100 text-slate-800' 
            : 'bg-[#0c2658]/95 border-blue-500/40 text-white'
        }`}>
          <div className={`font-bold mb-1 border-b pb-1 ${isLight ? 'border-slate-200 text-[#003B99]' : 'border-blue-900 text-white'}`}>
            {label}
          </div>
          <div className="text-[#005CE6] font-bold flex items-center justify-between gap-4">
            <span>Pemasukan:</span>
            <span>{formatCurrency(payload[0]?.value || 0)}</span>
          </div>
          <div className="text-rose-600 font-bold flex items-center justify-between gap-4">
            <span>Pengeluaran:</span>
            <span>{formatCurrency(payload[1]?.value || 0)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
      isLight 
        ? 'bg-white border-blue-100 shadow-slate-200/50' 
        : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            Tren Arus Kas (Cash Flow)
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-blue-200/80'}`}>
            Pemasukan vs Pengeluaran 6 Bulan Terakhir
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-[#005CE6] dark:text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005CE6]" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeMandiriGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005CE6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#005CE6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseMandiriGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e3a8a'} opacity={isLight ? 0.8 : 0.3} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={isLight ? '#64748b' : '#94a3b8'} 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke={isLight ? '#64748b' : '#94a3b8'} 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => formatShortNumber(v)} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#005CE6" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#incomeMandiriGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#F43F5E" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#expenseMandiriGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
