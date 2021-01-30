'use strict';

const { isAbsolute, resolve, join, extname } = require('path');
const fs = require('hexo-fs');
const yml = require('js-yaml');
const { deepMerge } = require('hexo-util');

module.exports = ctx => function multiConfigPath(base, configPaths, outputDir) {
  const { log } = ctx;
  const defaultPath = join(base, '_config.yml');

  if (!configPaths) {
    log.w('No config file entered.');
    return join(base, '_config.yml');
  }

  let paths;
  // determine if comma or space separated
  if (configPaths.includes(',')) {
    paths = configPaths.replace(' ', '').split(',');
  } else {
    // only one config
    let configPath = isAbsolute(configPaths) ? configPaths : resolve(base, configPaths);

    if (!fs.existsSync(configPath)) {
      log.w(`Config file ${configPaths} not found, using default.`);
      configPath = defaultPath;
    }

    return configPath;
  }

  const numPaths = paths.length;

  // combine files
  let combinedConfig = {};
  let count = 0;
  for (let i = 0; i < numPaths; i++) {
    const configPath = isAbsolute(paths[i]) ? paths[i] : join(base, paths[i]);

    if (!fs.existsSync(configPath)) {
      log.w(`Config file ${paths[i]} not found.`);
      continue;
    }

    // files read synchronously to ensure proper overwrite order
    const file = fs.readFileSync(configPath);
    const ext = extname(paths[i]).toLowerCase();

    if (ext === '.yml') {
      combinedConfig = deepMerge(combinedConfig, yml.load(file));
      count++;
    } else if (ext === '.json') {
      combinedConfig = deepMerge(combinedConfig, yml.load(file, {json: true}));
      count++;
    } else {
      log.w(`Config file ${paths[i]} not supported type.`);
    }
  }

  if (count === 0) {
    log.e('No config files found. Using _config.yml.');
    return defaultPath;
  }

  log.i('Config based on', count, 'files');

  const multiconfigRoot = outputDir || base;
  const outputPath = join(multiconfigRoot, '_multiconfig.yml');

  log.d(`Writing _multiconfig.yml to ${outputPath}`);

  fs.writeFileSync(outputPath, yml.dump(combinedConfig));

  // write file and return path
  return outputPath;
};
