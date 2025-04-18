import { join, parse, basename, extname } from 'path';
import tildify from 'tildify';
import { exists, readdir } from 'hexo-fs';
import { magenta } from 'picocolors';
import { deepMerge } from 'hexo-util';
import type Hexo from './index';
import type Promise from 'bluebird';

export = (ctx: Hexo): Promise<void> => {
  if (!ctx.env.init) return;
  if (!ctx.config.theme) return;

  let configPath = join(ctx.base_dir, `_config.${String(ctx.config.theme)}.yml`);

  return exists(configPath).then(exist => {
    return exist ? configPath : findConfigPath(configPath);
  }).then(path => {
    if (!path) return;

    configPath = path;
    return ctx.render.render({ path });
  }).then(config => {
    if (!config || typeof config !== 'object') return;

    ctx.log.debug('Second Theme Config loaded: %s', magenta(tildify(configPath)));

    // ctx.config.theme_config should have highest priority
    // If ctx.config.theme_config exists, then merge it with _config.[theme].yml
    // If ctx.config.theme_config doesn't exist, set it to _config.[theme].yml
    ctx.config.theme_config = ctx.config.theme_config
      ? deepMerge(config, ctx.config.theme_config) : config;
  });
};

function findConfigPath(path: string): Promise<string> {
  const { dir, name } = parse(path);

  return readdir(dir).then(files => {
    const item = files.find(item => basename(item, extname(item)) === name);
    if (item != null) return join(dir, item);
  });
}
