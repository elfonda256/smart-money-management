'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency } from '@/lib/utils/formatters';

export const CategoryDonutChart: React.FC = () => {
  const { categorySpending, currentMonthExpense, theme } = useFinancial();
  const isLight = theme === 'light';

  const chartData = categorySpending
    .filter(c => c.amount > 0)
    .map(c => ({
      name: c.category.name,
      value: c.amount,
      color: c.category.color,
      percentage: c.percentage,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-1 border ${
          isLight 
            ? 'bg-white/95 border-blue-100 text-slate-800' 
            : 'bg-[#0c2658]/95 border-blue-500/40 text-white'
        }`}>
          <div className={`font-bold flex items-center gap-2 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-[#005CE6] dark:text-yellow-400 font-bold">
            {formatCurrency(data.value)} ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between ${
      isLight 
        ? 'bg-white border-blue-100 shadow-slate-200/50' 
        : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
    }`}>
      <div>
        <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
          Distribusi Pengeluaran
        </h3>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-blue-200/80'}`}>
          Proporsi Kategori Bulan Ini
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={isLight ? '#ffffff' : '#0c2658'} 
                      strokeWidth={2} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-400' : 'text-blue-300'}`}>
                Total
              </span>
              <span className={`text-xs font-black ${isLight ? 'text-[#003B99]' : 'text-yellow-400'}`}>
                {formatCurrency(currentMonthExpense)}
              </span>
            </div>
          </div>

          {/* Category Legends */}
          <div className="w-full mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
            {chartData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className={`font-medium truncate ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold shrink-0">
                  <span className={isLight ? 'text-slate-500' : 'text-blue-300'}>{item.percentage}%</span>
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`h-48 flex items-center justify-center text-xs italic ${
          isLight ? 'text-slate-400' : 'text-slate-400'
        }`}>
          Belum ada data pengeluaran bulan ini
        </div>
      )}
    </div>
  );
};
