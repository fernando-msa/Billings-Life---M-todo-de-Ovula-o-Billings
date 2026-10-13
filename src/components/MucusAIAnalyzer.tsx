import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  FileCheck,
  RefreshCw,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { ClinicalProfile, MucusAIAnalysis, VulvarSensation } from '../types/billings';
import { SENSATION_LABELS } from '../utils/billingsEngine';

interface MucusAIAnalyzerProps {
  profile: ClinicalProfile;
  currentCycleDay: number;
  onSaveToDay?: (photoUrl: string, analysis: MucusAIAnalysis) => void;
  preloadedPhotoUrl?: string;
}

const DEMO_SAMPLES = [
  {
    name: 'Amostra Ápice — Transparente & Fio Longo',
    sensation: 'escorregadia' as VulvarSensation,
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f8fafc"/><path d="M120 70 C 130 140, 160 210, 170 240 C 150 200, 140 120, 130 70 Z" fill="%23e2e8f0" stroke="%23cbd5e1" stroke-width="2"/><circle cx="150" cy="160" r="15" fill="%23f1f5f9" opacity="0.8"/></svg>',
  },
  {
    name: 'Amostra Pós-Menstrual — Grumos Opacos',
    sensation: 'umida' as VulvarSensation,
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f8fafc"/><ellipse cx="140" cy="150" rx="35" ry="20" fill="%23fef08a" opacity="0.6"/><ellipse cx="165" cy="160" rx="25" ry="18" fill="%23fef08a" opacity="0.7"/></svg>',
  },
];

export const MucusAIAnalyzer: React.FC<MucusAIAnalyzerProps> = ({
  profile,
  currentCycleDay,
  onSaveToDay,
  preloadedPhotoUrl,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(preloadedPhotoUrl || null);
  const [reportedSensation, setReportedSensation] = useState<VulvarSensation>('escorregadia');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MucusAIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setPhotoUrl(sample.photoUrl);
    setReportedSensation(sample.sensation);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleRunAnalysis = async () => {
    if (!photoUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const base64Data = photoUrl.includes(',') ? photoUrl.split(',')[1] : photoUrl;
      const mimeType = photoUrl.startsWith('data:')
        ? photoUrl.split(';')[0].split(':')[1]
        : 'image/jpeg';

      const response = await fetch('/api/analyze-mucus', async () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          reportedSensation,
          cycleDay: currentCycleDay,
        }),
      })());

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Falha ao processar análise.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(err.message || 'Erro ao conectar com o serviço de análise.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPhoto = () => {
    if (!photoUrl) return;
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `amostra_muco_D${currentCycleDay}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const reportData = {
      tipo: 'Laudo Visual de Muco Cervical por Inteligência Artificial',
      metodologia: 'Método de Ovulação Billings (MOB / WOOMB International)',
      dataAnalise: new Date().toISOString(),
      diaCiclo: currentCycleDay,
      sensacaoRelatada: SENSATION_LABELS[reportedSensation].label,
      resultado: analysisResult,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laudo_muco_D${currentCycleDay}_IA.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToDailyRecord = () => {
    if (!photoUrl || !analysisResult || !onSaveToDay) return;
    onSaveToDay(photoUrl, analysisResult);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Context */}
      <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Módulo Auxiliar de Imagem
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">Gemini Multimodal</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Análise Inteligente de Muco Cervical
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Envie ou fotografe uma amostra do papel higiênico ou teste entre os dedos. A IA avalia a translucidez, filância e viscosidade visual e correlaciona com a sensação vulvar sentida ao longo do dia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {photoUrl && (
              <button
                onClick={handleDownloadPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-[0_2px_8px_rgba(28,61,47,0.03)] transition-colors">
            <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
              1. Envio da Fotografia
            </h3>

            {photoUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex items-center justify-center h-64">
                  <img
                    src={photoUrl}
                    alt="Amostra de muco cervical para análise"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setPhotoUrl(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold text-white bg-stone-900/80 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Trocar Foto
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Foto carregada com sucesso</span>
                  <button
                    onClick={handleDownloadPhoto}
                    className="text-[#1B4332] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#1B4332] dark:hover:border-emerald-500 rounded-2xl cursor-pointer bg-stone-50/60 dark:bg-stone-900/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all min-h-60">
                <Camera className="w-10 h-10 text-stone-400 mb-2" />
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  Carregar ou capturar foto do muco
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 text-center">
                  Tire foto em local bem iluminado (papel higiênico ou teste entre indicador e polegar)
                </span>
                <span className="mt-3 px-3 py-1.5 bg-[#1B4332] dark:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs">
                  Selecionar Arquivo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Demonstrative Clinical Samples */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block mb-2">
                Ou teste com amostras de referência:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 text-left text-xs bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 hover:border-[#1B4332] dark:hover:border-emerald-500 rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block truncate">
                      {sample.name}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Sensação: {SENSATION_LABELS[sample.sensation].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reported Sensation Input */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-1">
                2. Sensação vulvar sentida hoje
              </label>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2">
                A IA precisa da sensação para correlacionar o aspecto visual com o Método Billings.
              </p>
              <select
                value={reportedSensation}
                onChange={(e) => setReportedSensation(e.target.value as VulvarSensation)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
              >
                {(Object.keys(SENSATION_LABELS) as VulvarSensation[]).map((key) => (
                  <option key={key} value={key}>
                    {SENSATION_LABELS[key].label} — {SENSATION_LABELS[key].desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Run Analysis Trigger Button */}
            <div className="mt-5">
              <button
                onClick={handleRunAnalysis}
                disabled={!photoUrl || isAnalyzing}
                className="w-full py-2.5 px-4 bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Examinando muco com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Executar Análise com IA</span>
                  </>
                )}
              </button>
            </div>

            {analysisError && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200">
                <strong>Erro na análise:</strong> {analysisError}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured AI Diagnostic Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-[0_2px_8px_rgba(28,61,47,0.03)] space-y-5 transition-colors">
              {/* Header result */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold block">
                    Resultado da Análise Visual
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {analysisResult.consistencyClassification}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-[#1B4332] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {analysisResult.visualFertilityTendency}
                  </span>
                </div>
              </div>

              {/* The Golden Rule Callout (Fundamental in MOB) */}
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 rounded-xl text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                      Regra de Ouro da WOOMB International:
                    </strong>
                    <p className="leading-relaxed">
                      {analysisResult.billingsGoldenRule}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid with parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Descrição Visual:</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 leading-snug">
                    {analysisResult.appearanceDescription}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Selo Billings Sugerido:</span>
                  <p className="font-bold text-[#1B4332] dark:text-emerald-400 text-sm">
                    {analysisResult.suggestedBillingsStamp}
                  </p>
                </div>
              </div>

              {/* Detailed Clinical Observations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-1.5">
                  Parecer Clínico & Interpretação Hormonal
                </h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-850 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
                  {analysisResult.clinicalObservations}
                </p>
              </div>

              {/* Recommendation for today */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850 rounded-xl text-xs text-emerald-950 dark:text-emerald-200">
                <strong className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                  Recomendação de Conduta no Método:
                </strong>
                <p className="leading-relaxed">{analysisResult.recommendation}</p>
              </div>

              {/* Infection Screen Flag */}
              {analysisResult.infectionRiskAlert && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-0.5">Alerta de Saúde Ginecológica:</strong>
                    <p>{analysisResult.infectionNotes || 'Características incomuns observadas. Recomenda-se avaliação médica presencial.'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons: Save to Day / Export Report */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Laudo (JSON)</span>
                </button>

                {onSaveToDay && (
                  <button
                    onClick={handleSaveToDailyRecord}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Vincular ao Registro de Hoje (D{currentCycleDay})</span>
                  </button>
                )}
              </div>

              {savedSuccessMessage && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Foto e laudo vinculados com sucesso ao registro diário!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#181D1B] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-8 shadow-[0_2px_8px_rgba(28,61,47,0.03)] text-center min-h-[380px] flex flex-col items-center justify-center transition-colors">
              <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                Aguardando envio de amostra
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mt-1 mb-4 leading-relaxed">
                Carregue uma fotografia de muco ou selecione uma amostra de teste à esquerda para receber a interpretação biofísica detalhada.
              </p>
              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800 text-left text-xs text-stone-600 dark:text-stone-300 max-w-md">
                <strong className="block text-stone-800 dark:text-stone-200 font-semibold mb-1">
                  Instruções para uma boa fotografia:
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <li>Luz natural indireta ou boa iluminação branca.</li>
                  <li>Foco nítido na consistência (esticado entre os dedos ou sobre papel).</li>
                  <li>Fundo contrastante neutro.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Ethics and Safety notice */}
          <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-start gap-2 transition-colors">
            <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Nota Ética e Clínica:</strong> Este recurso utiliza inteligência artificial para apoio visual descritivo. Conforme preconizado pela WOOMB International, a sensação física na vulva tem supremacia sobre o aspecto visual na determinação da fertilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
