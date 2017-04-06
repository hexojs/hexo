var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('Theme', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'theme_test'), {silent: true});
  var themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  it('getView()', () => {
    hexo.theme.setView('test.swig', '');

    // With extension name
    hexo.theme.getView('test.swig').should.have.property('path', 'test.swig');

    // Without extension name
    hexo.theme.getView('test').should.have.property('path', 'test.swig');

    // not exist
    should.not.exist(hexo.theme.getView('abc.swig'));

    hexo.theme.removeView('test.swig');
  });

  it('getView() - escape backslashes', () => {
    hexo.theme.setView('foo/bar.swig', '');

    hexo.theme.getView('foo\\bar.swig').should.have.property('path', 'foo/bar.swig');

    hexo.theme.removeView('foo/bar.swig');
  });

  it('setView()', () => {
    hexo.theme.setView('test.swig', '');

    var view = hexo.theme.getView('test.swig');
    view.path.should.eql('test.swig');

    hexo.theme.removeView('test.swig');
  });

  it('removeView()', () => {
    hexo.theme.setView('test.swig', '');
    hexo.theme.removeView('test.swig');

    should.not.exist(hexo.theme.getView('test.swig'));
  });
});
