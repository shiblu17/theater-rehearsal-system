import { cookies } from 'next/headers';
import { getMembers } from './db';

const COOKIE_NAME = 'roktokorobi_actor_session';

/**
 * Create a secure HTTP-Only cookie session for the authenticated actor.
 */
export async function setSession(roll: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, roll, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Retrieve the roll number stored in the active session.
 */
export async function getSessionRoll(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    return session ? session.value : null;
  } catch (e) {
    return null;
  }
}

/**
 * Retrieve the full Member profile of the logged-in actor.
 */
export async function getSessionMember() {
  const roll = await getSessionRoll();
  if (!roll) return null;
  const members = await getMembers();
  return members.find(m => m.roll === roll) || null;
}

/**
 * Delete the active session cookie (logout).
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
