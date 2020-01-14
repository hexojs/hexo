'use strict';

let hexoGeneratorTag;
function hexoMetaGeneratorInject(data) {
  const { config } = this;
  if (!config.meta_generator) {
    this.extend.filter.unregister('after_route_render', hexoMetaGeneratorInject);
    return;
  }

  hexoGeneratorTag = hexoGeneratorTag || `<meta name="generator" content="Hexo ${this.version}"></head>`;

  return data.replace('</head>', hexoGeneratorTag);
}

module.exports = hexoMetaGeneratorInject;
