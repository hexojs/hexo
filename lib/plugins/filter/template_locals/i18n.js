'use strict';

const util = require('hexo-util');
const Pattern = util.Pattern;
const _ = require('lodash');

function i18nLocalsFilter(locals) {
  const i18n = this.theme.i18n;
  const config = this.config;
  const i18nDir = config.i18n_dir;
  const page = locals.page;
  let lang = page.lang || page.language;
  const i18nLanguages = i18n.list();

  if (!lang) {
    const pattern = new Pattern(`${i18nDir}/*path`);
    const data = pattern.match(locals.path);

    if (data && data.lang && ~i18nLanguages.indexOf(data.lang)) {
      lang = data.lang;
      page.canonical_path = data.path;
    } else {
      lang = getFirstLanguage(config.language);
    }

    page.lang = lang;
  }

  page.canonical_path = page.canonical_path || locals.path;

  const languages = _([].concat(lang, i18nLanguages)).compact().uniq().value();

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
