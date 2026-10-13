import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Info,
} from 'lucide-react';
import { Cycle, DailyLog, ClinicalProfile } from '../types/billings';
import { STAMP_DETAILS, SENSATION_LABELS, APPEARANCE_LABELS } from '../utils/billingsEngine';

interface CycleCalendarProps {
  cycles: Cycle[];
  profile: ClinicalProfile;
  onSelectDate: (dateStr: string) => void;
  onEditLog: (log: DailyLog) => void;
  onNewLogForDate: (dateStr: string) => void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  cycles,
  profile,
  onSelectDate,
  onEditLog,
  onNewLogForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLog, setSelectedDayLog] = useState<DailyLog | null>(null);

  // Flatten all logs from all cycles into a lookup map by YYYY-MM-DD
  const logsMap = new Map<string, { log: DailyLog; cycle: Cycle }>();
  cycles.forEach((cycle) => {
    cycle.logs.forEach((log) => {
      logsMap.set(log.date, { log, cycle });
    });
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayLog(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayLog(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayLog(null);
  };

  // Calendar cells
  const calendarCells = [];
  // Empty padding cells for days before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push(day);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#1B4332] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
            <CalendarIcon className="w-5 h-5 text-[#1B4332] dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Calendário Mensal de Observações
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Visualização temporal contínua de todos os ciclos cadastrados
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 rounded-xl transition-colors cursor-pointer"
          >
            Mês Atual
          </button>
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-stone-800 dark:text-stone-200 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(28,61,47,0.03)] overflow-hidden transition-colors">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 text-center text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 py-2.5">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 dark:divide-stone-800">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-stone-50/40 dark:bg-stone-900/30 p-2" />
              );
            }

            const dayDate = new Date(year, month, dayNum);
            const dateStr = dayDate.toISOString().split('T')[0];
            const entry = logsMap.get(dateStr);
            const log = entry?.log;
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDayLog?.date === dateStr;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  if (log) {
                    setSelectedDayLog(log);
                  } else {
                    onNewLogForDate(dateStr);
                  }
                }}
                className={`h-24 sm:h-28 p-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-100 dark:bg-stone-800/90 ring-2 ring-[#1B4332]/20 dark:ring-emerald-400/20'
                    : 'hover:bg-stone-50/80 dark:hover:bg-stone-850 bg-white dark:bg-[#181D1B]'
                }`}
              >
                {/* Top header inside cell */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-md px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-[#1B4332] dark:bg-emerald-600 text-white'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {log && (
                    <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400">
                      D{log.cycleDay}
                    </span>
                  )}
                </div>

                {/* Stamp visual representation */}
                {log ? (
                  <div className="my-auto flex flex-col items-center">
                    <div
                      className={`w-7 h-9 rounded-xs ${
                        STAMP_DETAILS[log.stamp].bg
                      } flex items-center justify-center border border-stone-300 dark:border-stone-600 text-xs shadow-2xs relative`}
                    >
                      {log.isPeak ? (
                        <span className="font-black text-rose-700 dark:text-rose-400 text-sm">X</span>
                      ) : log.postPeakCount ? (
                        <span className="font-bold text-stone-900 text-xs">
                          {log.postPeakCount}
                        </span>
                      ) : (
                        <span>{STAMP_DETAILS[log.stamp].icon}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-600 dark:text-stone-400 truncate max-w-full mt-0.5 font-medium">
                      {log.sensation}
                    </span>
                  </div>
                ) : (
                  <div className="my-auto flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 inline-flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Registrar
                    </span>
                  </div>
                )}

                {/* Footer flag */}
                <div className="h-2 flex items-center justify-end">
                  {log?.coitus === 'noite' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" title="Relação à noite" />
                  )}
                  {log?.photoUrl && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 ml-1" title="Foto anexada" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector */}
      {selectedDayLog && (
        <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                  Registro de {new Date(selectedDayLog.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h4>
                <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                  · Dia {selectedDayLog.cycleDay} do Ciclo
                </span>
                {selectedDayLog.isPeak && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-900">
                    Ápice (X)
                  </span>
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block">Sensação:</span>
                  <strong className="text-stone-900 dark:text-stone-100">{SENSATION_LABELS[selectedDayLog.sensation].label}</strong>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block">Aparência:</span>
                  <strong className="text-stone-900 dark:text-stone-100">{APPEARANCE_LABELS[selectedDayLog.appearance].label}</strong>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block">Selo:</span>
                  <strong className="text-stone-900 dark:text-stone-100">{STAMP_DETAILS[selectedDayLog.stamp].name}</strong>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block">Relação:</span>
                  <strong className="text-stone-900 dark:text-stone-100">{selectedDayLog.coitus}</strong>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => onEditLog(selectedDayLog)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B4332] dark:bg-emerald-700 hover:bg-[#2D6A4F] dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Este Dia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
