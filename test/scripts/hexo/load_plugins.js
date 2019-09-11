'use strict';

const fs = require('hexo-fs');
const pathFn = require('path');
const Promise = require('bluebird');

describe('Load plugins', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'plugin_test'), {
    silent: true
  });
  const loadPlugins = require('../../../lib/hexo/load_plugins');

  const script = [
    'hexo._script_test = {',
    '  filename: __filename,',
    '  dirname: __dirname,',
    '  module: module,',
    '  require: require',
    '}'
  ].join('\n');

  function validate(path) {
    const result = hexo._script_test;

    result.filename.should.eql(path);
    result.dirname.should.eql(pathFn.dirname(path));
    result.module.id.should.eql(path);
    result.module.filename.should.eql(path);

    delete hexo._script_test;
  }

  function createPackageFile(...args) {
    const pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {}
    };

    for (let i = 0, len = args.length; i < len; i++) {
      pkg.dependencies[args[i]] = '*';
    }

    return fs.writeFile(
      pathFn.join(hexo.base_dir, 'package.json'),
      JSON.stringify(pkg, null, '  ')
    );
  }

  function createPackageFileWithDevDeps(...args) {
    const pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {},
      devDependencies: {}
    };

    for (let i = 0, len = args.length; i < len; i++) {
      pkg.devDependencies[args[i]] = '*';
    }

    return fs.writeFile(
      pathFn.join(hexo.base_dir, 'package.json'),
      JSON.stringify(pkg, null, '  ')
    );
  }

  hexo.env.init = true;
  hexo.theme_script_dir = pathFn.join(
    hexo.base_dir,
    'themes',
    'test',
    'scripts'
  );

  before(() => fs.mkdir(hexo.base_dir));

  after(() => fs.rmdir(hexo.base_dir));

  it('load plugins', () => {
    const name = 'hexo-plugin-test';
    const path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([createPackageFile(name), fs.writeFile(path, script)])
      .then(() => loadPlugins(hexo))
      .then(() => {
        validate(path);
        return fs.unlink(path);
      });
  });

  it('load scoped plugins', () => {
    const name = '@some-scope/hexo-plugin-test';
    const path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([createPackageFile(name), fs.writeFile(path, script)])
      .then(() => loadPlugins(hexo))
      .then(() => {
        validate(path);
        return fs.unlink(path);
      });
  });

  it('load devDep plugins', () => {
    const name = 'hexo-plugin-test';
    const path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFileWithDevDeps(name),
      fs.writeFile(path, script)
    ])
      .then(() => loadPlugins(hexo))
      .then(() => {
        validate(path);
        return fs.unlink(path);
      });
  });

  it('specify plugin list in config', () => {
    const names = ['hexo-plugin-test', 'another-plugin'];
    const paths = names.map(name =>
      pathFn.join(hexo.plugin_dir, name, 'index.js')
    );

    return Promise.all([
      createPackageFile(...names),
      fs.writeFile(paths[0], 'hexo._script_test0 = true'),
      fs.writeFile(paths[1], 'hexo._script_test1 = true')
    ])
      .then(() => {
        hexo.config.plugins = [names[1]];
        return loadPlugins(hexo);
      })
      .then(() => {
        should.not.exist(hexo._script_test0);
        hexo._script_test1.should.be.true;

        delete hexo.config.plugins;
        delete hexo._script_test1;

        return Promise.map(paths, path => fs.unlink(path));
      });
  });

  it('ignore plugins whose name is not started with "hexo-"', () => {
    const script = 'hexo._script_test = true';
    const name = 'another-plugin';
    const path = pathFn.join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([createPackageFile(name), fs.writeFile(path, script)])
      .then(() => loadPlugins(hexo))
      .then(() => {
        should.not.exist(hexo._script_test);
        return fs.unlink(path);
      });
  });

  it('ignore plugins which are in package.json but not exist actually', () =>
    createPackageFile('hexo-plugin-test').then(() => loadPlugins(hexo)));

  it('load scripts', () => {
    const path = pathFn.join(hexo.script_dir, 'test.js');

    return fs
      .writeFile(path, script)
      .then(() => loadPlugins(hexo))
      .then(() => {
        validate(path);
        return fs.unlink(path);
      });
  });

  it('load theme scripts', () => {
    const path = pathFn.join(hexo.theme_script_dir, 'test.js');

    return fs
      .writeFile(path, script)
      .then(() => loadPlugins(hexo))
      .then(() => {
        validate(path);
        return fs.unlink(path);
      });
  });

  it("don't load plugins in safe mode", () => {
    const script = 'hexo._script_test = true';
    const path = pathFn.join(hexo.script_dir, 'test.js');

    return fs
      .writeFile(path, script)
      .then(() => {
        hexo.env.safe = true;
        return loadPlugins(hexo);
      })
      .then(() => {
        hexo.env.safe = false;
        should.not.exist(hexo._script_test);
        return fs.unlink(path);
      });
  });
});
