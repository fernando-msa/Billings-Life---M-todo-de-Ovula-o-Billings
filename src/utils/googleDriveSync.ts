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
import { Cycle, ClinicalProfile } from '../types/billings';

// Reuse existing Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const provider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleDriveLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  description?: string;
}

/**
 * Searches or creates the "Billings Life Backups" folder in user's Google Drive
 */
async function getOrCreateBillingsFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent("name = 'Billings Life Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error('Falha ao consultar pastas no Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Billings Life Backups',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Pasta de backups seguros e registros do Método de Ovulação Billings (MOB)',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Falha ao criar pasta de backups no Google Drive');
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Uploads full cycle and clinical record backup to Google Drive
 */
export async function uploadBackupToGoogleDrive(
  cycles: Cycle[],
  profile: ClinicalProfile,
  accessToken: string,
  customNote?: string
): Promise<{ success: boolean; fileId?: string; fileName?: string; error?: string }> {
  try {
    const folderId = await getOrCreateBillingsFolder(accessToken);
    const dateStr = new Date().toISOString().split('T')[0];
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `billings_life_backup_${dateStr}_${timestampStr}.json`;

    const payload = {
      app: 'Billings Life — Método de Ovulação Billings (MOB)',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      note: customNote || 'Backup completo de ciclos e histórico clínico',
      profile,
      cycles,
    };

    const fileContent = JSON.stringify(payload, null, 2);

    // Multipart upload
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `Backup clínico Billings Life - ${cycles.length} ciclos, ${cycles.reduce((acc, c) => acc + c.logs.length, 0)} dias registrados`,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP ${res.status} ao enviar arquivo para o Google Drive`);
    }

    const data = await res.json();
    return { success: true, fileId: data.id, fileName: data.name };
  } catch (err: any) {
    console.error('Error uploading backup to Drive:', err);
    return { success: false, error: err.message || 'Falha ao sincronizar com Google Drive' };
  }
}

/**
 * Lists backups in Google Drive
 */
export async function listBackupsFromGoogleDrive(accessToken: string): Promise<DriveBackupFile[]> {
  try {
    const query = encodeURIComponent("name contains 'billings_life_backup' and trashed = false");
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,modifiedTime,size,webViewLink,description)&pageSize=20`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      throw new Error(`Falha ao listar backups do Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing Drive backups:', err);
    return [];
  }
}

/**
 * Downloads and parses backup file content from Google Drive
 */
export async function downloadBackupFromGoogleDrive(
  fileId: string,
  accessToken: string
): Promise<{ success: boolean; data?: { profile: ClinicalProfile; cycles: Cycle[] }; error?: string }> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error('Falha ao baixar conteúdo do backup do Google Drive');
    }

    const json = await res.json();
    if (!json.cycles || !Array.isArray(json.cycles)) {
      throw new Error('O arquivo selecionado não contém uma estrutura de ciclos válida do Billings Life.');
    }

    return {
      success: true,
      data: {
        profile: json.profile,
        cycles: json.cycles,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao processar backup do Drive' };
  }
}

/**
 * Deletes backup from Google Drive (Requires explicit user confirmation)
 */
export async function deleteBackupFromGoogleDrive(
  fileId: string,
  accessToken: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return res.ok || res.status === 204;
}
