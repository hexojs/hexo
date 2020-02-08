'use strict';

const { mkdirs, readFile, rmdir, unlink, writeFile } = require('hexo-fs');
const { join } = require('path');
const { load } = require('js-yaml');
const rewire = require('rewire');
const sinon = require('sinon');

describe('config', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const config = require('../../../lib/plugins/console/config').bind(hexo);
  const configModule = rewire('../../../lib/plugins/console/config');

  before(async () => {
    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  beforeEach(() => writeFile(hexo.config_path, ''));

  after(() => rmdir(hexo.base_dir));

  it('read all config', async () => {
    const spy = sinon.spy();

    await configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: []}));

    spy.args[0][0].should.eql(hexo.config);
  });

  it('read config', async () => {
    const spy = sinon.spy();

    await configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: ['title']}));

    spy.args[0][0].should.eql(hexo.config.title);
  });

  it('read nested config', () => {
    const spy = sinon.spy();

    hexo.config.server = {
      port: 12345
    };

    return configModule.__with__({
      console: {
        log: spy
      }
    })(() => configModule.call(hexo, {_: ['server.port']})).then(() => {
      spy.args[0][0].should.eql(hexo.config.server.port);
    }).finally(() => {
      delete hexo.config.server;
    });
  });

  async function writeConfig() {
    const args = Array.from(arguments);

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
    config.post_asset_folder.should.to.be.false;
  });

  it('write config: true', async () => {
    const config = await writeConfig('post_asset_folder', 'true');
    config.post_asset_folder.should.to.be.true;
  });

  it('write config: null', async () => {
    const config = await writeConfig('language', 'null');
    should.not.exist(config.language);
  });

  it('write config: undefined', async () => {
    const config = await writeConfig('meta_generator', 'undefined');
    should.not.exist(config.meta_generator);
  });

  it('write config: regex', async () => {
    const config = await writeConfig('include', /^pattern$/gim);
    config.include.should.eql(/^pattern$/gim);
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
