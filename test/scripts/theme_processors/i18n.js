'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('i18n', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var processor = require('../../../lib/theme/processors/i18n');
  var process = Promise.method(processor.process.bind(hexo));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
    var path = options.path;

    options.params = {
      path: path
    };

    options.path = 'languages/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(function() {
    return Promise.all([
      fs.mkdirs(themeDir),
      fs.writeFile(hexo.config_path, 'theme: test')
    ]).then(function() {
      return hexo.init();
    });
  });

  after(function() {
    return fs.rmdir(hexo.base_dir);
  });

  it('pattern', function() {
    var pattern = processor.pattern;

    pattern.match('languages/default.yml').should.be.ok;
    pattern.match('languages/zh-TW.yml').should.be.ok;
    should.not.exist(pattern.match('default.yml'));
  });

  it('type: create', function() {
    var body = [
      'ok: OK',
      'index:',
      '  title: Home'
    ].join('\n');

    var file = newFile({
      path: 'en.yml',
      type: 'create',
      content: body
    });

    return process(file).then(function() {
      var __ = hexo.theme.i18n.__('en');

      __('ok').should.eql('OK');
      __('index.title').should.eql('Home');
    });
  });

  it('type: delete', function() {
    hexo.theme.i18n.set('en', {
      foo: 'foo',
      bar: 'bar'
    });

    var file = newFile({
      path: 'en.yml',
      type: 'delete'
    });

    return process(file).then(function() {
      hexo.theme.i18n.get('en').should.eql({});
    });
  });
});
