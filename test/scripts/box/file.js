'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var yaml = require('js-yaml');
var _ = require('lodash');
var util = require('hexo-util');

describe('File', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Box = require('../../../lib/box');
  var box = new Box(hexo, pathFn.join(hexo.base_dir, 'file_test'));
  var File = box.File;
  var Cache = box.Cache;

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
  var path = 'test.yml';
  var hash = util.hash(body).toString('hex');
  var stats;

  function makeFile(path, props) {
    return new File(_.assign({
      source: pathFn.join(box.base, path),
      path: path
    }, props));
  }

  function getCacheId(path) {
    return 'file_test/' + path;
  }

  function removeCache(path) {
    return Cache.removeById(getCacheId(path));
  }

  var file = makeFile(path, {
    source: pathFn.join(box.base, path),
    path: path,
    type: 'create',
    params: {foo: 'bar'}
  });

  before(function() {
    return Promise.all([
      fs.writeFile(file.source, body),
      hexo.init()
    ]).then(function() {
      return fs.stat(file.source);
    }).then(function(stats_) {
      stats = stats_;
    });
  });

  after(function() {
    return fs.rmdir(box.base);
  });

  it('read()', function() {
    return file.read().should.eventually.eql(body);
  });

  it('read() - callback', function(callback) {
    file.read(function(err, content) {
      should.not.exist(err);
      content.should.eql(body);
      callback();
    });
  });

  it('readSync()', function() {
    file.readSync().should.eql(body);
  });

  it('stat()', function() {
    return Promise.all([
      fs.stat(file.source),
      file.stat()
    ]).then(function(stats) {
      stats[0].should.eql(stats[1]);
    });
  });

  it('stat() - callback', function(callback) {
    file.stat(function(err, fileStats) {
      if (err) return callback(err);

      fileStats.should.eql(fs.statSync(file.source));
      callback();
    });
  });

  it('statSync()', function() {
    file.statSync().should.eql(fs.statSync(file.source));
  });

  it('render()', function() {
    return file.render().should.eventually.eql(obj);
  });

  it('render() - callback', function(callback) {
    file.render(function(err, data) {
      if (err) return callback(err);

      data.should.eql(obj);
      callback();
    });
  });

  it('renderSync()', function() {
    file.renderSync().should.eql(obj);
  });

  it('changed() - create', function() {
    var file = makeFile(path, {
      type: 'create'
    });

    return file.changed().then(function(changed) {
      changed.should.be.true;
      return removeCache(path);
    });
  });

  it('changed() - mtime changed', function() {
    var file = makeFile(path, {
      type: 'update'
    });

    return Cache.insert({
      _id: getCacheId(path),
      modified: 0
    }).then(function() {
      return file.changed();
    }).then(function(changed) {
      var cache = Cache.findById(getCacheId(path));

      changed.should.be.true;
      cache.modified.should.eql(stats.mtime.getTime());
      cache.hash.should.eql(hash);

      return removeCache(path);
    });
  });

  it('changed() - hash changed', function() {
    var file = makeFile(path, {
      type: 'update'
    });

    return Cache.insert({
      _id: getCacheId(path),
      modified: stats.mtime,
      hash: 'ewrowerjoweijr'
    }).then(function() {
      return file.changed();
    }).then(function(changed) {
      var cache = Cache.findById(getCacheId(path));

      changed.should.be.true;
      cache.modified.should.eql(stats.mtime.getTime());
      cache.hash.should.eql(hash);

      return removeCache(path);
    });
  });

  it('changed() - skip', function() {
    var file = makeFile(path, {
      type: 'update'
    });

    return Cache.insert({
      _id: getCacheId(path),
      modified: stats.mtime,
      hash: hash
    }).then(function() {
      return file.changed();
    }).then(function(changed) {
      changed.should.be.false;
      return removeCache(path);
    });
  });

  it('changed() - skip solved', function() {
    var file = makeFile(path, {
      type: 'skip'
    });

    file._typeSolved = true;

    return file.changed().should.eventually.be.false;
  });

  it('changed() - delete', function() {
    var file = makeFile(path, {
      type: 'delete'
    });

    return file.changed().should.eventually.be.true;
  });

  it('changed() - callback', function(callback) {
    var file = makeFile(path, {
      type: 'create'
    });

    file.changed(function(err, changed) {
      if (err) return callback(err);

      changed.should.be.true;
      removeCache(path).asCallback(callback);
    });
  });
});
