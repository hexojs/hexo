'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('view', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'view_test'), {silent: true});
  const processor = require('../../../lib/theme/processors/view');
  const process = Promise.method(processor.process.bind(hexo));
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');

  hexo.env.init = true;

  function newFile(options) {
    const path = options.path;

    options.params = {path};
    options.path = 'layout/' + path;
    options.source = pathFn.join(themeDir, options.path);

    return new hexo.theme.File(options);
  }

  before(() => Promise.all([
    fs.mkdirs(themeDir),
    fs.writeFile(hexo.config_path, 'theme: test')
  ]).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = processor.pattern;

    pattern.match('layout/index.swig').path.should.eql('index.swig');
    should.not.exist(pattern.match('index.swig'));
    should.not.exist(pattern.match('view/index.swig'));
  });

  it('type: create', () => {
    const body = [
      'foo: bar',
      '---',
      'test'
    ].join('\n');

    const file = newFile({
      path: 'index.swig',
      type: 'create'
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const view = hexo.theme.getView('index.swig');

      view.path.should.eql('index.swig');
      view.source.should.eql(pathFn.join(themeDir, 'layout', 'index.swig'));
      view.data.should.eql({
        foo: 'bar',
        _content: 'test'
      });
    }).finally(() => {
      hexo.theme.removeView('index.swig');
      return fs.unlink(file.source);
    });
  });

  it('type: delete', () => {
    const file = newFile({
      path: 'index.swig',
      type: 'delete'
    });

    return process(file).then(() => {
      should.not.exist(hexo.theme.getView('index.swig'));
    });
  });
});
