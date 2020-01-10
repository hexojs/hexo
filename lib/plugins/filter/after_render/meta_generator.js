'use strict';

function hexoMetaGeneratorInject(data) {
  const { config, version } = this;

  if (!config.meta_generator
    || this.extend.helper.getProp('meta_generator')
    || data.match(/<meta([\s]+|[\s]+[^<>]+[\s]+)name=['|"]?generator['|"]?/i)) return;

  return data.replace(/<head>(?!<\/head>).+?<\/head>/s, str => str.replace('</head>', `<meta name="generator" content="Hexo ${version}"></head>`));
}

module.exports = hexoMetaGeneratorInject;
