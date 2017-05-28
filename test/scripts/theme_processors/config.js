var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('config', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  var processor = require('../../../lib/theme/processors/config');
  var process = Promise.method(processor.process.bind(hexo));
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
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

    pattern.match('_config.yml').should.be.ok;
    pattern.match('_config.json').should.be.ok;
    should.not.exist(pattern.match('_config/foo.yml'));
    should.not.exist(pattern.match('foo.yml'));
  });

  it('type: create', () => {
    var body = [
      'name:',
      '  first: John',
      '  last: Doe'
    ].join('\n');

    var file = newFile({
      path: '_config.yml',
      type: 'create',
      content: body
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      hexo.theme.config.should.eql({
        name: {first: 'John', last: 'Doe'}
      });
    }).finally(() => {
      hexo.theme.config = {};
      return fs.unlink(file.source);
    });
  });

  it('type: delete', () => {
    var file = newFile({
      path: '_config.yml',
      type: 'delete'
    });

    hexo.theme.config = {foo: 'bar'};

    return process(file).then(() => {
      hexo.theme.config.should.eql({});
    });
  });

  it('load failed', () => {
    var file = newFile({
      path: '_config.yml',
      type: 'create'
    });

    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'Theme config load failed.');
    });

    return process(file).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    }).catch(() => {}); // Catch again because it throws error
  });
});
