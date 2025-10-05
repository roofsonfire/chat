import bcrypt from "bcrypt";
import readline from "readline";

const saltRounds = 10;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the password to hash: ", (password) => {
  if (!password) {
    console.error("Password cannot be empty.");
    rl.close();
    return;
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
    } else {
      console.log("Hashed password:", hash);
    }
    rl.close();
  });
});
