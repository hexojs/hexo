var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var Promise = require('bluebird');

describe('Tag', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Tag = hexo.model('Tag');
  var Post = hexo.model('Post');
  var PostTag = hexo.model('PostTag');

  before(() => hexo.init());

  it('name - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`name` is required!');
    });

    return Tag.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('slug - virtual', () => Tag.insert({
    name: 'foo'
  }).then(data => {
    data.slug.should.eql('foo');
    return Tag.removeById(data._id);
  }));

  it('slug - tag_map', () => {
    hexo.config.tag_map = {
      test: 'wat'
    };

    return Tag.insert({
      name: 'test'
    }).then(data => {
      data.slug.should.eql('wat');
      hexo.config.tag_map = {};

      return Tag.removeById(data._id);
    });
  });

  it('slug - filename_case: 0', () => Tag.insert({
    name: 'WahAHa'
  }).then(data => {
    data.slug.should.eql('WahAHa');
    return Tag.removeById(data._id);
  }));

  it('slug - filename_case: 1', () => {
    hexo.config.filename_case = 1;

    return Tag.insert({
      name: 'WahAHa'
    }).then(data => {
      data.slug.should.eql('wahaha');
      hexo.config.filename_case = 0;
      return Tag.removeById(data._id);
    });
  });

  it('slug - filename_case: 2', () => {
    hexo.config.filename_case = 2;

    return Tag.insert({
      name: 'WahAHa'
    }).then(data => {
      data.slug.should.eql('WAHAHA');
      hexo.config.filename_case = 0;
      return Tag.removeById(data._id);
    });
  });

  it('path - virtual', () => Tag.insert({
    name: 'foo'
  }).then(data => {
    data.path.should.eql(hexo.config.tag_dir + '/' + data.slug + '/');
    return Tag.removeById(data._id);
  }));

  it('permalink - virtual', () => Tag.insert({
    name: 'foo'
  }).then(data => {
    data.permalink.should.eql(hexo.config.url + '/' + data.path);
    return Tag.removeById(data._id);
  }));

  it('posts - virtual', () => Post.insert([
    {source: 'foo.md', slug: 'foo'},
    {source: 'bar.md', slug: 'bar'},
    {source: 'baz.md', slug: 'baz'}
  ]).each(post => post.setTags(['foo'])).then(posts => {
    var tag = Tag.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    hexo.locals.invalidate();
    tag.posts.map(mapper).should.eql(posts.map(mapper));
    tag.length.should.eql(posts.length);

    return tag.remove().thenReturn(posts);
  }).map(post => post.remove()));

  it('posts - draft', () => Post.insert([
    {source: 'foo.md', slug: 'foo', published: true},
    {source: 'bar.md', slug: 'bar', published: false},
    {source: 'baz.md', slug: 'baz', published: true}
  ]).each(post => post.setTags(['foo'])).then(posts => {
    var tag = Tag.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // draft off
    hexo.locals.invalidate();
    tag.posts.eq(0)._id.should.eql(posts[0]._id);
    tag.posts.eq(1)._id.should.eql(posts[2]._id);
    tag.length.should.eql(2);

    // draft on
    hexo.config.render_drafts = true;
    tag = Tag.findOne({name: 'foo'});
    hexo.locals.invalidate();
    tag.posts.map(mapper).should.eql(posts.map(mapper));
    tag.length.should.eql(posts.length);
    hexo.config.render_drafts = false;

    return tag.remove().thenReturn(posts);
  }).map(post => post.remove()));

  it('posts - future', () => {
    var now = Date.now();

    return Post.insert([
      {source: 'foo.md', slug: 'foo', date: now - 3600},
      {source: 'bar.md', slug: 'bar', date: now + 3600},
      {source: 'baz.md', slug: 'baz', date: now}
    ]).each(post => post.setTags(['foo'])).then(posts => {
      var tag = Tag.findOne({name: 'foo'});

      function mapper(post) {
        return post._id;
      }

      // future on
      hexo.config.future = true;
      hexo.locals.invalidate();
      tag.posts.map(mapper).should.eql(posts.map(mapper));
      tag.length.should.eql(posts.length);

      // future off
      hexo.config.future = false;
      hexo.locals.invalidate();
      tag = Tag.findOne({name: 'foo'});
      tag.posts.eq(0)._id.should.eql(posts[0]._id);
      tag.posts.eq(1)._id.should.eql(posts[2]._id);
      tag.length.should.eql(2);

      return tag.remove().thenReturn(posts);
    }).map(post => post.remove());
  });

  it('check whether a tag exists', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'Tag `foo` has already existed!');
    });

    return Tag.insert({
      name: 'foo'
    }).then(data => {
      Tag.insert({
        name: 'foo'
      }).catch(errorCallback);

      return Tag.removeById(data._id);
    }).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('remove PostTag references when a tag is removed', () => {
    var tag;

    return Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]).then(posts => // One item a time
      Promise.map(posts, post => post.setTags(['foo']).thenReturn(post), {concurrency: 1})).then(posts => {
      tag = Tag.findOne({name: 'foo'});
      return Tag.removeById(tag._id).thenReturn(posts);
    }).then(posts => {
      PostTag.find({tag_id: tag._id}).length.should.eql(0);
      return posts;
    }).map(post => Post.removeById(post._id));
  });
});
