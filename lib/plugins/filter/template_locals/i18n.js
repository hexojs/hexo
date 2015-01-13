var util = require('hexo-util');
var Pattern = util.Pattern;

function i18nLocalsFilter(locals){
  var i18n = this.theme.i18n;
  var config = this.config;
  var i18nDir = config.i18n_dir;
  var page = locals.page;
  var lang = page.lang || page.language;

  if (!lang){
    var pattern = new Pattern(i18nDir + '/*path');
    var data = pattern.match(locals.path);

    if (data && data.lang){
      lang = data.lang;
    } else {
      lang = config.language;
    }

    page.lang = lang;
  }

  locals.__ = i18n.__(lang);
  locals._p = i18n._p(lang);
}

module.exports = i18nLocalsFilter;