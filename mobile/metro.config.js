const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'mjs' and 'cjs' to support some newer Node packages like lucide-react-native
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
