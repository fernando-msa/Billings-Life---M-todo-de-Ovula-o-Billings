import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Clock,
  Droplets,
  Calendar,
} from 'lucide-react';
import { DailyLog, Cycle, ClinicalProfile } from '../types/billings';

interface DailyBillingsTipCardProps {
  cycleDay: number;
  todayLog?: DailyLog;
  currentCycle?: Cycle;
  profile: ClinicalProfile;
  onOpenNewLog: () => void;
  onAskChatbot: (question: string) => void;
  onOpenGuide: () => void;
}

interface BillingsTipData {
  badge: string;
  badgeColor: 'amber' | 'rose' | 'emerald' | 'purple' | 'blue';
  ruleTitle: string;
  pedagogicalHeadline: string;
  practicalObservation: string;
  scientificRationale: string;
  recommendedAction: string;
  chatbotPrompt: string;
}

export function getBillingsDailyTip(
  cycleDay: number,
  todayLog?: DailyLog,
  currentCycle?: Cycle,
  profile?: ClinicalProfile
): BillingsTipData {
  // Check if today or current state matches Peak or Post-Peak count
  const isPostPeak = todayLog?.postPeakCount !== null && todayLog?.postPeakCount !== undefined;
  const isPeak = todayLog?.isPeak || (currentCycle?.peakDayIndex && cycleDay === currentCycle.peakDayIndex);
  const isPastPeakDays = currentCycle?.peakDayIndex && cycleDay > currentCycle.peakDayIndex + 3;

  // 1. Menstruation phase (Rule 1)
  if (todayLog?.phase === 'menstruation' || todayLog?.stamp === 'red' || (cycleDay <= 4 && (!todayLog || todayLog.bleeding !== 'nenhum'))) {
    return {
      badge: 'Regra 1 dos Primeiros Dias',
      badgeColor: 'rose',
      ruleTitle: 'Sangramento Menstrual & Proteção das Criptas',
      pedagogicalHeadline: 'Por que evitar relações durante o fluxo menstrual?',
      practicalObservation:
        'Não realize toques internos. Observe a sensação vulvar no final do dia. Mesmo se o sangramento for leve ou spotting, registre o selo vermelho.',
      scientificRationale:
        'Em ciclos curtos ou sob variações hormonais, o estímulo folicular estrogênico pode iniciar enquanto ainda há sangue menstrual, mascarando a descida do muco fértil. A Regra 1 garante que você não seja pega de surpresa por uma ovulação precoce.',
      recommendedAction:
        profile?.goal === 'avoid_pregnancy'
          ? 'Evitar relações sexuais nos dias de sangramento menstrual abundante.'
          : 'Aguardar o término do fluxo menstrual para iniciar o rastreamento da evolução do muco.',
      chatbotPrompt: 'Como funciona a Regra 1 do Método Billings durante a menstruação?',
    };
  }

  // 2. Confirmed Peak Day
  if (isPeak) {
    return {
      badge: 'Regra do Ápice (Pico Estrogênico)',
      badgeColor: 'purple',
      ruleTitle: 'Dia Ápice: O Ponto de Virada da Fertilidade',
      pedagogicalHeadline: 'O Ápice NÃO é o dia de maior volume, mas o último de lubricidade!',
      practicalObservation:
        'Procure notar a sensação de escorregamento ao caminhar ou ao passar o papel higiênico. Quando essa sensação sumir repentinamente amanhã, o dia de hoje será identificado retrospectivamente como o Ápice.',
      scientificRationale:
        'O Ápice coincide rigorosamente com o pico pré-ovulatório de estradiol e o disparo do LH. A ovulação ocorre no próprio dia Ápice ou em até 48 horas seguintes. As criptas S e P produzem canais paralelos que transportam espermatozoides em segundos.',
      recommendedAction:
        profile?.goal === 'achieve_pregnancy'
          ? 'Momento de máxima fertilidade! Relações neste dia oferecem a maior probabilidade biológica de concepção.'
          : 'Abstinência estrita requerida caso o objetivo seja adiar ou evitar a gravidez.',
      chatbotPrompt: 'Como confirmar retrospectivamente que ontem foi o verdadeiro Dia Ápice no MOB?',
    };
  }

  // 3. Post-Peak Count (Days 1, 2 and 3 after Peak)
  if (isPostPeak || (currentCycle?.peakDayIndex && cycleDay > currentCycle.peakDayIndex && cycleDay <= currentCycle.peakDayIndex + 3)) {
    const postCount = todayLog?.postPeakCount || (currentCycle?.peakDayIndex ? cycleDay - currentCycle.peakDayIndex : 1);
    return {
      badge: `Contagem Pós-Ápice: Dia ${postCount}`,
      badgeColor: 'amber',
      ruleTitle: 'Regra da Contagem 1-2-3 (Sobrevivência do Óvulo)',
      pedagogicalHeadline: `Você está no ${postCount}º dia pós-ápice: a fertilidade ainda persiste!`,
      practicalObservation:
        'Note que a vulva já secou ou o muco tornou-se espesso e opaco. Essa mudança brusca comprova que a progesterona está subindo e fechando o colo uterino.',
      scientificRationale:
        'O óvulo vive de 12 a 24 horas após a liberação pelo folículo ovariano, e espermatozoides retidos nas criptas cervicais durante o pico estrogênico ainda podem fecundar. Portanto, a WOOMB exige 3 dias inteiros após o Ápice para segurança completa.',
      recommendedAction:
        postCount === 3
          ? 'Último dia de contagem! A partir de amanhã pela manhã inicia-se a infertilidade absoluta da fase lútea.'
          : 'Mantenha a observação noturna. A fertilidade só encerra no 4º dia pós-ápice.',
      chatbotPrompt: 'Por que precisamos contar 3 dias completos após o Ápice antes de considerar infértil?',
    };
  }

  // 4. Luteal Infertile Phase (from Day 4 post-peak onwards)
  if (isPastPeakDays || todayLog?.phase === 'luteal_infertile') {
    return {
      badge: 'Fase Lútea (Infertilidade Absoluta)',
      badgeColor: 'emerald',
      ruleTitle: 'Tampão de Progesterona & Infertilidade Pós-Ovulatória',
      pedagogicalHeadline: 'Infertilidade absoluta dia e noite sem necessidade de alternância!',
      practicalObservation:
        'A sensação vulvar permanece tipicamente seca ou com muco pastoso inalterado. Não há risco de nova ovulação neste mesmo ciclo.',
      scientificRationale:
        'O corpo lúteo produz altos níveis de progesterona, estimulando as criptas cervicais inferiores do tipo G a secretarem um tampão mucoso impenetrável e denso, com imunoglobulinas que barram qualquer espermatozoide.',
      recommendedAction:
        'Relações livres a qualquer hora do dia ou da noite até o início do próximo sangramento menstrual.',
      chatbotPrompt: 'Existe alguma possibilidade biológica de engravidar durante a fase lútea pós-ápice confirmada?',
    };
  }

  // 5. Interruption / Non-ovulatory patch (Rule 3)
  if (todayLog?.phase === 'interruption' || todayLog?.stamp === 'yellow_baby') {
    return {
      badge: 'Regra 3 dos Primeiros Dias',
      badgeColor: 'amber',
      ruleTitle: 'Interrupção do PBI (Alerta de Mudança)',
      pedagogicalHeadline: 'Houve alteração no seu PBI: aguarde a definição do padrão!',
      practicalObservation:
        'Se você sentiu qualquer umidade ou viu muco que não seguiu até o Ápice, deve aguardar o retorno do seu PBI e contar 3 dias de PBI para restabelecer a infertilidade.',
      scientificRationale:
        'Nem todo estímulo estrogênico culmina em ovulação imediata. Às vezes o folículo inicia o recrutamento, mas regride temporariamente. A contagem de 3 dias de PBI assegura que a onda folicular passou sem rompimento ovular.',
      recommendedAction:
        'Aguardar o retorno ao PBI estrito e aplicar a contagem de 3 dias para liberar a noite do 4º dia.',
      chatbotPrompt: 'O que significa uma interrupção de PBI segundo a Regra 3 do Método Billings?',
    };
  }

  // 6. Basic Infertile Pattern (BIP / PBI - Rule 2)
  return {
    badge: 'Regra 2 dos Primeiros Dias (PBI)',
    badgeColor: 'emerald',
    ruleTitle: 'Noites Alternadas no Padrão Básico de Infertilidade',
    pedagogicalHeadline: 'Por que o MOB prescreve relações apenas em noites alternadas?',
    practicalObservation:
      'Durante o dia, fique atenta à sensação nas atividades cotidianas (caminhar, subir escadas). Registre a avaliação no fim do dia antes de dormir.',
    scientificRationale:
      'A mulher precisa estar de pé e ativa durante o dia para que as secreções desçam pela ação da gravidade até a vulva. Relações sexuais só à noite garantem que você verificou o dia inteiro de PBI; o dia seguinte deve ser livre para que o líquido seminal escoe sem ser confundido com muco fértil.',
    recommendedAction:
      profile?.goal === 'avoid_pregnancy'
        ? 'Relações sexuais apenas à noite, em dias alternados de PBI seco ou constante comprovado.'
        : 'Aguarde o início do padrão de muco em evolução para concentrar as relações na fase fértil.',
    chatbotPrompt: 'Como diferenciar o escoamento de líquido seminal do muco fértil da mulher?',
  };
}

export const DailyBillingsTipCard: React.FC<DailyBillingsTipCardProps> = ({
  cycleDay,
  todayLog,
  currentCycle,
  profile,
  onOpenNewLog,
  onAskChatbot,
  onOpenGuide,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tip = getBillingsDailyTip(cycleDay, todayLog, currentCycle, profile);

  const badgeColorClasses = {
    amber: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    rose: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    purple: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800',
    blue: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
  }[tip.badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(28,61,47,0.04)] overflow-hidden transition-all">
      {/* Top Banner Bar with Botanical / Educational Emblem */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/50">
            <Lightbulb className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-serif font-bold text-stone-900">
                Dica Educativa do Dia
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColorClasses}`}>
                {tip.badge}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Dia {cycleDay} do Ciclo Menstrual • Método de Ovulação Billings
            </p>
          </div>
        </div>

        {/* Quick ask chatbot button */}
        <button
          onClick={() => onAskChatbot(tip.chatbotPrompt)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
          title="Tirar dúvida imediata sobre este momento do ciclo"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Consultar IA sobre esta Regra</span>
        </button>
      </div>

      {/* Main Card Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Headline and Topic */}
        <div>
          <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">
            {tip.pedagogicalHeadline}
          </h4>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            {tip.ruleTitle}
          </p>
        </div>

        {/* Highlight Box: Practical Observation */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
            <Droplets className="w-4 h-4 text-[#1B4332]" />
            <span>O Que Observar com Atenção Hoje:</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {tip.practicalObservation}
          </p>
        </div>

        {/* Expandable Scientific Foundation (WOOMB Biological Rationale) */}
        {isExpanded && (
          <div className="space-y-3 pt-1 border-t border-stone-100 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>Fundamento Biológico das Criptas Cervicais (WOOMB):</span>
              </span>
              <p className="text-stone-700 leading-relaxed">
                {tip.scientificRationale}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
              <div className="text-stone-700">
                <strong className="text-stone-900">Recomendação Prática: </strong>
                {tip.recommendedAction}
              </div>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Recolher detalhes científicos' : 'Ver explicação biológica das criptas'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            {!todayLog && (
              <button
                type="button"
                onClick={onOpenNewLog}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Anotar Sensação de Hoje</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGuide}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>Manual WOOMB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
