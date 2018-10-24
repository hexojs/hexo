'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const merge = require('lodash/merge');
const yml = require('js-yaml');

module.exports = ctx => function multiConfigPath(base, configPaths, outputDir) {
  const log = ctx.log;

  const defaultPath = pathFn.join(base, '_config.yml');
  let paths;

  if (!configPaths) {
    log.w('No config file entered.');
    return pathFn.join(base, '_config.yml');
  }

  // determine if comma or space separated
  if (configPaths.includes(',')) {
    paths = configPaths.replace(' ', '').split(',');
  } else {
    // only one config
    let configPath = pathFn.isAbsolute(configPaths) ? configPaths : pathFn.resolve(base, configPaths);

    if (!fs.existsSync(configPath)) {
      log.w(`Config file ${configPaths} not found, using default.`);
      configPath = defaultPath;
    }

    return configPath;
  }

  const numPaths = paths.length;

  // combine files
  const combinedConfig = {};
  let count = 0;
  for (let i = 0; i < numPaths; i++) {
    let configPath = '';

    if (pathFn.isAbsolute(paths[i])) {
      configPath = paths[i];
    } else {
      configPath = pathFn.join(base, paths[i]);
    }

    if (!fs.existsSync(configPath)) {
      log.w(`Config file ${paths[i]} not found.`);
      continue;
    }

    // files read synchronously to ensure proper overwrite order
    const file = fs.readFileSync(configPath);
    const ext = pathFn.extname(paths[i]).toLowerCase();

    if (ext === '.yml') {
      merge(combinedConfig, yml.load(file));
      count++;
    } else if (ext === '.json') {
      merge(combinedConfig, yml.safeLoad(file, {json: true}));
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
  const outputPath = pathFn.join(multiconfigRoot, '_multiconfig.yml');

  log.d(`Writing _multiconfig.yml to ${outputPath}`);

  fs.writeFileSync(outputPath, yml.dump(combinedConfig));

  // write file and return path
  return outputPath;
};
