'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Account, 
  Category, 
  Transaction, 
  Budget, 
  FinancialGoal, 
  Debt, 
  VoiceLog, 
  VoiceSettings, 
  UserProfile, 
  AIInsight,
  TransactionType,
  TransactionSource
} from '@/types';
import { 
  DEFAULT_FAMILY_PROFILES,
  getInitialUserData,
  DEFAULT_VOICE_SETTINGS 
} from './defaultData';

interface FinancialContextType {
  // Theme (Day / Night Mode)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Multi-User & Family System
  activeUserId: string;
  familyProfiles: UserProfile[];
  activeProfile: UserProfile;
  switchUser: (userId: string) => void;
  addFamilyMember: (member: Omit<UserProfile, 'id' | 'hasCompletedOnboarding'>) => void;
  updateFamilyMember: (userId: string, data: Partial<UserProfile>) => void;
  deleteFamilyMember: (userId: string) => void;
  familyCombinedNetWorth: number;

  // Active User Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  debts: Debt[];
  voiceLogs: VoiceLog[];
  voiceSettings: VoiceSettings;
  aiInsights: AIInsight[];
  isLoaded: boolean;

  // Actions - Transactions (Supports Free Text Account Name)
  addTransaction: (tx: {
    amount: number;
    type: TransactionType;
    category_id?: string;
    account_id?: string;
    account_name?: string;
    to_account_id?: string;
    to_account_name?: string;
    description?: string;
    date?: string;
    source?: TransactionSource;
  }) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Accounts
  addAccount: (acc: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Actions - Categories
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Actions - Budgets
  setBudget: (category_id: string, amount: number, month?: number, year?: number) => void;
  deleteBudget: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'created_at'>) => FinancialGoal;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, fromAccountId: string) => void;

  // Actions - Debts
  addDebt: (debt: Omit<Debt, 'id' | 'created_at'>) => Debt;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  settleDebt: (id: string) => void;

  // Actions - Voice & Settings
  addVoiceLog: (log: Omit<VoiceLog, 'id' | 'created_at'>) => void;
  clearVoiceLogs: () => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Reset Features
  resetToZero: () => void; // Resets active user balance to 0 and clears transactions
  resetToZeroAllFamily: () => void; // Resets all family members balances to 0 and clears all transactions
  resetAllData: () => void; // Restores demo simulation data

  // Computed Summaries for Active User
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthSavingsRate: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
  expenseGrowthPercent: number;
  categorySpending: { category: Category; amount: number; percentage: number; budget?: Budget }[];
  emergencyFundStatus: { current: number; target: number; monthsCovered: number; targetMonths: number };
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEY_FAMILY = 'smart_money_family_profiles_v3';
const STORAGE_KEY_THEME = 'smart_money_theme_v1';
const getUserStorageKey = (userId: string) => `smart_money_user_${userId}_v3`;

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light'); // default to clean light mode
  const [familyProfiles, setFamilyProfiles] = useState<UserProfile[]>(DEFAULT_FAMILY_PROFILES);
  const [activeUserId, setActiveUserId] = useState<string>('user_ayah');

  // Pre-initialize with Ayah default data for instant non-blocking render
  const defaultInitial = useMemo(() => getInitialUserData('user_ayah'), []);

  // Active User Specific State
  const [accounts, setAccounts] = useState<Account[]>(defaultInitial.accounts);
  const [categories, setCategories] = useState<Category[]>(defaultInitial.categories);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultInitial.transactions);
  const [budgets, setBudgets] = useState<Budget[]>(defaultInitial.budgets);
  const [goals, setGoals] = useState<FinancialGoal[]>(defaultInitial.goals);
  const [debts, setDebts] = useState<Debt[]>(defaultInitial.debts);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  // Load Theme & Family Profiles from Storage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light' | null;
      const currentTheme = savedTheme || 'light';
      setTheme(currentTheme);
      if (currentTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }

      const savedProfiles = localStorage.getItem(STORAGE_KEY_FAMILY);
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = DEFAULT_FAMILY_PROFILES.map(def => {
            const found = parsed.find((p: UserProfile) => p.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          setFamilyProfiles(updated);
        }
      }

      const savedActiveId = localStorage.getItem('smart_money_active_user_id');
      if (savedActiveId) {
        setActiveUserId(savedActiveId);
      }
    } catch (e) {
      console.error('Error loading initial data', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  // Save Family Profiles on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAMILY, JSON.stringify(familyProfiles));
      localStorage.setItem('smart_money_active_user_id', activeUserId);
    } catch (e) {
      console.error('Error saving family profiles', e);
    }
  }, [familyProfiles, activeUserId]);

  // Load User Data whenever activeUserId changes
  useEffect(() => {
    try {
      const userKey = getUserStorageKey(activeUserId);
      const savedUserData = localStorage.getItem(userKey);

      if (savedUserData) {
        const parsed = JSON.parse(savedUserData);
        setAccounts(parsed.accounts || []);
        setCategories(parsed.categories || []);
        setTransactions(parsed.transactions || []);
        setBudgets(parsed.budgets || []);
        setGoals(parsed.goals || []);
        setDebts(parsed.debts || []);
        setVoiceLogs(parsed.voiceLogs || []);
        setVoiceSettings(parsed.voiceSettings || DEFAULT_VOICE_SETTINGS);
      } else {
        const initial = getInitialUserData(activeUserId);
        setAccounts(initial.accounts);
        setCategories(initial.categories);
        setTransactions(initial.transactions);
        setBudgets(initial.budgets);
        setGoals(initial.goals);
        setDebts(initial.debts);
        setVoiceLogs([]);
        setVoiceSettings(DEFAULT_VOICE_SETTINGS);
      }
    } catch (e) {
      console.error('Error loading user data', e);
    }
  }, [activeUserId]);

  // Save active user data on changes
  useEffect(() => {
    try {
      const userKey = getUserStorageKey(activeUserId);
      const stateToSave = {
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        debts,
        voiceLogs,
        voiceSettings,
      };
      localStorage.setItem(userKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving user data', e);
    }
  }, [accounts, categories, transactions, budgets, goals, debts, voiceLogs, voiceSettings, activeUserId]);

  // Multi-User Switcher & Management
  const switchUser = (userId: string) => {
    if (userId === activeUserId) return;
    setActiveUserId(userId);
  };

  const addFamilyMember = (memberData: Omit<UserProfile, 'id' | 'hasCompletedOnboarding'>) => {
    const newId = 'user_' + Date.now();
    const newProfile: UserProfile = {
      ...memberData,
      id: newId,
      hasCompletedOnboarding: true,
    };
    setFamilyProfiles(prev => [...prev, newProfile]);
    const initial = getInitialUserData(newId);
    localStorage.setItem(getUserStorageKey(newId), JSON.stringify({
      accounts: initial.accounts,
      categories: initial.categories,
      transactions: [],
      budgets: [],
      goals: [],
      debts: [],
      voiceLogs: [],
      voiceSettings: DEFAULT_VOICE_SETTINGS,
    }));
    switchUser(newId);
  };

  const updateFamilyMember = (userId: string, updated: Partial<UserProfile>) => {
    setFamilyProfiles(prev => prev.map(p => p.id === userId ? { ...p, ...updated } : p));
  };

  const deleteFamilyMember = (userId: string) => {
    if (familyProfiles.length <= 1) return;
    setFamilyProfiles(prev => prev.filter(p => p.id !== userId));
    localStorage.removeItem(getUserStorageKey(userId));
    if (activeUserId === userId) {
      const remaining = familyProfiles.filter(p => p.id !== userId);
      switchUser(remaining[0].id);
    }
  };

  const activeProfile = useMemo(() => {
    return familyProfiles.find(p => p.id === activeUserId) || familyProfiles[0] || DEFAULT_FAMILY_PROFILES[0];
  }, [familyProfiles, activeUserId]);

  // Actions: Transactions
  const addTransaction = (txData: {
    amount: number;
    type: TransactionType;
    category_id?: string;
    account_id?: string;
    account_name?: string;
    to_account_id?: string;
    to_account_name?: string;
    description?: string;
    date?: string;
    source?: TransactionSource;
  }): Transaction => {
    let finalAccountId = txData.account_id || '';
    let finalAccountName = txData.account_name || '';

    if (!finalAccountId && finalAccountName) {
      const existingAcc = accounts.find(
        a => a.name.toLowerCase().trim() === finalAccountName.toLowerCase().trim()
      );
      if (existingAcc) {
        finalAccountId = existingAcc.id;
      } else {
        const createdAcc: Account = {
          id: 'acc_' + Date.now(),
          user_id: activeUserId,
          name: finalAccountName.trim(),
          type: finalAccountName.toLowerCase().includes('cash') || finalAccountName.toLowerCase().includes('tunai')
            ? 'cash'
            : finalAccountName.toLowerCase().includes('gopay') || finalAccountName.toLowerCase().includes('ovo') || finalAccountName.toLowerCase().includes('dana')
            ? 'ewallet'
            : 'bank',
          balance: 0,
          currency: 'IDR',
          color: '#003366',
        };
        setAccounts(prev => [...prev, createdAcc]);
        finalAccountId = createdAcc.id;
      }
    } else if (finalAccountId && !finalAccountName) {
      const existing = accounts.find(a => a.id === finalAccountId);
      finalAccountName = existing?.name || 'Rekening';
    }

    if (!finalAccountId) {
      finalAccountId = accounts[0]?.id || 'acc_default';
      finalAccountName = accounts[0]?.name || 'Rekening Utama';
    }

    let finalToAccountId = txData.to_account_id;
    if (txData.type === 'transfer') {
      if (!finalToAccountId && txData.to_account_name) {
        const existingTo = accounts.find(
          a => a.name.toLowerCase().trim() === txData.to_account_name?.toLowerCase().trim()
        );
        if (existingTo) {
          finalToAccountId = existingTo.id;
        } else {
          const createdToAcc: Account = {
            id: 'acc_to_' + Date.now(),
            user_id: activeUserId,
            name: txData.to_account_name.trim(),
            type: 'bank',
            balance: 0,
            currency: 'IDR',
            color: '#0075FF',
          };
          setAccounts(prev => [...prev, createdToAcc]);
          finalToAccountId = createdToAcc.id;
        }
      }
    }

    const defaultCat = categories.find(c => c.type === (txData.type === 'income' ? 'income' : 'expense')) || categories[0];
    const finalCategoryId = txData.category_id || defaultCat?.id || 'cat_general';

    const newTx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: activeUserId,
      amount: txData.amount,
      type: txData.type,
      category_id: finalCategoryId,
      account_id: finalAccountId,
      account_name: finalAccountName,
      to_account_id: finalToAccountId,
      to_account_name: txData.to_account_name,
      description: txData.description || 'Transaksi',
      date: txData.date || new Date().toISOString(),
      source: txData.source || 'manual',
      created_at: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (newTx.type === 'expense' && acc.id === newTx.account_id) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.account_id) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.account_id) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.to_account_id) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      });
    });

    return newTx;
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } : tx));
  };

  const deleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (txToDelete.type === 'expense' && acc.id === txToDelete.account_id) {
          return { ...acc, balance: acc.balance + txToDelete.amount };
        }
        if (txToDelete.type === 'income' && acc.id === txToDelete.account_id) {
          return { ...acc, balance: acc.balance - txToDelete.amount };
        }
        if (txToDelete.type === 'transfer') {
          if (acc.id === txToDelete.account_id) {
            return { ...acc, balance: acc.balance + txToDelete.amount };
          }
          if (acc.id === txToDelete.to_account_id) {
            return { ...acc, balance: acc.balance - txToDelete.amount };
          }
        }
        return acc;
      });
    });

    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Actions: Accounts
  const addAccount = (acc: Omit<Account, 'id'>): Account => {
    const newAcc: Account = {
      ...acc,
      user_id: activeUserId,
      id: 'acc_' + Date.now(),
    };
    setAccounts(prev => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Actions: Categories
  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...cat,
      user_id: activeUserId,
      id: 'cat_' + Date.now(),
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Actions: Budgets
  const setBudget = (category_id: string, amount: number, month?: number, year?: number) => {
    const curDate = new Date();
    const targetMonth = month || curDate.getMonth() + 1;
    const targetYear = year || curDate.getFullYear();

    setBudgets(prev => {
      const existingIdx = prev.findIndex(
        b => b.category_id === category_id && b.month === targetMonth && b.year === targetYear
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], amount };
        return updated;
      }
      return [...prev, {
        id: 'b_' + Date.now(),
        user_id: activeUserId,
        category_id,
        amount,
        month: targetMonth,
        year: targetYear,
      }];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Actions: Goals
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'created_at'>): FinancialGoal => {
    const newGoal: FinancialGoal = {
      ...goal,
      user_id: activeUserId,
      id: 'g_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, updated: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const account = accounts.find(a => a.id === fromAccountId);
    if (!goal || !account) return;

    updateGoal(goalId, { current_amount: goal.current_amount + amount });

    addTransaction({
      account_id: fromAccountId,
      category_id: 'cat_investment',
      amount: amount,
      type: 'expense',
      date: new Date().toISOString(),
      description: `Setoran Tabungan: ${goal.name}`,
      source: 'manual',
    });
  };

  // Actions: Debts
  const addDebt = (debt: Omit<Debt, 'id' | 'created_at'>): Debt => {
    const newDebt: Debt = {
      ...debt,
      user_id: activeUserId,
      id: 'd_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setDebts(prev => [...prev, newDebt]);
    return newDebt;
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const settleDebt = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'paid', paid_amount: d.amount };
      }
      return d;
    }));
  };

  // Actions: Voice & Settings
  const addVoiceLog = (log: Omit<VoiceLog, 'id' | 'created_at'>) => {
    const newLog: VoiceLog = {
      ...log,
      user_id: activeUserId,
      id: 'vlog_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setVoiceLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const clearVoiceLogs = () => {
    setVoiceLogs([]);
  };

  const updateVoiceSettings = (updated: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...updated }));
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    updateFamilyMember(activeUserId, updated);
  };

  // RESET TO ZERO (Mulai dari Nol: Saldo Rp 0, Kosongkan Transaksi & Mutasi)
  const resetToZero = () => {
    setAccounts(prev => prev.map(acc => ({ ...acc, balance: 0 })));
    setTransactions([]);
    setVoiceLogs([]);
    setDebts([]);
    setGoals(prev => prev.map(g => ({ ...g, current_amount: 0 })));
  };

  // RESET TO ZERO FOR ALL FAMILY PROFILES
  const resetToZeroAllFamily = () => {
    familyProfiles.forEach(p => {
      const userKey = getUserStorageKey(p.id);
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const zeroedAccounts = (parsed.accounts || []).map((a: Account) => ({ ...a, balance: 0 }));
        const zeroedGoals = (parsed.goals || []).map((g: FinancialGoal) => ({ ...g, current_amount: 0 }));
        localStorage.setItem(userKey, JSON.stringify({
          ...parsed,
          accounts: zeroedAccounts,
          transactions: [],
          voiceLogs: [],
          debts: [],
          goals: zeroedGoals,
        }));
      }
    });
    resetToZero();
  };

  // RESTORE DEMO DATA
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_FAMILY);
    familyProfiles.forEach(p => localStorage.removeItem(getUserStorageKey(p.id)));
    setFamilyProfiles(DEFAULT_FAMILY_PROFILES);
    setActiveUserId('user_ayah');
    const initial = getInitialUserData('user_ayah');
    setAccounts(initial.accounts);
    setCategories(initial.categories);
    setTransactions(initial.transactions);
    setBudgets(initial.budgets);
    setGoals(initial.goals);
    setDebts(initial.debts);
    setVoiceLogs([]);
    setVoiceSettings(DEFAULT_VOICE_SETTINGS);
  };

  // Combined Family Net Worth calculation
  const familyCombinedNetWorth = useMemo(() => {
    let total = 0;
    try {
      familyProfiles.forEach(p => {
        const saved = localStorage.getItem(getUserStorageKey(p.id));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.accounts && Array.isArray(parsed.accounts)) {
            total += parsed.accounts.reduce((s: number, a: Account) => s + (a.balance || 0), 0);
          }
        } else {
          const init = getInitialUserData(p.id);
          total += init.accounts.reduce((s: number, a: Account) => s + (a.balance || 0), 0);
        }
      });
    } catch {
      total = accounts.reduce((s, a) => s + a.balance, 0);
    }
    return total;
  }, [familyProfiles, accounts]);

  // Computations for Active User
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYearNum = now.getFullYear();
  const prevMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
  const prevYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
    });
  }, [transactions, currentMonthNum, currentYearNum]);

  const lastMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonthNum && d.getFullYear() === prevYearNum;
    });
  }, [transactions, prevMonthNum, prevYearNum]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const currentMonthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const lastMonthIncome = useMemo(() => {
    return lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [lastMonthTransactions]);

  const lastMonthExpense = useMemo(() => {
    return lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [lastMonthTransactions]);

  const currentMonthSavingsRate = useMemo(() => {
    if (currentMonthIncome <= 0) return 0;
    const savings = currentMonthIncome - currentMonthExpense;
    return Math.max(0, Math.round((savings / currentMonthIncome) * 100));
  }, [currentMonthIncome, currentMonthExpense]);

  const expenseGrowthPercent = useMemo(() => {
    if (lastMonthExpense <= 0) return 0;
    const diff = currentMonthExpense - lastMonthExpense;
    return Math.round((diff / lastMonthExpense) * 100);
  }, [currentMonthExpense, lastMonthExpense]);

  const categorySpending = useMemo(() => {
    const expenseCats = categories.filter(c => c.type === 'expense');
    const spendingMap: Record<string, number> = {};

    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingMap[t.category_id] = (spendingMap[t.category_id] || 0) + t.amount;
      });

    return expenseCats
      .map(cat => {
        const amount = spendingMap[cat.id] || 0;
        const percentage = currentMonthExpense > 0 ? Math.round((amount / currentMonthExpense) * 100) : 0;
        const budget = budgets.find(b => b.category_id === cat.id && b.month === (currentMonthNum + 1) && b.year === currentYearNum);
        return {
          category: cat,
          amount,
          percentage,
          budget,
        };
      })
      .filter(item => item.amount > 0 || item.budget)
      .sort((a, b) => b.amount - a.amount);
  }, [categories, currentMonthTransactions, currentMonthExpense, budgets, currentMonthNum, currentYearNum]);

  const emergencyFundStatus = useMemo(() => {
    const avgMonthlyExpense = currentMonthExpense > 0 ? currentMonthExpense : 4500000;
    const targetMonths = activeProfile.emergencyFundGoalMonths || 6;
    const target = avgMonthlyExpense * targetMonths;
    const emergencyGoal = goals.find(g => g.category.toLowerCase().includes('safety') || g.name.toLowerCase().includes('darurat'));
    const current = emergencyGoal ? emergencyGoal.current_amount : (accounts.find(a => a.id.includes('bibit'))?.balance || 0);
    const monthsCovered = avgMonthlyExpense > 0 ? Number((current / avgMonthlyExpense).toFixed(1)) : 0;

    return {
      current,
      target,
      monthsCovered,
      targetMonths,
    };
  }, [currentMonthExpense, activeProfile.emergencyFundGoalMonths, goals, accounts]);

  const aiInsights = useMemo<AIInsight[]>(() => {
    const insights: AIInsight[] = [];

    if (currentMonthSavingsRate >= 30) {
      insights.push({
        id: 'ins_saving_good',
        type: 'praise',
        title: 'Tingkat Tabungan Sangat Bagus! 🌟',
        message: `Hebat ${activeProfile.name}! Bulan ini berhasil menyisihkan ${currentMonthSavingsRate}% dari pemasukan untuk masa depan.`,
        metricChange: `+${currentMonthSavingsRate}% savings rate`,
      });
    } else if (currentMonthSavingsRate < 10 && currentMonthIncome > 0) {
      insights.push({
        id: 'ins_saving_low',
        type: 'warning',
        title: 'Tingkat Tabungan di Bawah Target ⚠️',
        message: `Tingkat tabungan baru ${currentMonthSavingsRate}%. Coba evaluasi pos belanja sekunder agar tetap aman.`,
      });
    }

    if (categorySpending.length > 0) {
      const topCat = categorySpending[0];
      if (topCat.percentage >= 40) {
        insights.push({
          id: 'ins_top_cat',
          type: 'warning',
          title: `Pengeluaran ${topCat.category.name} Dominan (${topCat.percentage}%)`,
          message: `Pos ${topCat.category.name} menyerap ${topCat.percentage}% dari total pengeluaran bulan ini.`,
          category: topCat.category.name,
        });
      }
    }

    if (emergencyFundStatus.monthsCovered < emergencyFundStatus.targetMonths) {
      const remainingAmount = emergencyFundStatus.target - emergencyFundStatus.current;
      const monthlySavingsPotential = Math.max(currentMonthIncome - currentMonthExpense, 1500000);
      const monthsToTarget = Math.ceil(remainingAmount / monthlySavingsPotential);

      insights.push({
        id: 'ins_emergency',
        type: 'tip',
        title: 'Proyeksi Dana Darurat 🛡️',
        message: `Dana darurat saat ini mengcover ~${emergencyFundStatus.monthsCovered} bulan. Target tercapai dalam ~${monthsToTarget} bulan.`,
        actionLabel: 'Setor Tabungan',
        actionUrl: '/goals',
      });
    }

    return insights;
  }, [currentMonthSavingsRate, currentMonthIncome, currentMonthExpense, categorySpending, emergencyFundStatus, activeProfile.name]);

  return (
    <FinancialContext.Provider
      value={{
        theme,
        toggleTheme,
        activeUserId,
        familyProfiles,
        activeProfile,
        switchUser,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        familyCombinedNetWorth,
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        debts,
        voiceLogs,
        voiceSettings,
        aiInsights,
        isLoaded,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        setBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        addDebt,
        updateDebt,
        deleteDebt,
        settleDebt,
        addVoiceLog,
        clearVoiceLogs,
        updateVoiceSettings,
        updateProfile,
        resetToZero,
        resetToZeroAllFamily,
        resetAllData,
        totalBalance,
        currentMonthIncome,
        currentMonthExpense,
        currentMonthSavingsRate,
        lastMonthIncome,
        lastMonthExpense,
        expenseGrowthPercent,
        categorySpending,
        emergencyFundStatus,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
