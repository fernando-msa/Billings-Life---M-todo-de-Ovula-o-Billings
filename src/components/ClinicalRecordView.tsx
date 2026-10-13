import React, { useState, useMemo } from 'react';
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
  FileDown,
  BarChart2,
  PieChart,
  Info,
  Clock,
  Heart,
  Droplets,
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

  const activeReportCycle = cycles.find((c) => c.id === selectedCycleForReport) || cycles[cycles.length - 1];

  // Calculate comprehensive statistics for the active report cycle
  const cycleStats = useMemo(() => {
    if (!activeReportCycle) return null;
    const logs = activeReportCycle.logs;
    const totalDays = logs.length;
    let bleedingDays = 0;
    let fertileDays = 0;
    let infertileDays = 0;
    let coitusCount = 0;
    let coitusInFertilePhase = 0;
    let coitusInBip = 0;

    const peakLog = logs.find((l) => l.isPeak);
    const peakDay = peakLog ? peakLog.cycleDay : activeReportCycle.peakDayIndex || null;

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

      if (log.coitus !== 'nenhum') {
        coitusCount++;
        if (isFertile) coitusInFertilePhase++;
        else coitusInBip++;
      }
    });

    const lutealDays = peakDay ? totalDays - peakDay : null;
    const isLutealSufficient = lutealDays !== null ? lutealDays >= 11 : null;
    const fertilePercent = totalDays > 0 ? Math.round((fertileDays / totalDays) * 100) : 0;
    const infertilePercent = totalDays > 0 ? Math.round((infertileDays / totalDays) * 100) : 0;
    const bleedingPercent = totalDays > 0 ? Math.round((bleedingDays / totalDays) * 100) : 0;

    return {
      totalDays,
      bleedingDays,
      bleedingPercent,
      fertileDays,
      fertilePercent,
      infertileDays,
      infertilePercent,
      peakDay,
      lutealDays,
      isLutealSufficient,
      coitusCount,
      coitusInFertilePhase,
      coitusInBip,
    };
  }, [activeReportCycle]);

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

  // Download standalone printable clinical HTML report (opens ready-to-print or save as PDF)
  const handleDownloadPrintableReport = () => {
    if (!activeReportCycle) return;

    const reportTitle = `Relatorio_Clinico_Ciclo_${activeReportCycle.cycleNumber}_${profile.fullName.replace(/\s+/g, '_')}`;
    const issueDate = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 18pt; margin: 0; color: #0f172a; }
    .header p { margin: 4px 0 0; font-size: 9pt; color: #64748b; }
    .patient-card { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 9pt; }
    .patient-card strong { display: block; font-size: 10pt; color: #0f172a; margin-top: 2px; }
    .stats-card { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
    .stat-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; text-align: center; }
    .stat-box .val { font-size: 14pt; font-weight: bold; color: #0f172a; }
    .stat-box .lbl { font-size: 8pt; text-transform: uppercase; color: #475569; margin-top: 2px; }
    .stamps-tape { display: flex; flex-wrap: wrap; gap: 4px; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 16px; }
    .stamp-item { width: 32px; text-align: center; font-size: 8pt; }
    .stamp-box { width: 28px; height: 38px; border-radius: 3px; border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto; color: white; }
    .stamp-red { background: #dc2626 !important; }
    .stamp-green { background: #16a34a !important; }
    .stamp-yellow { background: #ca8a04 !important; }
    .stamp-white { background: #ffffff !important; color: #0f172a !important; border: 2px solid #0f172a !important; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 10px; }
    th { background: #f1f5f9; padding: 6px 8px; text-align: left; border: 1px solid #cbd5e1; font-weight: bold; text-transform: uppercase; font-size: 7.5pt; color: #334155; }
    td { padding: 5px 8px; border: 1px solid #e2e8f0; }
    tr.peak-row { background: #fff1f2 !important; font-weight: bold; }
    .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 9pt; page-break-inside: avoid; }
    .sign-line { border-top: 1px solid #64748b; padding-top: 6px; width: 80%; margin: 0 auto; }
    @media print { .no-print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="no-print-btn" style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="background: #1B4332; color: white; padding: 8px 16px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
      Imprimir / Salvar como PDF
    </button>
  </div>
  <div class="header">
    <div>
      <span style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #16a34a; letter-spacing: 1px;">Prontuário de Saúde Ginecológica & Reprodutiva</span>
      <h1>Relatório Clínico do Método Billings</h1>
      <p>Diretrizes Internacionais WOOMB / Centro de Planejamento Familiar (CENPLAFAM)</p>
    </div>
    <div style="text-align: right; font-size: 9pt;">
      <span style="color: #64748b;">Emissão</span><br>
      <strong>${issueDate}</strong>
    </div>
  </div>

  <div class="patient-card">
    <div><span style="color: #64748b;">Paciente</span><strong>${profile.fullName}</strong></div>
    <div><span style="color: #64748b;">Data Nasc. / Idade</span><strong>${profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '—'}</strong></div>
    <div><span style="color: #64748b;">Objetivo Clínico</span><strong>${profile.goal === 'avoid_pregnancy' ? 'Espaçamento (Evitar)' : profile.goal === 'achieve_pregnancy' ? 'Concepção' : 'Saúde Geral'}</strong></div>
    <div><span style="color: #64748b;">PBI Diagnosticado</span><strong>${profile.diagnosedBipType === 'secura' ? 'Secura Contínua' : 'Muco Inalterado'}</strong></div>
  </div>

  <h3 style="font-size: 11pt; text-transform: uppercase; margin: 14px 0 8px; color: #0f172a;">Resumo Estatístico do Ciclo #${activeReportCycle.cycleNumber}</h3>
  <div class="stats-card">
    <div class="stat-box">
      <div class="val">${cycleStats?.totalDays || 0} dias</div>
      <div class="lbl">Duração Total</div>
    </div>
    <div class="stat-box">
      <div class="val" style="color: #e11d48;">${cycleStats?.fertileDays || 0} dias (${cycleStats?.fertilePercent || 0}%)</div>
      <div class="lbl">Janela Fértil</div>
    </div>
    <div class="stat-box">
      <div class="val" style="color: #16a34a;">${cycleStats?.infertileDays || 0} dias (${cycleStats?.infertilePercent || 0}%)</div>
      <div class="lbl">Infertilidade / PBI</div>
    </div>
    <div class="stat-box">
      <div class="val">${cycleStats?.peakDay ? `D${cycleStats.peakDay} (${cycleStats.lutealDays}d lútea)` : 'Em Andamento'}</div>
      <div class="lbl">Dia Ápice & Fase Lútea</div>
    </div>
  </div>

  <h3 style="font-size: 11pt; text-transform: uppercase; margin: 14px 0 8px; color: #0f172a;">Gráfico Oficial de Selos Billings</h3>
  <div class="stamps-tape">
    ${activeReportCycle.logs.map((l) => {
      let bgClass = 'stamp-green';
      let symbol = '';
      if (l.stamp === 'red') bgClass = 'stamp-red';
      else if (l.stamp === 'yellow_plain' || l.stamp === 'yellow_baby') bgClass = 'stamp-yellow';
      else if (l.stamp === 'white_baby') bgClass = 'stamp-white';

      if (l.isPeak) symbol = 'X';
      else if (l.postPeakCount) symbol = `${l.postPeakCount}`;

      return `<div class="stamp-item">
        <span style="font-weight: bold; color: #475569;">D${l.cycleDay}</span>
        <div class="stamp-box ${bgClass}">${symbol}</div>
        <span style="color: #64748b; font-size: 7.5pt;">${new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
      </div>`;
    }).join('')}
  </div>

  <h3 style="font-size: 11pt; text-transform: uppercase; margin: 16px 0 8px; color: #0f172a;">Tabela Diária de Observações Clínicas & Muco</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 35px;">Dia</th>
        <th style="width: 55px;">Data</th>
        <th>Sensação Vulvar</th>
        <th>Aparência do Muco</th>
        <th>Fluxo</th>
        <th>Selo / Notação</th>
        <th>Coito</th>
        <th>Anotações Clínicas</th>
      </tr>
    </thead>
    <tbody>
      ${activeReportCycle.logs.map((l) => `
        <tr class="${l.isPeak ? 'peak-row' : ''}">
          <td style="font-weight: bold;">D${l.cycleDay}</td>
          <td>${new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td>
          <td>${SENSATION_LABELS[l.sensation]?.label || l.sensation}</td>
          <td>${APPEARANCE_LABELS[l.appearance]?.label || l.appearance}</td>
          <td>${l.bleeding}</td>
          <td>${l.stamp} ${l.isPeak ? '<strong>(ÁPICE X)</strong>' : l.postPeakCount ? `(+${l.postPeakCount})` : ''}</td>
          <td>${l.coitus}</td>
          <td>${l.notes || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <div class="sign-line">
        <strong>${profile.fullName}</strong><br>
        <span style="color: #64748b; font-size: 8pt;">Assinatura da Paciente</span>
      </div>
    </div>
    <div>
      <div class="sign-line">
        <strong>${profile.instructorName || 'Instrutora Credenciada WOOMB'}</strong><br>
        <span style="color: #64748b; font-size: 8pt;">${profile.instructorCredentials || 'Carimbo / Registro Profissional'}</span>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Action Header & Backup Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Prontuário & Continuidade do Cuidado
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-mono">Ficha Ginecológica Oficial</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-900">
              Prontuário Clínico & Exportação para Profissionais
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Mantenha o histórico ginecológico completo atualizado. Exporte o prontuário em PDF formatado para impressão clínica, incluindo o gráfico de selos, as observações de muco e o resumo de estatísticas do ciclo para sua médica ou instrutora credenciada.
            </p>
          </div>

          {/* Backup / Export / Import Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Abre a caixa de diálogo para salvar em PDF ou imprimir na folha A4"
            >
              <Printer className="w-4 h-4" />
              <span>Exportar PDF / Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPrintableReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Baixa o documento clínico formatado (.HTML) que pode ser salvo como PDF em qualquer dispositivo"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>Baixar Relatório Formatado</span>
            </button>

            <button
              onClick={exportClinicalDataAsJSON}
              title="Download do prontuário completo em formato JSON para backup"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Backup JSON</span>
            </button>

            <label
              title="Upload de arquivo JSON para restaurar histórico"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Restaurar JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium">
            {importStatus}
          </div>
        )}
      </div>

      {/* Clinical Form: Demographics, History, PBI */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs no-print">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-serif font-bold text-stone-900">
              Ficha Clínica da Paciente
            </h3>
          </div>

          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Salvo com sucesso</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Dados Pessoais & Contato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Nome Completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Reproductive History & Goal */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Histórico Reprodutivo & Objetivo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Idade Menarca</label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={formData.menarcheAge}
                  onChange={(e) => handleInputChange('menarcheAge', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Gestações (G)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityG}
                  onChange={(e) => handleInputChange('parityG', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Partos (P)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityP}
                  onChange={(e) => handleInputChange('parityP', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Abortos (A)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.parityA}
                  onChange={(e) => handleInputChange('parityA', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Duração Média Ciclo</label>
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={formData.cycleLengthAverage}
                  onChange={(e) => handleInputChange('cycleLengthAverage', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Meses sem Pílula</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pillDiscontinuationMonths}
                  onChange={(e) => handleInputChange('pillDiscontinuationMonths', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Diagnosis & Goal */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Classificação Clínica & Orientadora
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Objetivo do Método</label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value as GoalType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-medium"
                >
                  <option value="avoid_pregnancy">Espaçamento / Evitar Gravidez</option>
                  <option value="achieve_pregnancy">Concepção / Engravidar</option>
                  <option value="health_monitoring">Monitoramento de Saúde Ginecológica</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Padrão Básico de Infertilidade (PBI)</label>
                <select
                  value={formData.diagnosedBipType}
                  onChange={(e) => handleInputChange('diagnosedBipType', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-medium"
                >
                  <option value="secura">PBI de Secura (Infertilidade sem muco)</option>
                  <option value="muco_constante">PBI de Muco Constante Inalterado</option>
                  <option value="em_investigacao">Em Investigação Clínica Inicial</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Instrutora Credenciada</label>
                <input
                  type="text"
                  value={formData.instructorName || ''}
                  onChange={(e) => handleInputChange('instructorName', e.target.value)}
                  placeholder="Nome da instrutora WOOMB"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Credencial da Instrutora</label>
                <input
                  type="text"
                  value={formData.instructorCredentials || ''}
                  onChange={(e) => handleInputChange('instructorCredentials', e.target.value)}
                  placeholder="Ex: WOOMB-BR #4089"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Medications */}
          <div className="pt-4 border-t border-stone-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Medicamentos em Uso & Condições de Saúde
            </label>
            <input
              type="text"
              value={formData.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              placeholder="Ex: Levotiroxina, Suplementação vitamínica, SOP, Endometriose..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações no Prontuário</span>
            </button>
          </div>
        </form>
      </div>

      {/* PRINTABLE REPORT PREVIEW (Visible in browser & fully formatted for window.print() / PDF export) */}
      <div id="clinical-report-printable" className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-8 shadow-xs">
        {/* Toolbar in Screen View */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Relatório Clínico Formatado para Impressão & PDF
            </h3>
            <p className="text-xs text-stone-500">
              Inclui gráfico de selos completo, tabela de observações de muco e resumo estatístico do ciclo em padrão A4
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCycleForReport}
              onChange={(e) => setSelectedCycleForReport(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl font-medium"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isGeneratingSummary ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>Parecer Clínico IA</span>
            </button>

            <button
              onClick={handleDownloadPrintableReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
              title="Baixar arquivo HTML/PDF para abrir e imprimir em qualquer computador"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* CLINICAL DOCUMENT BODY (Optimized for A4 Print & Browser View) */}
        <div className="p-2 sm:p-6 text-stone-900 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1B4332]">
                  Prontuário de Saúde Ginecológica & Reprodutiva
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 mt-1">
                Relatório de Acompanhamento do Método Billings
              </h1>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Diretrizes WOOMB International / Centro de Planejamento Familiar (CENPLAFAM)
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-stone-400 block text-[11px]">Data de Emissão</span>
              <strong className="font-mono text-stone-900 text-sm">
                {new Date().toLocaleDateString('pt-BR')}
              </strong>
            </div>
          </div>

          {/* Patient Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50/80 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px]">Paciente</span>
              <strong className="text-stone-900 text-sm font-serif">{profile.fullName}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Data Nasc. / Idade</span>
              <strong className="text-stone-900">
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '—'}
              </strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Objetivo Clínico</span>
              <strong className="text-stone-900">
                {profile.goal === 'avoid_pregnancy'
                  ? 'Espaçamento (Evitar)'
                  : profile.goal === 'achieve_pregnancy'
                  ? 'Concepção (Engravidar)'
                  : 'Saúde Geral'}
              </strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">PBI Diagnosticado</span>
              <strong className="text-stone-900 capitalize">
                {profile.diagnosedBipType === 'secura' ? 'Secura Contínua' : 'Muco Inalterado'}
              </strong>
            </div>
          </div>

          {/* 1. RESUMO DE ESTATÍSTICAS DO CICLO (EXCLUSIVO & COMPLETO) */}
          {activeReportCycle && cycleStats && (
            <div className="space-y-2.5 print-avoid-break">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Resumo Estatístico do Ciclo #{activeReportCycle.cycleNumber}</span>
                </h4>
                <span className="text-xs text-stone-500 font-mono">
                  {activeReportCycle.startDate} {activeReportCycle.endDate ? `até ${activeReportCycle.endDate}` : '(Em andamento)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Duração Total */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Duração do Ciclo
                  </span>
                  <strong className="text-lg font-mono text-stone-900 block mt-0.5">
                    {cycleStats.totalDays} dias
                  </strong>
                  <span className="text-[10px] text-stone-500">
                    {activeReportCycle.isFinished ? 'Ciclo Completo' : 'Em Andamento'}
                  </span>
                </div>

                {/* Janela Fértil */}
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">
                    Janela Fértil
                  </span>
                  <strong className="text-lg font-mono text-rose-700 block mt-0.5">
                    {cycleStats.fertileDays} dias
                  </strong>
                  <span className="text-[10px] text-rose-800">
                    {cycleStats.fertilePercent}% do ciclo (Muco + Ápice)
                  </span>
                </div>

                {/* Infertilidade / PBI */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Dias Infértil (PBI)
                  </span>
                  <strong className="text-lg font-mono text-emerald-800 block mt-0.5">
                    {cycleStats.infertileDays} dias
                  </strong>
                  <span className="text-[10px] text-emerald-800">
                    {cycleStats.infertilePercent}% do ciclo (Secura/PBI)
                  </span>
                </div>

                {/* Ápice & Fase Lútea */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">
                    Ápice & Fase Lútea
                  </span>
                  <strong className="text-lg font-mono text-amber-900 block mt-0.5">
                    {cycleStats.peakDay ? `D${cycleStats.peakDay}` : 'Não def.'}
                  </strong>
                  <span className="text-[10px] text-amber-800">
                    {cycleStats.lutealDays !== null
                      ? `${cycleStats.lutealDays}d pós-ápice (${cycleStats.isLutealSufficient ? 'Suficiente' : 'Curta'})`
                      : 'Aguardando ápice'}
                  </span>
                </div>
              </div>

              {/* Relações & Sangramentos Sub-Bar */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-red-600" />
                  <span>Sangramento Menstrual: <strong>{cycleStats.bleedingDays} dias</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-purple-600" />
                  <span>Relações Sexuais: <strong>{cycleStats.coitusCount} registradas</strong> ({cycleStats.coitusInBip} no PBI, {cycleStats.coitusInFertilePhase} na janela fértil)</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                  {profile.instructorCredentials || 'WOOMB International'}
                </span>
              </div>
            </div>
          )}

          {/* 2. GRÁFICO OFICIAL DE SELOS BILLINGS FORMATADO PARA IMPRESSÃO */}
          {activeReportCycle && (
            <div className="space-y-2 print-avoid-break">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Gráfico de Selos do Ciclo #{activeReportCycle.cycleNumber} (Fita Clínica Completa)
                </h4>
                <span className="text-xs text-stone-500 font-mono">
                  {activeReportCycle.logs.length} dias avaliados
                </span>
              </div>

              {/* Responsive Wrap Grid - Never overflows on A4 print */}
              <div className="p-3 bg-stone-50/60 rounded-xl border border-stone-200">
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {activeReportCycle.logs.map((log) => {
                    const st = STAMP_DETAILS[log.stamp];
                    return (
                      <div
                        key={log.id}
                        className="w-8 sm:w-9 flex flex-col items-center text-center shrink-0 mb-1"
                      >
                        <span className="text-[9px] font-mono font-bold text-stone-600 mb-0.5">
                          {log.cycleDay}
                        </span>
                        <div
                          className={`w-7 sm:w-8 h-10 rounded-sm ${st.bg} flex items-center justify-center font-bold text-xs border border-stone-300 relative`}
                        >
                          {log.isPeak ? (
                            <span className="text-rose-700 font-black text-sm">X</span>
                          ) : log.postPeakCount ? (
                            <span className="text-stone-900 font-bold text-xs">{log.postPeakCount}</span>
                          ) : (
                            <span className="text-[10px]">{st.icon}</span>
                          )}

                          {log.coitus !== 'nenhum' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-stone-900 text-white text-[7px] rounded-full flex items-center justify-center font-bold">
                              I
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] text-stone-500 font-mono mt-0.5">
                          {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Print Legend */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex flex-wrap items-center gap-3 text-[10px] text-stone-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" />
                    <span>Vermelho: Sangramento</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-green-600 inline-block" />
                    <span>Verde: Secura (PBI)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 inline-block border border-stone-300" />
                    <span>Amarelo: Muco Inalterado (PBI)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-white inline-block border border-stone-600" />
                    <span>Branco: Muco Fértil / Bebê</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <strong className="text-rose-700 font-bold">X</strong>
                    <span>Dia Ápice</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <strong className="text-stone-900 font-bold">1, 2, 3</strong>
                    <span>Contagem Pós-Ápice</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI or Instructor Synthesis */}
          {aiSummary ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 text-xs print-avoid-break">
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
                  <span className="text-stone-500 block mb-0.5">Visão do Ciclo:</span>
                  <p className="text-stone-800">{aiSummary.cycleOverview}</p>
                </div>
                <div>
                  <span className="text-stone-500 block mb-0.5">Avaliação do Ápice:</span>
                  <p className="text-stone-800">{aiSummary.peakEvaluation}</p>
                </div>
                <div>
                  <span className="text-stone-500 block mb-0.5">Suficiência Lútea:</span>
                  <p className="text-stone-800">{aiSummary.lutealPhaseSufficiency}</p>
                </div>
              </div>

              <div>
                <span className="text-stone-500 block mb-0.5">Conduta & Observações:</span>
                <p className="text-stone-800 font-medium">{aiSummary.instructorNotes}</p>
              </div>
            </div>
          ) : (
            <div className="no-print p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center">
              <p className="text-xs text-stone-500">
                Você pode clicar no botão <strong>&ldquo;Parecer Clínico IA&rdquo;</strong> acima para sintetizar a interpretação médica deste ciclo antes da impressão.
              </p>
            </div>
          )}

          {/* 3. TABELA COMPLETA DE OBSERVAÇÕES DE MUCO E SENSAÇÕES */}
          {activeReportCycle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Tabela Diária de Observações Clínicas & Muco Cervical
                </h4>
                <span className="text-xs text-stone-500 font-mono">
                  Registro contínuo das sensações vulvares
                </span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Dia</th>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Sensação Vulvar</th>
                      <th className="p-2.5">Aparência do Muco</th>
                      <th className="p-2.5">Sangramento</th>
                      <th className="p-2.5">Selo / Notação</th>
                      <th className="p-2.5">Coito</th>
                      <th className="p-2.5">Observações Clínicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700 font-mono text-[11px]">
                    {activeReportCycle.logs.map((log) => (
                      <tr
                        key={log.id}
                        className={log.isPeak ? 'bg-rose-50/80 font-semibold' : ''}
                      >
                        <td className="p-2.5 font-bold text-stone-900">D{log.cycleDay}</td>
                        <td className="p-2.5">
                          {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="p-2.5 font-sans font-medium text-stone-800">
                          {SENSATION_LABELS[log.sensation]?.label || log.sensation}
                        </td>
                        <td className="p-2.5 font-sans text-stone-700">
                          {APPEARANCE_LABELS[log.appearance]?.label || log.appearance}
                        </td>
                        <td className="p-2.5 capitalize">{log.bleeding}</td>
                        <td className="p-2.5">
                          <span className="font-semibold text-stone-900">
                            {log.stamp} {log.isPeak ? '★ (ÁPICE X)' : log.postPeakCount ? `(+${log.postPeakCount})` : ''}
                          </span>
                        </td>
                        <td className="p-2.5 capitalize">{log.coitus}</td>
                        <td className="p-2.5 font-sans text-stone-600 max-w-xs leading-snug">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medical & Instructor Signature Section (for clinical print) */}
          <div className="pt-10 border-t border-stone-300 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break">
            <div>
              <div className="border-t border-stone-400 pt-2 w-3/4 mx-auto">
                <strong className="block text-stone-900 font-serif">{profile.fullName}</strong>
                <span className="text-stone-500 text-[11px]">Assinatura da Paciente</span>
              </div>
            </div>
            <div>
              <div className="border-t border-stone-400 pt-2 w-3/4 mx-auto">
                <strong className="block text-stone-900 font-serif">
                  {profile.instructorName || 'Instrutora Credenciada WOOMB'}
                </strong>
                <span className="text-stone-500 text-[11px]">
                  {profile.instructorCredentials || 'Carimbo / Registro Profissional'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
