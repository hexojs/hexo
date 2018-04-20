'use strict';

const rMetaGenerator = /<meta\s+name=['|"]?generator['|"]?/i;
const hexoGeneratorTag = '<meta name="generator" content="Hexo %s" />';
let cheerio;

function hexoMetaGeneratorInject(data) {
  if (!rMetaGenerator.test(data)) {
    if (!cheerio) cheerio = require('cheerio');
    const $ = cheerio.load(data, {decodeEntities: false});

    $('head').prepend(hexoGeneratorTag.replace('%s', this.version));

    return $.html();
  }
}

module.exports = hexoMetaGeneratorInject;
