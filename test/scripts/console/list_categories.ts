// @ts-ignore
import Promise from 'bluebird';
import { stub, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import listCategory from '../../../lib/plugins/console/list/category';
type OriginalParams = Parameters<typeof listCategory>;
type OriginalReturn = ReturnType<typeof listCategory>;

describe('Console list', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listCategories: (...args: OriginalParams) => OriginalReturn = listCategory.bind(hexo);

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no categories', () => {
    listCategories();
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'No categories.');
  });

  it('categories', async () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];

    await hexo.init();
    const output = await Post.insert(posts);
    await Promise.each([
      ['foo'],
      ['baz'],
      ['baz']
    ], (tags, i) => output[i].setCategories(tags));
    await hexo.locals.invalidate();
    listCategories();
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'baz');
    sinonAssert.calledWithMatch(logStub, 'foo');
  });
});
