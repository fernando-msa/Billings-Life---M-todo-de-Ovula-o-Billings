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
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
      case 'droplet':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                Diretrizes de Saúde WOOMB
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Cuidados & Higiene Íntima</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Dicas de Saúde & Higiene Íntima Fisiológica
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Orientações médicas e biológicas validadas pela Organização Mundial do Método de Ovulação Billings para manter a saúde vulvovaginal e assegurar a fidelidade das observações diárias.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dica de saúde..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Filter Tabs (Clean Segmented Control) */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'todas'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas as Dicas ({WOOMB_HEALTH_TIPS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('higiene')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'higiene'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Higiene & Sabonetes
          </button>
          <button
            onClick={() => setSelectedCategory('observacao')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'observacao'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Técnica de Observação
          </button>
          <button
            onClick={() => setSelectedCategory('vestuario')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'vestuario'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Vestuário & Arejamento
          </button>
          <button
            onClick={() => setSelectedCategory('alerta')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'alerta'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Sinais de Alerta
          </button>
        </div>
      </div>

      {/* Tips Cards List */}
      <div className="p-6 space-y-3">
        {filteredTips.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
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
                    ? 'border-emerald-600 bg-white ring-1 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Header row clickable */}
                <button
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                      {getIcon(tip.iconType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {tip.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-slate-700">
                      <strong className="block text-slate-900 font-semibold mb-1">
                        Orientação Prática:
                      </strong>
                      <p>{tip.detailedGuidance}</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 leading-relaxed">
                      <strong className="block text-emerald-900 font-semibold mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-700" />
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
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-semibold hover:underline cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          Embasado nos manuais clínicos &ldquo;O Método Billings&rdquo; (Dra. Evelyn Billings) e publicações científicas da WOOMB.
        </span>
        <span className="font-mono text-slate-400">Padrão Ouro Ginecológico</span>
      </div>
    </div>
  );
};
