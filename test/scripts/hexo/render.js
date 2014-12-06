var Hexo = require('../../../lib/hexo');
var util = Hexo.util;
var fs = util.fs;
var pathFn = require('path');
var fixtureDir = pathFn.join(__dirname, '../../fixtures');

describe('Render', function(){
  var hexo = new Hexo(__dirname);

  before(function(){
    return hexo.init();
  });

  it('isRenderable()', function(){
    hexo.render.isRenderable('test.txt').should.be.false;

    // html
    hexo.render.isRenderable('test.htm').should.be.true;
    hexo.render.isRenderable('test.html').should.be.true;

    // swig
    hexo.render.isRenderable('test.swig').should.be.true;

    // yaml
    hexo.render.isRenderable('test.yml').should.be.true;
    hexo.render.isRenderable('test.yaml').should.be.true;
  });

  it('isRenderableSync()', function(){
    hexo.render.isRenderableSync('test.txt').should.be.false;

    // html
    hexo.render.isRenderableSync('test.htm').should.be.true;
    hexo.render.isRenderableSync('test.html').should.be.true;

    // swig
    hexo.render.isRenderableSync('test.swig').should.be.true;

    // yaml
    hexo.render.isRenderableSync('test.yml').should.be.true;
    hexo.render.isRenderableSync('test.yaml').should.be.true;
  });

  it('getOutput()', function(){
    hexo.render.getOutput('test.txt').should.not.ok;

    // html
    hexo.render.getOutput('test.htm').should.eql('html');
    hexo.render.getOutput('test.html').should.eql('html');

    // swig
    hexo.render.getOutput('test.swig').should.eql('html');

    // yaml
    hexo.render.getOutput('test.yml').should.eql('json');
    hexo.render.getOutput('test.yaml').should.eql('json');
  });

  it('render() - path', function(){
    return hexo.render.render({
      path: pathFn.join(fixtureDir, 'test.yml')
    }).then(function(result){
      result.should.eql({
        name: {
          first: 'John',
          last: 'Doe'
        },
        age: 23,
        list: ['Apple', 'Banana']
      });
    });
  });

  it('render() - text (without engine)', function(){
    var path = pathFn.join(fixtureDir, 'test.yml');
    var content;

    return fs.readFile(path).then(function(raw){
      content = raw;
      return hexo.render.render({
        text: raw
      });
    }).then(function(result){
      result.should.eql(content);
    });
  });

  it('render() - text (with engine)', function(){
    var path = pathFn.join(fixtureDir, 'test.yml');

    return fs.readFile(path).then(function(raw){
      return hexo.render.render({
        text: raw,
        engine: 'yaml'
      });
    }).then(function(result){
      result.should.eql({
        name: {
          first: 'John',
          last: 'Doe'
        },
        age: 23,
        list: ['Apple', 'Banana']
      });
    });
  });

  it('render() - no path and text', function(){
    hexo.render.render().catch(function(err){
      err.should.have.property('message', 'No input file or string!');
    });
  });

  it('render() - options', function(){
    hexo.render.render({
      text: [
        '<title>{{ title }}</title>',
        '<body>{{ content }}</body>'
      ].join('\n'),
      engine: 'swig'
    }, {
      title: 'Hello world',
      content: 'foobar'
    }).then(function(result){
      result.should.eql([
        '<title>Hello world</title>',
        '<body>foobar</body>'
      ].join('\n'));
    });
  });

  it('renderSync() - path', function(){
    var result = hexo.render.renderSync({
      path: pathFn.join(fixtureDir, 'test.yml')
    });

    result.should.eql({
      name: {
        first: 'John',
        last: 'Doe'
      },
      age: 23,
      list: ['Apple', 'Banana']
    });
  });

  it('renderSync() - text (without engine)', function(){
    var path = pathFn.join(fixtureDir, 'test.yml');

    return fs.readFile(path).then(function(raw){
      hexo.render.renderSync({text: raw}).should.eql(raw);
    });
  });

  it('renderSync() - text (with engine)', function(){
    var path = pathFn.join(fixtureDir, 'test.yml');

    return fs.readFile(path).then(function(raw){
      var result = hexo.render.renderSync({text: raw, engine: 'yaml'});

      result.should.eql({
        name: {
          first: 'John',
          last: 'Doe'
        },
        age: 23,
        list: ['Apple', 'Banana']
      });
    });
  });

  it('renderSync() - no path and text', function(){
    try {
      hexo.render.renderSync();
    } catch (err){
      err.should.have.property('message', 'No input file or string!');
    }
  });

  it('renderSync() - options', function(){
    var result = hexo.render.renderSync({
      text: [
        '<title>{{ title }}</title>',
        '<body>{{ content }}</body>'
      ].join('\n'),
      engine: 'swig'
    }, {
      title: 'Hello world',
      content: 'foobar'
    });

    result.should.eql([
      '<title>Hello world</title>',
      '<body>foobar</body>'
    ].join('\n'));
  });
});