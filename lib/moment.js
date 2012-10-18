var moment = require('moment'),
  config = hexo.config;

if (config.language){
  var lang = config.language.split('_');

  if (lang.length > 1){
    lang = lang[0] + '-' + lang[1].toUpperCase();
  } else {
    lang = config.language;
  }

  moment.lang(lang);
}

module.exports = moment;