'use strict';

const { join } = require('path');
const expect = require('chai').expect;
const findYarnRootWorkspace = require('../lib/hexo/findYarnRootWorkspace');

// npx c8 --reporter=lcovonly mocha --timeout=7000000 test/find-yarn-root-workspace.test.js

describe('find workspace root directory', () => {
  const rootWorkspace = join(__dirname, 'fixtures/yarn-workspace');
  it('search from fixtures/yarn-workspace/site', () => {
    const find = findYarnRootWorkspace({ base_dir: join(__dirname, 'fixtures/yarn-workspace/site') });
    expect(find).to.be.equal(rootWorkspace);
  });
  it('search from fixtures/yarn-workspace/packages/theme', () => {
    const find = findYarnRootWorkspace({ base_dir: join(__dirname, 'fixtures/yarn-workspace/packages/theme') });
    expect(find).to.be.equal(rootWorkspace);
  });
});
