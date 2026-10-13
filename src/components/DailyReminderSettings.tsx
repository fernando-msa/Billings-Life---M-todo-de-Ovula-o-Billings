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
  Shield,
  EyeOff,
  Moon,
  HeartHandshake,
  RotateCcw,
  History,
  AlertTriangle,
} from 'lucide-react';
import { DailyReminderConfig, FocusModeConfig, CatchUpReminderConfig } from '../types/billings';
import {
  saveReminderConfig,
  triggerNotification,
  playReminderChime,
  isFocusModeActive,
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

  const currentFocusMode: FocusModeConfig = formData.focusMode || {
    enabled: false,
    durationMode: 'manual',
    silenceSounds: true,
    allowCriticalPeakReminders: true,
    allowCriticalNightLoggingReminders: true,
    allowInfectionAlerts: true,
  };

  const currentCatchUp: CatchUpReminderConfig = formData.catchUpReminder || {
    enabled: true,
    notifyMissingPeak: true,
    notifyMissingLutealEnd: true,
    maxHoursMissing: 24,
  };

  const handleToggleFocusMode = () => {
    const nextEnabled = !currentFocusMode.enabled;
    const updatedFocus: FocusModeConfig = {
      ...currentFocusMode,
      enabled: nextEnabled,
      activatedAt: nextEnabled ? new Date().toISOString() : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      focusMode: updatedFocus,
    }));
  };

  const handleUpdateFocusMode = (updates: Partial<FocusModeConfig>) => {
    setFormData((prev) => ({
      ...prev,
      focusMode: {
        ...(prev.focusMode || currentFocusMode),
        ...updates,
      },
    }));
  };

  const handleToggleCatchUp = () => {
    const nextEnabled = !currentCatchUp.enabled;
    setFormData((prev) => ({
      ...prev,
      catchUpReminder: {
        ...currentCatchUp,
        enabled: nextEnabled,
      },
    }));
  };

  const handleUpdateCatchUp = (updates: Partial<CatchUpReminderConfig>) => {
    setFormData((prev) => ({
      ...prev,
      catchUpReminder: {
        ...(prev.catchUpReminder || currentCatchUp),
        ...updates,
      },
    }));
  };

  const handleSave = () => {
    saveReminderConfig(formData);
    onUpdateConfig(formData);
    onClose();
  };

  const handleTestNotification = async () => {
    if (formData.soundEnabled && (!formData.focusMode?.enabled || !formData.focusMode?.silenceSounds)) {
      playReminderChime();
    }

    const isFocus = isFocusModeActive(formData);
    const fired = await triggerNotification(
      'Billings Life — Lembrete de Registro Diário',
      formData.message || 'Hora de registrar no Billings Life: Como foi sua sensação vulvar ao longo das atividades de hoje?',
      formData.soundEnabled,
      true // test is critical so user can verify sound/banner
    );

    if (fired) {
      setTestSuccess(
        isFocus
          ? 'Notificação emitida! [Modo de Foco Ativo: apenas lembretes críticos são emitidos]'
          : 'Notificação nativa e som de teste emitidos com sucesso!'
      );
    } else {
      setTestSuccess('Som de aviso emitido! (Para notificações fora da aba, ative a permissão do navegador abaixo).');
    }
    setTimeout(() => setTestSuccess(null), 4000);
  };

  const handleTestCatchUpNotification = async () => {
    if (formData.soundEnabled) {
      playReminderChime();
    }

    const fired = await triggerNotification(
      'Billings Life — Reposição Crítica (> 24h)',
      'Você teve muco fértil recentemente e seu registro está pendente há mais de 24h. Registre para confirmar se o Ápice ocorreu ou se a contagem 1-2-3 começou!',
      formData.soundEnabled,
      true // Always critical!
    );

    if (fired) {
      setTestSuccess('Alerta de reposição (> 24h) emitido com sucesso!');
    } else {
      setTestSuccess('Som do alerta de reposição emitido com sucesso!');
    }
    setTimeout(() => setTestSuccess(null), 4000);
  };

  const isFocusActiveNow = isFocusModeActive(formData);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1B4332] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Lembretes & Reposição de Registros
              </h3>
              <p className="text-xs text-stone-500">
                Notificações diárias, modo de foco e alertas para registros críticos faltantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: LEMBRETES DE REPOSIÇÃO AUTOMÁTICOS (REGISTROS FALTANTES > 24H) */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            currentCatchUp.enabled
              ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300'
              : 'bg-[#FAF8F5] border-stone-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  currentCatchUp.enabled
                    ? 'bg-rose-200/80 text-rose-900'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-serif font-bold text-stone-900">
                      Lembretes de Reposição Automáticos
                    </span>
                    {currentCatchUp.enabled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-950 uppercase tracking-wider">
                        Ativo (&gt; {currentCatchUp.maxHoursMissing || 24}h)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Notifica automaticamente caso um registro crucial de <strong>pico de muco</strong> ou <strong>fim de fase lútea</strong> esteja faltando por mais de {currentCatchUp.maxHoursMissing || 24} horas, evitando perda da janela de fertilidade.
                  </p>
                </div>
              </div>

              {/* Main Catch-Up Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={currentCatchUp.enabled}
                  onChange={handleToggleCatchUp}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-700"></div>
              </label>
            </div>

            {/* Expanded Catch-Up Options when Enabled */}
            {currentCatchUp.enabled && (
              <div className="mt-4 pt-4 border-t border-rose-200/80 space-y-3.5 text-xs">
                {/* Interval / Max Hours Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-950 mb-1.5">
                    Tempo limite sem registro para disparar o alerta:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { hours: 24, label: '24 horas (Recomendado WOOMB)' },
                      { hours: 36, label: '36 horas' },
                      { hours: 48, label: '48 horas' },
                    ].map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => handleUpdateCatchUp({ maxHoursMissing: opt.hours })}
                        className={`py-1.5 px-2 rounded-lg font-medium text-center text-xs transition-colors cursor-pointer ${
                          (currentCatchUp.maxHoursMissing || 24) === opt.hours
                            ? 'bg-rose-900 text-white font-bold'
                            : 'bg-white border border-rose-200 hover:bg-rose-100/60 text-stone-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-toggles: Critical Situations Monitored */}
                <div className="bg-white/90 p-3 rounded-xl border border-rose-200/90 space-y-2">
                  <span className="text-[11px] font-bold text-rose-950 block">
                    ⚠️ Momentos Críticos Monitorados para Reposição:
                  </span>

                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCatchUp.notifyMissingPeak}
                        onChange={(e) => handleUpdateCatchUp({ notifyMissingPeak: e.target.checked })}
                        className="w-4 h-4 text-rose-700 rounded cursor-pointer mt-0.5"
                      />
                      <div>
                        <strong className="text-xs text-stone-900 block">
                          Pico de Muco & Contagem 1-2-3 do Ápice Faltante
                        </strong>
                        <span className="text-[11px] text-stone-600 block mt-0.5 leading-snug">
                          Avisa se você registrou muco fértil (úmido, escorregadio, clara de ovo) recentemente e parou de registrar por mais de 24h, impedindo a confirmação retrospectiva do Ápice.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-rose-100">
                      <input
                        type="checkbox"
                        checked={currentCatchUp.notifyMissingLutealEnd}
                        onChange={(e) => handleUpdateCatchUp({ notifyMissingLutealEnd: e.target.checked })}
                        className="w-4 h-4 text-rose-700 rounded cursor-pointer mt-0.5"
                      />
                      <div>
                        <strong className="text-xs text-stone-900 block">
                          Fim da Fase Lútea / Virada do Ciclo Faltante
                        </strong>
                        <span className="text-[11px] text-stone-600 block mt-0.5 leading-snug">
                          Avisa se a fase lútea ultrapassou o 11º dia pós-ápice sem anotação do início da menstruação (novo ciclo) ou teste de gravidez.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Test Catch-up button */}
                <button
                  type="button"
                  onClick={handleTestCatchUpNotification}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-rose-700" />
                  <span>Simular Alerta de Reposição Crítica</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: MODO DE FOCO (SENSITIVITY & PRIVACY) */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isFocusActiveNow
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
              : 'bg-[#FAF8F5] border-stone-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isFocusActiveNow
                    ? 'bg-amber-200/80 text-amber-900'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-serif font-bold text-stone-900">
                      Modo de Foco (Alta Sensibilidade)
                    </span>
                    {isFocusActiveNow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 uppercase tracking-wider">
                        Ativo Agora
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Desativa temporariamente notificações gerais e sons durante momentos de sensibilidade, preservando apenas lembretes críticos de saúde.
                  </p>
                </div>
              </div>

              {/* Focus Mode Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isFocusActiveNow}
                  onChange={handleToggleFocusMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
              </label>
            </div>

            {/* Expanded Focus Mode Settings */}
            {isFocusActiveNow && (
              <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                    Duração do Modo de Foco:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: '1h', label: '1 hora' },
                      { id: '8h', label: '8 horas' },
                      { id: '24h', label: '24 horas' },
                      { id: 'manual', label: 'Até desligar' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateFocusMode({ durationMode: opt.id as any })}
                        className={`py-1.5 px-2 rounded-lg font-medium text-center text-xs transition-colors cursor-pointer ${
                          currentFocusMode.durationMode === opt.id
                            ? 'bg-amber-900 text-white font-bold'
                            : 'bg-white border border-amber-200 hover:bg-amber-100/60 text-stone-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between p-2.5 bg-white/70 rounded-xl border border-amber-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-amber-800" />
                    <span className="text-xs font-semibold text-stone-800">
                      Silenciar Sons e Chimes Durante o Foco
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentFocusMode.silenceSounds}
                    onChange={(e) => handleUpdateFocusMode({ silenceSounds: e.target.checked })}
                    className="w-4 h-4 text-[#1B4332] rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* SECTION 3: CONFIGURAÇÃO DO LEMBRETE DIÁRIO NOTURNO */}
          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-stone-200">
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                Ativar Lembrete Noturno de Registro
              </span>
              <span className="text-[11px] text-stone-500">
                Recomendado pela WOOMB para avaliar a sensação antes de dormir
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
            </label>
          </div>

          {/* Horário do Lembrete */}
          {formData.enabled && (
            <div className="space-y-3 p-4 bg-white rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1B4332]" />
                  <span>Horário Noturno de Notificação</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="px-3 py-1 text-xs font-mono font-bold bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 mr-1">Sugestões:</span>
                {PRESET_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({ ...formData, time })}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors cursor-pointer ${
                      formData.time === time
                        ? 'bg-[#1B4332] text-white font-bold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {/* Dias da Semana */}
              <div className="pt-2 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-600 block mb-2">
                  Dias ativos da semana:
                </label>
                <div className="flex items-center justify-between gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.daysOfWeek.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(day.id)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-500'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sound Notification Option */}
          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-200 text-stone-700 rounded-lg">
                {formData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Som Harmônico Suave (528 Hz)
                </span>
                <span className="text-[11px] text-stone-500">
                  Acorde acústico sereno que não assusta nem incomoda
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1B4332] rounded cursor-pointer"
            />
          </div>

          {/* Browser Notification API Status & Request */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
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

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Permite que o aplicativo notifique você mesmo se o Billings Life estiver minimizado em outra aba.
            </p>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full mt-1 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 shadow-2xs transition-colors cursor-pointer"
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
              className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Testar Notificação Diária Noturna</span>
            </button>

            {testSuccess && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
