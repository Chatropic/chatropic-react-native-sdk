const {
  envValueForVariant,
  normalizeUrl,
  parseVariant,
  readConfig,
  writeConfig,
} = require("./generated-config");

let variant;
try {
  variant = parseVariant(process.argv[2] ?? process.env.CHATROPIC_SDK_BUILD_ENV);
  const config = readConfig();
  const cleanUrl = normalizeUrl(envValueForVariant(variant), variant);
  writeConfig({
    developmentUrl: variant === "development" ? cleanUrl : "",
    productionUrl: variant === "production" ? cleanUrl : "",
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
