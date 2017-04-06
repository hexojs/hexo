var should = require('chai').should(); // eslint-disable-line

describe('markdown', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    render: require('../../../lib/plugins/helper/render')(hexo)
  };

  var markdown = require('../../../lib/plugins/helper/markdown').bind(ctx);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});
