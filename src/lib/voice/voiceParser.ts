import { ParsedIntent, IntentName, TransactionType, Account, Category } from '@/types';
import { parseSpokenAmount } from '@/lib/utils/formatters';

export interface ParseContext {
  accounts: Account[];
  categories: Category[];
}

export function parseVoiceCommand(transcript: string, context: ParseContext): ParsedIntent {
  if (!transcript || transcript.trim() === '') {
    return {
      name: 'unknown',
      confidence: 0,
      parameters: {},
      explanation: 'Perintah suara kosong',
    };
  }

  const raw = transcript.trim();
  const lower = raw.toLowerCase();

  // 1. Check for Navigation intents
  if (lower.includes('buka halaman') || lower.includes('pergi ke') || lower.includes('ke menu') || lower.includes('lihat menu')) {
    if (lower.includes('transaksi')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/transactions' }, explanation: 'Membuka halaman Transaksi' };
    }
    if (lower.includes('budget') || lower.includes('anggaran')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/budgets' }, explanation: 'Membuka halaman Budget' };
    }
    if (lower.includes('target') || lower.includes('goal') || lower.includes('tabungan')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/goals' }, explanation: 'Membuka halaman Financial Goals' };
    }
    if (lower.includes('hutang') || lower.includes('piutang')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/debts' }, explanation: 'Membuka halaman Hutang & Piutang' };
    }
    if (lower.includes('laporan') || lower.includes('report')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/reports' }, explanation: 'Membuka halaman Laporan' };
    }
    if (lower.includes('pengaturan') || lower.includes('setting')) {
      return { name: 'navigate_page', confidence: 0.95, parameters: { page: '/settings' }, explanation: 'Membuka halaman Pengaturan' };
    }
  }

  // 2. Check for Balance Query: "Berapa saldo saya sekarang?", "Cek saldo BCA", "Total uang saya", "Jumlah saldo", "Kas saya ada berapa"
  const isBalanceQuery =
    (lower.includes('saldo') || lower.includes('uang') || lower.includes('kekayaan') || lower.includes('isi dompet') || lower.includes('kas') || lower.includes('tabungan') || lower.includes('rekening') || lower.includes('dana')) &&
    (lower.includes('berapa') || lower.includes('cek') || lower.includes('lihat') || lower.includes('sisa') || lower.includes('total') || lower.includes('jumlah') || lower.includes('ada') || lower.includes('punya'));

  if (isBalanceQuery && !lower.includes('catat') && !lower.includes('tambah') && !lower.includes('beli') && !lower.includes('bayar')) {
    // Check if user specified a specific account
    const matchedAcc = matchAccount(lower, context.accounts);
    return {
      name: 'query_balance',
      confidence: 0.95,
      parameters: {
        account: matchedAcc?.id,
      },
      explanation: matchedAcc ? `Mengecek saldo akun ${matchedAcc.name}` : 'Mengecek total seluruh saldo kas',
    };
  }

  // 3. Check for Financial Summary / Condition Query: "Bagaimana kondisi keuangan saya?", "Laporan keuangan bulan ini", "Ringkasan finansial"
  if (
    lower.includes('kondisi keuangan') ||
    lower.includes('kesehatan finansial') ||
    lower.includes('evaluasi keuangan') ||
    lower.includes('ringkasan pengeluaran') ||
    lower.includes('laporan bulan ini') ||
    (lower.includes('bagaimana') && lower.includes('keuangan')) ||
    (lower.includes('pengeluaran saya') && (lower.includes('berapa') || lower.includes('total') || lower.includes('bulan ini')))
  ) {
    const period = lower.includes('bulan lalu') ? 'last_month' : lower.includes('tahun ini') ? 'this_year' : 'this_month';
    return {
      name: 'query_financial_summary',
      confidence: 0.95,
      parameters: {
        period,
      },
      explanation: `Menganalisis kondisi dan ringkasan keuangan periode ${period === 'this_month' ? 'bulan ini' : period === 'last_month' ? 'bulan lalu' : 'tahun ini'}`,
    };
  }

  // 4. Check for Category Spending Query: "Berapa yang saya habiskan untuk makanan?", "Pengeluaran kopi bulan ini"
  if (
    (lower.includes('habiskan') || lower.includes('pengeluaran untuk') || lower.includes('keluar buat') || lower.includes('belanja')) &&
    (lower.includes('berapa') || lower.includes('total'))
  ) {
    const matchedCategory = matchCategory(lower, context.categories);
    if (matchedCategory) {
      return {
        name: 'query_category_spending',
        confidence: 0.9,
        parameters: {
          category: matchedCategory.id,
          period: lower.includes('bulan lalu') ? 'last_month' : 'this_month',
        },
        explanation: `Mengecek total pengeluaran kategori ${matchedCategory.name}`,
      };
    }
  }

  // 5. Check for Budget Query: "Berapa sisa budget makan?", "Cek anggaran bensin"
  if (lower.includes('budget') || lower.includes('anggaran') || lower.includes('limit')) {
    const matchedCategory = matchCategory(lower, context.categories);
    return {
      name: 'query_budget_status',
      confidence: 0.88,
      parameters: {
        category: matchedCategory?.id,
      },
      explanation: matchedCategory ? `Mengecek sisa budget ${matchedCategory.name}` : 'Mengecek status semua budget',
    };
  }

  // 6. Check for Goal Query: "Berapa lama lagi target dana darurat?", "Progres liburan jepang"
  if (lower.includes('target') || lower.includes('goal') || lower.includes('tabungan darurat') || lower.includes('dana darurat') || lower.includes('liburan')) {
    let targetKeyword = 'darurat';
    if (lower.includes('liburan')) targetKeyword = 'liburan';
    if (lower.includes('rumah')) targetKeyword = 'rumah';
    return {
      name: 'query_goal_status',
      confidence: 0.85,
      parameters: {
        target_name: targetKeyword,
      },
      explanation: `Mengecek progres target tabungan ${targetKeyword}`,
    };
  }

  // 7. Check for Transaction Creation Intent
  // Trigger keywords: "catat", "tambah", "masukkan", "pengeluaran", "pemasukan", "beli", "bayar", "transfer", "kirim", "dapat", "gaji", "makan"
  const isTransactionCreation =
    lower.includes('catat') ||
    lower.includes('tambah') ||
    lower.includes('masukkan') ||
    lower.includes('input') ||
    lower.includes('beli') ||
    lower.includes('bayar') ||
    lower.includes('pengeluaran') ||
    lower.includes('pemasukan') ||
    lower.includes('transfer') ||
    lower.includes('kirim') ||
    lower.includes('habis') ||
    lower.includes('dapat uang') ||
    lower.includes('gajian');

  if (isTransactionCreation || parseSpokenAmount(lower) !== null) {
    const parsedTx = parseTransactionDetails(lower, raw, context);
    if (parsedTx.amount && parsedTx.amount > 0) {
      return {
        name: 'create_transaction',
        confidence: 0.9,
        parameters: parsedTx,
        explanation: `Mencatat ${parsedTx.type === 'income' ? 'pemasukan' : parsedTx.type === 'transfer' ? 'transfer' : 'pengeluaran'} sebesar Rp ${parsedTx.amount?.toLocaleString('id-ID')}`,
      };
    }
  }

  // Fallback / Unknown
  return {
    name: 'unknown',
    confidence: 0.3,
    parameters: {
      rawText: raw,
    },
    explanation: 'Perintah tidak dikenali. Silakan coba: "Catat pengeluaran makan 50rb dari cash" atau "Bagaimana kondisi keuangan saya bulan ini?"',
  };
}

function parseTransactionDetails(lower: string, originalText: string, context: ParseContext): {
  type: TransactionType;
  amount?: number;
  category?: string;
  account?: string;
  to_account?: string;
  description?: string;
} {
  // Determine Type
  let type: TransactionType = 'expense';
  if (lower.includes('transfer') || lower.includes('pindah dana') || lower.includes('kirim ke rekening')) {
    type = 'transfer';
  } else if (
    lower.includes('pemasukan') ||
    lower.includes('gaji') ||
    lower.includes('gajian') ||
    lower.includes('dapat uang') ||
    lower.includes('freelance') ||
    lower.includes('bonus') ||
    lower.includes('dividen') ||
    lower.includes('terima uang') ||
    lower.includes('income')
  ) {
    type = 'income';
  }

  // Extract Amount
  // Remove command prefixes for cleaner amount parsing
  let amountStr = lower;
  const prefixes = [
    'catat pengeluaran', 'catat pemasukan', 'catat transfer', 'catat', 'tambah pemasukan',
    'tambah pengeluaran', 'tambah', 'masukkan', 'input', 'bayar', 'beli', 'habis'
  ];
  for (const p of prefixes) {
    if (amountStr.startsWith(p)) {
      amountStr = amountStr.replace(p, '').trim();
      break;
    }
  }

  const amount = parseSpokenAmount(amountStr) || parseSpokenAmount(lower) || undefined;

  // Match Account
  let matchedAccount = matchAccount(lower, context.accounts);
  if (!matchedAccount) {
    // Default account based on context
    if (lower.includes('tunai') || lower.includes('cash') || lower.includes('dompet')) {
      matchedAccount = context.accounts.find(a => a.id === 'acc_cash' || a.type === 'cash');
    } else if (lower.includes('bca')) {
      matchedAccount = context.accounts.find(a => a.id === 'acc_bca' || a.name.toLowerCase().includes('bca'));
    } else if (lower.includes('mandiri')) {
      matchedAccount = context.accounts.find(a => a.id === 'acc_mandiri' || a.name.toLowerCase().includes('mandiri'));
    } else if (lower.includes('gopay')) {
      matchedAccount = context.accounts.find(a => a.id === 'acc_gopay' || a.name.toLowerCase().includes('gopay'));
    } else if (lower.includes('ovo')) {
      matchedAccount = context.accounts.find(a => a.id === 'acc_ovo' || a.name.toLowerCase().includes('ovo'));
    } else {
      // Default to Cash or first Bank account
      matchedAccount = context.accounts.find(a => a.type === 'bank') || context.accounts[0];
    }
  }

  // Match To Account (for transfer)
  let toAccount: Account | undefined;
  if (type === 'transfer') {
    const toMatch = lower.match(/(?:ke|menuju)\s+([a-z0-9\s]+)/);
    if (toMatch) {
      toAccount = matchAccount(toMatch[1], context.accounts);
    }
    if (!toAccount) {
      toAccount = context.accounts.find(a => a.id !== matchedAccount?.id);
    }
  }

  // Match Category
  let matchedCategory = matchCategory(lower, context.categories, type);
  if (!matchedCategory) {
    if (type === 'income') {
      matchedCategory = context.categories.find(c => c.id === 'cat_salary' || c.type === 'income');
    } else {
      matchedCategory = context.categories.find(c => c.id === 'cat_food' || c.type === 'expense');
    }
  }

  // Generate clean description
  let description = originalText;
  // Clean common trigger keywords
  const descClean = lower
    .replace(/^catat\s+(?:pengeluaran|pemasukan|transfer)?\s*/i, '')
    .replace(/^tambah\s+(?:pengeluaran|pemasukan)?\s*/i, '')
    .replace(/^masukkan\s*/i, '')
    .replace(/dari\s+(?:cash|bca|mandiri|gopay|ovo|rekening|dompet)/gi, '')
    .replace(/ke\s+(?:bca|mandiri|gopay|ovo|rekening)/gi, '')
    .replace(/pakai\s+(?:cash|bca|mandiri|gopay|ovo)/gi, '')
    .replace(/lewat\s+(?:cash|bca|mandiri|gopay|ovo)/gi, '')
    .trim();

  if (descClean.length > 2) {
    description = descClean.charAt(0).toUpperCase() + descClean.slice(1);
  } else if (matchedCategory) {
    description = matchedCategory.name;
  }

  return {
    type,
    amount,
    category: matchedCategory?.id,
    account: matchedAccount?.id,
    to_account: toAccount?.id,
    description,
  };
}

function matchAccount(text: string, accounts: Account[]): Account | undefined {
  for (const acc of accounts) {
    const nameLower = acc.name.toLowerCase();
    if (text.includes(nameLower)) return acc;
    if (acc.id.includes('bca') && text.includes('bca')) return acc;
    if (acc.id.includes('mandiri') && text.includes('mandiri')) return acc;
    if (acc.id.includes('gopay') && text.includes('gopay')) return acc;
    if (acc.id.includes('ovo') && text.includes('ovo')) return acc;
    if (acc.id.includes('cash') && (text.includes('cash') || text.includes('tunai') || text.includes('dompet'))) return acc;
    if (acc.id.includes('bibit') && (text.includes('bibit') || text.includes('reksadana') || text.includes('investasi') || text.includes('saham'))) return acc;
  }
  return undefined;
}

function matchCategory(text: string, categories: Category[], filterType?: TransactionType): Category | undefined {
  const filtered = filterType ? categories.filter(c => c.type === (filterType === 'income' ? 'income' : 'expense')) : categories;

  // Food keywords
  if (/makan|minum|kopi|coffee|resto|warteg|padang|sarapan|lunch|dinner|snack|bakso|gofood|grabfood|mcd|kfc/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_food' || c.name.toLowerCase().includes('makan'));
    if (cat) return cat;
  }

  // Transport keywords
  if (/transport|bensin|pertamax|pertalite|bbm|tol|parkir|grab|gojek|goride|gocar|kereta|krl|mrt|bus|ojek/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_transport' || c.name.toLowerCase().includes('transport'));
    if (cat) return cat;
  }

  // Shopping keywords
  if (/belanja|superindo|indomaret|alfamart|shopee|tokopedia|baju|sepatu|groceries|pasar|mall/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_shopping' || c.name.toLowerCase().includes('belanja'));
    if (cat) return cat;
  }

  // Bills & Utilities
  if (/listrik|pln|pdam|air|wifi|indihome|pulsa|paket data|iuran|tagihan|bpjs/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_bills' || c.name.toLowerCase().includes('tagihan'));
    if (cat) return cat;
  }

  // Entertainment
  if (/hiburan|nonton|bioskop|xxi|game|steam|netflix|spotify|youtube|liburan|karaoke|staycation/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_entertainment' || c.name.toLowerCase().includes('hiburan'));
    if (cat) return cat;
  }

  // Health
  if (/kesehatan|obat|apotek|dokter|rumah sakit|klinik|vitamin|dental|gigi/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_health' || c.name.toLowerCase().includes('kesehatan'));
    if (cat) return cat;
  }

  // Income: Salary
  if (/gaji|payroll|salary|upah/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_salary' || c.name.toLowerCase().includes('gaji'));
    if (cat) return cat;
  }

  // Income: Freelance
  if (/freelance|proyek|project|klien|side job|komisi|honor/i.test(text)) {
    const cat = filtered.find(c => c.id === 'cat_freelance' || c.name.toLowerCase().includes('freelance'));
    if (cat) return cat;
  }

  // Check direct name matches
  for (const cat of filtered) {
    if (text.includes(cat.name.toLowerCase())) {
      return cat;
    }
  }

  return undefined;
}
