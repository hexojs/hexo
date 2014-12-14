var should = require('chai').should();

describe('PostAsset', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var PostAsset = hexo.model('PostAsset');
  var Post = hexo.model('Post');
  var post;

  before(function(){
    return hexo.init().then(function(){
      return Post.insert({
        source: 'foo.md',
        slug: 'bar'
      });
    }).then(function(post_){
      post = post_;
    });
  });

  it('default values', function(){
    return PostAsset.insert({
      _id: 'foo',
      post: post._id
    }).then(function(data){
      data.modified.should.be.true;
      return PostAsset.removeById(data._id);
    });
  });

  it('_id - required', function(){
    return PostAsset.insert({}).catch(function(err){
      err.should.have.property('message', 'ID is not defined');
    });
  });

  it.skip('post - required');
});