export type VulvarSensation =
  | 'seca'
  | 'sem_sensacao'
  | 'umida'
  | 'molhada'
  | 'escorregadia'
  | 'lubrificada';

export type MucusAppearance =
  | 'nada_visivel'
  | 'opaco_pastoso'
  | 'leitoso_branco'
  | 'turvo_amarelado'
  | 'elastico_filante'
  | 'transparente_clara_ovo'
  | 'sanguinolento';

export type BleedingLevel = 'nenhum' | 'spotting' | 'leve' | 'moderado' | 'intenso';

export type CoitusTiming = 'nenhum' | 'noite' | 'dia';

export type StampType =
  | 'red'          // Sangramento / Menstruação
  | 'green'        // Secura / Infértil
  | 'yellow_plain' // PBI de muco constante infértil
  | 'yellow_baby'  // PBI de muco com potencial de transição
  | 'white_baby';  // Fértil / Muco em evolução / Lubrificado

export type FertilityPhase =
  | 'menstruation'        // Sangramento menstrual (Regra 1)
  | 'bip'                  // Padrão Básico de Infertilidade (Regra 2)
  | 'interruption'         // Interrupção de PBI / Mudança não ovulatória (Regra 3)
  | 'fertile_evolving'     // Muco fértil em progressão
  | 'peak'                 // Dia Ápice (Pico estrogênico e ovulação iminente)
  | 'post_peak_count'      // Dias 1, 2 ou 3 pós-ápice
  | 'luteal_infertile';    // Fase Lútea pós-contagem (Infertilidade absoluta)

export type GoalType = 'avoid_pregnancy' | 'achieve_pregnancy' | 'health_monitoring';

export interface MucusAIAnalysis {
  consistencyClassification: string;
  appearanceDescription: string;
  visualFertilityTendency: string;
  suggestedBillingsStamp: string;
  billingsGoldenRule: string;
  clinicalObservations: string;
  infectionRiskAlert: boolean;
  infectionNotes?: string;
  recommendation: string;
  analyzedAt: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  cycleDay: number;
  sensation: VulvarSensation;
  appearance: MucusAppearance;
  bleeding: BleedingLevel;
  coitus: CoitusTiming;
  stamp: StampType;
  isPeak: boolean;
  postPeakCount: 1 | 2 | 3 | null;
  interruptionCount?: 1 | 2 | 3 | null;
  phase: FertilityPhase;
  notes?: string;
  temperature?: number; // Opcional, para complementar
  photoUrl?: string; // Data URL ou Blob URL
  photoAnalysis?: MucusAIAnalysis;
}

export interface Cycle {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate?: string;
  peakDayIndex?: number; // cycleDay do ápice
  isFinished: boolean;
  logs: DailyLog[];
  notes?: string;
}

export interface ClinicalProfile {
  fullName: string;
  birthDate: string;
  email: string;
  phone: string;
  goal: GoalType;
  menarcheAge: number;
  parityG: number; // Gestações
  parityP: number; // Partos
  parityA: number; // Abortos
  cycleLengthAverage: number;
  pillDiscontinuationMonths: number;
  diagnosedBipType: 'secura' | 'muco_constante' | 'em_investigacao';
  medicalConditions: string[]; // ex: SOP, Endometriose, Hipotireoidismo
  currentMedications: string;
  instructorName?: string;
  instructorCredentials?: string;
  lastUpdated: string;
}

export interface FocusModeConfig {
  enabled: boolean;
  durationMode: 'manual' | '1h' | '8h' | '24h';
  activatedAt?: string;
  silenceSounds: boolean;
  allowCriticalPeakReminders: boolean;
  allowCriticalNightLoggingReminders: boolean;
  allowInfectionAlerts: boolean;
}

export interface CatchUpReminderConfig {
  enabled: boolean;
  notifyMissingPeak: boolean; // Notifica se faltar observação de pico de muco ou contagem 1-2-3
  notifyMissingLutealEnd: boolean; // Notifica se a fase lútea estiver no fim sem encerramento
  maxHoursMissing: number; // Intervalo de horas sem registro (padrão: 24h)
  lastCatchUpNotifiedDate?: string;
}

export interface DailyReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format, e.g. "21:30"
  soundEnabled: boolean;
  daysOfWeek: number[]; // 0 to 6 (all 7 days for MOB by default)
  lastNotifiedDate?: string; // YYYY-MM-DD
  message: string;
  focusMode?: FocusModeConfig;
  catchUpReminder?: CatchUpReminderConfig;
}

export interface FertilityAlert {
  status: 'fertile' | 'possibly_fertile' | 'infertile_rule2' | 'infertile_luteal' | 'bleeding_rule1' | 'interruption_rule3';
  title: string;
  description: string;
  billingsRuleApplied: string;
  coitusRecommendation: string;
  badgeColor: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
}

export interface AutoBackupMetadata {
  lastBackupDate: string; // ISO string
  formattedTime: string;
  cyclesCount: number;
  totalLogsCount: number;
  lastModifiedLogDate?: string;
  sizeBytes: number;
  autoDownloadFileEnabled: boolean;
}

export interface AutoBackupSnapshot {
  id: string;
  timestamp: string;
  formattedTime: string;
  cyclesCount: number;
  totalLogsCount: number;
  lastModifiedLogDate?: string;
  jsonContent: string;
}

