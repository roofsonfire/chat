#!/usr/bin/env node

/**
 * Password hashing utility script
 * Generates a bcrypt hash for user passwords
 *
 * Usage: npm run hash-password
 *
 * This script uses the same SALT_ROUNDS as the application (12 rounds)
 * to ensure consistency in production.
 */

import bcrypt from "bcrypt";
import readline from "readline";

const SALT_ROUNDS = 12;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🔐 Password Hash Generator");
console.log(`Using ${SALT_ROUNDS} salt rounds (matching application config)\n`);

rl.question("Enter password to hash: ", async (password) => {
  if (!password || password.trim().length === 0) {
    console.error("❌ Error: Password cannot be empty");
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn("⚠️  Warning: Password is less than 8 characters");
  }

  try {
    console.log(
      "\n⏳ Generating hash (this may take a few seconds with 12 rounds)...\n"
    );

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    console.log("✅ Hash generated successfully!\n");
    console.log("Copy this hash to your .env.local file:");
    console.log("─".repeat(60));
    console.log(hash);
    console.log("─".repeat(60));
    console.log("\nExample .env.local entry:");
    console.log(`AUTH_USER_PASSWORD_HASH="${hash}"`);
    console.log(
      "\n💡 Tip: Restart your development server after updating .env.local\n"
    );
  } catch (error) {
    console.error("❌ Error generating hash:", error.message);
    process.exit(1);
  }

  rl.close();
});
