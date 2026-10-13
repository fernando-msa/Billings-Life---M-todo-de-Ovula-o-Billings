import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  History,
  RotateCcw,
  CheckCircle2,
  FileCode,
  HardDrive,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  X,
} from 'lucide-react';
import { AutoBackupMetadata, AutoBackupSnapshot } from '../types/billings';
import {
  getAutoBackupMetadata,
  downloadLatestAutoBackup,
  getAutoBackupSnapshots,
  restoreFromSnapshot,
  setAutoDownloadFileSetting,
} from '../utils/storage';

interface AutoBackupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const AutoBackupManager: React.FC<AutoBackupManagerProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [metadata, setMetadata] = useState<AutoBackupMetadata | null>(getAutoBackupMetadata());
  const [snapshots, setSnapshots] = useState<AutoBackupSnapshot[]>(getAutoBackupSnapshots());
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [autoDownloadSetting, setAutoDownloadSetting] = useState(
    metadata?.autoDownloadFileEnabled ?? false
  );

  useEffect(() => {
    if (isOpen) {
      const meta = getAutoBackupMetadata();
      setMetadata(meta);
      setSnapshots(getAutoBackupSnapshots());
      setAutoDownloadSetting(meta?.autoDownloadFileEnabled ?? false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadNow = () => {
    downloadLatestAutoBackup();
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    const success = restoreFromSnapshot(snapshotId);
    if (success) {
      setRestoreMessage('Dados restaurados com sucesso para este ponto de backup!');
      onDataRestored();
      setMetadata(getAutoBackupMetadata());
      setSnapshots(getAutoBackupSnapshots());
      setTimeout(() => setRestoreMessage(null), 4000);
    }
  };

  const handleToggleAutoDownload = () => {
    const nextVal = !autoDownloadSetting;
    setAutoDownloadSetting(nextVal);
    setAutoDownloadFileSetting(nextVal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-[#181D1B] w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Snapshots Locais & Backup JSON
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Segurança contínua e exportação automática dos ciclos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#1B4332] dark:bg-emerald-700 text-white rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-emerald-950 dark:text-emerald-200 block">
                  Cópia de Segurança JSON Sempre Atualizada
                </strong>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mt-0.5">
                  Toda alteração de sensação, muco ou selo gera imediatamente um snapshot JSON no armazenamento local, preservando todos os ciclos e o prontuário.
                </p>
                {metadata && (
                  <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-emerald-900 dark:text-emerald-300">
                    <span>
                      Última cópia: <strong>{metadata.formattedTime}</strong>
                    </span>
                    <span>·</span>
                    <span>{metadata.cyclesCount} ciclo(s)</span>
                    <span>·</span>
                    <span>{metadata.totalLogsCount} registros</span>
                    <span>·</span>
                    <span>{(metadata.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownloadNow}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B4332] dark:bg-emerald-700 hover:bg-[#2D6A4F] dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Cópia JSON</span>
            </button>
          </div>

          {/* Feedback message */}
          {restoreMessage && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {/* Optional Toggle: Auto file download on browser */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
            <div>
              <strong className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Baixar Arquivo JSON no Computador Automaticamente
              </strong>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Se ativado, cada salvamento de dia também aciona o download de um arquivo .json na sua pasta de Downloads.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoDownload}
              className="text-stone-700 dark:text-stone-300 hover:text-[#1B4332] dark:hover:text-emerald-400 cursor-pointer ml-3 shrink-0"
            >
              {autoDownloadSetting ? (
                <ToggleRight className="w-7 h-7 text-[#1B4332] dark:text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-stone-400" />
              )}
            </button>
          </div>

          {/* Rolling Snapshots History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-stone-500" />
                <span>Histórico de Snapshots Recentes (Últimas Modificações)</span>
              </h4>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                {snapshots.length} versões salvas
              </span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-4 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
                Nenhum snapshot automático gerado ainda. Ele será criado no primeiro registro.
              </div>
            ) : (
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                {snapshots.map((snap, idx) => (
                  <div
                    key={snap.id}
                    className="p-3.5 flex items-center justify-between gap-4 bg-white dark:bg-[#181D1B] hover:bg-stone-50/80 dark:hover:bg-stone-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs font-mono font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {snap.formattedTime}
                          </strong>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                            {new Date(snap.timestamp).toLocaleDateString('pt-BR')}
                          </span>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xs">
                              Mais Recente
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                          {snap.cyclesCount} ciclo(s) · {snap.totalLogsCount} registros diários
                          {snap.lastModifiedLogDate && ` · Modificado dia ${snap.lastModifiedLogDate}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const blob = new Blob([snap.jsonContent], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `snapshot_billings_${snap.timestamp.split('T')[0]}_${snap.id}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        title="Baixar este snapshot"
                        className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {idx > 0 && (
                        <button
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          title="Restaurar dados para este snapshot"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                          <span>Restaurar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            Seus dados são armazenados exclusivamente no seu dispositivo (Privacidade Total).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
