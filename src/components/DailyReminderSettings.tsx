import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { DailyReminderConfig } from '../types/billings';
import {
  saveReminderConfig,
  triggerNotification,
  playReminderChime,
} from '../utils/storage';

interface DailyReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: DailyReminderConfig;
  onUpdateConfig: (updated: DailyReminderConfig) => void;
  onTriggerDailyLog: () => void;
}

const PRESET_TIMES = ['20:30', '21:00', '21:30', '22:00', '22:30'];
const DAYS_OF_WEEK = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

export const DailyReminderSettings: React.FC<DailyReminderSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTriggerDailyLog,
}) => {
  const [formData, setFormData] = useState<DailyReminderConfig>(config);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFormData(config);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionStatus(perm);
        if (perm === 'granted') {
          setTestSuccess('Permissão de notificações concedida com sucesso!');
          setTimeout(() => setTestSuccess(null), 3000);
        }
      } catch (err) {
        console.warn('Notification permission request failed:', err);
      }
    }
  };

  const handleToggleDay = (dayId: number) => {
    setFormData((prev) => {
      const exists = prev.daysOfWeek.includes(dayId);
      const updated = exists
        ? prev.daysOfWeek.filter((d) => d !== dayId)
        : [...prev.daysOfWeek, dayId].sort();
      return { ...prev, daysOfWeek: updated };
    });
  };

  const handleSave = () => {
    saveReminderConfig(formData);
    onUpdateConfig(formData);
    onClose();
  };

  const handleTestNotification = async () => {
    if (formData.soundEnabled) {
      playReminderChime();
    }

    const fired = await triggerNotification(
      'Billings Life — Lembrete de Registro Diário',
      formData.message || 'Hora de registrar no Billings Life: Como foi sua sensação vulvar ao longo das atividades de hoje?',
      formData.soundEnabled
    );

    if (fired) {
      setTestSuccess('Notificação nativa e som de teste emitidos com sucesso!');
    } else {
      setTestSuccess('Som de aviso emitido! (Para notificações fora da aba, ative a permissão do navegador abaixo).');
    }
    setTimeout(() => setTestSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Lembretes Diários de Registro
              </h3>
              <p className="text-xs text-slate-500">
                Configure o horário para registrar as sensações do dia a dia
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Activation Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                Ativar Lembrete Noturno Diário
              </strong>
              <span className="text-xs text-slate-500">
                Emite alerta sonoro e notificação no horário programado
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
            </label>
          </div>

          {/* Time Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Horário do Lembrete
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1">
                {PRESET_TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: t })}
                    className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                      formData.time === t
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>Dica WOOMB:</strong> O horário ideal é antes de dormir (21h às 22h30), após vivenciar todas as atividades e sensações do dia.
              </span>
            </p>
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dias de Notificação
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Selecionar Todos (Recomendado)
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = formData.daysOfWeek.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              {formData.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Sinal Sonoro Suave (Harmônico)
                </strong>
                <span className="text-[11px] text-slate-500">
                  Toca um acorde acústico relaxante no momento do lembrete
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
              className="w-4 h-4 text-emerald-700 rounded-sm cursor-pointer"
            />
          </div>

          {/* Browser Notification API Status & Request */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Permissão da Notification API
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : permissionStatus === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {permissionStatus === 'granted'
                  ? 'Concedida'
                  : permissionStatus === 'denied'
                  ? 'Bloqueada pelo navegador'
                  : 'Pendente de ativação'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Permite que o aplicativo notifique você mesmo se o Billings Life estiver minimizado em outra aba.
            </p>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full mt-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
              >
                Solicitar Permissão de Notificação
              </button>
            )}
          </div>

          {/* Test Notification Button */}
          <div>
            <button
              type="button"
              onClick={handleTestNotification}
              className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-700" />
              <span>Testar Notificação & Som Agora</span>
            </button>

            {testSuccess && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
