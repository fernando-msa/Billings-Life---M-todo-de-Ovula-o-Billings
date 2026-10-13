import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  FileSpreadsheet,
  Info,
  Camera,
  Moon,
  Sun,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Cycle, DailyLog, ClinicalProfile } from '../types/billings';
import {
  STAMP_DETAILS,
  SENSATION_LABELS,
  APPEARANCE_LABELS,
  BLEEDING_LABELS,
} from '../utils/billingsEngine';
import { exportCycleToCSV } from '../utils/storage';

interface StampChartProps {
  cycles: Cycle[];
  activeCycleId: string;
  profile: ClinicalProfile;
  onSelectCycle: (id: string) => void;
  onStartNewCycle: () => void;
  onEditLog: (log: DailyLog) => void;
  onOpenAIAnalyzerWithPhoto?: (photoUrl: string) => void;
}

export const StampChart: React.FC<StampChartProps> = ({
  cycles,
  activeCycleId,
  profile,
  onSelectCycle,
  onStartNewCycle,
  onEditLog,
  onOpenAIAnalyzerWithPhoto,
}) => {
  const currentCycle = cycles.find((c) => c.id === activeCycleId) || cycles[cycles.length - 1];
  const [selectedDayLog, setSelectedDayLog] = useState<DailyLog | null>(
    currentCycle?.logs[currentCycle.logs.length - 1] || null
  );
  const tapeScrollRef = useRef<HTMLDivElement>(null);

  if (!currentCycle) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
        <p className="text-stone-600 text-sm">Nenhum ciclo encontrado.</p>
        <button
          onClick={onStartNewCycle}
          className="px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          Iniciar Primeiro Ciclo
        </button>
      </div>
    );
  }

  // Calculate cycle statistics
  const logs = currentCycle.logs;
  const peakLog = logs.find((l) => l.isPeak);
  const totalDays = logs.length;
  const follicularLength = peakLog ? peakLog.cycleDay : null;
  const lutealLength = peakLog && currentCycle.isFinished ? totalDays - peakLog.cycleDay : null;

  const scrollToLatestDay = () => {
    if (tapeScrollRef.current) {
      tapeScrollRef.current.scrollTo({
        left: tapeScrollRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cycle Selector Header & Export */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center shrink-0 border border-emerald-200/60">
            <Calendar className="w-5 h-5 text-[#1B4332]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-none">
                Ciclo #{currentCycle.cycleNumber}
              </h2>
              {currentCycle.isFinished ? (
                <span className="text-[11px] text-stone-500 font-medium">· Concluído ({logs.length} dias)</span>
              ) : (
                <span className="text-[11px] text-[#1B4332] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                  Em Andamento (D{logs.length})
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Início: {new Date(currentCycle.startDate).toLocaleDateString('pt-BR')}
              {currentCycle.endDate && ` · Fim: ${new Date(currentCycle.endDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>

        {/* Cycle Switcher Tabs & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle selector pill */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto max-w-full">
            {cycles.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCycle(c.id);
                  setSelectedDayLog(c.logs[c.logs.length - 1] || null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  c.id === currentCycle.id
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ciclo {c.cycleNumber} {c.isFinished ? '' : '(Atual)'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCycleToCSV(currentCycle, profile)}
              title="Exportar dados deste ciclo em planilha CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={onStartNewCycle}
              title="Registrar início de nova menstruação"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Ciclo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cycle Scientific KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-1">Duração Atual</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-stone-900">{totalDays}</span>
            <span className="text-xs text-stone-500 font-mono">dias</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block truncate">
            {currentCycle.isFinished ? 'Ciclo finalizado' : 'Registro em curso'}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-1">Dia do Ápice</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-700">
              {peakLog ? `D${peakLog.cycleDay}` : '—'}
            </span>
            {peakLog && (
              <span className="text-[11px] text-stone-500 font-mono">
                ({new Date(peakLog.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block truncate">
            {peakLog ? 'Ovulação confirmada' : 'Aguardando ápice'}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-1">Fase Folicular</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-stone-900">
              {follicularLength ? follicularLength : '—'}
            </span>
            <span className="text-xs text-stone-500 font-mono">dias</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block truncate">
            {follicularLength ? 'Maturação folicular' : 'Em observação'}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-1">Fase Lútea</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-800">
              {lutealLength ? lutealLength : peakLog ? `${totalDays - peakLog.cycleDay}` : '—'}
            </span>
            <span className="text-xs text-stone-500 font-mono">dias</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block truncate">
            {lutealLength && lutealLength < 10
              ? 'Atenção: fase lútea curta (<10d)'
              : 'Ideal: 11 a 16 dias'}
          </span>
        </div>
      </div>

      {/* Official Billings Horizontal Stamp Chart */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)]">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-serif font-bold text-stone-900">
              Fita de Selos Clínicos (Padrão WOOMB)
            </h3>
            <span className="text-[11px] text-stone-400">
              Toque em qualquer selo para inspecionar ou editar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToLatestDay}
              className="text-[11px] font-semibold text-[#1B4332] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Ir para hoje</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-stone-400 font-mono">
              {logs.length} dias
            </span>
          </div>
        </div>

        {/* Scrollable Horizontal Tape of Stamps */}
        <div ref={tapeScrollRef} className="overflow-x-auto pb-3 custom-scrollbar touch-scroll">
          <div className="inline-flex gap-1.5 min-w-full py-1">
            {logs.map((log) => {
              const stampInfo = STAMP_DETAILS[log.stamp];
              const isSelected = selectedDayLog?.id === log.id;

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedDayLog(log)}
                  className={`flex flex-col items-center w-13 sm:w-14 shrink-0 rounded-xl p-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-[#1B4332] ring-2 ring-[#1B4332]/15 shadow-sm bg-emerald-50/40'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  {/* Cycle Day header */}
                  <span className="text-[10px] font-mono font-bold text-stone-700 mb-1">
                    D{log.cycleDay}
                  </span>

                  {/* Stamp Graphic */}
                  <div
                    className={`w-10 sm:w-11 h-14 sm:h-16 rounded-md ${stampInfo.bg} flex flex-col items-center justify-center relative shadow-2xs border ${
                      log.stamp === 'white_baby' ? 'border-stone-300' : 'border-transparent'
                    }`}
                  >
                    {/* Peak X mark */}
                    {log.isPeak && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-black text-rose-700 leading-none drop-shadow-xs">
                          X
                        </span>
                      </div>
                    )}

                    {/* Post-peak numbers 1, 2, 3 */}
                    {log.postPeakCount && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl sm:text-2xl font-black text-stone-900 leading-none">
                          {log.postPeakCount}
                        </span>
                      </div>
                    )}

                    {/* Interruption count */}
                    {log.interruptionCount && !log.postPeakCount && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-black text-amber-900 leading-none">
                          i{log.interruptionCount}
                        </span>
                      </div>
                    )}

                    {/* Baby icon for fertile stamp */}
                    {(log.stamp === 'white_baby' || log.stamp === 'yellow_baby') && !log.isPeak && !log.postPeakCount && (
                      <span className="text-base select-none">👶</span>
                    )}

                    {/* Red blood drop for bleeding */}
                    {log.stamp === 'red' && (
                      <span className="text-xs select-none">🩸</span>
                    )}

                    {/* Green leaf for dry */}
                    {log.stamp === 'green' && !log.postPeakCount && (
                      <span className="text-xs select-none">🌿</span>
                    )}

                    {/* Yellow sun for BIP */}
                    {log.stamp === 'yellow_plain' && !log.postPeakCount && (
                      <span className="text-xs select-none">☀️</span>
                    )}
                  </div>

                  {/* Coitus / Photo markers */}
                  <div className="flex items-center gap-1 mt-1.5 h-3.5">
                    {log.coitus === 'noite' && (
                      <span title="Relação à noite (Regra 2)" className="text-indigo-600">
                        <Moon className="w-3 h-3" />
                      </span>
                    )}
                    {log.coitus === 'dia' && (
                      <span title="Relação durante o dia" className="text-amber-600">
                        <Sun className="w-3 h-3" />
                      </span>
                    )}
                    {log.photoUrl && (
                      <span title="Foto de muco anexada" className="text-emerald-700">
                        <Camera className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Date footer */}
                  <span className="text-[9px] font-mono text-stone-400 mt-0.5">
                    {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>

                  {/* Sensation preview */}
                  <span className="text-[9px] text-stone-600 truncate max-w-full mt-0.5 text-center leading-tight">
                    {log.sensation === 'seca' ? 'Seca' : log.sensation === 'lubrificada' ? 'Lubrif.' : log.sensation === 'escorregadia' ? 'Escorr.' : log.sensation === 'umida' ? 'Úmida' : log.sensation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Clinical Detail Inspector */}
        {selectedDayLog && (
          <div className="mt-4 pt-4 border-t border-stone-200/80 bg-[#FAF8F5] p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    Detalhes do Dia {selectedDayLog.cycleDay} (
                    {new Date(selectedDayLog.date).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                    })}
                    )
                  </span>
                  {selectedDayLog.isPeak && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded-md">
                      Dia Ápice (X)
                    </span>
                  )}
                  {selectedDayLog.postPeakCount && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-md">
                      Pós-Ápice {selectedDayLog.postPeakCount}/3
                    </span>
                  )}
                </div>

                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Sensação:</span>
                    <strong className="text-stone-900">{SENSATION_LABELS[selectedDayLog.sensation].label}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Aparência:</span>
                    <strong className="text-stone-900">{APPEARANCE_LABELS[selectedDayLog.appearance].label}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Sangramento:</span>
                    <strong className="text-stone-900">{BLEEDING_LABELS[selectedDayLog.bleeding]}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Relação Sexual:</span>
                    <strong className="text-stone-900">
                      {selectedDayLog.coitus === 'noite' ? 'À noite (Regra 2)' : selectedDayLog.coitus === 'dia' ? 'Durante o dia' : 'Nenhuma'}
                    </strong>
                  </div>
                </div>

                {selectedDayLog.notes && (
                  <p className="mt-2 text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <strong>Anotações:</strong> {selectedDayLog.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => onEditLog(selectedDayLog)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Dia</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
