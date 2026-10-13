import React, { useState } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Info,
} from 'lucide-react';
import {
  VulvarSensation,
  ClinicalProfile,
  MucusAIAnalysis,
  DailyLog,
} from '../types/billings';
import { SENSATION_LABELS } from '../utils/billingsEngine';

interface MucusAIAnalyzerProps {
  profile: ClinicalProfile;
  currentCycleDay: number;
  onSaveToDay?: (photoUrl: string, analysis: MucusAIAnalysis) => void;
  preloadedPhotoUrl?: string;
}

// Sample clinical demonstrative images for quick testing
const DEMO_SAMPLES = [
  {
    name: 'Exemplo: Muco Clara de Ovo / Filante (Fértil)',
    sensation: 'escorregadia' as VulvarSensation,
    // Transparent stretchy mucus SVG data URL
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><path d="M120 180 Q200 240 280 180 Q250 280 200 320 Q150 280 120 180 Z" fill="%23e0f2fe" opacity="0.85" stroke="%2338bdf8" stroke-width="2"/><ellipse cx="200" cy="220" rx="35" ry="55" fill="%23ffffff" opacity="0.6"/><text x="200" y="370" font-family="sans-serif" font-size="14" fill="%2364748b" text-anchor="middle">Amostra Demonstrativa: Muco Cristalino Filante</text></svg>',
  },
  {
    name: 'Exemplo: Muco Cremoso Opaco (PBI / Infértil)',
    sensation: 'umida' as VulvarSensation,
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><circle cx="200" cy="200" r="90" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="2"/><path d="M160 170 Q200 150 240 170 Q220 220 160 170 Z" fill="%23ffffff" opacity="0.9"/><text x="200" y="370" font-family="sans-serif" font-size="14" fill="%2364748b" text-anchor="middle">Amostra Demonstrativa: Muco Opaco Pastoso</text></svg>',
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      setAnalysisResult(null);
      setAnalysisError(null);
      setSavedSuccessMessage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof DEMO_SAMPLES)[0]) => {
    setPhotoUrl(sample.dataUrl);
    setReportedSensation(sample.sensation);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSavedSuccessMessage(false);
  };

  const handleRunAnalysis = async () => {
    if (!photoUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setSavedSuccessMessage(false);

    try {
      const response = await fetch('/api/analyze-mucus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoUrl,
          mimeType: photoUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          reportedSensation: SENSATION_LABELS[reportedSensation].label,
          cycleDay: currentCycleDay,
        }),
      });

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
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                Módulo Auxiliar de Imagem
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Gemini 3.8 Flash Multimodal</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Análise Inteligente de Muco Cervical
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Envie ou fotografe uma amostra do papel higiênico ou teste entre os dedos. A IA avalia a translucidez, filância e viscosidade visual e correlaciona com a sensação vulvar sentida ao longo do dia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {photoUrl && (
              <button
                onClick={handleDownloadPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              1. Envio da Fotografia
            </h3>

            {photoUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center h-64">
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
                    className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900/80 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
                  >
                    Trocar Foto
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Foto carregada com sucesso</span>
                  <button
                    onClick={handleDownloadPhoto}
                    className="text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download da imagem</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30 transition-all min-h-60">
                <Camera className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  Carregar ou capturar foto do muco
                </span>
                <span className="text-xs text-slate-500 mt-1 text-center">
                  Tire foto em local bem iluminado (papel higiênico ou teste entre indicador e polegar)
                </span>
                <span className="mt-3 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs">
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
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Ou teste com amostras clínicas de referência:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 text-left text-xs bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 block truncate">
                      {sample.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sensação: {SENSATION_LABELS[sample.sensation].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reported Sensation Input */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                2. Qual sensação você sentiu na vulva hoje?
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                A IA precisa da sensação para correlacionar o aspecto visual com o Método Billings.
              </p>
              <select
                value={reportedSensation}
                onChange={(e) => setReportedSensation(e.target.value as VulvarSensation)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Examinando muco com Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Executar Análise com IA</span>
                  </>
                )}
              </button>
            </div>

            {analysisError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <strong>Erro na análise:</strong> {analysisError}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured AI Diagnostic Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Header result */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                    Resultado da Análise Visual
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {analysisResult.consistencyClassification}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    {analysisResult.visualFertilityTendency}
                  </span>
                </div>
              </div>

              {/* The Golden Rule Callout (Fundamental in MOB) */}
              <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl text-xs text-amber-950">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900 block mb-0.5">
                      Regra de Ouro da WOOMB International:
                    </strong>
                    <p className="leading-relaxed">
                      {analysisResult.billingsGoldenRule}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid with parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Descrição Visual:</span>
                  <p className="font-medium text-slate-800 leading-snug">
                    {analysisResult.appearanceDescription}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Selo Billings Sugerido:</span>
                  <p className="font-bold text-emerald-800 text-sm">
                    {analysisResult.suggestedBillingsStamp}
                  </p>
                </div>
              </div>

              {/* Detailed Clinical Observations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  Parecer Clínico & Interpretação Hormonal
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {analysisResult.clinicalObservations}
                </p>
              </div>

              {/* Recommendation for today */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                <strong className="block font-bold text-emerald-900 mb-1">
                  Recomendação de Conduta no Método:
                </strong>
                <p className="leading-relaxed">{analysisResult.recommendation}</p>
              </div>

              {/* Infection Screen Flag */}
              {analysisResult.infectionRiskAlert && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-0.5">Alerta de Saúde Ginecológica:</strong>
                    <p>{analysisResult.infectionNotes || 'Características incomuns observadas. Recomenda-se avaliação médica presencial.'}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons: Save to Day / Export Report */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Laudo (JSON)</span>
                </button>

                {onSaveToDay && (
                  <button
                    onClick={handleSaveToDailyRecord}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Vincular ao Registro de Hoje (D{currentCycleDay})</span>
                  </button>
                )}
              </div>

              {savedSuccessMessage && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Foto e laudo vinculados com sucesso ao registro diário!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Aguardando envio de amostra
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Carregue uma fotografia de muco ou selecione uma amostra de teste à esquerda para receber a interpretação biofísica detalhada.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs text-slate-600 max-w-md">
                <strong className="block text-slate-800 font-semibold mb-1">
                  Instruções para uma boa fotografia:
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                  <li>Luz natural indireta ou boa iluminação branca.</li>
                  <li>Foco nítido na consistência (esticado entre os dedos ou sobre papel).</li>
                  <li>Fundo contrastante neutro.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Ethics and Safety notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Nota Ética e Clínica:</strong> Este recurso utiliza inteligência artificial para apoio visual descritivo. Conforme preconizado pela WOOMB International, a sensação física na vulva tem supremacia sobre o aspecto visual na determinação da fertilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
