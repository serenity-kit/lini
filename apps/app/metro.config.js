/* eslint-disable unicorn/prefer-module */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("node:path");

// from https://github.com/nativewind/nativewind/blob/main/examples/expo-router/metro.config.js
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Needed for monorepo setup (can be removed in standalone projects)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withNativeWind(config, {
  input: "./src/global.css",
  // from https://github.com/nativewind/nativewind/blob/main/examples/expo-router/metro.config.js
  inlineRem: false,
});
