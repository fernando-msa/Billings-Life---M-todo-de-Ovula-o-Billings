import React from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Plus,
  Menu,
} from 'lucide-react';
import { NavTab } from './Header';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewLog: () => void;
  onOpenMoreMenu: () => void;
  isMoreMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewLog,
  onOpenMoreMenu,
  isMoreMenuOpen,
}) => {
  return (
    <nav
      aria-label="Navegação Principal Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#151917]/95 backdrop-blur-lg border-t border-stone-200/90 dark:border-stone-800 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe transition-colors"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {/* Tab 1: Painel */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'dashboard' && !isMoreMenuOpen
              ? 'text-[#1B4332] dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Activity className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Painel</span>
        </button>

        {/* Tab 2: Selos MOB */}
        <button
          onClick={() => onSelectTab('charts')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'charts' && !isMoreMenuOpen
              ? 'text-[#1B4332] dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Selos MOB</span>
        </button>

        {/* Tab 3: Center Elevated Floating Action Button (Registrar Dia) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={onOpenNewLog}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] dark:from-emerald-700 dark:to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-[#1B4332]/30 active:scale-95 transition-transform cursor-pointer border-3 border-[#FAF8F5] dark:border-[#151917] ring-2 ring-[#1B4332]/20 dark:ring-emerald-500/20"
            title="Registrar observação de hoje no Método Billings"
            aria-label="Registrar observação de hoje"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* Tab 4: Calendário */}
        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'calendar' && !isMoreMenuOpen
              ? 'text-[#1B4332] dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Calendar className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Calendário</span>
        </button>

        {/* Tab 5: Menu Mais (IA, Prontuário, Guia, Drive, Agenda) */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
            isMoreMenuOpen || activeTab === 'ai_analysis' || activeTab === 'clinical_record' || activeTab === 'guide'
              ? 'text-[#1B4332] dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#FAF8F5] dark:ring-[#151917]" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Mais</span>
        </button>
      </div>
    </nav>
  );
};
