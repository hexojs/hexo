var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var moment = require('moment');
var sinon = require('sinon');

describe('View', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'theme_test'));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  hexo.env.init = true;

  function newView(path, data) {
    return new hexo.theme.View(path, data);
  }

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()).then(() => {
    // Setup layout
    hexo.theme.setView('layout.swig', [
      'pre',
      '{{ body }}',
      'post'
    ].join('\n'));
  }));

  after(() => fs.rmdir(hexo.base_dir));

  it('constructor', () => {
    var data = {
      _content: ''
    };
    var view = newView('index.swig', data);

    view.path.should.eql('index.swig');
    view.source.should.eql(pathFn.join(themeDir, 'layout', 'index.swig'));
    view.data.should.eql(data);
  });

  it('parse front-matter', () => {
    var body = [
      'layout: false',
      '---',
      'content'
    ].join('\n');

    var view = newView('index.swig', body);

    view.data.should.eql({
      layout: false,
      _content: 'content'
    });
  });

  it('precompile view if possible', () => {
    var body = 'Hello {{ name }}';
    var view = newView('index.swig', body);

    view._compiledSync({
      name: 'Hexo'
    }).should.eql('Hello Hexo');

    return view._compiled({
      name: 'Hexo'
    }).then(result => {
      result.should.eql('Hello Hexo');
    });
  });

  it('generate precompiled function even if renderer does not provide compile function', () => {
    // Remove compile function
    var compile = hexo.extend.renderer.store.swig.compile;
    delete hexo.extend.renderer.store.swig.compile;

    var body = 'Hello {{ name }}';
    var view = newView('index.swig', body);

    view._compiledSync({
      name: 'Hexo'
    }).should.eql('Hello Hexo');

    return view._compiled({
      name: 'Hexo'
    }).then(result => {
      result.should.eql('Hello Hexo');
    }).finally(() => {
      hexo.extend.renderer.store.swig.compile = compile;
    });
  });

  it('render()', () => {
    var body = [
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    return view.render({
      test: 'foo'
    }).then(content => {
      content.should.eql('foo');
    });
  });

  it('render() - front-matter', () => {
    // The priority of front-matter is higher
    var body = [
      'foo: bar',
      '---',
      '{{ foo }}',
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    return view.render({
      foo: 'foo',
      test: 'test'
    }).then(content => {
      content.should.eql('bar\ntest');
    });
  });

  it('render() - helper', () => {
    var body = [
      '{{ date() }}'
    ].join('\n');

    var view = newView('index.swig', body);

    return view.render({
      config: hexo.config,
      page: {}
    }).then(content => {
      content.should.eql(moment().format(hexo.config.date_format));
    });
  });

  it('render() - layout', () => {
    var body = 'content';
    var view = newView('index.swig', body);

    return view.render({
      layout: 'layout'
    }).then(content => {
      content.should.eql('pre\n' + body + '\npost');
    });
  });

  it('render() - layout not found', () => {
    var body = 'content';
    var view = newView('index.swig', body);

    return view.render({
      layout: 'wtf'
    }).then(content => {
      content.should.eql(body);
    });
  });

  it('render() - callback', callback => {
    var body = [
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    view.render({
      test: 'foo'
    }, (err, content) => {
      should.not.exist(err);
      content.should.eql('foo');
      callback();
    });
  });

  it('render() - callback (without options)', callback => {
    var body = [
      'test: foo',
      '---',
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    view.render((err, content) => {
      should.not.exist(err);
      content.should.eql('foo');
      callback();
    });
  });

  it('render() - execute after_render:html', () => {
    var body = [
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    var filter = sinon.spy(result => {
      result.should.eql('foo');
      return 'bar';
    });

    hexo.extend.filter.register('after_render:html', filter);

    return view.render({
      test: 'foo'
    }).then(content => {
      content.should.eql('bar');
    }).finally(() => {
      hexo.extend.filter.unregister('after_render:html', filter);
    });
  });

  it('renderSync()', () => {
    var body = [
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);
    view.renderSync({test: 'foo'}).should.eql('foo');
  });

  it('renderSync() - front-matter', () => {
    // The priority of front-matter is higher
    var body = [
      'foo: bar',
      '---',
      '{{ foo }}',
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    view.renderSync({
      foo: 'foo',
      test: 'test'
    }).should.eql('bar\ntest');
  });

  it('renderSync() - helper', () => {
    var body = [
      '{{ date() }}'
    ].join('\n');

    var view = newView('index.swig', body);

    view.renderSync({
      config: hexo.config,
      page: {}
    }).should.eql(moment().format(hexo.config.date_format));
  });

  it('renderSync() - layout', () => {
    var body = 'content';
    var view = newView('index.swig', body);

    view.renderSync({
      layout: 'layout'
    }).should.eql('pre\n' + body + '\npost');
  });

  it('renderSync() - layout not found', () => {
    var body = 'content';
    var view = newView('index.swig', body);

    view.renderSync({
      layout: 'wtf'
    }).should.eql(body);
  });

  it('renderSync() - execute after_render:html', () => {
    var body = [
      '{{ test }}'
    ].join('\n');

    var view = newView('index.swig', body);

    var filter = sinon.spy(result => {
      result.should.eql('foo');
      return 'bar';
    });

    hexo.extend.filter.register('after_render:html', filter);
    view.renderSync({test: 'foo'}).should.eql('bar');
    hexo.extend.filter.unregister('after_render:html', filter);
  });

  it('_resolveLayout()', () => {
    var view = newView('partials/header.swig', 'header');

    // Relative path
    view._resolveLayout('../layout').should.have.property('path', 'layout.swig');

    // Absolute path
    view._resolveLayout('layout').should.have.property('path', 'layout.swig');

    // Can't be itself
    should.not.exist(view._resolveLayout('header'));
  });
});
