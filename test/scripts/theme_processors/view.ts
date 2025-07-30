import BluebirdPromise from 'bluebird';
import chai from 'chai';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import { view } from '../../../lib/theme/processors/view';
const should = chai.should();
type ViewParams = Parameters<(typeof view)['process']>;
type ViewReturn = ReturnType<(typeof view)['process']>;

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

describe('view', () => {
  const hexo = new Hexo(join(__hexo_dirname, 'view_test'), { silent: true });
  const process: (...args: ViewParams) => BluebirdPromise<ViewReturn> = BluebirdPromise.method(view.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  hexo.env.init = true;

  function newFile(options) {
    const { path } = options;

    options.params = { path };
    options.path = 'layout/' + path;
    options.source = join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(async () => {
    await BluebirdPromise.all([mkdirs(themeDir), writeFile(hexo.config_path, 'theme: test')]);
    await hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const { pattern } = view;

    (pattern.match('layout/index.njk') as { path: string }).path.should.eql('index.njk');
    should.not.exist(pattern.match('index.njk'));
    should.not.exist(pattern.match('view/index.njk'));
  });

  it('type: create', async () => {
    const body = ['foo: bar', '---', 'test'].join('\n');

    const file = newFile({
      path: 'index.njk',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const view = hexo.theme.getView('index.njk');

    view.path.should.eql('index.njk');
    view.source.should.eql(join(themeDir, 'layout', 'index.njk'));
    view.data.should.eql({
      foo: 'bar',
      _content: 'test'
    });
    hexo.theme.removeView('index.njk');
    unlink(file.source);
  });

  it('type: delete', async () => {
    const file = newFile({
      path: 'index.njk',
      type: 'delete'
    });

    await process(file);
    should.not.exist(hexo.theme.getView('index.njk'));
  });
});
