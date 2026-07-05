const {
  envValueForVariant,
  normalizeUrl,
  readConfig,
  writeConfig,
} = require("./generated-config");

try {
  const config = readConfig();
  writeConfig({
    developmentUrl: normalizeUrl(envValueForVariant("development"), "development"),
    productionUrl: config.productionUrl,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
