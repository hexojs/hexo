import { writeFile, rmdir } from 'hexo-fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { spy, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();

describe('Render', () => {
  const hexo = new Hexo(join(__dirname, 'render_test'));

  hexo.config.meta_generator = false;

  const body = [
    'name:',
    '  first: John',
    '  last: Doe',
    '',
    'age: 23',
    '',
    'list:',
    '- Apple',
    '- Banana'
  ].join('\n');

  const obj = yaml.load(body);
  const path = join(hexo.base_dir, 'test.yml');

  before(async () => {
    await writeFile(path, body);
    await hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('isRenderable()', () => {
    hexo.render.isRenderable('test.txt').should.be.false;

    // html
    hexo.render.isRenderable('test.htm').should.be.true;
    hexo.render.isRenderable('test.html').should.be.true;

    // swig
    hexo.render.isRenderable('test.swig').should.be.false;
    hexo.render.isRenderable('test.njk').should.be.true;

    // yaml
    hexo.render.isRenderable('test.yml').should.be.true;
    hexo.render.isRenderable('test.yaml').should.be.true;
  });

  it('isRenderableSync()', () => {
    hexo.render.isRenderableSync('test.txt').should.be.false;

    // html
    hexo.render.isRenderableSync('test.htm').should.be.true;
    hexo.render.isRenderableSync('test.html').should.be.true;

    // swig
    hexo.render.isRenderableSync('test.swig').should.be.false;
    hexo.render.isRenderableSync('test.njk').should.be.true;

    // yaml
    hexo.render.isRenderableSync('test.yml').should.be.true;
    hexo.render.isRenderableSync('test.yaml').should.be.true;
  });

  it('getOutput()', () => {
    hexo.render.getOutput('test.txt').should.not.ok;

    // html
    hexo.render.getOutput('test.htm').should.eql('html');
    hexo.render.getOutput('test.html').should.eql('html');

    // swig
    hexo.render.getOutput('test.njk').should.eql('html');

    // yaml
    hexo.render.getOutput('test.yml').should.eql('json');
    hexo.render.getOutput('test.yaml').should.eql('json');
  });

  it('render() - path', async () => {
    const result = await hexo.render.render({path});
    result.should.eql(obj);
  });

  it('render() - text (without engine)', async () => {
    const result = await hexo.render.render({text: body});
    result.should.eql(body);
  });

  it('render() - text (with engine)', async () => {
    const result = await hexo.render.render({text: body, engine: 'yaml'});
    result.should.eql(obj);
  });

  it('render() - no path and text', async () => {
    try {
      // @ts-ignore
      await hexo.render.render();
      should.fail('Return value must be rejected');
    } catch (err) {
      err.message.should.eql('No input file or string!');
    }
  });

  it('render() - null path and text', async () => {
    try {
      // @ts-ignore
      await hexo.render.render({text: null, engine: null});
      should.fail('Return value must be rejected');
    } catch (err) {
      err.message.should.eql('No input file or string!');
    }
  });

  it('render() - options', async () => {
    const result = await hexo.render.render({
      text: [
        '<title>{{ title }}</title>',
        '<body>{{ content }}</body>'
      ].join('\n'),
      engine: 'njk'
    }, {
      title: 'Hello world',
      content: 'foobar'
    });
    result.should.eql([
      '<title>Hello world</title>',
      '<body>foobar</body>'
    ].join('\n'));
  });

  it('render() - toString', async () => {
    const content = await hexo.render.render({
      text: body,
      engine: 'yaml',
      toString: true
    });
    content.should.eql(JSON.stringify(obj));
  });

  it('render() - custom toString method', async () => {
    const content = await hexo.render.render({
      text: body,
      engine: 'yaml',
      toString(data) {
        return JSON.stringify(data, null, '  ');
      }
    });
    content.should.eql(JSON.stringify(obj, null, '  '));
  });

  it.skip('render() - after_render filter', async () => {
    const data = {
      text: '  <strong>123456</strong>  ',
      engine: 'njk'
    };

    const filter = spy((result, obj) => {
      result.should.eql(data.text);
      obj.should.eql(data);
      return result.trim();
    });

    hexo.extend.filter.register('after_render:html', filter);

    const result = await hexo.render.render(data);
    filter.calledOnce.should.be.true;
    result.should.eql(data.text.trim());

    hexo.extend.filter.unregister('after_render:html', filter);
  });

  it('render() - after_render filter: use the given output extension if not found', async () => {
    const data = {
      text: 'foo',
      engine: 'txt'
    };

    const filter = spy();
    hexo.extend.filter.register('after_render:txt', filter);

    await hexo.render.render(data);
    filter.calledOnce.should.be.true;
    hexo.extend.filter.unregister('after_render:txt', filter);
  });

  it('render() - onRenderEnd method', async () => {
    const onRenderEnd = spy(result => result + 'bar');

    const data = {
      text: 'foo',
      engine: 'txt',
      onRenderEnd
    };

    const filter = spy();

    hexo.extend.filter.register('after_render:txt', filter);

    await hexo.render.render(data);
    onRenderEnd.calledOnce.should.be.true;
    filter.calledOnce.should.be.true;
    sinonAssert.calledWith(filter, 'foobar');

    hexo.extend.filter.unregister('after_render:txt', filter);
  });

  it('render() - options as callback', async () => {
    const cbSpy = spy();

    const data = {
      text: '  <strong>123456</strong>  ',
      engine: 'njk'
    };

    await hexo.render.render(data, cbSpy);
    cbSpy.calledOnce.should.be.true;
  });

  it('renderSync() - path', () => {
    const result = hexo.render.renderSync({path});
    result.should.eql(obj);
  });

  it('renderSync() - text (without engine)', () => {
    const result = hexo.render.renderSync({text: body});
    result.should.eql(body);
  });

  it('renderSync() - text (with engine)', () => {
    const result = hexo.render.renderSync({text: body, engine: 'yaml'});
    result.should.eql(obj);
  });

  it('renderSync() - no path and text', () => {
    // @ts-ignore
    should.throw(() => hexo.render.renderSync(), 'No input file or string!');
  });

  it('renderSync() - null path and text', () => {
    // @ts-ignore
    should.throw(() => hexo.render.renderSync({text: null, engine: null}), 'No input file or string!');
  });

  it('renderSync() - options', () => {
    const result = hexo.render.renderSync({
      text: [
        '<title>{{ title }}</title>',
        '<body>{{ content }}</body>'
      ].join('\n'),
      engine: 'njk'
    }, {
      title: 'Hello world',
      content: 'foobar'
    });

    result.should.eql([
      '<title>Hello world</title>',
      '<body>foobar</body>'
    ].join('\n'));
  });

  it('renderSync() - toString', () => {
    const result = hexo.render.renderSync({
      text: body,
      engine: 'yaml',
      toString: true
    });

    result.should.eql(JSON.stringify(obj));
  });

  it('renderSync() - custom toString method', () => {
    const result = hexo.render.renderSync({
      text: body,
      engine: 'yaml',
      toString(data) {
        return JSON.stringify(data, null, '  ');
      }
    });

    result.should.eql(JSON.stringify(obj, null, '  '));
  });

  it.skip('renderSync() - after_render filter', () => {
    const data = {
      text: '  <strong>123456</strong>  ',
      engine: 'njk'
    };

    const filter = spy(result => result.trim());

    hexo.extend.filter.register('after_render:html', filter);

    const result = hexo.render.renderSync(data);

    filter.calledOnce.should.be.true;
    // @ts-ignore
    sinonAssert.calledWith(filter, data.text, data);
    result.should.eql(data.text.trim());

    hexo.extend.filter.unregister('after_render:html', filter);
  });

  it('renderSync() - after_render filter: use the given output extension if not found', () => {
    const data = {
      text: 'foo',
      engine: 'txt'
    };

    const filter = spy();
    hexo.extend.filter.register('after_render:txt', filter);

    hexo.render.renderSync(data);
    filter.calledOnce.should.be.true;
    hexo.extend.filter.unregister('after_render:txt', filter);
  });

  it('renderSync() - onRenderEnd', () => {
    const onRenderEnd = spy(result => result + 'bar');

    const data = {
      text: 'foo',
      engine: 'txt',
      onRenderEnd
    };

    const filter = spy(result => {
      result.should.eql('foobar');
    });

    hexo.extend.filter.register('after_render:txt', filter);

    hexo.render.renderSync(data);
    onRenderEnd.calledOnce.should.be.true;
    filter.calledOnce.should.be.true;

    hexo.extend.filter.unregister('after_render:txt', filter);
  });
});
