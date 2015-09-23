'use strict';

var fs = require('hexo-fs');
var pathFn = require('path');
var yaml = require('js-yaml');
var sinon = require('sinon');

describe('Render', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'render_test'));

  var body = [
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

  var obj = yaml.load(body);
  var path = pathFn.join(hexo.base_dir, 'test.yml');

  before(function() {
    return fs.writeFile(path, body).then(function() {
      return hexo.init();
    });
  });

  after(function() {
    return fs.rmdir(hexo.base_dir);
  });

  it('isRenderable()', function() {
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

  it('isRenderableSync()', function() {
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

  it('getOutput()', function() {
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

  it('render() - path', function() {
    return hexo.render.render({path: path}).then(function(result) {
      result.should.eql(obj);
    });
  });

  it('render() - text (without engine)', function() {
    return hexo.render.render({text: body}).then(function(result) {
      result.should.eql(body);
    });
  });

  it('render() - text (with engine)', function() {
    return hexo.render.render({text: body, engine: 'yaml'}).then(function(result) {
      result.should.eql(obj);
    });
  });

  it('render() - no path and text', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'No input file or string!');
    });

    return hexo.render.render().catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('render() - options', function() {
    return hexo.render.render({
      text: [
        '<title>{{ title }}</title>',
        '<body>{{ content }}</body>'
      ].join('\n'),
      engine: 'swig'
    }, {
      title: 'Hello world',
      content: 'foobar'
    }).then(function(result) {
      result.should.eql([
        '<title>Hello world</title>',
        '<body>foobar</body>'
      ].join('\n'));
    });
  });

  it('render() - toString', function() {
    return hexo.render.render({
      text: body,
      engine: 'yaml',
      toString: true
    }).then(function(content) {
      content.should.eql(JSON.stringify(obj));
    });
  });

  it('render() - custom toString method', function() {
    return hexo.render.render({
      text: body,
      engine: 'yaml',
      toString: function(data) {
        return JSON.stringify(data, null, '  ');
      }
    }).then(function(content) {
      content.should.eql(JSON.stringify(obj, null, '  '));
    });
  });

  it('render() - after_render filter', function() {
    var data = {
      text: '  <strong>123456</strong>  ',
      engine: 'swig'
    };

    var filter = sinon.spy(function(result, obj) {
      result.should.eql(data.text);
      obj.should.eql(data);
      return result.trim();
    });

    hexo.extend.filter.register('after_render:html', filter);

    return hexo.render.render(data).then(function(result) {
      filter.calledOnce.should.be.true;
      result.should.eql(data.text.trim());

      hexo.extend.filter.unregister('after_render:html', filter);
    });
  });

  it('render() - after_render filter: use the given output extension if not found', function() {
    var data = {
      text: 'foo',
      engine: 'txt'
    };

    var filter = sinon.spy();
    hexo.extend.filter.register('after_render:txt', filter);

    return hexo.render.render(data).then(function(result) {
      filter.calledOnce.should.be.true;
      hexo.extend.filter.unregister('after_render:txt', filter);
    });
  });

  it('render() - onRenderEnd method', function() {
    var onRenderEnd = sinon.spy(function(result) {
      return result + 'bar';
    });

    var data = {
      text: 'foo',
      engine: 'txt',
      onRenderEnd: onRenderEnd
    };

    var filter = sinon.spy(function(result) {
      result.should.eql('foobar');
    });

    hexo.extend.filter.register('after_render:txt', filter);

    return hexo.render.render(data).then(function(result) {
      onRenderEnd.calledOnce.should.be.true;
      filter.calledOnce.should.be.true;

      hexo.extend.filter.unregister('after_render:txt', filter);
    });
  });

  it('renderSync() - path', function() {
    var result = hexo.render.renderSync({path: path});
    result.should.eql(obj);
  });

  it('renderSync() - text (without engine)', function() {
    var result = hexo.render.renderSync({text: body});
    result.should.eql(body);
  });

  it('renderSync() - text (with engine)', function() {
    var result = hexo.render.renderSync({text: body, engine: 'yaml'});
    result.should.eql(obj);
  });

  it('renderSync() - no path and text', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'No input file or string!');
    });

    try {
      hexo.render.renderSync();
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('renderSync() - options', function() {
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

  it('renderSync() - toString', function() {
    var result = hexo.render.renderSync({
      text: body,
      engine: 'yaml',
      toString: true
    });

    result.should.eql(JSON.stringify(obj));
  });

  it('renderSync() - custom toString method', function() {
    var result = hexo.render.renderSync({
      text: body,
      engine: 'yaml',
      toString: function(data) {
        return JSON.stringify(data, null, '  ');
      }
    });

    result.should.eql(JSON.stringify(obj, null, '  '));
  });

  it('renderSync() - after_render filter', function() {
    var data = {
      text: '  <strong>123456</strong>  ',
      engine: 'swig'
    };

    var filter = sinon.spy(function(result, obj) {
      result.should.eql(data.text);
      obj.should.eql(data);
      return result.trim();
    });

    hexo.extend.filter.register('after_render:html', filter);

    var result = hexo.render.renderSync(data);

    filter.calledOnce.should.be.true;
    result.should.eql(data.text.trim());

    hexo.extend.filter.unregister('after_render:html', filter);
  });

  it('renderSync() - after_render filter: use the given output extension if not found', function() {
    var data = {
      text: 'foo',
      engine: 'txt'
    };

    var filter = sinon.spy();
    hexo.extend.filter.register('after_render:txt', filter);

    hexo.render.renderSync(data);
    filter.calledOnce.should.be.true;
    hexo.extend.filter.unregister('after_render:txt', filter);
  });

  it('renderSync() - onRenderEnd', function() {
    var onRenderEnd = sinon.spy(function(result) {
      return result + 'bar';
    });
    var data = {
      text: 'foo',
      engine: 'txt',
      onRenderEnd: onRenderEnd
    };

    var filter = sinon.spy(function(result) {
      result.should.eql('foobar');
    });

    hexo.extend.filter.register('after_render:txt', filter);

    hexo.render.renderSync(data);
    onRenderEnd.calledOnce.should.be.true;
    filter.calledOnce.should.be.true;

    hexo.extend.filter.unregister('after_render:txt', filter);
  });
});
