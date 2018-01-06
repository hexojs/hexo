var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var yaml = require('js-yaml');
var _ = require('lodash');

describe('File', () => {
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

  function makeFile(path, props) {
    return new File(_.assign({
      source: pathFn.join(box.base, path),
      path
    }, props));
  }

  var file = makeFile(path, {
    source: pathFn.join(box.base, path),
    path,
    type: 'create',
    params: {foo: 'bar'}
  });

  before(() => Promise.all([
    fs.writeFile(file.source, body),
    hexo.init()
  ]).then(() => fs.stat(file.source)));

  after(() => fs.rmdir(box.base));

  it('read()', () => file.read().should.eventually.eql(body));

  it('read() - callback', callback => {
    file.read((err, content) => {
      should.not.exist(err);
      content.should.eql(body);
      callback();
    });
  });

  it('readSync()', () => {
    file.readSync().should.eql(body);
  });

  it('stat()', () => Promise.all([
    fs.stat(file.source),
    file.stat()
  ]).then(stats => {
    stats[0].should.eql(stats[1]);
  }));

  it('stat() - callback', callback => {
    file.stat((err, fileStats) => {
      if (err) return callback(err);

      fileStats.should.eql(fs.statSync(file.source));
      callback();
    });
  });

  it('statSync()', () => {
    file.statSync().should.eql(fs.statSync(file.source));
  });

  it('render()', () => file.render().should.eventually.eql(obj));

  it('render() - callback', callback => {
    file.render((err, data) => {
      if (err) return callback(err);

      data.should.eql(obj);
      callback();
    });
  });

  it('renderSync()', () => {
    file.renderSync().should.eql(obj);
  });
});
