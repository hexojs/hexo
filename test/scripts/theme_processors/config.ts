import { spy, assert as sinonAssert } from 'sinon';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirs, rmdir, unlink, writeFile} from 'hexo-fs';
import BluebirdPromise from 'bluebird';
import Hexo from '../../../lib/hexo';
import { config } from '../../../lib/theme/processors/config';
import chai from 'chai';
const should = chai.should();
type ConfigParams = Parameters<typeof config['process']>
type ConfigReturn = ReturnType<typeof config['process']>

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

describe('config', () => {
  const hexo = new Hexo(join(__hexo_dirname, 'config_test'), {silent: true});
  const process: (...args: ConfigParams) => BluebirdPromise<ConfigReturn> = BluebirdPromise.method(config.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
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

  beforeEach(() => { hexo.theme.config = {}; });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = config.pattern;

    pattern.match('_config.yml').should.be.ok;
    pattern.match('_config.json').should.be.ok;
    should.not.exist(pattern.match('_config/foo.yml'));
    should.not.exist(pattern.match('foo.yml'));
  });

  it('type: create', async () => {
    const body = [
      'name:',
      '  first: John',
      '  last: Doe'
    ].join('\n');

    const file = newFile({
      path: '_config.yml',
      type: 'create',
      content: body
    });

    await writeFile(file.source, body);
    await process(file);
    hexo.theme.config.should.eql({
      name: {first: 'John', last: 'Doe'}
    });

    unlink(file.source);
  });

  it('type: delete', async () => {
    const file = newFile({
      path: '_config.yml',
      type: 'delete'
    });

    hexo.theme.config = {foo: 'bar'};

    await process(file);
    hexo.theme.config.should.eql({});
  });

  it('load failed', () => {
    const file = newFile({
      path: '_config.yml',
      type: 'create'
    });

    const logSpy = spy(hexo.log, 'error');

    return process(file).then(() => {
      should.fail('Return value must be rejected');
    }, () => {
      sinonAssert.calledWith(logSpy, 'Theme config load failed.');
    }).finally(() => logSpy.restore());
  });
});
