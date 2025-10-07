#!/usr/bin/env node
import bcrypt from "bcrypt";

// Load environment variables
const AUTH_USER_EMAIL = "REDACTED@example.com";
const AUTH_USER_PASSWORD_HASH =
  "$2b$10$hvBcdqhSx.L0nsCKGIgM9udmXwurFH28QclEecsKRoKTzE1DZYy4S";

// Test credentials
const testEmail = "REDACTED@example.com";
const testPassword = "2mas2es5";

console.log("🧪 Testing Authentication Logic\n");
console.log("Expected Email:", AUTH_USER_EMAIL);
console.log("Test Email:", testEmail);
console.log("Email Match:", testEmail === AUTH_USER_EMAIL);
console.log("");

console.log("Testing password...");
const passwordMatch = await bcrypt.compare(
  testPassword,
  AUTH_USER_PASSWORD_HASH
);
console.log("Password Match:", passwordMatch);
console.log("");

if (testEmail === AUTH_USER_EMAIL && passwordMatch) {
  console.log("✅ Authentication should SUCCEED!");
} else {
  console.log("❌ Authentication should FAIL!");
  if (testEmail !== AUTH_USER_EMAIL) {
    console.log("   Reason: Email mismatch");
  }
  if (!passwordMatch) {
    console.log("   Reason: Password mismatch");
  }
}
