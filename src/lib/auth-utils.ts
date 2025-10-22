import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    
    if (!session) return null;
    
    const decodedClaims = await adminAuth().verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
