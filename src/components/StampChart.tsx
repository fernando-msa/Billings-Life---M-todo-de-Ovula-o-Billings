import React, { useState } from 'react';
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

  if (!currentCycle) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-600">Nenhum ciclo encontrado.</p>
        <button
          onClick={onStartNewCycle}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold"
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
  const fertileDaysCount = logs.filter(
    (l) => l.stamp === 'white_baby' || l.stamp === 'yellow_baby' || l.isPeak
  ).length;

  return (
    <div className="space-y-6">
      {/* Cycle Selector Header & Export */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Ciclo #{currentCycle.cycleNumber}
              </h2>
              {currentCycle.isFinished ? (
                <span className="text-xs text-slate-500 font-medium">· Concluído ({logs.length} dias)</span>
              ) : (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Em Andamento (D{logs.length})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Início em {new Date(currentCycle.startDate).toLocaleDateString('pt-BR')}
              {currentCycle.endDate && ` · Término em ${new Date(currentCycle.endDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>

        {/* Cycle Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {cycles.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCycle(c.id);
                  setSelectedDayLog(c.logs[c.logs.length - 1] || null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  c.id === currentCycle.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ciclo {c.cycleNumber} {c.isFinished ? '' : '(Atual)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCycleToCSV(currentCycle, profile)}
            title="Exportar dados deste ciclo em planilha CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onStartNewCycle}
            title="Registrar início de nova menstruação"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Ciclo</span>
          </button>
        </div>
      </div>

      {/* Cycle Scientific KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Duração Atual</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{totalDays}</span>
            <span className="text-xs text-slate-500 font-mono">dias</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {currentCycle.isFinished ? 'Ciclo finalizado' : 'Registro em curso'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Dia do Ápice</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
              {peakLog ? `D${peakLog.cycleDay}` : '—'}
            </span>
            {peakLog && <span className="text-xs text-slate-500 font-mono">({new Date(peakLog.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</span>}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {peakLog ? 'Ovulação confirmada' : 'Ainda não identificado'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Fase Folicular</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {follicularLength ? follicularLength : '—'}
            </span>
            <span className="text-xs text-slate-500 font-mono">dias até ápice</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {follicularLength ? 'Maturação folicular' : 'Em observação'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Fase Lútea</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {lutealLength ? lutealLength : peakLog ? `${totalDays - peakLog.cycleDay} (em curso)` : '—'}
            </span>
            <span className="text-xs text-slate-500 font-mono">dias</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lutealLength && lutealLength < 10
              ? 'Atenção: fase lútea curta (<10d)'
              : 'Ideal: 11 a 16 dias de progesterona'}
          </span>
        </div>
      </div>

      {/* Official Billings Horizontal Stamp Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Gráfico de Selos Clínicos (Padrão WOOMB International)
            </h3>
            <span className="text-xs text-slate-400">· Clique em qualquer selo para inspecionar</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {logs.length} dias registrados
          </span>
        </div>

        {/* Scrollable Horizontal Tape of Stamps */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="inline-flex gap-1.5 min-w-full py-2">
            {logs.map((log) => {
              const stampInfo = STAMP_DETAILS[log.stamp];
              const isSelected = selectedDayLog?.id === log.id;

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedDayLog(log)}
                  className={`flex flex-col items-center w-14 shrink-0 rounded-lg p-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm bg-slate-50'
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  {/* Cycle Day header */}
                  <span className="text-[11px] font-mono font-bold text-slate-700 mb-1">
                    D{log.cycleDay}
                  </span>

                  {/* Stamp Graphic */}
                  <div
                    className={`w-11 h-16 rounded-md ${stampInfo.bg} flex flex-col items-center justify-center relative shadow-xs border ${
                      log.stamp === 'white_baby' ? 'border-slate-300' : 'border-transparent'
                    }`}
                  >
                    {/* Peak X mark */}
                    {log.isPeak && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-rose-700 leading-none drop-shadow-xs">
                          X
                        </span>
                      </div>
                    )}

                    {/* Post-peak numbers 1, 2, 3 */}
                    {log.postPeakCount && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 leading-none">
                          {log.postPeakCount}
                        </span>
                      </div>
                    )}

                    {/* Interruption count */}
                    {log.interruptionCount && !log.postPeakCount && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-amber-900 leading-none">
                          i{log.interruptionCount}
                        </span>
                      </div>
                    )}

                    {/* Baby icon for fertile stamp */}
                    {(log.stamp === 'white_baby' || log.stamp === 'yellow_baby') && !log.isPeak && !log.postPeakCount && (
                      <span className="text-lg select-none">👶</span>
                    )}

                    {/* Red blood drop for bleeding */}
                    {log.stamp === 'red' && (
                      <span className="text-sm select-none">🩸</span>
                    )}

                    {/* Green leaf for dry */}
                    {log.stamp === 'green' && !log.postPeakCount && (
                      <span className="text-sm select-none">🌿</span>
                    )}

                    {/* Yellow sun for BIP */}
                    {log.stamp === 'yellow_plain' && !log.postPeakCount && (
                      <span className="text-sm select-none">☀️</span>
                    )}
                  </div>

                  {/* Coitus / Photo markers */}
                  <div className="flex items-center gap-1 mt-1.5 h-4">
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
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>

                  {/* Sensation preview */}
                  <span className="text-[9px] text-slate-600 truncate max-w-full mt-0.5 text-center leading-tight">
                    {log.sensation === 'seca' ? 'Seca' : log.sensation === 'lubrificada' ? 'Lubrif.' : log.sensation === 'escorregadia' ? 'Escorr.' : log.sensation === 'umida' ? 'Úmida' : log.sensation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Clinical Detail Inspector */}
        {selectedDayLog && (
          <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/60 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Detalhes do Dia {selectedDayLog.cycleDay} (
                    {new Date(selectedDayLog.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                    )
                  </span>
                  {selectedDayLog.isPeak && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded-md">
                      Dia Ápice (X)
                    </span>
                  )}
                  {selectedDayLog.postPeakCount && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
                      Contagem Pós-Ápice Dia {selectedDayLog.postPeakCount}/3
                    </span>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Sensação Vulvar:</span>
                    <strong className="text-slate-900">{SENSATION_LABELS[selectedDayLog.sensation].label}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aparência do Muco:</span>
                    <strong className="text-slate-900">{APPEARANCE_LABELS[selectedDayLog.appearance].label}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sangramento:</span>
                    <strong className="text-slate-900">{BLEEDING_LABELS[selectedDayLog.bleeding]}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Relação Sexual:</span>
                    <strong className="text-slate-900">
                      {selectedDayLog.coitus === 'noite'
                        ? 'Sim, à noite'
                        : selectedDayLog.coitus === 'dia'
                        ? 'Sim, durante o dia'
                        : 'Nenhuma'}
                    </strong>
                  </div>
                </div>

                {selectedDayLog.notes && (
                  <p className="mt-2 text-xs text-slate-600 italic">
                    Notas: &ldquo;{selectedDayLog.notes}&rdquo;
                  </p>
                )}

                {selectedDayLog.photoUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={selectedDayLog.photoUrl}
                      alt="Foto do muco registrado"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">Foto de Muco Anexada</span>
                      {selectedDayLog.photoAnalysis && (
                        <span className="text-emerald-700">
                          {selectedDayLog.photoAnalysis.consistencyClassification} · {selectedDayLog.photoAnalysis.visualFertilityTendency}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEditLog(selectedDayLog)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Dia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Official Billings WOOMB Legend */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Legenda dos Selos Oficiais WOOMB</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-rose-500 shrink-0 mt-0.5 shadow-xs" />
              <div>
                <strong className="block text-slate-800">Selo Vermelho</strong>
                <span className="text-slate-500 text-[11px]">Sangramento menstrual ou spotting</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-emerald-600 shrink-0 mt-0.5 shadow-xs" />
              <div>
                <strong className="block text-slate-800">Selo Verde</strong>
                <span className="text-slate-500 text-[11px]">Secura / PBI de ausência de muco</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-amber-400 shrink-0 mt-0.5 shadow-xs" />
              <div>
                <strong className="block text-slate-800">Selo Amarelo</strong>
                <span className="text-slate-500 text-[11px]">PBI de muco constante e inalterado</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-white border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center text-[10px]">
                👶
              </span>
              <div>
                <strong className="block text-slate-800">Branco c/ Bebê</strong>
                <span className="text-slate-500 text-[11px]">Muco fértil / em evolução / lubrificado</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-white border-2 border-rose-400 shrink-0 mt-0.5 flex items-center justify-center font-bold text-rose-700 text-xs">
                X
              </span>
              <div>
                <strong className="block text-slate-800">Símbolo do Ápice</strong>
                <span className="text-slate-500 text-[11px]">Último dia de sensação escorregadia</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-5 rounded-xs bg-slate-200 shrink-0 mt-0.5 flex items-center justify-center font-bold text-slate-800 text-xs">
                1 2 3
              </span>
              <div>
                <strong className="block text-slate-800">Contagem Pós-Ápice</strong>
                <span className="text-slate-500 text-[11px]">3 dias de sobrevida ovular e segurança</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
