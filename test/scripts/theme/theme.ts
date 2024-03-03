import { join } from 'path';
import { mkdirs, rmdir, writeFile } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();

describe('Theme', () => {
  const hexo = new Hexo(join(__dirname, 'theme_test'), {silent: true});
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('getView()', () => {
    hexo.theme.setView('test.njk', '');

    // With extension name
    hexo.theme.getView('test.njk').should.have.property('path', 'test.njk');

    // Without extension name
    hexo.theme.getView('test').should.have.property('path', 'test.njk');

    // not exist
    should.not.exist(hexo.theme.getView('abc.njk'));

    hexo.theme.removeView('test.njk');
  });

  it('getView() - escape backslashes', () => {
    hexo.theme.setView('foo/bar.njk', '');

    hexo.theme.getView('foo\\bar.njk').should.have.property('path', 'foo/bar.njk');

    hexo.theme.removeView('foo/bar.njk');
  });

  it('setView()', () => {
    hexo.theme.setView('test.njk', '');

    const view = hexo.theme.getView('test.njk');
    view.path.should.eql('test.njk');

    hexo.theme.removeView('test.njk');
  });

  it('removeView()', () => {
    hexo.theme.setView('test.njk', '');
    hexo.theme.removeView('test.njk');

    should.not.exist(hexo.theme.getView('test.njk'));
  });
});
