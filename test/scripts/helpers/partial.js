var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('partial', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'partial_test'), {silent: true});
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  var viewDir = pathFn.join(themeDir, 'layout') + pathFn.sep;

  var ctx = {
    site: hexo.locals,
    config: hexo.config,
    view_dir: viewDir,
    filename: pathFn.join(viewDir, 'post', 'article.swig'),
    foo: 'foo',
    cache: true
  };

  ctx.fragment_cache = require('../../../lib/plugins/helper/fragment_cache')(hexo);

  hexo.env.init = true;

  var partial = require('../../../lib/plugins/helper/partial')(hexo).bind(ctx);

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
    partial('foo').should.eql('');
  });

  it('locals', () => {
    hexo.theme.setView('test.swig', '{{ foo }}');

    partial('test', {foo: 'bar'}).should.eql('bar');
  });

  it('cache', () => {
    hexo.theme.setView('test.swig', '{{ foo }}');

    partial('test', {foo: 'bar'}, {cache: true}).should.eql('bar');
    partial('test', {}, {cache: true}).should.eql('bar');
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
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'name must be a string!');
    });

    try {
      partial();
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });
});
