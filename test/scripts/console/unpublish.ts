import { exists, mkdirs, readFile, rmdir, unlink } from 'hexo-fs';
import { join } from 'path';
import BluebirdPromise from 'bluebird';
import { useFakeTimers, spy, SinonSpy, SinonFakeTimers } from 'sinon';
import Hexo from '../../../lib/hexo';
import publishConsole from '../../../lib/plugins/console/publish';
import unpublishConsole from '../../../lib/plugins/console/unpublish';
type OriginalParams = Parameters<typeof unpublishConsole>;
type OriginalReturn = ReturnType<typeof unpublishConsole>;

describe('unpublish', () => {
  const hexo = new Hexo(join(__dirname, 'unpublish_test'), {silent: true});
  const publish = publishConsole.bind(hexo);
  const unpublish: (...args: OriginalParams) => OriginalReturn = unpublishConsole.bind(hexo);
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

  afterEach(async () => {
    await BluebirdPromise.all([
      unlink(join(hexo.source_dir, '_posts', 'Hello-World.md')).catch(() => {}),
      unlink(join(hexo.source_dir, '_posts', 'Hello-World-1.md')).catch(() => {}),
      unlink(join(hexo.source_dir, '_drafts', 'Hello-World.md')).catch(() => {}),
      unlink(join(hexo.source_dir, '_drafts', 'Hello-World-1.md')).catch(() => {})
    ]);
  });

  beforeEach(() => post.create({
    title: 'Hello World'
  }));

  it('slug', async () => {
    const postPath = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');

    const content = [
      '---',
      'title: Hello World',
      'tags:',
      '---'
    ].join('\n') + '\n';

    await unpublish({
      _: ['Hello-World']
    });

    const exist = await exists(postPath);
    const data = await readFile(path);

    exist.should.be.false;
    data.should.eql(content);

    await unlink(path);
  });

  it('no args', async () => {
    const hexo = new Hexo(join(__dirname, 'unpublish_test'), {silent: true});
    hexo.call = spy();
    const unpublish: (...args: OriginalParams) => OriginalReturn = unpublishConsole.bind(hexo);

    await unpublish({_: []});

    (hexo.call as SinonSpy).calledOnce.should.be.true;
    (hexo.call as SinonSpy).args[0][0].should.eql('help');
    (hexo.call as SinonSpy).args[0][1]._[0].should.eql('unpublish');
  });

  it('rename if target existed', async () => {
    const path = join(hexo.source_dir, '_drafts', 'Hello-World-1.md');

    await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    await unpublish({
      _: ['Hello-World']
    });

    const exist = await exists(path);
    exist.should.be.true;

    await BluebirdPromise.all([
      unlink(path),
      unlink(join(hexo.source_dir, '_drafts', 'Hello-World.md'))
    ]);
  });

  it('replace existing target', async () => {
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');

    await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    await unpublish({
      _: ['Hello-World'],
      replace: true
    });
    const exist = await exists(join(hexo.source_dir, '_drafts', 'Hello-World-1.md'));
    exist.should.be.false;

    await unlink(path);
  });

  it('ignores layout argument', async () => {
    const postPath = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');

    await unpublish({
      _: ['photo', 'Hello-World']
    });

    const postExists = await exists(postPath);
    const draftExists = await exists(path);

    postExists.should.be.false;
    draftExists.should.be.true;

    await unlink(path);
  });

  it('replace existing target - r', async () => {
    const path = join(hexo.source_dir, '_drafts', 'Hello-World.md');

    await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    await unpublish({
      _: ['Hello-World'],
      r: true
    });
    const exist = await exists(join(hexo.source_dir, '_drafts', 'Hello-World-1.md'));
    exist.should.be.false;

    await unlink(path);
  });

  it('republishes unpublished post', async () => {
    const draftPath = join(hexo.source_dir, '_drafts', 'Hello-World.md');
    const postPath = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await unpublish({
      _: ['Hello-World']
    });
    await publish({
      _: ['Hello-World']
    });

    const draftExists = await exists(draftPath);
    const postExists = await exists(postPath);

    draftExists.should.be.false;
    postExists.should.be.true;

    await unlink(postPath);
  });
});
