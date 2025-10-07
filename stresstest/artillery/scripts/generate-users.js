const path = require("path");
const fs = require("fs");

// Parse --count=<number> from CLI args, default to 1 user
const arg = process.argv.find((a) => a.startsWith("--count="));
const NUM_USERS = Math.max(1, Number(arg?.split("=")[1] ?? 1));
const CSV_PATH = path.join(__dirname, "../data/users.csv");
const API_URL = `http://localhost:33000/api/auth/register`;

const lines = ["email,password,token"];

async function main() {
  for (let i = 1; i <= NUM_USERS; i++) {
    const email = `user${Date.now()}_${i}@example.com`;
    const password = `Password123!`;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      lines.push(`${email},${password},${data.token}`);
      console.log(`Created user ${i}: ${email}`);
    } catch (err) {
      console.error(
        `Failed to create user ${email}:`,
        err.response?.data || err.message
      );
    }
  }
  fs.writeFileSync(CSV_PATH, lines.join("\n"), "utf8");
  console.log(`Generated ${NUM_USERS} users in ${CSV_PATH}`);
}

main();
