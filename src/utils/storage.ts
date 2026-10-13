import { Cycle, DailyLog, ClinicalProfile, AutoBackupMetadata, AutoBackupSnapshot } from '../types/billings';
import { recalculateCyclePhases, suggestStampType } from './billingsEngine';

const STORAGE_KEYS = {
  CYCLES: 'billings_cycles_v1',
  PROFILE: 'billings_profile_v1',
  ACTIVE_CYCLE: 'billings_active_cycle_id_v1',
  REMINDER: 'billings_reminder_config_v1',
  AUTO_BACKUP: 'billings_auto_backup_json_v1',
  AUTO_BACKUP_META: 'billings_auto_backup_meta_v1',
  AUTO_BACKUP_HISTORY: 'billings_auto_backup_history_v1',
};

export const DEFAULT_REMINDER_CONFIG: import('../types/billings').DailyReminderConfig = {
  enabled: true,
  time: '21:30', // Ideal for Billings (record at bedtime after observing the day's sensations)
  soundEnabled: true,
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day is required in Billings
  message: 'Hora de registrar no Billings Life: Como foi sua sensação vulvar ao longo das atividades de hoje?',
};

export const DEFAULT_CLINICAL_PROFILE: ClinicalProfile = {
  fullName: 'Dra. Gabriela Souza Meneses',
  birthDate: '1996-05-14',
  email: 'gabriela.meneses@exemplo.com.br',
  phone: '(11) 98765-4321',
  goal: 'avoid_pregnancy',
  menarcheAge: 12,
  parityG: 0,
  parityP: 0,
  parityA: 0,
  cycleLengthAverage: 29,
  pillDiscontinuationMonths: 18,
  diagnosedBipType: 'secura',
  medicalConditions: [],
  currentMedications: 'Nenhum medicamento contínuo',
  instructorName: 'Clara Silveira (Credenciada CENPLAFAM / WOOMB)',
  instructorCredentials: 'WOOMB-BR #4089',
  lastUpdated: new Date().toISOString(),
};

/**
 * Creates realistic clinical seed data demonstrating a completed past cycle (Cycle 1)
 * and an ongoing active cycle (Cycle 2) currently on Day 14.
 */
function createInitialSeedCycles(profile: ClinicalProfile): Cycle[] {
  const today = new Date();
  
  // Completed Cycle 1: Started 42 days ago, ended 14 days ago (28 days total)
  const c1Start = new Date(today);
  c1Start.setDate(c1Start.getDate() - 42);

  const c1Logs: DailyLog[] = [];
  for (let day = 1; day <= 28; day++) {
    const logDate = new Date(c1Start);
    logDate.setDate(logDate.getDate() + (day - 1));
    const dateStr = logDate.toISOString().split('T')[0];

    let bleeding: DailyLog['bleeding'] = 'nenhum';
    let sensation: DailyLog['sensation'] = 'seca';
    let appearance: DailyLog['appearance'] = 'nada_visivel';
    let stamp: DailyLog['stamp'] = 'green';
    let coitus: DailyLog['coitus'] = 'nenhum';
    let notes = '';

    if (day === 1) {
      bleeding = 'intenso';
      stamp = 'red';
      notes = 'Início do fluxo menstrual menstrual abundante';
    } else if (day === 2) {
      bleeding = 'moderado';
      stamp = 'red';
    } else if (day === 3) {
      bleeding = 'leve';
      stamp = 'red';
    } else if (day === 4) {
      bleeding = 'spotting';
      stamp = 'red';
      notes = 'Final do sangramento, sensação ainda não discernível';
    } else if (day === 5 || day === 7) {
      // PBI days with coitus on night 5
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      if (day === 5) {
        coitus = 'noite';
        notes = 'Relação à noite conforme Regra 2';
      }
    } else if (day === 6 || day === 8) {
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      notes = 'Dia de observação seguinte à noite de relação';
    } else if (day === 9) {
      sensation = 'umida';
      appearance = 'opaco_pastoso';
      stamp = 'white_baby';
      notes = 'Início de mudança na sensação: leve umidade';
    } else if (day === 10) {
      sensation = 'umida';
      appearance = 'leitoso_branco';
      stamp = 'white_baby';
      notes = 'Muco cremoso esbranquiçado perceptível';
    } else if (day === 11) {
      sensation = 'molhada';
      appearance = 'turvo_amarelado';
      stamp = 'white_baby';
      notes = 'Sensação molhada ao caminhar';
    } else if (day === 12) {
      sensation = 'escorregadia';
      appearance = 'transparente_clara_ovo';
      stamp = 'white_baby';
      notes = 'Sensação muito escorregadia ao passar o papel';
    } else if (day === 13) {
      // Peak day!
      sensation = 'lubrificada';
      appearance = 'elastico_filante';
      stamp = 'white_baby';
      notes = 'Ápice da sensação! Plena lubrificação vulvar e alta elasticidade.';
    } else if (day === 14) {
      // Post-peak 1
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      notes = 'Mudança abrupta para secura: confirmado pós-ápice dia 1';
    } else if (day === 15) {
      // Post-peak 2
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      notes = 'Contagem 2: sem muco fértil';
    } else if (day === 16) {
      // Post-peak 3
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      notes = 'Contagem 3: último dia de contagem de segurança';
    } else if (day >= 17) {
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      if (day === 18 || day === 22) {
        coitus = 'noite';
        notes = 'Fase lútea segura - relação livre';
      }
    }

    c1Logs.push({
      id: `c1-log-${day}`,
      date: dateStr,
      cycleDay: day,
      sensation,
      appearance,
      bleeding,
      coitus,
      stamp,
      isPeak: false,
      postPeakCount: null,
      phase: 'bip',
      notes,
    });
  }

  const recalculatedC1 = recalculateCyclePhases(c1Logs, profile);

  // Active Cycle 2: Started 13 days ago, currently on Day 14 (today)
  const c2Start = new Date(today);
  c2Start.setDate(c2Start.getDate() - 13);

  const c2Logs: DailyLog[] = [];
  for (let day = 1; day <= 14; day++) {
    const logDate = new Date(c2Start);
    logDate.setDate(logDate.getDate() + (day - 1));
    const dateStr = logDate.toISOString().split('T')[0];

    let bleeding: DailyLog['bleeding'] = 'nenhum';
    let sensation: DailyLog['sensation'] = 'seca';
    let appearance: DailyLog['appearance'] = 'nada_visivel';
    let stamp: DailyLog['stamp'] = 'green';
    let coitus: DailyLog['coitus'] = 'nenhum';
    let notes = '';

    if (day === 1) {
      bleeding = 'intenso';
      stamp = 'red';
      notes = 'Menstruação iniciada no início da manhã';
    } else if (day === 2) {
      bleeding = 'moderado';
      stamp = 'red';
    } else if (day === 3) {
      bleeding = 'leve';
      stamp = 'red';
    } else if (day === 4) {
      bleeding = 'spotting';
      stamp = 'red';
    } else if (day === 5 || day === 7) {
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      if (day === 5) {
        coitus = 'noite';
        notes = 'Regra 2: Relação noturna no PBI';
      }
    } else if (day === 6 || day === 8) {
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
    } else if (day === 9) {
      sensation = 'umida';
      appearance = 'opaco_pastoso';
      stamp = 'white_baby';
      notes = 'Início de umidade e muco opaco';
    } else if (day === 10) {
      sensation = 'umida';
      appearance = 'leitoso_branco';
      stamp = 'white_baby';
      notes = 'Muco cremoso';
    } else if (day === 11) {
      sensation = 'molhada';
      appearance = 'elastico_filante';
      stamp = 'white_baby';
      notes = 'Sensação molhada / escorregadia';
    } else if (day === 12) {
      sensation = 'escorregadia';
      appearance = 'transparente_clara_ovo';
      stamp = 'white_baby';
      notes = 'Muco cristalino translúcido';
    } else if (day === 13) {
      // Candidate Peak Day
      sensation = 'lubrificada';
      appearance = 'elastico_filante';
      stamp = 'white_baby';
      notes = 'Sensação fortemente escorregadia e lubrificada';
    } else if (day === 14) {
      // Today: shift to dry
      sensation = 'seca';
      appearance = 'nada_visivel';
      stamp = 'green';
      notes = 'Hoje secou bruscamente! Verificando se ontem foi o Ápice.';
    }

    c2Logs.push({
      id: `c2-log-${day}`,
      date: dateStr,
      cycleDay: day,
      sensation,
      appearance,
      bleeding,
      coitus,
      stamp,
      isPeak: false,
      postPeakCount: null,
      phase: 'bip',
      notes,
    });
  }

  const recalculatedC2 = recalculateCyclePhases(c2Logs, profile);

  return [
    {
      id: 'cycle-1',
      cycleNumber: 1,
      startDate: c1Start.toISOString().split('T')[0],
      endDate: new Date(c1Start.getTime() + 27 * 86400000).toISOString().split('T')[0],
      isFinished: true,
      logs: recalculatedC1,
      peakDayIndex: 13,
      notes: 'Ciclo monofásico típico com ápice no 13º dia e fase lútea satisfatória de 15 dias.',
    },
    {
      id: 'cycle-2',
      cycleNumber: 2,
      startDate: c2Start.toISOString().split('T')[0],
      isFinished: false,
      logs: recalculatedC2,
      notes: 'Ciclo em andamento. Ápice preliminarmente identificado no D13 com início da contagem 1-2-3.',
    },
  ];
}

/**
 * Loads the stored clinical profile or default
 */
export function getClinicalProfile(): ClinicalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading clinical profile from localStorage:', e);
  }
  return DEFAULT_CLINICAL_PROFILE;
}

/**
 * Saves the clinical profile
 */
export function saveClinicalProfile(profile: ClinicalProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    const cycles = getCycles();
    createAutoBackupSnapshot(cycles, profile);
  } catch (e) {
    console.error('Failed saving clinical profile to localStorage:', e);
  }
}

/**
 * Loads all cycles from localStorage or initializes seed cycles
 */
export function getCycles(): Cycle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CYCLES);
    if (raw) {
      const parsed = JSON.parse(raw) as Cycle[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading cycles from localStorage:', e);
  }

  const profile = getClinicalProfile();
  const seed = createInitialSeedCycles(profile);
  saveCycles(seed);
  return seed;
}

/**
 * Saves cycles list to localStorage
 */
export function saveCycles(cycles: Cycle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
  } catch (e) {
    console.error('Failed saving cycles to localStorage:', e);
  }
}

/**
 * Adds or updates a daily log inside a cycle and triggers phase recalculation
 */
export function upsertDailyLog(
  cycleId: string,
  logData: Omit<DailyLog, 'id' | 'phase' | 'isPeak' | 'postPeakCount'> & { id?: string }
): { cycles: Cycle[]; updatedLog: DailyLog } {
  const profile = getClinicalProfile();
  const cycles = getCycles();
  const cycleIndex = cycles.findIndex((c) => c.id === cycleId);

  if (cycleIndex === -1) {
    throw new Error(`Ciclo ${cycleId} não encontrado.`);
  }

  const cycle = cycles[cycleIndex];
  const logs = [...cycle.logs];
  const existingIndex = logs.findIndex((l) => l.date === logData.date);

  const stamp = logData.stamp || suggestStampType(logData.bleeding, logData.sensation, logData.appearance, profile.diagnosedBipType);

  const baseLog: DailyLog = {
    id: logData.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: logData.date,
    cycleDay: logData.cycleDay,
    sensation: logData.sensation,
    appearance: logData.appearance,
    bleeding: logData.bleeding,
    coitus: logData.coitus,
    stamp,
    isPeak: false,
    postPeakCount: null,
    phase: 'bip',
    notes: logData.notes || '',
    temperature: logData.temperature,
    photoUrl: logData.photoUrl,
    photoAnalysis: logData.photoAnalysis,
  };

  if (existingIndex >= 0) {
    logs[existingIndex] = { ...logs[existingIndex], ...baseLog };
  } else {
    logs.push(baseLog);
  }

  // Recalculate phases for the entire cycle
  const recalculated = recalculateCyclePhases(logs, profile);
  cycle.logs = recalculated;
  cycles[cycleIndex] = cycle;

  saveCycles(cycles);

  const updatedLog = recalculated.find((l) => l.date === logData.date)!;

  // Automatically create persistent JSON backup on every daily log change
  createAutoBackupSnapshot(cycles, profile, updatedLog.date);

  return { cycles, updatedLog };
}

/**
 * Creates a brand new cycle (e.g. Day 1 of new menses)
 */
export function startNewCycle(firstDayDateStr: string): Cycle[] {
  const profile = getClinicalProfile();
  const cycles = getCycles();

  // Mark previous cycle as finished
  if (cycles.length > 0) {
    const last = cycles[cycles.length - 1];
    if (!last.isFinished) {
      last.isFinished = true;
      const prevDate = new Date(firstDayDateStr);
      prevDate.setDate(prevDate.getDate() - 1);
      last.endDate = prevDate.toISOString().split('T')[0];
    }
  }

  const newCycleNumber = cycles.length + 1;
  const newCycle: Cycle = {
    id: `cycle-${Date.now()}`,
    cycleNumber: newCycleNumber,
    startDate: firstDayDateStr,
    isFinished: false,
    logs: [
      {
        id: `log-${Date.now()}`,
        date: firstDayDateStr,
        cycleDay: 1,
        bleeding: 'intenso',
        sensation: 'seca',
        appearance: 'nada_visivel',
        coitus: 'nenhum',
        stamp: 'red',
        isPeak: false,
        postPeakCount: null,
        phase: 'menstruation',
        notes: 'Início de novo ciclo menstrual',
      },
    ],
  };

  cycles.push(newCycle);
  saveCycles(cycles);

  // Automatically create persistent JSON backup on new cycle
  createAutoBackupSnapshot(cycles, profile, firstDayDateStr);

  return cycles;
}

/**
 * Exports complete clinical data (profile + all cycles) as JSON file
 */
export function exportClinicalDataAsJSON(): void {
  const profile = getClinicalProfile();
  const cycles = getCycles();

  const exportPayload = {
    app: 'Billings Life - Método de Ovulação Billings',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    clinicalProfile: profile,
    cycles: cycles,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const sanitizedName = profile.fullName.toLowerCase().replace(/\s+/g, '_');
  a.download = `prontuario_billings_${sanitizedName}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports clinical data from a JSON file
 */
export async function importClinicalDataFromJSON(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.clinicalProfile || !data.cycles || !Array.isArray(data.cycles)) {
      throw new Error('Formato inválido de arquivo de prontuário.');
    }

    saveClinicalProfile(data.clinicalProfile);
    saveCycles(data.cycles);

    return {
      success: true,
      message: `Prontuário importado com sucesso! ${data.cycles.length} ciclo(s) recuperados.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao importar prontuário: ${err.message || 'Arquivo corrompido ou formato incompatível.'}`,
    };
  }
}

/**
 * Exports a cycle's daily records to CSV for spreadsheet analysis
 */
export function exportCycleToCSV(cycle: Cycle, profile: ClinicalProfile): void {
  const headers = [
    'Dia do Ciclo',
    'Data',
    'Selo Billings',
    'Sensação Vulvar',
    'Aparência do Muco',
    'Sangramento',
    'Relação Sexual',
    'Dia Ápice?',
    'Contagem Pós-Ápice',
    'Fase de Fertilidade',
    'Anotações',
  ];

  const rows = cycle.logs.map((log) => [
    log.cycleDay,
    log.date,
    log.stamp,
    log.sensation,
    log.appearance,
    log.bleeding,
    log.coitus,
    log.isPeak ? 'SIM' : 'NÃO',
    log.postPeakCount ? `Dia ${log.postPeakCount}` : '-',
    log.phase,
    `"${(log.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ciclo_${cycle.cycleNumber}_billings_${profile.fullName.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Loads reminder configuration or returns default
 */
export function getReminderConfig(): import('../types/billings').DailyReminderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading reminder config:', e);
  }
  return DEFAULT_REMINDER_CONFIG;
}

/**
 * Saves reminder configuration to localStorage
 */
export function saveReminderConfig(config: import('../types/billings').DailyReminderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDER, JSON.stringify(config));
  } catch (e) {
    console.error('Failed saving reminder config:', e);
  }
}

/**
 * Plays a gentle, calming harmonic chime using Web Audio API
 */
export function playReminderChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm dual-tone chime (528Hz & 660Hz)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now); // Solfeggio frequency / soft tone
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.15); // E5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  } catch (e) {
    console.warn('Web Audio playback error:', e);
  }
}

/**
 * Sends a native browser notification if granted, or invokes fallback
 */
export async function triggerNotification(title: string, body: string, soundEnabled = true): Promise<boolean> {
  if (soundEnabled) {
    playReminderChime();
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'billings-daily-reminder',
        });
        return true;
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }
  return false;
}

/**
 * Automatically creates and persists an exported JSON snapshot of the user's progress
 * whenever any daily log or cycle data is modified.
 */
export function createAutoBackupSnapshot(
  cycles: Cycle[],
  profile: ClinicalProfile,
  modifiedDate?: string
): AutoBackupMetadata {
  const now = new Date();
  const timestamp = now.toISOString();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const totalLogs = cycles.reduce((acc, c) => acc + c.logs.length, 0);

  const payload = {
    app: 'Billings Life - Método de Ovulação Billings',
    backupType: 'AUTOMATIC_PERSISTENT_SNAPSHOT',
    version: '2.0.0',
    exportDate: timestamp,
    lastModifiedLogDate: modifiedDate,
    clinicalProfile: profile,
    cycles: cycles,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const sizeBytes = new Blob([jsonStr]).size;

  const currentMeta = getAutoBackupMetadata();
  const autoDownloadFileEnabled = currentMeta?.autoDownloadFileEnabled ?? false;

  const metadata: AutoBackupMetadata = {
    lastBackupDate: timestamp,
    formattedTime,
    cyclesCount: cycles.length,
    totalLogsCount: totalLogs,
    lastModifiedLogDate: modifiedDate,
    sizeBytes,
    autoDownloadFileEnabled,
  };

  try {
    // 1. Save latest JSON backup in local storage
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, jsonStr);
    // 2. Save metadata
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP_META, JSON.stringify(metadata));

    // 3. Maintain rolling history of snapshots (up to 10)
    const rawHistory = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP_HISTORY);
    let history: AutoBackupSnapshot[] = rawHistory ? JSON.parse(rawHistory) : [];

    const newSnapshot: AutoBackupSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp,
      formattedTime,
      cyclesCount: cycles.length,
      totalLogsCount: totalLogs,
      lastModifiedLogDate: modifiedDate,
      jsonContent: jsonStr,
    };

    history = [newSnapshot, ...history.slice(0, 9)];
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP_HISTORY, JSON.stringify(history));

    // 4. If auto-download file setting is enabled, trigger client file download
    if (autoDownloadFileEnabled && typeof window !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_automatico_billings_${now.toISOString().split('T')[0]}_${now.getHours()}h${now.getMinutes()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Failed saving auto backup snapshot to localStorage:', e);
  }

  return metadata;
}

/**
 * Retrieves the latest auto-backup metadata
 */
export function getAutoBackupMetadata(): AutoBackupMetadata | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP_META);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading auto backup metadata:', e);
  }
  return null;
}

/**
 * Retrieves raw JSON string of the latest auto-backup
 */
export function getLatestAutoBackupJSON(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP);
  } catch (e) {
    console.error('Failed reading auto backup JSON:', e);
    return null;
  }
}

/**
 * Downloads the latest automatic JSON backup as a file
 */
export function downloadLatestAutoBackup(): boolean {
  const jsonStr = getLatestAutoBackupJSON();
  if (!jsonStr) return false;

  const now = new Date();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_automatico_billings_${now.toISOString().split('T')[0]}_${now.getHours()}h${now.getMinutes()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Retrieves rolling snapshots history
 */
export function getAutoBackupSnapshots(): AutoBackupSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading auto backup snapshots history:', e);
  }
  return [];
}

/**
 * Restores all cycles and profile from a specific snapshot
 */
export function restoreFromSnapshot(snapshotId: string): { success: boolean; message: string } {
  try {
    const snapshots = getAutoBackupSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) {
      throw new Error('Snapshot não encontrado.');
    }

    const data = JSON.parse(target.jsonContent);
    if (!data.clinicalProfile || !data.cycles) {
      throw new Error('Dados de snapshot corrompidos.');
    }

    saveClinicalProfile(data.clinicalProfile);
    saveCycles(data.cycles);

    return {
      success: true,
      message: `Restaurado com sucesso para a versão de ${target.formattedTime} (${new Date(target.timestamp).toLocaleDateString('pt-BR')})!`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Falha ao restaurar: ${e.message}`,
    };
  }
}

/**
 * Toggles auto file download on or off
 */
export function setAutoDownloadFileSetting(enabled: boolean): void {
  const meta = getAutoBackupMetadata();
  if (meta) {
    meta.autoDownloadFileEnabled = enabled;
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP_META, JSON.stringify(meta));
  }
}

