import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/app/lib/admin-auth';

type LoginPayload = {
  password?: string;
  nextPath?: string;
};

function getSafeRedirectPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/admin';
  }

  return nextPath;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin access is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const { nextPath, password } = payload;

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const sessionValue = createAdminSessionValue();

  if (!sessionValue) {
    return NextResponse.json(
      { error: 'Unable to create an admin session.' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ redirectTo: getSafeRedirectPath(nextPath) });
}
