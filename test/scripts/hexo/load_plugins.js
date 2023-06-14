'use strict';

const fs = require('hexo-fs');
const { join, dirname } = require('path');
const Promise = require('bluebird');

describe('Load plugins', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'plugin_test'), { silent: true });
  const loadPlugins = require('../../../dist/hexo/load_plugins');

  const script = [
    'hexo._script_test = {',
    '  filename: __filename,',
    '  dirname: __dirname,',
    '  module: module,',
    '  require: require',
    '}'
  ].join('\n');

  const asyncScript = [
    'async function afunc() {',
    '  return new Promise(resolve => resolve());',
    '}',
    'await afunc()',
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
    result.dirname.should.eql(dirname(path));
    result.module.id.should.eql(path);
    result.module.filename.should.eql(path);

    delete hexo._script_test;
  }

  function createPackageFile(name, path) {
    const pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {
        [name]: '*'
      }
    };

    path = path || join(hexo.base_dir, 'package.json');
    return fs.writeFile(path, JSON.stringify(pkg, null, '  '));
  }

  function createPackageFileWithDevDeps(name) {
    const pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {},
      devDependencies: {
        [name]: '*'
      }
    };

    return fs.writeFile(join(hexo.base_dir, 'package.json'), JSON.stringify(pkg, null, '  '));
  }

  hexo.env.init = true;
  hexo.theme_script_dir = join(hexo.base_dir, 'themes', 'test', 'scripts');

  before(() => fs.mkdir(hexo.base_dir));

  after(() => fs.rmdir(hexo.base_dir));

  afterEach(async () => {
    await createPackageFile('hexo-another-plugin');
  });

  it('load plugins', () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('load async plugins', () => {
    const name = 'hexo-async-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, asyncScript)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('load scoped plugins', () => {
    const name = '@some-scope/hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('load devDep plugins', () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFileWithDevDeps(name),
      fs.writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('load plugins in the theme\'s package.json', async () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');
    return Promise.all([
      createPackageFile(name, join(hexo.theme_dir, 'package.json')),
      fs.writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('ignore plugin whose name is started with "hexo-theme-"', async () => {
    const script = 'hexo._script_test = true';
    const name = 'hexo-theme-test_theme';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    delete hexo.config.theme;
    return fs.unlink(path);
  });

  it('ignore scoped plugin whose name is started with "hexo-theme-"', async () => {
    const script = 'hexo._script_test = true';
    const name = '@hexojs/hexo-theme-test_theme';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    delete hexo.config.theme;
    return fs.unlink(path);
  });

  it('ignore plugins whose name is not started with "hexo-"', async () => {
    const script = 'hexo._script_test = true';
    const name = 'another-plugin';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    return fs.unlink(path);
  });

  it('ignore plugins which is typescript definition', () => {
    const script = 'hexo._script_test = true';
    const name = '@types/hexo-test-plugin';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      fs.writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      should.not.exist(hexo._script_test);
      return fs.unlink(path);
    });
  });

  it('ignore plugins which are in package.json but not exist actually', () => createPackageFile('hexo-plugin-test').then(() => loadPlugins(hexo)));

  it('load scripts', async () => {
    const path = join(hexo.script_dir, 'test.js');

    fs.writeFile(path, script);
    await loadPlugins(hexo);

    validate(path);
    return fs.unlink(path);
  });

  it('load theme scripts', () => {
    const path = join(hexo.theme_script_dir, 'test.js');

    return fs.writeFile(path, script).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return fs.unlink(path);
    });
  });

  it('don\'t load plugins in safe mode', () => {
    const script = 'hexo._script_test = true';
    const path = join(hexo.script_dir, 'test.js');

    return fs.writeFile(path, script).then(() => {
      hexo.env.safe = true;
      return loadPlugins(hexo);
    }).then(() => {
      hexo.env.safe = false;
      should.not.exist(hexo._script_test);
      return fs.unlink(path);
    });
  });

  // Issue #4251
  it('load scripts with sourcemap EOF', async () => {
    const path = join(hexo.script_dir, 'test.js');

    const script = [
      '(() => {',
      '  hexo._script_test = true;',
      '})();',
      '//# sourceMappingURL=data:application/json;<redacted>'
    ].join('\n');

    fs.writeFile(path, script);
    await loadPlugins(hexo);

    hexo._script_test.should.eql(true);
    return fs.unlink(path);
  });
});
