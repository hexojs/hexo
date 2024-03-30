import pathFn from 'path';
import { mkdirs, writeFile, rmdir } from 'hexo-fs';
// @ts-ignore
import Promise from 'bluebird';
import Hexo from '../../../lib/hexo';
import fragmentCache from '../../../lib/plugins/helper/fragment_cache';
import partialHelper from '../../../lib/plugins/helper/partial';
import chai from 'chai';
const should = chai.should();
type PartialHelperParams = Parameters<ReturnType<typeof partialHelper>>;
type PartialHelperReturn = ReturnType<ReturnType<typeof partialHelper>>;

describe('partial', () => {
  const hexo = new Hexo(pathFn.join(__dirname, 'partial_test'), {silent: true});
  const themeDir = pathFn.join(hexo.base_dir, 'themes', 'test');
  const viewDir = pathFn.join(themeDir, 'layout') + pathFn.sep;
  const viewName = 'article.njk';

  const ctx: any = {
    site: hexo.locals,
    config: hexo.config,
    view_dir: viewDir,
    filename: pathFn.join(viewDir, 'post', viewName),
    foo: 'foo',
    cache: true
  };

  ctx.fragment_cache = fragmentCache(hexo);

  hexo.env.init = true;

  const partial: (...args: PartialHelperParams) => PartialHelperReturn = partialHelper(hexo).bind(ctx);

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    await hexo.init();
    hexo.theme.setView('widget/tag.njk', 'tag widget');
  });

  after(() => rmdir(hexo.base_dir));

  it('default', () => {
    // relative path
    partial('../widget/tag').should.eql('tag widget');

    // absolute path
    partial('widget/tag').should.eql('tag widget');

    // not found
    should.throw(
      () => partial('foo'),
      `Partial foo does not exist. (in ${pathFn.join('post', viewName)})`
    );
  });

  it('locals', () => {
    hexo.theme.setView('test.njk', '{{ foo }}');

    partial('test', {foo: 'bar'}).should.eql('bar');
  });

  it('cache', () => {
    hexo.theme.setView('test.njk', '{{ foo }}');

    partial('test', {foo: 'bar'}, {cache: true}).should.eql('bar');
    partial('test', {}, {cache: true}).should.eql('bar');

    partial('test', {foo: 'baz'}, {cache: 'ash'}).should.eql('baz');
    partial('test', {}, {cache: 'ash'}).should.eql('baz');
  });

  it('only', () => {
    hexo.theme.setView('test.njk', '{{ foo }}{{ bar }}');

    partial('test', {bar: 'bar'}, {only: true}).should.eql('bar');
  });

  it('a partial in another partial', () => {
    hexo.theme.setView('partial/a.njk', '{{ partial("b") }}');
    hexo.theme.setView('partial/b.njk', '{{ partial("c") }}');
    hexo.theme.setView('partial/c.njk', 'c');

    partial('partial/a').should.eql('c');
  });

  it('name must be a string', () => {
    // @ts-ignore
    should.throw(() => partial(), 'name must be a string!');
  });
});
