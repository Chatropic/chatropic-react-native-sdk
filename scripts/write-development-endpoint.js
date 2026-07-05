const fs = require("fs");
const path = require("path");

const generatedPath = path.join("src", "config", "generated.ts");
const current = fs.existsSync(generatedPath)
  ? fs.readFileSync(generatedPath, "utf8")
  : "";
const productionUrl =
  extractConst(current, "CHATROPIC_GENERATED_PRODUCTION_AGENT_URL") || "";
const rawUrl = process.env.CHATROPIC_SDK_DEVELOPMENT_AGENT_URL;

if (!rawUrl || !rawUrl.trim()) {
  console.error("CHATROPIC_SDK_DEVELOPMENT_AGENT_URL is required");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(rawUrl.trim());
} catch {
  console.error("CHATROPIC_SDK_DEVELOPMENT_AGENT_URL must be a valid absolute URL");
  process.exit(1);
}

const hostname = parsed.hostname.toLowerCase();
const isLocal =
  hostname === "localhost" ||
  hostname === "0.0.0.0" ||
  hostname === "::1" ||
  hostname.startsWith("127.") ||
  /^10\./.test(hostname) ||
  /^192\.168\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocal)) {
  console.error(
    "CHATROPIC_SDK_DEVELOPMENT_AGENT_URL must use https://, except http:// is allowed for local development hosts",
  );
  process.exit(1);
}

parsed.hash = "";
parsed.search = "";
const cleanUrl = parsed.toString().replace(/\/+$/, "");

fs.writeFileSync(
  generatedPath,
  generatedOutput({
    developmentUrl: cleanUrl,
    productionUrl,
  }),
);

function extractConst(content, name) {
  const match = new RegExp(
    `export const ${name} = "([^"]*)";`,
  ).exec(content);
  return match?.[1];
}

function generatedOutput({ developmentUrl, productionUrl }) {
  return [
    `export const CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL = ${JSON.stringify(developmentUrl)};`,
    `export const CHATROPIC_GENERATED_PRODUCTION_AGENT_URL = ${JSON.stringify(productionUrl)};`,
    "",
  ].join("\n");
}
