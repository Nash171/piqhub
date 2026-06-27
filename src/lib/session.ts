import { sealData, unsealData } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionUser } from '@/types';

export const SESSION_COOKIE_NAME = 'piqhub-session';

export interface SessionData {
  user?: SessionUser;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return {};
  try {
    return await unsealData<SessionData>(cookie, {
      password: sessionOptions.password,
    });
  } catch {
    return {};
  }
}

export async function setSession(session: SessionData) {
  const cookieStore = await cookies();
  const sealed = await sealData(session, {
    password: sessionOptions.password,
  });
  cookieStore.set(SESSION_COOKIE_NAME, sealed, sessionOptions.cookieOptions);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...sessionOptions.cookieOptions,
    maxAge: 0,
  });
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
