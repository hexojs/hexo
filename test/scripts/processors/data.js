'use strict';

var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');
var fs = require('hexo-fs');
var pathFn = require('path');

describe('data', function() {
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
      path: path
    };

    options.path = '_data/' + path;
    options.source = pathFn.join(source.base, options.path);

    return new File(options);
  }

  before(function() {
    return fs.mkdirs(baseDir).then(function() {
      return hexo.init();
    });
  });

  after(function() {
    return fs.rmdir(baseDir);
  });

  it('pattern', function() {
    var pattern = processor.pattern;

    pattern.match('_data/users.json').should.be.ok;
    pattern.match('_data/users.yaml').should.be.ok;
    should.not.exist(pattern.match('users.json'));
  });

  it('type: create - yaml', function() {
    var body = 'foo: bar';

    var file = newFile({
      path: 'users.yml',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var data = Data.findById('users');

      data.data.should.eql({foo: 'bar'});

      return data.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('type: create - json', function() {
    var body = '{"foo": 1}';

    var file = newFile({
      path: 'users.json',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var data = Data.findById('users');

      data.data.should.eql({foo: 1});

      return data.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('type: create - others', function() {
    var file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    return fs.writeFile(file.source, 'text').then(function() {
      return process(file);
    }).then(function() {
      var data = Data.findById('users');

      data.data.should.eql('text');

      return data.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('type: update', function() {
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
    ]).then(function() {
      return process(file);
    }).then(function() {
      var data = Data.findById('users');

      data.data.should.eql({foo: 'bar'});

      return data.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('type: delete', function() {
    var file = newFile({
      path: 'users.yml',
      type: 'delete'
    });

    return Data.insert({
      _id: 'users',
      data: {foo: 'bar'}
    }).then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(Data.findById('users'));
    });
  });
});
