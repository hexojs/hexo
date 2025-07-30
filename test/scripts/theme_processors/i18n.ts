import BluebirdPromise from 'bluebird';
import chai from 'chai';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import { i18n } from '../../../lib/theme/processors/i18n';
const should = chai.should();
type I18nParams = Parameters<typeof i18n['process']>
type I18nReturn = ReturnType<typeof i18n['process']>

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('i18n', () => {
  const hexo = new Hexo(join(__hexo_dirname, 'config_test'), {silent: true});
  const process: (...args: I18nParams) => BluebirdPromise<I18nReturn> = BluebirdPromise.method(i18n.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
    const { path } = options;

    options.params = { path };

    options.path = 'languages/' + path;
    options.source = join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(async () => {
    await BluebirdPromise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = i18n.pattern;

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
    const __ = hexo.theme.i18n.__('en' as any);

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
