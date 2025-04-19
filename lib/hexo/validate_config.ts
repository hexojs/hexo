import assert from 'assert';
import type Hexo from './index';

export = (ctx: Hexo): void => {
  const { config, log } = ctx;

  log.info('Validating config');

  // Validation for config.url && config.root
  if (typeof config.url !== 'string') {
    throw new TypeError(`Invalid config detected: "url" should be string, not ${typeof config.url}!`);
  }
  try {
    // eslint-disable-next-line no-new
    new URL(config.url);
    assert(new URL(config.url).protocol.startsWith('http'));
  } catch {
    throw new TypeError('Invalid config detected: "url" should be a valid URL!');
  }

  if (typeof config.root !== 'string') {
    throw new TypeError(`Invalid config detected: "root" should be string, not ${typeof config.root}!`);
  }
  if (config.root.trim().length <= 0) {
    throw new TypeError('Invalid config detected: "root" should not be empty!');
  }
};

