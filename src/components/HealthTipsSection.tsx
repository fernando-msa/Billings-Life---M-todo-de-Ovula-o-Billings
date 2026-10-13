import React, { useState } from 'react';
import {
  ShieldCheck,
  Droplets,
  Heart,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Info,
} from 'lucide-react';

interface HealthTip {
  id: string;
  category: 'higiene' | 'observacao' | 'vestuario' | 'alerta';
  title: string;
  summary: string;
  detailedGuidance: string;
  woombRationale: string;
  iconType: 'shield' | 'droplet' | 'heart' | 'alert';
}

const WOOMB_HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    category: 'higiene',
    title: 'Não Realizar Duchas Vaginais nem Toques Internos',
    summary: 'A vagina é um canal autolimpante. Lavagens internas alteram o pH e mascaram o muco.',
    detailedGuidance:
      'Lave estritamente a vulva (região externa). O colo do útero e as criptas cervicais secretam muco que desce naturalmente. A lavagem interna com jatos de água ou produtos íntimos elimina a microbiota protetora de lactobacilos e impede o registro fidedigno das sensações.',
    woombRationale:
      'Os fundadores do método (Drs. John e Evelyn Billings) reforçam: exames digitais internos no colo são terminantemente contraindicados, pois recolhem secreções que ainda não sofreram as alterações biofísicas ao longo do canal.',
    iconType: 'shield',
  },
  {
    id: 'tip-2',
    category: 'observacao',
    title: 'Passar o Papel Higiênico de Frente para Trás Sentindo o Deslize',
    summary: 'Limpe da uretra em direção ao ânus, percebendo a sensação de deslizamento no papel.',
    detailedGuidance:
      'Antes e após urinar, passe o papel higiênico dobrado com suavidade na vulva, de frente para trás. Isso evita a translocação de bactérias da flora intestinal para a uretra e permite atestar a lubricidade: quando o papel desliza como sobre uma superfície sedosa, é forte indício de muco fértil.',
    woombRationale:
      'A sensação tátil que a mulher percebe no tecido vulvar ao passar o papel seco é um dos métodos mais sensíveis para detectar o início da fase de lubrificação estrogênica.',
    iconType: 'droplet',
  },
  {
    id: 'tip-3',
    category: 'vestuario',
    title: 'Arejamento Vulvar e Roupas Íntimas de Algodão',
    summary: 'Prefira tecidos respiráveis e evite calcinhas sintéticas que retêm calor e umidade.',
    detailedGuidance:
      'Dê preferência a calcinhas 100% algodão e evite o uso diário de protetores diários sintéticos descartáveis com fundo plástico. O abafamento eleva a temperatura local, gerando umidade artificial que pode ser confundida com muco fértil e favorecer infecções fúngicas.',
    woombRationale:
      'O microclima vulvar ventilado garante que a sensação de umidade registrada no gráfico corresponda estritamente às secreções cervicais hormonais, e não a suor perineal retido.',
    iconType: 'heart',
  },
  {
    id: 'tip-4',
    category: 'alerta',
    title: 'Distinguir Muco Fisiológico de Corrimentos Infecciosos',
    summary: 'Muco saudável é cíclico e indolor; corrimentos patológicos coçam, ardem ou têm odor.',
    detailedGuidance:
      'O muco cervical natural varia de pastoso a elástico cristalino, nunca tem odor fétido e não causa ardor ou prurido. Corrimentos esverdeados, espumosos, acinzentados ou grumosos (semelhantes a leite talhado) com queixa de coceira indicam vaginose ou candidíase e demandam tratamento ginecológico.',
    woombRationale:
      'Durante uma infecção ginecológica aguda, o padrão de muco é distorcido. A usuária deve tratar a infecção sob orientação médica antes de retomar a identificação precisa do PBI.',
    iconType: 'alert',
  },
  {
    id: 'tip-5',
    category: 'higiene',
    title: 'Cuidado com Sabonetes Perfumados e Desodorantes Íntimos',
    summary: 'Substâncias químicas perfumadas desequilibram o manto lipídico e causam irritação.',
    detailedGuidance:
      'Utilize apenas sabonete suave ou neutro para a genitália externa, sem esfregar com esponjas. Lenços umedecidos perfumados e desodorantes íntimos contêm parabenos e fragrâncias que provocam dermatites de contato, mascarando a sensação vulvar com queimação ou prurido.',
    woombRationale:
      'Uma vulva saudável e sem dermatites é pré-requisito para que a mulher consiga discernir com precisão a verdadeira sensação de lubrificação cervical.',
    iconType: 'shield',
  },
  {
    id: 'tip-6',
    category: 'observacao',
    title: 'Medicamentos que Podem Alterar o Muco Cervical',
    summary: 'Antialérgicos, descongestionantes e antidepressivos podem ressecar secreções.',
    detailedGuidance:
      'Anti-histamínicos secam não apenas as mucosas nasais, mas também diminuem a hidratação do muco cervical. Da mesma forma, antibióticos e estresse acentuado podem postergar o pico de LH e alongar a fase folicular. Anote sempre no campo de anotações diárias qualquer medicação usada.',
    woombRationale:
      'O prontuário e o gráfico devem registrar intercorrências medicamentosas para que a instrutora compreenda eventuais variações atípicas no padrão de muco.',
    iconType: 'droplet',
  },
];

interface HealthTipsSectionProps {
  onAskChatbotAboutTip?: (question: string) => void;
}

export const HealthTipsSection: React.FC<HealthTipsSectionProps> = ({ onAskChatbotAboutTip }) => {
  const [selectedCategory, setSelectedCategory] = useState<'todas' | 'higiene' | 'observacao' | 'vestuario' | 'alerta'>('todas');
  const [expandedTipId, setExpandedTipId] = useState<string | null>('tip-1');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTips = WOOMB_HEALTH_TIPS.filter((tip) => {
    const matchesCategory = selectedCategory === 'todas' || tip.category === selectedCategory;
    const matchesSearch =
      tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.detailedGuidance.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type: HealthTip['iconType']) => {
    switch (type) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'droplet':
        return <Droplets className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(28,61,47,0.03)] overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Diretrizes de Saúde WOOMB
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">Cuidados & Higiene Íntima</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Dicas de Saúde & Higiene Íntima Fisiológica
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Orientações médicas e biológicas validadas pela Organização Mundial do Método de Ovulação Billings para manter a saúde vulvovaginal e assegurar a fidelidade das observações diárias.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dica de saúde..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 placeholder:text-stone-400 text-stone-900 dark:text-stone-100 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Tabs (Clean Segmented Control) */}
        <div className="flex items-center gap-1.5 mt-4 sm:mt-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'todas'
                ? 'bg-stone-900 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            Todas ({WOOMB_HEALTH_TIPS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('higiene')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'higiene'
                ? 'bg-stone-900 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            Higiene & Sabonetes
          </button>
          <button
            onClick={() => setSelectedCategory('observacao')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'observacao'
                ? 'bg-stone-900 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            Técnica de Observação
          </button>
          <button
            onClick={() => setSelectedCategory('vestuario')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'vestuario'
                ? 'bg-stone-900 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            Vestuário & Arejamento
          </button>
          <button
            onClick={() => setSelectedCategory('alerta')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'alerta'
                ? 'bg-stone-900 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            Sinais de Alerta
          </button>
        </div>
      </div>

      {/* Tips Cards List */}
      <div className="p-4 sm:p-6 space-y-3">
        {filteredTips.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500 dark:text-stone-400">
            Nenhuma dica encontrada com os termos selecionados.
          </div>
        ) : (
          filteredTips.map((tip) => {
            const isExpanded = expandedTipId === tip.id;

            return (
              <div
                key={tip.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-[#1B4332] dark:border-emerald-600 bg-white dark:bg-stone-900/60 ring-1 ring-[#1B4332]/20 dark:ring-emerald-600/30 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181D1B] hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {/* Header row clickable */}
                <button
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0 mt-0.5">
                      {getIcon(tip.iconType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                        {tip.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-stone-400 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#1B4332] dark:text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 dark:border-stone-800 space-y-3 text-xs">
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200/80 dark:border-stone-800 leading-relaxed text-stone-700 dark:text-stone-300">
                      <strong className="block text-stone-900 dark:text-stone-100 font-semibold mb-1">
                        Orientação Prática:
                      </strong>
                      <p>{tip.detailedGuidance}</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850 rounded-lg text-emerald-950 dark:text-emerald-200 leading-relaxed">
                      <strong className="block text-emerald-900 dark:text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        Fundamento Oficial da WOOMB:
                      </strong>
                      <p>{tip.woombRationale}</p>
                    </div>

                    {/* Ask Chatbot button */}
                    {onAskChatbotAboutTip && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => onAskChatbotAboutTip(`Explique mais sobre a orientação da WOOMB: ${tip.title}`)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#1B4332] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold hover:underline cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Tirar dúvidas sobre este tópico com o Chatbot</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer advice */}
      <div className="px-5 sm:px-6 py-3.5 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#1B4332] dark:text-emerald-400 shrink-0" />
          <span>Embasado nos manuais clínicos &ldquo;O Método Billings&rdquo; (Dra. Evelyn Billings) e publicações da WOOMB.</span>
        </span>
        <span className="font-mono text-stone-400 dark:text-stone-500 text-[10px]">Padrão Ouro Ginecológico</span>
      </div>
    </div>
  );
};
