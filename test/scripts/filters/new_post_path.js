'use strict';

const { join } = require('path');
const moment = require('moment');
const { createSha1Hash } = require('hexo-util');
const { mkdirs, rmdir, unlink, writeFile } = require('hexo-fs');

describe('new_post_path', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'new_post_path_test'));
  const newPostPath = require('../../../dist/plugins/filter/new_post_path').bind(hexo);
  const sourceDir = hexo.source_dir;
  const draftDir = join(sourceDir, '_drafts');
  const postDir = join(sourceDir, '_posts');

  before(async () => {
    hexo.config.new_post_name = ':title.md';

    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('page layout + path', async () => {
    const target = await newPostPath({
      path: 'foo',
      layout: 'page'
    });
    target.should.eql(join(sourceDir, 'foo.md'));
  });

  it('draft layout + path', async () => {
    const target = await newPostPath({
      path: 'foo',
      layout: 'draft'
    });
    target.should.eql(join(draftDir, 'foo.md'));
  });

  it('default layout + path', async () => {
    const target = await newPostPath({
      path: 'foo'
    });
    target.should.eql(join(postDir, 'foo.md'));
  });

  it('page layout + slug', async () => {
    const target = await newPostPath({
      slug: 'foo',
      layout: 'page'
    });
    target.should.eql(join(sourceDir, 'foo', 'index.md'));
  });

  it('draft layout + slug', async () => {
    const target = await newPostPath({
      slug: 'foo',
      layout: 'draft'
    });
    target.should.eql(join(draftDir, 'foo.md'));
  });

  it('default layout + slug', async () => {
    const now = moment();
    hexo.config.new_post_name = ':year-:month-:day-:title.md';

    const target = await newPostPath({
      slug: 'foo'
    });
    target.should.eql(join(postDir, now.format('YYYY-MM-DD') + '-foo.md'));
  });

  it('date', async () => {
    const date = moment([2014, 0, 1]);
    hexo.config.new_post_name = ':year-:i_month-:i_day-:title.md';

    const target = await newPostPath({
      slug: 'foo',
      date: date.toDate()
    });
    target.should.eql(join(postDir, date.format('YYYY-M-D') + '-foo.md'));
  });

  it('extra data', async () => {
    hexo.config.new_post_name = ':foo-:bar-:title.md';

    const target = await newPostPath({
      slug: 'foo',
      foo: 'oh',
      bar: 'ya'
    });
    target.should.eql(join(postDir, 'oh-ya-foo.md'));
  });

  it('append extension name if not existed', async () => {
    hexo.config.new_post_name = ':title';

    const target = await newPostPath({
      slug: 'foo'
    });
    target.should.eql(join(postDir, 'foo.md'));
  });

  it('hash', async () => {
    const now = moment();
    const slug = 'foo';
    const sha1 = createSha1Hash();
    const hash = sha1.update(slug + now.unix().toString())
      .digest('hex').slice(0, 12);
    hexo.config.new_post_name = ':title-:hash';

    const target = await newPostPath({
      slug,
      title: 'tree',
      date: now.format('YYYY-MM-DD HH:mm:ss')
    });

    target.should.eql(join(postDir, `${slug}-${hash}.md`));
  });

  it('don\'t append extension name if existed', async () => {
    const target = await newPostPath({
      path: 'foo.markdown'
    });
    target.should.eql(join(postDir, 'foo.markdown'));
  });

  it('replace existing files', async () => {
    const filename = 'test.md';
    const path = join(postDir, filename);

    await writeFile(path, '');
    const target = await newPostPath({
      path: filename
    }, true);

    target.should.eql(path);
    await unlink(path);
  });

  it('rename if target existed', async () => {
    const filename = [
      'test.md',
      'test-1.md',
      'test-2.md',
      'test-foo.md'
    ];

    const path = filename.map(item => join(postDir, item));

    await Promise.all(path.map(item => writeFile(item, '')));
    const target = await newPostPath({
      path: filename[0]
    });
    target.should.eql(join(postDir, 'test-3.md'));

    await Promise.all(path.map(item => unlink(item)));
  });

  it('data is required', async () => {
    try {
      await newPostPath();
    } catch (err) {
      err.message.should.have.string('Either data.path or data.slug is required!');
    }
  });
});
