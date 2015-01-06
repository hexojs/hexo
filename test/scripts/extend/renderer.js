var should = require('chai').should();

describe('Renderer', function(){
  var Renderer = require('../../../lib/extend/renderer');

  it('register()', function(){
    var r = new Renderer();

    // name, output, fn
    r.register('yaml', 'json', function(){});
    r.get('yaml').should.exist;
    r.get('yaml').output.should.eql('json');

    // name, output, fn, sync
    r.register('yaml', 'json', function(){}, true);
    r.get('yaml').should.exist;
    r.get('yaml').output.should.eql('json');
    r.get('yaml', true).should.exist;
    r.get('yaml', true).output.should.eql('json');

    // no fn
    try {
      r.register('yaml', 'json');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // no output
    try {
      r.register('yaml');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'output is required');
    }

    // no name
    try {
      r.register();
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }
  });

  it('register() - promisify', function(){
    var r = new Renderer();

    // async
    r.register('yaml', 'json', function(data, options, callback){
      callback(null, 'foo');
    });

    r.get('yaml')({}, {}).then(function(result){
      result.should.eql('foo');
    });

    // sync
    r.register('swig', 'html', function(data, options){
      return 'foo';
    }, true);

    r.get('swig')({}, {}).then(function(result){
      result.should.eql('foo');
    });
  });

  it('getOutput()', function(){
    var r = new Renderer();

    r.register('yaml', 'json', function(){});
    r.getOutput('yaml').should.eql('json');
    r.getOutput('.yaml').should.eql('json');
    r.getOutput('config.yaml').should.eql('json');
    r.getOutput('foo.xml').should.not.ok;
  });

  it('isRenderable()', function(){
    var r = new Renderer();

    r.register('yaml', 'json', function(){});
    r.isRenderable('yaml').should.be.true;
    r.isRenderable('.yaml').should.be.true;
    r.isRenderable('config.yaml').should.be.true;
    r.isRenderable('foo.xml').should.be.false;
  });

  it('isRenderableSync()', function(){
    var r = new Renderer();

    r.register('yaml', 'json', function(){});
    r.isRenderableSync('yaml').should.be.false;

    r.register('swig', 'html', function(){}, true);
    r.isRenderableSync('swig').should.be.true;
    r.isRenderableSync('.swig').should.be.true;
    r.isRenderableSync('layout.swig').should.be.true;
    r.isRenderableSync('foo.html').should.be.false;
  });

  it('get()', function(){
    var r = new Renderer();

    r.register('yaml', 'json', function(){});
    r.get('yaml').should.exist;
    r.get('.yaml').should.exist;
    r.get('config.yaml').should.exist;
    should.not.exist(r.get('foo.xml'));
    should.not.exist(r.get('yaml', true));

    r.register('swig', 'html', function(){}, true);
    r.get('swig').should.exist;
    r.get('swig', true).should.exist;
  });

  it('list()', function(){
    var r = new Renderer();

    r.register('yaml', 'json', function(){});
    r.register('swig', 'html', function(){}, true);

    r.list().should.have.keys(['yaml', 'swig']);
    r.list(true).should.have.keys(['swig']);
  });
});