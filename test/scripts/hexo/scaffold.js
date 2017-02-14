'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');

describe('Scaffold', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var scaffold = hexo.scaffold;
  var scaffoldDir = hexo.scaffold_dir;

  var testContent = [
    '---',
    'title: {{ title }}',
    '---',
    'test scaffold'
  ].join('\n');

  var testPath = pathFn.join(scaffoldDir, 'test.md');

  before(function() {
    return hexo.init().then(function() {
      return fs.writeFile(testPath, testContent);
    });
  });

  after(function() {
    return fs.rmdir(scaffoldDir);
  });

  it('get() - file exists', function() {
    return scaffold.get('test').then(function(data) {
      data.should.eql(testContent);
    });
  });

  it('get() - normal scaffold', function() {
    return scaffold.get('normal').then(function(data) {
      data.should.eql(scaffold.defaults.normal);
    });
  });

  it('set() - file exists', function() {
    return scaffold.set('test', 'foo').then(function() {
      return Promise.all([
        fs.readFile(testPath),
        scaffold.get('test')
      ]);
    }).spread(function(file, data) {
      file.should.eql('foo');
      data.should.eql('foo');
      return fs.writeFile(testPath, testContent);
    });
  });

  it('set() - file does not exist', function() {
    var testPath = pathFn.join(scaffoldDir, 'foo.md');

    return scaffold.set('foo', 'bar').then(function() {
      return Promise.all([
        fs.readFile(testPath),
        scaffold.get('foo')
      ]);
    }).spread(function(file, data) {
      file.should.eql('bar');
      data.should.eql('bar');
      return fs.unlink(testPath);
    });
  });

  it('remove() - file exist', function() {
    return scaffold.remove('test').then(function() {
      return Promise.all([
        fs.exists(testPath),
        scaffold.get('test')
      ]);
    }).spread(function(exist, data) {
      exist.should.be.false;
      should.not.exist(data);
      return fs.writeFile(testPath, testContent);
    });
  });

  it('remove() - file does not exist', function() {
    return scaffold.remove('foo');
  });
});
