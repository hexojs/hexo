var util = require('util'),
  inflection = require('inflection');

exports.inherits = util.inherits;

exports.escape = require('./escape');
exports.format = require('./format');
exports.fs = require('./fs');
exports.highlight = require('./highlight');
exports.htmlTag = exports.html_tag = require('./html_tag');
exports.permalink = require('./permalink');
exports.server = require('./server');
exports.yfm = require('hexo-front-matter');
exports.inflector = inflection;
exports.titlecase = inflection.titleize;
exports.Router = require('./router');
exports.i18n = require('./i18n');