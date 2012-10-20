var moment = require('moment'),
  config = hexo.config;

if (config.language) moment.lang(config.language);

module.exports = moment;