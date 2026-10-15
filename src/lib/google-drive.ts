import { google } from 'googleapis';
import { Readable } from 'node:stream';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function getConfiguration() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!folderId || !clientEmail || !privateKey) {
    throw new Error('Google Drive n’est pas configuré. Renseignez GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
  }

  return { folderId, clientEmail, privateKey };
}

function getDriveClient() {
  const { clientEmail, privateKey } = getConfiguration();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [DRIVE_SCOPE],
  });

  return google.drive({ version: 'v3', auth });
}

export function isGoogleDriveFileUrl(value: string) {
  return value.startsWith('gdrive://');
}

export function getGoogleDriveFileId(value: string) {
  return isGoogleDriveFileUrl(value) ? value.slice('gdrive://'.length) : null;
}

export async function uploadToGoogleDrive(options: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const { folderId } = getConfiguration();
  const drive = getDriveClient();
  const { data } = await drive.files.create({
    requestBody: {
      name: options.fileName,
      parents: [folderId],
    },
    media: {
      mimeType: options.mimeType,
      body: Readable.from(options.buffer),
    },
    fields: 'id,webViewLink',
    supportsAllDrives: true,
  });

  if (!data.id) throw new Error('Google Drive n’a pas retourné l’identifiant du fichier.');

  return {
    id: data.id,
    webViewLink: data.webViewLink ?? `https://drive.google.com/open?id=${data.id}`,
  };
}

export async function deleteFromGoogleDrive(fileId: string) {
  const drive = getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
}
