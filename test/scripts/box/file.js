'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var yaml = require('js-yaml');

describe('File', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Box = require('../../../lib/box');
  var box = new Box(hexo, pathFn.join(hexo.base_dir, 'file_test'));
  var File = box.File;

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

  var file = new File({
    source: pathFn.join(box.base, path),
    path: path,
    type: 'create',
    params: {foo: 'bar'},
    content: new Buffer(body),
    stats: {}
  });

  before(function() {
    return Promise.all([
      fs.writeFile(file.source, body),
      hexo.init()
    ]);
  });

  after(function() {
    return fs.rmdir(box.base);
  });

  it('read()', function() {
    return file.read().then(function(content) {
      content.should.eql(body);
    });
  });

  it('read() - callback', function(callback) {
    file.read(function(err, content) {
      should.not.exist(err);
      content.should.eql(body);
      callback();
    });
  });

  it('read() - raw buffer', function() {
    file.read({encoding: null}).then(function(content) {
      content.should.eql(new Buffer(body));
    });
  });

  it('read() - string encoding', function() {
    file.read('hex').then(function(content) {
      content.should.eql(new Buffer(body).toString('hex'));
    });
  });

  it('read() - cache off', function() {
    var path = 'nocache.txt';
    var file = new File({
      source: pathFn.join(box.base, path),
      path: path,
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, 'abc').then(function() {
      return file.read({cache: false});
    }).then(function(content) {
      content.should.eql('abc');
      return fs.unlink(file.source);
    });
  });

  it('read() - no content', function() {
    var path = 'nocache.txt';
    var file = new File({
      source: pathFn.join(box.base, path),
      path: path
    });

    return fs.writeFile(file.source, 'abc').then(function() {
      return file.read();
    }).then(function(content) {
      content.should.eql('abc');
      return fs.unlink(file.source);
    });
  });

  it('read() - escape BOM', function() {
    var file = new File({
      content: new Buffer('\ufefffoo')
    });

    return file.read().then(function(result) {
      result.should.eql('foo');
    });
  });

  it('read() - escape Windows line ending', function() {
    var file = new File({
      content: new Buffer('foo\r\nbar')
    });

    return file.read().then(function(result) {
      result.should.eql('foo\nbar');
    });
  });

  it('readSync()', function() {
    file.readSync().should.eql(body);
  });

  it('readSync() - raw buffer', function() {
    file.readSync({encoding: null}).should.eql(new Buffer(body));
  });

  it('readSync() - string encoding', function() {
    file.readSync('hex').should.eql(new Buffer(body).toString('hex'));
  });

  it('readSync() - cache off', function() {
    var path = 'nocache.txt';
    var file = new File({
      source: pathFn.join(box.base, path),
      path: path,
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, 'abc').then(function() {
      var content = file.readSync({cache: false});

      content.should.eql('abc');

      return fs.unlink(file.source);
    });
  });

  it('readSync() - no content', function() {
    var path = 'nocache.txt';
    var file = new File({
      source: pathFn.join(box.base, path),
      path: path
    });

    return fs.writeFile(file.source, 'abc').then(function() {
      var content = file.readSync();

      content.should.eql('abc');

      return fs.unlink(file.source);
    });
  });

  it('readSync() - escape BOM', function() {
    var file = new File({
      content: new Buffer('\ufefffoo')
    });

    file.readSync().should.eql('foo');
  });

  it('readSync() - escape Windows line ending', function() {
    var file = new File({
      content: new Buffer('foo\r\nbar')
    });

    file.readSync().should.eql('foo\nbar');
  });

  it('stat()', function() {
    return file.stat().then(function(stats) {
      stats.should.eql({});
    });
  });

  it('stat() - callback', function(callback) {
    file.stat(function(err, stats) {
      should.not.exist(err);
      stats.should.eql({});
      callback();
    });
  });

  it('stat() - cache off', function() {
    return Promise.all([
      fs.stat(file.source),
      file.stat({cache: false})
    ]).then(function(stats) {
      stats[0].should.eql(stats[1]);
    });
  });

  it('statSync()', function() {
    file.statSync().should.eql({});
  });

  it('statSync() - cache off', function() {
    return fs.stat(file.source).then(function(stats) {
      file.statSync({cache: false}).should.eql(stats);
    });
  });

  it('render()', function() {
    return file.render().then(function(data) {
      data.should.eql(obj);
    });
  });

  it('render() - callback', function(callback) {
    file.render(function(err, data) {
      should.not.exist(err);
      data.should.eql(obj);
      callback();
    });
  });

  it('renderSync()', function() {
    file.renderSync().should.eql(obj);
  });
});
