import { join } from 'path';
import moment from 'moment';
import { readFile, mkdirs, unlink, rmdir, writeFile, exists, stat, listDir } from 'hexo-fs';
import { spy, useFakeTimers } from 'sinon';
import { parse as yfm } from 'hexo-front-matter';
import { expected, content, expected_disable_nunjucks, content_for_issue_3346, expected_for_issue_3346, content_for_issue_4460 } from '../../fixtures/post_render';
import { highlight, deepMerge } from 'hexo-util';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();
const escapeSwigTag = str => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

describe('Post', () => {
  const hexo = new Hexo(join(__dirname, 'post_test'));
  require('../../../lib/plugins/highlight/')(hexo);
  const { post } = hexo;
  const now = Date.now();
  let clock;
  let defaultCfg = {};

  before(async () => {
    clock = useFakeTimers(now);

    await mkdirs(hexo.base_dir);
    await hexo.init();

    // Load marked renderer for testing
    await hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
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

    defaultCfg = JSON.parse(JSON.stringify(hexo.config));
  });

  after(() => {
    clock.restore();
    return rmdir(hexo.base_dir);
  });

  afterEach(() => {
    hexo.config = JSON.parse(JSON.stringify(defaultCfg));
  });

  it('create()', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);
    const listener = spy();

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    hexo.once('new', listener);

    const result = await post.create({
      title: 'Hello World'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);
    listener.calledOnce.should.be.true;

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - slug', async () => {
    const path = join(hexo.source_dir, '_posts', 'foo.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    const result = await post.create({
      title: 'Hello World',
      slug: 'foo'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - filename_case', async () => {
    hexo.config.filename_case = 1;

    const path = join(hexo.source_dir, '_posts', 'hello-world.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    const result = await post.create({
      title: 'Hello World'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - layout', async () => {
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

    const result = await post.create({
      title: 'Hello World',
      layout: 'photo'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - extra data', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'foo: bar',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    const result = await post.create({
      title: 'Hello World',
      foo: 'bar'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - rename if target existed', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    await post.create({
      title: 'Hello World'
    });
    const result = await post.create({
      title: 'Hello World'
    });
    result.path.should.eql(path);
    const exist = await exists(path);
    exist.should.be.true;

    await Promise.all([
      unlink(path),
      unlink(join(hexo.source_dir, '_posts', 'Hello-World.md'))
    ]);
  });

  it('create() - replace existing files', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await post.create({
      title: 'Hello World'
    });
    const result = await post.create({
      title: 'Hello World'
    }, true);
    result.path.should.eql(path);
    await unlink(path);
  });

  it('create() - asset folder', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World');

    hexo.config.post_asset_folder = true;

    await post.create({
      title: 'Hello World'
    });
    const stats = await stat(path);
    stats.isDirectory().should.be.true;
    await unlink(path + '.md');
  });

  it('create() - page', async () => {
    const path = join(hexo.source_dir, 'Hello-World/index.md');
    hexo.config.post_asset_folder = true;
    const result = await post.create({
      title: 'Hello World',
      layout: 'page'
    });
    result.path.should.eql(path);

    try {
      await stat(join(hexo.source_dir, 'Hello-World/index'));
      should.fail();
    } catch (err) {
      err.code.should.eql('ENOENT');
    } finally {
      await unlink(path);
    }
  });

  it('create() - follow the separator style in the scaffold', async () => {
    const scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    await hexo.scaffold.set('test', scaffold);
    const result = await post.create({
      title: 'Hello World',
      layout: 'test'
    });
    result.content.should.eql([
      '---',
      'title: Hello World',
      '---'
    ].join('\n') + '\n');

    await Promise.all([
      unlink(result.path),
      hexo.scaffold.remove('test')
    ]);
  });

  // #4511
  it('create() - avoid quote if unnecessary', async () => {
    const scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    await hexo.scaffold.set('test', scaffold);
    const result = await post.create({
      title: 'Hello World',
      layout: 'test'
    });

    const data = await readFile(result.path);
    data.should.eql([
      '---',
      'title: Hello World',
      '---'
    ].join('\n') + '\n');

    await Promise.all([
      unlink(result.path),
      hexo.scaffold.remove('test')
    ]);
  });

  // #4511
  it('create() - wrap with quote when necessary', async () => {
    const scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    await hexo.scaffold.set('test', scaffold);
    const result = await post.create({
      title: 'Hello: World',
      layout: 'test'
    });

    const data = await readFile(result.path);
    data.should.eql([
      '---',
      'title: \'Hello: World\'',
      '---'
    ].join('\n') + '\n');

    await Promise.all([
      unlink(result.path),
      hexo.scaffold.remove('test')
    ]);
  });

  // #4511
  it('create() - wrap with quote when necessary - yaml tag', async () => {
    const scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    await hexo.scaffold.set('test', scaffold);
    const result = await post.create({
      // https://github.com/nodeca/js-yaml#supported-yaml-types
      title: '!!js/regexp /pattern/gim',
      layout: 'test'
    });

    const data = await readFile(result.path);
    data.should.eql([
      '---',
      'title: \'!!js/regexp /pattern/gim\'',
      '---'
    ].join('\n') + '\n');

    await Promise.all([
      unlink(result.path),
      hexo.scaffold.remove('test')
    ]);
  });

  it('create() - JSON front-matter', async () => {
    const scaffold = [
      '"title": {{ title }}',
      ';;;'
    ].join('\n');

    await hexo.scaffold.set('test', scaffold);
    const result = await post.create({
      title: 'Hello World',
      layout: 'test',
      lang: 'en'
    });
    result.content.should.eql([
      '"title": "Hello World",',
      '"lang": "en"',
      ';;;'
    ].join('\n') + '\n');

    await Promise.all([
      unlink(result.path),
      hexo.scaffold.remove('test')
    ]);
  });

  // #1100
  it('create() - non-string title', async () => {
    const path = join(hexo.source_dir, '_posts', '12345.md');

    const result = await post.create({
      title: 12345
    });
    result.path.should.eql(path);
    await unlink(path);
  });

  it('create() - escape title', async () => {
    const data = await post.create({
      title: 'Foo: Bar'
    });
    data.content.should.eql([
      // js-yaml use single-quotation for dumping since 3.3
      '---',
      'title: \'Foo: Bar\'',
      'date: ' + moment(now).format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n');
    await unlink(data.path);
  });

  it('create() - with content', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---',
      '',
      'Hello hexo'
    ].join('\n');

    const result = await post.create({
      title: 'Hello World',
      content: 'Hello hexo'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);
    await unlink(path);
  });

  it('create() - with callback', done => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    post.create({ title: 'Hello World' }, (err, post) => {
      if (err) {
        done(err);
        return;
      }
      try {
        post.path.should.eql(path);
        post.content.should.eql(content);
        readFile(path).asCallback((err, data: any) => {
          if (err) {
            done(err);
            return;
          }
          try {
            data.should.eql(content);
            unlink(path).asCallback(done);
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    });
  });

  it('publish()', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    const data = await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    const draftPath = data.path;
    const result = await post.publish({
      slug: 'Hello-World'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const exist = await exists(draftPath);
    exist.should.be.false;

    const newdata = await readFile(path);
    newdata.should.eql(content);

    await unlink(path);
  });

  it('publish() - layout', async () => {
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

    await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    const result = await post.publish({
      slug: 'Hello-World',
      layout: 'photo'
    });
    result.path.should.eql(path);
    result.content.should.eql(content);

    const data = await readFile(path);
    data.should.eql(content);

    await unlink(path);
  });

  it('publish() - rename if target existed', async () => {
    const paths = [join(hexo.source_dir, '_posts', 'Hello-World-1.md')];

    const result = await Promise.all([
      post.create({ title: 'Hello World', layout: 'draft' }),
      post.create({ title: 'Hello World' })
    ]);
    paths.push(result[1].path);

    const data = await post.publish({
      slug: 'Hello-World'
    });
    data.path.should.eql(paths[0]);

    for (const path of paths) {
      await unlink(path);
    }
  });

  it('publish() - replace existing files', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    await Promise.all([
      post.create({ title: 'Hello World', layout: 'draft' }),
      post.create({ title: 'Hello World' })
    ]);
    const data = await post.publish({
      slug: 'Hello-World'
    }, true);
    data.path.should.eql(path);
    await unlink(path);
  });

  it('publish() - asset folder', async () => {
    const assetDir = join(hexo.source_dir, '_drafts', 'Hello-World');
    const newAssetDir = join(hexo.source_dir, '_posts', 'Hello-World');
    hexo.config.post_asset_folder = true;

    await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    // Put some files into the asset folder
    await Promise.all([
      writeFile(join(assetDir, 'a.txt'), 'a'),
      writeFile(join(assetDir, 'b.txt'), 'b')
    ]);
    const result = await post.publish({
      slug: 'Hello-World'
    });

    const exist = await exists(assetDir);
    exist.should.be.false;
    const files = await listDir(newAssetDir);
    files.should.have.members(['a.txt', 'b.txt']);

    await unlink(result.path);

    await rmdir(newAssetDir);
  });

  // #1100
  it('publish() - non-string title', async () => {
    const path = join(hexo.source_dir, '_posts', '12345.md');

    await post.create({
      title: 12345,
      layout: 'draft'
    });
    const data = await post.publish({
      slug: 12345
    });
    data.path.should.eql(path);
    await unlink(path);
  });

  it('publish() - with callback', async () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    const callback = spy();

    const data = await post.create({
      title: 'Hello World',
      layout: 'draft'
    });
    const draftPath = data.path;

    await post.publish({
      slug: 'Hello-World'
    }, callback);
    callback.calledOnce.should.be.true;
    callback.calledWithMatch(null, { path, content }).should.true;

    const exist = await exists(draftPath);
    exist.should.be.false;

    const newdata = await readFile(path);
    newdata.should.eql(content);

    await unlink(path);
  });

  // #1139
  it('publish() - preserve non-null data in drafts', async () => {
    await post.create({
      title: 'foo',
      layout: 'draft',
      tags: ['tag', 'test']
    });
    const data = await post.publish({
      slug: 'foo'
    });
    const meta = yfm(data.content);
    meta.tags.should.eql(['tag', 'test']);
    await unlink(data.path);
  });

  // https:// github.com/hexojs/hexo/issues/5155
  it('publish() - merge front-matter', async () => {
    const prefixTags = ['prefixTag1', 'fooo'];
    const customTags = ['customTag', 'fooo'];

    await hexo.scaffold.set('customscaff', [
      '---',
      'title: {{ title }}',
      'date: {{ date }}',
      `tags: ${JSON.stringify(prefixTags)}`,
      'qwe: 123',
      'zxc: zxc',
      '---'
    ].join('\n'));

    const path = join(hexo.source_dir, '_posts', 'fooo.md');
    await post.create({
      title: 'fooo',
      layout: 'draft',
      tags: customTags,
      qwe: 456,
      asd: 'asd'
    });
    const result = await post.publish({
      slug: 'fooo',
      layout: 'customscaff'
    });

    const fmt = yfm(result.content);
    fmt.tags.sort().should.eql(deepMerge(prefixTags, customTags).sort());
    fmt.qwe.should.eql(456);
    fmt.asd.should.eql('asd');
    fmt.zxc.should.eql('zxc');

    await unlink(path);
  });

  it('render()', async () => {
    // TODO: validate data
    const beforeHook = spy();
    const afterHook = spy();

    hexo.extend.filter.register('before_post_render', beforeHook);
    hexo.extend.filter.register('after_post_render', afterHook);

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql(expected);
    beforeHook.calledOnce.should.be.true;
    afterHook.calledOnce.should.be.true;
  });

  it('render() - callback', done => {
    post.render('', {
      content,
      engine: 'markdown'
    }, err => {
      done(err);
    });
  });

  it('render() - file', async () => {
    const content = '**file test**';
    const path = join(hexo.base_dir, 'render_test.md');

    await writeFile(path, content);
    const data = await post.render(path);
    data.content.trim().should.eql('<p><strong>file test</strong></p>');
    await unlink(path);
  });

  it('render() - skip js', async () => {
    const content = 'let a = "{{ 1 + 1 }}"';

    const data = await post.render('', {
      content,
      source: 'render_test.js'
    });
    data.content.trim().should.eql(content);
  });

  it('render() - toString', async () => {
    const content = 'foo: 1';

    const data = await post.render('', {
      content,
      engine: 'yaml'
    });
    data.content.should.eql('{"foo":1}');
  });

  it('render() - skip render phase if it\'s nunjucks file', async () => {
    const content = [
      '{% quote Hello World %}',
      'quote content',
      '{% endquote %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'njk'
    });
    data.content.trim().should.eql([
      '<blockquote><p>quote content</p>\n',
      '<footer><strong>Hello World</strong></footer></blockquote>'
    ].join(''));
  });

  it('render() - escaping nunjucks blocks with similar names', async () => {
    const code = 'alert("Hello world")';
    const highlighted = highlight(code);

    const content = [
      '{% codeblock %}',
      code,
      '{% endcodeblock %}',
      '',
      '{% code %}',
      code,
      '{% endcode %}'
    ].join('\n');

    const data = await post.render('', {
      content
    });
    data.content.trim().should.eql([
      highlighted,
      '',
      highlighted
    ].join('\n'));
  });

  it('render() - recover escaped nunjucks blocks which is html escaped', async () => {
    const content = '`{% raw %}{{ test }}{% endraw %}`, {%raw%}{{ test }}{%endraw%}';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql('<p><code>{{ test }}</code>, {{ test }}</p>');
  });

  it.skip('render() - recover escaped nunjucks blocks which is html escaped before post_render', async () => {
    const content = '`{% raw %}{{ test }}{% endraw %}`';

    const filter = spy();

    hexo.extend.filter.register('after_render:html', filter);

    await post.render('', {
      content,
      engine: 'markdown'
    });
    filter.calledOnce.should.be.true;
    filter.firstCall.args[0].trim().should.eql('<p><code>{{ test }}</code></p>');
    hexo.extend.filter.unregister('after_render:html', filter);
  });

  it('render() - callback - not path and file', callback => {
    post.render('', {}, (err, result) => {
      try {
        err.should.be.exist;
        err.should.be.instanceof(Error);
        err.should.be.have.property('message', 'No input file or string!');
        should.not.exist(result);
      } catch (e) {
        callback(e);
        return;
      }
      callback();
    });
  });

  // #3573
  it('render() - (disableNunjucks === true)', async () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = true;

    try {
      const data = await post.render('', {
        content,
        engine: 'markdown'
      });
      data.content.trim().should.eql(expected_disable_nunjucks);
    } finally {
      renderer.disableNunjucks = false;
    }
  });

  // #3573
  it('render() - (disableNunjucks === false)', async () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = false;

    try {
      const data = await post.render('', {
        content,
        engine: 'markdown'
      });
      data.content.trim().should.eql(expected);
    } finally {
      renderer.disableNunjucks = false;
    }
  });

  // #4498
  it('render() - (disableNunjucks === true) - sync', async () => {
    const content = '{% link foo http://bar.com %}';
    const loremFn = data => { return data.text.toUpperCase(); };
    loremFn.disableNunjucks = true;
    hexo.extend.renderer.register('coffee', 'js', loremFn, true);

    const data = await post.render('', { content, engine: 'coffee' });
    data.content.should.eql(content.toUpperCase());
  });

  // #4498
  it('render() - (disableNunjucks === false) - sync', async () => {
    const content = '{% link foo http://bar.com %}';
    const loremFn = data => { return data.text.toUpperCase(); };
    loremFn.disableNunjucks = false;
    hexo.extend.renderer.register('coffee', 'js', loremFn, true);

    const data = await post.render('', { content, engine: 'coffee' });
    data.content.should.not.eql(content.toUpperCase());
  });

  it('render() - (disableNunjucks === true) - front-matter', async () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = true;

    try {
      const data = await post.render('', {
        content,
        engine: 'markdown',
        disableNunjucks: false
      });
      data.content.trim().should.eql(expected);
    } finally {
      renderer.disableNunjucks = false;
    }
  });

  it('render() - (disableNunjucks === false) - front-matter', async () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = false;

    try {
      const data = await post.render('', {
        content,
        engine: 'markdown',
        disableNunjucks: true
      });
      data.content.trim().should.eql(expected_disable_nunjucks);
    } finally {
      renderer.disableNunjucks = false;
    }
  });

  // Only boolean type of front-matter's disableNunjucks is valid
  it('render() - (disableNunjucks === null) - front-matter', async () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = true;

    try {
      const data = await post.render('', {
        content,
        engine: 'markdown',
        // @ts-ignore
        disableNunjucks: null
      });
      data.content.trim().should.eql(expected_disable_nunjucks);
    } finally {
      renderer.disableNunjucks = false;
    }
  });

  it('render() - nested swig tag', async () => {
    const content = [
      '{% blockquote %}',
      'test1',
      '{% quote test2 %}',
      'test3',
      '{% endquote %}',
      'test4',
      '{% endblockquote %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<blockquote><p>test1</p>',
      '<blockquote><p>test3</p>',
      '<footer><strong>test2</strong></footer></blockquote>',
      'test4</blockquote>'
    ].join('\n'));
  });

  it('render() - swig comments', async () => {
    const content = '{# blockquote #}';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql('');
  });

  it('render() - shouln\'t break curly brackets', async () => {
    hexo.config.syntax_highlighter = 'prismjs';

    const content = [
      '\\begin{equation}',
      'E=h\\nu',
      '\\end{equation}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.include('\\begin{equation}');
    data.content.should.include('\\end{equation}');

    hexo.config.syntax_highlighter = 'highlight.js';
  });

  // #2321
  it('render() - allow backtick code block in "blockquote" tag plugin', async () => {
    const code = 'alert("Hello world")';
    const highlighted = highlight(code);

    const content = [
      '{% blockquote %}',
      '```',
      code,
      '```',
      '{% endblockquote %}'
    ].join('\n');

    const data = await post.render('', {
      content
    });
    data.content.trim().should.eql([
      '<blockquote>' + highlighted + '</blockquote>'
    ].join('\n'));
  });

  // #2969
  it('render() - backtick cocde block in blockquote', async () => {
    const code = 'alert("Hello world")';
    const highlighted = highlight(code);
    const quotedContent = [
      'This is a code-block',
      '',
      '```',
      code,
      '```'
    ];

    const content = [
      'Hello',
      '',
      ...quotedContent.map(s => '> ' + s)
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<p>Hello</p>',
      '<blockquote>',
      '<p>This is a code-block</p>',
      highlighted + '</blockquote>'
    ].join('\n'));
  });

  // #2969
  it('render() - "lang=dos" backtick cocde block in blockquote', async () => {
    const code = '> dir';
    const highlighted = highlight(code);
    const quotedContent = [
      'This is a code-block',
      '',
      '```',
      code,
      '```'
    ];

    const content = [
      'Hello',
      '',
      ...quotedContent.map(s => '> ' + s)
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<p>Hello</p>',
      '<blockquote>',
      '<p>This is a code-block</p>',
      highlighted + '</blockquote>'
    ].join('\n'));
  });

  // #3767
  it('render() - backtick cocde block (followed by a paragraph) in blockquote', async () => {
    const code = 'alert("Hello world")';
    const highlighted = highlight(code);
    const quotedContent = [
      'This is a code-block',
      '',
      '```',
      code,
      '```',
      '',
      'This is a following paragraph'
    ];

    const content = [
      'Hello',
      '',
      ...quotedContent.map(s => '> ' + s)
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<p>Hello</p>',
      '<blockquote>',
      '<p>This is a code-block</p>',
      highlighted,
      '',
      '<p>This is a following paragraph</p>',
      '</blockquote>'
    ].join('\n'));
  });

  // #3769
  it('render() - blank lines in backtick cocde block in blockquote', async () => {
    const code = [
      '',
      '',
      '',
      '{',
      '  "test": 123',
      '',
      '',
      '}',
      ''
    ];
    const highlighted = highlight(code.join('\n'));
    const addQuote = s => '>' + (s ? ` ${s}` : '');
    const code2 = code.map((s, i) => {
      if (i === 0 || i === 2 || i === 6) return addQuote(s);
      return s;
    });
    const quotedContent = [
      'This is a code-block',
      '',
      '> ```',
      ...code2,
      '```',
      '',
      'This is a following paragraph'
    ];
    const content = [
      'Hello',
      '',
      ...quotedContent.map(addQuote)
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<p>Hello</p>',
      '<blockquote>',
      '<p>This is a code-block</p>',
      '<blockquote>',
      highlighted.replace('{', '&#123;').replace('}', '&#125;'),
      '</blockquote>',
      '<p>This is a following paragraph</p>',
      '</blockquote>'
    ].join('\n'));
  });

  // #4161
  it('render() - adjacent tags', async () => {
    const content = [
      '{% pullquote %}content1{% endpullquote %}',
      '',
      'This is a following paragraph',
      '',
      '{% pullquote %}content2{% endpullquote %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<blockquote class="pullquote"><p>content1</p>\n</blockquote>\n\n',
      '<p>This is a following paragraph</p>\n',
      '<blockquote class="pullquote"><p>content2</p>\n</blockquote>'
    ].join(''));
  });

  // #4161
  it('render() - adjacent tags with args', async () => {
    const content = [
      '{% pullquote center %}content1{% endpullquote %}',
      '',
      'This is a following paragraph',
      '',
      '{% pullquote center %}content2{% endpullquote %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.trim().should.eql([
      '<blockquote class="pullquote center"><p>content1</p>\n</blockquote>\n\n',
      '<p>This is a following paragraph</p>\n',
      '<blockquote class="pullquote center"><p>content2</p>\n</blockquote>'
    ].join(''));
  });

  // #3346
  it('render() - swig tag inside backtick code block', async () => {
    const content = content_for_issue_3346;

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(expected_for_issue_3346);
  });

  // test for https://github.com/hexojs/hexo/pull/4171#issuecomment-594412367
  it('render() - markdown content right after swig tag', async () => {
    const content = [
      '{% pullquote warning %}',
      'Text',
      '{% endpullquote %}',
      '# Title 0',
      '{% pullquote warning %}',
      'Text',
      '{% endpullquote %}',
      '{% pullquote warning %}',
      'Text',
      '{% endpullquote %}',
      '# Title 1',
      '{% pullquote warning %}',
      'Text',
      '{% endpullquote %}',
      '{% pullquote warning %}Text{% endpullquote %}',
      '# Title 2',
      '{% pullquote warning %}Text{% endpullquote %}',
      '{% pullquote warning %}Text{% endpullquote %}',
      '# Title 3',
      '{% pullquote warning %}Text{% endpullquote %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    // We only to make sure markdown content is rendered correctly
    data.content.trim().should.include('<h1 id="Title-0"><a href="#Title-0" class="headerlink" title="Title 0"></a>Title 0</h1>');
    data.content.trim().should.include('<h1 id="Title-1"><a href="#Title-1" class="headerlink" title="Title 1"></a>Title 1</h1>');
    data.content.trim().should.include('<h1 id="Title-2"><a href="#Title-2" class="headerlink" title="Title 2"></a>Title 2</h1>');
    data.content.trim().should.include('<h1 id="Title-3"><a href="#Title-3" class="headerlink" title="Title 3"></a>Title 3</h1>');
  });

  // #3259
  it('render() - "{{" & "}}" inside inline code', async () => {
    const content = 'In Go\'s templates, blocks look like this: `{{block "template name" .}} (content) {{end}}`.';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(`<p>In Go’s templates, blocks look like this: <code>${escapeSwigTag('{{block "template name" .}} (content) {{end}}')}</code>.</p>`);
  });

  // https://github.com/hexojs/hexo/issues/3346#issuecomment-595497849
  it('render() - swig var inside inline code', async () => {
    const content = '`{{ 1 + 1 }}` {{ 1 + 1 }}';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(`<p><code>${escapeSwigTag('{{ 1 + 1 }}')}</code> 2</p>`);
  });

  // #3543
  it('render() - issue #3543', async () => {
    // Adopted from #3459
    const js = 'alert("Foo")';
    const html = '<div></div>';
    const highlightedJs = highlight(js, { lang: 'js' });
    const highlightedHtml = highlight(html, { lang: 'html' });

    const content = [
      '```js',
      js,
      '```',
      '{% raw %}',
      '<p>Foo</p>',
      '{% endraw %}',
      '```html',
      html,
      '```'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.contains(highlightedJs);
    data.content.trim().should.contains('<p>Foo</p>');
    data.content.trim().should.not.contains('{% raw %}');
    data.content.trim().should.not.contains('{% endraw %}');
    data.content.trim().should.contains(highlightedHtml);
  });

  it('render() - escape & recover multi {% raw %} and backticks', async () => {
    const content = [
      '`{{ 1 + 1 }}` {{ 1 + 2 }} `{{ 2 + 2 }}`',
      'Text',
      '{% raw %}',
      'Raw 1',
      '{% endraw %}',
      'Another Text',
      '{% raw %}',
      'Raw 2',
      '{% endraw %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql([
      `<p><code>${escapeSwigTag('{{ 1 + 1 }}')}</code> 3 <code>${escapeSwigTag('{{ 2 + 2 }}')}</code><br>Text</p>`,
      '',
      'Raw 1',
      '',
      '<p>Another Text</p>',
      '',
      'Raw 2'
    ].join('\n'));
  });

  // #4087
  it('render() - issue #4087', async () => {
    // Adopted from https://github.com/hexojs/hexo/issues/4087#issuecomment-596999486
    const content = [
      '## Quote',
      '',
      '    {% pullquote %}foo foo foo{% endpullquote %}',
      '',
      'test001',
      '',
      '{% pullquote %}bar bar bar{% endpullquote %}',
      '',
      '## Insert',
      '',
      'test002',
      ''
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    // indented pullquote
    data.content.trim().should.contains(`<pre><code>${escapeSwigTag('{% pullquote %}foo foo foo{% endpullquote %}')}\n</code></pre>`);
    data.content.trim().should.contains('<p>test001</p>');
    // pullquote tag
    data.content.trim().should.contains('<blockquote class="pullquote"><p>bar bar bar</p>\n</blockquote>');
    data.content.trim().should.contains('<p>test002</p>');
  });

  // #4385
  it('render() - no double escape in code block (issue #4385)', async () => {
    const content = [
      '```rust',
      'fn main() {',
      '    println!("Hello, world!");',
      '}',
      '```'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.contains('<figure class="highlight rust">');
    data.content.should.contains('&#123;');
    data.content.should.contains('&#125;');
    data.content.should.not.contains('&amp;#123');
    data.content.should.not.contains('&amp;#125');
  });

  it('render() - issue #4460', async () => {
    hexo.config.syntax_highlighter = 'prismjs';

    const content = content_for_issue_4460;

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.not.include('hexoPostRenderEscape');

    hexo.config.syntax_highlighter = 'highlight.js';
  });

  it('render() - empty tag name', async () => {
    hexo.config.syntax_highlighter = 'prismjs';

    const content = 'Disable rendering of Nunjucks tag `{{ }}` / `{% %}`';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.include(escapeSwigTag('{{ }}'));
    data.content.should.include(escapeSwigTag('{% %}'));

    hexo.config.syntax_highlighter = 'highlight.js';
  });

  // https://github.com/hexojs/hexo/issues/5301
  it('render() - dont escape incomplete tags', async () => {
    const content = 'dont drop `{% }` 11111 `{# }` 22222 `{{ }` 33333';

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.contains('11111');
    data.content.should.contains('22222');
    data.content.should.contains('33333');
    data.content.should.not.contains('&#96;'); // `
  });

  it('render() - should support quotes in tags', async () => {
    let content = '{{ "{{ }" }}';
    let data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.eql('{{ }');

    content = '{% blockquote "{% }"  %}test{% endblockquote %}';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.eql('<blockquote><p>test</p>\n<footer><strong>{% }</strong></footer></blockquote>');
  });

  it('render() - dont escape incomplete tags with complete tags', async () => {
    // lost one character
    let content = '{{ 1 }} \n `{% "%}" }` 22222';
    let data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;% &quot;%&#125;&quot; &#125;');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{% "%}" %` 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;% &quot;%&#125;&quot; %');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{# }` 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;# &#125;');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{{ "}}" }` 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;&#123; &quot;&#125;&#125;&quot; &#125;');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{{ %}` 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;&#123; %&#125;');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{% custom %}` 22222  `{% endcustom }`';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('1');
    data.content.should.contains('&#123;% custom %&#125;');
    data.content.should.contains('22222');
    data.content.should.contains('&#123;% endcustom &#125;');

    // lost two characters
    content = '{{ 1 }} \n `{#` \n 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;#');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{%` \n 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('&#123;%');
    data.content.should.contains('1');
    data.content.should.contains('22222');

    content = '{{ 1 }} \n `{{ ` 22222';
    data = await post.render('', {
      content,
      engine: 'markdown'
    });
    data.content.should.contains('1');
    data.content.should.contains('&#123;&#123; ');
    data.content.should.contains('22222');
  });

  it('render() - incomplete tags throw error', async () => {
    const content = 'nunjucks should throw {#  } error';

    try {
      await post.render('', {
        content,
        engine: 'markdown'
      });
      should.fail();
    } catch {}
  });

  // https://github.com/hexojs/hexo/issues/5401
  it('render() - tags in different lines', async () => {
    const content = [
      '{% link',
      'foobar',
      'https://hexo.io/',
      'tttitle',
      '%}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    data.content.should.eql('<a href="https://hexo.io/" title="tttitle" target="">foobar</a>');
  });
});
