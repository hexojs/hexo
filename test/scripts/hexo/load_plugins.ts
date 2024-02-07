import { join, dirname } from 'path';
import { writeFile, mkdir, rmdir, unlink } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import loadPlugins from '../../../lib/hexo/load_plugins';
// @ts-ignore
import Promise from 'bluebird';
import chai from 'chai';
const should = chai.should();

describe('Load plugins', () => {
  const hexo = new Hexo(join(__dirname, 'plugin_test'), { silent: true }) as any;

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

  function createPackageFile(name, path?) {
    const pkg = {
      name: 'hexo-site',
      version: '0.0.0',
      private: true,
      dependencies: {
        [name]: '*'
      }
    };

    path = path || join(hexo.base_dir, 'package.json');
    return writeFile(path, JSON.stringify(pkg, null, '  '));
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

    return writeFile(join(hexo.base_dir, 'package.json'), JSON.stringify(pkg, null, '  '));
  }

  hexo.env.init = true;
  hexo.theme_script_dir = join(hexo.base_dir, 'themes', 'test', 'scripts');

  before(() => mkdir(hexo.base_dir));

  after(() => rmdir(hexo.base_dir));

  afterEach(async () => {
    await createPackageFile('hexo-another-plugin');
  });

  it('load plugins', () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('load async plugins', () => {
    const name = 'hexo-async-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      writeFile(path, asyncScript)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('load scoped plugins', () => {
    const name = '@some-scope/hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('load devDep plugins', () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFileWithDevDeps(name),
      writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('load plugins in the theme\'s package.json', async () => {
    const name = 'hexo-plugin-test';
    const path = join(hexo.plugin_dir, name, 'index.js');
    return Promise.all([
      createPackageFile(name, join(hexo.theme_dir, 'package.json')),
      writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('ignore plugin whose name is started with "hexo-theme-"', async () => {
    const script = 'hexo._script_test = true';
    const name = 'hexo-theme-test_theme';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    delete hexo.config.theme;
    return unlink(path);
  });

  it('ignore scoped plugin whose name is started with "hexo-theme-"', async () => {
    const script = 'hexo._script_test = true';
    const name = '@hexojs/hexo-theme-test_theme';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    delete hexo.config.theme;
    return unlink(path);
  });

  it('ignore plugins whose name is not started with "hexo-"', async () => {
    const script = 'hexo._script_test = true';
    const name = 'another-plugin';
    const path = join(hexo.plugin_dir, name, 'index.js');

    await Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]);
    await loadPlugins(hexo);

    should.not.exist(hexo._script_test);
    return unlink(path);
  });

  it('ignore plugins which is typescript definition', () => {
    const script = 'hexo._script_test = true';
    const name = '@types/hexo-test-plugin';
    const path = join(hexo.plugin_dir, name, 'index.js');

    return Promise.all([
      createPackageFile(name),
      writeFile(path, script)
    ]).then(() => loadPlugins(hexo)).then(() => {
      should.not.exist(hexo._script_test);
      return unlink(path);
    });
  });

  it('ignore plugins which are in package.json but not exist actually', () => createPackageFile('hexo-plugin-test').then(() => loadPlugins(hexo)));

  it('load scripts', async () => {
    const path = join(hexo.script_dir, 'test.js');

    writeFile(path, script);
    await loadPlugins(hexo);

    validate(path);
    return unlink(path);
  });

  it('load theme scripts', () => {
    const path = join(hexo.theme_script_dir, 'test.js');

    return writeFile(path, script).then(() => loadPlugins(hexo)).then(() => {
      validate(path);
      return unlink(path);
    });
  });

  it('don\'t load plugins in safe mode', () => {
    const script = 'hexo._script_test = true';
    const path = join(hexo.script_dir, 'test.js');

    return writeFile(path, script).then(() => {
      hexo.env.safe = true;
      return loadPlugins(hexo);
    }).then(() => {
      hexo.env.safe = false;
      should.not.exist(hexo._script_test);
      return unlink(path);
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

    writeFile(path, script);
    await loadPlugins(hexo);

    hexo._script_test.should.eql(true);
    return unlink(path);
  });
});
