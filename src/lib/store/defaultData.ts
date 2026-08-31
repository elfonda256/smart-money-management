import { Account, Category, Transaction, Budget, FinancialGoal, Debt, VoiceSettings, UserProfile } from '@/types';

export const DEFAULT_FAMILY_PROFILES: UserProfile[] = [
  {
    id: 'user_ayah',
    name: 'Agus Sugawi (Ayah)',
    email: 'agus.sugawi@keluarga.id',
    role: 'Ayah / Kepala Keluarga',
    avatarColor: '#003366',
    avatarEmoji: '👨‍💼',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 25000000,
    emergencyFundGoalMonths: 6,
    darkMode: true,
  },
  {
    id: 'user_ibu',
    name: 'Merys Novita (Ibu)',
    email: 'merys.novita@keluarga.id',
    role: 'Ibu / Pengelola Kas',
    avatarColor: '#E5A93C',
    avatarEmoji: '👩‍💼',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 15000000,
    emergencyFundGoalMonths: 6,
    darkMode: true,
  },
  {
    id: 'user_anak1',
    name: 'Elfano (Anak 1)',
    email: 'elfano@keluarga.id',
    role: 'Anak Pertama (Kuliah)',
    avatarColor: '#0075FF',
    avatarEmoji: '👦',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 4500000,
    emergencyFundGoalMonths: 3,
    darkMode: true,
  },
  {
    id: 'user_anak2',
    name: 'Sheila (Anak 2)',
    email: 'sheila@keluarga.id',
    role: 'Anak Kedua (SMA)',
    avatarColor: '#EC4899',
    avatarEmoji: '👧',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 1500000,
    emergencyFundGoalMonths: 2,
    darkMode: true,
  },
  {
    id: 'user_anak3',
    name: 'Nail (Anak 3)',
    email: 'nail@keluarga.id',
    role: 'Anak Ketiga (SMP)',
    avatarColor: '#10B981',
    avatarEmoji: '🧒',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 800000,
    emergencyFundGoalMonths: 2,
    darkMode: true,
  },
  {
    id: 'user_family',
    name: 'Kas Bersama Keluarga',
    email: 'vault@keluarga.id',
    role: 'Kas Bersama Rumah Tangga',
    avatarColor: '#F5A623',
    avatarEmoji: '🏡',
    currency: 'IDR',
    hasCompletedOnboarding: true,
    monthlyIncomeTarget: 40000000,
    emergencyFundGoalMonths: 12,
    darkMode: true,
  },
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const prevMonthNum = now.getMonth() === 0 ? 12 : now.getMonth();
const prevYearNum = now.getMonth() === 0 ? currentYear - 1 : currentYear;
const prevMonth = String(prevMonthNum).padStart(2, '0');

// Initial Data Generator per User
export function getInitialUserData(userId: string) {
  const categories: Category[] = [
    { id: 'cat_food', user_id: userId, name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#F5A623', budgetLimit: 3500000 },
    { id: 'cat_transport', user_id: userId, name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#0075FF', budgetLimit: 1500000 },
    { id: 'cat_shopping', user_id: userId, name: 'Belanja & Dapur', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', budgetLimit: 2500000 },
    { id: 'cat_bills', user_id: userId, name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#8B5CF6', budgetLimit: 2000000 },
    { id: 'cat_entertainment', user_id: userId, name: 'Hiburan & Edukasi', type: 'expense', icon: 'Film', color: '#10B981', budgetLimit: 1000000 },
    { id: 'cat_health', user_id: userId, name: 'Kesehatan & Donasi', type: 'expense', icon: 'HeartPulse', color: '#EF4444', budgetLimit: 1000000 },
    { id: 'cat_salary', user_id: userId, name: 'Gaji Bulanan', type: 'income', icon: 'Briefcase', color: '#10B981' },
    { id: 'cat_freelance', user_id: userId, name: 'Freelance & Bisnis', type: 'income', icon: 'Laptop', color: '#00A3FF' },
    { id: 'cat_allowance', user_id: userId, name: 'Uang Saku / Transfer Ayah', type: 'income', icon: 'Gift', color: '#F5A623' },
    { id: 'cat_investment', user_id: userId, name: 'Investasi & Tabungan', type: 'income', icon: 'LineChart', color: '#8B5CF6' },
  ];

  if (userId === 'user_ayah') {
    return {
      accounts: [
        { id: `acc_mandiri_${userId}`, user_id: userId, name: 'Mandiri Payroll Prioritas', type: 'bank', balance: 34500000, currency: 'IDR', color: '#003366', accountNumber: '142-00-88129-1' },
        { id: `acc_bca_${userId}`, user_id: userId, name: 'BCA Tabungan Utama', type: 'bank', balance: 18250000, currency: 'IDR', color: '#00529C', accountNumber: '8820-192-341' },
        { id: `acc_cash_${userId}`, user_id: userId, name: 'Dompet Tunai Ayah', type: 'cash', balance: 1450000, currency: 'IDR', color: '#10B981' },
        { id: `acc_bibit_${userId}`, user_id: userId, name: 'Bibit Reksadana Saham', type: 'investment', balance: 45000000, currency: 'IDR', color: '#0075FF' },
      ] as Account[],
      categories,
      transactions: [
        { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_salary', amount: 24000000, type: 'income', date: `${currentYear}-${currentMonth}-01T09:00:00`, description: 'Gaji Bulanan', source: 'manual' },
        { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_bills', amount: 1850000, type: 'expense', date: `${currentYear}-${currentMonth}-03T10:15:00`, description: 'Listrik PLN 3500VA & WiFi', source: 'voice' },
        { id: `tx_3_${userId}`, user_id: userId, account_id: `acc_bca_${userId}`, category_id: 'cat_transport', amount: 450000, type: 'expense', date: `${currentYear}-${currentMonth}-05T17:30:00`, description: 'Isi bensin Pertamax Turbo mobil', source: 'voice' },
        { id: `tx_4_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_food', amount: 85000, type: 'expense', date: `${currentYear}-${currentMonth}-07T12:30:00`, description: 'Makan siang resto bersama tim', source: 'voice' },
        { id: `tx_5_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_salary', amount: 24000000, type: 'income', date: `${prevYearNum}-${prevMonth}-01T09:00:00`, description: 'Gaji Bulanan', source: 'manual' },
        { id: `tx_6_${userId}`, user_id: userId, account_id: `acc_bca_${userId}`, category_id: 'cat_food', amount: 2800000, type: 'expense', date: `${prevYearNum}-${prevMonth}-15T12:00:00`, description: 'Total Kuliner Bulan Lalu', source: 'manual' },
      ] as Transaction[],
      budgets: [
        { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_food', amount: 4000000, month: now.getMonth() + 1, year: currentYear },
        { id: `b_2_${userId}`, user_id: userId, category_id: 'cat_transport', amount: 2000000, month: now.getMonth() + 1, year: currentYear },
        { id: `b_3_${userId}`, user_id: userId, category_id: 'cat_bills', amount: 3000000, month: now.getMonth() + 1, year: currentYear },
      ] as Budget[],
      goals: [
        { id: `g_1_${userId}`, user_id: userId, name: 'Dana Darurat Keluarga (6 Bulan)', target_amount: 80000000, current_amount: 62000000, deadline: `${currentYear + 1}-06-30`, category: 'Safety', color: '#F5A623' },
        { id: `g_2_${userId}`, user_id: userId, name: 'Renovasi Rumah & Taman', target_amount: 50000000, current_amount: 28000000, deadline: `${currentYear + 1}-12-31`, category: 'Asset', color: '#0075FF' },
      ] as FinancialGoal[],
      debts: [
        { id: `d_1_${userId}`, user_id: userId, type: 'receivable', person: 'Budi Santoso (Rekan Bisnis)', amount: 3500000, due_date: `${currentYear}-${currentMonth}-25`, status: 'unpaid', notes: 'Talangan invoice proyek' },
      ] as Debt[],
    };
  }

  if (userId === 'user_ibu') {
    return {
      accounts: [
        { id: `acc_mandiri_${userId}`, user_id: userId, name: 'Mandiri Tabungan Dapur', type: 'bank', balance: 14200000, currency: 'IDR', color: '#003366', accountNumber: '142-00-99214-5' },
        { id: `acc_gopay_${userId}`, user_id: userId, name: 'GoPay Ibu', type: 'ewallet', balance: 850000, currency: 'IDR', color: '#00AED6' },
        { id: `acc_ovo_${userId}`, user_id: userId, name: 'OVO Dapur', type: 'ewallet', balance: 620000, currency: 'IDR', color: '#4C2A86' },
        { id: `acc_cash_${userId}`, user_id: userId, name: 'Kas Belanja Pasar', type: 'cash', balance: 1200000, currency: 'IDR', color: '#10B981' },
      ] as Account[],
      categories,
      transactions: [
        { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_salary', amount: 15000000, type: 'income', date: `${currentYear}-${currentMonth}-01T10:00:00`, description: 'Transfer Anggaran Rumah Tangga dari Ayah', source: 'manual' },
        { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_shopping', amount: 1450000, type: 'expense', date: `${currentYear}-${currentMonth}-04T16:00:00`, description: 'Belanja bulanan Superindo', source: 'voice' },
        { id: `tx_3_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_food', amount: 250000, type: 'expense', date: `${currentYear}-${currentMonth}-06T07:30:00`, description: 'Belanja sayur dan daging segar pasar', source: 'voice' },
        { id: `tx_4_${userId}`, user_id: userId, account_id: `acc_gopay_${userId}`, category_id: 'cat_food', amount: 75000, type: 'expense', date: `${currentYear}-${currentMonth}-08T13:00:00`, description: 'Beli makan siang keluarga GoFood', source: 'voice' },
      ] as Transaction[],
      budgets: [
        { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_shopping', amount: 5000000, month: now.getMonth() + 1, year: currentYear },
        { id: `b_2_${userId}`, user_id: userId, category_id: 'cat_food', amount: 4000000, month: now.getMonth() + 1, year: currentYear },
      ] as Budget[],
      goals: [
        { id: `g_1_${userId}`, user_id: userId, name: 'Liburan Keluarga Akhir Tahun', target_amount: 30000000, current_amount: 18500000, deadline: `${currentYear}-12-20`, category: 'Travel', color: '#EC4899' },
      ] as FinancialGoal[],
      debts: [
        { id: `d_1_${userId}`, user_id: userId, type: 'receivable', person: 'Bu RT (Arisan)', amount: 1000000, due_date: `${currentYear}-${currentMonth}-20`, status: 'unpaid' },
      ] as Debt[],
    };
  }

  if (userId === 'user_anak1') {
    return {
      accounts: [
        { id: `acc_jago_${userId}`, user_id: userId, name: 'Bank Jago Kantong Kuliah', type: 'bank', balance: 3450000, currency: 'IDR', color: '#F5A623', accountNumber: '1092-8812-44' },
        { id: `acc_gopay_${userId}`, user_id: userId, name: 'GoPay Elfano', type: 'ewallet', balance: 280000, currency: 'IDR', color: '#00AED6' },
        { id: `acc_cash_${userId}`, user_id: userId, name: 'Dompet Saku Elfano', type: 'cash', balance: 350000, currency: 'IDR', color: '#10B981' },
      ] as Account[],
      categories,
      transactions: [
        { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_jago_${userId}`, category_id: 'cat_allowance', amount: 3000000, type: 'income', date: `${currentYear}-${currentMonth}-01T11:00:00`, description: 'Uang Saku Bulanan dari Ayah', source: 'manual' },
        { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_jago_${userId}`, category_id: 'cat_freelance', amount: 1800000, type: 'income', date: `${currentYear}-${currentMonth}-05T15:00:00`, description: 'Project Desain Logo Klien', source: 'manual' },
        { id: `tx_3_${userId}`, user_id: userId, account_id: `acc_gopay_${userId}`, category_id: 'cat_food', amount: 35000, type: 'expense', date: `${currentYear}-${currentMonth}-06T14:00:00`, description: 'Kopi Tuku saat nugas kuliah', source: 'voice' },
      ] as Transaction[],
      budgets: [
        { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_food', amount: 1500000, month: now.getMonth() + 1, year: currentYear },
        { id: `b_2_${userId}`, user_id: userId, category_id: 'cat_transport', amount: 500000, month: now.getMonth() + 1, year: currentYear },
      ] as Budget[],
      goals: [
        { id: `g_1_${userId}`, user_id: userId, name: 'Upgrade Laptop Coding & Skripsi', target_amount: 18000000, current_amount: 9500000, deadline: `${currentYear}-10-30`, category: 'Asset', color: '#0075FF' },
      ] as FinancialGoal[],
      debts: [] as Debt[],
    };
  }

  if (userId === 'user_anak2') {
    return {
      accounts: [
        { id: `acc_cash_${userId}`, user_id: userId, name: 'Dompet Saku Sheila', type: 'cash', balance: 450000, currency: 'IDR', color: '#10B981' },
        { id: `acc_gopay_${userId}`, user_id: userId, name: 'GoPay Sheila', type: 'ewallet', balance: 180000, currency: 'IDR', color: '#00AED6' },
      ] as Account[],
      categories,
      transactions: [
        { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_allowance', amount: 800000, type: 'income', date: `${currentYear}-${currentMonth}-01T08:00:00`, description: 'Uang Jajan Sekolah Bulanan', source: 'manual' },
        { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_food', amount: 20000, type: 'expense', date: `${currentYear}-${currentMonth}-03T10:00:00`, description: 'Jajan es teh dan roti sekolah', source: 'voice' },
      ] as Transaction[],
      budgets: [
        { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_food', amount: 500000, month: now.getMonth() + 1, year: currentYear },
      ] as Budget[],
      goals: [
        { id: `g_1_${userId}`, user_id: userId, name: 'Tabungan Kursus Bahasa Inggris', target_amount: 3500000, current_amount: 2100000, deadline: `${currentYear}-12-15`, category: 'Education', color: '#EC4899' },
      ] as FinancialGoal[],
      debts: [] as Debt[],
    };
  }

  if (userId === 'user_anak3') {
    return {
      accounts: [
        { id: `acc_cash_${userId}`, user_id: userId, name: 'Dompet Saku Nail', type: 'cash', balance: 320000, currency: 'IDR', color: '#10B981' },
      ] as Account[],
      categories,
      transactions: [
        { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_allowance', amount: 500000, type: 'income', date: `${currentYear}-${currentMonth}-01T08:00:00`, description: 'Uang Saku Sekolah SMP dari Ayah', source: 'manual' },
        { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_cash_${userId}`, category_id: 'cat_food', amount: 15000, type: 'expense', date: `${currentYear}-${currentMonth}-02T10:00:00`, description: 'Makan siang kantin sekolah', source: 'voice' },
      ] as Transaction[],
      budgets: [
        { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_food', amount: 350000, month: now.getMonth() + 1, year: currentYear },
      ] as Budget[],
      goals: [
        { id: `g_1_${userId}`, user_id: userId, name: 'Beli Sepeda Baru', target_amount: 2000000, current_amount: 1100000, deadline: `${currentYear}-12-31`, category: 'Asset', color: '#10B981' },
      ] as FinancialGoal[],
      debts: [] as Debt[],
    };
  }

  // user_family (Consolidated Family Vault)
  return {
    accounts: [
      { id: `acc_mandiri_${userId}`, user_id: userId, name: 'Mandiri Kas Bersama Keluarga', type: 'bank', balance: 75000000, currency: 'IDR', color: '#003366', accountNumber: '142-00-11119-0' },
      { id: `acc_bca_${userId}`, user_id: userId, name: 'BCA Deposito Keluarga', type: 'bank', balance: 120000000, currency: 'IDR', color: '#00529C', accountNumber: '8820-000-999' },
      { id: `acc_bibit_${userId}`, user_id: userId, name: 'Reksadana Masa Depan Anak', type: 'investment', balance: 85000000, currency: 'IDR', color: '#10B981' },
    ] as Account[],
    categories,
    transactions: [
      { id: `tx_1_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_salary', amount: 35000000, type: 'income', date: `${currentYear}-${currentMonth}-01T09:00:00`, description: 'Setoran Kas Gabungan Keluarga Agus & Merys', source: 'manual' },
      { id: `tx_2_${userId}`, user_id: userId, account_id: `acc_mandiri_${userId}`, category_id: 'cat_bills', amount: 4500000, type: 'expense', date: `${currentYear}-${currentMonth}-05T10:00:00`, description: 'Total Tagihan Utilitas & Rumah Tangga', source: 'voice' },
    ] as Transaction[],
    budgets: [
      { id: `b_1_${userId}`, user_id: userId, category_id: 'cat_bills', amount: 6000000, month: now.getMonth() + 1, year: currentYear },
      { id: `b_2_${userId}`, user_id: userId, category_id: 'cat_food', amount: 8000000, month: now.getMonth() + 1, year: currentYear },
    ] as Budget[],
    goals: [
      { id: `g_1_${userId}`, user_id: userId, name: 'Dana Pendidikan Kuliah Elfano, Sheila & Nail', target_amount: 300000000, current_amount: 175000000, deadline: `${currentYear + 2}-07-31`, category: 'Asset', color: '#F5A623' },
      { id: `g_2_${userId}`, user_id: userId, name: 'Tabungan Qurban & Haji Keluarga', target_amount: 60000000, current_amount: 38000000, deadline: `${currentYear + 1}-06-15`, category: 'Safety', color: '#10B981' },
    ] as FinancialGoal[],
    debts: [] as Debt[],
  };
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  language: 'id-ID',
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  autoConfirmBelow: 100000,
  autoPlayVoiceResponse: true,
  soundEffects: true,
};
