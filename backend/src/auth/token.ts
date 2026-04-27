import { createHmac, timingSafeEqual } from 'crypto';

export type AuthTokenPayload = {
  sub: string;
  email: string;
  exp: number;
};

const secret = () => process.env.AUTH_SECRET ?? 'dev-secret-change-me';

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

export function signToken(payload: Omit<AuthTokenPayload, 'exp'>, ttlSeconds = 60 * 60 * 12) {
  const body: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = base64url(JSON.stringify(body));
  const signature = createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyToken(token: string): AuthTokenPayload {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    throw new Error('Invalid token');
  }
  const expected = createHmac('sha256', secret()).update(encoded).digest('base64url');
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid token');
  }
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AuthTokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Expired token');
  }
  return payload;
}
