import React from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Droplets,
  ExternalLink,
} from 'lucide-react';

export const EducationalGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors">
      {/* Hero Guide Header */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-[#1B4332] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Fundamentos Científicos
          </span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">WOOMB International & CENPLAFAM</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Guia Clínico do Método de Ovulação Billings (MOB)
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed max-w-3xl">
          Desenvolvido nos anos 1950 pelos médicos australianos Dr. John Billings e Dra. Evelyn Billings, o método foi validado cientificamente pelo Prof. James Brown (dosagens hormonais) e pelo Prof. Erik Odeblad (ressonância magnética das criptas cervicais), além de ensaios clínicos da Organização Mundial da Saúde (OMS).
        </p>
      </div>

      {/* The 4 Official Billings Rules */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#1B4332] dark:text-emerald-400" />
          <span>As 4 Regras Oficiais do Método Billings</span>
        </h2>

        <div className="space-y-6">
          {/* Rule 1 */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Primeira Regra dos Primeiros Dias: Sangramento Menstrual
              </h3>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-8">
              <strong>Regra:</strong> Evite relações sexuais em todos os dias de sangramento intenso durante a menstruação.
              <br />
              <strong>Justificativa Fisiológica:</strong> Em ciclos curtos, a ovulação pode ocorrer logo após o início do ciclo, e o sangramento menstrual abundante pode mascarar a presença do muco fértil inicial.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Segunda Regra dos Primeiros Dias: Noites Alternadas no PBI
              </h3>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-8">
              <strong>Regra:</strong> As relações sexuais são permitidas em <em>noites alternadas</em> nos dias reconhecidos como PBI (Padrão Básico de Infertilidade).
              <br />
              <strong>Justificativa Fisiológica:</strong> A mulher deve estar em pé e em movimento ao longo de todo o dia para que as secreções vulvares sejam perceptíveis. Na manhã após uma relação, a eliminação de líquido seminal pode causar sensação de umidade; o dia seguinte à relação permite que o fluido seminal se dissipe e a mulher confirme se o PBI permanece inalterado.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Terceira Regra dos Primeiros Dias: Mudança no PBI (Aguardar 1, 2, 3)
              </h3>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-8">
              <strong>Regra:</strong> Evite relações em qualquer dia de mudança do PBI (surgimento de muco ou alteração na sensação). Se a alteração cessar sem culminar em Ápice, aguarde 3 dias de PBI reestabelecido e retome a Regra 2 na noite do 4º dia.
              <br />
              <strong>Justificativa Fisiológica:</strong> Uma elevação hormonal transitória de estrogênio pode não resultar em ovulação. Aguardar 3 dias garante que qualquer folículo em atresia não liberou óvulo tardiamente.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#1B4332] dark:bg-emerald-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                4
              </span>
              <h3 className="text-sm font-serif font-bold text-emerald-950 dark:text-emerald-200">
                A Regra do Ápice (Fase Pós-Ovulatória)
              </h3>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed pl-8">
              <strong>Regra:</strong> A partir da 4ª manhã após o Dia Ápice confirmado (após a contagem dos 3 dias pós-ápice: 1, 2 e 3), as relações sexuais estão liberadas a qualquer momento do dia ou da noite até o início da próxima menstruação!
              <br />
              <strong>Justificativa Fisiológica:</strong> O óvulo é liberado no Ápice ou até 48h após, sobrevivendo no máximo 24 horas. Após o 3º dia de contagem, o óvulo já se desintegrou e o colo uterino foi completamente ocluído pelo muco progestogênico espesso (Tipo G), impedindo a entrada de espermatozoides.
            </p>
          </div>
        </div>
      </div>

      {/* Sensation vs Appearance (The Golden Rule) */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>A Supremacia da Sensação Vulvar sobre o Aspecto Visual</span>
        </h2>

        <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            Muitas mulheres acreditam erroneamente que o Método Billings exige &ldquo;tocar o colo do útero&rdquo; ou manipular internamente a secreção vaginal. Os criadores do método advertem categoricamente contra isso: <strong>nunca faça exames internos com os dedos</strong>.
          </p>

          <div className="p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-1">Por que a sensação na vulva é infalível?</h4>
            <p>
              A vulva possui uma das maiores densidades de terminações nervosas sensoriais do corpo humano. À medida que o muco produzido pelas criptas cervicais escorre pelo canal vaginal, a mulher sente nitidamente a transição entre <strong>secura, umidade e a lubricidade escorregadia</strong> ao caminhar. A sensação escorregadia e lubrificada é provocada pelo muco Tipo P e Tipo L associados ao pico de estrogênio que precede a ovulação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850">
              <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">PBI de Secura (Mais comum)</strong>
              <p className="text-emerald-800 dark:text-emerald-400">
                A mulher passa o dia inteiro com sensação nítida de secura vulvar e papel higiênico limpo. Representado pelo <strong>Selo Verde</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850">
              <strong className="text-amber-900 dark:text-amber-300 block mb-1">PBI de Muco Constante Inalterado</strong>
              <p className="text-amber-800 dark:text-amber-400">
                A mulher tem secreção constante (geralmente opaca, esbranquiçada ou pastosa), mas que não muda de quantidade, textura nem sensação dia após dia. Representado pelo <strong>Selo Amarelo</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reliable Sources Links */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
        <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
          <span>Fontes Confiáveis e Organizações Credenciadas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
            <strong className="text-stone-900 dark:text-stone-100 block font-semibold mb-0.5">
              WOOMB International
            </strong>
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              World Organisation Ovulation Method Billings — Órgão regulador mundial do ensino e certificação de instrutores.
            </p>
            <span className="text-[11px] font-mono text-[#1B4332] dark:text-emerald-400 font-medium">www.woombinternational.org</span>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800">
            <strong className="text-stone-900 dark:text-stone-100 block font-semibold mb-0.5">
              CENPLAFAM (Brasil)
            </strong>
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              Centro de Planejamento Familiar — Entidade pioneira no Brasil com instrutoras credenciadas oficialmente pela WOOMB.
            </p>
            <span className="text-[11px] font-mono text-[#1B4332] dark:text-emerald-400 font-medium">www.cenplafam.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
};
