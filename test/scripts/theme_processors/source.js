'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('source', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'source_test'), {silent: true});
  const processor = require('../../../lib/theme/processors/source');
  const process = Promise.method(processor.process.bind(hexo));
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  const Asset = hexo.model('Asset');

  function newFile(options) {
    const path = options.path;

    options.params = {path};
    options.path = 'source/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(async () => {
    await Promise.all([
      fs.mkdirs(themeDir),
      fs.writeFile(hexo.config_path, 'theme: test')
    ]);
    hexo.init();
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = processor.pattern;

    pattern.match('source/foo.jpg').should.eql({path: 'foo.jpg'});
    pattern.match('source/_foo.jpg').should.be.false;
    pattern.match('source/foo/_bar.jpg').should.be.false;
    pattern.match('source/foo.jpg~').should.be.false;
    pattern.match('source/foo.jpg%').should.be.false;
    pattern.match('layout/foo.swig').should.be.false;
    pattern.match('package.json').should.be.false;
    pattern.match('node_modules/test/test.js').should.be.false;
    pattern.match('source/node_modules/test/test.js').should.be.false;
  });

  it('type: create', async () => {
    const file = newFile({
      path: 'style.css',
      type: 'create'
    });

    const id = 'themes/test/' + file.path;

    await fs.writeFile(file.source, 'test');
    await process(file);
    const asset = Asset.findById(id);

    asset._id.should.eql(id);
    asset.path.should.eql(file.params.path);
    asset.modified.should.be.true;

    asset.remove();

    fs.unlink(file.source);
  });

  it('type: update', async () => {
    const file = newFile({
      path: 'style.css',
      type: 'update'
    });

    const id = 'themes/test/' + file.path;

    await Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.params.path,
        modified: false
      })
    ]);
    await process(file);
    const asset = Asset.findById(id);

    asset.modified.should.be.true;

    await Promise.all([
      fs.unlink(file.source),
      Asset.removeById(id)
    ]);
  });

  it('type: skip', async () => {
    const file = newFile({
      path: 'style.css',
      type: 'skip'
    });

    const id = 'themes/test/' + file.path;

    await Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.params.path,
        modified: false
      })
    ]);
    await process(file);
    const asset = Asset.findById(id);

    asset.modified.should.be.false;
    await Promise.all([
      fs.unlink(file.source),
      Asset.removeById(id)
    ]);
  });

  it('type: delete', async () => {
    const file = newFile({
      path: 'style.css',
      type: 'delete'
    });

    const id = 'themes/test/' + file.path;

    await Asset.insert({
      _id: id,
      path: file.params.path
    });
    await process(file);
    should.not.exist(Asset.findById(id));
  });
});
