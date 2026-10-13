import React from 'react';
import {
  Sparkles,
  FileText,
  BookOpen,
  Bell,
  Calendar,
  Cloud,
  HardDrive,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { NavTab } from './Header';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenReminderSettings: () => void;
  onOpenCalendarSync: () => void;
  onOpenGoogleDriveSync: () => void;
  onOpenAutoBackup: () => void;
  onOpenChatbot: () => void;
  reminderTime?: string;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenReminderSettings,
  onOpenCalendarSync,
  onOpenGoogleDriveSync,
  onOpenAutoBackup,
  onOpenChatbot,
  reminderTime,
}) => {
  if (!isOpen) return null;

  const handleNavigate = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end">
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-stone-200/90 p-5 pb-10 max-h-[88vh] overflow-y-auto">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Menu & Recursos Clínicos
            </h3>
            <p className="text-xs text-stone-500">
              Acesse os módulos avançados do Método Billings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="space-y-2 text-sm">
          {/* Item 1: IA de Muco */}
          <button
            onClick={() => handleNavigate('ai_analysis')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                <Sparkles className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Laboratório IA de Muco Cervical
                </strong>
                <span className="text-[11px] text-stone-500">
                  Classificação visual e triagem por Gemini
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 2: Prontuário & Relatório */}
          <button
            onClick={() => handleNavigate('clinical_record')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                <FileText className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Prontuário & Relatório Médico
                </strong>
                <span className="text-[11px] text-stone-500">
                  Exportar PDF, CSV e ficha da paciente
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 3: Guia WOOMB */}
          <button
            onClick={() => handleNavigate('guide')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <BookOpen className="w-5 h-5 text-[#1B4332]" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Guia Oficial WOOMB International
                </strong>
                <span className="text-[11px] text-stone-500">
                  As 4 Regras e fundamentos científicos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 4: Chatbot Gemini */}
          <button
            onClick={() => {
              onClose();
              onOpenChatbot();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Chatbot Assistente Billings (Gemini)
                </strong>
                <span className="text-[11px] text-stone-500">
                  Tirar dúvidas sobre regras e sensações
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 5: Sincronização Google Drive */}
          <button
            onClick={() => {
              onClose();
              onOpenGoogleDriveSync();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/60">
                <Cloud className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Google Drive Backup & Nuvem
                </strong>
                <span className="text-[11px] text-stone-500">
                  Salvar e restaurar backups na conta Google
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 6: Google & Apple Calendar */}
          <button
            onClick={() => {
              onClose();
              onOpenCalendarSync();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Google Agenda & Apple Calendar
                </strong>
                <span className="text-[11px] text-stone-500">
                  Sincronizar lembretes e marcos no celular
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 7: Lembretes Noturnos */}
          <button
            onClick={() => {
              onClose();
              onOpenReminderSettings();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Configurar Lembrete Diário ({reminderTime || '21:30'})
                </strong>
                <span className="text-[11px] text-stone-500">
                  Horário noturno de avaliação de sensação
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Item 8: Backup Local Automático */}
          <button
            onClick={() => {
              onClose();
              onOpenAutoBackup();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100/80 border border-stone-200/80 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-stone-900 font-semibold text-xs sm:text-sm">
                  Snapshots Locais & Backup JSON
                </strong>
                <span className="text-[11px] text-stone-500">
                  Histórico de versões salvo no navegador
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
