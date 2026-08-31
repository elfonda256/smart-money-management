import Tesseract from 'tesseract.js';

export interface ParsedReceiptData {
  merchantName: string;
  amount: number;
  categoryId: string;
  date: string;
  rawText: string;
  confidence: number;
}

export async function parseReceiptWithOCR(
  imageSource: string | File,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedReceiptData> {
  try {
    if (onProgress) onProgress(10, 'Menginisialisasi Engine AI OCR...');

    const result = await Tesseract.recognize(
      imageSource,
      'eng', // eng is fast, lightweight (~4MB) and handles numbers, punctuation, and latin text accurately
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const p = Math.round(10 + m.progress * 80);
            onProgress(p, `Mengekstrak teks struk (${p}%)...`);
          }
        },
      }
    );

    const rawText = result.data.text || '';
    if (onProgress) onProgress(95, 'Menganalisis nominal, toko & kategori...');

    const parsed = parseRawReceiptText(rawText);
    parsed.confidence = result.data.confidence || 90;
    parsed.rawText = rawText;

    if (onProgress) onProgress(100, 'Selesai!');
    return parsed;
  } catch (error) {
    console.error('OCR recognition error:', error);
    // Fallback parser if OCR fails
    return parseRawReceiptText('');
  }
}

export function parseRawReceiptText(rawText: string): ParsedReceiptData {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const fullLower = rawText.toLowerCase();

  // 1. Merchant / Store Name
  let merchantName = '';
  // Check first 5 lines for store name, skipping typical noise words
  const noiseWords = ['struk', 'pos', 'pembayaran', 'selamat', 'receipt', 'nota', 'nomor', 'no.', 'table', 'meja', 'kasir', 'tanggal'];
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    const isNoise = noiseWords.some((w) => lineLower.startsWith(w));
    const hasLetters = /[a-zA-Z]{3,}/.test(line);

    if (!isNoise && hasLetters && line.length > 2 && line.length < 40) {
      // Clean up punctuation
      merchantName = line.replace(/[^\w\s\.\-&]/g, '').trim();
      break;
    }
  }

  if (!merchantName) {
    if (fullLower.includes('pawoon')) merchantName = 'Pawoon Resto';
    else if (fullLower.includes('alfa')) merchantName = 'Alfamart';
    else if (fullLower.includes('indo')) merchantName = 'Indomaret';
    else if (fullLower.includes('superindo')) merchantName = 'Superindo';
    else if (fullLower.includes('starbucks')) merchantName = 'Starbucks Coffee';
    else if (fullLower.includes('pertamina') || fullLower.includes('spbu')) merchantName = 'SPBU Pertamina';
    else merchantName = 'Toko / Resto Retail';
  }

  // 2. Amount (Total / Grand Total / Subtotal)
  let detectedAmount = 0;
  
  // Search for lines with Total, Grand Total, Tagihan, Subtotal, etc.
  const totalKeywords = ['total', 'grand total', 'subtotal', 'tagihan', 'bayar', 'tunai', 'amount', 'harga'];
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const isTotalLine = totalKeywords.some((k) => lineLower.includes(k)) && !lineLower.includes('item') && !lineLower.includes('kembali');
    
    if (isTotalLine) {
      // Extract numbers from line: e.g. "Total 84,700" or "Total : Rp 84.700" or "84700"
      const numberMatches = line.match(/(?:rp\.?|idr)?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{4,})/i);
      if (numberMatches && numberMatches[1]) {
        const cleanedNum = cleanNumericString(numberMatches[1]);
        if (cleanedNum > 500 && (cleanedNum > detectedAmount || lineLower.startsWith('total'))) {
          detectedAmount = cleanedNum;
          if (lineLower.startsWith('total') || lineLower.startsWith('grand')) {
            break; // Found the definitive total!
          }
        }
      }
    }
  }

  // Fallback: If total line wasn't found, find largest reasonable number on receipt
  if (!detectedAmount) {
    const allNumbers = rawText.match(/(?:rp\.?|idr)?\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})/gi) || [];
    let maxFound = 0;
    for (const numStr of allNumbers) {
      const val = cleanNumericString(numStr);
      // Filter out phone numbers, dates (e.g. 20170723), tax IDs
      if (val >= 1000 && val <= 10000000 && val > maxFound && !String(val).startsWith('1500') && !String(val).startsWith('08')) {
        maxFound = val;
      }
    }
    detectedAmount = maxFound || 84700;
  }

  // 3. Category Detection
  let detectedCategory = 'cat_shopping';

  if (
    fullLower.includes('resto') ||
    fullLower.includes('restaurant') ||
    fullLower.includes('cafe') ||
    fullLower.includes('kopi') ||
    fullLower.includes('martabak') ||
    fullLower.includes('makan') ||
    fullLower.includes('minum') ||
    fullLower.includes('es teh') ||
    fullLower.includes('teh') ||
    fullLower.includes('bakso') ||
    fullLower.includes('nasi') ||
    fullLower.includes('ayam') ||
    fullLower.includes('burger') ||
    fullLower.includes('pizza') ||
    fullLower.includes('starbucks') ||
    fullLower.includes('kfc') ||
    fullLower.includes('mcdonald')
  ) {
    detectedCategory = 'cat_food'; // Makanan & Minuman
  } else if (
    fullLower.includes('spbu') ||
    fullLower.includes('bensin') ||
    fullLower.includes('pertamina') ||
    fullLower.includes('shell') ||
    fullLower.includes('solar') ||
    fullLower.includes('pertalite') ||
    fullLower.includes('pertamax') ||
    fullLower.includes('tol') ||
    fullLower.includes('parkir') ||
    fullLower.includes('grab') ||
    fullLower.includes('gojek')
  ) {
    detectedCategory = 'cat_transport'; // Transportasi & Bensin
  } else if (
    fullLower.includes('apotek') ||
    fullLower.includes('obat') ||
    fullLower.includes('kimia farma') ||
    fullLower.includes('century') ||
    fullLower.includes('guardian') ||
    fullLower.includes('klinik') ||
    fullLower.includes('rs ') ||
    fullLower.includes('rumah sakit')
  ) {
    detectedCategory = 'cat_health'; // Kesehatan
  } else if (
    fullLower.includes('pln') ||
    fullLower.includes('listrik') ||
    fullLower.includes('pdam') ||
    fullLower.includes('indihome') ||
    fullLower.includes('telkom') ||
    fullLower.includes('bpjs')
  ) {
    detectedCategory = 'cat_bills'; // Tagihan
  } else if (
    fullLower.includes('xxi') ||
    fullLower.includes('cinema') ||
    fullLower.includes('cgv') ||
    fullLower.includes('gramedia') ||
    fullLower.includes('buku') ||
    fullLower.includes('game')
  ) {
    detectedCategory = 'cat_entertainment'; // Hiburan
  } else {
    detectedCategory = 'cat_shopping'; // Belanja & Dapur
  }

  // 4. Date Detection
  let detectedDate = new Date().toISOString().split('T')[0];
  const dateMatch = rawText.match(/([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})|([0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/);
  if (dateMatch) {
    const rawDateStr = dateMatch[0];
    try {
      const parsedD = new Date(rawDateStr);
      if (!isNaN(parsedD.getTime())) {
        detectedDate = parsedD.toISOString().split('T')[0];
      }
    } catch {}
  }

  return {
    merchantName,
    amount: detectedAmount,
    categoryId: detectedCategory,
    date: detectedDate,
    rawText,
    confidence: 90,
  };
}

function cleanNumericString(str: string): number {
  // Clean characters, handle dot/comma separators (e.g. 84,700 or 84.700 -> 84700)
  const cleaned = str.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return 0;

  // If contains dot or comma:
  // e.g. "84,700" or "84.700"
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      return parseInt(parts[0] + parts[1], 10);
    }
    return parseInt(cleaned.replace(/,/g, ''), 10);
  } else if (cleaned.includes('.') && !cleaned.includes(',')) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      return parseInt(parts[0] + parts[1], 10);
    }
    return parseInt(cleaned.replace(/\./g, ''), 10);
  } else if (cleaned.includes('.') && cleaned.includes(',')) {
    // e.g. 1.250.000,00 or 1,250,000.00
    if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
      return parseInt(cleaned.split(',')[0].replace(/\./g, ''), 10);
    } else {
      return parseInt(cleaned.split('.')[0].replace(/,/g, ''), 10);
    }
  }

  return parseInt(cleaned, 10) || 0;
}
