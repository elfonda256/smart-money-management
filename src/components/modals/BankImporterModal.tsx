'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, CheckSquare, Square, Upload, Sparkles, ArrowRight } from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';

interface BankImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  selected: boolean;
}

// Category keyword rules for Indonesian bank statements
const AUTO_CATEGORY_RULES: { keywords: string[]; categoryName: string; type?: 'income' | 'expense' }[] = [
  { keywords: ['gofood', 'grabfood', 'shopeefood', 'kopi', 'starbucks', 'kenangan', 'janji jiwa', 'mcdonald', 'kfc', 'hokben', 'resto', 'warung', 'cafe', 'bakmi', 'sate', 'nasi', 'kuliner', 'superindo', 'indomaret', 'alfamart', 'alfamidi'], categoryName: 'Makanan & Minuman' },
  { keywords: ['tokopedia', 'shopee', 'lazada', 'blibli', 'tiktok shop', 'ikea', 'ace hardware', 'uniqlo', 'zara', 'h&m', 'mall', 'gramedia'], categoryName: 'Belanja' },
  { keywords: ['gojek', 'goride', 'gocar', 'grab', 'grabride', 'grabcar', 'maxim', 'krl', 'mrt', 'lrt', 'transjakarta', 'pertamina', 'shell', 'bp', 'bensin', 'spbu', 'tol', 'parkir', 'kai', 'kereta', 'tiket'], categoryName: 'Transportasi' },
  { keywords: ['pln', 'listrik', 'pdam', 'air', 'indihome', 'myrepublic', 'biznet', 'firstmedia', 'telkomsel', 'xl', 'indosat', 'tri', 'smartfren', 'bpjs', 'pbb', 'ipl', 'iuran'], categoryName: 'Tagihan & Utilitas' },
  { keywords: ['netflix', 'spotify', 'youtube', 'disney', 'prime', 'steam', 'playstation', 'bioskop', 'cgv', 'cinema xxi', 'xxi', 'game', 'topup'], categoryName: 'Hiburan' },
  { keywords: ['gaji', 'salary', 'payroll', 'honor', 'bonus', 'dividen', 'bunga bank', 'cashback', 'reward'], categoryName: 'Gaji', type: 'income' },
  { keywords: ['apotek', 'kimia farma', 'k24', 'halodoc', 'alodokter', 'rs', 'rumah sakit', 'klinik', 'dokter', 'lab', 'prodia'], categoryName: 'Kesehatan' },
  { keywords: ['bibit', 'bareksa', 'stockbit', 'ajaib', 'pluang', 'indodax', 'toko crypto', 'reksadana', 'saham'], categoryName: 'Investasi' }
];

export const BankImporterModal: React.FC<BankImporterModalProps> = ({ isOpen, onClose }) => {
  const { accounts, categories, addTransaction, theme } = useFinancial();
  const isLight = theme === 'light';

  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [parsedItems, setParsedItems] = useState<ParsedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle CSV file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  // Parse CSV Lines
  const parseCsv = (content: string) => {
    setIsProcessing(true);
    setSuccessCount(null);

    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    const delimiter = lines[0].includes(';') ? ';' : (lines[0].includes('\t') ? '\t' : ',');
    const results: ParsedTransaction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.toLowerCase().includes('saldo awal') || line.toLowerCase().includes('rekening koran')) {
        continue;
      }

      const cols = parseCsvLine(line, delimiter);
      if (cols.length < 3) continue;

      const tx = extractTx(cols, i);
      if (tx && tx.amount > 0) {
        results.push(tx);
      }
    }

    setParsedItems(results);
    setIsProcessing(false);
  };

  const parseCsvLine = (text: string, delimiter: string) => {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === delimiter && !inQuotes) {
        res.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += c;
      }
    }
    res.push(cur.trim().replace(/^"|"$/g, ''));
    return res;
  };

  const extractTx = (cols: string[], idx: number): ParsedTransaction | null => {
    let date = new Date().toISOString().split('T')[0];
    let desc = 'Transaksi Bank';
    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    // Date heuristic
    for (const c of cols) {
      const match = c.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/) || c.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (match) {
        if (match[1].length === 4) {
          date = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
        } else {
          const year = match[3].length === 2 ? '20' + match[3] : match[3];
          date = `${year}-${String(match[2]).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`;
        }
        break;
      }
    }

    // Description
    const textCols = cols.filter(c => /[a-zA-Z]/.test(c) && !/^\d+[\/\-]\d+[\/\-]\d+/.test(c));
    if (textCols.length > 0) {
      desc = textCols.reduce((a, b) => a.length > b.length ? a : b);
    }

    // Amount & Type
    for (const col of cols) {
      const c = col.toUpperCase().replace(/\s/g, '');
      if (c === 'CR' || c === 'K' || c === 'KREDIT') type = 'income';
      if (c === 'DB' || c === 'D' || c === 'DEBET' || c === 'DEBIT') type = 'expense';

      const cleanNum = col.replace(/Rp|\s/gi, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
      const num = parseFloat(cleanNum);
      if (!isNaN(num) && Math.abs(num) > amount) {
        amount = Math.abs(num);
        if (cleanNum.startsWith('+')) type = 'income';
        if (cleanNum.startsWith('-')) type = 'expense';
      }
    }

    // Auto-categorize
    const descLower = desc.toLowerCase();
    let matchedCatId = categories.find(c => c.type === type)?.id;

    for (const rule of AUTO_CATEGORY_RULES) {
      if (rule.keywords.some(k => descLower.includes(k))) {
        const foundCat = categories.find(c => c.name.toLowerCase().includes(rule.categoryName.toLowerCase()));
        if (foundCat) {
          matchedCatId = foundCat.id;
          if (rule.type) type = rule.type;
        }
        break;
      }
    }

    return {
      id: `imp-${idx}-${Date.now()}`,
      date,
      description: desc,
      amount,
      type,
      categoryId: matchedCatId,
      selected: true
    };
  };

  const handleSelectAll = (checked: boolean) => {
    setParsedItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleToggleItem = (id: string) => {
    setParsedItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const handleUpdateItem = (id: string, field: keyof ParsedTransaction, value: any) => {
    setParsedItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleExecuteImport = () => {
    const toImport = parsedItems.filter(i => i.selected && i.amount > 0);
    if (toImport.length === 0) return;

    toImport.forEach(item => {
      addTransaction({
        amount: item.amount,
        type: item.type,
        category_id: item.categoryId,
        account_id: selectedAccountId || accounts[0]?.id,
        description: item.description,
        date: item.date,
        source: 'manual'
      });
    });

    setSuccessCount(toImport.length);
    setParsedItems([]);
    setTimeout(() => {
      onClose();
      setSuccessCount(null);
    }, 1600);
  };

  const loadSampleCsv = () => {
    const sample = `Tanggal,Keterangan,Tipe,Nominal
2026-08-28,Transfer Gaji Payroll PT Maju Jaya,CR,12500000
2026-08-29,Belanja Bulanan Superindo BSD,DB,485000
2026-08-29,Kopi Janji Jiwa & Toast,DB,38000
2026-08-30,Isi Bensin Pertamina SPBU 34,DB,150000
2026-08-30,Langganan Netflix Premium,DB,186000
2026-08-31,Bayar Listrik PLN Pascabayar,DB,340000
2026-09-01,Top Up Bibit Reksadana Saham,DB,1000000`;
    parseCsv(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900/50 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#0c2658]/40 border-blue-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005CE6]/15 text-[#005CE6] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Import Mutasi Bank & E-Wallet</h3>
              <p className="text-xs text-slate-500">Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, dan format CSV.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {successCount !== null ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center text-2xl font-bold">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-emerald-500">Berhasil Mengimpor {successCount} Transaksi!</h4>
              <p className="text-xs text-slate-500">Saldo dompet & pos anggaran telah otomatis diperbarui.</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-500">Pilih Dompet / Rekening Tujuan:</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none transition ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/60 border-slate-700 text-white'
                    }`}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Saldo: Rp {Number(acc.balance).toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-500">Upload File Mutasi (.csv / .txt):</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      isLight ? 'bg-blue-50 hover:bg-blue-100 text-[#005CE6] border-blue-200' : 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border-blue-800'
                    }`}>
                      <Upload className="w-4 h-4" />
                      <span>Pilih File CSV</span>
                      <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={loadSampleCsv}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Coba simulasi dengan data mutasi contoh"
                    >
                      <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                      Contoh
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              {parsedItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#005CE6] text-white text-xs font-bold">
                        {parsedItems.filter(i => i.selected).length} dari {parsedItems.length} Terpilih
                      </span>
                      <span className="text-xs text-slate-500">Periksa & sesuaikan sebelum dimasukkan:</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(true)}
                        className="text-xs text-[#005CE6] hover:underline font-semibold"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-400">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(false)}
                        className="text-xs text-slate-500 hover:underline font-semibold"
                      >
                        Batal Semua
                      </button>
                    </div>
                  </div>

                  <div className={`border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto ${
                    isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-900/40'
                  }`}>
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className={`sticky top-0 z-10 font-bold uppercase text-[10px] tracking-wider border-b ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="p-2.5 w-8 text-center">✓</th>
                          <th className="p-2.5 w-24">Tanggal</th>
                          <th className="p-2.5">Keterangan</th>
                          <th className="p-2.5 w-32">Kategori AI</th>
                          <th className="p-2.5 w-24">Jenis</th>
                          <th className="p-2.5 w-28 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {parsedItems.map((item) => (
                          <tr key={item.id} className={item.selected ? '' : 'opacity-40'}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleToggleItem(item.id)}
                                className="rounded text-[#005CE6] cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => handleUpdateItem(item.id, 'date', e.target.value)}
                                className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-full"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-full truncate"
                              />
                            </td>
                            <td className="p-2.5">
                              <select
                                value={item.categoryId}
                                onChange={(e) => handleUpdateItem(item.id, 'categoryId', e.target.value)}
                                className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-full"
                              >
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={item.type}
                                onChange={(e) => handleUpdateItem(item.id, 'type', e.target.value as any)}
                                className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-full font-bold"
                              >
                                <option value="expense">Pengeluaran</option>
                                <option value="income">Pemasukan</option>
                              </select>
                            </td>
                            <td className={`p-2.5 text-right font-bold ${
                              item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              Rp {Number(item.amount).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#0c2658]/20 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isLight ? 'hover:bg-slate-200/60 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedItems.filter(i => i.selected).length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#005CE6] hover:bg-[#004dc2] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Import Masuk ke Dompet ({parsedItems.filter(i => i.selected).length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
