const {
  envValueForVariant,
  normalizeUrl,
  readConfig,
  writeConfig,
} = require("./generated-config");

try {
  const config = readConfig();
  writeConfig({
    developmentUrl: config.developmentUrl,
    productionUrl: normalizeUrl(envValueForVariant("production"), "production"),
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
