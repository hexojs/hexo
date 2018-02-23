'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const _ = require('lodash');
const yml = require('js-yaml');

module.exports = ctx => function multiConfigPath(base, configPaths) {
  const log = ctx.log;

  const defaultPath = pathFn.join(base, '_config.yml');
  let paths;

  if (!configPaths) {
    log.w('No config file entered.');
    return pathFn.join(base, '_config.yml');
  }

  // determine if comma or space separated
  if (configPaths.indexOf(',') > -1) {
    paths = configPaths.replace(' ', '').split(',');

  } else {
    // only one config
    if (!fs.existsSync(pathFn.join(base, configPaths))) {
      log.w(`Config file ${configPaths} not found, using default.`);
      return defaultPath;
    }

    return pathFn.resolve(base, configPaths);
  }

  const numPaths = paths.length;

  // combine files
  const combinedConfig = {};
  let count = 0;
  for (let i = 0; i < numPaths; i++) {
    if (!fs.existsSync(pathFn.join(base, paths[i]))) {
      log.w(`Config file ${paths[i]} not found.`);
      continue;
    }

    // files read synchronously to ensure proper overwrite order
    const file = fs.readFileSync(pathFn.join(base, paths[i]));
    const ext = pathFn.extname(paths[i]).toLowerCase();

    if (ext === '.yml') {
      _.merge(combinedConfig, yml.load(file));
      count++;
    } else if (ext === '.json') {
      _.merge(combinedConfig, yml.safeLoad(file, {json: true}));
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

  const outputPath = pathFn.join(base, '_multiconfig.yml');
  fs.writeFileSync(outputPath, yml.dump(combinedConfig));

  // write file and return path
  return outputPath;
};
