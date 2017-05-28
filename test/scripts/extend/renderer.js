var should = require('chai').should(); // eslint-disable-line

describe('Renderer', () => {
  var Renderer = require('../../../lib/extend/renderer');

  it('register()', () => {
    var r = new Renderer();

    // name, output, fn
    r.register('yaml', 'json', () => {});

    r.get('yaml').should.exist;
    r.get('yaml').output.should.eql('json');

    // name, output, fn, sync
    r.register('yaml', 'json', () => {}, true);

    r.get('yaml').should.exist;
    r.get('yaml').output.should.eql('json');
    r.get('yaml', true).should.exist;
    r.get('yaml', true).output.should.eql('json');

    // no fn
    try {
      r.register('yaml', 'json');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // no output
    try {
      r.register('yaml');
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'output is required');
    }

    // no name
    try {
      r.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }
  });

  it('register() - promisify', () => {
    var r = new Renderer();

    // async
    r.register('yaml', 'json', (data, options, callback) => {
      callback(null, 'foo');
    });

    r.get('yaml')({}, {}).then(result => {
      result.should.eql('foo');
    });

    // sync
    r.register('swig', 'html', (data, options) => 'foo', true);

    r.get('swig')({}, {}).then(result => {
      result.should.eql('foo');
    });
  });

  it('register() - compile', () => {
    var r = new Renderer();

    function renderer(data, locals) {}

    renderer.compile = data => {
      //
    };

    r.register('swig', 'html', renderer);
    r.get('swig').compile.should.eql(renderer.compile);
  });

  it('getOutput()', () => {
    var r = new Renderer();

    r.register('yaml', 'json', () => {});

    r.getOutput('yaml').should.eql('json');
    r.getOutput('.yaml').should.eql('json');
    r.getOutput('config.yaml').should.eql('json');
    r.getOutput('foo.xml').should.not.ok;
  });

  it('isRenderable()', () => {
    var r = new Renderer();

    r.register('yaml', 'json', () => {});

    r.isRenderable('yaml').should.be.true;
    r.isRenderable('.yaml').should.be.true;
    r.isRenderable('config.yaml').should.be.true;
    r.isRenderable('foo.xml').should.be.false;
  });

  it('isRenderableSync()', () => {
    var r = new Renderer();

    r.register('yaml', 'json', () => {});

    r.isRenderableSync('yaml').should.be.false;

    r.register('swig', 'html', () => {}, true);

    r.isRenderableSync('swig').should.be.true;
    r.isRenderableSync('.swig').should.be.true;
    r.isRenderableSync('layout.swig').should.be.true;
    r.isRenderableSync('foo.html').should.be.false;
  });

  it('get()', () => {
    var r = new Renderer();

    r.register('yaml', 'json', () => {});

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
    var r = new Renderer();

    r.register('yaml', 'json', () => {});

    r.register('swig', 'html', () => {}, true);

    r.list().should.have.keys(['yaml', 'swig']);
    r.list(true).should.have.keys(['swig']);
  });
});
