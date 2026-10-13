import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  X,
  MessageSquare,
} from 'lucide-react';
import { ClinicalProfile } from '../types/billings';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface BillingsChatbotProps {
  profile: ClinicalProfile;
  currentCycleDay: number;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
  initialQuestion?: string;
}

const SUGGESTED_QUESTIONS = [
  'Como diferenciar meu PBI de um muco fértil inicial?',
  'Por que a Regra 2 exige relações em noites alternadas?',
  'Como ter certeza de que ontem foi o meu Dia Ápice?',
  'O que fazer se houver sangramento no meio do ciclo?',
  'Como exportar meu prontuário e gráfico para o médico?',
];

export const BillingsChatbot: React.FC<BillingsChatbotProps> = ({
  profile,
  currentCycleDay,
  isOpenAsModal = false,
  onCloseModal,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Olá! Sou a Assistente Especialista no Método de Ovulação Billings (MOB), integrada à tecnologia Google Gemini.

Estou aqui para esclarecer qualquer dúvida sobre:
• As 4 Regras oficiais da WOOMB International
• Identificação do PBI (Padrão Básico de Infertilidade)
• Reconhecimento do Dia Ápice e contagem 1-2-3
• Como preencher seu gráfico, anexar fotos de muco e exportar prontuários clínicos.

Como posso ajudar você hoje no seu ciclo D${currentCycleDay}?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          userProfile: profile,
          currentCycleDay,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro na comunicação com o servidor.');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Não foi possível obter uma resposta adequada.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Houve uma instabilidade na consulta à inteligência artificial: ${err.message || 'Tente novamente em instantes.'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
      isOpenAsModal ? 'h-[620px] max-h-[85vh] w-full max-w-2xl' : 'h-[680px]'
    }`}>
      {/* Chatbot Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Assistente Billings IA</h3>
              <span className="text-[11px] text-emerald-300 font-mono">Gemini 3.8 Flash</span>
            </div>
            <p className="text-xs text-slate-300">
              Consultoria educativa embasada nas diretrizes WOOMB International
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpenAsModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Sugestões:</span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-800 text-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-xl p-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono text-right ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Consultando diretrizes do Método Billings...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ethical Medical Notice */}
      <div className="px-4 py-1.5 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Aviso: A IA é uma ferramenta educativa e não substitui uma consulta ginecológica ou instrutora credenciada.
        </span>
        <span className="font-mono text-[10px] text-slate-400">WOOMB International</span>
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida sobre o Método Billings ou sobre o app..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
