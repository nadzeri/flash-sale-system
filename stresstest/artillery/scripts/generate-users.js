const path = require("path");
const fs = require("fs");

const NUM_USERS = 100;
const DOMAIN = "sample.com";
const CSV_PATH = path.join(__dirname, "../data/users.csv");
const API_URL = "http://localhost:3000/api/auth/register";

const lines = ["email,password,token"];

async function main() {
  for (let i = 1; i <= NUM_USERS; i++) {
    const email = `user${Date.now()}_${i}@${DOMAIN}`;
    const password = `pass123456`;

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
