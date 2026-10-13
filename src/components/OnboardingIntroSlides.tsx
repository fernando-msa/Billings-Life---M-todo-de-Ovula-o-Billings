import React, { useState } from 'react';
import {
  Heart,
  Target,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Droplets,
  CheckCircle2,
  Calendar,
  Cloud,
  ArrowRight,
} from 'lucide-react';
import { GoalType } from '../types/billings';

interface OnboardingIntroSlidesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInitialGoal?: (goal: GoalType) => void;
  initialGoal?: GoalType;
}

export const OnboardingIntroSlides: React.FC<OnboardingIntroSlidesProps> = ({
  isOpen,
  onClose,
  onSelectInitialGoal,
  initialGoal = 'avoid_pregnancy',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(initialGoal);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'Ciência & Autoconhecimento',
      title: 'Bem-vinda ao Billings Life',
      subtitle: 'Uma jornada de respeito e sintonia com os ritmos naturais do seu corpo',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center shadow-lg shadow-[#1B4332]/25 shrink-0">
          <svg className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.5 7.5 5 12 5 15a7 7 0 0 0 14 0c0-3-1.5-7.5-7-13z" />
            <path d="M12 9c-1.5 2-2 3.5-2 5a3 3 0 0 0 6 0c0-1.5-.5-3-2-5z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3.5 text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
          <p>
            O <strong>Método de Ovulação Billings (MOB)</strong> é um sistema científico desenvolvido pelos médicos australianos Drs. John e Evelyn Billings, validado pela Organização Mundial da Saúde (OMS) e padronizado mundialmente pela <strong>WOOMB International</strong>.
          </p>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 space-y-1.5">
            <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
              Por que tantas mulheres escolhem o Método Billings?
            </div>
            <ul className="space-y-1.5 text-stone-600 dark:text-stone-300 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>100% Natural e Fisiológico:</strong> Sem hormônios sintéticos, sem efeitos colaterais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>Altíssima Eficácia:</strong> Superior a 99% quando seguido corretamente com as 4 Regras oficiais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>Universal:</strong> Funciona em ciclos regulares, irregulares, pós-parto, amamentação e perimenopausa.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      badge: 'Qual é o seu objetivo?',
      title: 'Versátil para todas as fases',
      subtitle: 'O Billings não é só contracepção: é um mapa de saúde para a sua vida reprodutiva',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center border border-amber-300/60 dark:border-amber-800 shrink-0">
          <Target className="w-9 h-9 sm:w-11 sm:h-11 text-amber-700 dark:text-amber-400" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Selecione qual é o seu objetivo inicial com o aplicativo (você poderá alterar a qualquer momento):
          </p>

          <div className="space-y-2">
            <div
              onClick={() => setSelectedGoal('avoid_pregnancy')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedGoal === 'avoid_pregnancy'
                  ? 'border-[#1B4332] dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-[#1B4332] dark:ring-emerald-500'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850'
              }`}
            >
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#1B4332] dark:text-emerald-400 font-bold shrink-0 mt-0.5">
                🛡️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-bold">Espaçar ou Evitar Gravidez</strong>
                  {selectedGoal === 'avoid_pregnancy' && (
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Identifique os dias inférteis e siga as regras oficiais com segurança para planejamento familiar sem fármacos.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedGoal('achieve_pregnancy')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedGoal === 'achieve_pregnancy'
                  ? 'border-[#1B4332] dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-[#1B4332] dark:ring-emerald-500'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850'
              }`}
            >
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 font-bold shrink-0 mt-0.5">
                👶
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-bold">Conseguir Gravidez (Conceber)</strong>
                  {selectedGoal === 'achieve_pregnancy' && (
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Descubra sua janela fértil máxima e o Dia Ápice para otimizar suas chances de concepção de forma consciente.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedGoal('health_monitoring')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedGoal === 'health_monitoring'
                  ? 'border-[#1B4332] dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-[#1B4332] dark:ring-emerald-500'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850'
              }`}
            >
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 font-bold shrink-0 mt-0.5">
                🩺
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-bold">Monitorar a Saúde Hormonal</strong>
                  {selectedGoal === 'health_monitoring' && (
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Acompanhe seus níveis de estrogênio e progesterona, detecte fases lúteas curtas ou alterações ginecológicas precocemente.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'A Regra de Ouro',
      title: 'Sentir sem Tocar',
      subtitle: 'O segredo mais importante de todo o Método de Ovulação Billings',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-300/60 dark:border-emerald-800 shrink-0">
          <Droplets className="w-9 h-9 sm:w-11 sm:h-11 text-[#1B4332] dark:text-emerald-400" />
        </div>
      ),
      content: (
        <div className="space-y-3.5 text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Diferente de outros métodos que exigem toques internos desconfortáveis, o Método Billings ensina a prestar atenção à <strong>sensação na vulva (área externa)</strong> durante suas atividades cotidianas normais.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              <span className="text-xl block mb-1">🌿</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-bold text-xs">Padrão Básico (PBI)</strong>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Sensação de secura constante ou muco inalterado diário. Sinal de infertilidade pré-ovulatória.</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              <span className="text-xl block mb-1">✨</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-bold text-xs">Fase Fértil & Ápice</strong>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Sensação escorregadia ou lubrificada. O último dia dessa sensação é o Dia Ápice da ovulação.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-850 text-xs text-amber-950 dark:text-amber-200">
            <strong>Dica de ouro:</strong> Avalie sua sensação no fim de cada dia antes de dormir e registre no app em menos de 1 minuto!
          </div>
        </div>
      ),
    },
    {
      badge: 'Tecnologia Confiável',
      title: 'Tudo integrado ao seu dia a dia',
      subtitle: 'IA auxiliar, sincronização com agendas do celular e nuvem privada',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-500/10 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center border border-blue-300/60 dark:border-blue-800 shrink-0">
          <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-blue-700 dark:text-blue-400" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
          <p>
            O Billings Life foi projetado para ser seu companheiro clínico seguro:
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#1B4332] dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                IA
              </div>
              <div>
                <strong className="block text-stone-900 dark:text-stone-100 text-xs font-bold">Assistente Gemini & Foto de Muco</strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Tire dúvidas sobre regras em tempo real e faça triagem visual educativa de fotos de muco.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-900 dark:text-stone-100 text-xs font-bold">Backup em Nuvem no Google Drive</strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Sincronize seus ciclos com sua conta Google com total privacidade e sem servidores intermediários.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-900 dark:text-stone-100 text-xs font-bold">Google Agenda & Apple Calendar</strong>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Exporte marcos do ciclo e lembretes noturnos diretamente para a agenda do seu celular.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (onSelectInitialGoal) {
      onSelectInitialGoal(selectedGoal);
    }
    onClose();
  };

  const active = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/65 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 transition-colors">
      <div className="bg-white dark:bg-[#181D1B] w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Top Progress & Close Bar */}
        <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/60 shrink-0">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 bg-[#1B4332] dark:bg-emerald-500'
                    : idx < currentSlide
                    ? 'w-3 bg-emerald-600/60 dark:bg-emerald-700/60'
                    : 'w-3 bg-stone-300 dark:bg-stone-700'
                }`}
                title={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Pular
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">{active.icon}</div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 tracking-wider uppercase block">
                {active.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                {active.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {active.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">{active.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="px-5 sm:px-7 py-4 bg-[#FAF8F5] dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 transition-colors">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
              {currentSlide + 1} / {slides.length}
            </span>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] dark:from-emerald-700 dark:to-emerald-600 dark:hover:from-emerald-650 dark:hover:to-emerald-550 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{currentSlide === slides.length - 1 ? 'Começar a Usar' : 'Próximo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
