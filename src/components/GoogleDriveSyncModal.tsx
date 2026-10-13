import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
  Clock,
  HardDrive,
  LogOut,
  Folder,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Cycle, ClinicalProfile } from '../types/billings';
import {
  initDriveAuth,
  googleDriveSignIn,
  googleDriveLogout,
  uploadBackupToGoogleDrive,
  listBackupsFromGoogleDrive,
  downloadBackupFromGoogleDrive,
  deleteBackupFromGoogleDrive,
  DriveBackupFile,
} from '../utils/googleDriveSync';
import { saveCycles, saveClinicalProfile } from '../utils/storage';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: Cycle[];
  profile: ClinicalProfile;
  onRestoreData: (cycles: Cycle[], profile: ClinicalProfile) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  cycles,
  profile,
  onRestoreData,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [backupNote, setBackupNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [restoringFileId, setRestoringFileId] = useState<string | null>(null);

  // File to delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveBackupFile | null>(null);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initDriveAuth(
        (user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
          loadBackups(token);
        },
        () => {
          setCurrentUser(null);
          setAccessToken(null);
          setBackups([]);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  const loadBackups = async (token: string) => {
    setIsLoadingBackups(true);
    try {
      const files = await listBackupsFromGoogleDrive(token);
      setBackups(files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleDriveSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMessage({ type: 'success', text: `Conectado com sucesso como ${res.user.email}!` });
        await loadBackups(res.accessToken);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Falha ao conectar com o Google Drive.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleDriveLogout();
    setCurrentUser(null);
    setAccessToken(null);
    setBackups([]);
    setStatusMessage({ type: 'success', text: 'Desconectado do Google Drive.' });
  };

  const handleUploadBackup = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const res = await uploadBackupToGoogleDrive(cycles, profile, accessToken, backupNote);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `Backup salvo no Google Drive com sucesso na pasta "Billings Life Backups"!` });
        setBackupNote('');
        await loadBackups(accessToken);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Erro ao enviar backup.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro inesperado ao salvar no Drive.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreBackup = async (file: DriveBackupFile) => {
    if (!accessToken) return;
    const confirmRestore = window.confirm(
      `Deseja restaurar os dados do arquivo "${file.name}"? Isso substituirá os ciclos e prontuário locais atuais por este backup.`
    );
    if (!confirmRestore) return;

    setRestoringFileId(file.id);
    setStatusMessage(null);
    try {
      const res = await downloadBackupFromGoogleDrive(file.id, accessToken);
      if (res.success && res.data) {
        saveCycles(res.data.cycles);
        if (res.data.profile) {
          saveClinicalProfile(res.data.profile);
        }
        onRestoreData(res.data.cycles, res.data.profile || profile);
        setStatusMessage({
          type: 'success',
          text: `Dados restaurados com sucesso! ${res.data.cycles.length} ciclos recuperados.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Falha ao restaurar dados.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao processar restauração.' });
    } finally {
      setRestoringFileId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setDeletingFileId(fileToDelete.id);
    try {
      const success = await deleteBackupFromGoogleDrive(fileToDelete.id, accessToken);
      if (success) {
        setStatusMessage({ type: 'success', text: `Backup "${fileToDelete.name}" excluído do Google Drive.` });
        setBackups((prev) => prev.filter((b) => b.id !== fileToDelete.id));
      } else {
        setStatusMessage({ type: 'error', text: 'Não foi possível excluir o arquivo no Google Drive.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao excluir backup.' });
    } finally {
      setDeletingFileId(null);
      setFileToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center border border-amber-200/60">
              <Cloud className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Sincronização Google Drive
              </h3>
              <p className="text-xs text-stone-500">
                Backup em nuvem segura para prontuário e ciclos MOB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* User Auth Card */}
          {!currentUser ? (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200 mx-auto flex items-center justify-center text-xl">
                ☁️
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-stone-900">
                  Conecte sua Conta Google
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Armazene cópias de segurança automáticas de todos os seus ciclos, anotações de sensações do Método Billings e fotos de muco cervical com segurança em seu Google Drive particular.
                </p>
              </div>

              {/* Official Google Sign-in button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-stone-300 shadow-xs hover:bg-stone-50 text-stone-700 font-medium text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Conectando...' : 'Fazer login com Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-stone-900 block truncate max-w-[200px]">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="text-[11px] text-stone-500 block truncate max-w-[200px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Desconectar do Google"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-500" />
                  <span>Sair</span>
                </button>
              </div>

              {/* Upload New Backup Section */}
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Novo Backup no Google Drive
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Pasta: /Billings Life Backups
                  </span>
                </div>

                <div className="text-xs text-stone-600 leading-relaxed">
                  Salva <strong>{cycles.length} ciclos</strong> registrados e a ficha da paciente ({profile.fullName || 'Sem nome'}) em arquivo JSON criptografado no seu Drive.
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={backupNote}
                    onChange={(e) => setBackupNote(e.target.value)}
                    placeholder="Observação opcional (ex: Após consulta ginecológica)"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 placeholder:text-stone-400"
                  />
                  <button
                    onClick={handleUploadBackup}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando para o Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Salvar Backup Atual no Google Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Backups List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Backups Armazenados no Drive ({backups.length})
                  </span>
                  <button
                    onClick={() => accessToken && loadBackups(accessToken)}
                    disabled={isLoadingBackups}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                </div>

                {isLoadingBackups ? (
                  <div className="p-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
                    <span>Buscando backups em seu Google Drive...</span>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-[#FAF8F5] rounded-xl border border-stone-200/80">
                    Nenhum backup encontrado ainda. Clique em "Salvar Backup Atual" acima para criar sua primeira cópia na nuvem!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {backups.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/90 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-semibold text-stone-900 block truncate">
                              {file.name}
                            </span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <span>
                                {new Date(file.createdTime).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-800 hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>Abrir</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleRestoreBackup(file)}
                            disabled={restoringFileId === file.id}
                            title="Restaurar dados deste backup"
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {restoringFileId === file.id ? 'Restaurando...' : 'Restaurar'}
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            disabled={deletingFileId === file.id}
                            title="Excluir do Google Drive"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <strong>Segurança & Privacidade:</strong> Seus dados de fertilidade e histórico ginecológico são transferidos diretamente entre seu navegador e sua conta Google. Nenhum dado é repassado a servidores externos não autorizados.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#FAF8F5] border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            WOOMB International · Padrão MOB
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Delete (Mandatory by Skill) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-stone-900">
                Excluir Backup do Google Drive?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tem certeza que deseja excluir o arquivo <strong>"{fileToDelete.name}"</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Excluir Arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
