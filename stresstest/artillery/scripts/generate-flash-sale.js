const path = require("path");
const fs = require("fs");

const START_DATE = new Date();
const END_DATE = new Date(START_DATE.getTime() + 1000 * 60 * 60 * 24 * 30);
const TOTAL_STOCK = 50;
const API_URL = "http://localhost:3000/api/flash-sales";
const CSV_PATH = path.join(__dirname, "../data/flash-sale.csv");

const lines = ["flash_sale_id"];

async function main() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate: START_DATE.toISOString(),
      endDate: END_DATE.toISOString(),
      totalStock: TOTAL_STOCK,
    }),
  });
  const data = await res.json();
  const id = data?.id || data?.flashSale?.id;
  if (!id) {
    throw new Error("Failed to extract flash sale id from response");
  }
  lines.push(id);
  fs.writeFileSync(CSV_PATH, lines.join("\n"), "utf8");
  console.log(`Generated flash sale in ${CSV_PATH}`);
}

main();
