// @ts-ignore
import Promise from 'bluebird';
import { stub, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import listPost from '../../../lib/plugins/console/list/post';
type OriginalParams = Parameters<typeof listPost>;
type OriginalReturn = ReturnType<typeof listPost>;

describe('Console list', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listPosts: (...args: OriginalParams) => OriginalReturn = listPost.bind(hexo);

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no post', () => {
    listPosts();
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'Category');
    sinonAssert.calledWithMatch(logStub, 'Tags');
    sinonAssert.calledWithMatch(logStub, 'No posts.');
  });

  it('post', async () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];

    const tags = [
      ['foo'],
      ['baz'],
      ['baz']
    ];

    await hexo.init();
    const output = await Post.insert(posts);
    await Promise.each(tags, (tags, i) => output[i].setTags(tags));
    await hexo.locals.invalidate();

    listPosts();
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'Category');
    sinonAssert.calledWithMatch(logStub, 'Tags');
    for (let i = 0; i < posts.length; i++) {
      sinonAssert.calledWithMatch(logStub, posts[i].source);
      sinonAssert.calledWithMatch(logStub, posts[i].slug);
      sinonAssert.calledWithMatch(logStub, posts[i].title);
      sinonAssert.calledWithMatch(logStub, tags[i][0]);
    }
  });
});
