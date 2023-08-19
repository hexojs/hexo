import { isAbsolute, resolve, join, extname } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'hexo-fs';
import yml from 'js-yaml';
import { deepMerge } from 'hexo-util';
import type Hexo from './index';

export = (ctx: Hexo) => function multiConfigPath(base: string, configPaths: string, outputDir: string) {
  const { log } = ctx;
  const defaultPath = join(base, '_config.yml');

  if (!configPaths) {
    log.w('No config file entered.');
    return join(base, '_config.yml');
  }

  let paths: string[];
  // determine if comma or space separated
  if (configPaths.includes(',')) {
    paths = configPaths.replace(' ', '').split(',');
  } else {
    // only one config
    let configPath = isAbsolute(configPaths) ? configPaths : resolve(base, configPaths);

    if (!existsSync(configPath)) {
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

    if (!existsSync(configPath)) {
      log.w(`Config file ${paths[i]} not found.`);
      continue;
    }

    // files read synchronously to ensure proper overwrite order
    const file = readFileSync(configPath);
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

  writeFileSync(outputPath, yml.dump(combinedConfig));

  // write file and return path
  return outputPath;
};
