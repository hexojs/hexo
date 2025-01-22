import BluebirdPromise from 'bluebird';
import Hexo from '../../../lib/hexo';
import pageGenerator from '../../../lib/plugins/generator/page';
import chai from 'chai';
import { BaseGeneratorReturn } from '../../../lib/types';
const should = chai.should();
type PageGeneratorParams = Parameters<typeof pageGenerator>;
type PageGeneratorReturn = ReturnType<typeof pageGenerator>;

describe('page', () => {
  const hexo = new Hexo(__dirname, {silent: true});
  const Page = hexo.model('Page');
  const generator: (...args: PageGeneratorParams) => BluebirdPromise<PageGeneratorReturn> = BluebirdPromise.method(pageGenerator.bind(hexo));

  const locals = (): any => {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  };

  it('default layout', async () => {
    const page = await Page.insert({
      source: 'foo',
      path: 'bar'
    });
    const data = await generator(locals());
    page.__page = true;

    data.should.eql([
      {
        path: page.path,
        layout: ['page', 'post', 'index'],
        data: page
      }
    ]);

    page.remove();
  });

  it('custom layout', async () => {
    const page = await Page.insert({
      source: 'foo',
      path: 'bar',
      layout: 'photo'
    });
    const data = await generator(locals()) as BaseGeneratorReturn[];
    data[0].layout!.should.eql(['photo', 'page', 'post', 'index']);

    page.remove();
  });

  [false, 'false', 'off'].forEach(layout => {
    it('layout = ' + JSON.stringify(layout), async () => {
      const page = await Page.insert({
        source: 'foo',
        path: 'bar',
        layout
      });
      const data = await generator(locals()) as BaseGeneratorReturn[];
      should.not.exist(data[0].layout);

      page.remove();
    });
  });
});
