// @ts-ignore
import Promise from 'bluebird';
import Hexo from '../../../lib/hexo';
import postGenerator from '../../../lib/plugins/generator/post';
import { NormalPostGenerator } from '../../../lib/types';
import chai from 'chai';
const should = chai.should();
type PostGeneratorParams = Parameters<typeof postGenerator>;
type PostGeneratorReturn = ReturnType<typeof postGenerator>;

describe('post', () => {
  const hexo = new Hexo(__dirname, {silent: true});
  const Post = hexo.model('Post');
  const generator: (...args: PostGeneratorParams) => Promise<PostGeneratorReturn> = Promise.method(postGenerator.bind(hexo));

  hexo.config.permalink = ':title/';

  const locals = (): any => {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  };

  before(() => hexo.init());

  it('default layout', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar'
    });
    const data = await generator(locals());
    post.__post = true;

    data.should.eql([
      {
        path: 'bar/',
        layout: ['post', 'page', 'index'],
        data: post
      }
    ]);

    post.remove();
  });

  it('custom layout', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: 'photo'
    });
    const data = await generator(locals()) as NormalPostGenerator[];
    data[0].layout.should.eql(['photo', 'post', 'page', 'index']);

    post.remove();
  });

  it('layout disabled', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: false
    });
    const data = await generator(locals()) as NormalPostGenerator[];
    should.not.exist(data[0].layout);

    post.remove();
  });

  it('prev/next post', async () => {
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1}
    ]);
    const data = await generator(locals()) as NormalPostGenerator[];
    should.not.exist(data[0].data.prev);
    data[0].data.next!._id!.should.eq(posts[0]._id);
    data[1].data.prev!._id!.should.eq(posts[1]._id);
    data[1].data.next!._id!.should.eq(posts[2]._id);
    data[2].data.prev!._id!.should.eq(posts[0]._id);
    should.not.exist(data[2].data.next);

    await Promise.all(posts.map(post => post.remove()));
  });
});
