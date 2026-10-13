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
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'Resposta não recebida');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: 'Desculpe, ocorreu um erro de conexão temporário com o servidor de IA. Por favor, tente novamente em alguns instantes.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xl overflow-hidden transition-colors ${
      isOpenAsModal ? 'h-[620px] max-h-[85vh] w-full max-w-2xl' : 'h-[680px]'
    }`}>
      {/* Chatbot Header */}
      <div className="px-5 sm:px-6 py-4 bg-stone-900 dark:bg-[#111413] text-white flex items-center justify-between shrink-0 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Assistente Billings IA</h3>
              <span className="text-[11px] text-emerald-300 font-mono">Gemini Flash</span>
            </div>
            <p className="text-xs text-stone-300 dark:text-stone-400">
              Consultoria educativa embasada nas diretrizes WOOMB International
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpenAsModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0 transition-colors">
        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap">Sugestões:</span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#1B4332] dark:hover:border-emerald-500 hover:text-[#1B4332] dark:hover:text-emerald-300 text-stone-700 dark:text-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50 dark:bg-[#121614] transition-colors">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'bg-[#1B4332] dark:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1B4332] dark:bg-emerald-800 text-white rounded-tr-none'
                    : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-750 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono text-right ${
                    isUser ? 'text-emerald-200 dark:text-emerald-300' : 'text-stone-400 dark:text-stone-500'
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
            <div className="w-8 h-8 rounded-xl bg-[#1B4332] dark:bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-750 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <RefreshCw className="w-4 h-4 animate-spin text-[#1B4332] dark:text-emerald-400" />
              <span>Consultando diretrizes do Método Billings...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ethical Medical Notice */}
      <div className="px-4 py-2 bg-stone-100/80 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between shrink-0 transition-colors">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332] dark:text-emerald-400" />
          <span>Aviso: A IA é uma ferramenta educativa e não substitui uma consulta ginecológica ou instrutora credenciada.</span>
        </span>
        <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500">WOOMB</span>
      </div>

      {/* Input Field */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#181D1B] border-t border-stone-200/80 dark:border-stone-800 shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida sobre o Método Billings ou sobre o app..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
