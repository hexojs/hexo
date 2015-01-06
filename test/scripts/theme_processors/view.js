var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('view', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'view_test'), {silent: true});
  var processor = require('../../../lib/theme/processors/view');
  var process = Promise.method(processor.process.bind(hexo));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  function newFile(options){
    var path = options.path;

    options.params = {path: path};
    options.path = 'layout/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
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

  it('pattern', function(){
    var pattern = processor.pattern;

    pattern.match('layout/index.swig').path.should.eql('index.swig');
    should.not.exist(pattern.match('index.swig'));
    should.not.exist(pattern.match('view/index.swig'));
  });

  it('type: create', function(){
    var body = [
      'foo: bar',
      '---',
      'test'
    ].join('\n');

    var file = newFile({
      path: 'index.swig',
      type: 'create',
      content: new Buffer(body)
    });

    return process(file).then(function(){
      var view = hexo.theme.getView('index.swig');

      view.path.should.eql('index.swig');
      view.source.should.eql(pathFn.join(themeDir, 'layout', 'index.swig'));
      view.data.should.eql({
        foo: 'bar',
        _content: 'test'
      });

      hexo.theme.removeView('index.swig');
    });
  });

  it('type: delete', function(){
    var file = newFile({
      path: 'index.swig',
      type: 'delete'
    });

    return process(file).then(function(){
      should.not.exist(hexo.theme.getView('index.swig'));
    });
  });
});