import React from 'react';
import { Plus, Calendar, BarChart3, Activity, Sparkles, FileText, BookOpen, Bell } from 'lucide-react';

export type NavTab = 'dashboard' | 'charts' | 'calendar' | 'ai_analysis' | 'clinical_record' | 'guide';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewLog: () => void;
  onOpenReminderSettings: () => void;
  reminderTime?: string;
  isReminderEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewLog,
  onOpenReminderSettings,
  reminderTime,
  isReminderEnabled = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-xs">
              B
            </div>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-800 transition-colors"
            >
              Billings Life
            </a>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              Painel
            </button>
            <button
              onClick={() => onSelectTab('charts')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'charts' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Gráfico de Selos
            </button>
            <button
              onClick={() => onSelectTab('calendar')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'calendar' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendário
            </button>
            <button
              onClick={() => onSelectTab('ai_analysis')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ai_analysis' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Análise IA de Muco
            </button>
            <button
              onClick={() => onSelectTab('clinical_record')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'clinical_record' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Prontuário & Relatório
            </button>
            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide' ? 'text-emerald-700 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Guia WOOMB
            </button>
          </nav>

          {/* Zone 3: Actions & Reminder */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenReminderSettings}
              title={isReminderEnabled ? `Lembrete diário ativo para às ${reminderTime || '21:30'}` : 'Lembretes diários desativados'}
              className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {isReminderEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            <button
              onClick={onOpenNewLog}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Dia</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 gap-4 no-scrollbar">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap ${activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Painel
          </button>
          <button
            onClick={() => onSelectTab('charts')}
            className={`whitespace-nowrap ${activeTab === 'charts' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Gráfico de Selos
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className={`whitespace-nowrap ${activeTab === 'calendar' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Calendário
          </button>
          <button
            onClick={() => onSelectTab('ai_analysis')}
            className={`whitespace-nowrap ${activeTab === 'ai_analysis' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Análise IA
          </button>
          <button
            onClick={() => onSelectTab('clinical_record')}
            className={`whitespace-nowrap ${activeTab === 'clinical_record' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Prontuário
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap ${activeTab === 'guide' ? 'text-emerald-700 font-bold' : ''}`}
          >
            Guia WOOMB
          </button>
        </div>
      </div>
    </header>
  );
};
