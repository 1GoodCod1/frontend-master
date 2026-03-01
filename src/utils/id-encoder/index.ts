const SECRET = (import.meta.env.VITE_ID_ENCRYPTION_SECRET as string)?.trim();
if (!SECRET) {
  throw new Error(
    'VITE_ID_ENCRYPTION_SECRET must be set in .env. Add: VITE_ID_ENCRYPTION_SECRET=<your-secret>',
  );
}

export function encodeId(id: string): string {
  try {
    const combined = `${SECRET}:${id}`;
    const encoded = btoa(combined).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return encoded;
  } catch (error) {
    console.error('Failed to encode ID:', error);
    return id;
  }
}

export function decodeId(encoded: string): string | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    const [secret, id] = decoded.split(':');

    if (secret !== SECRET || !id) return null;
    return id;
  } catch {
    return null;
  }
}

export function isValidEncodedId(encoded: string): boolean {
  return decodeId(encoded) !== null;
}
