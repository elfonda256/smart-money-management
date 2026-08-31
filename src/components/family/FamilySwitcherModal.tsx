'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  Heart,
  Crown,
  Edit2,
  Trash2,
  Save
} from 'lucide-react';
import { useFinancial } from '@/lib/store/FinancialContext';
import { formatCurrency } from '@/lib/utils/formatters';
import { UserProfile } from '@/types';

interface FamilySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySwitcherModal: React.FC<FamilySwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    familyProfiles, 
    activeUserId, 
    switchUser, 
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember, 
    familyCombinedNetWorth,
    theme 
  } = useFinancial();

  const isLight = theme === 'light';

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Anggota Keluarga');
  const [newEmail, setNewEmail] = useState('');
  const [newEmoji, setNewEmoji] = useState('👤');

  // Edit Member Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmoji, setEditEmoji] = useState('👤');

  const emojiOptions = ['👨‍💼', '👩‍💼', '👦', '👧', '🧒', '👴', '👵', '🏡', '💼', '🎓', '👶', '🧑'];

  const startEdit = (member: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUserId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
    setEditEmoji(member.avatarEmoji || '👤');
    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editName.trim()) return;

    updateFamilyMember(editingUserId, {
      name: editName.trim(),
      role: editRole.trim() || 'Anggota Keluarga',
      avatarEmoji: editEmoji,
    });

    setEditingUserId(null);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addFamilyMember({
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@keluarga.id`,
      role: newRole,
      avatarColor: '#005CE6',
      avatarEmoji: newEmoji,
      currency: 'IDR',
    });

    setNewName('');
    setNewEmail('');
    setIsAddingNew(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isLight 
            ? 'bg-white border-blue-100 text-slate-800' 
            : 'bg-gradient-to-b from-[#0c2658] via-[#091e45] to-[#061530] border-blue-900 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-[#061530]/60 border-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005CE6] flex items-center justify-center shadow-md text-white font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                <span>Manajemen Anggota Keluarga</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${
                  isLight ? 'bg-blue-100 text-[#005CE6] border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                }`}>
                  {familyProfiles.length} Akun
                </span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Ganti profil aktif atau edit nama & peran setiap anggota
              </p>
            </div>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Combined Family Net Worth Banner (Mandiri Royal Cobalt Blue) */}
          <div className="p-6 rounded-3xl bg-[#005CE6] text-white relative overflow-hidden shadow-lg shadow-blue-700/20">
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#0084FF] opacity-80 blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/40 bg-white/15 backdrop-blur-sm">
                  TOTAL SALDO GABUNGAN KELUARGA
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-white">
                  {formatCurrency(familyCombinedNetWorth)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Edit Form Popup (Inline) */}
          {editingUserId && (
            <form onSubmit={handleSaveEdit} className={`p-5 rounded-3xl border-2 space-y-3.5 animate-in zoom-in-95 duration-200 ${
              isLight 
                ? 'bg-blue-50/60 border-blue-300 shadow-md' 
                : 'bg-[#061530] border-blue-700 shadow-2xl'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#005CE6] dark:text-blue-400" />
                  <h4 className={`text-sm font-bold ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                    Edit Nama & Peran Profil
                  </h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEditingUserId(null)} 
                  className={`text-xs ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nama Lengkap / Panggilan
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Contoh: Agus Sugawi, Merys Novita, Elfano"
                    className={`w-full px-3.5 py-2 border rounded-2xl text-xs font-bold focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-[#0c2658] border-blue-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Peran / Keterangan
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Contoh: Ayah / Kepala Keluarga, Ibu, Anak 1"
                    className={`w-full px-3.5 py-2 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-[#0c2658] border-blue-900 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Pilih Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditEmoji(em)}
                      className={`w-9 h-9 rounded-2xl text-lg flex items-center justify-center transition ${
                        editEmoji === em 
                          ? 'bg-[#005CE6] border-2 border-white shadow-md text-white' 
                          : isLight ? 'bg-white hover:bg-blue-50 border border-blue-100' : 'bg-[#0c2658] hover:bg-blue-900'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex items-center justify-between pt-2 border-t ${
                isLight ? 'border-blue-100' : 'border-blue-900'
              }`}>
                {familyProfiles.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus profil ${editName}? Seluruh data mutasinya akan terhapus.`)) {
                        deleteFamilyMember(editingUserId);
                        setEditingUserId(null);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Profil
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className={`px-3.5 py-1.5 rounded-full text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-full text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Family Profiles List */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between text-xs font-bold ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span>DAFTAR PROFIL ANGGOTA KELUARGA:</span>
              <button
                onClick={() => {
                  setIsAddingNew(true);
                  setEditingUserId(null);
                }}
                className="flex items-center gap-1 font-bold text-[#005CE6] hover:text-[#004dc2]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Anggota Baru</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {familyProfiles.map((member) => {
                const isActive = member.id === activeUserId;
                return (
                  <div
                    key={member.id}
                    className={`w-full p-4 rounded-3xl border text-left flex items-center justify-between gap-3 transition-all duration-200 ${
                      isActive
                        ? isLight
                          ? 'bg-blue-50/70 border-[#005CE6] shadow-sm'
                          : 'bg-[#0c2658] border-[#005CE6] shadow-lg'
                        : isLight
                          ? 'bg-white hover:bg-blue-50/30 border-blue-100'
                          : 'bg-[#061530]/60 hover:bg-[#061530] border-blue-900/60'
                    }`}
                  >
                    <button
                      onClick={() => {
                        switchUser(member.id);
                        onClose();
                      }}
                      type="button"
                      className="flex items-center gap-3.5 min-w-0 flex-1 text-left touch-manipulation cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                        isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530] border-blue-900'
                      }`}>
                        {member.avatarEmoji || '👤'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {member.name}
                          </h4>
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#005CE6] text-white font-bold text-[10px]">
                              AKTIF
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 ${
                          isLight ? 'text-[#005CE6]' : 'text-blue-300'
                        }`}>
                          {member.role}
                        </p>
                        <p className={`text-[11px] truncate ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {member.email}
                        </p>
                      </div>
                    </button>

                    <div className="shrink-0 flex items-center gap-2">
                      {/* Edit Name Button */}
                      <button
                        onClick={(e) => startEdit(member, e)}
                        className={`p-2 rounded-full transition touch-manipulation cursor-pointer ${
                          isLight 
                            ? 'text-slate-400 hover:text-[#005CE6] hover:bg-blue-50' 
                            : 'text-slate-400 hover:text-blue-400 hover:bg-blue-900/40'
                        }`}
                        title="Ganti Nama / Peran"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Select Profile Button */}
                      <button
                        onClick={() => {
                          switchUser(member.id);
                          onClose();
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition touch-manipulation cursor-pointer ${
                          isActive 
                            ? 'bg-[#005CE6] text-white font-bold shadow-sm' 
                            : isLight ? 'bg-slate-100 text-slate-600 hover:bg-blue-50' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isActive ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Member Form */}
          {isAddingNew && (
            <form onSubmit={handleAddMember} className={`p-4 rounded-3xl border space-y-3.5 animate-in slide-in-from-bottom-2 duration-200 ${
              isLight ? 'bg-slate-50 border-blue-100' : 'bg-[#061530] border-blue-900'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#003B99]' : 'text-white'}`}>
                  Tambah Anggota Keluarga
                </h4>
                <button type="button" onClick={() => setIsAddingNew(false)} className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kakek / Nenek / Tante / Adik"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-[#0c2658] border-blue-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Peran / Keterangan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Anak Ketiga / Usaha Bersama"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-2xl text-xs focus:outline-none focus:border-[#005CE6] ${
                      isLight ? 'bg-white border-blue-200 text-slate-900' : 'bg-[#0c2658] border-blue-900 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Pilih Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEmoji(em)}
                      className={`w-9 h-9 rounded-2xl text-lg flex items-center justify-center transition ${
                        newEmoji === em 
                          ? 'bg-[#005CE6] border-2 border-white shadow-md text-white' 
                          : isLight ? 'bg-white border border-blue-100' : 'bg-[#0c2658] hover:bg-blue-900'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-full text-xs shadow-md"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
