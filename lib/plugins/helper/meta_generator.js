'use strict';

function metaGeneratorHelper() {
  return `<meta name="generator" content="Hexo ${this.version}">`;
}

module.exports = metaGeneratorHelper;
