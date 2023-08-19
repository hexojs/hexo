import yaml from 'js-yaml';
import { exists, writeFile } from 'hexo-fs';
import { extname } from 'path';
import Promise from 'bluebird';

function configConsole(args) {
  const key = args._[0];
  let value = args._[1];

  if (!key) {
    console.log(this.config);
    return Promise.resolve();
  }

  if (!value) {
    value = getProperty(this.config, key);
    if (value) console.log(value);
    return Promise.resolve();
  }

  const configPath = this.config_path;
  const ext = extname(configPath);

  return exists(configPath).then(exist => {
    if (!exist) return {};
    return this.render.render({path: configPath});
  }).then(config => {
    if (!config) config = {};

    setProperty(config, key, castValue(value));

    const result = ext === '.json' ? JSON.stringify(config) : yaml.dump(config);

    return writeFile(configPath, result);
  });
}

function getProperty(obj: object, key: string) {
  const split = key.split('.');
  let result = obj[split[0]];

  for (let i = 1, len = split.length; i < len; i++) {
    result = result[split[i]];
  }

  return result;
}

function setProperty(obj: object, key: string, value: any) {
  const split = key.split('.');
  let cursor = obj;
  const lastKey = split.pop();

  for (let i = 0, len = split.length; i < len; i++) {
    const name = split[i];
    cursor[name] = cursor[name] || {};
    cursor = cursor[name];
  }

  cursor[lastKey] = value;
}

function castValue(value: string) {
  switch (value) {
    case 'true':
      return true;

    case 'false':
      return false;

    case 'null':
      return null;

    case 'undefined':
      return undefined;
  }

  const num = Number(value);
  if (!isNaN(num)) return num;

  return value;
}

export = configConsole;
