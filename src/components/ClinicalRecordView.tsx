import React, { useState } from 'react';
import {
  Download,
  Upload,
  Printer,
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  User,
  Shield,
  Stethoscope,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ClinicalProfile, Cycle, GoalType } from '../types/billings';
import {
  exportClinicalDataAsJSON,
  importClinicalDataFromJSON,
  saveClinicalProfile,
} from '../utils/storage';
import { STAMP_DETAILS, SENSATION_LABELS, APPEARANCE_LABELS } from '../utils/billingsEngine';

interface ClinicalRecordViewProps {
  profile: ClinicalProfile;
  cycles: Cycle[];
  onUpdateProfile: (updated: ClinicalProfile) => void;
  onRefreshData: () => void;
}

export const ClinicalRecordView: React.FC<ClinicalRecordViewProps> = ({
  profile,
  cycles,
  onUpdateProfile,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<ClinicalProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [selectedCycleForReport, setSelectedCycleForReport] = useState<string>(
    cycles[cycles.length - 1]?.id || ''
  );
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const activeReportCycle = cycles.find((c) => c.id === selectedCycleForReport) || cycles[cycles.length - 1];

  const handleInputChange = (field: keyof ClinicalProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...formData, lastUpdated: new Date().toISOString() };
    saveClinicalProfile(updated);
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Processando importação...');
    const result = await importClinicalDataFromJSON(file);
    setImportStatus(result.message);
    if (result.success) {
      onRefreshData();
    }
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleGenerateAISummary = async () => {
    if (!activeReportCycle) return;

    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/clinical-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleData: {
            cycleNumber: activeReportCycle.cycleNumber,
            startDate: activeReportCycle.startDate,
            endDate: activeReportCycle.endDate,
            totalDays: activeReportCycle.logs.length,
            peakDay: activeReportCycle.logs.find((l) => l.isPeak)?.cycleDay || 'Não identificado',
            logsSummary: activeReportCycle.logs.map((l) => ({
              dia: l.cycleDay,
              selo: l.stamp,
              sensacao: l.sensation,
              aparencia: l.appearance,
              coito: l.coitus,
            })),
          },
          userProfile: profile,
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed generating AI summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Action Header & Backup Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Prontuário & Continuidade do Cuidado
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Ficha Ginecológica Oficial</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Prontuário Clínico & Exportação para Profissionais
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Mantenha o histórico ginecológico completo atualizado. Exporte o prontuário em JSON para backup, ou gere o relatório mensal estruturado pronto para impressão e encaminhamento à sua médica ou instrutora credenciada.
            </p>
          </div>

          {/* Backup / Export / Import Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportClinicalDataAsJSON}
              title="Download do prontuário completo em formato JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Prontuário (JSON)</span>
            </button>

            <label
              title="Upload de arquivo JSON para restaurar histórico"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Upload Prontuário (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório (PDF)</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium">
            {importStatus}
          </div>
        )}
      </div>

      {/* Clinical Form: Demographics, History, PBI */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs no-print">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Ficha Clínica da Paciente
            </h3>
          </div>
          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Salvo com sucesso!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo da Paciente
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivo do Método
              </label>
              <select
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value as GoalType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="avoid_pregnancy">Evitar Gravidez (Espaçamento)</option>
                <option value="achieve_pregnancy">Conseguir Gravidez (Concepção)</option>
                <option value="health_monitoring">Monitoramento de Saúde</option>
              </select>
            </div>
          </div>

          {/* Gynecological History */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Histórico Ginecológico & Reprodutivo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Idade Menarca
                </label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={formData.menarcheAge}
                  onChange={(e) => handleInputChange('menarcheAge', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Gestações (G)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityG}
                  onChange={(e) => handleInputChange('parityG', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Partos (P)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityP}
                  onChange={(e) => handleInputChange('parityP', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Abortos (A)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityA}
                  onChange={(e) => handleInputChange('parityA', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Duração Média (dias)
                </label>
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={formData.cycleLengthAverage}
                  onChange={(e) => handleInputChange('cycleLengthAverage', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Meses Pós-Pílula
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pillDiscontinuationMonths}
                  onChange={(e) => handleInputChange('pillDiscontinuationMonths', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis of BIP (Padrão Básico de Infertilidade) */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Padrão Básico de Infertilidade (PBI) Reconhecido
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                  formData.diagnosedBipType === 'secura'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bipType"
                  checked={formData.diagnosedBipType === 'secura'}
                  onChange={() => handleInputChange('diagnosedBipType', 'secura')}
                  className="mt-0.5 text-emerald-700"
                />
                <div>
                  <strong className="block text-xs text-slate-900">Secura Contínua (Selo Verde)</strong>
                  <span className="text-[11px] text-slate-500">
                    Ausência completa de sensação ou muco após o término da menstruação.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                  formData.diagnosedBipType === 'muco_constante'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bipType"
                  checked={formData.diagnosedBipType === 'muco_constante'}
                  onChange={() => handleInputChange('diagnosedBipType', 'muco_constante')}
                  className="mt-0.5 text-emerald-700"
                />
                <div>
                  <strong className="block text-xs text-slate-900">Muco Constante Inalterado (Selo Amarelo)</strong>
                  <span className="text-[11px] text-slate-500">
                    Presença de secreção diária sem alteração de textura, cor ou sensação por semanas.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                  formData.diagnosedBipType === 'em_investigacao'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="bipType"
                  checked={formData.diagnosedBipType === 'em_investigacao'}
                  onChange={() => handleInputChange('diagnosedBipType', 'em_investigacao')}
                  className="mt-0.5 text-emerald-700"
                />
                <div>
                  <strong className="block text-xs text-slate-900">Em Investigação / Primeiros Ciclos</strong>
                  <span className="text-[11px] text-slate-500">
                    Fase inicial de aprendizagem das sensações com a instrutora.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Medications & Instructor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicamentos Contínuos ou Suplementos
              </label>
              <input
                type="text"
                value={formData.currentMedications}
                onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                placeholder="Ex: Levotiroxina, Metformina, Antialérgicos..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instrutora Credenciada / Médico Responsável
              </label>
              <input
                type="text"
                value={formData.instructorName || ''}
                onChange={(e) => handleInputChange('instructorName', e.target.value)}
                placeholder="Ex: Clara Silveira (CENPLAFAM #4089)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações no Prontuário</span>
            </button>
          </div>
        </form>
      </div>

      {/* PRINTABLE REPORT PREVIEW (Visible in browser & fully formatted for window.print()) */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs print-avoid-break">
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Relatório Mensal para Profissionais de Saúde
            </h3>
            <p className="text-xs text-slate-500">
              Pré-visualização do documento formal pronto para impressão / PDF (formato A4)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCycleForReport}
              onChange={(e) => setSelectedCycleForReport(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  Ciclo #{c.cycleNumber} ({c.isFinished ? 'Concluído' : 'Atual'})
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateAISummary}
              disabled={isGeneratingSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isGeneratingSummary ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Gerar Parecer Clínico (IA)</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* CLINICAL DOCUMENT BODY (Formatted for A4 Print) */}
        <div className="p-2 sm:p-6 text-slate-900 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">
                  Prontuário de Saúde Ginecológica & Reprodutiva
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
                Relatório de Acompanhamento do Método Billings
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Diretrizes WOOMB International / Centro de Planejamento Familiar (CENPLAFAM)
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block">Data de Emissão</span>
              <strong className="font-mono text-slate-900">
                {new Date().toLocaleDateString('pt-BR')}
              </strong>
            </div>
          </div>

          {/* Patient Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Paciente</span>
              <strong className="text-slate-900 text-sm">{profile.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Data Nasc. / Idade</span>
              <strong className="text-slate-900">
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '—'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Objetivo Clínico</span>
              <strong className="text-slate-900">
                {profile.goal === 'avoid_pregnancy'
                  ? 'Espaçamento (Evitar)'
                  : profile.goal === 'achieve_pregnancy'
                  ? 'Concepção (Engravidar)'
                  : 'Saúde Geral'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">PBI Diagnosticado</span>
              <strong className="text-slate-900 capitalize">
                {profile.diagnosedBipType === 'secura' ? 'Secura Contínua' : 'Muco Inalterado'}
              </strong>
            </div>
          </div>

          {/* Cycle Stamp Horizontal Tape */}
          {activeReportCycle && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Gráfico de Selos do Ciclo #{activeReportCycle.cycleNumber}
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {activeReportCycle.logs.length} dias avaliados
                </span>
              </div>

              <div className="overflow-x-auto pb-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                <div className="inline-flex gap-1 min-w-full">
                  {activeReportCycle.logs.map((log) => {
                    const st = STAMP_DETAILS[log.stamp];
                    return (
                      <div
                        key={log.id}
                        className="w-8 flex flex-col items-center text-center shrink-0"
                      >
                        <span className="text-[9px] font-mono font-bold text-slate-600 mb-0.5">
                          {log.cycleDay}
                        </span>
                        <div
                          className={`w-7 h-10 rounded-xs ${st.bg} flex items-center justify-center font-bold text-xs border border-slate-300 relative`}
                        >
                          {log.isPeak ? (
                            <span className="text-rose-700 font-black text-sm">X</span>
                          ) : log.postPeakCount ? (
                            <span className="text-slate-900 font-bold text-xs">{log.postPeakCount}</span>
                          ) : (
                            <span className="text-[9px]">{st.icon}</span>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                          {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AI or Instructor Synthesis */}
          {aiSummary ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <strong className="text-emerald-950 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Parecer Clínico Automatizado (Gemini 3.8 Flash)
                </strong>
                <span className="text-[10px] text-emerald-800 font-mono">
                  WOOMB Standard Guidelines
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block mb-0.5">Visão do Ciclo:</span>
                  <p className="text-slate-800">{aiSummary.cycleOverview}</p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Avaliação do Ápice:</span>
                  <p className="text-slate-800">{aiSummary.peakEvaluation}</p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Suficiência Lútea:</span>
                  <p className="text-slate-800">{aiSummary.lutealPhaseSufficiency}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Conduta & Observações:</span>
                <p className="text-slate-800 font-medium">{aiSummary.instructorNotes}</p>
              </div>
            </div>
          ) : (
            <div className="no-print p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
              <p className="text-xs text-slate-500">
                Você pode clicar no botão <strong>&ldquo;Gerar Parecer Clínico (IA)&rdquo;</strong> acima para sintetizar a interpretação médica deste ciclo.
              </p>
            </div>
          )}

          {/* Table of Daily Records */}
          {activeReportCycle && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Tabela Diária de Observações Clínicas
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-2">Dia</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Sensação Vulvar</th>
                      <th className="p-2">Aparência Muco</th>
                      <th className="p-2">Sangramento</th>
                      <th className="p-2">Selo</th>
                      <th className="p-2">Coito</th>
                      <th className="p-2">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
                    {activeReportCycle.logs.map((log) => (
                      <tr key={log.id} className={log.isPeak ? 'bg-rose-50/70 font-semibold' : ''}>
                        <td className="p-2 font-bold text-slate-900">D{log.cycleDay}</td>
                        <td className="p-2">
                          {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="p-2">{SENSATION_LABELS[log.sensation].label}</td>
                        <td className="p-2">{APPEARANCE_LABELS[log.appearance].label}</td>
                        <td className="p-2 capitalize">{log.bleeding}</td>
                        <td className="p-2">
                          <span className="font-semibold text-slate-900">
                            {log.stamp} {log.isPeak ? '(Ápice X)' : log.postPeakCount ? `(+${log.postPeakCount})` : ''}
                          </span>
                        </td>
                        <td className="p-2">{log.coitus}</td>
                        <td className="p-2 truncate max-w-xs">{log.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medical & Instructor Signature Section (for print) */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break">
            <div>
              <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto">
                <strong className="block text-slate-900">{profile.fullName}</strong>
                <span className="text-slate-500">Assinatura da Paciente</span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto">
                <strong className="block text-slate-900">
                  {profile.instructorName || 'Instrutora Credenciada WOOMB'}
                </strong>
                <span className="text-slate-500">
                  Carimbo / Registro Profissional
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
