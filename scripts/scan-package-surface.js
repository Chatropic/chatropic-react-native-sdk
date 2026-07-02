const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SCAN_TARGETS = ["dist", "README.md", "package.json"];

const FORBIDDEN_PATTERNS = [
  { name: "localhost", pattern: /\blocalhost\b/i },
  { name: "loopback IPv4", pattern: /\b127\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/ },
  { name: "non-HTTPS URL", pattern: /\bhttp:\/\/[^\s"'<>\\)]+/i },
  { name: "npm token reference", pattern: /\bNPM_TOKEN\b/ },
  { name: "secret key", pattern: /\bsk_(?:live|test)_[A-Za-z0-9_-]{8,}\b/ },
  { name: "publishable key literal", pattern: /\bcpk_(?:live|test)_[A-Za-z0-9_-]{8,}\b/ },
  {
    name: "private key material",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  },
];

function listFiles(target) {
  const fullPath = path.join(ROOT, target);
  if (!fs.existsSync(fullPath)) return [];
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) return [fullPath];
  if (!stat.isDirectory()) return [];

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const child = path.join(target, entry.name);
    return listFiles(child);
  });
}

const findings = [];

for (const file of SCAN_TARGETS.flatMap(listFiles)) {
  const rel = path.relative(ROOT, file);
  const contents = fs.readFileSync(file, "utf8");
  for (const { name, pattern } of FORBIDDEN_PATTERNS) {
    if (pattern.test(contents)) {
      findings.push(`${rel}: ${name}`);
    }
  }
}

if (findings.length) {
  console.error("Package surface scan failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Package surface scan passed.");
