const should = require('chai').should(); // eslint-disable-line
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('i18n', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'config_test'), {silent: true});
  const processor = require('../../../lib/theme/processors/i18n');
  const process = Promise.method(processor.process.bind(hexo));
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
    const path = options.path;

    options.params = {
      path
    };

    options.path = 'languages/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = processor.pattern;

    pattern.match('languages/default.yml').should.be.ok;
    pattern.match('languages/zh-TW.yml').should.be.ok;
    should.not.exist(pattern.match('default.yml'));
  });

  it('type: create', () => {
    const body = [
      'ok: OK',
      'index:',
      '  title: Home'
    ].join('\n');

    const file = newFile({
      path: 'en.yml',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const __ = hexo.theme.i18n.__('en');

      __('ok').should.eql('OK');
      __('index.title').should.eql('Home');
    }).finally(() => fs.unlink(file.source));
  });

  it('type: delete', () => {
    hexo.theme.i18n.set('en', {
      foo: 'foo',
      bar: 'bar'
    });

    const file = newFile({
      path: 'en.yml',
      type: 'delete'
    });

    return process(file).then(() => {
      hexo.theme.i18n.get('en').should.eql({});
    });
  });
});
