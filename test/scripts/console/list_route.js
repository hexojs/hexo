'use strict';

const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  const listRoutes = require('../../../dist/plugins/console/list/route').bind(hexo);
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
    route.remove('test');
  });

  it('route with nodes', async () => {
    route.set('test0/test1', 'foo');

    listRoutes();
    sinonAssert.calledWithMatch(logStub, 'Total: 1');
    sinonAssert.calledWithMatch(logStub, '└─┬ test0');
    sinonAssert.calledWithMatch(logStub, '  └── test1');
  });
});
