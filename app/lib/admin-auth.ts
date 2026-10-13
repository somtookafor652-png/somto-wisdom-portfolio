import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'admin-session';

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? '';
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPassword();
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function createAdminSessionValue() {
  const password = getAdminPassword();
  const secret = getSessionSecret();

  if (!password || !secret) {
    return '';
  }

  return hashValue(`${secret}:${password}`);
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  const provided = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const expectedSession = createAdminSessionValue();

  if (!sessionCookie || !expectedSession) {
    return false;
  }

  const actual = Buffer.from(sessionCookie);
  const expected = Buffer.from(expectedSession);

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
