'use strict';

const { join } = require('path');
const { readFile, unlink, writeFile } = require('hexo-fs');

describe('Update package.json', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const updatePkg = require('../../../lib/hexo/update_package');
  const packagePath = join(hexo.base_dir, 'package.json');

  beforeEach(() => {
    hexo.env.init = false;
  });

  it('package.json does not exist', async () => {
    await updatePkg(hexo);
    hexo.env.init.should.be.false;
  });

  it('package.json exists, but the version doesn\'t match', async () => {
    const pkg = {
      hexo: {
        version: '0.0.1'
      }
    };

    await writeFile(packagePath, JSON.stringify(pkg));
    await updatePkg(hexo);
    const content = await readFile(packagePath);
    JSON.parse(content).hexo.version.should.eql(hexo.version);
    hexo.env.init.should.be.true;

    await unlink(packagePath);
  });

  it('package.json exists, but don\'t have hexo data', async () => {
    const pkg = {
      name: 'hexo',
      version: '0.0.1'
    };

    await writeFile(packagePath, JSON.stringify(pkg));
    await updatePkg(hexo);
    const content = await readFile(packagePath);
    // Don't change the original package.json
    JSON.parse(content).should.eql(pkg);
    hexo.env.init.should.be.false;

    await unlink(packagePath);
  });

  it('package.json exists and everything is ok', async () => {
    const pkg = {
      hexo: {
        version: hexo.version
      }
    };

    await writeFile(packagePath, JSON.stringify(pkg));
    await updatePkg(hexo);
    const content = await readFile(packagePath);
    JSON.parse(content).should.eql(pkg);
    hexo.env.init.should.be.true;

    await unlink(packagePath);
  });
});
