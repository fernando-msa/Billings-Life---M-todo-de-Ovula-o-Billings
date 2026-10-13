/**
 * Solar Astronomical Calculations & Sunset Detection for Circadian Dark Mode
 * Computes exact sunrise and sunset times based on GPS coordinates or timezone approximation.
 */

export type ThemePreference = 'sunset' | 'dark' | 'light';

export interface SunCalculationResult {
  sunrise: Date;
  sunset: Date;
  isNightTime: boolean;
  sunriseFormatted: string;
  sunsetFormatted: string;
  locationName: string;
  isGpsAccurate: boolean;
}

const THEME_STORAGE_KEY = 'billings_theme_preference_v1';
const GEO_COORDS_STORAGE_KEY = 'billings_cached_coords_v1';

/**
 * Approximate coordinates for common timezones as fallback
 */
const TIMEZONE_COORDINATE_MAP: Record<string, { lat: number; lng: number; name: string }> = {
  'America/Sao_Paulo': { lat: -23.5505, lng: -46.6333, name: 'São Paulo/Brasília' },
  'America/Bahia': { lat: -12.9777, lng: -38.5016, name: 'Salvador' },
  'America/Recife': { lat: -8.0476, lng: -34.8770, name: 'Recife' },
  'America/Fortaleza': { lat: -3.7319, lng: -38.5267, name: 'Fortaleza' },
  'America/Belem': { lat: -1.4558, lng: -48.4902, name: 'Belém' },
  'America/Manaus': { lat: -3.1190, lng: -60.0217, name: 'Manaus' },
  'America/Cuiaba': { lat: -15.6014, lng: -56.0979, name: 'Cuiabá' },
  'America/Porto_Velho': { lat: -8.7619, lng: -63.9039, name: 'Porto Velho' },
  'America/Boa_Vista': { lat: 2.8235, lng: -60.6758, name: 'Boa Vista' },
  'America/Rio_Branco': { lat: -9.9753, lng: -67.8249, name: 'Rio Branco' },
  'America/Campo_Grande': { lat: -20.4697, lng: -54.6201, name: 'Campo Grande' },
  'America/Buenos_Aires': { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires' },
  'America/Montevideo': { lat: -34.9011, lng: -56.1645, name: 'Montevidéu' },
  'America/Santiago': { lat: -33.4489, lng: -70.6693, name: 'Santiago' },
  'Europe/Lisbon': { lat: 38.7223, lng: -9.1393, name: 'Lisboa' },
  'Europe/Madrid': { lat: 40.4168, lng: -3.7038, name: 'Madri' },
  'Europe/London': { lat: 51.5074, lng: -0.1278, name: 'Londres' },
  'America/New_York': { lat: 40.7128, lng: -74.0060, name: 'Nova York' },
  'America/Los_Angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
};

/**
 * Astronomical formula to calculate Solar Sunrise and Sunset
 * Uses standard solar declination, equation of time, and zenith 90.833° (standard atmospheric refraction)
 */
export function calculateSunTimes(latitude: number, longitude: number, date: Date = new Date()): { sunrise: Date; sunset: Date } {
  const zenith = 90.8333 * (Math.PI / 180); // Official zenith with atmospheric refraction
  const radLat = latitude * (Math.PI / 180);

  // Day of the year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Approximate solar longitude
  const lngHour = longitude / 15;

  const calculateEvent = (isSunrise: boolean): Date => {
    const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    const radM = M * (Math.PI / 180);

    let L = M + (1.916 * Math.sin(radM)) + (0.020 * Math.sin(2 * radM)) + 282.634;
    L = ((L % 360) + 360) % 360;
    const radL = L * (Math.PI / 180);

    let RA = (180 / Math.PI) * Math.atan(0.91764 * Math.tan(radL));
    RA = ((RA % 360) + 360) % 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;

    const sinDec = 0.39782 * Math.sin(radL);
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH = (Math.cos(zenith) - (sinDec * Math.sin(radLat))) / (cosDec * Math.cos(radLat));

    // Clamp for polar regions
    const clampedCosH = Math.max(-1, Math.min(1, cosH));

    let H: number;
    if (isSunrise) {
      H = 360 - (180 / Math.PI) * Math.acos(clampedCosH);
    } else {
      H = (180 / Math.PI) * Math.acos(clampedCosH);
    }
    H = H / 15;

    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;

    const hours = Math.floor(UT);
    const minutes = Math.floor((UT - hours) * 60);
    const seconds = Math.floor(((UT - hours) * 60 - minutes) * 60);

    const eventDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds));
    return eventDate;
  };

  const sunrise = calculateEvent(true);
  const sunset = calculateEvent(false);

  return { sunrise, sunset };
}

/**
 * Gets approximate coordinates for the user's timezone
 */
export function getFallbackCoordinates(): { lat: number; lng: number; name: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COORDINATE_MAP[tz]) {
      return TIMEZONE_COORDINATE_MAP[tz];
    }
  } catch (e) {
    // Ignore error
  }
  // Default to standard Brazil Central / Brasília coordinates
  return { lat: -15.7975, lng: -47.8919, name: 'Horário de Brasília' };
}

/**
 * Computes current sun times for the user
 */
export function getLocalSunCalculation(): SunCalculationResult {
  const now = new Date();
  let lat: number | undefined;
  let lng: number | undefined;
  let locationName = '';
  let isGpsAccurate = false;

  // Check cached GPS coords
  try {
    const cached = localStorage.getItem(GEO_COORDS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        lat = parsed.lat;
        lng = parsed.lng;
        locationName = parsed.name || 'Localização GPS';
        isGpsAccurate = true;
      }
    }
  } catch (e) {
    // ignore
  }

  if (lat === undefined || lng === undefined) {
    const fallback = getFallbackCoordinates();
    lat = fallback.lat;
    lng = fallback.lng;
    locationName = fallback.name;
  }

  const { sunrise, sunset } = calculateSunTimes(lat, lng, now);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if it is currently night time (after sunset or before sunrise)
  const isNightTime = now.getTime() >= sunset.getTime() || now.getTime() < sunrise.getTime();

  return {
    sunrise,
    sunset,
    isNightTime,
    sunriseFormatted: formatTime(sunrise),
    sunsetFormatted: formatTime(sunset),
    locationName,
    isGpsAccurate,
  };
}

/**
 * Requests browser GPS location to refine solar sunset calculations
 */
export async function requestGpsForSolarCalibration(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return false;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: `GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
            timestamp: Date.now(),
          };
          localStorage.setItem(GEO_COORDS_STORAGE_KEY, JSON.stringify(coords));
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      },
      () => {
        resolve(false);
      },
      { timeout: 7000, maximumAge: 3600000 }
    );
  });
}

/**
 * Gets user's saved theme preference ('sunset' | 'dark' | 'light')
 */
export function getSavedThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference;
    if (saved === 'dark' || saved === 'light' || saved === 'sunset') {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return 'sunset'; // Default: automatically sync with sunset!
}

/**
 * Saves theme preference
 */
export function saveThemePreference(pref: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch (e) {
    console.error('Failed saving theme preference:', e);
  }
}

/**
 * Evaluates whether dark mode should be enabled right now
 */
export function shouldEnableDarkMode(pref: ThemePreference): { isDark: boolean; reason: string } {
  if (pref === 'dark') {
    return { isDark: true, reason: 'Modo Escuro manual ativado' };
  }
  if (pref === 'light') {
    return { isDark: false, reason: 'Modo Claro manual ativado' };
  }

  // Auto sunset detection
  const solar = getLocalSunCalculation();
  if (solar.isNightTime) {
    return {
      isDark: true,
      reason: `Pôr do Sol às ${solar.sunsetFormatted} (${solar.locationName})`,
    };
  } else {
    return {
      isDark: false,
      reason: `Dia solar (Nascer: ${solar.sunriseFormatted} | Pôr: ${solar.sunsetFormatted})`,
    };
  }
}

/**
 * Applies the calculated dark mode state to the document
 */
export function applyThemeToDOM(isDark: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (isDark) {
    root.classList.add('dark');
    body.classList.add('dark');
    // Set meta theme-color for mobile browser toolbar
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#0F172A');
    }
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#FAF8F5');
    }
  }
}
