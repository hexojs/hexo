'use strict';

describe('meta_generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const metaGen = require('../../../lib/plugins/helper/meta_generator').bind(hexo);
  const isPost = require('../../../lib/plugins/helper/is').post;
  const Post = hexo.model('Post');

  before(() => {
    return hexo.init();
  });

  it('default', () => {
    Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(post => {
      metaGen.call({
        page: post,
        config: hexo.config,
        is_post: isPost
      }).should.eql('<meta name="generator" content="Hexo %s">'.replace('%s', hexo.version));

      return Post.removeById(post._id);
    });
  });
});
