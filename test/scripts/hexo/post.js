var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var moment = require('moment');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var util = require('hexo-util');
var sinon = require('sinon');
var frontMatter = require('hexo-front-matter');
var fixture = require('../../fixtures/post_render');

describe('Post', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'post_test'));
  var post = hexo.post;
  var now = Date.now();
  var clock;

  before(() => {
    clock = sinon.useFakeTimers(now);

    return fs.mkdirs(hexo.base_dir, () => hexo.init()).then(() => // Load marked renderer for testing
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
    return fs.rmdir(hexo.base_dir);
  });

  it('create()', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);
    var listener = sinon.spy();

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - slug', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - filename_case', () => {
    hexo.config.filename_case = 1;

    var path = pathFn.join(hexo.source_dir, '_posts', 'hello-world.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - layout', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - extra data', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - rename if target existed', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(() => post.create({
      title: 'Hello World'
    })).then(post => {
      post.path.should.eql(path);
      return fs.exists(path);
    }).then(exist => {
      exist.should.be.true;

      return Promise.all([
        fs.unlink(path),
        fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('create() - replace existing files', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(() => post.create({
      title: 'Hello World'
    }, true)).then(post => {
      post.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('create() - asset folder', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World');

    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World'
    }).then(post => {
      hexo.config.post_asset_folder = false;
      return fs.stat(path);
    }).then(stats => {
      stats.isDirectory().should.be.true;
      return fs.unlink(path + '.md');
    });
  });

  it('create() - follow the separator style in the scaffold', () => {
    var scaffold = [
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
        fs.unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  it('create() - JSON front-matter', () => {
    var scaffold = [
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
        fs.unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  // https://github.com/hexojs/hexo/issues/1100
  it('create() - non-string title', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345
    }).then(data => {
      data.path.should.eql(path);
      return fs.unlink(path);
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
    return fs.unlink(data.path);
  }));

  it('create() - with content', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - with callback', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    var callback = sinon.spy(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);
    });

    return post.create({
      title: 'Hello World'
    }, callback).then(post => {
      callback.calledOnce.should.be.true;
      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('publish()', () => {
    var draftPath = '';
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
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
        fs.exists(draftPath),
        fs.readFile(path)
      ]);
    }).spread((exist, data) => {
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('publish() - layout', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
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

      return fs.readFile(path);
    }).then(data => {
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('publish() - rename if target existed', () => {
    var paths = [pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md')];

    return Promise.all([
      post.create({title: 'Hello World', layout: 'draft'}),
      post.create({title: 'Hello World'})
    ]).then(data => {
      paths.push(data[1].path);

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(data => {
      data.path.should.eql(paths[0]);
      return paths;
    }).map(item => fs.unlink(item));
  });

  it('publish() - replace existing files', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return Promise.all([
      post.create({title: 'Hello World', layout: 'draft'}),
      post.create({title: 'Hello World'})
    ]).then(data => post.publish({
      slug: 'Hello-World'
    }, true)).then(data => {
      data.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('publish() - asset folder', () => {
    var assetDir = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World');
    var newAssetDir = pathFn.join(hexo.source_dir, '_posts', 'Hello-World');
    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(data => // Put some files into the asset folder
      Promise.all([
        fs.writeFile(pathFn.join(assetDir, 'a.txt'), 'a'),
        fs.writeFile(pathFn.join(assetDir, 'b.txt'), 'b')
      ])).then(() => post.publish({
      slug: 'Hello-World'
    })).then(post => Promise.all([
      fs.exists(assetDir),
      fs.listDir(newAssetDir),
      fs.unlink(post.path)
    ])).spread((exist, files) => {
      hexo.config.post_asset_folder = false;
      exist.should.be.false;
      files.should.have.members(['a.txt', 'b.txt']);
      return fs.rmdir(newAssetDir);
    });
  });

  // https://github.com/hexojs/hexo/issues/1100
  it('publish() - non-string title', () => {
    var path = pathFn.join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345,
      layout: 'draft'
    }).then(data => post.publish({
      slug: 12345
    })).then(data => {
      data.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('publish() - with callback', () => {
    var draftPath = '';
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      '---',
      'title: Hello World',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    var callback = sinon.spy(post => {
      post.path.should.eql(path);
      post.content.should.eql(content);
    });

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

      return Promise.all([
        fs.exists(draftPath),
        fs.readFile(path)
      ]);
    }).spread((exist, data) => {
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
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
    var meta = frontMatter(data.content);
    meta.tags.should.eql(['tag', 'test']);
    return fs.unlink(data.path);
  }));

  it('render()', () => {
    // TODO: validate data
    var beforeHook = sinon.spy();
    var afterHook = sinon.spy();

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

  it('render() - file', () => {
    var content = '**file test**';
    var path = pathFn.join(hexo.base_dir, 'render_test.md');

    return fs.writeFile(path, content).then(() => post.render(path)).then(data => {
      data.content.trim().should.eql('<p><strong>file test</strong></p>');
      return fs.unlink(path);
    });
  });

  it('render() - toString', () => {
    var content = 'foo: 1';

    return post.render(null, {
      content,
      engine: 'yaml'
    }).then(data => {
      data.content.should.eql('{"foo":1}');
    });
  });

  it('render() - skip render phase if it\'s swig file', () => {
    var content = [
      '{% quote Hello World %}',
      'quote content',
      '{% endquote %}'
    ].join('\n');

    return post.render(null, {
      content,
      engine: 'swig'
    }).then(data => {
      data.content.trim().should.eql([
        '<blockquote><p>quote content</p>\n',
        '<footer><strong>Hello World</strong></footer></blockquote>'
      ].join(''));
    });
  });

  it('render() - escaping swig blocks with similar names', () => {
    var code = 'alert("Hello world")';
    var highlighted = util.highlight(code);

    var content = [
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

  it('render() - recover escaped swig blocks which is html escaped', () => {
    var content = '`{% raw %}{{ test }}{% endraw %}`';

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      data.content.trim().should.eql('<p><code>{{ test }}</code></p>');
    });
  });

  it('render() - recover escaped swig blocks which is html escaped before post_render', () => {
    var content = '`{% raw %}{{ test }}{% endraw %}`';

    var filter = sinon.spy(result => {
      result.trim().should.eql('<p><code>{{ test }}</code></p>');
    });

    hexo.extend.filter.register('after_render:html', filter);

    return post.render(null, {
      content,
      engine: 'markdown'
    }).then(data => {
      filter.calledOnce.should.be.true;
      hexo.extend.filter.unregister('after_render:html', filter);
    });
  });
});
