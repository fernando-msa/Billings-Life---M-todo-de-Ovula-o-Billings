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
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Calendário Mensal Billings
            </h2>
            <p className="text-xs text-slate-500">
              Visualização sincronizada com os ciclos e selos diários registrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-slate-50/40 p-2" />
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
                    ? 'bg-slate-100 ring-2 ring-slate-900/10'
                    : 'hover:bg-slate-50/80 bg-white'
                }`}
              >
                {/* Top header inside cell */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-md px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {log && (
                    <span className="text-[10px] font-mono font-bold text-slate-500">
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
                      } flex items-center justify-center border border-slate-300 text-xs shadow-2xs relative`}
                    >
                      {log.isPeak ? (
                        <span className="font-black text-rose-700 text-sm">X</span>
                      ) : log.postPeakCount ? (
                        <span className="font-bold text-slate-900 text-xs">
                          {log.postPeakCount}
                        </span>
                      ) : (
                        <span>{STAMP_DETAILS[log.stamp].icon}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-600 truncate max-w-full mt-0.5 font-medium">
                      {log.sensation}
                    </span>
                  </div>
                ) : (
                  <div className="my-auto flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Registrar
                    </span>
                  </div>
                )}

                {/* Footer flag */}
                <div className="h-2 flex items-center justify-end">
                  {log?.coitus === 'noite' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" title="Relação à noite" />
                  )}
                  {log?.photoUrl && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-1" title="Foto anexada" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector */}
      {selectedDayLog && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Registro de {new Date(selectedDayLog.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h4>
                <span className="text-xs font-mono font-bold text-slate-600">
                  · Dia {selectedDayLog.cycleDay} do Ciclo
                </span>
                {selectedDayLog.isPeak && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded-md">
                    Ápice (X)
                  </span>
                )}
              </div>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Sensação:</span>
                  <strong className="text-slate-900">{SENSATION_LABELS[selectedDayLog.sensation].label}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Aparência:</span>
                  <strong className="text-slate-900">{APPEARANCE_LABELS[selectedDayLog.appearance].label}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Selo:</span>
                  <strong className="text-slate-900">{STAMP_DETAILS[selectedDayLog.stamp].name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Relação:</span>
                  <strong className="text-slate-900">{selectedDayLog.coitus}</strong>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => onEditLog(selectedDayLog)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
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
