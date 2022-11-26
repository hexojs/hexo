'use strict';

function metaGeneratorHelper() {
  return `<meta name="generator" content="Hexo ${this.env.version}">`;
}

module.exports = metaGeneratorHelper;
