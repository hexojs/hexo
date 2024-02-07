import { join } from 'path';
import { mkdirs, unlink, writeFile, rmdir } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();

describe('Load alternate theme config', () => {
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const loadThemeConfig = require('../../../lib/hexo/load_theme_config');

  hexo.env.init = true;

  before(() => mkdirs(hexo.base_dir).then(() => hexo.init()));

  after(() => rmdir(hexo.base_dir));

  beforeEach(() => {
    hexo.config.theme_config = { foo: { bar: 'ahhhhhh' } };
    hexo.config.theme = 'test_theme';
  });

  it('hexo.config.theme does not exist', async () => {
    // @ts-ignore
    hexo.config.theme = undefined;
    await loadThemeConfig(hexo);
    hexo.config.theme_config.foo.bar.should.eql('ahhhhhh');
    hexo.config.theme_config = {};
  });

  it('_config.[theme].yml does not exist', () => loadThemeConfig(hexo).then(() => {
    hexo.config.theme_config = {};
  }));

  it('_config.[theme].yml exists', () => {
    const configPath = join(hexo.base_dir, '_config.test_theme.yml');

    return writeFile(configPath, 'bar: 1').then(() => loadThemeConfig(hexo)).then(() => {
      hexo.config.theme_config.bar.should.eql(1);
    }).finally(() => unlink(configPath));
  });

  it('_config.[theme].json exists', () => {
    const configPath = join(hexo.base_dir, '_config.test_theme.json');

    return writeFile(configPath, '{"baz": 3}').then(() => loadThemeConfig(hexo)).then(() => {
      hexo.config.theme_config.baz.should.eql(3);
    }).finally(() => unlink(configPath));
  });

  it('_config.[theme].txt exists', () => {
    const configPath = join(hexo.base_dir, '_config.test_theme.txt');

    return writeFile(configPath, 'qux: 1').then(() => loadThemeConfig(hexo)).then(() => {
      should.not.exist(hexo.config.theme_config.qux);
    }).finally(() => unlink(configPath));
  });

  it('merge config', () => {
    const configPath = join(hexo.base_dir, '_config.test_theme.yml');

    const content = [
      'foo:',
      '  bar: yoooo',
      '  baz: true'
    ].join('\n');

    return writeFile(configPath, content).then(() => loadThemeConfig(hexo)).then(() => {
      hexo.config.theme_config.foo.baz.should.eql(true);
      hexo.config.theme_config.foo.bar.should.eql('ahhhhhh');
      hexo.config.theme_config.foo.bar.should.not.eql('yoooo');
    }).finally(() => unlink(configPath));
  });

  it('hexo.config.theme_config does not exist', async () => {
    const configPath = join(hexo.base_dir, '_config.test_theme.yml');

    hexo.config.theme_config = undefined;

    const content = [
      'foo:',
      '  bar: yoooo',
      '  baz: true'
    ].join('\n');

    await writeFile(configPath, content);
    await loadThemeConfig(hexo);

    hexo.config.theme_config.foo.baz.should.eql(true);
    hexo.config.theme_config.foo.bar.should.eql('yoooo');
  });
});
