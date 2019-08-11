'use strict';

function hexoMetaGeneratorInject(data) {
  const { config } = this;
  if (!config.meta_generator ||
  data.includes('<meta name="generator" content="Hexo')) return;

  const hexoGeneratorTag = '<meta name="generator" content="Hexo %s">'
    .replace('%s', this.version);

  return data.replace(/<\/head>/, hexoGeneratorTag.concat('</head>'));
}

module.exports = hexoMetaGeneratorInject;
