'use strict';

const { join } = require('path');
const moment = require('moment');
const Promise = require('bluebird');
const { readFile, mkdirs, unlink, rmdir, writeFile, exists, stat, listDir } = require('hexo-fs');
const { highlight, escapeHTML } = require('hexo-util');
const { spy, useFakeTimers } = require('sinon');
const frontMatter = require('hexo-front-matter');
const fixture = require('../../fixtures/post_render');
const escapeSwigTag = str => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

describe('Post', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'post_test'));
  const { post } = hexo;
  const now = Date.now();
  let clock;

  before(() => {
    clock = useFakeTimers(now);

    return mkdirs(hexo.base_dir).then(() => hexo.init()).then(() => // Load marked renderer for testing
      hexo.loadPlugin(require.resolve('hexo-renderer-marked'))).then(() => hexo.scaffold.set('post', [
      '---',
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n'))).then(() => hexo.scaffold.set('draft', [
      '---',
      'title: {{ title }}',
      'tags:',
      '---'
    ].join('\n')));
  });

  after(() => {
    clock.restore();
    return rmdir(hexo.base_dir);
  });

  it('create()', () => {
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

    return post.create({
      title: 'Hello World'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);
      listener.calledOnce.should.be.true;

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
  });

  it('create() - slug', () => {
    const path = join(hexo.source_dir, '_posts', 'foo.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      slug: 'foo'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
  });

  it('create() - filename_case', () => {
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

    return post.create({
      title: 'Hello World'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);
      hexo.config.filename_case = 0;

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
  });

  it('create() - layout', () => {
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

    return post.create({
      title: 'Hello World',
      layout: 'photo'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
  });

  it('create() - extra data', () => {
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

    return post.create({
      title: 'Hello World',
      foo: 'bar'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
  });

  it('create() - rename if target existed', () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(() => post.create({
      title: 'Hello World'
    })).then(post => {
      post.path.should.eql(path);
      return exists(path);
    }).then(exist => {
      exist.should.be.true;

      return Promise.all([
        unlink(path),
        unlink(join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('create() - replace existing files', () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(() => post.create({
      title: 'Hello World'
    }, true)).then(post => {
      post.path.should.eql(path);
      return unlink(path);
    });
  });

  it('create() - asset folder', () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World');

    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World'
    }).then(post => {
      hexo.config.post_asset_folder = false;
      return stat(path);
    }).then(stats => {
      stats.isDirectory().should.be.true;
      return unlink(path + '.md');
    });
  });

  it('create() - page', () => {
    const path = join(hexo.source_dir, 'Hello-World/index.md');
    hexo.config.post_asset_folder = true;
    return post.create({
      title: 'Hello World',
      layout: 'page'
    }).then(post => {
      post.path.should.eql(path);
      return stat(join(hexo.source_dir, 'Hello-World/index'));
    }).catch(err => {
      err.code.should.eql('ENOENT');
    }).finally(() => {
      hexo.config.post_asset_folder = false;
      unlink(path);
    });
  });

  it('create() - follow the separator style in the scaffold', () => {
    const scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    return hexo.scaffold.set('test', scaffold).then(() => post.create({
      title: 'Hello World',
      layout: 'test'
    })).then(post => {
      post.content.should.eql([
        '---',
        'title: Hello World',
        '---'
      ].join('\n') + '\n');

      return Promise.all([
        unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  it('create() - JSON front-matter', () => {
    const scaffold = [
      '"title": {{ title }}',
      ';;;'
    ].join('\n');

    return hexo.scaffold.set('test', scaffold).then(() => post.create({
      title: 'Hello World',
      layout: 'test',
      lang: 'en'
    })).then(post => {
      post.content.should.eql([
        '"title": "Hello World",',
        '"lang": "en"',
        ';;;'
      ].join('\n') + '\n');

      return Promise.all([
        unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  // https://github.com/hexojs/hexo/issues/1100
  it('create() - non-string title', () => {
    const path = join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345
    }).then(data => {
      data.path.should.eql(path);
      return unlink(path);
    });
  });

  it('create() - escape title', () => post.create({
    title: 'Foo: Bar'
  }).then(data => {
    data.content.should.eql([
      // js-yaml use single-quotation for dumping since 3.3
      '---',
      'title: \'Foo: Bar\'',
      'date: ' + moment(now).format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n');
    return unlink(data.path);
  }));

  it('create() - with content', () => {
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

    return post.create({
      title: 'Hello World',
      content: 'Hello hexo'
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return readFile(path);
    }).then(data => {
      data.should.eql(content);
      return unlink(path);
    });
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
        readFile(path).asCallback((err, data) => {
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

  it('publish()', () => {
    let draftPath = '';
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');
    const date = moment(now);

    const content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(data => {
      draftPath = data.path;

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return Promise.all([
        exists(draftPath),
        readFile(path)
      ]);
    }).spread((exist, data) => {
      exist.should.be.false;
      data.should.eql(content);

      return unlink(path);
    });
  });

  it('publish() - layout', () => {
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

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(data => post.publish({
      slug: 'Hello-World',
      layout: 'photo'
    })).then(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);

      return readFile(path);
    }).then(data => {
      data.should.eql(content);

      return unlink(path);
    });
  });

  it('publish() - rename if target existed', () => {
    const paths = [join(hexo.source_dir, '_posts', 'Hello-World-1.md')];

    return Promise.all([
      post.create({ title: 'Hello World', layout: 'draft' }),
      post.create({ title: 'Hello World' })
    ]).then(data => {
      paths.push(data[1].path);

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(data => {
      data.path.should.eql(paths[0]);
      return paths;
    }).map(item => unlink(item));
  });

  it('publish() - replace existing files', () => {
    const path = join(hexo.source_dir, '_posts', 'Hello-World.md');

    return Promise.all([
      post.create({ title: 'Hello World', layout: 'draft' }),
      post.create({ title: 'Hello World' })
    ]).then(data => post.publish({
      slug: 'Hello-World'
    }, true)).then(data => {
      data.path.should.eql(path);
      return unlink(path);
    });
  });

  it('publish() - asset folder', () => {
    const assetDir = join(hexo.source_dir, '_drafts', 'Hello-World');
    const newAssetDir = join(hexo.source_dir, '_posts', 'Hello-World');
    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(data => // Put some files into the asset folder
      Promise.all([
        writeFile(join(assetDir, 'a.txt'), 'a'),
        writeFile(join(assetDir, 'b.txt'), 'b')
      ])).then(() => post.publish({
      slug: 'Hello-World'
    })).then(post => Promise.all([
      exists(assetDir),
      listDir(newAssetDir),
      unlink(post.path)
    ])).spread((exist, files) => {
      hexo.config.post_asset_folder = false;
      exist.should.be.false;
      files.should.have.members(['a.txt', 'b.txt']);
      return rmdir(newAssetDir);
    });
  });

  // https://github.com/hexojs/hexo/issues/1100
  it('publish() - non-string title', () => {
    const path = join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345,
      layout: 'draft'
    }).then(data => post.publish({
      slug: 12345
    })).then(data => {
      data.path.should.eql(path);
      return unlink(path);
    });
  });

  it('publish() - with callback', () => {
    let draftPath = '';
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

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(data => {
      draftPath = data.path;

      return post.publish({
        slug: 'Hello-World'
      }, callback);
    }).then(post => {
      callback.calledOnce.should.be.true;
      callback.calledWithMatch(null, { path, content }).should.true;

      return Promise.all([
        exists(draftPath),
        readFile(path)
      ]);
    }).spread((exist, data) => {
      exist.should.be.false;
      data.should.eql(content);

      return unlink(path);
    });
  });

  // https://github.com/hexojs/hexo/issues/1139
  it('publish() - preserve non-null data in drafts', () => post.create({
    title: 'foo',
    layout: 'draft',
    tags: ['tag', 'test']
  }).then(data => post.publish({
    slug: 'foo'
  })).then(data => {
    const meta = frontMatter(data.content);
    meta.tags.should.eql(['tag', 'test']);
    return unlink(data.path);
  }));

  it('render()', () => {
    // TODO: validate data
    const beforeHook = spy();
    const afterHook = spy();

    hexo.extend.filter.register('before_post_render', beforeHook);
    hexo.extend.filter.register('after_post_render', afterHook);

    return post.render(null, {
      content: fixture.content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql(fixture.expected);
      beforeHook.calledOnce.should.be.true;
      afterHook.calledOnce.should.be.true;
    });
  });

  it('render() - callback', done => {
    post.render(null, {
      content: fixture.content,
      engine: 'markdown'
    }, err => {
      done(err);
    });
  });

  it('render() - file', () => {
    const content = '**file test**';
    const path = join(hexo.base_dir, 'render_test.md');

    return writeFile(path, content).then(() => post.render(path)).then(data => {
      data.content.trim().should.eql('<p><strong>file test</strong></p>');
      return unlink(path);
    });
  });

  it('render() - toString', () => {
    const content = 'foo: 1';

    return post.render(null, {
      content,
      engine: 'yaml'
    }).then(data => {
      data.content.should.eql('{"foo":1}');
    });
  });

  it('render() - skip render phase if it\'s nunjucks file', () => {
    const content = [
      '{% quote Hello World %}',
      'quote content',
      '{% endquote %}'
    ].join('\n');

    return post.render(null, {
      content,
      engine: 'njk'
    }).then(data => {
      data.content.trim().should.eql([
        '<blockquote><p>quote content</p>\n',
        '<footer><strong>Hello World</strong></footer></blockquote>'
      ].join(''));
    });
  });

  it('render() - escaping nunjucks blocks with similar names', () => {
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

    return post.render(null, {
      content
    }).then(data => {
      data.content.trim().should.eql([
        highlighted,
        '',
        highlighted
      ].join('\n'));
    });
  });

  it('render() - recover escaped nunjucks blocks which is html escaped', () => {
    const content = '`{% raw %}{{ test }}{% endraw %}`, {%raw%}{{ test }}{%endraw%}';

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql('<p><code>{{ test }}</code>, {{ test }}</p>');
    });
  });

  it.skip('render() - recover escaped nunjucks blocks which is html escaped before post_render', () => {
    const content = '`{% raw %}{{ test }}{% endraw %}`';

    const filter = spy();

    hexo.extend.filter.register('after_render:html', filter);

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      filter.calledOnce.should.be.true;
      filter.firstCall.args[0].trim().should.eql('<p><code>{{ test }}</code></p>');
      hexo.extend.filter.unregister('after_render:html', filter);
    });
  });

  it('render() - callback - not path and file', callback => {
    post.render(null, {}, (err, result) => {
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

  // test for PR #3573
  it('render() - (disableNunjucks === true)', () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = true;

    return post.render(null, {
      content: fixture.content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql(fixture.expected_disable_nunjucks);
    }).then(data => {
      renderer.disableNunjucks = false;
    });
  });

  // test for PR #3573
  it('render() - (disableNunjucks === false)', () => {
    const renderer = hexo.render.renderer.get('markdown');
    renderer.disableNunjucks = false;

    return post.render(null, {
      content: fixture.content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql(fixture.expected);
    }).then(data => {
      renderer.disableNunjucks = false;
    });
  });

  // test for PR #2321
  it('render() - allow backtick code block in "blockquote" tag plugin', () => {
    const code = 'alert("Hello world")';
    const highlighted = highlight(code);

    const content = [
      '{% blockquote %}',
      '```',
      code,
      '```',
      '{% endblockquote %}'
    ].join('\n');

    return post.render(null, {
      content
    }).then(data => {
      data.content.trim().should.eql([
        '<blockquote>' + highlighted + '</blockquote>'
      ].join('\n'));
    });
  });

  // test for Issue #2969
  it('render() - backtick cocde block in blockquote', () => {
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

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql([
        '<p>Hello</p>',
        '<blockquote>',
        '<p>This is a code-block</p>',
        highlighted + '</blockquote>'
      ].join('\n'));
    });
  });

  // test derived from Issue #2969
  it('render() - "lang=dos" backtick cocde block in blockquote', () => {
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

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql([
        '<p>Hello</p>',
        '<blockquote>',
        '<p>This is a code-block</p>',
        highlighted + '</blockquote>'
      ].join('\n'));
    });
  });

  // test for Issue #3767
  it('render() - backtick cocde block (followed by a paragraph) in blockquote', () => {
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

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
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
  });

  // test for Issue #3769
  it('render() - blank lines in backtick cocde block in blockquote', () => {
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

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
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
  });

  // test for PR #4161
  it('render() - adjacent tags', () => {
    const content = [
      '{% pullquote %}content1{% endpullquote %}',
      '',
      'This is a following paragraph',
      '',
      '{% pullquote %}content2{% endpullquote %}'
    ].join('\n');

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql([
        '<blockquote class="pullquote"><p>content1</p>\n</blockquote>\n\n',
        '<p>This is a following paragraph</p>\n',
        '<blockquote class="pullquote"><p>content2</p>\n</blockquote>'
      ].join(''));
    });
  });

  // test for PR #4161
  it('render() - adjacent tags with args', () => {
    const content = [
      '{% pullquote center %}content1{% endpullquote %}',
      '',
      'This is a following paragraph',
      '',
      '{% pullquote center %}content2{% endpullquote %}'
    ].join('\n');

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql([
        '<blockquote class="pullquote center"><p>content1</p>\n</blockquote>\n\n',
        '<p>This is a following paragraph</p>\n',
        '<blockquote class="pullquote center"><p>content2</p>\n</blockquote>'
      ].join(''));
    });
  });

  // test for Issue #3346
  it('render() - swig tag inside backtick code block', async () => {
    const content = fixture.content_for_issue_3346;

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(fixture.expected_for_issue_3346);
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

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    // We only to make sure markdown content is rendered correctly
    data.content.trim().should.include('<h1 id="Title-0"><a href="#Title-0" class="headerlink" title="Title 0"></a>Title 0</h1>');
    data.content.trim().should.include('<h1 id="Title-1"><a href="#Title-1" class="headerlink" title="Title 1"></a>Title 1</h1>');
    data.content.trim().should.include('<h1 id="Title-2"><a href="#Title-2" class="headerlink" title="Title 2"></a>Title 2</h1>');
    data.content.trim().should.include('<h1 id="Title-3"><a href="#Title-3" class="headerlink" title="Title 3"></a>Title 3</h1>');
  });

  // test for Issue #3259
  // https://github.com/hexojs/hexo/issues/3259
  it('render() - "{{" & "}}" inside inline code', async () => {
    const content = 'In Go\'s templates, blocks look like this: `{{block "template name" .}} (content) {{end}}`.';

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(`<p>In Go’s templates, blocks look like this: <code>${escapeSwigTag('{{block "template name" .}} (content) {{end}}')}</code>.</p>`);
  });

  // test for https://github.com/hexojs/hexo/issues/3346#issuecomment-595497849
  it('render() - swig var inside inline code', async () => {
    const content = '`{{ 1 + 1 }}` {{ 1 + 1 }}';

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.eql(`<p><code>${escapeSwigTag('{{ 1 + 1 }}')}</code> 2</p>`);
  });

  // https://github.com/hexojs/hexo/issues/4317
  it('render() - issue #4317', async () => {
    const content = fixture.content_for_issue_4317;
    hexo.config.highlight.enable = false;

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.contains(`<pre><code class="sh">${escapeHTML('echo "Hi"')}</code></pre>`);
    data.content.trim().should.contains('<script src="//gist.github.com/gist_id.js"></script>');
    data.content.trim().should.contains('<script src="//gist.github.com/gist_id_2.js"></script>');

    // Re-anable highlight for other tests
    hexo.config.highlight.enable = true;
  });

  // https://github.com/hexojs/hexo/issues/3543
  it('render() - issue #3543', async () => {
    // Adopted from https://github.com/hexojs/hexo/pull/3459/files
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

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.trim().should.contains(highlightedJs);
    data.content.trim().should.contains('<p>Foo</p>');
    data.content.trim().should.not.contains('{% raw %}');
    data.content.trim().should.not.contains('{% endraw %}');
    data.content.trim().should.contains(highlightedHtml);
  });

  it('render() - escape & recover muilt {% raw %} and backticks', async () => {
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

    const data = await post.render(null, {
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

  // https://github.com/hexojs/hexo/issues/4087
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
      '    {% youtube https://example.com/demo.mp4 %}',
      '',
      'test002',
      '',
      '{% youtube https://example.com/sample.mp4 %}'
    ].join('\n');

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    // indented pullquote
    data.content.trim().should.contains(`<pre><code>${escapeSwigTag('{% pullquote %}foo foo foo{% endpullquote %}')}</code></pre>`);
    data.content.trim().should.contains('<p>test001</p>');
    // pullquote tag
    data.content.trim().should.contains('<blockquote class="pullquote"><p>bar bar bar</p>\n</blockquote>');
    data.content.trim().should.contains('<p>test002</p>');
    // indented youtube tag
    data.content.trim().should.contains(`<pre><code>${escapeSwigTag('{% youtube https://example.com/demo.mp4 %}')}</code></pre>`);
    // youtube tag
    data.content.trim().should.contains('<div class="video-container"><iframe src="https://www.youtube.com/embed/https://example.com/sample.mp4" frameborder="0" loading="lazy" allowfullscreen></iframe></div>');
  });

  // https://github.com/hexojs/hexo/issues/4385
  it('render() - no double escape in code block (issue #4385)', async () => {
    const content = [
      '```rust',
      'fn main() {',
      '    println!("Hello, world!");',
      '}',
      '```'
    ].join('\n');

    const data = await post.render(null, {
      content,
      engine: 'markdown'
    });

    data.content.should.contains('<figure class="highlight rust">');
    data.content.should.contains('&#123;');
    data.content.should.contains('&#125;');
    data.content.should.not.contains('&amp;#123');
    data.content.should.not.contains('&amp;#125');
  });
});
