import { join, sep, resolve } from 'path';
import { writeFile, unlink, mkdirs, rmdir } from 'hexo-fs';
import { makeRe } from 'micromatch';
import loadConfig from '../../../lib/hexo/load_config';
import defaultConfig from '../../../lib/hexo/default_config';
import Hexo from '../../../lib/hexo';

describe('Load config', () => {
  const hexo = new Hexo(join(__dirname, 'config_test'), { silent: true });
  hexo.env.init = true;

  before(() => mkdirs(hexo.base_dir).then(() => hexo.init()));

  after(() => rmdir(hexo.base_dir));

  beforeEach(() => {
    hexo.config_path = join(hexo.base_dir, '_config.yml');
    hexo.config = JSON.parse(JSON.stringify(defaultConfig));
  });

  it('config file does not exist', async () => {
    await loadConfig(hexo);
    hexo.config.should.eql(defaultConfig);
  });

  it('_config.yml exists', async () => {
    const configPath = join(hexo.base_dir, '_config.yml');

    try {
      await writeFile(configPath, 'foo: 1');
      await loadConfig(hexo);
      hexo.config.foo.should.eql(1);
    } finally {
      await unlink(configPath);
    }
  });

  it('_config.json exists', async () => {
    const configPath = join(hexo.base_dir, '_config.json');

    try {
      await writeFile(configPath, '{"baz": 3}');
      await loadConfig(hexo);
      hexo.config.baz.should.eql(3);
      hexo.config_path.should.eql(configPath);
    } finally {
      await unlink(configPath);
    }
  });

  it('_config.txt exists', async () => {
    const configPath = join(hexo.base_dir, '_config.txt');

    try {
      await writeFile(configPath, 'foo: 1');
      await loadConfig(hexo);
      hexo.config.should.eql(defaultConfig);
      hexo.config_path.should.not.eql(configPath);
    } finally {
      await unlink(configPath);
    }
  });

  it('custom config path', async () => {
    const configPath = join(__dirname, 'werwerwer.yml');
    hexo.config_path = join(__dirname, 'werwerwer.yml');

    try {
      await writeFile(configPath, 'foo: 1');
      await loadConfig(hexo);
      hexo.config.foo.should.eql(1);
    } finally {
      hexo.config_path = join(hexo.base_dir, '_config.yml');
      await unlink(configPath);
    }
  });

  it('custom config path with different extension name', async () => {
    const realPath = join(__dirname, 'werwerwer.json');
    hexo.config_path = join(__dirname, 'werwerwer.yml');

    try {
      await writeFile(realPath, '{"foo": 2}');
      await loadConfig(hexo);
      hexo.config.foo.should.eql(2);
      hexo.config_path.should.eql(realPath);
    } finally {
      hexo.config_path = join(hexo.base_dir, '_config.yml');
      await unlink(realPath);
    }
  });

  it('handle trailing "/" of url', async () => {
    const content = [
      'root: foo',
      'url: https://hexo.io/'
    ].join('\n');

    try {
      await writeFile(hexo.config_path, content);
      await loadConfig(hexo);
      hexo.config.root.should.eql('foo/');
      hexo.config.url.should.eql('https://hexo.io');
    } finally {
      await unlink(hexo.config_path);
    }
  });

  it('handle root is not exist', async () => {
    try {
      const content = 'url: https://hexo.io/';
      await writeFile(hexo.config_path, content);
      await loadConfig(hexo);
      hexo.config.url.should.eql('https://hexo.io');
      hexo.config.root.should.eql('/');
    } finally {
      await unlink(hexo.config_path);
    }
    try {
      const content = 'url: https://hexo.io/foo/';
      await writeFile(hexo.config_path, content);
      await loadConfig(hexo);
      hexo.config.url.should.eql('https://hexo.io/foo');
      hexo.config.root.should.eql('/foo/');
    } finally {
      await unlink(hexo.config_path);
    }
  });

  it('custom public_dir', async () => {
    try {
      await writeFile(hexo.config_path, 'public_dir: foo');
      await loadConfig(hexo);
      hexo.public_dir.should.eql(resolve(hexo.base_dir, 'foo') + sep);
    } finally {
      await unlink(hexo.config_path);
    }
  });

  it('custom source_dir', async () => {
    try {
      await writeFile(hexo.config_path, 'source_dir: bar');
      await loadConfig(hexo);
      hexo.source_dir.should.eql(resolve(hexo.base_dir, 'bar') + sep);
    } finally {
      await unlink(hexo.config_path);
    }
  });

  it('custom theme - default theme_dir', async () => {
    try {
      await writeFile(hexo.config_path, 'theme: test');
      await loadConfig(hexo);
      hexo.config.theme.should.eql('test');
      hexo.theme_dir.should.eql(join(hexo.base_dir, 'themes', 'landscape') + sep);
      hexo.theme_script_dir.should.eql(join(hexo.theme_dir, 'scripts') + sep);
      hexo.theme.base.should.eql(hexo.theme_dir);
    } finally {
      await unlink(hexo.config_path);
    }
  });

  it('custom theme - base_dir/themes/[theme]', async () => {
    try {
      await writeFile(hexo.config_path, 'theme: test');
      await mkdirs(join(hexo.base_dir, 'themes', 'test'));
      await loadConfig(hexo);
      hexo.config.theme.should.eql('test');
      hexo.theme_dir.should.eql(join(hexo.base_dir, 'themes', 'test') + sep);
      hexo.theme_script_dir.should.eql(join(hexo.theme_dir, 'scripts') + sep);
      hexo.theme.base.should.eql(hexo.theme_dir);
      const ignore = ['**/themes/*/node_modules/**', '**/themes/*/.git/**'];
      hexo.theme.ignore.should.eql(ignore);
      hexo.theme.options.ignored.should.eql(ignore.map(item => makeRe(item)));
    } finally {
      await rmdir(join(hexo.base_dir, 'themes', 'test'));
      await unlink(hexo.config_path);
    }
  });

  it('custom theme - base_dir/node_modules/hexo-theme-[theme]', async () => {
    try {
      await writeFile(hexo.config_path, 'theme: test');
      await mkdirs(join(hexo.plugin_dir, 'hexo-theme-test'));
      await loadConfig(hexo);
      hexo.config.theme.should.eql('test');
      hexo.theme_dir.should.eql(join(hexo.plugin_dir, 'hexo-theme-test') + sep);
      hexo.theme_script_dir.should.eql(join(hexo.theme_dir, 'scripts') + sep);
      hexo.theme.base.should.eql(hexo.theme_dir);
      const ignore = ['**/node_modules/hexo-theme-*/node_modules/**', '**/node_modules/hexo-theme-*/.git/**'];
      hexo.theme.ignore.should.eql(ignore);
      hexo.theme.options.ignored.should.eql(ignore.map(item => makeRe(item)));
    } finally {
      await rmdir(join(hexo.plugin_dir, 'hexo-theme-test'));
      await unlink(hexo.config_path);
    }
  });

  it('merge config', async () => {
    const content = [
      'highlight:',
      '  tab_replace: yoooo'
    ].join('\n');

    try {
      await writeFile(hexo.config_path, content);
      await loadConfig(hexo);
      hexo.config.highlight.line_number.should.be.true;
      hexo.config.highlight.tab_replace.should.eql('yoooo');
    } finally {
      await unlink(hexo.config_path);
    }
  });
});
