import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Bell,
  Clock,
  Sparkles,
  X,
  Apple,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Cycle, ClinicalProfile, DailyReminderConfig } from '../types/billings';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  syncDailyReminderToGoogleCalendar,
  syncCycleMilestonesToGoogleCalendar,
  downloadUniversalICS,
  getGoogleCalendarWebURL,
} from '../utils/calendarSync';

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: Cycle;
  profile: ClinicalProfile;
  reminderConfig: DailyReminderConfig;
}

export const CalendarIntegrationModal: React.FC<CalendarIntegrationModalProps> = ({
  isOpen,
  onClose,
  cycle,
  profile,
  reminderConfig,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncingReminder, setIsSyncingReminder] = useState(false);
  const [isSyncingMilestones, setIsSyncingMilestones] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      initAuth(
        (user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        },
        () => {
          setCurrentUser(null);
          setAccessToken(null);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignInGoogle = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const { user, token } = await googleSignIn();
      setCurrentUser(user);
      setAccessToken(token);
      setStatusMessage({
        type: 'success',
        text: `Conectado com sucesso como ${user.displayName || user.email}!`,
      });
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setStatusMessage({
        type: 'error',
        text: `Falha na autenticação Google: ${err.message}`,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setCurrentUser(null);
    setAccessToken(null);
    setStatusMessage({
      type: 'success',
      text: 'Desconectado da Conta Google com sucesso.',
    });
  };

  const handleSyncReminder = async () => {
    if (!accessToken) return;

    setIsSyncingReminder(true);
    setStatusMessage(null);
    try {
      const res = await syncDailyReminderToGoogleCalendar(accessToken, reminderConfig);
      setStatusMessage({
        type: 'success',
        text: `Lembrete diário às ${reminderConfig.time} criado com sucesso no seu Google Calendar!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erro ao sincronizar lembrete: ${err.message}`,
      });
    } finally {
      setIsSyncingReminder(false);
    }
  };

  const handleSyncMilestones = async () => {
    if (!accessToken) return;

    const confirmed = window.confirm(
      `Deseja sincronizar os marcos do Ciclo #${cycle.cycleNumber} (início da menstruação, Dia Ápice e fase lútea) no seu Google Calendar?`
    );
    if (!confirmed) return;

    setIsSyncingMilestones(true);
    setStatusMessage(null);
    try {
      const res = await syncCycleMilestonesToGoogleCalendar(accessToken, cycle, profile);
      setStatusMessage({
        type: 'success',
        text: `${res.added} evento(s) do ciclo sincronizado(s) no seu Google Calendar!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erro ao sincronizar ciclo: ${err.message}`,
      });
    } finally {
      setIsSyncingMilestones(false);
    }
  };

  const handleDownloadAppleICS = () => {
    downloadUniversalICS(cycle, profile, reminderConfig);
    setStatusMessage({
      type: 'success',
      text: 'Arquivo .ics baixado! Abra-o no iPhone ou Mac para adicionar ao Apple Calendar com 1 toque.',
    });
  };

  const gcalWebUrl = getGoogleCalendarWebURL(
    '🔔 Lembrete MOB: Observação de Muco Cervical',
    'Lembrete diário do Método Billings. Registre a sensação vulvar antes de deitar no app Billings Life.',
    new Date().toISOString().split('T')[0],
    reminderConfig.time
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-[#181D1B] w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Integração com Calendários (Google & Apple)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sincronize lembretes diários e marcos de fertilidade com seu celular (Android & iOS)
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
          {/* Feedback message banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Google Calendar (Android & Web) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  G
                </div>
                <div>
                  <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    Google Calendar (Android / Web)
                  </strong>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Sincronização direta na nuvem via Google Workspace API
                  </span>
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Conecte sua Conta Google para sincronizar automaticamente os lembretes diários e eventos do ciclo diretamente no aplicativo Google Agenda do seu celular Android.
                </p>

                {/* Official Sign in with Google Button */}
                <button
                  type="button"
                  onClick={handleSignInGoogle}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Conectando com Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Entrar com o Google para Sincronizar</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-850 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>
                    Conectado: <strong>{currentUser.email}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncReminder}
                    disabled={isSyncingReminder}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-emerald-700 hover:bg-stone-800 dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingReminder ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                    <span>Sincronizar Lembrete ({reminderConfig.time})</span>
                  </button>

                  <button
                    onClick={handleSyncMilestones}
                    disabled={isSyncingMilestones}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingMilestones ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    )}
                    <span>Sincronizar Marcos do Ciclo #{cycle.cycleNumber}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Apple Calendar (iOS / iPhone / iPad / Mac) & Universal .ics */}
          <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                
              </div>
              <div>
                <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Apple Calendar (iOS / iPhone / iPad / Mac)
                </strong>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Importação nativa universal via arquivo padrão iCalendar (.ics)
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Gere um arquivo universal com o lembrete noturno diário e os marcos do Método Billings. No iPhone ou iPad, ao baixar o arquivo, o app <strong>Calendário da Apple</strong> se abrirá automaticamente com o botão &ldquo;Adicionar Tudo&rdquo;.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownloadAppleICS}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1B4332] dark:bg-emerald-700 hover:bg-[#2D6A4F] dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar para Apple Calendar (.ics)</span>
              </button>

              <a
                href={gcalWebUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 rounded-xl transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                <span>Adicionar via Web (GCal)</span>
              </a>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B4332] dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Privacidade do Paciente:</strong> Os títulos e descrições dos eventos utilizam termos clínicos respeitosos e discretos. O token de autenticação permanece estritamente na memória volátil da sua sessão.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Compatível com iOS 14+, Android 10+ e navegadores desktop.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
