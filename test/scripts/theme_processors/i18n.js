'use strict';

const { join } = require('path');
const { mkdirs, rmdir, unlink, writeFile } = require('hexo-fs');
const Promise = require('bluebird');

describe('i18n', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const processor = require('../../../dist/theme/processors/i18n');
  const process = Promise.method(processor.i18n.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
    const { path } = options;

    options.params = { path };

    options.path = 'languages/' + path;
    options.source = join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = processor.i18n.pattern;

    pattern.match('languages/default.yml').should.be.ok;
    pattern.match('languages/zh-TW.yml').should.be.ok;
    should.not.exist(pattern.match('default.yml'));
  });

  it('type: create', async () => {
    const body = [
      'ok: OK',
      'index:',
      '  title: Home'
    ].join('\n');

    const file = newFile({
      path: 'en.yml',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const __ = hexo.theme.i18n.__('en');

    __('ok').should.eql('OK');
    __('index.title').should.eql('Home');
    unlink(file.source);
  });

  it('type: delete', async () => {
    hexo.theme.i18n.set('en', {
      foo: 'foo',
      bar: 'bar'
    });

    const file = newFile({
      path: 'en.yml',
      type: 'delete'
    });

    await process(file);
    hexo.theme.i18n.get('en').should.eql({});
  });
});
