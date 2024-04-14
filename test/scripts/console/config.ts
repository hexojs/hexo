import { mkdirs, readFile, rmdir, unlink, writeFile } from 'hexo-fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { stub, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import configConsole from '../../../lib/plugins/console/config';
type OriginalParams = Parameters<typeof configConsole>;
type OriginalReturn = ReturnType<typeof configConsole>;
import chai from 'chai';
const should = chai.should();

describe('config', () => {
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const config: (...args: OriginalParams) => OriginalReturn = configConsole.bind(hexo);

  before(async () => {
    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  beforeEach(() => writeFile(hexo.config_path, ''));

  after(() => rmdir(hexo.base_dir));

  it('read all config', async () => {
    const logStub = stub(console, 'log');

    try {
      await config({_: []});
    } finally {
      logStub.restore();
    }

    sinonAssert.calledWith(logStub, hexo.config);
  });

  it('read config', async () => {
    const logStub = stub(console, 'log');

    try {
      await config({_: ['title']});
    } finally {
      logStub.restore();
    }

    sinonAssert.calledWith(logStub, hexo.config.title);
  });

  it('read nested config', async () => {
    const logStub = stub(console, 'log');

    try {
      (hexo.config as any).server = {
        port: 12345
      };

      await config({_: ['server.port']});
      sinonAssert.calledWith(logStub, (hexo.config as any).server.port);
    } finally {
      // @ts-ignore
      delete hexo.config.server;
      logStub.restore();
    }
  });

  async function writeConfig(...args) {
    await config({_: args});
    const content = await readFile(hexo.config_path);
    return load(content) as any;
  }

  it('write config', async () => {
    const config = await writeConfig('title', 'My Blog');
    config.title.should.eql('My Blog');
  });

  it('write config: number', async () => {
    const config = await writeConfig('server.port', '5000');
    config.server.port.should.eql(5000);
  });

  it('write config: false', async () => {
    const config = await writeConfig('post_asset_folder', 'false');
    config.post_asset_folder.should.be.false;
  });

  it('write config: true', async () => {
    const config = await writeConfig('post_asset_folder', 'true');
    config.post_asset_folder.should.be.true;
  });

  it('write config: null', async () => {
    const config = await writeConfig('language', 'null');
    should.not.exist(config.language);
  });

  it('write config: undefined', async () => {
    const config = await writeConfig('meta_generator', 'undefined');
    should.not.exist(config.meta_generator);
  });

  it('write config: json', async () => {
    const configPath = join(hexo.base_dir, '_config.json');
    hexo.config_path = join(hexo.base_dir, '_config.json');

    await writeFile(configPath, '{}');
    await config({_: ['title', 'My Blog']});

    return readFile(configPath).then(content => {
      const json = JSON.parse(content);

      json.title.should.eql('My Blog');

      hexo.config_path = join(hexo.base_dir, '_config.yml');
      return unlink(configPath);
    });
  });

  it('create config if not exist', async () => {
    await unlink(hexo.config_path);
    const config = await writeConfig('subtitle', 'Hello world');
    config.subtitle.should.eql('Hello world');
  });
});
