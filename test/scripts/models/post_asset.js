var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');

describe('PostAsset', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var PostAsset = hexo.model('PostAsset');
  var Post = hexo.model('Post');
  var post;

  before(() => hexo.init().then(() => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  })).then(post_ => {
    post = post_;
  }));

  it('default values', () => PostAsset.insert({
    _id: 'foo',
    slug: 'foo',
    post: post._id
  }).then(data => {
    data.modified.should.be.true;
    return PostAsset.removeById(data._id);
  }));

  it('_id - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'ID is not defined');
    });

    return PostAsset.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('slug - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`slug` is required!');
    });

    return PostAsset.insert({
      _id: 'foo'
    }).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - virtual', () => PostAsset.insert({
    _id: 'source/_posts/test/foo.jpg',
    slug: 'foo.jpg',
    post: post._id
  }).then(data => {
    data.path.should.eql(pathFn.join(post.path, data.slug));
    return PostAsset.removeById(data._id);
  }));

  it('path - virtual - when permalink is .html', () => {
    hexo.config.permalink = ':year/:month/:day/:title.html';
    return PostAsset.insert({
      _id: 'source/_posts/test/foo.html',
      slug: 'foo.htm',
      post: post._id
    }).then(data => {
      data.path.should.eql(pathFn.join(post.path, data.slug));
      return PostAsset.removeById(data._id);
    }).finally(() => {
      hexo.config.permalink = ':year/:month/:day/:title';
    });
  });

  it('path - virtual - when permalink is .htm', () => {
    hexo.config.permalink = ':year/:month/:day/:title.htm';
    return PostAsset.insert({
      _id: 'source/_posts/test/foo.htm',
      slug: 'foo.htm',
      post: post._id
    }).then(data => {
      data.path.should.eql(pathFn.join(post.path, data.slug));
      return PostAsset.removeById(data._id);
    }).finally(() => {
      hexo.config.permalink = ':year/:month/:day/:title';
    });
  });

  it('path - virtual - when permalink contains .htm not in the end', () => {
    hexo.config.permalink = ':year/:month/:day/:title/.htm-foo/';
    return PostAsset.insert({
      _id: 'source/_posts/test/foo.html',
      slug: 'foo.html',
      post: post._id
    }).then(data => {
      data.path.should.eql(pathFn.join(post.path + '.htm-foo/', data.slug));
      return PostAsset.removeById(data._id);
    }).finally(() => {
      hexo.config.permalink = ':year/:month/:day/:title';
    });
  });

  it('source - virtual', () => PostAsset.insert({
    _id: 'source/_posts/test/foo.jpg',
    slug: 'foo.jpg',
    post: post._id
  }).then(data => {
    data.source.should.eql(pathFn.join(hexo.base_dir, data._id));
    return PostAsset.removeById(data._id);
  }));
});
