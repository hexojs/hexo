'use strict';

const { Cache } = require('hexo-util');
const cache = new Cache();

function hexoMetaGeneratorInject(data) {
  const { config, version } = this;

  const needInject = cache.apply('need-inject', () => {
    if (!config.meta_generator
        || this.extend.helper.getProp('meta_generator')
        || data.match(/<meta([\s]+|[\s]+[^<>]+[\s]+)name=['|"]?generator['|"]?/i)) return false;

    return true;
  });

  if (!needInject) return;

  return data.replace(/<head>(?!<\/head>).+?<\/head>/s, str => str.replace('</head>', `<meta name="generator" content="Hexo ${version}"></head>`));
}

module.exports = hexoMetaGeneratorInject;
