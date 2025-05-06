import { join } from 'path';
import Tag from '../../../lib/extend/tag';
import chai from 'chai';
import Hexo from '../../../lib/hexo';
import defaultConfig from '../../../lib/hexo/default_config';
import posts from '../../../lib/plugins/processor/post';
import Filter from '../../../lib/extend/filter';
import renderPostFilter from '../../../lib/plugins/filter/before_generate/render_post';
import { mkdirs, rmdir, writeFile } from 'hexo-fs';
// @ts-ignore
import Promise from 'bluebird';
const should = chai.should();

type PostParams = Parameters<ReturnType<typeof posts>['process']>
type PostReturn = ReturnType<ReturnType<typeof posts>['process']>

describe('Tag', () => {
  const tag = new Tag();

  const baseDir = join(__dirname, 'post_test');
  const hexo = new Hexo(baseDir);
  const post = posts(hexo);
  const process: (...args: PostParams) => Promise<PostReturn> = Promise.method(post.process.bind(hexo));
  const { source } = hexo;
  const { File } = source;

  function newFile(options) {
    const { path } = options;

    options.path = (options.published ? '_posts' : '_drafts') + '/' + path;
    options.source = join(source.base, options.path);

    options.params = {
      published: options.published,
      path,
      renderable: options.renderable
    };

    return new File(options);
  }

  before(async () => {
    await mkdirs(baseDir);
    hexo.init();
  });

  beforeEach(() => { hexo.config = Object.assign({}, defaultConfig); });

  after(() => rmdir(baseDir));

  it('register()', async () => {
    const tag = new Tag();

    tag.register('test', (args, _content) => args.join(' '));

    const result = await tag.render('{% test foo.bar | abcdef > fn(a, b, c) < fn() %}');
    result.should.eql('foo.bar | abcdef > fn(a, b, c) < fn()');
  });

  it('register() - async', async () => {
    const tag = new Tag();

    tag.register('test', async (args, _content) => args.join(' '), { async: true });

    const result = await tag.render('{% test foo bar %}');
    result.should.eql('foo bar');
  });

  it('register() - block', async () => {
    const tag = new Tag();

    tag.register('test', (args, content) => args.join(' ') + ' ' + content, true);

    const str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    const result = await tag.render(str);
    result.should.eql('foo bar test content');
  });

  it('register() - async block', async () => {
    const tag = new Tag();

    tag.register('test', async (args, content) => args.join(' ') + ' ' + content, { ends: true, async: true });

    const str = [
      '{% test foo bar %}',
      'test content',
      '{% endtest %}'
    ].join('\n');

    const result = await tag.render(str);
    result.should.eql('foo bar test content');
  });

  it('register() - nested test', async () => {
    const tag = new Tag();

    tag.register('test', (_args, content) => content, true);

    const str = [
      '{% test %}',
      '123456',
      '  {% raw %}',
      '  raw',
      '  {% endraw %}',
      '  {% test %}',
      '  test',
      '  {% endtest %}',
      '789012',
      '{% endtest %}'
    ].join('\n');

    const result = await tag.render(str);
    result.replace(/\s/g, '').should.eql('123456rawtest789012');
  });

  it('register() - nested async / async test', async () => {
    const tag = new Tag();

    tag.register('test', (args, content) => content, {ends: true, async: true});
    tag.register('async', async (args, content) => args.join(' ') + ' ' + content, { ends: true, async: true });

    const str = [
      '{% test %}',
      '123456',
      '  {% async %}',
      '  async',
      '  {% endasync %}',
      '789012',
      '{% endtest %}'
    ].join('\n');

    const result = await tag.render(str);
    result.replace(/\s/g, '').should.eql('123456async789012');
  });

  it('register() - strip indention', async () => {
    const tag = new Tag();

    tag.register('test', (args, content) => content, true);

    const str = [
      '{% test %}',
      '  test content',
      '{% endtest %}'
    ].join('\n');

    const result = await tag.render(str);
    result.should.eql('test content');
  });

  it('register() - async callback', async () => {
    const tag = new Tag();

    tag.register('test', async (args, _content, callback) => {
      callback && callback(null, args.join(' '));
      return '';
    }, { async: true });

    const result = await tag.render('{% test foo bar %}');
    result.should.eql('foo bar');
  });

  it('register() - name is required', () => {
    // @ts-expect-error
    should.throw(() => tag.register(), 'name is required');
  });

  it('register() - fn must be a function', () => {
    // @ts-expect-error
    should.throw(() => tag.register('test'), 'fn must be a function');
  });

  it('unregister()', () => {
    const tag = new Tag();

    tag.register('test', async (args, _content) => args.join(' '), {async: true});
    tag.unregister('test');

    return tag.render('{% test foo bar %}')
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        err.should.have.property('type', 'unknown block tag: test');
      });
  });

  it('unregister() - name is required', () => {
    // @ts-expect-error
    should.throw(() => tag.unregister(), 'name is required');
  });

  it('render() - context', async () => {
    const tag = new Tag();

    tag.register('test', function() {
      return this.foo;
    });

    const result = await tag.render('{% test %}', { foo: 'bar' });
    result.should.eql('bar');
  });

  it('render() - callback', () => {
    const tag = new Tag();

    // spy() is not a function
    let spy = false;
    const callback = () => {
      spy = true;
    };

    tag.register('test', () => 'foo');

    return tag.render('{% test %}', callback).then(result => {
      result.should.eql('foo');
      spy.should.eql(true);
    });
  });

  it('tag should get right locals', async () => {
    let count = 0;
    hexo.extend.filter = new Filter();
    hexo.extend.tag = new Tag();
    hexo.extend.tag.register('series', () => {
      count = hexo.locals.get('posts').length;
      return '';
    }, {ends: false});
    hexo.extend.filter.register('before_generate', renderPostFilter.bind(hexo));

    const body1 = [
      'title: "test1"',
      'date: 2023-09-03 16:59:42',
      'tags: foo',
      '---',
      '{% series %}'
    ].join('\n');

    const file = newFile({
      path: 'test1.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const body2 = [
      '---',
      'title: test2',
      'date: 2023-09-03 16:59:46',
      'tags: foo',
      '---'
    ];

    const file2 = newFile({
      path: 'test2.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const body3 = [
      'title: test3',
      'date: 2023-09-03 16:59:49',
      'tags: foo',
      '---'
    ];

    const file3 = newFile({
      path: 'test3.html',
      published: true,
      type: 'create',
      renderable: true
    });

    await Promise.all([
      writeFile(file.source, body1),
      writeFile(file2.source, body2),
      writeFile(file3.source, body3)
    ]);

    await Promise.all([
      process(file),
      process(file2),
      process(file3)
    ]);

    await hexo._generate({ cache: false });

    count.should.eql(3);
  });
});
