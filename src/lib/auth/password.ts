import bcrypt from "bcrypt";

/**
 * SALT_ROUNDS determines the computational cost of hashing.
 * 12 rounds provides strong security while maintaining acceptable performance.
 * Each increment doubles the computation time.
 *
 * Security Finding #6 (LOW): Increased from 10 to 12 rounds
 */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
