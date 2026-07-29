const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedPath = path.resolve(projectRoot, "vendor/shared");

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [projectRoot, sharedPath];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  "@vaija/shared": sharedPath,
};

module.exports = config;
