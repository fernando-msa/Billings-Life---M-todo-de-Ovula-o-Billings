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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              {initialLog ? 'Editar Registro Diário' : 'Novo Registro Diário MOB'}
            </h3>
            <p className="text-xs text-stone-500">
              Sintetize a sensação mais fértil sentida ao longo do dia nas atividades normais.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {/* Date & Cycle Day */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Data da Observação
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Dia do Ciclo (D)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={cycleDay}
                  onChange={(e) => setCycleDay(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] font-mono"
                />
              </div>
            </div>

            {/* 1. Vulvar Sensation (The Golden Rule) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                  1. Sensação na Vulva (Regra de Ouro)
                </label>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Sentir sem tocar
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
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[58px] ${
                        isSelected
                          ? 'border-[#1B4332] bg-emerald-50/80 text-stone-900 ring-1 ring-[#1B4332]'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{SENSATION_LABELS[key].label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#1B4332]" />}
                      </div>
                      <span className="text-[10px] text-stone-500 block mt-0.5 line-clamp-2">
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
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                  2. Aparência Visual do Muco
                </label>
                <span className="text-[11px] text-stone-500">
                  Ao dobrar o papel higiênico
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
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[52px] ${
                        isSelected
                          ? 'border-[#1B4332] bg-emerald-50/80 text-stone-900 ring-1 ring-[#1B4332]'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{APPEARANCE_LABELS[key].label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#1B4332]" />}
                      </div>
                      <span className="text-[10px] text-stone-500 block mt-0.5 truncate">
                        {APPEARANCE_LABELS[key].desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Bleeding & Coitus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  3. Sangramento
                </label>
                <select
                  value={bleeding}
                  onChange={(e) => handleBleedingChange(e.target.value as BleedingLevel)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                >
                  {(Object.keys(BLEEDING_LABELS) as BleedingLevel[]).map((key) => (
                    <option key={key} value={key}>
                      {BLEEDING_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  4. Relação Sexual (Coito)
                </label>
                <select
                  value={coitus}
                  onChange={(e) => setCoitus(e.target.value as CoitusTiming)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                >
                  <option value="nenhum">Nenhuma relação sexual hoje</option>
                  <option value="noite">Sim, à noite (Regra 2)</option>
                  <option value="dia">Sim, durante o dia</option>
                </select>
              </div>
            </div>

            {/* 4. Stamp Selection */}
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Selo Billings Oficial
                </label>
                <span className="text-[11px] text-stone-500">
                  {isManualStampOverride ? 'Seleção manual' : 'Sugerido pelas regras'}
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
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/15 bg-white font-bold'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span className={`w-7 h-9 rounded-xs ${info.bg} border border-stone-300 shadow-2xs mb-1 flex items-center justify-center text-xs`}>
                        {info.icon}
                      </span>
                      <span className="text-[11px] text-stone-800 leading-tight">
                        {info.name.replace('Selo ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Photo Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Foto do Muco Cervical (Opcional)
                </label>
                {photoUrl && onOpenAIWithPhoto && (
                  <button
                    type="button"
                    onClick={() => onOpenAIWithPhoto(photoUrl)}
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Analisar com IA</span>
                  </button>
                )}
              </div>

              {photoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-stone-200">
                  <img
                    src={photoUrl}
                    alt="Prévia do muco"
                    className="w-14 h-14 rounded-xl object-cover border border-stone-300"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-stone-900 block">Fotografia Anexada</span>
                    <span className="text-stone-500 text-[11px]">Salva no registro diário e prontuário.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-200 hover:border-[#1B4332] rounded-2xl cursor-pointer bg-[#FAF8F5]/60 hover:bg-emerald-50/20 transition-all">
                  <Camera className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs font-semibold text-stone-700">Tirar ou enviar foto do muco</span>
                  <span className="text-[11px] text-stone-400">JPG, PNG ou captura de câmera</span>
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
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Anotações Clínicas & Sintomas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Dor leve no flanco (mittelschmerz), tensão mamária, viagem, resfriado ou uso de antialérgico..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Sticky Modal Bottom Actions Bar */}
          <div className="px-5 sm:px-6 py-3.5 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] hover:from-[#143225] hover:to-[#245741] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
