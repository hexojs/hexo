import { join } from 'path';
import { mkdirs, rmdir, writeFile } from 'hexo-fs';
import moment from 'moment';
import { fake, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();

describe('View', () => {
  const hexo = new Hexo(join(__dirname, 'theme_test'));
  const themeDir = join(hexo.base_dir, 'themes', 'test');
  const { compile } = Object.assign({}, hexo.extend.renderer.store.njk);

  hexo.env.init = true;

  function newView(path, data) {
    return new hexo.theme.View(path, data);
  }

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    await hexo.init();
    // Setup layout
    hexo.theme.setView('layout.njk', [
      'pre',
      '{{ body }}',
      'post'
    ].join('\n'));
  });

  beforeEach(() => {
    // Restore compile function
    hexo.extend.renderer.store.njk.compile = compile;
  });

  after(() => rmdir(hexo.base_dir));

  it('constructor', () => {
    const data = {
      _content: ''
    };
    const view = newView('index.njk', data);

    view.path.should.eql('index.njk');
    view.source.should.eql(join(themeDir, 'layout', 'index.njk'));
    view.data.should.eql(data);
  });

  it('parse front-matter', () => {
    const body = [
      'layout: false',
      '---',
      'content'
    ].join('\n');

    const view = newView('index.njk', body);

    view.data.should.eql({
      layout: false,
      _content: 'content'
    });
  });

  it('precompile view if possible', async () => {
    const body = 'Hello {{ name }}';
    const view = newView('index.njk', body);

    view._compiledSync({
      name: 'Hexo'
    }).should.eql('Hello Hexo');

    const result = await view._compiled({
      name: 'Hexo'
    });
    result.should.eql('Hello Hexo');
  });

  it('generate precompiled function even if renderer does not provide compile function', async () => {
    // Remove compile function
    delete hexo.extend.renderer.store.njk.compile;

    const body = 'Hello {{ name }}';
    const view = newView('index.njk', body);

    view._compiledSync({
      name: 'Hexo'
    }).should.eql('Hello Hexo');

    const result = await view._compiled({
      name: 'Hexo'
    });
    result.should.eql('Hello Hexo');
  });

  it('render()', async () => {
    const body = [
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    const content = await view.render({
      test: 'foo'
    });
    content.should.eql('foo');
  });

  it('render() - front-matter', async () => {
    // The priority of front-matter is higher
    const body = [
      'foo: bar',
      '---',
      '{{ foo }}',
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    const content = await view.render({
      foo: 'foo',
      test: 'test'
    });
    content.should.eql('bar\ntest');
  });

  it('render() - helper', async () => {
    const body = [
      '{{ date() }}'
    ].join('\n');

    const view = newView('index.njk', body);

    const content = await view.render({
      config: hexo.config,
      page: {}
    });
    content.should.eql(moment().format(hexo.config.date_format));
  });

  it('render() - layout', async () => {
    const body = 'content';
    const view = newView('index.njk', body);

    const content = await view.render({
      layout: 'layout'
    });
    content.should.eql('pre\n' + body + '\npost');
  });

  it('render() - layout not found', async () => {
    const body = 'content';
    const view = newView('index.njk', body);

    const content = await view.render({
      layout: 'wtf'
    });
    content.should.eql(body);
  });

  it('render() - callback', callback => {
    const body = [
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    view.render({
      test: 'foo'
    }, (err, content) => {
      should.not.exist(err);
      content.should.eql('foo');
      callback();
    });
  });

  it('render() - callback (without options)', callback => {
    const body = [
      'test: foo',
      '---',
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    view.render((err, content) => {
      should.not.exist(err);
      content.should.eql('foo');
      callback();
    });
  });

  it.skip('render() - execute after_render:html', async () => {
    const body = [
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    const filter = fake.returns('bar');

    hexo.extend.filter.register('after_render:html', filter);

    const content = await view.render({
      test: 'foo'
    });
    content.should.eql('bar');

    hexo.extend.filter.unregister('after_render:html', filter);
    sinonAssert.alwaysCalledWith(filter, 'foo');
  });

  it('renderSync()', () => {
    const body = [
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);
    view.renderSync({test: 'foo'}).should.eql('foo');
  });

  it('renderSync() - front-matter', () => {
    // The priority of front-matter is higher
    const body = [
      'foo: bar',
      '---',
      '{{ foo }}',
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    view.renderSync({
      foo: 'foo',
      test: 'test'
    }).should.eql('bar\ntest');
  });

  it('renderSync() - helper', () => {
    const body = [
      '{{ date() }}'
    ].join('\n');

    const view = newView('index.njk', body);

    view.renderSync({
      config: hexo.config,
      page: {}
    }).should.eql(moment().format(hexo.config.date_format));
  });

  it('renderSync() - layout', () => {
    const body = 'content';
    const view = newView('index.njk', body);

    view.renderSync({
      layout: 'layout'
    }).should.eql('pre\n' + body + '\npost');
  });

  it('renderSync() - layout not found', () => {
    const body = 'content';
    const view = newView('index.njk', body);

    view.renderSync({
      layout: 'wtf'
    }).should.eql(body);
  });

  it.skip('renderSync() - execute after_render:html', () => {
    const body = [
      '{{ test }}'
    ].join('\n');

    const view = newView('index.njk', body);

    const filter = fake.returns('bar');

    hexo.extend.filter.register('after_render:html', filter);
    view.renderSync({test: 'foo'}).should.eql('bar');
    hexo.extend.filter.unregister('after_render:html', filter);
    sinonAssert.alwaysCalledWith(filter, 'foo');
  });

  it('_resolveLayout()', () => {
    const view = newView('partials/header.njk', 'header');

    // Relative path
    view._resolveLayout('../layout').should.have.property('path', 'layout.njk');

    // Absolute path
    view._resolveLayout('layout').should.have.property('path', 'layout.njk');

    // Can't be itself
    should.not.exist(view._resolveLayout('header'));
  });
});
