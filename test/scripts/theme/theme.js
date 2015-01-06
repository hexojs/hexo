var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var testUtil = require('../../util');

describe('Theme', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'theme_test'), {silent: true});
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  var route = hexo.route;

  function checkStream(stream, expected){
    return testUtil.stream.read(stream).then(function(data){
      data.should.eql(expected);
    });
  }

  before(function(){
    return Promise.all([
      fs.mkdirs(themeDir),
      fs.writeFile(hexo.config_path, 'theme: test')
    ]).then(function(){
      return hexo.init();
    });
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(function(){
    // Unregister all generators
    hexo.extend.generator.store = {};
    // Remove all routes
    route.routes = {};
  });

  it('generate()', function(){
    // object
    hexo.extend.generator.register('test_obj', function(locals){
      return {
        path: 'foo',
        data: 'foo'
      };
    });

    // array
    hexo.extend.generator.register('test_arr', function(locals){
      return [
        {path: 'bar', data: 'bar'},
        {path: 'baz', data: 'baz'}
      ];
    });

    return hexo.theme.generate().then(function(){
      route.list().should.eql(['foo', 'bar', 'baz']);

      return Promise.all([
        checkStream(route.get('foo'), 'foo'),
        checkStream(route.get('bar'), 'bar'),
        checkStream(route.get('baz'), 'baz')
      ]);
    });
  });

  it('generate() - layout', function(){
    hexo.theme.setView('test.swig', [
      '{{ config.title }}',
      '{{ page.foo }}',
      '{{ layout }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'test',
        data: {
          foo: 'bar'
        }
      };
    });

    var expected = [
      hexo.config.title,
      'bar',
      'layout',
      pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep
    ].join('\n');

    return hexo.theme.generate().then(function(){
      return checkStream(route.get('test'), expected);
    });
  });

  it('generate() - layout array', function(){
    hexo.theme.setView('baz.swig', 'baz');

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: ['foo', 'bar', 'baz']
      };
    });

    return hexo.theme.generate().then(function(){
      return checkStream(route.get('test'), 'baz');
    });
  });

  it('generate() - layout not exist', function(){
    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'nothing'
      };
    });

    return hexo.theme.generate().then(function(){
      return checkStream(route.get('test'), '');
    });
  });

  it('generate() - remove old routes', function(){
    hexo.extend.generator.register('test', function(){
      return {
        path: 'bar',
        data: 'newbar'
      };
    });

    route.set('foo', 'foo');
    route.set('bar', 'bar');
    route.set('baz', 'baz');

    return hexo.theme.generate().then(function(){
      should.not.exist(route.get('foo'));
      should.not.exist(route.get('baz'));

      return checkStream(route.get('bar'), 'newbar');
    });
  });

  it('generateBefore & generateAfter events');

  it('getView()', function(){
    hexo.theme.setView('test.swig', '');

    // With extension name
    hexo.theme.getView('test.swig').should.have.property('path', 'test.swig');

    // Without extension name
    hexo.theme.getView('test').should.have.property('path', 'test.swig');

    // not exist
    should.not.exist(hexo.theme.getView('abc.swig'));

    hexo.theme.removeView('test.swig');
  });

  it('getView() - escape backslashes', function(){
    hexo.theme.setView('foo/bar.swig', '');

    hexo.theme.getView('foo\\bar.swig').should.have.property('path', 'foo/bar.swig');

    hexo.theme.removeView('foo/bar.swig');
  });

  it('setView()', function(){
    hexo.theme.setView('test.swig', '');

    var view = hexo.theme.getView('test.swig');
    view.path.should.eql('test.swig');

    hexo.theme.removeView('test.swig');
  });

  it('removeView()', function(){
    hexo.theme.setView('test.swig', '');
    hexo.theme.removeView('test.swig');

    should.not.exist(hexo.theme.getView('test.swig'));
  });
});