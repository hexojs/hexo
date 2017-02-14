'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('source', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'source_test'), {silent: true});
  var processor = require('../../../lib/theme/processors/source');
  var process = Promise.method(processor.process.bind(hexo));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  var Asset = hexo.model('Asset');

  function newFile(options) {
    var path = options.path;

    options.params = {path: path};
    options.path = 'source/' + path;
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

    pattern.match('source/foo.jpg').should.eql({path: 'foo.jpg'});
    pattern.match('source/_foo.jpg').should.be.false;
    pattern.match('source/foo/_bar.jpg').should.be.false;
    pattern.match('source/foo.jpg~').should.be.false;
    pattern.match('source/foo.jpg%').should.be.false;
    pattern.match('layout/foo.swig').should.be.false;
    pattern.match('package.json').should.be.false;
    pattern.match('node_modules/test/test.js').should.be.false;
    pattern.match('source/node_modules/test/test.js').should.be.false;
  });

  it('type: create', function() {
    var file = newFile({
      path: 'style.css',
      type: 'create'
    });

    var id = 'themes/test/' + file.path;

    return fs.writeFile(file.source, 'test').then(function() {
      return process(file);
    }).then(function() {
      var asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.params.path);
      asset.modified.should.be.true;

      return asset.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('type: update', function() {
    var file = newFile({
      path: 'style.css',
      type: 'update'
    });

    var id = 'themes/test/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.params.path,
        modified: false
      })
    ]).then(function() {
      return process(file);
    }).then(function() {
      var asset = Asset.findById(id);

      asset.modified.should.be.true;
    }).finally(function() {
      return Promise.all([
        fs.unlink(file.source),
        Asset.removeById(id)
      ]);
    });
  });

  it('type: skip', function() {
    var file = newFile({
      path: 'style.css',
      type: 'skip'
    });

    var id = 'themes/test/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.params.path,
        modified: false
      })
    ]).then(function() {
      return process(file);
    }).then(function() {
      var asset = Asset.findById(id);

      asset.modified.should.be.false;
    }).finally(function() {
      return Promise.all([
        fs.unlink(file.source),
        Asset.removeById(id)
      ]);
    });
  });

  it('type: delete', function() {
    var file = newFile({
      path: 'style.css',
      type: 'delete'
    });

    var id = 'themes/test/' + file.path;

    return Asset.insert({
      _id: id,
      path: file.params.path
    }).then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(Asset.findById(id));
    });
  });
});
