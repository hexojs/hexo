var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');
var fs = require('hexo-fs');
var pathFn = require('path');

describe('data', () => {
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'data_test');
  var hexo = new Hexo(baseDir);
  var processor = require('../../../lib/plugins/processor/data')(hexo);
  var process = Promise.method(processor.process).bind(hexo);
  var source = hexo.source;
  var File = source.File;
  var Data = hexo.model('Data');

  function newFile(options) {
    var path = options.path;

    options.params = {
      path
    };

    options.path = '_data/' + path;
    options.source = pathFn.join(source.base, options.path);

    return new File(options);
  }

  before(() => fs.mkdirs(baseDir).then(() => hexo.init()));

  after(() => fs.rmdir(baseDir));

  it('pattern', () => {
    var pattern = processor.pattern;

    pattern.match('_data/users.json').should.be.ok;
    pattern.match('_data/users.yaml').should.be.ok;
    should.not.exist(pattern.match('users.json'));
  });

  it('type: create - yaml', () => {
    var body = 'foo: bar';

    var file = newFile({
      path: 'users.yml',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      var data = Data.findById('users');

      data.data.should.eql({foo: 'bar'});

      return data.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('type: create - json', () => {
    var body = '{"foo": 1}';

    var file = newFile({
      path: 'users.json',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      var data = Data.findById('users');

      data.data.should.eql({foo: 1});

      return data.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('type: create - others', () => {
    var file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    return fs.writeFile(file.source, 'text').then(() => process(file)).then(() => {
      var data = Data.findById('users');

      data.data.should.eql('text');

      return data.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('type: update', () => {
    var body = 'foo: bar';

    var file = newFile({
      path: 'users.yml',
      type: 'update'
    });

    return Promise.all([
      fs.writeFile(file.source, body),
      Data.insert({
        _id: 'users',
        data: {}
      })
    ]).then(() => process(file)).then(() => {
      var data = Data.findById('users');

      data.data.should.eql({foo: 'bar'});

      return data.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('type: delete', () => {
    var file = newFile({
      path: 'users.yml',
      type: 'delete'
    });

    return Data.insert({
      _id: 'users',
      data: {foo: 'bar'}
    }).then(() => process(file)).then(() => {
      should.not.exist(Data.findById('users'));
    });
  });
});
