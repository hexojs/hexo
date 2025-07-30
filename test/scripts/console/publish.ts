import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { exists, mkdirs, readFile, rmdir, unlink } from 'hexo-fs';
import moment from 'moment';
import BluebirdPromise from 'bluebird';
import { useFakeTimers, spy, SinonSpy, SinonFakeTimers } from 'sinon';
import Hexo from '../../../lib/hexo';
import publishConsole from '../../../lib/plugins/console/publish';
type OriginalParams = Parameters<typeof publishConsole>;
type OriginalReturn = ReturnType<typeof publishConsole>;

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

describe('publish', () => {
  const hexo = new Hexo(join(__hexo_dirname, 'publish_test'), {silent: true});
  const publish: (...args: OriginalParams) => OriginalReturn = publishConsole.bind(hexo);
  const post = hexo.post;
  const now = Date.now();
  let clock: SinonFakeTimers;

  before(async () => {
    clock = useFakeTimers(now);

    await mkdirs(hexo.base_dir);
    await hexo.init();
    await hexo.scaffold.set('post', [
      '---',
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n'));
    await hexo.scaffold.set('draft', [
      '---',
      'title: {{ title }}',
      'tags:',
      '---'
    ].join('\n'));
  });

  after(() => {
    clock.restore();
    return rmdir(hexo.base_dir);
  });

  beforeEach(() => post.create({
    title: 'Hello World',
    layout: 'draft'
  }));

  it('slug', async () => {
    const draftPath = join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await publish({
      _: ['Hello-World']
    });

    const exist = await exists(draftPath);
    const data = await readFile(path);

    exist.should.be.false;
    data.should.eql(content);

    await unlink(path);
  });

  it('no args', async () => {
    const hexo = new Hexo(join(__hexo_dirname, 'publish_test'), {silent: true});
    hexo.call = spy();
    const publish: (...args: OriginalParams) => OriginalReturn = publishConsole.bind(hexo);

    await publish({_: []});

    (hexo.call as SinonSpy).calledOnce.should.be.true;
    (hexo.call as SinonSpy).args[0][0].should.eql('help');
    (hexo.call as SinonSpy).args[0][1]._[0].should.eql('publish');
  });

  it('layout', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'layout: photo',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    await publish({
      _: ['photo', 'Hello-World']
    });
    const data = await readFile(path);
    data.should.eql(content);

    await unlink(path);
  });

  it('rename if target existed', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    await post.create({
      title: 'Hello World'
    });
    await publish({
      _: ['Hello-World']
    });

    const exist = await exists(path);
    exist.should.be.true;

    await BluebirdPromise.all([
      unlink(path),
      unlink(join(hexo.source_dir, '_posts', 'Hello-World.md'))
    ]);
  });

  it('replace existing target', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await post.create({
      title: 'Hello World'
    });
    await publish({
      _: ['Hello-World'],
      replace: true
    });
    const exist = await exists(join(hexo.source_dir, '_posts', 'Hello-World-1.md'));
    exist.should.be.false;

    await unlink(path);
  });
});
