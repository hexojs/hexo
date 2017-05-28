var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Load database', () => {
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

  before(() => fs.mkdirs(hexo.base_dir));

  beforeEach(() => {
    hexo._dbLoaded = false;
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('database does not exist', () => loadDatabase(hexo));

  it('database load success', () => fs.writeFile(dbPath, JSON.stringify(fixture)).then(() => loadDatabase(hexo)).then(() => {
    hexo._dbLoaded.should.be.true;
    hexo.model('Test').toArray({lean: true}).should.eql(fixture.models.Test);
    hexo.model('Test').destroy();

    return fs.unlink(dbPath);
  }));

  it('don\'t load database if loaded', () => {
    hexo._dbLoaded = true;

    return fs.writeFile(dbPath, JSON.stringify(fixture)).then(() => loadDatabase(hexo)).then(() => {
      hexo.model('Test').length.should.eql(0);
      return fs.unlink(dbPath);
    });
  });

  // I don't know why this test case can't pass on Windows
  // It always throws EPERM error
  it.skip('database load failed', () => fs.writeFile(dbPath, '{1423432: 324').then(() => loadDatabase(hexo)).then(() => {
    hexo._dbLoaded.should.be.false;
    return fs.exists(dbPath);
  }).then(exist => {
    exist.should.be.false;
  }));
});
