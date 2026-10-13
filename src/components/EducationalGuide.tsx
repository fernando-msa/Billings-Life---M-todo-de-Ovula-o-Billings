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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Guide Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            Fundamentos Científicos
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500 font-mono">WOOMB International & CENPLAFAM</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Guia Clínico do Método de Ovulação Billings (MOB)
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
          Desenvolvido nos anos 1950 pelos médicos australianos Dr. John Billings e Dra. Evelyn Billings, o método foi validado cientificamente pelo Prof. James Brown (dosagens hormonais) e pelo Prof. Erik Odeblad (ressonância magnética das criptas cervicais), além de ensaios clínicos da Organização Mundial da Saúde (OMS).
        </p>
      </div>

      {/* The 4 Official Billings Rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-700" />
          <span>As 4 Regras Oficiais do Método Billings</span>
        </h2>

        <div className="space-y-6">
          {/* Rule 1 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Primeira Regra dos Primeiros Dias: Sangramento Menstrual
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              <strong>Regra:</strong> Evite relações sexuais em todos os dias de sangramento intenso durante a menstruação.
              <br />
              <strong>Justificativa Fisiológica:</strong> Em ciclos curtos, a ovulação pode ocorrer logo após o início do ciclo, e o sangramento menstrual abundante pode mascarar a presença do muco fértil inicial.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Segunda Regra dos Primeiros Dias: Noites Alternadas no PBI
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              <strong>Regra:</strong> As relações sexuais são permitidas em <em>noites alternadas</em> nos dias reconhecidos como PBI (Padrão Básico de Infertilidade).
              <br />
              <strong>Justificativa Fisiológica:</strong> A mulher deve estar em pé e em movimento ao longo de todo o dia para que as secreções vulvares sejam perceptíveis. Na manhã após uma relação, a eliminação de líquido seminal pode causar sensação de umidade; o dia seguinte à relação permite que o fluido seminal se dissipe e a mulher confirme se o PBI permanece inalterado.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Terceira Regra dos Primeiros Dias: Mudança no PBI (Aguardar 1, 2, 3)
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-8">
              <strong>Regra:</strong> Evite relações em qualquer dia de mudança do PBI (surgimento de muco ou alteração na sensação). Se a alteração cessar sem culminar em Ápice, aguarde 3 dias de PBI reestabelecido e retome a Regra 2 na noite do 4º dia.
              <br />
              <strong>Justificativa Fisiológica:</strong> Uma elevação hormonal transitória de estrogênio pode não resultar em ovulação. Aguardar 3 dias garante que qualquer folículo em atresia não liberou óvulo tardiamente.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                4
              </span>
              <h3 className="text-sm font-bold text-emerald-950">
                A Regra do Ápice (Fase Pós-Ovulatória)
              </h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed pl-8">
              <strong>Regra:</strong> A partir da 4ª manhã após o Dia Ápice confirmado (após a contagem dos 3 dias pós-ápice: 1, 2 e 3), as relações sexuais estão liberadas a qualquer momento do dia ou da noite até o início da próxima menstruação!
              <br />
              <strong>Justificativa Fisiológica:</strong> O óvulo é liberado no Ápice ou até 48h após, sobrevivendo no máximo 24 horas. Após o 3º dia de contagem, o óvulo já se desintegrou e o colo uterino foi completamente ocluído pelo muco progestogênico espesso (Tipo G), impedindo a entrada de espermatozoides.
            </p>
          </div>
        </div>
      </div>

      {/* Sensation vs Appearance (The Golden Rule) */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          <span>A Supremacia da Sensação Vulvar sobre o Aspecto Visual</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            Muitas mulheres acreditam erroneamente que o Método Billings exige &ldquo;tocar o colo do útero&rdquo; ou manipular internamente a secreção vaginal. Os criadores do método advertem categoricamente contra isso: <strong>nunca faça exames internos com os dedos</strong>.
          </p>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Por que a sensação na vulva é infalível?</h4>
            <p>
              A vulva possui uma das maiores densidades de terminações nervosas sensoriais do corpo humano. À medida que o muco produzido pelas criptas cervicais escorre pelo canal vaginal, a mulher sente nitidamente a transição entre <strong>secura, umidade e a lubricidade escorregadia</strong> ao caminhar. A sensação escorregadia e lubrificada é provocada pelo muco Tipo P e Tipo L associados ao pico de estrogênio que precede a ovulação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <strong className="text-emerald-900 block mb-1">PBI de Secura (Mais comum)</strong>
              <p className="text-emerald-800">
                A mulher passa o dia inteiro com sensação nítida de secura vulvar e papel higiênico limpo. Representado pelo <strong>Selo Verde</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <strong className="text-amber-900 block mb-1">PBI de Muco Constante Inalterado</strong>
              <p className="text-amber-800">
                A mulher tem secreção constante (geralmente opaca, esbranquiçada ou pastosa), mas que não muda de quantidade, textura nem sensação dia após dia. Representado pelo <strong>Selo Amarelo</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reliable Sources Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Fontes Confiáveis e Organizações Credenciadas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold mb-0.5">
              WOOMB International
            </strong>
            <p className="text-slate-500 mb-2">
              World Organisation Ovulation Method Billings — Órgão regulador mundial do ensino e certificação de instrutores.
            </p>
            <span className="text-[11px] font-mono text-emerald-800 font-medium">www.woombinternational.org</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold mb-0.5">
              CENPLAFAM (Brasil)
            </strong>
            <p className="text-slate-500 mb-2">
              Centro de Planejamento Familiar — Entidade pioneira no Brasil com instrutoras credenciadas oficialmente pela WOOMB.
            </p>
            <span className="text-[11px] font-mono text-emerald-800 font-medium">www.cenplafam.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
};
