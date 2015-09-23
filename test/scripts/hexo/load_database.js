'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Load database', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'db_test'), {silent: true});
  var loadDatabase = require('../../../lib/hexo/load_database');
  var dbPath = hexo.database.options.path;

  var fixture = {
    meta: {
      version: 1,
      warehouse: require('warehouse').version
    },
    models: {
      Test: [
        {_id: 'A'},
        {_id: 'B'},
        {_id: 'C'}
      ]
    }
  };

  before(function() {
    return fs.mkdirs(hexo.base_dir);
  });

  beforeEach(function() {
    hexo._dbLoaded = false;
  });

  after(function() {
    return fs.rmdir(hexo.base_dir);
  });

  it('database does not exist', function() {
    return loadDatabase(hexo);
  });

  it('database load success', function() {
    return fs.writeFile(dbPath, JSON.stringify(fixture)).then(function() {
      return loadDatabase(hexo);
    }).then(function() {
      hexo._dbLoaded.should.be.true;
      hexo.model('Test').toArray({lean: true}).should.eql(fixture.models.Test);
      hexo.model('Test').destroy();

      return fs.unlink(dbPath);
    });
  });

  it('don\'t load database if loaded', function() {
    hexo._dbLoaded = true;

    return fs.writeFile(dbPath, JSON.stringify(fixture)).then(function() {
      return loadDatabase(hexo);
    }).then(function() {
      hexo.model('Test').length.should.eql(0);
      return fs.unlink(dbPath);
    });
  });

  // I don't know why this test case can't pass on Windows
  // It always throws EPERM error
  it.skip('database load failed', function() {
    return fs.writeFile(dbPath, '{1423432: 324').then(function() {
      return loadDatabase(hexo);
    }).then(function() {
      hexo._dbLoaded.should.be.false;
      return fs.exists(dbPath);
    }).then(function(exist) {
      exist.should.be.false;
    });
  });
});
