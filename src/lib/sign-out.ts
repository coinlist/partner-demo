'use client';

/**
 * The server half of any sign-out: it revokes the token and clears the cookie.
 * Rejects if that fails, leaving the session in place.
 */
export async function postLogout(): Promise<void> {
  const res = await fetch('/api/coinlist/oauth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('POST /api/coinlist/oauth/logout failed');
}
