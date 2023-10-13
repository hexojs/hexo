'use strict';

const { mkdirs, readFile, rmdir, unlink, writeFile } = require('hexo-fs');
const { join } = require('path');
const { load } = require('js-yaml');
const { stub, assert: sinonAssert } = require('sinon');

describe('config', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const config = require('../../../dist/plugins/console/config').bind(hexo);

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
      hexo.config.server = {
        port: 12345
      };

      await config({_: ['server.port']});
      sinonAssert.calledWith(logStub, hexo.config.server.port);
    } finally {
      delete hexo.config.server;
      logStub.restore();
    }
  });

  async function writeConfig(...args) {
    await config({_: args});
    const content = await readFile(hexo.config_path);
    return load(content);
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
