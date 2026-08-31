'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mic, 
  Volume2, 
  Sliders, 
  Database, 
  ShieldCheck, 
  Check, 
  Copy, 
  RotateCcw, 
  Sparkles, 
  Play,
  Server,
  AlertTriangle,
  Users,
  Cloud,
  RefreshCw,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { speechSynth, soundEffects } from '@/lib/voice/speechSynthesis';
import { formatCurrency } from '@/lib/utils/formatters';

export default function SettingsPage() {
  const { 
    voiceSettings, 
    updateVoiceSettings, 
    resetToZero, 
    resetToZeroAllFamily, 
    resetAllData, 
    activeProfile, 
    updateProfile,
    theme,
    cloudSyncStatus,
    lastSyncedAt,
    supabaseConfig,
    updateSupabaseCredentials,
    triggerManualSync,
    triggerCloudPush
  } = useFinancial();

  const isLight = theme === 'light';
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [isResetZeroModalOpen, setIsResetZeroModalOpen] = useState(false);
  const [isResetAllFamilyModalOpen, setIsResetAllFamilyModalOpen] = useState(false);
  const [isRestoreDemoModalOpen, setIsRestoreDemoModalOpen] = useState(false);

  // Cloud Config State
  const [customUrl, setCustomUrl] = useState(supabaseConfig?.url || 'https://tqaafrzntepiodfeyofc.supabase.co');
  const [customKey, setCustomKey] = useState(supabaseConfig?.key || '');
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (supabaseConfig?.url) setCustomUrl(supabaseConfig.url);
    if (supabaseConfig?.key) setCustomKey(supabaseConfig.key);
  }, [supabaseConfig]);

  const handleConnectSupabase = async () => {
    if (!customUrl || !customKey) {
      setConnectMsg({ type: 'error', text: 'Mohon isi Project URL dan Publishable Key dengan lengkap.' });
      return;
    }
    setIsConnecting(true);
    setConnectMsg(null);
    const ok = await updateSupabaseCredentials(customUrl, customKey);
    setIsConnecting(false);
    if (ok) {
      setConnectMsg({ type: 'success', text: 'Berhasil terhubung ke Supabase Cloud! Sinkronisasi realtime aktif.' });
      setShowConfigForm(false);
    } else {
      setConnectMsg({ type: 'error', text: 'Gagal terhubung ke Supabase. Periksa kembali URL & Publishable Key Anda.' });
    }
  };

  useEffect(() => {
    const voices = speechSynth.getVoices();
    setAvailableVoices(voices);
  }, []);

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    if (voiceSettings.soundEffects) {
      soundEffects.playSuccess();
    }
    const testText = voiceSettings.language === 'id-ID'
      ? `Halo ${activeProfile.name.split(' ')[0]}! Saya Aira, asisten finansial pintar keluarga Anda. Pengaturan suara berhasil dikonfigurasi.`
      : 'Hello! I am your smart financial assistant. Voice settings configured successfully.';

    speechSynth.speak(testText, {
      language: voiceSettings.language,
      rate: voiceSettings.speechRate,
      pitch: voiceSettings.speechPitch,
      voiceURI: voiceSettings.voiceURI,
    }).then(() => {
      setIsTestingVoice(false);
    });
  };

  const handleSaveSettings = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Header (Mandiri Royal Cobalt Blue & Wave Shape) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#005CE6] text-white p-6 sm:p-8 shadow-lg shadow-blue-700/20">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-[45%] bg-[#0084FF] opacity-90 blur-xl pointer-events-none transform rotate-12" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-b from-[#0047C2] to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full border border-white/40 bg-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              SISTEM & PREFERENSI
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Pengaturan & Konfigurasi ({activeProfile.name})
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
            Kustomisasi suara asisten Aira, nada bicara, manajemen saldo Rp 0, dan akun keluarga.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* 0. Supabase Cloud Sync Card */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              cloudSyncStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : cloudSyncStatus === 'syncing' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                  Sinkronisasi Cloud Supabase
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  cloudSyncStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {cloudSyncStatus === 'connected' ? '🟢 Terhubung Realtime' : cloudSyncStatus === 'syncing' ? '🔄 Sedang Sinkron...' : '⚪ Mode Lokal'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {lastSyncedAt ? `Terakhir sinkron: ${lastSyncedAt}` : 'Sinkronkan data realtime antara iPhone, Android, dan Laptop.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => triggerManualSync()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-md shadow-blue-600/20 transition touch-manipulation cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Tarik Data Cloud</span>
            </button>
            <button
              onClick={() => triggerCloudPush()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition shadow-sm touch-manipulation cursor-pointer ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Unggah data di HP/Laptop ini ke Cloud"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
              <span>Unggah ke Cloud</span>
            </button>
            <button
              onClick={() => setShowConfigForm(!showConfigForm)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full border text-xs font-semibold transition touch-manipulation cursor-pointer ${
                isLight ? 'bg-blue-50 hover:bg-blue-100 text-[#005CE6] border-blue-200' : 'bg-slate-800 text-blue-300 border-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showConfigForm ? 'Tutup Form' : 'Atur URL & Key'}</span>
            </button>
          </div>
        </div>

        {connectMsg && (
          <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            connectMsg.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300'
          }`}>
            <span>{connectMsg.text}</span>
          </div>
        )}

        {/* Dynamic Connection Form */}
        {(showConfigForm || cloudSyncStatus === 'local' || cloudSyncStatus === 'error') && (
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
            isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-[#061530]/80 border-blue-900'
          }`}>
            <div className="space-y-1">
              <h4 className={`text-xs font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                🔑 Pengaturan Kredensial Supabase (Untuk Sinkronisasi Perangkat Ini)
              </h4>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Masukkan URL dan Publishable Key dari dashboard Supabase Anda agar HP atau Laptop ini langsung terhubung.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://tqaafrzntepiodfeyofc.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-[#005CE6] font-mono text-xs ${
                    isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-slate-900 border-blue-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Supabase Publishable / Anon Key
                </label>
                <input
                  type="password"
                  placeholder="sb_publishable_..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-[#005CE6] font-mono text-xs ${
                    isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-slate-900 border-blue-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleConnectSupabase}
                disabled={isConnecting}
                className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] disabled:opacity-50 text-white font-bold rounded-full text-xs shadow-md shadow-blue-600/20 transition touch-manipulation cursor-pointer flex items-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Hubungkan & Sinkronkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Voice Settings Card */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#005CE6] flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                Pengaturan Voice Input & Output
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Web Speech API SpeechRecognition & Text-to-Speech
              </p>
            </div>
          </div>

          <button
            onClick={handleTestVoice}
            disabled={isTestingVoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 transition touch-manipulation cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isTestingVoice ? 'Membunyikan...' : 'Tes Suara Aira'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Language Selection */}
          <div>
            <label className={`block font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Bahasa Utama (Language)
            </label>
            <select
              value={voiceSettings.language}
              onChange={(e) => updateVoiceSettings({ language: e.target.value as any })}
              className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
              }`}
            >
              <option value="id-ID">Bahasa Indonesia (id-ID)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </div>

          {/* Voice Model Selector */}
          <div>
            <label className={`block font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Pilihan Suara TTS (Text-to-Speech Voice)
            </label>
            <select
              value={voiceSettings.voiceURI}
              onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] truncate ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
              }`}
            >
              <option value="">Default Browser Voice (Otomatis)</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className={`flex justify-between mb-1.5 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span>Kecepatan Bicara (Speech Rate)</span>
              <span className="text-[#005CE6] dark:text-yellow-400 font-bold">{voiceSettings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={voiceSettings.speechRate}
              onChange={(e) => updateVoiceSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-[#005CE6]"
            />
          </div>

          {/* Speech Pitch Slider */}
          <div>
            <div className={`flex justify-between mb-1.5 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span>Nada Suara (Speech Pitch)</span>
              <span className="text-[#005CE6] dark:text-yellow-400 font-bold">{voiceSettings.speechPitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.1"
              value={voiceSettings.speechPitch}
              onChange={(e) => updateVoiceSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-[#005CE6]"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className={`pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ${
          isLight ? 'border-blue-100' : 'border-blue-900/40'
        }`}>
          <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer ${
            isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/60'
          }`}>
            <input
              type="checkbox"
              checked={voiceSettings.autoPlayVoiceResponse}
              onChange={(e) => updateVoiceSettings({ autoPlayVoiceResponse: e.target.checked })}
              className="w-4 h-4 accent-[#005CE6] rounded"
            />
            <div>
              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Auto-Play Laporan Suara</div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bacakan jawaban langsung saat perintah suara diproses</div>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer ${
            isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/60'
          }`}>
            <input
              type="checkbox"
              checked={voiceSettings.soundEffects}
              onChange={(e) => updateVoiceSettings({ soundEffects: e.target.checked })}
              className="w-4 h-4 accent-[#005CE6] rounded"
            />
            <div>
              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Efek Suara Audio Interaktif</div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bunyikan nada saat mic aktif dan transaksi tersimpan</div>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Reset Saldo & Data Management Card */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
              Manajemen Data & Reset Saldo Rp 0
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Kosongkan data simulasi agar Anda dapat mulai mencatat saldo riil dari nol
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Option 1: Reset Active User to 0 */}
          <div className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between ${
            isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/50'
          }`}>
            <div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Reset Saldo {activeProfile.name.split(' ')[0]} ke Rp 0
              </h4>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mengatur saldo rekening profil ini menjadi 0 & menghapus riwayat mutasi.
              </p>
            </div>
            <button
              onClick={() => setIsResetZeroModalOpen(true)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition shadow-sm touch-manipulation cursor-pointer"
            >
              Reset Profil Ini (Rp 0)
            </button>
          </div>

          {/* Option 2: Reset All Family to 0 */}
          <div className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between ${
            isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/50'
          }`}>
            <div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Reset Saldo Semua Anggota (Rp 0)
              </h4>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mengatur saldo seluruh keluarga (Agus, Merys, Elfano, Sheila, Nail) ke 0.
              </p>
            </div>
            <button
              onClick={() => setIsResetAllFamilyModalOpen(true)}
              className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 touch-manipulation cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Reset 1 Keluarga (Rp 0)</span>
            </button>
          </div>

          {/* Option 3: Restore Demo Data */}
          <div className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between ${
            isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530]/60 border-blue-900/50'
          }`}>
            <div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Pulihkan Data Simulasi Demo
              </h4>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mengisi ulang transaksi dan saldo contoh keluarga untuk mencoba fitur suara.
              </p>
            </div>
            <button
              onClick={() => setIsRestoreDemoModalOpen(true)}
              className={`w-full py-2 rounded-full text-xs font-bold transition border touch-manipulation cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
              }`}
            >
              Pulihkan Data Demo
            </button>
          </div>
        </div>
      </div>

      {/* 3. User Profile Card */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isLight ? 'bg-white border-blue-100 shadow-slate-200/50' : 'bg-[#0c2658] border-blue-900/40 shadow-xl'
      }`}>
        <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
          Profil Pengguna Aktif ({activeProfile.name})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={activeProfile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Email
            </label>
            <input
              type="email"
              value={activeProfile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
              }`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-full text-xs shadow-md shadow-blue-600/20 transition touch-manipulation cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Confirmation Modal 1: Reset Active User */}
      {isResetZeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Reset Saldo {activeProfile.name} ke Rp 0?
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Saldo akun {activeProfile.name} akan diatur menjadi Rp 0 dan seluruh mutasi transaksi dikosongkan.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetZeroModalOpen(false)}
                className={`flex-1 py-2.5 rounded-full text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetToZero();
                  setIsResetZeroModalOpen(false);
                  handleSaveSettings();
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ya, Reset Jadi Rp 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 2: Reset All Family */}
      {isResetAllFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Reset Saldo Seluruh Keluarga ke Rp 0?
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Seluruh profil (Agus, Merys, Elfano, Sheila, Nail, Kas Bersama) akan direset saldonya menjadi Rp 0 agar Anda sekeluarga bisa mulai menginput keuangan nyata.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetAllFamilyModalOpen(false)}
                className={`flex-1 py-2.5 rounded-full text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetToZeroAllFamily();
                  setIsResetAllFamilyModalOpen(false);
                  handleSaveSettings();
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
              >
                Ya, Reset 1 Keluarga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 3: Restore Demo */}
      {isRestoreDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#005CE6] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Pulihkan Data Simulasi Demo?
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Data demo dengan contoh transaksi keluarga Agus Sugawi & Merys Novita akan dimuat ulang.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsRestoreDemoModalOpen(false)}
                className={`flex-1 py-2.5 rounded-full text-xs font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsRestoreDemoModalOpen(false);
                  handleSaveSettings();
                }}
                className="flex-1 py-2.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold text-xs shadow-md"
              >
                Pulihkan Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
