import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (isNaN(amount)) amount = 0;
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatShortNumber(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' M';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' Jt';
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' Rb';
  }
  return amount.toString();
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Convert any manual string input (with dots, commas, or words like 200.000.000 or 200jt) to a clean number
export function parseNumericInput(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  const clean = String(val).replace(/rp\.?|idr/gi, '').trim();
  
  // If it has words/suffixes like "200jt" or "200 juta", use parseSpokenAmount
  const spoken = parseSpokenAmount(clean);
  if (spoken !== null && spoken > 0) return spoken;

  // Handle Indonesian dot thousand separators: e.g. "200.000.000" or "200.000"
  let numStr = clean;
  if (numStr.includes('.') && !numStr.includes(',')) {
    const parts = numStr.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      numStr = numStr.replace(/\./g, '');
    }
  } else if (numStr.includes(',') && !numStr.includes('.')) {
    const parts = numStr.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      numStr = numStr.replace(/,/g, '');
    } else {
      numStr = numStr.replace(',', '.');
    }
  } else if (numStr.includes('.') && numStr.includes(',')) {
    if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
      numStr = numStr.replace(/\./g, '').replace(',', '.');
    } else {
      numStr = numStr.replace(/,/g, '');
    }
  }

  const result = parseFloat(numStr);
  return isNaN(result) ? 0 : result;
}

// Convert Indonesian and common spoken numbers to numerical values
// Examples: "50jt", "50 juta", "lima puluh juta", "50 ribu", "250k", "100rb", "seratus lima puluh ribu"
export function parseSpokenAmount(text: string): number | null {
  if (!text) return null;
  let clean = text.toLowerCase().trim();

  // 1. Normalize attached currency & unit suffixes: e.g. "50jt" -> "50 jt", "500rb" -> "500 rb", "50k" -> "50 k", "1.5juta" -> "1.5 juta"
  clean = clean
    .replace(/(\d+)\s*(jt|juta|miliar|milyar|ribu|rb|k|m\b)/gi, '$1 $2')
    .replace(/rp\.?|rupiah|\$|idr/gi, ' ')
    .trim();

  // 2. Direct embedded unit match: e.g. "50 jt", "50 juta", "1.5 juta", "250 rb", "50 k", "2.5 m"
  const embeddedUnitMatch = clean.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(juta|jt|miliar|milyar|ribu|rb|k|m\b)(?:\s|$)/i);
  if (embeddedUnitMatch) {
    let numStr = embeddedUnitMatch[1];
    const unit = embeddedUnitMatch[2].toLowerCase();

    // Handle Indonesian comma decimal format: e.g. 1,5 -> 1.5
    if (numStr.includes(',') && !numStr.includes('.')) {
      numStr = numStr.replace(',', '.');
    } else if (numStr.includes('.') && numStr.includes(',')) {
      if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.');
      } else {
        numStr = numStr.replace(/,/g, '');
      }
    }

    let val = parseFloat(numStr);
    if (!isNaN(val)) {
      if (unit === 'ribu' || unit === 'rb' || unit === 'k') {
        val *= 1_000;
      } else if (unit === 'juta' || unit === 'jt' || unit === 'm') {
        val *= 1_000_000;
      } else if (unit === 'miliar' || unit === 'milyar') {
        val *= 1_000_000_000;
      }
      return Math.round(val);
    }
  }

  // 3. Formatted plain numbers with thousand separators: e.g. "50.000.000", "50,000,000", "500.000", "50000000"
  const plainFormattedMatch = clean.match(/(?:^|\s)(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,})(?:\s|$)/);
  if (plainFormattedMatch) {
    const rawNum = plainFormattedMatch[1];
    let cleanedNum = rawNum;
    if (cleanedNum.includes('.') && !cleanedNum.includes(',')) {
      cleanedNum = cleanedNum.replace(/\./g, '');
    } else if (cleanedNum.includes(',') && !cleanedNum.includes('.')) {
      cleanedNum = cleanedNum.replace(/,/g, '');
    } else if (cleanedNum.includes('.') && cleanedNum.includes(',')) {
      if (cleanedNum.lastIndexOf(',') > cleanedNum.lastIndexOf('.')) {
        cleanedNum = cleanedNum.replace(/\./g, '').replace(',', '.');
      } else {
        cleanedNum = cleanedNum.replace(/,/g, '');
      }
    }
    const val = parseFloat(cleanedNum);
    if (!isNaN(val) && val > 0) {
      return Math.round(val);
    }
  }

  // 4. Indonesian word numbers: "lima puluh juta", "dua ratus lima puluh ribu", "seratus ribu"
  const wordMap: Record<string, number> = {
    nol: 0, satu: 1, se: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
    sebelas: 11, seratus: 100, seribu: 1000, sejuta: 1000000,
  };

  const words = clean.split(/\s+/);
  let total = 0;
  let currentGroup = 0;
  let hasNumberWords = false;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (w === 'juta' || w === 'jt') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1_000_000;
      currentGroup = 0;
      hasNumberWords = true;
    } else if (w === 'miliar' || w === 'milyar') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1_000_000_000;
      currentGroup = 0;
      hasNumberWords = true;
    } else if (w === 'ribu' || w === 'rb' || w === 'k') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1_000;
      currentGroup = 0;
      hasNumberWords = true;
    } else if (w === 'ratus') {
      currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 100;
      hasNumberWords = true;
    } else if (w === 'puluh') {
      currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 10;
      hasNumberWords = true;
    } else if (w === 'belas') {
      currentGroup += 10;
      hasNumberWords = true;
    } else if (wordMap[w] !== undefined) {
      if (w === 'seratus') {
        currentGroup += 100;
      } else if (w === 'seribu') {
        total += 1000;
      } else if (w === 'sejuta') {
        total += 1000000;
      } else if (w === 'sepuluh') {
        currentGroup += 10;
      } else if (w === 'sebelas') {
        currentGroup += 11;
      } else {
        currentGroup += wordMap[w];
      }
      hasNumberWords = true;
    } else if (!isNaN(parseFloat(w))) {
      currentGroup += parseFloat(w);
      hasNumberWords = true;
    }
  }

  total += currentGroup;

  if (hasNumberWords && total > 0) {
    return Math.round(total);
  }

  // 5. Final Fallback: extract any isolated digit
  const digitMatch = clean.match(/\b\d+\b/);
  if (digitMatch) {
    const val = parseInt(digitMatch[0], 10);
    if (!isNaN(val)) return val;
  }

  return null;
}
