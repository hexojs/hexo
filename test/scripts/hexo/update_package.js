var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');

describe('Update package.json', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var updatePkg = require('../../../lib/hexo/update_package');
  var packagePath = pathFn.join(hexo.base_dir, 'package.json');

  beforeEach(() => {
    hexo.env.init = false;
  });

  it('package.json does not exist', () => updatePkg(hexo).then(() => {
    hexo.env.init.should.be.false;
  }));

  it('package.json exists, but the version doesn\'t match', () => {
    var pkg = {
      hexo: {
        version: '0.0.1'
      }
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(() => updatePkg(hexo)).then(() => fs.readFile(packagePath)).then(content => {
      JSON.parse(content).hexo.version.should.eql(hexo.version);
      hexo.env.init.should.be.true;

      return fs.unlink(packagePath);
    });
  });

  it('package.json exists, but don\'t have hexo data', () => {
    var pkg = {
      name: 'hexo',
      version: '0.0.1'
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(() => updatePkg(hexo)).then(() => fs.readFile(packagePath)).then(content => {
      // Don't change the original package.json
      JSON.parse(content).should.eql(pkg);
      hexo.env.init.should.be.false;

      return fs.unlink(packagePath);
    });
  });

  it('package.json exists and everything is ok', () => {
    var pkg = {
      hexo: {
        version: hexo.version
      }
    };

    return fs.writeFile(packagePath, JSON.stringify(pkg)).then(() => updatePkg(hexo)).then(() => fs.readFile(packagePath)).then(content => {
      JSON.parse(content).should.eql(pkg);
      hexo.env.init.should.be.true;

      return fs.unlink(packagePath);
    });
  });
});
