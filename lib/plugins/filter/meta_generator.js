'use strict';

let cheerio;
const hexoGeneratorTag = '<meta name="generator" content="Hexo %s" />';

function hexoMetaGeneratorInject(data) {
  if (!cheerio) cheerio = require('cheerio');
  const $ = cheerio.load(data, {decodeEntities: false});

  if (!($('meta[name="generator"]').length > 0) && $('head').contents().length > 0) {
    $('head').prepend(hexoGeneratorTag.replace('%s', this.version));

    return $.html();
  }
}

module.exports = hexoMetaGeneratorInject;
