'use strict';

var util = require('hexo-util');
var Pattern = util.Pattern;
var _ = require('lodash');

function i18nLocalsFilter(locals) {
  var i18n = this.theme.i18n;
  var config = this.config;
  var i18nDir = config.i18n_dir;
  var page = locals.page;
  var lang = page.lang || page.language;
  var i18nLanguages = i18n.list();

  if (!lang) {
    var pattern = new Pattern(i18nDir + '/*path');
    var data = pattern.match(locals.path);

    if (data && data.lang && ~i18nLanguages.indexOf(data.lang)) {
      lang = data.lang;
      page.canonical_path = data.path;
    } else {
      lang = getFirstLanguage(config.language);
    }

    page.lang = lang;
  }

  page.canonical_path = page.canonical_path || locals.path;

  var languages = _([].concat(lang, i18nLanguages)).compact().uniq().value();

  locals.__ = i18n.__(languages);
  locals._p = i18n._p(languages);
}

module.exports = i18nLocalsFilter;

function getFirstLanguage(lang) {
  if (Array.isArray(lang)) {
    return lang[0];
  }

  return lang;
}
