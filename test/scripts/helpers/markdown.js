'use strict';

describe('markdown', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    render: require('../../../dist/plugins/helper/render')(hexo)
  };

  const markdown = require('../../../dist/plugins/helper/markdown').bind(ctx);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});
