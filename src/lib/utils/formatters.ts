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

// Convert Indonesian and common spoken numbers to numerical values
// Examples: "50 ribu", "lima puluh ribu", "1.5 juta", "250k", "100rb", "seratus lima puluh ribu"
export function parseSpokenAmount(text: string): number | null {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // Pattern 1: Direct number with suffixes like "50.000", "50,000", "50k", "50rb", "1.5jt", "1.5 juta", "2.5m"
  // Clean currency symbols first
  const noRp = clean.replace(/rp\.?|rupiah|\$|idr/g, '').trim();

  // Match e.g. "1.5 juta", "1,5jt", "250 rb", "50k", "100000"
  const suffixMatch = noRp.match(/^([\d.,]+)\s*(ribu|rb|k|juta|jt|m|miliar|b|milyar)?$/);
  if (suffixMatch) {
    let numStr = suffixMatch[1];
    const suffix = suffixMatch[2];

    // If Indonesian comma format: 1,5 -> 1.5
    if (numStr.includes(',') && !numStr.includes('.')) {
      numStr = numStr.replace(',', '.');
    } else if (numStr.includes('.') && numStr.includes(',')) {
      // 1.500.000,00 or 1,500,000.00
      if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.');
      } else {
        numStr = numStr.replace(/,/g, '');
      }
    } else if (numStr.includes('.') && numStr.split('.')[1]?.length === 3) {
      // Thousand separator like "50.000"
      numStr = numStr.replace(/\./g, '');
    }

    let val = parseFloat(numStr);
    if (!isNaN(val)) {
      if (suffix === 'ribu' || suffix === 'rb' || suffix === 'k') {
        val *= 1000;
      } else if (suffix === 'juta' || suffix === 'jt' || suffix === 'm') {
        val *= 1000000;
      } else if (suffix === 'miliar' || suffix === 'milyar' || suffix === 'b') {
        val *= 1000000000;
      }
      return Math.round(val);
    }
  }

  // Words dictionary in Indonesian
  const wordMap: Record<string, number> = {
    nol: 0, satu: 1, se: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
    sebelas: 11, seratus: 100, seribu: 1000, sejuta: 1000000,
  };

  // Check if text contains Indonesian number words
  const words = noRp.split(/\s+/);
  let total = 0;
  let currentGroup = 0;
  let hasNumberWords = false;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (w === 'juta' || w === 'jt') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1000000;
      currentGroup = 0;
      hasNumberWords = true;
    } else if (w === 'miliar' || w === 'milyar') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1000000000;
      currentGroup = 0;
      hasNumberWords = true;
    } else if (w === 'ribu' || w === 'rb' || w === 'k') {
      if (currentGroup === 0) currentGroup = 1;
      total += currentGroup * 1000;
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

  // Fallback: extract any digits
  const digitMatch = clean.match(/\d[\d.,]*/);
  if (digitMatch) {
    let cleanDigits = digitMatch[0].replace(/\./g, '').replace(/,/g, '');
    let val = parseInt(cleanDigits, 10);
    if (!isNaN(val)) return val;
  }

  return null;
}
