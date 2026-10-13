import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  BarChart3,
  Calendar,
  FileText,
  BookOpen,
  Plus,
  ArrowRight,
  ShieldCheck,
  Heart,
  Droplets,
  HelpCircle,
  X,
  Cloud,
} from 'lucide-react';
import {
  Cycle,
  DailyLog,
  ClinicalProfile,
  GoalType,
  MucusAIAnalysis,
  DailyReminderConfig,
} from './types/billings';
import {
  getCycles,
  getClinicalProfile,
  saveClinicalProfile,
  upsertDailyLog,
  startNewCycle,
  getReminderConfig,
  saveReminderConfig,
  triggerNotification,
  isFocusModeActive,
  detectMissingCriticalRecords,
  CriticalMissingRecordResult,
} from './utils/storage';
import { getFertilityAlertForDay } from './utils/billingsEngine';
import { Header, NavTab } from './components/Header';
import { FertilityAlertBanner } from './components/FertilityAlertBanner';
import { StampChart } from './components/StampChart';
import { DailyLogModal } from './components/DailyLogModal';
import { MucusAIAnalyzer } from './components/MucusAIAnalyzer';
import { ClinicalRecordView } from './components/ClinicalRecordView';
import { CycleCalendar } from './components/CycleCalendar';
import { EducationalGuide } from './components/EducationalGuide';
import { BillingsChatbot } from './components/BillingsChatbot';
import { DailyReminderSettings } from './components/DailyReminderSettings';
import { HealthTipsSection } from './components/HealthTipsSection';
import { CalendarIntegrationModal } from './components/CalendarIntegrationModal';
import { AutoBackupManager } from './components/AutoBackupManager';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMoreDrawer } from './components/MobileMoreDrawer';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { OnboardingIntroSlides } from './components/OnboardingIntroSlides';
import { CycleAnalysisDashboard } from './components/CycleAnalysisDashboard';
import { DailyBillingsTipCard } from './components/DailyBillingsTipCard';
import { SunsetThemeModal } from './components/SunsetThemeModal';
import {
  ThemePreference,
  getSavedThemePreference,
  shouldEnableDarkMode,
  applyThemeToDOM,
} from './utils/sunsetTheme';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [profile, setProfile] = useState<ClinicalProfile>(getClinicalProfile());
  const [cycles, setCycles] = useState<Cycle[]>(getCycles());
  const [activeCycleId, setActiveCycleId] = useState<string>(
    cycles[cycles.length - 1]?.id || ''
  );

  // Daily log modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [logModalDate, setLogModalDate] = useState<string | undefined>(undefined);

  // Chatbot floating modal state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotInitialQuestion, setChatbotInitialQuestion] = useState<string | undefined>(undefined);

  // Daily reminder settings modal state
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false);
  const [reminderConfig, setReminderConfig] = useState<DailyReminderConfig>(getReminderConfig());
  const [showReminderDueBanner, setShowReminderDueBanner] = useState(false);
  const [catchUpAlert, setCatchUpAlert] = useState<CriticalMissingRecordResult | null>(null);

  // Calendar integration, Auto backup & Google Drive modal states
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAutoBackupModalOpen, setIsAutoBackupModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  // Mobile More Drawer state
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Sunset Circadian Theme state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => getSavedThemePreference());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => shouldEnableDarkMode(getSavedThemePreference()).isDark);

  // Onboarding Intro Slides state (first-time detection or manual trigger)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    const hasSeen = localStorage.getItem('billings_has_seen_intro_v1');
    return !hasSeen;
  });

  // Preloaded photo for AI analysis tab
  const [preloadedPhotoForAI, setPreloadedPhotoForAI] = useState<string | undefined>(undefined);

  // Active cycle
  const currentCycle = cycles.find((c) => c.id === activeCycleId) || cycles[cycles.length - 1];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Find today's log or most recent log in the current cycle
  const todayLog = currentCycle?.logs.find((l) => l.date === todayDateStr);
  const currentCycleDayNumber = todayLog
    ? todayLog.cycleDay
    : currentCycle
    ? currentCycle.logs.length + 1
    : 1;

  // Calculate current fertility alert
  const fertilityAlert = getFertilityAlertForDay(
    todayLog,
    profile,
    currentCycle?.logs || []
  );

  // Background reminder scheduler
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const isDayActive = reminderConfig.daysOfWeek.includes(currentDayOfWeek);
      const hasLoggedToday = !!todayLog;
      const isPastOrAtTime = currentTimeStr >= reminderConfig.time;
      const isAlreadyNotifiedToday = reminderConfig.lastNotifiedDate === todayDateStr;

      const focusActive = isFocusModeActive(reminderConfig);
      // In focus mode, night logging check-in is permitted only if allowCriticalNightLoggingReminders is enabled
      const isNightReminderPermitted = !focusActive || (reminderConfig.focusMode?.allowCriticalNightLoggingReminders !== false);

      if (isDayActive && !hasLoggedToday && isPastOrAtTime && isNightReminderPermitted) {
        setShowReminderDueBanner(true);

        if (!isAlreadyNotifiedToday && currentTimeStr === reminderConfig.time) {
          triggerNotification(
            'Billings Life — Lembrete de Registro Diário',
            reminderConfig.message || 'Hora de registrar no Billings Life: Como foi sua sensação vulvar hoje?',
            reminderConfig.soundEnabled,
            true // Marked as critical reminder
          );

          const updated = { ...reminderConfig, lastNotifiedDate: todayDateStr };
          setReminderConfig(updated);
          saveReminderConfig(updated);
        }
      } else {
        if (hasLoggedToday || (focusActive && reminderConfig.focusMode?.allowCriticalNightLoggingReminders === false)) {
          setShowReminderDueBanner(false);
        }
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [reminderConfig, todayLog, todayDateStr]);

  // Automatic Catch-Up Reminder Check for Missing Critical Records (> 24h)
  useEffect(() => {
    if (reminderConfig.catchUpReminder?.enabled === false) {
      setCatchUpAlert(null);
      return;
    }

    const checkCatchUp = () => {
      const maxHours = reminderConfig.catchUpReminder?.maxHoursMissing || 24;
      const missingResult = detectMissingCriticalRecords(currentCycle, maxHours);

      if (missingResult) {
        // Respect sub-toggles
        if (
          (missingResult.type === 'peak_mucus' && reminderConfig.catchUpReminder?.notifyMissingPeak === false) ||
          (missingResult.type === 'luteal_end' && reminderConfig.catchUpReminder?.notifyMissingLutealEnd === false)
        ) {
          setCatchUpAlert(null);
          return;
        }

        setCatchUpAlert(missingResult);

        // If not already notified today for this catch-up, trigger native alert/chime
        const isAlreadyNotifiedToday = reminderConfig.catchUpReminder?.lastCatchUpNotifiedDate === todayDateStr;
        if (!isAlreadyNotifiedToday) {
          triggerNotification(
            missingResult.title,
            missingResult.message,
            reminderConfig.soundEnabled,
            true // Marked as critical priority
          );

          const updated: DailyReminderConfig = {
            ...reminderConfig,
            catchUpReminder: {
              ...(reminderConfig.catchUpReminder || {
                enabled: true,
                notifyMissingPeak: true,
                notifyMissingLutealEnd: true,
                maxHoursMissing: 24,
              }),
              lastCatchUpNotifiedDate: todayDateStr,
            },
          };
          setReminderConfig(updated);
          saveReminderConfig(updated);
        }
      } else {
        setCatchUpAlert(null);
      }
    };

    checkCatchUp();
    const interval = setInterval(checkCatchUp, 60000);
    return () => clearInterval(interval);
  }, [reminderConfig, currentCycle, todayDateStr]);

  // Automatic Sunset and Circadian Dark Mode evaluation
  useEffect(() => {
    const evaluateAndApplyTheme = () => {
      const evaluation = shouldEnableDarkMode(themePreference);
      setIsDarkMode(evaluation.isDark);
      applyThemeToDOM(evaluation.isDark);
    };

    evaluateAndApplyTheme();
    // Re-check every 60s as sunset approaches
    const themeTimer = setInterval(evaluateAndApplyTheme, 60000);
    return () => clearInterval(themeTimer);
  }, [themePreference]);

  const handleUpdateGoal = (newGoal: GoalType) => {
    const updated = { ...profile, goal: newGoal, lastUpdated: new Date().toISOString() };
    saveClinicalProfile(updated);
    setProfile(updated);
  };

  const handleOpenNewLog = (targetDate?: string) => {
    setEditingLog(null);
    setLogModalDate(targetDate || todayDateStr);
    setIsLogModalOpen(true);
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setLogModalDate(log.date);
    setIsLogModalOpen(true);
  };

  const handleSaveDailyLog = (
    logData: Omit<DailyLog, 'id' | 'phase' | 'isPeak' | 'postPeakCount'> & { id?: string }
  ) => {
    if (!currentCycle) return;
    try {
      const { cycles: updatedCycles } = upsertDailyLog(currentCycle.id, logData);
      setCycles(updatedCycles);
    } catch (e) {
      console.error('Error saving daily log:', e);
    }
  };

  const handleStartNewCycle = () => {
    if (confirm('Deseja iniciar um novo ciclo menstrual a partir de hoje? O ciclo anterior será finalizado.')) {
      const updated = startNewCycle(todayDateStr);
      setCycles(updated);
      const newCycle = updated[updated.length - 1];
      setActiveCycleId(newCycle.id);
    }
  };

  const handleSavePhotoToToday = (photoUrl: string, analysis: MucusAIAnalysis) => {
    if (!currentCycle) return;
    const targetDate = todayLog ? todayLog.date : todayDateStr;
    const targetDay = todayLog ? todayLog.cycleDay : currentCycleDayNumber;

    handleSaveDailyLog({
      id: todayLog?.id,
      date: targetDate,
      cycleDay: targetDay,
      sensation: todayLog ? todayLog.sensation : 'escorregadia',
      appearance: todayLog ? todayLog.appearance : 'elastico_filante',
      bleeding: todayLog ? todayLog.bleeding : 'nenhum',
      coitus: todayLog ? todayLog.coitus : 'nenhum',
      stamp: todayLog ? todayLog.stamp : 'white_baby',
      notes: todayLog?.notes ? `${todayLog.notes}\n[Foto de muco analisada por IA]` : '[Foto de muco analisada por IA]',
      photoUrl,
      photoAnalysis: analysis,
    });
  };

  const handleOpenAIFromModal = (photoUrl: string) => {
    setIsLogModalOpen(false);
    setPreloadedPhotoForAI(photoUrl);
    setActiveTab('ai_analysis');
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('billings_has_seen_intro_v1', 'true');
    setIsOnboardingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans antialiased selection:bg-[#1B4332] selection:text-white">
      {/* Universal Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewLog={() => handleOpenNewLog()}
        onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
        onOpenCalendarIntegration={() => setIsCalendarModalOpen(true)}
        onOpenGoogleDriveSync={() => setIsGoogleDriveModalOpen(true)}
        reminderTime={reminderConfig.time}
        isReminderEnabled={reminderConfig.enabled}
        isFocusModeActive={isFocusModeActive(reminderConfig)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        isDarkMode={isDarkMode}
        themeMode={themePreference}
      />

      {/* Main Content Viewport with generous bottom padding for mobile tab bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-24 md:pb-8">
        {/* TAB 1: PAINEL PRINCIPAL & ALERTAS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Scheduled Reminder Due Banner */}
            {showReminderDueBanner && !todayLog && (
              <div className="bg-[#1B4332] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center shrink-0 text-xl">
                    🌙
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Hora de registrar suas observações de hoje ({reminderConfig.time})
                      </h4>
                      {isFocusModeActive(reminderConfig) && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                          Lembrete Crítico Preservado (Modo de Foco)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      {isFocusModeActive(reminderConfig)
                        ? 'Notificações secundárias estão silenciadas pelo Modo de Foco para proteger sua privacidade, mantendo apenas este fechamento diário essencial.'
                        : 'Segundo o Método Billings, o fim do dia é o momento ideal para sintetizar a sensação mais fértil sentida ao longo das atividades cotidianas.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenNewLog()}
                    className="px-4 py-2 text-xs font-bold text-[#1B4332] bg-white hover:bg-emerald-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Registrar Agora
                  </button>
                  <button
                    onClick={() => setShowReminderDueBanner(false)}
                    className="px-3 py-2 text-xs font-medium text-emerald-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            )}

            {/* Automatic Catch-Up Reminder Banner for Missing Critical Records (> 24h) */}
            {catchUpAlert && (
              <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-rose-500/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-rose-200 flex items-center justify-center shrink-0 border border-white/20 text-lg">
                      ⚠️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {catchUpAlert.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white uppercase tracking-wider">
                          Pendente há mais de {catchUpAlert.hoursElapsed}h
                        </span>
                      </div>
                      <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                        {catchUpAlert.message}
                      </p>
                      <p className="text-[11px] text-amber-200 mt-1">
                        <strong>Impacto Clínico:</strong> {catchUpAlert.clinicalImportance}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCatchUpAlert(null)}
                    className="text-rose-300 hover:text-white p-1 rounded-lg text-xs cursor-pointer"
                    title="Dispensar alerta de reposição temporariamente"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] text-rose-200 font-mono">
                    Data pendente recomendada: <strong>{new Date(catchUpAlert.missingDate).toLocaleDateString('pt-BR')}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCatchUpAlert(null)}
                      className="px-3 py-1.5 text-xs text-rose-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Depois
                    </button>
                    <button
                      onClick={() => handleOpenNewLog(catchUpAlert.missingDate)}
                      className="px-4 py-1.5 text-xs font-bold text-rose-950 bg-white hover:bg-rose-50 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Repor Registro Pendente Agora</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Advisory Banner for Today */}
            <FertilityAlertBanner
              todayLog={todayLog}
              alert={fertilityAlert}
              profile={profile}
              cycleDayNumber={currentCycleDayNumber}
              onUpdateGoal={handleUpdateGoal}
              onOpenLogModal={() => (todayLog ? handleEditLog(todayLog) : handleOpenNewLog())}
              onOpenAIAnalyzer={() => setActiveTab('ai_analysis')}
              onOpenOnboardingIntro={() => setIsOnboardingOpen(true)}
            />

            {/* Dica Educativa do Dia Baseada no Dia do Ciclo e Regra Atual */}
            <DailyBillingsTipCard
              cycleDay={currentCycleDayNumber}
              todayLog={todayLog}
              currentCycle={currentCycle}
              profile={profile}
              onOpenNewLog={() => handleOpenNewLog()}
              onAskChatbot={(question) => {
                setChatbotInitialQuestion(question);
                setIsChatbotOpen(true);
              }}
              onOpenGuide={() => {
                setActiveTab('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Quick Chart Strip View */}
            <StampChart
              cycles={cycles}
              activeCycleId={activeCycleId}
              profile={profile}
              onSelectCycle={setActiveCycleId}
              onStartNewCycle={handleStartNewCycle}
              onEditLog={handleEditLog}
            />

            {/* Cycle Analysis & Statistics (Recharts Bar Chart) */}
            <CycleAnalysisDashboard
              cycles={cycles}
              profile={profile}
            />

            {/* Feature Cards Grid (Clinical Continuity & Education) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Card 1: AI Chatbot Consultation */}
              <div
                onClick={() => setIsChatbotOpen(true)}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] hover:border-[#1B4332] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-200/60">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors">
                    Dúvidas com Chatbot Gemini
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Tire dúvidas em tempo real sobre as 4 regras do Método Billings, identificação do PBI e interpretação de sensações com a IA.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#1B4332]">
                  <span>Abrir Chatbot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Cervical Mucus Image Analysis */}
              <div
                onClick={() => setActiveTab('ai_analysis')}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] hover:border-[#1B4332] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-200/60">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors">
                    Laboratório de Muco por IA
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Envie fotografias do muco cervical para classificação visual de transparência, viscosidade e triagem de saúde vaginal.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-800">
                  <span>Acessar Análise</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Google Drive & Clinical Report */}
              <div
                onClick={() => setIsGoogleDriveModalOpen(true)}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] hover:border-amber-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-200/60">
                    <Cloud className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                    Nuvem Google Drive & Backup
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Sincronize seus ciclos com seu Google Drive seguro, baixe o prontuário em JSON ou imprima o relatório mensal em PDF.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Sincronizar no Drive</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Health Tips & Hygiene Guidelines Component (WOOMB) */}
            <HealthTipsSection
              onAskChatbotAboutTip={(question) => {
                setChatbotInitialQuestion(question);
                setIsChatbotOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: GRÁFICO DE SELOS */}
        {activeTab === 'charts' && (
          <StampChart
            cycles={cycles}
            activeCycleId={activeCycleId}
            profile={profile}
            onSelectCycle={setActiveCycleId}
            onStartNewCycle={handleStartNewCycle}
            onEditLog={handleEditLog}
          />
        )}

        {/* TAB 3: CALENDÁRIO MENSAL */}
        {activeTab === 'calendar' && (
          <CycleCalendar
            cycles={cycles}
            profile={profile}
            onSelectDate={(d) => handleOpenNewLog(d)}
            onEditLog={handleEditLog}
            onNewLogForDate={(d) => handleOpenNewLog(d)}
          />
        )}

        {/* TAB 4: ANÁLISE IA DE MUCO */}
        {activeTab === 'ai_analysis' && (
          <MucusAIAnalyzer
            profile={profile}
            currentCycleDay={currentCycleDayNumber}
            onSaveToDay={handleSavePhotoToToday}
            preloadedPhotoUrl={preloadedPhotoForAI}
          />
        )}

        {/* TAB 5: PRONTUÁRIO & RELATÓRIO CLÍNICO */}
        {activeTab === 'clinical_record' && (
          <ClinicalRecordView
            profile={profile}
            cycles={cycles}
            onUpdateProfile={setProfile}
            onRefreshData={() => {
              setCycles(getCycles());
              setProfile(getClinicalProfile());
            }}
          />
        )}

        {/* TAB 6: GUIA OFICIAL WOOMB */}
        {activeTab === 'guide' && <EducationalGuide />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewLog={() => handleOpenNewLog()}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
        isMoreMenuOpen={isMoreMenuOpen}
      />

      {/* Mobile More Drawer */}
      <MobileMoreDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
        onOpenCalendarSync={() => setIsCalendarModalOpen(true)}
        onOpenGoogleDriveSync={() => setIsGoogleDriveModalOpen(true)}
        onOpenAutoBackup={() => setIsAutoBackupModalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        reminderTime={reminderConfig.time}
        isFocusModeActive={isFocusModeActive(reminderConfig)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        isDarkMode={isDarkMode}
        themeMode={themePreference}
      />

      {/* Floating Chatbot Button (Positioned comfortably above mobile bottom bar) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 no-print">
        <button
          onClick={() => setIsChatbotOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] text-white rounded-full shadow-lg shadow-[#1B4332]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/20"
          title="Tirar dúvidas sobre o Método Billings com IA"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          <span className="text-xs font-bold whitespace-nowrap">Chatbot Billings (Gemini)</span>
        </button>
      </div>

      {/* Floating Chatbot Modal Dialog */}
      {isChatbotOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <BillingsChatbot
            profile={profile}
            currentCycleDay={currentCycleDayNumber}
            isOpenAsModal={true}
            initialQuestion={chatbotInitialQuestion}
            onCloseModal={() => {
              setIsChatbotOpen(false);
              setChatbotInitialQuestion(undefined);
            }}
          />
        </div>
      )}

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveDailyLog}
        initialLog={editingLog}
        profile={profile}
        cycleDayNumber={currentCycleDayNumber}
        initialDate={logModalDate}
        onOpenAIWithPhoto={handleOpenAIFromModal}
      />

      {/* Daily Reminder Settings Modal */}
      <DailyReminderSettings
        isOpen={isReminderSettingsOpen}
        onClose={() => setIsReminderSettingsOpen(false)}
        config={reminderConfig}
        onUpdateConfig={setReminderConfig}
        onTriggerDailyLog={() => {
          setIsReminderSettingsOpen(false);
          handleOpenNewLog();
        }}
      />

      {/* Calendar Integration Modal (Google & Apple) */}
      {currentCycle && (
        <CalendarIntegrationModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          cycle={currentCycle}
          profile={profile}
          reminderConfig={reminderConfig}
        />
      )}

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        cycles={cycles}
        profile={profile}
        onRestoreData={(newCycles, newProfile) => {
          setCycles(newCycles);
          setProfile(newProfile);
          if (newCycles.length > 0) {
            setActiveCycleId(newCycles[newCycles.length - 1].id);
          }
        }}
      />

      {/* Auto Backup Manager Modal */}
      <AutoBackupManager
        isOpen={isAutoBackupModalOpen}
        onClose={() => setIsAutoBackupModalOpen(false)}
        onDataRestored={() => {
          setCycles(getCycles());
          setProfile(getClinicalProfile());
        }}
      />

      {/* Onboarding Introduction in Slides */}
      <OnboardingIntroSlides
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        initialGoal={profile.goal}
        onSelectInitialGoal={(goal) => {
          handleUpdateGoal(goal);
        }}
      />

      {/* Sunset & Circadian Theme Modal */}
      <SunsetThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={themePreference}
        onThemeChange={(newTheme) => setThemePreference(newTheme)}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-stone-200/90 bg-white py-6 text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-stone-900">Billings Life</span>
            <span aria-hidden="true">·</span>
            <span>Método de Ovulação Billings (MOB)</span>
            <span aria-hidden="true">·</span>
            <span>WOOMB International & CENPLAFAM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[#1B4332] hover:underline cursor-pointer font-medium"
            >
              Ver Apresentação
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('guide')}
              className="text-[#1B4332] hover:underline cursor-pointer font-medium"
            >
              Manual das 4 Regras
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
