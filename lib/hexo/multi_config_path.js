'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var chalk = require('chalk');
var deepAssign = require('deep-assign');
var yml = require('js-yaml');

module.exports = function multiConfigPath(base, configPaths) {
  var outputPath = '_multiconfig.yml';
  var paths;

  // determine if comma or space separated
  if (configPaths.indexOf(',') > -1) {
    paths = configPaths.replace(' ', '').split(',');

  } else {
    // only one config
    if(!fs.existsSync(pathFn.join(base, configPaths)))
      console.warn(chalk.yellow('Config file '+configPaths+
                                ' not found, using default.'));

    return pathFn.resolve(base, configPaths);
  }

  var numPaths = paths.length;

  // combine files
  var combinedConfig = {};
  for (var i = 0 ; i < numPaths ; i++) {
    if (!fs.existsSync(pathFn.join(base, paths[i]))) {
      console.warn(chalk.yellow('Config file '+paths[i]+' not found, using default.'));
      continue;
    }

    // files read synchronously to ensure proper overwrite order
    var file = fs.readFileSync(paths[i]);
    var ext = pathFn.extname(paths[i]).toLowerCase();

    if (ext === '.yml') {
      deepAssign(combinedConfig, yml.safeLoad(file));
    } else if (ext === '.json') {
      deepAssign(combinedConfig, yml.safeLoad(file, {json: true}));
    } else {
      console.warn(chalk.yellow('Config file '+paths[i]+' not found, using default.'));
    }
  }

  outputPath = pathFn.join(base, outputPath);
  fs.writeFileSync(outputPath, yml.dump(combinedConfig))

  // write file and return path
  return outputPath;
}
