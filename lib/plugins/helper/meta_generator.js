'use strict';

function metaGeneratorHelper() {
  return '<meta name="generator" content="Hexo %s">'.replace('%s', this.version);
}

module.exports = metaGeneratorHelper;
