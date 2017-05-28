var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('Save database', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var saveDatabase = Promise.method(require('../../../lib/plugins/filter/before_exit/save_database')).bind(hexo);
  var dbPath = hexo.database.options.path;

  it('default', () => {
    hexo.env.init = true;

    return saveDatabase().then(() => fs.exists(dbPath)).then(exist => {
      exist.should.be.true;
      return fs.unlink(dbPath);
    });
  });

  it('do nothing if hexo is not initialized', () => {
    hexo.env.init = false;

    return saveDatabase().then(() => fs.exists(dbPath)).then(exist => {
      exist.should.be.false;
    });
  });
});
