'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var deepAssign = require('deep-assign');
var yml = require('js-yaml');

module.exports = function(ctx) {
  return function multiConfigPath(base, configPaths) {
    var log = ctx.log;

    var defaultPath = pathFn.join(base, '_config.yml');
    var paths;

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
        log.w('Config file ' + configPaths + ' not found, using default.');
        return defaultPath;
      }

      return pathFn.resolve(base, configPaths);
    }

    var numPaths = paths.length;

    // combine files
    var combinedConfig = {};
    var count = 0;
    for (var i = 0; i < numPaths; i++) {
      if (!fs.existsSync(pathFn.join(base, paths[i]))) {
        log.w('Config file ' + paths[i] + ' not found.');
        continue;
      }

      // files read synchronously to ensure proper overwrite order
      var file = fs.readFileSync(pathFn.join(base, paths[i]));
      var ext = pathFn.extname(paths[i]).toLowerCase();

      if (ext === '.yml') {
        deepAssign(combinedConfig, yml.load(file));
        count++;
      } else if (ext === '.json') {
        deepAssign(combinedConfig, yml.safeLoad(file, {json: true}));
        count++;
      } else {
        log.w('Config file ' + paths[i] +
                                  ' not supported type.');
      }
    }

    if (count === 0) {
      log.e('No config files found. Using _config.yml.');
      return defaultPath;
    }

    log.i('Config based on', count, 'files');

    var outputPath = pathFn.join(base, '_multiconfig.yml');
    fs.writeFileSync(outputPath, yml.dump(combinedConfig));

    // write file and return path
    return outputPath;
  };
};
