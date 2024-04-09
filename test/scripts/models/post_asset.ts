import { join, posix } from 'path';
import Hexo from '../../../lib/hexo';
import defaults from '../../../lib/hexo/default_config';

describe('PostAsset', () => {
  const hexo = new Hexo();
  const PostAsset = hexo.model('PostAsset');
  const Post = hexo.model('Post');
  let post;

  before(async () => {
    await hexo.init();
    post = await Post.insert({
      source: 'foo.md',
      slug: 'bar'
    });
  });

  beforeEach(() => {
    hexo.config = Object.assign({}, defaults);
  });

  it('default values', async () => {
    const data = await PostAsset.insert({
      _id: 'foo',
      slug: 'foo',
      post: post._id
    });
    data.modified.should.be.true;
    PostAsset.removeById(data._id);
  });

  it('_id - required', async () => {
    try {
      await PostAsset.insert({});
    } catch (err) {
      err.message.should.eql('ID is not defined');
    }
  });

  it('slug - required', async () => {
    try {
      await PostAsset.insert({
        _id: 'foo'
      });
    } catch (err) {
      err.message.should.eql('`slug` is required!');
    }
  });

  it('path - virtual', async () => {
    const data = await PostAsset.insert({
      _id: 'source/_posts/test/foo.jpg',
      slug: 'foo.jpg',
      post: post._id
    });
    data.path.should.eql(posix.join(post.path, data.slug));

    PostAsset.removeById(data._id);
  });

  it('path - virtual - when permalink is .html', async () => {
    hexo.config.permalink = ':year/:month/:day/:title.html';
    const data = await PostAsset.insert({
      _id: 'source/_posts/test/foo.html',
      slug: 'foo.htm',
      post: post._id
    });
    data.path.should.eql(posix.join(post.path, data.slug));

    PostAsset.removeById(data._id);
  });

  it('path - virtual - when permalink is .htm', async () => {
    hexo.config.permalink = ':year/:month/:day/:title.htm';
    const data = await PostAsset.insert({
      _id: 'source/_posts/test/foo.htm',
      slug: 'foo.htm',
      post: post._id
    });
    data.path.should.eql(posix.join(post.path, data.slug));

    PostAsset.removeById(data._id);
  });

  it('path - virtual - when permalink contains .htm not in the end', async () => {
    hexo.config.permalink = ':year/:month/:day/:title/.htm-foo/';
    const data = await PostAsset.insert({
      _id: 'source/_posts/test/foo.html',
      slug: 'foo.html',
      post: post._id
    });
    data.path.should.eql(posix.join(post.path + '.htm-foo/', data.slug));

    PostAsset.removeById(data._id);
  });

  it('source - virtual', async () => {
    const data = await PostAsset.insert({
      _id: 'source/_posts/test/foo.jpg',
      slug: 'foo.jpg',
      post: post._id
    });
    data.source.should.eql(join(hexo.base_dir, data._id));

    PostAsset.removeById(data._id);
  });
});
