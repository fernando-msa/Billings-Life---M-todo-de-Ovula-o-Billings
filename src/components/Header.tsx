import React from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Sparkles,
  FileText,
  BookOpen,
  Bell,
  Cloud,
  Plus,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'charts' | 'calendar' | 'ai_analysis' | 'clinical_record' | 'guide';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewLog: () => void;
  onOpenReminderSettings: () => void;
  onOpenCalendarIntegration?: () => void;
  onOpenGoogleDriveSync?: () => void;
  reminderTime?: string;
  isReminderEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewLog,
  onOpenReminderSettings,
  onOpenCalendarIntegration,
  onOpenGoogleDriveSync,
  reminderTime,
  isReminderEnabled = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-14 sm:h-16">
          {/* Zone 1: Brand Wordmark with Distinctive Botanical Leaf/Droplet Emblem */}
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            className="flex items-center gap-2.5 text-stone-900 group whitespace-nowrap shrink-0 cursor-pointer"
          >
            {/* Custom Botanical MOB Emblem */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 7.5 5 12 5 15a7 7 0 0 0 14 0c0-3-1.5-7.5-7-13z" />
                <path d="M12 9c-1.5 2-2 3.5-2 5a3 3 0 0 0 6 0c0-1.5-.5-3-2-5z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-stone-900 leading-none group-hover:text-[#1B4332] transition-colors">
                Billings Life
              </span>
              <span className="hidden sm:inline text-[10px] text-stone-500 font-medium tracking-wide">
                Método de Ovulação Billings
              </span>
            </div>
          </a>

          {/* Zone 2: Desktop Clean Navigation Links (hidden on mobile, where bottom nav is active) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-stone-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>
            <button
              onClick={() => onSelectTab('charts')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'charts'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Selos MOB</span>
            </button>
            <button
              onClick={() => onSelectTab('calendar')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
            <button
              onClick={() => onSelectTab('ai_analysis')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'ai_analysis'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Análise IA de Muco</span>
            </button>
            <button
              onClick={() => onSelectTab('clinical_record')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'clinical_record'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Prontuário & Relatório</span>
            </button>
            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'guide'
                  ? 'text-[#1B4332] font-bold border-b-2 border-[#1B4332] pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guia WOOMB</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Tools (Responsive & Clean) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Google Drive Sync Trigger */}
            {onOpenGoogleDriveSync && (
              <button
                onClick={onOpenGoogleDriveSync}
                title="Backup e Sincronização Google Drive"
                className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 flex items-center justify-center gap-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-amber-700" />
                <span className="hidden md:inline text-xs font-medium">Drive</span>
              </button>
            )}

            {/* Google Calendar Sync Trigger */}
            {onOpenCalendarIntegration && (
              <button
                onClick={onOpenCalendarIntegration}
                title="Sincronizar com Google Agenda e Apple Calendar"
                className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 flex items-center justify-center gap-1.5 text-stone-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-700" />
                <span className="hidden md:inline text-xs font-medium">Agenda</span>
              </button>
            )}

            {/* Daily Reminder Bell */}
            <button
              onClick={onOpenReminderSettings}
              title={isReminderEnabled ? `Lembrete noturno ativo para às ${reminderTime || '21:30'}` : 'Lembretes desativados'}
              className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-[#1B4332] hover:bg-stone-200/50 rounded-xl transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {isReminderEnabled && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
              )}
            </button>

            {/* Primary Action Button (Desktop only; on mobile the bottom floating (+) handles it) */}
            <button
              onClick={onOpenNewLog}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Dia</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
