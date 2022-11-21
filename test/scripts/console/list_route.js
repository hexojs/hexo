'use strict';

const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const listRoutes = require('../../../lib/plugins/console/list/route').bind(hexo);
  const { route } = hexo;

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no route', () => {
    listRoutes();
    sinonAssert.calledWithMatch(logStub, 'Total: 0');
  });

  it('route', async () => {
    route.set('test', 'foo');

    listRoutes();
    sinonAssert.calledWithMatch(logStub, 'Total: 1');
  });
});
