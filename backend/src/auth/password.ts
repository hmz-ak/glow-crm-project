import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const iterations = 100_000;
const keyLength = 32;
const digest = 'sha256';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [storedIterations, salt, hash] = stored.split(':');
  const candidate = pbkdf2Sync(
    password,
    salt,
    Number(storedIterations),
    keyLength,
    digest,
  );
  return timingSafeEqual(Buffer.from(hash, 'hex'), candidate);
}
