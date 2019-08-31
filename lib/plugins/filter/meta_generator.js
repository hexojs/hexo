'use strict';

function hexoMetaGeneratorInject(data) {
  const { config } = this;
  if (!config.meta_generator ||
  data.match(/<meta\s+name=['|"]?generator['|"]?/i)) return;

  const hexoGeneratorTag = `<meta name="generator" content="Hexo ${this.version}">`;

  return data.replace('</title>', '</title>' + hexoGeneratorTag);
}

module.exports = hexoMetaGeneratorInject;
