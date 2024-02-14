'use strict';

const Promise = require('bluebird');

describe('page', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const Page = hexo.model('Page');
  const generator = Promise.method(require('../../../dist/plugins/generator/page').bind(hexo));

  const locals = () => {
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
    const data = await generator(locals());
    data[0].layout.should.eql(['photo', 'page', 'post', 'index']);

    page.remove();
  });

  [false, 'false', 'off'].forEach(layout => {
    it('layout = ' + JSON.stringify(layout), async () => {
      const page = await Page.insert({
        source: 'foo',
        path: 'bar',
        layout
      });
      const data = await generator(locals());
      should.not.exist(data[0].layout);

      page.remove();
    });
  });
});
