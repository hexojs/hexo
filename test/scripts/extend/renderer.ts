import Renderer from '../../../lib/extend/renderer';
import BluebirdPromise from 'bluebird';
import chai from 'chai';
const should = chai.should();

describe('Renderer', () => {

  it('register()', () => {
    const r = new Renderer();

    // name, output, fn
    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.get('yaml').should.exist;
    r.get('yaml').output!.should.eql('json');

    // name, output, fn, sync
    r.register('yaml', 'json', () => {}, true);

    r.get('yaml').should.exist;
    r.get('yaml').output!.should.eql('json');
    r.get('yaml', true).should.exist;
    r.get('yaml', true).output!.should.eql('json');

    // no fn
    // @ts-expect-error
    should.throw(() => r.register('yaml', 'json'), TypeError, 'fn must be a function');

    // no output
    // @ts-expect-error
    should.throw(() => r.register('yaml'), TypeError, 'output is required');

    // no name
    // @ts-expect-error
    should.throw(() => r.register(), TypeError, 'name is required');
  });

  it('register() - promisify', async () => {
    const r = new Renderer();

    // async
    r.register('yaml', 'json', (_data, _options, callback) => {
      callback && callback(null, 'foo');
      return BluebirdPromise.resolve();
    });

    const yaml = await r.get('yaml')({}, {});
    yaml.should.eql('foo');

    // sync
    r.register('swig', 'html', (_data, _options) => 'foo', true);

    const swig = await r.get('swig')({}, {});
    swig.should.eql('foo');
  });

  it('register() - compile', () => {
    const r = new Renderer();

    function renderer(_data, _locals) {
      return BluebirdPromise.resolve();
    }

    renderer.compile = _ => {
      return () => {};
    };

    r.register('swig', 'html', renderer);
    r.get('swig').compile!.should.eql(renderer.compile);

    // callback-style renderer
    function callbackRenderer(_data, _options, _callback) {
      return BluebirdPromise.resolve();
    }

    callbackRenderer.compile = _ => {
      return () => {};
    };

    r.register('ejs', 'html', callbackRenderer);
    r.get('ejs').compile!.should.eql(callbackRenderer.compile);
  });

  it('register() - disableNunjucks', () => {
    const r = new Renderer();

    // promise-style renderer
    function promiseRenderer(_data, _options) {
      return BluebirdPromise.resolve();
    }

    promiseRenderer.disableNunjucks = true;

    r.register('md', 'html', promiseRenderer);
    r.get('md').disableNunjucks!.should.be.true;

    // callback-style renderer
    function callbackRenderer(_data, _options, _callback) {
      return BluebirdPromise.resolve();
    }

    callbackRenderer.disableNunjucks = true;

    r.register('ejs', 'html', callbackRenderer);
    r.get('ejs').disableNunjucks!.should.be.true;

    // sync renderer
    function syncRenderer(_data, _options) {
      return 'foo';
    }

    syncRenderer.disableNunjucks = true;

    r.register('njk', 'html', syncRenderer, true);
    r.get('njk').disableNunjucks!.should.be.true;

    // not specified
    r.register('txt', 'text', (_data, _options) => BluebirdPromise.resolve());
    should.not.exist(r.get('txt').disableNunjucks);
  });

  it('register() - disableManagedLayout', () => {
    const r = new Renderer();

    // promise-style renderer
    function promiseRenderer(_data, _options) {
      return BluebirdPromise.resolve();
    }

    promiseRenderer.disableManagedLayout = true;

    r.register('md', 'html', promiseRenderer);
    r.get('md').disableManagedLayout!.should.be.true;

    // callback-style renderer
    function callbackRenderer(_data, _options, _callback) {
      return BluebirdPromise.resolve();
    }

    callbackRenderer.disableManagedLayout = true;

    r.register('ejs', 'html', callbackRenderer);
    r.get('ejs').disableManagedLayout!.should.be.true;

    // sync renderer
    function syncRenderer(_data, _options) {
      return 'foo';
    }

    syncRenderer.disableManagedLayout = true;

    r.register('njk', 'html', syncRenderer, true);
    r.get('njk').disableManagedLayout!.should.be.true;

    // not specified
    r.register('txt', 'text', (_data, _options) => BluebirdPromise.resolve());
    should.not.exist(r.get('txt').disableManagedLayout);
  });

  it('getOutput()', () => {
    const r = new Renderer();

    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.getOutput('yaml').should.eql('json');
    r.getOutput('.yaml').should.eql('json');
    r.getOutput('config.yaml').should.eql('json');
    r.getOutput('foo.xml').should.not.ok;
  });

  it('isRenderable()', () => {
    const r = new Renderer();

    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.isRenderable('yaml').should.be.true;
    r.isRenderable('.yaml').should.be.true;
    r.isRenderable('config.yaml').should.be.true;
    r.isRenderable('foo.xml').should.be.false;
  });

  it('isRenderableSync()', () => {
    const r = new Renderer();

    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.isRenderableSync('yaml').should.be.false;

    r.register('njk', 'html', () => {}, true);

    r.isRenderableSync('njk').should.be.true;
    r.isRenderableSync('.njk').should.be.true;
    r.isRenderableSync('layout.njk').should.be.true;
    r.isRenderableSync('foo.html').should.be.false;
  });

  it('get()', () => {
    const r = new Renderer();

    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.get('yaml').should.exist;
    r.get('.yaml').should.exist;
    r.get('config.yaml').should.exist;
    should.not.exist(r.get('foo.xml'));
    should.not.exist(r.get('yaml', true));

    r.register('swig', 'html', () => {}, true);

    r.get('swig').should.exist;
    r.get('swig', true).should.exist;
  });

  it('list()', () => {
    const r = new Renderer();

    r.register('yaml', 'json', () => BluebirdPromise.resolve());

    r.register('swig', 'html', () => {}, true);

    r.list().should.have.all.keys(['yaml', 'swig']);
    r.list(true).should.have.all.keys(['swig']);
  });
});
