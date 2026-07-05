const fs = require("fs");
const path = require("path");

const GENERATED_PATH = path.join("src", "config", "generated.ts");
const GENERATED_CONSTS = {
  development: "CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL",
  production: "CHATROPIC_GENERATED_PRODUCTION_AGENT_URL",
};
const LEGACY_ENV = {
  development: "CHATROPIC_SDK_DEVELOPMENT_AGENT_URL",
  production: "CHATROPIC_SDK_PRODUCTION_AGENT_URL",
};

function readGeneratedConfig() {
  return fs.existsSync(GENERATED_PATH)
    ? fs.readFileSync(GENERATED_PATH, "utf8")
    : "";
}

function extractConst(content, name) {
  const match = new RegExp(`export const ${name} = "([^"]*)";`).exec(content);
  return match?.[1] ?? "";
}

function readConfig() {
  const content = readGeneratedConfig();
  return {
    developmentUrl: extractConst(content, GENERATED_CONSTS.development),
    productionUrl: extractConst(content, GENERATED_CONSTS.production),
  };
}

function writeConfig({ developmentUrl = "", productionUrl = "" }) {
  fs.writeFileSync(
    GENERATED_PATH,
    [
      `export const ${GENERATED_CONSTS.development} = ${JSON.stringify(developmentUrl)};`,
      `export const ${GENERATED_CONSTS.production} = ${JSON.stringify(productionUrl)};`,
      "",
    ].join("\n"),
  );
}

function envValueForVariant(variant) {
  const envName = envNameForVariant(variant);
  return process.env[envName];
}

function envNameForVariant(variant) {
  return variant === "production" ? LEGACY_ENV.production : GENERATED_CONSTS.development;
}

function normalizeUrl(rawUrl, variant) {
  if (!rawUrl || !rawUrl.trim()) {
    throw new Error(`${envNameForVariant(variant)} is required for ${variant} builds`);
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error(`${envNameForVariant(variant)} must be a valid absolute URL`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLoopback =
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.startsWith("127.");
  const isPrivateNetwork =
    isLoopback ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  if (variant === "production") {
    if (parsed.protocol !== "https:") {
      throw new Error(`${envNameForVariant(variant)} must use https://`);
    }
    if (isLoopback) {
      throw new Error(`${envNameForVariant(variant)} cannot point to a local host`);
    }
  } else if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isPrivateNetwork)) {
    throw new Error(
      `${envNameForVariant(variant)} must use https://, except http:// is allowed for local development hosts`,
    );
  }

  parsed.hash = "";
  parsed.search = "";
  return parsed.toString().replace(/\/+$/, "");
}

function parseVariant(rawVariant) {
  const variant = String(rawVariant ?? "").trim().toLowerCase();
  if (variant !== "development" && variant !== "production") {
    throw new Error("Build environment must be either development or production");
  }
  return variant;
}

module.exports = {
  GENERATED_CONSTS,
  envValueForVariant,
  envNameForVariant,
  normalizeUrl,
  parseVariant,
  readConfig,
  writeConfig,
};
