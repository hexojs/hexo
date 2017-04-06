var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');

describe('Scaffold', () => {
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

  before(() => hexo.init().then(() => fs.writeFile(testPath, testContent)));

  after(() => fs.rmdir(scaffoldDir));

  it('get() - file exists', () => scaffold.get('test').then(data => {
    data.should.eql(testContent);
  }));

  it('get() - normal scaffold', () => scaffold.get('normal').then(data => {
    data.should.eql(scaffold.defaults.normal);
  }));

  it('set() - file exists', () => scaffold.set('test', 'foo').then(() => Promise.all([
    fs.readFile(testPath),
    scaffold.get('test')
  ])).spread((file, data) => {
    file.should.eql('foo');
    data.should.eql('foo');
    return fs.writeFile(testPath, testContent);
  }));

  it('set() - file does not exist', () => {
    var testPath = pathFn.join(scaffoldDir, 'foo.md');

    return scaffold.set('foo', 'bar').then(() => Promise.all([
      fs.readFile(testPath),
      scaffold.get('foo')
    ])).spread((file, data) => {
      file.should.eql('bar');
      data.should.eql('bar');
      return fs.unlink(testPath);
    });
  });

  it('remove() - file exist', () => scaffold.remove('test').then(() => Promise.all([
    fs.exists(testPath),
    scaffold.get('test')
  ])).spread((exist, data) => {
    exist.should.be.false;
    should.not.exist(data);
    return fs.writeFile(testPath, testContent);
  }));

  it('remove() - file does not exist', () => scaffold.remove('foo'));
});
