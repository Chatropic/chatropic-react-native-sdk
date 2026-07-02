const fs = require("fs");
const path = require("path");

const rawUrl = process.env.CHATROPIC_SDK_PRODUCTION_AGENT_URL;

if (!rawUrl || !rawUrl.trim()) {
  console.error("CHATROPIC_SDK_PRODUCTION_AGENT_URL secret is required");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(rawUrl.trim());
} catch {
  console.error("CHATROPIC_SDK_PRODUCTION_AGENT_URL must be a valid absolute URL");
  process.exit(1);
}

if (parsed.protocol !== "https:") {
  console.error("CHATROPIC_SDK_PRODUCTION_AGENT_URL must use https://");
  process.exit(1);
}

const hostname = parsed.hostname.toLowerCase();
const isLoopback =
  hostname === "localhost" ||
  hostname === "0.0.0.0" ||
  hostname === "::1" ||
  hostname.startsWith("127.");

if (isLoopback) {
  console.error("CHATROPIC_SDK_PRODUCTION_AGENT_URL cannot point to a local host");
  process.exit(1);
}

parsed.hash = "";
parsed.search = "";
const cleanUrl = parsed.toString().replace(/\/+$/, "");
const output = `export const CHATROPIC_GENERATED_PRODUCTION_AGENT_URL = ${JSON.stringify(cleanUrl)};\n`;

fs.writeFileSync(path.join("src", "config", "generated.ts"), output);
