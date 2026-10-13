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
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center shadow-lg shadow-[#1B4332]/25">
          <svg className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.5 7.5 5 12 5 15a7 7 0 0 0 14 0c0-3-1.5-7.5-7-13z" />
            <path d="M12 9c-1.5 2-2 3.5-2 5a3 3 0 0 0 6 0c0-1.5-.5-3-2-5z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3.5 text-stone-600 text-xs sm:text-sm leading-relaxed">
          <p>
            O <strong>Método de Ovulação Billings (MOB)</strong> é um sistema científico desenvolvido pelos médicos australianos Drs. John e Evelyn Billings, validado pela Organização Mundial da Saúde (OMS) e padronizado mundialmente pela <strong>WOOMB International</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/90 space-y-1.5">
            <div className="font-semibold text-stone-900 text-xs sm:text-sm">
              Por que tantas mulheres escolhem o Método Billings?
            </div>
            <ul className="space-y-1.5 text-stone-600 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Livre de hormônios sintéticos</strong> e de efeitos colaterais como trombose, alteração de humor e perda de libido.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Aplicável a qualquer mulher</strong>: ciclos regulares, irregulares, amamentação, pós-pílula, pré-menopausa ou SOP.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Eficácia de até 99,5%</strong> no espaçamento de gestações quando seguido com disciplina e apoio de instrutora.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      badge: 'Qual é o Seu Momento?',
      title: 'Um Método, Três Grandes Objetivos',
      subtitle: 'O Billings se adapta perfeitamente ao que você e seu parceiro desejam agora',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-200 flex items-center justify-center">
          <Target className="w-9 h-9 sm:w-10 sm:h-10 text-amber-700" />
        </div>
      ),
      content: (
        <div className="space-y-3">
          <p className="text-stone-600 text-xs sm:text-sm">
            Escolha seu foco principal. O algoritmo do aplicativo ajustará os alertas de fertilidade e relatórios clínicos de acordo com a sua meta:
          </p>
          <div className="space-y-2 pt-1">
            <button
              onClick={() => setSelectedGoal('avoid_pregnancy')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedGoal === 'avoid_pregnancy'
                  ? 'bg-emerald-50/90 border-[#1B4332] ring-1 ring-[#1B4332] text-stone-900'
                  : 'bg-[#FAF8F5] border-stone-200/90 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                  <span>🌿</span> Evitar Gravidez (Espaçamento Natural)
                </span>
                {selectedGoal === 'avoid_pregnancy' && <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Identifica com precisão as fases inférteis (Padrão Básico de Infertilidade e pós-ápice) para intimidade segura sem gravidez.
              </p>
            </button>

            <button
              onClick={() => setSelectedGoal('achieve_pregnancy')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedGoal === 'achieve_pregnancy'
                  ? 'bg-rose-50/90 border-rose-600 ring-1 ring-rose-600 text-stone-900'
                  : 'bg-[#FAF8F5] border-stone-200/90 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                  <span>🌸</span> Conseguir Gravidez (Concepção Consciente)
                </span>
                {selectedGoal === 'achieve_pregnancy' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Mapeia a janela de máxima fertilidade e o Dia Ápice para concentrar as relações nos dias de maior probabilidade de fertilização.
              </p>
            </button>

            <button
              onClick={() => setSelectedGoal('health_monitoring')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedGoal === 'health_monitoring'
                  ? 'bg-blue-50/90 border-blue-600 ring-1 ring-blue-600 text-stone-900'
                  : 'bg-[#FAF8F5] border-stone-200/90 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                  <span>🩺</span> Acompanhamento & Saúde Ginecológica
                </span>
                {selectedGoal === 'health_monitoring' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Rastreia regularidade hormonal, ovulação comprovada e fornece relatórios clínicos para sua ginecologista.
              </p>
            </button>
          </div>
        </div>
      ),
    },
    {
      badge: 'A Regra de Ouro',
      title: 'Como Funciona no Seu Dia a Dia',
      subtitle: 'Apenas 30 segundos ao deitar: o poder está na sua sensação',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 text-[#1B4332] border border-emerald-200 flex items-center justify-center">
          <Droplets className="w-9 h-9 sm:w-10 sm:h-10 text-[#1B4332]" />
        </div>
      ),
      content: (
        <div className="space-y-3.5 text-stone-600 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-200/80">
            <strong className="block text-amber-950 font-bold mb-1 text-xs sm:text-sm">
              ⭐ A Regra de Ouro de Evelyn Billings:
            </strong>
            <p className="text-amber-900 text-xs leading-relaxed">
              O segredo do método não é tocar o colo do útero ou ficar examinando secreções com as mãos! É a <strong>SENSAÇÃO VULVAR</strong> que você percebe naturalmente ao caminhar, sentar e realizar suas atividades cotidianas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-200/80">
              <span className="font-bold text-stone-900 block">🌿 Secura (Verde)</span>
              <span className="text-stone-500 text-[11px]">Nenhuma sensação de umidade na vulva. Indica repouso ovulatório.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-200/80">
              <span className="font-bold text-stone-900 block">👶 Escorregadia (Branco)</span>
              <span className="text-stone-500 text-[11px]">Sensação de deslize, lubrificação ou muco elástico. Indica fertilidade ativa!</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-200/80">
              <span className="font-bold text-stone-900 block">☀️ Padrão Básico (Amarelo)</span>
              <span className="text-stone-500 text-[11px]">Padrão constante e inalterado dia após dia. Infértil se confirmado.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-200/80">
              <span className="font-bold text-stone-900 block">🩸 Sangramento (Vermelho)</span>
              <span className="text-stone-500 text-[11px]">Menstruação ou escape. Segue a Regra 1 de abstinência se intenso.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Tecnologia a Seu Favor',
      title: 'Tudo Integrado no Billings Life',
      subtitle: 'Segurança médica, inteligência artificial e privacidade absoluta',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-[#1B4332] border border-stone-200 flex items-center justify-center">
          <Sparkles className="w-9 h-9 sm:w-10 sm:h-10 text-amber-700" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed">
          <p>
            O Billings Life foi projetado para ser seu companheiro clínico seguro:
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1B4332] flex items-center justify-center shrink-0 font-bold">
                IA
              </div>
              <div>
                <strong className="block text-stone-900 text-xs font-bold">Assistente Gemini & Foto de Muco</strong>
                <span className="text-[11px] text-stone-500">Tire dúvidas sobre regras em tempo real e faça triagem visual educativa de fotos de muco.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-900 text-xs font-bold">Backup em Nuvem no Google Drive</strong>
                <span className="text-[11px] text-stone-500">Sincronize seus ciclos com sua conta Google com total privacidade e sem servidores intermediários.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-900 text-xs font-bold">Google Agenda & Apple Calendar</strong>
                <span className="text-[11px] text-stone-500">Exporte marcos do ciclo e lembretes noturnos diretamente para a agenda do seu celular.</span>
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Progress & Close Bar */}
        <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-stone-100 bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 bg-[#1B4332]'
                    : idx < currentSlide
                    ? 'w-3 bg-emerald-600/60'
                    : 'w-3 bg-stone-300'
                }`}
                title={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            Pular
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">{active.icon}</div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 tracking-wider uppercase block">
                {active.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
                {active.title}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {active.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">{active.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="px-5 sm:px-7 py-4 bg-[#FAF8F5] border-t border-stone-100 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-mono">
              {currentSlide + 1} / {slides.length}
            </span>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
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
