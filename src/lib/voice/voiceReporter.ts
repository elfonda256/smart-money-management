import { Account, Category, Transaction, Budget, FinancialGoal, Debt } from '@/types';
import { formatCurrency, formatShortNumber } from '@/lib/utils/formatters';

export interface VoiceReportResult {
  spokenScript: string;
  shortTitle: string;
  metrics: {
    label: string;
    value: string;
    change?: string;
    type?: 'positive' | 'negative' | 'neutral';
  }[];
  topCategories: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  recommendation: string;
}

export function generateFinancialVoiceReport(data: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  debts: Debt[];
  period?: 'this_month' | 'last_month' | 'this_year';
}): VoiceReportResult {
  const { accounts, categories, transactions, budgets, goals, debts } = data;

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYearNum = now.getFullYear();
  const prevMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
  const prevYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

  // Filter transactions
  const curMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
  });

  const prevMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonthNum && d.getFullYear() === prevYearNum;
  });

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const curIncome = curMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const curExpense = curMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const prevExpense = prevMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Growth calculation
  let expenseDiffPercent = 0;
  let growthText = 'stabil';
  if (prevExpense > 0) {
    expenseDiffPercent = Math.round(((curExpense - prevExpense) / prevExpense) * 100);
    if (expenseDiffPercent > 0) {
      growthText = `naik ${expenseDiffPercent}% dibanding bulan lalu`;
    } else if (expenseDiffPercent < 0) {
      growthText = `hemat ${Math.abs(expenseDiffPercent)}% dibanding bulan lalu`;
    }
  }

  // Category spending breakdown
  const categoryMap: Record<string, number> = {};
  curMonthTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryMap[t.category_id] = (categoryMap[t.category_id] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Lainnya',
        amount,
        percentage: curExpense > 0 ? Math.round((amount / curExpense) * 100) : 0,
        color: cat?.color || '#3B82F6',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const topCategory = sortedCategories[0];

  // Savings rate
  const savingsAmount = curIncome - curExpense;
  const savingsRate = curIncome > 0 ? Math.max(0, Math.round((savingsAmount / curIncome) * 100)) : 0;

  // Emergency Fund Goal status
  const emergencyGoal = goals.find(g => g.name.toLowerCase().includes('darurat') || g.category.toLowerCase().includes('safety'));
  let emergencyGoalText = '';
  if (emergencyGoal) {
    const goalPct = Math.round((emergencyGoal.current_amount / emergencyGoal.target_amount) * 100);
    emergencyGoalText = `Target dana darurat Anda saat ini telah terkumpul ${goalPct}%.`;
  }

  // Budget status
  let budgetWarningText = '';
  const overBudgets = budgets.filter(b => {
    const spent = categoryMap[b.category_id] || 0;
    return spent > b.amount;
  });
  if (overBudgets.length > 0) {
    const overCat = categories.find(c => c.id === overBudgets[0].category_id);
    budgetWarningText = `Perhatian, Anda telah melebihi batas anggaran untuk kategori ${overCat?.name || 'tertentu'}.`;
  }

  // Construct natural conversational spoken script
  let spokenScript = `Halo! Berikut laporan ringkas keuangan Anda bulan ini. Total saldo di seluruh akun saat ini adalah ${formatSpokenCurrency(totalBalance)}. `;
  spokenScript += `Bulan ini, Anda mencatatkan pengeluaran sebesar ${formatSpokenCurrency(curExpense)}, ${growthText}. `;

  if (topCategory) {
    spokenScript += `Pos pengeluaran terbesar adalah ${topCategory.name} sebesar ${formatSpokenCurrency(topCategory.amount)}, atau sekitar ${topCategory.percentage}% dari total pengeluaran. `;
  }

  if (curIncome > 0) {
    spokenScript += `Total pemasukan Anda sebesar ${formatSpokenCurrency(curIncome)}, dengan tingkat tabungan mencapai ${savingsRate}%. `;
  }

  if (budgetWarningText) {
    spokenScript += `${budgetWarningText} `;
  } else if (savingsRate >= 20) {
    spokenScript += `Kondisi finansial Anda berada dalam kategori sehat dan terkendali. `;
  }

  if (emergencyGoalText) {
    spokenScript += `${emergencyGoalText}`;
  }

  // Construct recommendation
  let recommendation = 'Pertahankan disiplin pencatatan transaksi untuk menjaga cashflow tetap sehat.';
  if (overBudgets.length > 0) {
    recommendation = 'Kurangi pengeluaran sekunder pada kategori yang overbudget hingga akhir bulan.';
  } else if (savingsRate >= 30) {
    recommendation = 'Tingkat tabungan sangat tinggi! Pertimbangkan untuk menambah porsi investasi pada reksadana atau saham.';
  }

  return {
    spokenScript,
    shortTitle: 'Ringkasan Keuangan Pintar',
    metrics: [
      {
        label: 'Total Saldo',
        value: formatCurrency(totalBalance),
        type: 'neutral',
      },
      {
        label: 'Pengeluaran Bulan Ini',
        value: formatCurrency(curExpense),
        change: expenseDiffPercent !== 0 ? `${expenseDiffPercent > 0 ? '+' : ''}${expenseDiffPercent}% vs bln lalu` : 'Stabil',
        type: expenseDiffPercent > 10 ? 'negative' : 'positive',
      },
      {
        label: 'Pemasukan Bulan Ini',
        value: formatCurrency(curIncome),
        type: 'positive',
      },
      {
        label: 'Savings Rate',
        value: `${savingsRate}%`,
        type: savingsRate >= 20 ? 'positive' : 'negative',
      },
    ],
    topCategories: sortedCategories.slice(0, 4),
    recommendation,
  };
}

function formatSpokenCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    const m = (amount / 1_000_000_000).toFixed(1).replace('.0', '');
    return `${m} miliar rupiah`;
  }
  if (amount >= 1_000_000) {
    const jt = (amount / 1_000_000).toFixed(1).replace('.0', '');
    return `${jt} juta rupiah`;
  }
  if (amount >= 1_000) {
    const rb = (amount / 1_000).toFixed(0);
    return `${rb} ribu rupiah`;
  }
  return `${amount} rupiah`;
}
