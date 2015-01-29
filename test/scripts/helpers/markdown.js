'use strict';

var should = require('chai').should();

describe('markdown', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    render: require('../../../lib/plugins/helper/render')(hexo)
  };

  var markdown = require('../../../lib/plugins/helper/markdown').bind(ctx);

  before(function(){
    return hexo.init().then(function(){
      return hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
    });
  });

  it('default', function(){
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});