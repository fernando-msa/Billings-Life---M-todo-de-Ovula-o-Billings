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
    const success = downloadLatestAutoBackup();
    if (success) {
      setRestoreMessage('Arquivo JSON de backup baixado com sucesso!');
      setTimeout(() => setRestoreMessage(null), 3000);
    }
  };

  const handleToggleAutoDownload = () => {
    const next = !autoDownloadSetting;
    setAutoDownloadSetting(next);
    setAutoDownloadFileSetting(next);
  };

  const handleRestoreSnapshot = (id: string) => {
    if (confirm('Deseja restaurar esta versão do histórico? Os dados atuais serão substituídos por este snapshot.')) {
      const result = restoreFromSnapshot(id);
      setRestoreMessage(result.message);
      if (result.success) {
        onDataRestored();
      }
      setTimeout(() => setRestoreMessage(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Backup Automático & Snapshots Persistentes
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Ativo em tempo real
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Garantia de segurança: seu progresso é exportado em JSON localmente a cada registro.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-700 text-white rounded-lg shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-emerald-950 block">
                  Cópia de Segurança JSON Sempre Atualizada
                </strong>
                <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                  Toda alteração de sensação, muco ou selo gera imediatamente um snapshot JSON no armazenamento local, preservando todos os ciclos e o prontuário.
                </p>
                {metadata && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-900">
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Cópia JSON</span>
            </button>
          </div>

          {/* Feedback message */}
          {restoreMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {/* Optional Toggle: Auto file download on browser */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <strong className="text-xs font-bold text-slate-900 block">
                Baixar Arquivo JSON no Computador Automaticamente
              </strong>
              <span className="text-[11px] text-slate-500">
                Se ativado, cada salvamento de dia também aciona o download de um arquivo .json na sua pasta de Downloads.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoDownload}
              className="text-slate-700 hover:text-emerald-700 cursor-pointer ml-3 shrink-0"
            >
              {autoDownloadSetting ? (
                <ToggleRight className="w-7 h-7 text-emerald-700" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-400" />
              )}
            </button>
          </div>

          {/* Rolling Snapshots History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Histórico de Snapshots Recentes (Últimas Modificações)</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {snapshots.length} versões salvas
              </span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Nenhum snapshot automático gerado ainda. Ele será criado no primeiro registro.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {snapshots.map((snap, idx) => (
                  <div
                    key={snap.id}
                    className="p-3.5 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-mono font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-semibold text-slate-900">
                            {snap.formattedTime}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(snap.timestamp).toLocaleDateString('pt-BR')}
                          </span>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-xs">
                              Mais Recente
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
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
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {idx > 0 && (
                        <button
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          title="Restaurar dados para este snapshot"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-700" />
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Seus dados são armazenados exclusivamente no seu dispositivo (Privacidade Total).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
