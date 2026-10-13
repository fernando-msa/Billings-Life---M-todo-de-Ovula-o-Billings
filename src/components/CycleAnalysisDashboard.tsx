import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Calendar,
  Sparkles,
  Heart,
  ShieldCheck,
  Droplets,
  Layers,
  BarChart2,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Cycle, ClinicalProfile } from '../types/billings';

interface CycleAnalysisDashboardProps {
  cycles: Cycle[];
  profile: ClinicalProfile;
}

interface CycleStatItem {
  cycleId: string;
  name: string;
  cycleNumber: number;
  totalDays: number;
  fertileDays: number;
  infertileDays: number;
  bleedingDays: number;
  hasPeak: boolean;
  peakDay: number | null;
  lutealDays: number | null;
  isFinished: boolean;
  fertilePercentage: number;
}

export const CycleAnalysisDashboard: React.FC<CycleAnalysisDashboardProps> = ({
  cycles,
  profile,
}) => {
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');

  // Process data for each cycle
  const cycleStats: CycleStatItem[] = cycles.map((cycle) => {
    const logs = cycle.logs;
    const totalDays = logs.length;

    let bleedingDays = 0;
    let fertileDays = 0;
    let infertileDays = 0;

    const peakLog = logs.find((l) => l.isPeak);
    const peakDay = peakLog ? peakLog.cycleDay : cycle.peakDayIndex || null;

    logs.forEach((log) => {
      const isBleeding = log.stamp === 'red' || (log.bleeding !== 'nenhum' && log.phase === 'menstruation');
      const isFertile =
        log.phase === 'fertile_evolving' ||
        log.phase === 'peak' ||
        log.phase === 'post_peak_count' ||
        log.phase === 'interruption' ||
        log.isPeak ||
        log.postPeakCount !== null ||
        log.stamp === 'white_baby' ||
        log.stamp === 'yellow_baby';

      if (isBleeding) {
        bleedingDays++;
      } else if (isFertile) {
        fertileDays++;
      } else {
        infertileDays++;
      }
    });

    const lutealDays = peakDay ? totalDays - peakDay : null;
    const fertilePercentage = totalDays > 0 ? Math.round((fertileDays / totalDays) * 100) : 0;

    return {
      cycleId: cycle.id,
      name: `Ciclo ${cycle.cycleNumber}${cycle.isFinished ? '' : ' (Atual)'}`,
      cycleNumber: cycle.cycleNumber,
      totalDays,
      fertileDays,
      infertileDays,
      bleedingDays,
      hasPeak: !!peakDay,
      peakDay,
      lutealDays,
      isFinished: cycle.isFinished,
      fertilePercentage,
    };
  });

  // Calculate overall aggregates
  const completedOrSignificantCycles = cycleStats.filter((c) => c.totalDays >= 5);
  const avgTotalDays =
    completedOrSignificantCycles.length > 0
      ? (
          completedOrSignificantCycles.reduce((acc, curr) => acc + curr.totalDays, 0) /
          completedOrSignificantCycles.length
        ).toFixed(1)
      : (profile.cycleLengthAverage || 28).toString();

  const avgFertileDays =
    completedOrSignificantCycles.length > 0
      ? (
          completedOrSignificantCycles.reduce((acc, curr) => acc + curr.fertileDays, 0) /
          completedOrSignificantCycles.length
        ).toFixed(1)
      : '7.5';

  const avgInfertileDays =
    completedOrSignificantCycles.length > 0
      ? (
          completedOrSignificantCycles.reduce((acc, curr) => acc + curr.infertileDays, 0) /
          completedOrSignificantCycles.length
        ).toFixed(1)
      : '16.0';

  const cyclesWithLuteal = completedOrSignificantCycles.filter((c) => c.lutealDays !== null && c.lutealDays > 0);
  const avgLutealDays =
    cyclesWithLuteal.length > 0
      ? (
          cyclesWithLuteal.reduce((acc, curr) => acc + (curr.lutealDays || 0), 0) /
          cyclesWithLuteal.length
        ).toFixed(1)
      : '13.0';

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: CycleStatItem = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-lg text-xs space-y-2 min-w-[210px]">
          <div className="border-b border-stone-100 pb-1.5 flex items-center justify-between">
            <span className="font-serif font-bold text-stone-900 text-sm">{data.name}</span>
            <span className="text-[11px] font-mono text-stone-500">
              Total: <strong>{data.totalDays} dias</strong>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-rose-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Dias Férteis:
              </span>
              <strong className="font-mono">{data.fertileDays} dias ({data.fertilePercentage}%)</strong>
            </div>

            <div className="flex items-center justify-between text-emerald-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332] inline-block" />
                Dias Infértil / PBI:
              </span>
              <strong className="font-mono">{data.infertileDays} dias</strong>
            </div>

            <div className="flex items-center justify-between text-red-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                Menstruação:
              </span>
              <strong className="font-mono">{data.bleedingDays} dias</strong>
            </div>
          </div>

          {data.peakDay && (
            <div className="pt-1.5 border-t border-stone-100 text-[11px] text-stone-600 flex justify-between">
              <span>Dia Ápice: <strong>D{data.peakDay}</strong></span>
              {data.lutealDays !== null && (
                <span>Fase Lútea: <strong>{data.lutealDays} dias</strong></span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-[0_2px_12px_rgba(28,61,47,0.04)] space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-[#1B4332] rounded-xl border border-emerald-200/60">
              <BarChart2 className="w-5 h-5 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">
                Análise Comparativa de Ciclos Menstruais
              </h3>
              <p className="text-xs text-stone-500">
                Distribuição biométrica de dias férteis, infertilidade (PBI) e duração média
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Switcher (Stacked vs Grouped) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'stacked'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Empilhado (Total)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'grouped'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Lado a Lado</span>
          </button>
        </div>
      </div>

      {/* 4 Clinical KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Duração Média */}
        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-stone-200/80">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
            Duração Média
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 tabular-nums">
              {avgTotalDays}
            </span>
            <span className="text-xs text-stone-500 font-mono">dias</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Padrão ideal: 24 a 35 dias
          </span>
        </div>

        {/* KPI 2: Dias Férteis Médios */}
        <div className="bg-rose-50/50 p-3.5 sm:p-4 rounded-xl border border-rose-200/80">
          <span className="text-[11px] uppercase tracking-wider font-bold text-rose-800 block mb-1">
            Janela Fértil Média
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 tabular-nums">
              {avgFertileDays}
            </span>
            <span className="text-xs text-rose-700 font-mono">dias/ciclo</span>
          </div>
          <span className="text-[11px] text-rose-800/80 mt-1 block">
            Muco fértil + Ápice + 3 dias
          </span>
        </div>

        {/* KPI 3: Dias Infértil / PBI Médios */}
        <div className="bg-emerald-50/50 p-3.5 sm:p-4 rounded-xl border border-emerald-200/80">
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 block mb-1">
            Dias Infértil (PBI)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 tabular-nums">
              {avgInfertileDays}
            </span>
            <span className="text-xs text-emerald-800 font-mono">dias/ciclo</span>
          </div>
          <span className="text-[11px] text-emerald-800/80 mt-1 block">
            Secura & Fase Lútea estável
          </span>
        </div>

        {/* KPI 4: Fase Lútea Média */}
        <div className="bg-amber-50/50 p-3.5 sm:p-4 rounded-xl border border-amber-200/80">
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 block mb-1">
            Fase Lútea Média
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 tabular-nums">
              {avgLutealDays}
            </span>
            <span className="text-xs text-amber-900 font-mono">dias</span>
          </div>
          <span className="text-[11px] text-amber-900/80 mt-1 block">
            Suficiência progestogênica (11-16d)
          </span>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="bg-[#FAF8F5]/60 p-3 sm:p-5 rounded-2xl border border-stone-200/80">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cycleStats}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#4B5563', fontSize: 11 }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#4B5563', fontSize: 11 }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
                label={{
                  value: 'Dias',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#6B7280',
                  fontSize: 11,
                  offset: 25,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />

              {chartMode === 'stacked' ? (
                <>
                  <Bar
                    dataKey="bleedingDays"
                    name="Menstruação / Sangramento"
                    fill="#DC2626"
                    stackId="cycle"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="infertileDays"
                    name="Dias Infértil / PBI"
                    fill="#1B4332"
                    stackId="cycle"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="fertileDays"
                    name="Dias Férteis (Janela)"
                    fill="#E11D48"
                    stackId="cycle"
                    radius={[6, 6, 0, 0]}
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="bleedingDays"
                    name="Menstruação"
                    fill="#DC2626"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="infertileDays"
                    name="Dias Infértil (PBI)"
                    fill="#1B4332"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="fertileDays"
                    name="Dias Férteis"
                    fill="#E11D48"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="mt-3 pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>A janela fértil inclui dias de muco em evolução, dia Ápice e a contagem de 3 dias pós-ápice (WOOMB).</span>
          </span>
          <span className="font-mono text-stone-600">
            {cycles.length} ciclos monitorados
          </span>
        </div>
      </div>
    </div>
  );
};
