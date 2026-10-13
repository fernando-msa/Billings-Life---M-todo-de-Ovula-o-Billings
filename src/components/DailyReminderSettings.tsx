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
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
    }
  };

  const handleToggleDay = (dayId: number) => {
    const current = [...formData.daysOfWeek];
    const exists = current.includes(dayId);
    let updatedDays: number[];
    if (exists) {
      updatedDays = current.filter((d) => d !== dayId);
    } else {
      updatedDays = [...current, dayId].sort();
    }
    setFormData({ ...formData, daysOfWeek: updatedDays });
  };

  const handleTestNotification = () => {
    if (formData.soundEnabled) {
      playReminderChime();
    }
    triggerNotification(
      'Billings Life — Teste de Lembrete',
      `Este é um teste do seu lembrete diário às ${formData.time}. Como foi sua sensação vulvar hoje?`,
      formData.soundEnabled
    );
    setTestSuccess('Notificação e sinal sonoro emitidos com sucesso!');
    setTimeout(() => setTestSuccess(null), 4000);
  };

  const handleSave = () => {
    saveReminderConfig(formData);
    onUpdateConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-[#181D1B] w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Lembretes Diários de Registro
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Configure o horário para registrar as sensações do dia a dia
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
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Activation Toggle */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
            <div>
              <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                Ativar Lembrete Noturno Diário
              </strong>
              <span className="text-xs text-stone-500 dark:text-stone-400">
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
              <div className="w-11 h-6 bg-stone-200 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332] dark:peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Time Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Horário do Lembrete
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 text-base font-mono font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1">
                {PRESET_TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: t })}
                    className={`px-2 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                      formData.time === t
                        ? 'bg-stone-900 dark:bg-emerald-700 text-white border-stone-900 dark:border-emerald-700'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>
                <strong>Dica WOOMB:</strong> O horário ideal é antes de dormir (21h às 22h30), após vivenciar todas as atividades e sensações do dia.
              </span>
            </p>
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Dias de Notificação
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })}
                className="text-[11px] text-[#1B4332] dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
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
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] dark:bg-emerald-700 text-white border-[#1B4332] dark:border-emerald-700 shadow-2xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              {formData.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <div>
                <strong className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Sinal Sonoro Suave (Harmônico)
                </strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Toca um acorde acústico relaxante no momento do lembrete
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
              className="w-4 h-4 text-emerald-700 dark:text-emerald-400 rounded-sm cursor-pointer"
            />
          </div>

          {/* Browser Notification API Status & Request */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Permissão da Notification API
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                    : permissionStatus === 'denied'
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                }`}
              >
                {permissionStatus === 'granted'
                  ? 'Concedida'
                  : permissionStatus === 'denied'
                  ? 'Bloqueada pelo navegador'
                  : 'Pendente de ativação'}
              </span>
            </div>

            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Permite que o aplicativo notifique você mesmo se o Billings Life estiver minimizado em outra aba.
            </p>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full mt-1 py-2 px-3 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-2xs transition-colors cursor-pointer"
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
              className="w-full py-2 px-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Testar Notificação & Som Agora</span>
            </button>

            {testSuccess && (
              <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-850 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1B4332] dark:bg-emerald-700 hover:bg-[#2D6A4F] dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
