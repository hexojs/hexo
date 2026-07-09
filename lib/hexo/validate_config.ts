import assert from 'assert';
import moment from 'moment-timezone';
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

  if (!config.timezone) {
    log.warn('No timezone setting detected! Using LocalTimeZone as the default timezone.');
    log.warn('This behavior will be changed to UTC in the next major version. Please set timezone explicitly (e.g. LocalTimeZone or America/New_York) in _config.yml to avoid this warning.');
    config.timezone = moment.tz.guess();
  } else if (config.timezone.toLowerCase() === 'localtimezone') {
    config.timezone = moment.tz.guess();
  } else {
    const configTimezone = moment.tz.zone(config.timezone);
    if (!configTimezone) {
      log.warn(
        `Invalid timezone setting detected! "${config.timezone}" is not a valid timezone. Using the default timezone UTC.`
      );
      config.timezone = 'UTC';
    } else {
      const machineTimezone = moment.tz.guess();
      if (configTimezone.name !== machineTimezone) {
        log.warn(
          `The timezone "${config.timezone}" setting is different from your machine timezone "${machineTimezone}". Make sure this is intended.`
        );
      }
    }
  }
};
