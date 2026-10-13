import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Compass,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  Info,
} from 'lucide-react';
import {
  ThemePreference,
  getLocalSunCalculation,
  requestGpsForSolarCalibration,
  saveThemePreference,
  applyThemeToDOM,
  shouldEnableDarkMode,
  SunCalculationResult,
} from '../utils/sunsetTheme';

interface SunsetThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export const SunsetThemeModal: React.FC<SunsetThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}) => {
  const [sunData, setSunData] = useState<SunCalculationResult>(getLocalSunCalculation());
  const [gpsCalibrating, setGpsCalibrating] = useState(false);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSunData(getLocalSunCalculation());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreference = (pref: ThemePreference) => {
    onThemeChange(pref);
    saveThemePreference(pref);
    const { isDark } = shouldEnableDarkMode(pref);
    applyThemeToDOM(isDark);
  };

  const handleCalibrateGps = async () => {
    setGpsCalibrating(true);
    const success = await requestGpsForSolarCalibration();
    setGpsCalibrating(false);
    if (success) {
      const updated = getLocalSunCalculation();
      setSunData(updated);
      setGpsSuccessMessage('Pôr do sol recalculado com precisão GPS da sua cidade!');
      const { isDark } = shouldEnableDarkMode(currentTheme);
      applyThemeToDOM(isDark);
      setTimeout(() => setGpsSuccessMessage(null), 4000);
    } else {
      setGpsSuccessMessage('Permissão GPS não concedida. Utilizando coordenadas de fuso horário.');
      setTimeout(() => setGpsSuccessMessage(null), 4000);
    }
  };

  const currentEval = shouldEnableDarkMode(currentTheme);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Sunset className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Tema Circadiano & Pôr do Sol
              </h3>
              <p className="text-xs text-stone-500">
                Transição suave para modo noturno para anotações sem cansaço visual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Solar Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>Horários Solares Locais</span>
              </span>
              <span className="text-[11px] font-medium text-stone-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-stone-200">
                📍 {sunData.locationName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sunset className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Pôr do Sol Hoje
                  </span>
                  <strong className="text-sm sm:text-base font-mono text-stone-900">
                    {sunData.sunsetFormatted}
                  </strong>
                </div>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                  <Sunrise className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Nascer do Sol
                  </span>
                  <strong className="text-sm sm:text-base font-mono text-stone-900">
                    {sunData.sunriseFormatted}
                  </strong>
                </div>
              </div>
            </div>

            {/* Current Solar Status Pill */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-stone-600 text-[11px]">
                Estado Atual: <strong>{sunData.isNightTime ? '🌙 Noite (Pós-pôr do sol)' : '☀️ Dia'}</strong>
              </span>
              <button
                type="button"
                onClick={handleCalibrateGps}
                disabled={gpsCalibrating}
                className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer disabled:opacity-50"
              >
                {gpsCalibrating ? 'Calibrando GPS...' : 'Refinar com GPS'}
              </button>
            </div>

            {gpsSuccessMessage && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{gpsSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Theme Option Cards */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
              Modo de Exibição do Aplicativo:
            </label>

            {/* Option 1: Automatic Sunset (Recommended) */}
            <div
              onClick={() => handleSelectPreference('sunset')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                currentTheme === 'sunset'
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Sunset className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-stone-900">
                      Automático ao Pôr do Sol
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-950 rounded-md">
                      Recomendado MOB
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Alterna para <strong>Modo Noturno</strong> automaticamente ao entardecer ({sunData.sunsetFormatted}), reduzindo o cansaço visual e a luz azul durante o registro antes de dormir.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="theme"
                checked={currentTheme === 'sunset'}
                onChange={() => handleSelectPreference('sunset')}
                className="w-4 h-4 text-amber-800 mt-1 cursor-pointer"
              />
            </div>

            {/* Option 2: Always Dark */}
            <div
              onClick={() => handleSelectPreference('dark')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                currentTheme === 'dark'
                  ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-300'
                  : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Moon className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <strong className="text-sm text-stone-900">
                    Modo Escuro Permanente
                  </strong>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Mantém o fundo escuro e relaxante o tempo todo, ideal para quem tem fotossensibilidade ou prefere interfaces escuras.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="theme"
                checked={currentTheme === 'dark'}
                onChange={() => handleSelectPreference('dark')}
                className="w-4 h-4 text-slate-800 mt-1 cursor-pointer"
              />
            </div>

            {/* Option 3: Always Light */}
            <div
              onClick={() => handleSelectPreference('light')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                currentTheme === 'light'
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
                  <Sun className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <strong className="text-sm text-stone-900">
                    Modo Claro Permanente
                  </strong>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Paleta clara com papel linho natural e estética botânica ativada continuamente.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="theme"
                checked={currentTheme === 'light'}
                onChange={() => handleSelectPreference('light')}
                className="w-4 h-4 text-amber-800 mt-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Clinical rationale info box */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Por que o pôr do sol é relevante no Método Billings?</strong> A regra de ouro do MOB recomenda avaliar todas as sensações vulvares do dia e registrar a observação mais fértil à noite. O modo escuro protege seu ritmo circadiano contra o brilho excessivo da tela antes do sono.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Tema ativo: <strong>{currentEval.isDark ? '🌙 Escuro' : '☀️ Claro'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
