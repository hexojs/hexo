var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');

describe('clean', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var clean = require('../../../lib/plugins/console/clean').bind(hexo);

  it('delete database', () => {
    var dbPath = hexo.database.options.path;

    return fs.writeFile(dbPath, '').then(() => clean()).then(() => fs.exists(dbPath)).then(exist => {
      exist.should.be.false;
    });
  });

  it('delete public folder', () => {
    var publicDir = hexo.public_dir;

    return fs.mkdirs(publicDir).then(() => clean()).then(() => fs.exists(publicDir)).then(exist => {
      exist.should.be.false;
    });
  });
});
