import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Heart,
  Droplets,
  Target,
  Sparkles,
  Info,
} from 'lucide-react';
import { DailyLog, ClinicalProfile, GoalType, FertilityAlert } from '../types/billings';
import { SENSATION_LABELS, APPEARANCE_LABELS, STAMP_DETAILS } from '../utils/billingsEngine';

interface FertilityAlertBannerProps {
  todayLog: DailyLog | undefined;
  alert: FertilityAlert;
  profile: ClinicalProfile;
  cycleDayNumber: number;
  onUpdateGoal: (goal: GoalType) => void;
  onOpenLogModal: () => void;
  onOpenAIAnalyzer: () => void;
  onOpenOnboardingIntro?: () => void;
}

export const FertilityAlertBanner: React.FC<FertilityAlertBannerProps> = ({
  todayLog,
  alert,
  profile,
  cycleDayNumber,
  onUpdateGoal,
  onOpenLogModal,
  onOpenAIAnalyzer,
  onOpenOnboardingIntro,
}) => {
  const getStatusIcon = () => {
    switch (alert.status) {
      case 'fertile':
        return <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case 'possibly_fertile':
      case 'interruption_rule3':
        return <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'infertile_luteal':
      case 'infertile_rule2':
        return <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'bleeding_rule1':
        return <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      default:
        return <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusTheme = () => {
    switch (alert.status) {
      case 'fertile':
        return {
          container: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/50 text-rose-950 dark:text-rose-100',
          badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800',
        };
      case 'possibly_fertile':
      case 'interruption_rule3':
        return {
          container: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/50 text-amber-950 dark:text-amber-100',
          badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800',
        };
      case 'infertile_luteal':
      case 'infertile_rule2':
        return {
          container: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-100',
          badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800',
        };
      case 'bleeding_rule1':
        return {
          container: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/50 text-rose-950 dark:text-rose-100',
          badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800',
        };
      default:
        return {
          container: 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100',
          badge: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700',
        };
    }
  };

  const theme = getStatusTheme();

  return (
    <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_12px_rgba(28,61,47,0.04)] overflow-hidden transition-colors">
      {/* Workspace toolbar: Target Goal Segmented Control */}
      <div className="px-4 sm:px-6 py-3 bg-[#FAF8F5] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            <Target className="w-3.5 h-3.5 text-[#1B4332] dark:text-emerald-400" />
            <span>Objetivo do Casal:</span>
          </div>

          {onOpenOnboardingIntro && (
            <button
              onClick={onOpenOnboardingIntro}
              className="text-[11px] text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer sm:hidden"
            >
              <Info className="w-3 h-3" />
              <span>Ver Introdução</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Control - full width responsive */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => onUpdateGoal('avoid_pregnancy')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer ${
                profile.goal === 'avoid_pregnancy'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="sm:hidden">Evitar</span>
              <span className="hidden sm:inline">Evitar Gravidez</span>
            </button>
            <button
              onClick={() => onUpdateGoal('achieve_pregnancy')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer ${
                profile.goal === 'achieve_pregnancy'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="sm:hidden">Conceber</span>
              <span className="hidden sm:inline">Conseguir Gravidez</span>
            </button>
            <button
              onClick={() => onUpdateGoal('health_monitoring')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer ${
                profile.goal === 'health_monitoring'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="sm:hidden">Saúde</span>
              <span className="hidden sm:inline">Monitorar Saúde</span>
            </button>
          </div>

          {onOpenOnboardingIntro && (
            <button
              onClick={onOpenOnboardingIntro}
              title="Apresentação do Método Billings e da saúde da mulher"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-[#1B4332] dark:hover:text-emerald-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Apresentação</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Fertility Advisory Banner */}
      <div className={`p-4 sm:p-6 border-b ${theme.container}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 shadow-xs shrink-0 mt-0.5 border border-stone-200/50 dark:border-stone-700/50">
              {getStatusIcon()}
            </div>
            <div className="min-w-0 flex-1">
              {/* Header Badges & Date */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
                <span className={`px-2.5 py-0.5 font-bold rounded-md text-[11px] ${theme.badge}`}>
                  {alert.title}
                </span>
                <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                  Dia: <strong className="text-stone-800 dark:text-stone-200">D{cycleDayNumber}</strong>
                </span>
                <span className="text-stone-300 dark:text-stone-600 hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-stone-500 dark:text-stone-400 text-[11px] hidden sm:inline">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Recommendation Headline */}
              <h2 className="text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1 mb-2 leading-snug break-words">
                {alert.coitusRecommendation}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl">
                {alert.description}
              </p>

              {/* WOOMB Foundation */}
              <div className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-medium text-stone-700 dark:text-stone-300 bg-white/80 dark:bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-200/70 dark:border-stone-700/70">
                <strong className="text-stone-900 dark:text-stone-100 font-bold">Fundamento MOB:</strong>
                <span>{alert.billingsRuleApplied}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Full width on mobile, right column on desktop) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={onOpenLogModal}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] dark:from-emerald-700 dark:to-emerald-600 dark:hover:from-emerald-650 dark:hover:to-emerald-550 rounded-xl shadow-xs transition-all active:scale-95 text-center cursor-pointer whitespace-nowrap"
            >
              {todayLog ? 'Editar Registro de Hoje' : 'Preencher Registro de Hoje'}
            </button>
            <button
              onClick={onOpenAIAnalyzer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-white/90 dark:bg-stone-850 hover:bg-white dark:hover:bg-stone-800 border border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Analisar Foto de Muco (IA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Observation Summary Strip */}
      <div className="p-4 sm:px-6 sm:py-4 bg-white dark:bg-[#181D1B] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs transition-colors">
        <div className="p-2 sm:p-0 rounded-lg bg-[#FAF8F5] dark:bg-stone-900/50 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 dark:text-stone-500 block text-[11px] mb-0.5">Sensação Vulvar</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm block">
            {todayLog ? SENSATION_LABELS[todayLog.sensation].label : 'Pendente'}
          </span>
          <span className="text-stone-500 dark:text-stone-400 block text-[10px] sm:text-[11px] truncate mt-0.5">
            {todayLog ? SENSATION_LABELS[todayLog.sensation].desc : 'Avaliar à noite'}
          </span>
        </div>

        <div className="p-2 sm:p-0 rounded-lg bg-[#FAF8F5] dark:bg-stone-900/50 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 dark:text-stone-500 block text-[11px] mb-0.5">Aparência do Muco</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm block">
            {todayLog ? APPEARANCE_LABELS[todayLog.appearance].label : 'Pendente'}
          </span>
          <span className="text-stone-500 dark:text-stone-400 block text-[10px] sm:text-[11px] truncate mt-0.5">
            {todayLog ? APPEARANCE_LABELS[todayLog.appearance].desc : 'Visual no papel'}
          </span>
        </div>

        <div className="p-2 sm:p-0 rounded-lg bg-[#FAF8F5] dark:bg-stone-900/50 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 dark:text-stone-500 block text-[11px] mb-0.5">Selo do Dia</span>
          {todayLog ? (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`w-3.5 h-3.5 rounded-xs ${STAMP_DETAILS[todayLog.stamp].bg} border border-stone-300 dark:border-stone-600 inline-block`} />
              <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                {STAMP_DETAILS[todayLog.stamp].name.replace('Selo ', '')}
              </span>
              {todayLog.isPeak && (
                <span className="font-black text-rose-700 dark:text-rose-400 text-xs">Ápice (X)</span>
              )}
            </div>
          ) : (
            <span className="text-stone-500 dark:text-stone-400 font-medium text-xs block">Aguardando</span>
          )}
          <span className="text-stone-500 dark:text-stone-400 block text-[10px] sm:text-[11px] truncate mt-0.5">
            {todayLog ? STAMP_DETAILS[todayLog.stamp].description : 'WOOMB Standard'}
          </span>
        </div>

        <div className="p-2 sm:p-0 rounded-lg bg-[#FAF8F5] dark:bg-stone-900/50 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 dark:text-stone-500 block text-[11px] mb-0.5">Padrão Básico (PBI)</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm capitalize block truncate">
            {profile.diagnosedBipType === 'secura' ? 'Secura Contínua' : 'Muco Inalterado'}
          </span>
          <span className="text-stone-500 dark:text-stone-400 block text-[10px] sm:text-[11px] truncate mt-0.5">
            {profile.instructorName ? `Instrutora: ${profile.instructorName}` : 'Automonitoramento'}
          </span>
        </div>
      </div>
    </div>
  );
};
