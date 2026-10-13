import 'server-only';
import { createSign } from 'node:crypto';

type FirestoreScalar =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { nullValue: null }
  | { timestampValue: string };

type FirestoreValue =
  | FirestoreScalar
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

let accessTokenCache: AccessTokenCache | null = null;

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';
}

function getRequiredEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? '';
  const privateKey = getPrivateKey();

  return { clientEmail, privateKey, projectId };
}

export function isFirebaseConfigured() {
  const { clientEmail, privateKey, projectId } = getRequiredEnv();
  return Boolean(projectId && clientEmail && privateKey);
}

function getFirestoreBaseUrl() {
  const { projectId } = getRequiredEnv();

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not configured.');
  }

  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function getAccessToken() {
  const now = Date.now();

  if (accessTokenCache && accessTokenCache.expiresAt > now + 60_000) {
    return accessTokenCache.token;
  }

  const { clientEmail, privateKey } = getRequiredEnv();

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Firebase service account credentials are not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  }

  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/datastore',
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const assertion = `${unsignedToken}.${base64UrlEncode(signer.sign(privateKey))}`;
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Unable to obtain Firebase access token (${response.status}).`);
  }

  const result = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!result.access_token) {
    throw new Error('Firebase access token response did not include an access_token.');
  }

  accessTokenCache = {
    token: result.access_token,
    expiresAt: now + (result.expires_in ?? 3600) * 1000,
  };

  return result.access_token;
}

function encodeFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((entry) => encodeFirestoreValue(entry)),
      },
    };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  switch (typeof value) {
    case 'string':
      return { stringValue: value };
    case 'boolean':
      return { booleanValue: value };
    case 'number':
      if (Number.isInteger(value)) {
        return { integerValue: String(value) };
      }

      return { doubleValue: value };
    case 'object':
      return {
        mapValue: {
          fields: encodeFirestoreFields(value as Record<string, unknown>),
        },
      };
    default:
      return { stringValue: String(value) };
  }
}

function encodeFirestoreFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, encodeFirestoreValue(value)]),
  );
}

function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('booleanValue' in value) {
    return value.booleanValue;
  }

  if ('integerValue' in value) {
    return Number(value.integerValue);
  }

  if ('doubleValue' in value) {
    return value.doubleValue;
  }

  if ('timestampValue' in value) {
    return value.timestampValue;
  }

  if ('nullValue' in value) {
    return null;
  }

  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map((entry) => decodeFirestoreValue(entry));
  }

  return decodeFirestoreFields(value.mapValue.fields ?? {});
}

function decodeFirestoreFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]),
  );
}

function getDocumentId(document: FirestoreDocument) {
  const segments = document.name.split('/');
  return segments[segments.length - 1] ?? '';
}

async function firebasedFetch<T>(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const url = `${getFirestoreBaseUrl()}/${path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  return response as Response & { json(): Promise<T> };
}

export async function getDocument<T>(path: string): Promise<T | null> {
  const response = await firebasedFetch<FirestoreDocument>(path);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to fetch Firebase document "${path}" (${response.status}).`);
  }

  const document = await response.json();
  return decodeFirestoreFields(document.fields ?? {}) as T;
}

export async function listDocuments<T>(
  collectionPath: string,
): Promise<Array<{ id: string; data: T }>> {
  const response = await firebasedFetch<{ documents?: FirestoreDocument[] }>(collectionPath);

  if (response.status === 404) {
    return [] as Array<{ id: string; data: T }>;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to list Firebase collection "${collectionPath}" (${response.status}).`,
    );
  }

  const result = await response.json();

  return (result.documents ?? []).map((document: FirestoreDocument) => ({
    id: getDocumentId(document),
    data: decodeFirestoreFields(document.fields ?? {}) as T,
  }));
}

export async function setDocument(path: string, data: Record<string, unknown>) {
  const response = await firebasedFetch(path, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: encodeFirestoreFields(data),
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to write Firebase document "${path}" (${response.status}).`);
  }
}

export async function deleteDocument(path: string) {
  const response = await firebasedFetch(path, {
    method: 'DELETE',
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(`Unable to delete Firebase document "${path}" (${response.status}).`);
  }
}
