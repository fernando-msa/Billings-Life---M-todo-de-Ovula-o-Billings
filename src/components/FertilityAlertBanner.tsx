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
}

export const FertilityAlertBanner: React.FC<FertilityAlertBannerProps> = ({
  todayLog,
  alert,
  profile,
  cycleDayNumber,
  onUpdateGoal,
  onOpenLogModal,
  onOpenAIAnalyzer,
}) => {
  const getStatusIcon = () => {
    switch (alert.status) {
      case 'fertile':
        return <Heart className="w-6 h-6 text-rose-600" />;
      case 'possibly_fertile':
      case 'interruption_rule3':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      case 'infertile_luteal':
      case 'infertile_rule2':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'bleeding_rule1':
        return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusTheme = () => {
    switch (alert.status) {
      case 'fertile':
        return {
          container: 'bg-rose-50/70 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border border-rose-300',
        };
      case 'possibly_fertile':
      case 'interruption_rule3':
        return {
          container: 'bg-amber-50/70 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border border-amber-300',
        };
      case 'infertile_luteal':
      case 'infertile_rule2':
        return {
          container: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        };
      case 'bleeding_rule1':
        return {
          container: 'bg-rose-50/60 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border border-rose-300',
        };
      default:
        return {
          container: 'bg-slate-50 border-slate-200 text-slate-900',
          badge: 'bg-slate-100 text-slate-800 border border-slate-300',
        };
    }
  };

  const theme = getStatusTheme();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Workspace toolbar: Target Goal Segmented Control */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Target className="w-4 h-4 text-emerald-700" />
          <span>Objetivo do Casal / Paciente:</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            onClick={() => onUpdateGoal('avoid_pregnancy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              profile.goal === 'avoid_pregnancy'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evitar Gravidez (Espaçamento)
          </button>
          <button
            onClick={() => onUpdateGoal('achieve_pregnancy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              profile.goal === 'achieve_pregnancy'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conseguir Gravidez (Concepção)
          </button>
          <button
            onClick={() => onUpdateGoal('health_monitoring')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              profile.goal === 'health_monitoring'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saúde Ginecológica
          </button>
        </div>
      </div>

      {/* Primary Fertility Advisory Banner */}
      <div className={`p-6 border-b ${theme.container}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/80 shadow-xs shrink-0 mt-0.5">
              {getStatusIcon()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${theme.badge}`}>
                  {alert.title}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Dia do Ciclo: <strong className="text-slate-800">D{cycleDayNumber}</strong>
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1 mb-2">
                {alert.coitusRecommendation}
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                {alert.description}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200/60 inline-flex">
                <strong className="text-slate-800 font-semibold">Fundamento MOB:</strong>
                <span>{alert.billingsRuleApplied}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-end">
            <button
              onClick={onOpenLogModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap text-center cursor-pointer"
            >
              {todayLog ? 'Editar Registro de Hoje' : 'Preencher Registro de Hoje'}
            </button>
            <button
              onClick={onOpenAIAnalyzer}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Analisar Foto de Muco (IA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Observation Summary Strip */}
      <div className="px-6 py-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Sensação Vulvar Hoje</span>
          <span className="font-semibold text-slate-800 text-sm">
            {todayLog ? SENSATION_LABELS[todayLog.sensation].label : 'Pendente de registro'}
          </span>
          <span className="text-slate-500 block text-[11px] truncate">
            {todayLog ? SENSATION_LABELS[todayLog.sensation].desc : 'Registrar ao final do dia'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Aparência do Muco</span>
          <span className="font-semibold text-slate-800 text-sm">
            {todayLog ? APPEARANCE_LABELS[todayLog.appearance].label : 'Pendente'}
          </span>
          <span className="text-slate-500 block text-[11px] truncate">
            {todayLog ? APPEARANCE_LABELS[todayLog.appearance].desc : 'Observação no papel'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Selo Billings do Dia</span>
          {todayLog ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-3.5 h-3.5 rounded-sm ${STAMP_DETAILS[todayLog.stamp].bg} border border-slate-300 inline-block`} />
              <span className="font-semibold text-slate-800">
                {STAMP_DETAILS[todayLog.stamp].name}
              </span>
              {todayLog.isPeak && (
                <span className="font-bold text-rose-600 ml-1">Ápice (X)</span>
              )}
              {todayLog.postPeakCount && (
                <span className="font-bold text-amber-600 ml-1">+{todayLog.postPeakCount}</span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 font-medium">Aguardando inserção</span>
          )}
          <span className="text-slate-500 block text-[11px]">
            {todayLog ? STAMP_DETAILS[todayLog.stamp].description : 'Avaliado à noite'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">Padrão Básico (PBI)</span>
          <span className="font-semibold text-slate-800 text-sm capitalize">
            {profile.diagnosedBipType === 'secura' ? 'Secura Contínua' : 'Muco Constante Inalterado'}
          </span>
          <span className="text-slate-500 block text-[11px]">
            Instrutora: {profile.instructorName || 'Não vinculada'}
          </span>
        </div>
      </div>
    </div>
  );
};
