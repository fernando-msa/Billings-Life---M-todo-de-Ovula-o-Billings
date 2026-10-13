import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Camera,
  Trash2,
  Sparkles,
  HelpCircle,
  Check,
  Upload,
} from 'lucide-react';
import {
  DailyLog,
  ClinicalProfile,
  VulvarSensation,
  MucusAppearance,
  BleedingLevel,
  CoitusTiming,
  StampType,
} from '../types/billings';
import {
  SENSATION_LABELS,
  APPEARANCE_LABELS,
  BLEEDING_LABELS,
  STAMP_DETAILS,
  suggestStampType,
} from '../utils/billingsEngine';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<DailyLog, 'id' | 'phase' | 'isPeak' | 'postPeakCount'> & { id?: string }) => void;
  initialLog?: DailyLog | null;
  profile: ClinicalProfile;
  cycleDayNumber: number;
  initialDate?: string;
  onOpenAIWithPhoto?: (photoUrl: string) => void;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLog,
  profile,
  cycleDayNumber,
  initialDate,
  onOpenAIWithPhoto,
}) => {
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [cycleDay, setCycleDay] = useState<number>(cycleDayNumber || 1);
  const [sensation, setSensation] = useState<VulvarSensation>('seca');
  const [appearance, setAppearance] = useState<MucusAppearance>('nada_visivel');
  const [bleeding, setBleeding] = useState<BleedingLevel>('nenhum');
  const [coitus, setCoitus] = useState<CoitusTiming>('nenhum');
  const [stamp, setStamp] = useState<StampType>('green');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isManualStampOverride, setIsManualStampOverride] = useState(false);

  useEffect(() => {
    if (initialLog) {
      setDate(initialLog.date);
      setCycleDay(initialLog.cycleDay);
      setSensation(initialLog.sensation);
      setAppearance(initialLog.appearance);
      setBleeding(initialLog.bleeding);
      setCoitus(initialLog.coitus);
      setStamp(initialLog.stamp);
      setNotes(initialLog.notes || '');
      setPhotoUrl(initialLog.photoUrl);
      setIsManualStampOverride(true);
    } else {
      const todayStr = initialDate || new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setCycleDay(cycleDayNumber || 1);
      setSensation('seca');
      setAppearance('nada_visivel');
      setBleeding('nenhum');
      setCoitus('nenhum');
      setNotes('');
      setPhotoUrl(undefined);
      setIsManualStampOverride(false);
      const auto = suggestStampType('nenhum', 'seca', 'nada_visivel', profile.diagnosedBipType);
      setStamp(auto);
    }
  }, [initialLog, isOpen, cycleDayNumber, initialDate, profile.diagnosedBipType]);

  // Automatically update stamp if not manually overridden
  const handleSensationChange = (val: VulvarSensation) => {
    setSensation(val);
    if (!isManualStampOverride) {
      setStamp(suggestStampType(bleeding, val, appearance, profile.diagnosedBipType));
    }
  };

  const handleAppearanceChange = (val: MucusAppearance) => {
    setAppearance(val);
    if (!isManualStampOverride) {
      setStamp(suggestStampType(bleeding, sensation, val, profile.diagnosedBipType));
    }
  };

  const handleBleedingChange = (val: BleedingLevel) => {
    setBleeding(val);
    if (!isManualStampOverride) {
      setStamp(suggestStampType(val, sensation, appearance, profile.diagnosedBipType));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialLog?.id,
      date,
      cycleDay,
      sensation,
      appearance,
      bleeding,
      coitus,
      stamp,
      notes,
      photoUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialLog ? 'Editar Registro Diário' : 'Novo Registro Diário MOB'}
            </h3>
            <p className="text-xs text-slate-500">
              Registre a sensação mais fértil sentida ao longo do dia ao caminhar e sentar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Date & Cycle Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data da Observação
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dia do Ciclo (D)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* 1. Vulvar Sensation (The Golden Rule of Billings) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Sensação na Vulva (Regra de Ouro)
              </label>
              <span className="text-[11px] text-emerald-800 font-medium">
                Sentir sem tocar durante o dia
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(SENSATION_LABELS) as VulvarSensation[]).map((key) => {
                const isSelected = sensation === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSensationChange(key)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{SENSATION_LABELS[key].label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-2">
                      {SENSATION_LABELS[key].desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Mucus Appearance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Aparência Visual do Muco
              </label>
              <span className="text-[11px] text-slate-500">
                Observação no papel higiênico
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(APPEARANCE_LABELS) as MucusAppearance[]).map((key) => {
                const isSelected = appearance === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAppearanceChange(key)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{APPEARANCE_LABELS[key].label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {APPEARANCE_LABELS[key].desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Bleeding & Coitus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                3. Sangramento
              </label>
              <select
                value={bleeding}
                onChange={(e) => handleBleedingChange(e.target.value as BleedingLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {(Object.keys(BLEEDING_LABELS) as BleedingLevel[]).map((key) => (
                  <option key={key} value={key}>
                    {BLEEDING_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                4. Relação Sexual (Coito)
              </label>
              <select
                value={coitus}
                onChange={(e) => setCoitus(e.target.value as CoitusTiming)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="nenhum">Nenhuma relação sexual hoje</option>
                <option value="noite">Sim, à noite (conforme Regra 2)</option>
                <option value="dia">Sim, durante o dia</option>
              </select>
            </div>
          </div>

          {/* 4. Stamp Selection (with automatic calculation badge) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Selo Billings Selecionado
              </label>
              <span className="text-[11px] text-slate-500">
                {isManualStampOverride ? 'Seleção manual' : 'Sugerido automaticamente pelas regras'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(STAMP_DETAILS) as StampType[]).map((st) => {
                const isSelected = stamp === st;
                const info = STAMP_DETAILS[st];
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStamp(st);
                      setIsManualStampOverride(true);
                    }}
                    className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`w-6 h-8 rounded-xs ${info.bg} border border-slate-300 shadow-2xs mb-1 flex items-center justify-center text-xs`}>
                      {info.icon}
                    </span>
                    <span className="text-[11px] text-slate-800 leading-tight">
                      {info.name.replace('Selo ', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Photo Upload & AI Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Foto do Muco Cervical (Opcional)
              </label>
              {photoUrl && onOpenAIWithPhoto && (
                <button
                  type="button"
                  onClick={() => onOpenAIWithPhoto(photoUrl)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analisar esta foto com IA</span>
                </button>
              )}
            </div>

            {photoUrl ? (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <img
                  src={photoUrl}
                  alt="Prévia do muco"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-slate-900 block">Fotografia Anexada</span>
                  <span className="text-slate-500">Pronta para armazenamento no prontuário.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Tirar ou enviar foto do muco</span>
                <span className="text-[11px] text-slate-400">Suporta JPG, PNG ou captura de câmera</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 6. Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Anotações Clínicas & Sintomas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Dor leve no flanco direito (mittelschmerz), tensão mamária, viagem, resfriado ou uso de antialérgico..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
