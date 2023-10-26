'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('partial', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'partial_test'), {silent: true});
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  const viewDir = pathFn.join(themeDir, 'layout') + pathFn.sep;
  const viewName = 'article.njk';

  const ctx = {
    site: hexo.locals,
    config: hexo.config,
    view_dir: viewDir,
    filename: pathFn.join(viewDir, 'post', viewName),
    foo: 'foo',
    cache: true
  };

  ctx.fragment_cache = require('../../../dist/plugins/helper/fragment_cache')(hexo);

  hexo.env.init = true;

  const partial = require('../../../dist/plugins/helper/partial')(hexo).bind(ctx);

  before(async () => {
    await Promise.all([
      fs.mkdirs(themeDir),
      fs.writeFile(hexo.config_path, 'theme: test')
    ]);
    await hexo.init();
    hexo.theme.setView('widget/tag.njk', 'tag widget');
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('default', () => {
    // relative path
    partial('../widget/tag').should.eql('tag widget');

    // absolute path
    partial('widget/tag').should.eql('tag widget');

    // not found
    should.throw(
      () => partial('foo'),
      `Partial foo does not exist. (in ${pathFn.join('post', viewName)})`
    );
  });

  it('locals', () => {
    hexo.theme.setView('test.njk', '{{ foo }}');

    partial('test', {foo: 'bar'}).should.eql('bar');
  });

  it('cache', () => {
    hexo.theme.setView('test.njk', '{{ foo }}');

    partial('test', {foo: 'bar'}, {cache: true}).should.eql('bar');
    partial('test', {}, {cache: true}).should.eql('bar');

    partial('test', {foo: 'baz'}, {cache: 'ash'}).should.eql('baz');
    partial('test', {}, {cache: 'ash'}).should.eql('baz');
  });

  it('only', () => {
    hexo.theme.setView('test.njk', '{{ foo }}{{ bar }}');

    partial('test', {bar: 'bar'}, {only: true}).should.eql('bar');
  });

  it('a partial in another partial', () => {
    hexo.theme.setView('partial/a.njk', '{{ partial("b") }}');
    hexo.theme.setView('partial/b.njk', '{{ partial("c") }}');
    hexo.theme.setView('partial/c.njk', 'c');

    partial('partial/a').should.eql('c');
  });

  it('name must be a string', () => {
    should.throw(() => partial(), 'name must be a string!');
  });
});
