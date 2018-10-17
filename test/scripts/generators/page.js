'use strict';

const Promise = require('bluebird');

describe('page', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const Page = hexo.model('Page');
  const generator = Promise.method(require('../../../lib/plugins/generator/page').bind(hexo));

  function locals() {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  }

  it('default layout', () => Page.insert({
    source: 'foo',
    path: 'bar'
  }).then(page => generator(locals()).then(data => {
    page.__page = true;

    data.should.eql([
      {
        path: page.path,
        layout: ['page', 'post', 'index'],
        data: page
      }
    ]);

    return page.remove();
  })));

  it('custom layout', () => Page.insert({
    source: 'foo',
    path: 'bar',
    layout: 'photo'
  }).then(page => generator(locals()).then(data => {
    data[0].layout.should.eql(['photo', 'page', 'post', 'index']);

    return page.remove();
  })));

  [false, 'false', 'off'].forEach(layout => {
    it('layout = ' + JSON.stringify(layout), () => Page.insert({
      source: 'foo',
      path: 'bar',
      layout
    }).then(page => generator(locals()).then(data => {
      should.not.exist(data[0].layout);
    }).finally(() => page.remove())));
  });
});
