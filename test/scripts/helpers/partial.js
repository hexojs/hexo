'use strict';

const sinon = require('sinon');
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('partial', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'partial_test'), {silent: true});
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  const viewDir = pathFn.join(themeDir, 'layout') + pathFn.sep;
  const viewName = 'article.swig';

  const ctx = {
    site: hexo.locals,
    config: hexo.config,
    view_dir: viewDir,
    filename: pathFn.join(viewDir, 'post', viewName),
    foo: 'foo',
    cache: true
  };

  ctx.fragment_cache = require('../../../lib/plugins/helper/fragment_cache')(hexo);

  hexo.env.init = true;

  const partial = require('../../../lib/plugins/helper/partial')(hexo).bind(ctx);

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()).then(() => {
    hexo.theme.setView('widget/tag.swig', 'tag widget');
  }));

  after(() => fs.rmdir(hexo.base_dir));

  it('default', () => {
    // relative path
    partial('../widget/tag').should.eql('tag widget');

    // absolute path
    partial('widget/tag').should.eql('tag widget');

    // not found
    try {
      partial('foo');
    } catch (err) {
      err.should.have.property(
        'message',
        `Partial foo does not exist. (in ${pathFn.join('post', viewName)})`
      );
    }
  });

  it('locals', () => {
    hexo.theme.setView('test.swig', '{{ foo }}');

    partial('test', {foo: 'bar'}).should.eql('bar');
  });

  it('only', () => {
    hexo.theme.setView('test.swig', '{{ foo }}{{ bar }}');

    partial('test', {bar: 'bar'}, {only: true}).should.eql('bar');
  });

  it('a partial in another partial', () => {
    hexo.theme.setView('partial/a.swig', '{{ partial("b") }}');
    hexo.theme.setView('partial/b.swig', '{{ partial("c") }}');
    hexo.theme.setView('partial/c.swig', 'c');

    partial('partial/a').should.eql('c');
  });

  it('name must be a string', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'name must be a string!');
    });

    try {
      partial();
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('cache - default', () => {
    hexo.theme.setView('test.swig', '{{ foo }}');

    partial('test', {foo: 'bar'}, { cache: true }).should.eql('bar');
    partial('test', {}, { cache: true }).should.eql('bar');
    partial('test', {foo: 'bar'}, { cache: 'test-cache-id' }).should.eql('bar');
    partial('test', {}, { cache: 'test-cache-id' }).should.eql('bar');
  });

  it('cache - enhance cache', () => {
    hexo.config.enhance_cache = true;
    hexo.theme.setView('test.swig', '{{ foo }}');

    // enhance cache should only cache partial when the locals unchanged
    partial('test', {foo: 'bar'}).should.eql('bar');
    partial('test', {foo: 'baz'}).should.eql('baz');
    // when {cache: true} is set, enhance cache should cache the partial even the locals changed
    partial('test', {foo: 'bar'}, { cache: true }).should.eql('bar');
    partial('test', {foo: 'baz'}, { cache: true }).should.eql('bar');
    partial('test', {foo: 'bar'}, { cache: 'test-cache-id' }).should.eql('bar');
    partial('test', {foo: 'baz'}, { cache: 'test-cache-id' }).should.eql('bar');
  });
});
