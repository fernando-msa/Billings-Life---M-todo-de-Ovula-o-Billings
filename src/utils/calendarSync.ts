import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Cycle, DailyLog, ClinicalProfile, DailyReminderConfig } from '../types/billings';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
];

const provider = new GoogleAuthProvider();
GOOGLE_CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initializes Firebase Auth state listener and in-memory token cache
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in via Firebase session but access token is cleared, we need fresh user interaction
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Initiates Google Sign-In with popup to acquire Calendar scope access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Calendar.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação com Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface CalendarEventPayload {
  summary: string;
  description: string;
  start: { date?: string; dateTime?: string; timeZone?: string };
  end: { date?: string; dateTime?: string; timeZone?: string };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'popup' | 'email'; minutes: number }>;
  };
}

/**
 * Creates an event directly in the user's Primary Google Calendar using the REST API
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEventPayload
): Promise<any> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Falha ao criar evento no Google Calendar.');
  }

  return response.json();
}

/**
 * Creates a recurring daily reminder in Google Calendar at the user's configured time
 */
export async function syncDailyReminderToGoogleCalendar(
  accessToken: string,
  reminderTime: string
): Promise<any> {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins duration

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

  const eventPayload: CalendarEventPayload = {
    summary: '🔔 Billings Life: Registro de Muco Cervical',
    description:
      'Lembrete diário do Método de Ovulação Billings (MOB):\n• Avalie a sensação vulvar mais fértil sentida ao longo das atividades do dia (seca, úmida, molhada, escorregadia ou lubrificada).\n• Registre no app Billings Life antes de deitar.',
    start: {
      dateTime: startDate.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone,
    },
    recurrence: ['RRULE:FREQ=DAILY'],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 0 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  return createGoogleCalendarEvent(accessToken, eventPayload);
}

/**
 * Syncs cycle milestone events (Peak Day, Fertile Window, Cycle Start) to Google Calendar
 */
export async function syncCycleMilestonesToGoogleCalendar(
  accessToken: string,
  cycle: Cycle,
  profile: ClinicalProfile
): Promise<{ added: number }> {
  let count = 0;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

  // 1. Cycle Start Event (All-day)
  await createGoogleCalendarEvent(accessToken, {
    summary: `🩸 Ciclo #${cycle.cycleNumber} — Início da Menstruação (MOB)`,
    description: `Início do ciclo menstrual no Billings Life. Paciente: ${profile.fullName}. Primeira Regra: abstenção nos dias de fluxo abundante.`,
    start: { date: cycle.startDate },
    end: { date: cycle.startDate },
  });
  count++;

  // 2. Peak Day if detected (All-day)
  const peakLog = cycle.logs.find((l) => l.isPeak);
  if (peakLog) {
    await createGoogleCalendarEvent(accessToken, {
      summary: `⭐ Dia Ápice Detectado (Dia ${peakLog.cycleDay} do Ciclo)`,
      description: `Dia Ápice do Método Billings no ciclo #${cycle.cycleNumber}. Sensação máxima de lubrificação/escorregadio seguida de mudança abrupta. Início da contagem de segurança 1, 2 e 3 pós-ápice.`,
      start: { date: peakLog.date },
      end: { date: peakLog.date },
    });
    count++;

    // 3. Post-peak day 4 (Fertility closed / Absolute infertile luteal phase)
    const peakDate = new Date(peakLog.date);
    const day4Date = new Date(peakDate);
    day4Date.setDate(day4Date.getDate() + 4);
    const day4Str = day4Date.toISOString().split('T')[0];

    await createGoogleCalendarEvent(accessToken, {
      summary: `🌿 Fase Lútea Consolidada (Infertilidade Absoluta - MOB)`,
      description: `A partir da 4ª manhã pós-ápice, a ovulação e a contagem de 3 dias de sobrevida do óvulo foram concluídas. Colo uterino ocluído pelo muco progestogênico até a próxima menstruação.`,
      start: { date: day4Str },
      end: { date: day4Str },
    });
    count++;
  }

  return { added: count };
}

/**
 * Generates RFC 5545 iCalendar (.ics) format for Apple Calendar (iOS/macOS) and universal calendar apps
 */
export function generateUniversalICS(
  cycle: Cycle,
  profile: ClinicalProfile,
  reminderConfig: DailyReminderConfig
): string {
  const [hours, minutes] = reminderConfig.time.split(':').map(Number);
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Format dates for iCalendar
  const formatDateOnly = (dStr: string) => dStr.replace(/-/g, '');

  const startHourStr = String(hours).padStart(2, '0');
  const startMinStr = String(minutes).padStart(2, '0');
  const endHourStr = String((hours + (minutes >= 45 ? 1 : 0)) % 24).padStart(2, '0');
  const endMinStr = String((minutes + 15) % 60).padStart(2, '0');

  const todayStr = now.toISOString().split('T')[0].replace(/-/g, '');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Billings Life//Metodo Billings//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Billings Life - Fertilidade & Ciclos',
    'X-WR-TIMEZONE:America/Sao_Paulo',

    // 1. Daily Recurring Reminder for iOS & Android
    'BEGIN:VEVENT',
    `UID:daily-reminder-${Date.now()}@billingslife.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${todayStr}T${startHourStr}${startMinStr}00`,
    `DTEND:${todayStr}T${endHourStr}${endMinStr}00`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🔔 Lembrete Diário: Registro de Muco (Billings)',
    'DESCRIPTION:Momento de registrar as sensações vulvares do dia no app Billings Life. Avalie secura\\, umidade\\, molhado ou lubrificação.',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete Billings Life',
    'END:VALARM',
    'END:VEVENT',
  ];

  // 2. Cycle Start Event
  if (cycle.startDate) {
    const cycleDateStr = formatDateOnly(cycle.startDate);
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:cycle-${cycle.id}-start@billingslife.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${cycleDateStr}`,
      `DTEND;VALUE=DATE:${cycleDateStr}`,
      `SUMMARY:🩸 Ciclo #${cycle.cycleNumber} - Início da Menstruação (MOB)`,
      `DESCRIPTION:Início do ciclo menstrual no Billings Life. Primeira regra: abstenção nos dias de sangramento intenso.`,
      'END:VEVENT'
    );
  }

  // 3. Peak Day if present
  const peakLog = cycle.logs.find((l) => l.isPeak);
  if (peakLog) {
    const peakDateStr = formatDateOnly(peakLog.date);
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:cycle-${cycle.id}-peak@billingslife.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${peakDateStr}`,
      `DTEND;VALUE=DATE:${peakDateStr}`,
      `SUMMARY:⭐ Dia Ápice Detectado (Dia ${peakLog.cycleDay} do Ciclo)`,
      `DESCRIPTION:Dia Ápice do Método Billings. Início da contagem de segurança 1\\, 2 e 3 pós-ápice.`,
      'END:VEVENT'
    );

    // Day 4 post-peak
    const peakDate = new Date(peakLog.date);
    const day4 = new Date(peakDate);
    day4.setDate(day4.getDate() + 4);
    const day4DateStr = formatDateOnly(day4.toISOString().split('T')[0]);

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:cycle-${cycle.id}-luteal@billingslife.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${day4DateStr}`,
      `DTEND;VALUE=DATE:${day4DateStr}`,
      `SUMMARY:🌿 Fase Lútea Consolidada (Infertilidade Absoluta - MOB)`,
      `DESCRIPTION:Fase lútea pós-contagem liberada até a próxima menstruação.`,
      'END:VEVENT'
    );
  }

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Downloads .ics file to open in Apple Calendar (iOS/macOS) or Android calendar apps
 */
export function downloadUniversalICS(
  cycle: Cycle,
  profile: ClinicalProfile,
  reminderConfig: DailyReminderConfig
): void {
  const content = generateUniversalICS(cycle, profile, reminderConfig);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lembretes_billings_calendario.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates direct Google Calendar Web template link (works in any browser without login)
 */
export function getGoogleCalendarWebURL(
  title: string,
  details: string,
  dateStr: string,
  timeStr = '21:30'
): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const start = new Date(dateStr);
  start.setHours(hours, minutes, 0);
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const base = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    dates: `${formatGCal(start)}/${formatGCal(end)}`,
    recur: 'RRULE:FREQ=DAILY',
  });

  return `${base}?${params.toString()}`;
}
