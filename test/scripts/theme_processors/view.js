var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('view', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'view_test'), {silent: true});
  var processor = require('../../../lib/theme/processors/view');
  var process = Promise.method(processor.process.bind(hexo));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  hexo.env.init = true;

  function newFile(options) {
    var path = options.path;

    options.params = {path};
    options.path = 'layout/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  it('pattern', () => {
    var pattern = processor.pattern;

    pattern.match('layout/index.swig').path.should.eql('index.swig');
    should.not.exist(pattern.match('index.swig'));
    should.not.exist(pattern.match('view/index.swig'));
  });

  it('type: create', () => {
    var body = [
      'foo: bar',
      '---',
      'test'
    ].join('\n');

    var file = newFile({
      path: 'index.swig',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      var view = hexo.theme.getView('index.swig');

      view.path.should.eql('index.swig');
      view.source.should.eql(pathFn.join(themeDir, 'layout', 'index.swig'));
      view.data.should.eql({
        foo: 'bar',
        _content: 'test'
      });
    }).finally(() => {
      hexo.theme.removeView('index.swig');
      return fs.unlink(file.source);
    });
  });

  it('type: delete', () => {
    var file = newFile({
      path: 'index.swig',
      type: 'delete'
    });

    return process(file).then(() => {
      should.not.exist(hexo.theme.getView('index.swig'));
    });
  });
});
