'use strict';

const { join } = require('path');
const { mkdirs, rmdir, unlink, writeFile } = require('hexo-fs');
const Promise = require('bluebird');

describe('view', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'view_test'), {silent: true});
  const processor = require('../../../dist/theme/processors/view');
  const process = Promise.method(processor.view.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  hexo.env.init = true;

  function newFile(options) {
    const { path } = options;

    options.params = {path};
    options.path = 'layout/' + path;
    options.source = join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    await hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const { pattern } = processor.view;

    pattern.match('layout/index.njk').path.should.eql('index.njk');
    should.not.exist(pattern.match('index.njk'));
    should.not.exist(pattern.match('view/index.njk'));
  });

  it('type: create', async () => {
    const body = [
      'foo: bar',
      '---',
      'test'
    ].join('\n');

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
