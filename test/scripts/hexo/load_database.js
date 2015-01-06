var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Load database', function(){
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
        {_id: "A"},
        {_id: "B"},
        {_id: "C"}
      ]
    }
  };

  before(function(){
    return fs.mkdir(hexo.base_dir);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('database does not exist', function(){
    return loadDatabase(hexo);
  });

  it('database load success', function(){
    return fs.writeFile(dbPath, JSON.stringify(fixture)).then(function(){
      return loadDatabase(hexo);
    }).then(function(){
      hexo.model('Test').toArray({lean: true}).should.eql(fixture.models.Test);
      hexo.model('Test').destroy();
      return fs.unlink(dbPath);
    });
  });

  it('database load failed', function(){
    return fs.writeFile(dbPath, '{1423432: 324').then(function(){
      return loadDatabase(hexo);
    }).then(function(){
      return fs.exists(dbPath);
    }).then(function(exist){
      exist.should.be.false;
    });
  });
});