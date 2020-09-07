'use strict';

module.exports = ctx => {
  const { config, log } = ctx;

  log.info('Validating config');

  // Validation for config.url && config.root
  if (typeof config.url !== 'string') {
    throw new TypeError(`Invalid config detected: "url" should be string, not ${typeof config.url}!`);
  }
  try {
    // eslint-disable-next-line no-new
    new URL(config.url);
  } catch {
    throw new TypeError('Invalid config detected: "url" should be a valid URL!');
  }

  if (typeof config.root !== 'string') {
    throw new TypeError(`Invalid config detected: "root" should be string, not ${typeof config.root}!`);
  }
  if (config.root.trim().length <= 0) {
    throw new TypeError('Invalid config detected: "root" should not be empty!');
  }

  // Soft deprecate use_date_for_updated
  if (typeof config.use_date_for_updated === 'boolean') {
    log.warn('Deprecated config detected: "use_date_for_updated" is deprecated, please use "updated_option" instead. See https://hexo.io/docs/configuration for more details.');
  }

  // Soft deprecate external_link Boolean
  if (typeof config.external_link === 'boolean') {
    log.warn('Deprecated config detected: "external_link" with a Boolean value is deprecated. See https://hexo.io/docs/configuration for more details.');
  }
};

