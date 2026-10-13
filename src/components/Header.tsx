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
import { ThemeToggleButton } from '../utils/themeContext';

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
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#111413]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-8 h-14 sm:h-16">
          {/* Zone 1: Brand Wordmark with Distinctive Botanical Leaf/Droplet Emblem */}
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100 group whitespace-nowrap shrink-0 cursor-pointer"
          >
            {/* Custom Botanical MOB Emblem */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-[#2D6A4F] dark:to-[#40916C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 7.5 5 12 5 15a7 7 0 0 0 14 0c0-3-1.5-7.5-7-13z" />
                <path d="M12 9c-1.5 2-2 3.5-2 5a3 3 0 0 0 6 0c0-1.5-.5-3-2-5z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100 leading-none group-hover:text-[#1B4332] dark:group-hover:text-emerald-400 transition-colors">
                Billings Life
              </span>
              <span className="hidden sm:inline text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-wide">
                Método de Ovulação Billings
              </span>
            </div>
          </a>

          {/* Zone 2: Desktop Clean Navigation Links (hidden on mobile, where bottom nav is active) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>
            <button
              onClick={() => onSelectTab('charts')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'charts'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Selos MOB</span>
            </button>
            <button
              onClick={() => onSelectTab('calendar')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
            <button
              onClick={() => onSelectTab('ai_analysis')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'ai_analysis'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Análise IA de Muco</span>
            </button>
            <button
              onClick={() => onSelectTab('clinical_record')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'clinical_record'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Prontuário & Relatório</span>
            </button>
            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'guide'
                  ? 'text-[#1B4332] dark:text-emerald-400 font-bold border-b-2 border-[#1B4332] dark:border-emerald-400 pb-0.5'
                  : 'hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guia WOOMB</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Tools (Responsive & Clean) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Theme Toggle Button (Light/Dark in 1 tap) */}
            <ThemeToggleButton />

            {/* Google Drive Sync Trigger */}
            {onOpenGoogleDriveSync && (
              <button
                onClick={onOpenGoogleDriveSync}
                title="Backup e Sincronização Google Drive"
                className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="hidden md:inline text-xs font-medium">Drive</span>
              </button>
            )}

            {/* Google Calendar Sync Trigger */}
            {onOpenCalendarIntegration && (
              <button
                onClick={onOpenCalendarIntegration}
                title="Sincronizar com Google Agenda e Apple Calendar"
                className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span className="hidden md:inline text-xs font-medium">Agenda</span>
              </button>
            )}

            {/* Daily Reminder Bell */}
            <button
              onClick={onOpenReminderSettings}
              title={isReminderEnabled ? `Lembrete noturno ativo para às ${reminderTime || '21:30'}` : 'Lembretes desativados'}
              className="w-9 h-9 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-[#1B4332] dark:hover:text-emerald-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/80 rounded-xl transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {isReminderEnabled && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-2 ring-white dark:ring-stone-900" />
              )}
            </button>

            {/* Primary Action Button (Desktop only; on mobile the bottom floating (+) handles it) */}
            <button
              onClick={onOpenNewLog}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
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
