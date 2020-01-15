'use strict';

const { Cache } = require('hexo-util');
const cache = new Cache();
let metaGeneratorTag = '';

function hexoMetaGeneratorInject(data) {
  const { config } = this;

  const needInject = cache.apply('need-inject', () => {
    if (!config.meta_generator
        || this.extend.helper.getProp('meta_generator')
        || data.match(/<meta([\s]+|[\s]+[^<>]+[\s]+)name=['|"]?generator['|"]?/i)) return false;

    return true;
  });

  if (!needInject) return;
  metaGeneratorTag = metaGeneratorTag || `<meta name="generator" content="Hexo ${this.version}">`;

  return data.replace(/<head>(?!<\/head>).+?<\/head>/s, str => str.replace('</head>', metaGeneratorTag + '</head>'));
}

module.exports = hexoMetaGeneratorInject;
