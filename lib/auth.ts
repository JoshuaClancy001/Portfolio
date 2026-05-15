import { SignJWT, jwtVerify } from 'jose'

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret())
  return payload
}
