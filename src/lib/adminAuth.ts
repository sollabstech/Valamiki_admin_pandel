'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Admin login credentials.
 *
 * The DEFAULT below is baked into the code (no .env file needed). The admin can
 * change the username / password from Dashboard → Settings; once they do, the
 * new values are stored in Firestore at `settings/adminAuth` (password as a
 * SHA-256 hash, never plaintext) and take over from the default.
 *
 * Note: this is a lightweight gate for an internal tool. Everything runs in the
 * browser, so treat it as "keep casual visitors out", not real security. For
 * that, use Firebase Auth + Firestore security rules.
 */
export const DEFAULT_ADMIN = {
  username: 'admin@sollabstech',
  password: '123456',
};

const AUTH_DOC = doc(db, 'settings', 'adminAuth');
const SESSION_KEY = 'valamiki_admin_session';

type StoredAuth = {
  username: string;
  passwordHash: string;
};

/** SHA-256 → lowercase hex. Available in every modern browser (and on localhost). */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Reads the saved credentials from Firestore, or null if none saved yet. */
async function readStoredAuth(): Promise<StoredAuth | null> {
  try {
    const snap = await getDoc(AUTH_DOC);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (typeof data.username !== 'string' || typeof data.passwordHash !== 'string') return null;
    return { username: data.username, passwordHash: data.passwordHash };
  } catch {
    return null;
  }
}

/** The username currently in effect (saved value, else the built-in default). */
export async function getActiveUsername(): Promise<string> {
  const stored = await readStoredAuth();
  return stored?.username ?? DEFAULT_ADMIN.username;
}

/** True when username + password match the saved credentials (or the default). */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const u = username.trim().toLowerCase();
  const stored = await readStoredAuth();

  if (stored) {
    return u === stored.username.trim().toLowerCase() && (await hashPassword(password)) === stored.passwordHash;
  }
  return u === DEFAULT_ADMIN.username.toLowerCase() && password === DEFAULT_ADMIN.password;
}

/**
 * Changes the saved username / password after checking the current password.
 * Returns an error string on failure, or null on success.
 */
export async function changeCredentials(
  currentPassword: string,
  newUsername: string,
  newPassword: string,
): Promise<string | null> {
  const activeUsername = await getActiveUsername();

  if (!(await verifyCredentials(activeUsername, currentPassword))) {
    return 'Current password is incorrect.';
  }
  if (!newUsername.trim()) return 'Username cannot be empty.';
  if (newPassword.length < 4) return 'New password must be at least 4 characters.';

  try {
    await setDoc(AUTH_DOC, {
      username: newUsername.trim(),
      passwordHash: await hashPassword(newPassword),
      updatedAt: serverTimestamp(),
    });
    return null;
  } catch (e) {
    return 'Could not save to the database: ' + (e instanceof Error ? e.message : String(e));
  }
}

// ── Session (kept in this browser only) ──────────────────────────────────────

export function startSession(): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now() }));
  } catch {
    /* ignore storage errors */
  }
}

export function endSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export function isLoggedIn(): boolean {
  try {
    return Boolean(localStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
}
