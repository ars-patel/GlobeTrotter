import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";

const BCRYPT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
