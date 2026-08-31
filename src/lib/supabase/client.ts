import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const DEFAULT_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const STORAGE_URL_KEY = 'smart_money_custom_supabase_url';
const STORAGE_ANON_KEY = 'smart_money_custom_supabase_key';

export const getSupabaseConfig = () => {
  let url = DEFAULT_URL;
  let key = DEFAULT_KEY;

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_URL_KEY);
    const customKey = localStorage.getItem(STORAGE_ANON_KEY);
    if (customUrl && customUrl.startsWith('https://')) {
      url = customUrl;
    }
    if (customKey && customKey.length > 10) {
      key = customKey;
    }
  }

  return { url, key };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('https://'));
};

let cachedClient: SupabaseClient | null = null;
let cachedKey: string = '';

export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !url.startsWith('https://')) {
    return null;
  }
  const currentFingerprint = `${url}__${key}`;
  if (!cachedClient || cachedKey !== currentFingerprint) {
    cachedClient = createClient(url, key);
    cachedKey = currentFingerprint;
  }
  return cachedClient;
};

export const saveCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }
    if (key.trim()) {
      localStorage.setItem(STORAGE_ANON_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_ANON_KEY);
    }
    cachedClient = null;
    cachedKey = '';
  }
};

// Export proxy for backwards compatibility
export const supabase = typeof window !== 'undefined' 
  ? getSupabase() 
  : (isSupabaseConfigured() ? createClient(DEFAULT_URL, DEFAULT_KEY) : null);
