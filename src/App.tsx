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

      // Check if day of week is enabled
      const isDayActive = reminderConfig.daysOfWeek.includes(currentDayOfWeek);

      // Check if today has already been logged
      const hasLoggedToday = !!todayLog;

      // Check if current time has reached or passed scheduled reminder time
      const isPastOrAtTime = currentTimeStr >= reminderConfig.time;
      const isAlreadyNotifiedToday = reminderConfig.lastNotifiedDate === todayDateStr;

      if (isDayActive && !hasLoggedToday && isPastOrAtTime) {
        setShowReminderDueBanner(true);

        if (!isAlreadyNotifiedToday && currentTimeStr === reminderConfig.time) {
          triggerNotification(
            'Billings Life — Lembrete de Registro Diário',
            reminderConfig.message || 'Hora de registrar no Billings Life: Como foi sua sensação vulvar hoje?',
            reminderConfig.soundEnabled
          );

          const updated = { ...reminderConfig, lastNotifiedDate: todayDateStr };
          setReminderConfig(updated);
          saveReminderConfig(updated);
        }
      } else {
        if (hasLoggedToday) {
          setShowReminderDueBanner(false);
        }
      }
    };

    // Check immediately on load and then every 30 seconds
    checkReminder();
    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [reminderConfig, todayLog, todayDateStr]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewLog={() => handleOpenNewLog()}
        onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
        reminderTime={reminderConfig.time}
        isReminderEnabled={reminderConfig.enabled}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: PAINEL PRINCIPAL & ALERTAS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Scheduled Reminder Due Banner */}
            {showReminderDueBanner && !todayLog && (
              <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">🌙</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Hora de registrar suas observações de hoje ({reminderConfig.time})
                    </h4>
                    <p className="text-xs text-emerald-200">
                      Segundo o Método Billings, o fim do dia é o momento ideal para sintetizar a sensação mais fértil sentida ao longo das atividades cotidianas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenNewLog()}
                    className="px-4 py-2 text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Registrar Agora
                  </button>
                  <button
                    onClick={() => setShowReminderDueBanner(false)}
                    className="px-3 py-2 text-xs font-medium text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Dispensar
                  </button>
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

            {/* Feature Cards Grid (Clinical Continuity & Education) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: AI Chatbot Consultation */}
              <div
                onClick={() => setIsChatbotOpen(true)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Dúvidas com Chatbot Gemini
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Tire dúvidas em tempo real sobre as regras do Método Billings, identificação do PBI e interpretação de sensações.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Abrir Chatbot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Cervical Mucus Image Analysis */}
              <div
                onClick={() => setActiveTab('ai_analysis')}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Laboratório de Muco por IA
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Envie fotografias do muco cervical para classificação visual de transparência, viscosidade e triagem de saúde vaginal.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Acessar Análise</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Export Clinical Report */}
              <div
                onClick={() => setActiveTab('clinical_record')}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Prontuário & Relatório Médico
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Baixe o backup completo em JSON ou imprima o relatório mensal em folha A4 para levar à sua ginecologista ou instrutora.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Gerar Relatório</span>
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

      {/* Floating Chatbot Floating Button (Always accessible) */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={() => setIsChatbotOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer"
          title="Tirar dúvidas sobre o Método Billings com IA"
        >
          <Sparkles className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-bold whitespace-nowrap">Chatbot Billings (Gemini)</span>
        </button>
      </div>

      {/* Floating Chatbot Modal Dialog */}
      {isChatbotOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 no-print">
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

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Billings Life</span>
            <span aria-hidden="true">·</span>
            <span>Método de Ovulação Billings (MOB)</span>
            <span aria-hidden="true">·</span>
            <span>WOOMB International & CENPLAFAM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacidade Local & Criptografia de Dados</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('guide')}
              className="text-emerald-700 hover:underline"
            >
              Manual das 4 Regras
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
