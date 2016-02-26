// config.es6.js

const config = {
  port: process.env.PORT || 4444,
  debug: process.env.DEBUG || true,
  assetPath: process.env.ASSET_PATH || '',
};

export default config;
