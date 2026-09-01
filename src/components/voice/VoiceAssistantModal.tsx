'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Wallet, 
  Tag, 
  CreditCard, 
  Send,
  HelpCircle,
  Play,
  Square,
  Bot,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinancial } from '@/lib/store/FinancialContext';
import { SpeechRecognitionService } from '@/lib/voice/speechRecognition';
import { speechSynth, soundEffects } from '@/lib/voice/speechSynthesis';
import { parseVoiceCommand } from '@/lib/voice/voiceParser';
import { generateFinancialVoiceReport } from '@/lib/voice/voiceReporter';
import { VoiceWaveVisualizer } from './VoiceWaveVisualizer';
import { formatCurrency, formatDateIndo } from '@/lib/utils/formatters';
import { ParsedIntent, TransactionType } from '@/types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommand?: string;
}

const SAMPLE_COMMANDS = [
  'Catat pengeluaran makan siang 50 ribu dari cash',
  'Bagaimana kondisi keuangan saya bulan ini?',
  'Berapa saldo saya sekarang?',
  'Catat beli bensin tiga ratus ribu lewat mandiri',
  'Tambah pemasukan gaji lima belas juta ke BCA',
  'Berapa sisa budget makan bulan ini?',
  'Berapa lama lagi target dana darurat tercapai?',
];

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  initialCommand,
}) => {
  const router = useRouter();
  const { 
    accounts, 
    categories, 
    transactions, 
    budgets, 
    goals, 
    debts, 
    totalBalance,
    familyCombinedNetWorth,
    voiceSettings,
    activeProfile,
    addTransaction, 
    addVoiceLog,
    theme 
  } = useFinancial();

  const isLight = theme === 'light';

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [voiceReport, setVoiceReport] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');

  // Editable parsed values
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editAccount, setEditAccount] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  const speechRecRef = useRef<SpeechRecognitionService | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recognizer = new SpeechRecognitionService(voiceSettings.language || 'id-ID');

      recognizer.onStateChange = (listening) => {
        setIsListening(listening);
      };

      recognizer.onTranscriptChange = (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript('');
          handleProcessCommand(text);
        } else {
          setInterimTranscript(text);
        }
      };

      recognizer.onError = (error) => {
        console.warn('Voice error:', error);
        if (error === 'not-allowed') {
          setErrorMessage('Izin mikrofon belum aktif. Kamu bisa klik izinkan mic di browser atau ketik langsung di tab Teks.');
        } else if (error === 'no-speech') {
          setErrorMessage('Suara belum terdengar jelas. Yuk coba bicara lagi dekat mic!');
        } else if (error === 'browser_not_supported') {
          setErrorMessage('Browser ini membatasi Web Speech API. Silakan gunakan Chrome/Edge atau ketik perintah di bawah.');
        }
      };

      speechRecRef.current = recognizer;
    }

    return () => {
      speechRecRef.current?.stopListening();
      speechSynth.stop();
    };
  }, [voiceSettings.language]);

  // Track speech synthesis speaking status
  useEffect(() => {
    speechSynth.onSpeakingChange = (speaking) => {
      setIsSpeaking(speaking);
    };
  }, []);

  // Open modal handler
  useEffect(() => {
    if (isOpen) {
      setTranscript(initialCommand || '');
      setInterimTranscript('');
      setParsedIntent(null);
      setVoiceReport(null);
      setIsSavedSuccess(false);
      setErrorMessage(null);

      if (initialCommand) {
        handleProcessCommand(initialCommand);
      } else {
        if (voiceSettings.soundEffects) {
          soundEffects.playMicStart();
        }
        setTimeout(() => {
          startListening();
        }, 300);
      }
    } else {
      stopListening();
      speechSynth.stop();
    }
  }, [isOpen, initialCommand]);

  const startListening = () => {
    setErrorMessage(null);
    setIsSavedSuccess(false);
    speechSynth.stop();
    if (speechRecRef.current) {
      speechRecRef.current.setLanguage(voiceSettings.language);
      speechRecRef.current.startListening();
    }
  };

  const stopListening = () => {
    speechRecRef.current?.stopListening();
  };

  const handleProcessCommand = (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    stopListening();

    try {
      const intent = parseVoiceCommand(text, { accounts, categories });
      setParsedIntent(intent);

      if (intent.name === 'create_transaction') {
        const p = intent.parameters;
        setEditAmount(p.amount || 0);
        setEditType(p.type || 'expense');
        setEditCategory(p.category || categories.find(c => c.type === (p.type || 'expense'))?.id || categories[0].id);
        setEditAccount(p.account || accounts[0]?.id || 'acc_default');
        setEditDescription(p.description || 'Transaksi dari Suara');
        setVoiceReport(null);

        if (voiceSettings.autoPlayVoiceResponse) {
          const typeWord = p.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
          const feedback = `Siap! Saya siapkan catatan ${typeWord} sebesar ${formatCurrency(p.amount || 0)}. Silakan periksa dan konfirmasi.`;
          speechSynth.speak(feedback, { language: voiceSettings.language, rate: voiceSettings.speechRate });
        }
      } 
      else if (intent.name === 'query_financial_summary') {
        const report = generateFinancialVoiceReport({
          accounts,
          categories,
          transactions,
          budgets,
          goals,
          debts,
          period: intent.parameters.period as any,
          profileName: activeProfile.name,
          familyCombinedNetWorth: familyCombinedNetWorth,
        });
        setVoiceReport(report);

        if (voiceSettings.autoPlayVoiceResponse) {
          speechSynth.speak(report.spokenScript, {
            language: voiceSettings.language,
            rate: voiceSettings.speechRate,
            pitch: voiceSettings.speechPitch,
            voiceURI: voiceSettings.voiceURI,
          });
        }
      }
      else if (intent.name === 'query_balance') {
        let answerText = '';
        if (intent.parameters.account) {
          const acc = accounts.find(a => a.id === intent.parameters.account);
          answerText = `Saldo di akun ${acc?.name || 'kamu'} saat ini adalah ${formatCurrency(acc?.balance || 0)}.`;
        } else {
          if (familyCombinedNetWorth && familyCombinedNetWorth > 0 && familyCombinedNetWorth !== totalBalance) {
            answerText = `Saldo pribadi ${activeProfile.name} saat ini adalah ${formatCurrency(totalBalance)}, dan Total Kas Gabungan Seluruh Keluarga adalah ${formatCurrency(familyCombinedNetWorth)}.`;
          } else {
            answerText = `Total saldo kas Anda saat ini adalah ${formatCurrency(totalBalance)}.`;
          }
        }

        setVoiceReport({
          spokenScript: answerText,
          shortTitle: 'Ringkasan Saldo',
          metrics: [
            ...(familyCombinedNetWorth && familyCombinedNetWorth > 0 && familyCombinedNetWorth !== totalBalance ? [
              { label: 'Total Kas Gabungan', value: formatCurrency(familyCombinedNetWorth), type: 'positive' as const },
              { label: `Saldo ${activeProfile.name}`, value: formatCurrency(totalBalance), type: 'neutral' as const },
            ] : [
              { label: 'Total Saldo Terkelola', value: formatCurrency(totalBalance), type: 'positive' as const }
            ]),
          ],
          topCategories: [],
          recommendation: `Saldo Anda terdistribusi rapi di ${accounts.length} akun finansial.`,
        });

        if (voiceSettings.autoPlayVoiceResponse) {
          speechSynth.speak(answerText, { language: voiceSettings.language, rate: voiceSettings.speechRate });
        }
      }
      else if (intent.name === 'query_category_spending') {
        const cat = categories.find(c => c.id === intent.parameters.category);
        const curMonthTxs = transactions.filter(t => {
          const d = new Date(t.date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const catSpent = curMonthTxs
          .filter(t => t.category_id === cat?.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const answerText = `Kamu sudah membelanjakan ${formatCurrency(catSpent)} untuk kategori ${cat?.name || 'ini'} di bulan ini.`;
        setVoiceReport({
          spokenScript: answerText,
          shortTitle: `Pengeluaran ${cat?.name}`,
          metrics: [
            { label: `Total ${cat?.name}`, value: formatCurrency(catSpent), type: 'neutral' }
          ],
          topCategories: [],
          recommendation: cat?.budgetLimit ? `Batas anggaran bulanan pos ini adalah ${formatCurrency(cat.budgetLimit)}.` : '',
        });

        if (voiceSettings.autoPlayVoiceResponse) {
          speechSynth.speak(answerText, { language: voiceSettings.language, rate: voiceSettings.speechRate });
        }
      }
      else if (intent.name === 'navigate_page' && intent.parameters.page) {
        onClose();
        router.push(intent.parameters.page);
      }
      else {
        const fallbackSpeech = 'Maaf, saya belum memahami kalimat tersebut. Coba sebutkan contoh seperti "Catat makan siang 50 ribu dari cash".';
        if (voiceSettings.autoPlayVoiceResponse) {
          speechSynth.speak(fallbackSpeech, { language: voiceSettings.language });
        }
      }

      addVoiceLog({
        transcript: text,
        parsed_intent: intent,
        action_taken: intent.name,
      });

    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses suara');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSaveTransaction = () => {
    if (!editAmount || editAmount <= 0) {
      setErrorMessage('Nominal transaksi harus lebih dari 0');
      return;
    }

    addTransaction({
      account_id: editAccount,
      category_id: editCategory,
      amount: editAmount,
      type: editType,
      date: new Date().toISOString(),
      description: editDescription || 'Transaksi via Suara',
      source: 'voice',
    });

    if (voiceSettings.soundEffects) {
      soundEffects.playSuccess();
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    setIsSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSampleClick = (sample: string) => {
    setTranscript(sample);
    handleProcessCommand(sample);
  };

  const isLargeTransaction = editAmount >= 1_000_000;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar (Mandiri Blue Tint) */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#061530]/60 border-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005CE6] flex items-center justify-center shadow-md text-white font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                  Aira — Voice Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB800] text-slate-950">
                  Aktif 🎙️
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Katakan transaksi atau tanyakan laporan keuangan keluarga
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className={`flex p-1 rounded-full text-xs font-medium border ${
              isLight ? 'bg-slate-100 border-blue-100' : 'bg-[#061530] border-blue-900'
            }`}>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-3 py-1 rounded-full transition ${
                  activeTab === 'voice' 
                    ? 'bg-[#005CE6] text-white font-bold' 
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Suara
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1 rounded-full transition ${
                  activeTab === 'text' 
                    ? 'bg-[#005CE6] text-white font-bold' 
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Teks
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition touch-manipulation cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Waveform & Listening State */}
          <div className={`flex flex-col items-center justify-center py-5 rounded-3xl border ${
            isLight 
              ? 'bg-blue-50/40 border-blue-100' 
              : 'bg-[#061530]/50 border-blue-900/60'
          }`}>
            <VoiceWaveVisualizer
              isActive={isListening || isSpeaking}
              color={isSpeaking ? 'cyan' : isListening ? 'emerald' : 'purple'}
              mode={isSpeaking ? 'speaking' : 'listening'}
            />

            <div className="mt-3 flex items-center gap-2 text-sm font-medium">
              {isListening && (
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-pulse font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Aira sedang mendengarkan... (Silakan bicara sekarang)
                </span>
              )}
              {isSpeaking && (
                <span className="flex items-center gap-2 text-[#005CE6] dark:text-blue-400 font-semibold">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Aira sedang membacakan laporan untukmu...
                </span>
              )}
              {!isListening && !isSpeaking && !isProcessing && (
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Tekan "Mulai Bicara" atau pilih salah satu contoh di bawah
                </span>
              )}
              {isProcessing && (
                <span className="text-[#005CE6] dark:text-yellow-400 animate-pulse text-xs font-semibold">
                  Sedang memahami perintahmu... ✨
                </span>
              )}
            </div>

            {/* Mic trigger controls */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md transform active:scale-95 touch-manipulation cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                    : 'bg-[#FFB800] hover:bg-[#FFA000] text-slate-950 font-bold shadow-amber-500/30'
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4" /> Selesai Bicara
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Mulai Bicara
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={() => speechSynth.stop()}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border touch-manipulation cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <VolumeX className="w-4 h-4" /> Hentikan Suara
                </button>
              )}
            </div>
          </div>

          {/* Transcript Display & Text Input Tab */}
          {activeTab === 'voice' ? (
            <div className="space-y-2">
              <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Ucapanmu yang Terdeteksi:
              </div>
              <div className={`min-h-[56px] p-4 rounded-2xl border text-sm flex items-center ${
                isLight ? 'bg-slate-50 border-blue-100 text-slate-800' : 'bg-[#061530] border-blue-900 text-slate-200'
              }`}>
                {transcript || interimTranscript ? (
                  <p>
                    <span className={`font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>{transcript}</span>
                    {interimTranscript && (
                      <span className="text-slate-400 italic"> {interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    Ucapkan kalimat seperti: "Catat pengeluaran makan siang 50 ribu dari cash"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Ketik Perintah Manual:
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (transcript.trim()) handleProcessCommand(transcript);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Contoh: Catat makan siang 45rb pakai gopay"
                  className={`flex-1 px-4 py-3 border rounded-full text-sm focus:outline-none focus:border-[#005CE6] ${
                    isLight ? 'bg-slate-50 border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!transcript.trim()}
                  className="px-5 py-3 bg-[#005CE6] hover:bg-[#004dc2] text-white rounded-full text-sm font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 touch-manipulation cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Proses
                </button>
              </form>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* PARSED RESULT: 1. TRANSACTION CONFIRMATION CARD */}
          {parsedIntent && parsedIntent.name === 'create_transaction' && !isSavedSuccess && (
            <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
              isLight 
                ? 'bg-blue-50/40 border-blue-200 text-slate-800' 
                : 'bg-[#0c2658] border-blue-900 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isLight ? 'bg-blue-100 text-[#005CE6] border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    Konfirmasi Transaksi
                  </span>
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Akurasi: {(parsedIntent.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className={`flex p-1 rounded-full border text-xs ${
                  isLight ? 'bg-white border-blue-100' : 'bg-[#061530] border-blue-900'
                }`}>
                  <button
                    type="button"
                    onClick={() => setEditType('expense')}
                    className={`px-3 py-1 rounded-full font-bold transition ${editType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('income')}
                    className={`px-3 py-1 rounded-full font-bold transition ${editType === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('transfer')}
                    className={`px-3 py-1 rounded-full font-bold transition ${editType === 'transfer' ? 'bg-[#005CE6] text-white' : 'text-slate-400'}`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Large Transaction Warning */}
              {isLargeTransaction && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Transaksi bernominal besar ({formatCurrency(editAmount)}). Mohon pastikan nominal dan akun sudah sesuai.
                  </span>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Nominal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    value={editAmount || ''}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 border rounded-2xl font-black text-xl focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Keterangan Catatan
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                    }`}
                  >
                    {categories
                      .filter(c => editType === 'transfer' ? true : c.type === editType)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Akun Terkait
                  </label>
                  <select
                    value={editAccount}
                    onChange={(e) => setEditAccount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-2xl focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-100 text-slate-900' : 'bg-[#061530] border-blue-900 text-white'
                    }`}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setParsedIntent(null)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold transition ${
                    isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSaveTransaction}
                  className="px-6 py-2.5 rounded-full bg-[#005CE6] hover:bg-[#004dc2] text-white text-xs font-bold shadow-md flex items-center gap-2 transition transform active:scale-95 touch-manipulation cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Simpan Transaksi
                </button>
              </div>
            </div>
          )}

          {/* Success Save Notice */}
          {isSavedSuccess && (
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-950">Transaksi Berhasil Disimpan!</h4>
              <p className="text-xs text-emerald-700">
                Saldo akun dan grafik laporanmu langsung diperbarui secara otomatis.
              </p>
            </div>
          )}

          {/* PARSED RESULT: 2. VOICE REPORT */}
          {voiceReport && (
            <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
              isLight ? 'bg-blue-50/50 border-blue-200 text-slate-800' : 'bg-[#0c2658] border-blue-900 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isLight ? 'bg-blue-100 text-[#005CE6] border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                }`}>
                  {voiceReport.shortTitle}
                </span>

                <button
                  onClick={() => {
                    if (isSpeaking) {
                      speechSynth.stop();
                    } else {
                      speechSynth.speak(voiceReport.spokenScript, {
                        language: voiceSettings.language,
                        rate: voiceSettings.speechRate,
                        pitch: voiceSettings.speechPitch,
                        voiceURI: voiceSettings.voiceURI,
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition border bg-white text-[#005CE6] border-blue-200 hover:bg-blue-50 shadow-sm touch-manipulation cursor-pointer"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isSpeaking ? 'Hentikan Audio' : 'Dengarkan Ulang'}
                </button>
              </div>

              {/* Spoken Script Box */}
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                isLight ? 'bg-white border-blue-100 text-slate-800' : 'bg-[#061530] border-blue-900 text-slate-200'
              }`}>
                "{voiceReport.spokenScript}"
              </div>

              {/* Metrics Grid */}
              {voiceReport.metrics && voiceReport.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {voiceReport.metrics.map((m: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-2xl border ${
                      isLight ? 'bg-white border-blue-100' : 'bg-[#061530] border-blue-900'
                    }`}>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{m.label}</div>
                      <div className={`text-xs sm:text-sm font-black mt-0.5 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Recommendation */}
              {voiceReport.recommendation && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2 ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }`}>
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Saran Ramah: </span>
                    {voiceReport.recommendation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Suggested Voice Prompts */}
          <div className="space-y-2 pt-2">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <HelpCircle className="w-3.5 h-3.5 text-[#005CE6]" />
              <span>Contoh Perintah Cepat (Klik untuk coba):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_COMMANDS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample)}
                  className={`px-3 py-1.5 border rounded-full text-xs transition flex items-center gap-1 text-left font-medium touch-manipulation cursor-pointer ${
                    isLight 
                      ? 'bg-blue-50/50 hover:bg-blue-100 text-[#005CE6] border-blue-200 shadow-sm' 
                      : 'bg-[#061530] hover:bg-blue-900/50 border-blue-900 text-blue-200'
                  }`}
                >
                  <span>"{sample}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
