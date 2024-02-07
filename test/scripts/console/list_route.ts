import { stub, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import listRoute from '../../../lib/plugins/console/list/route';
type OriginalParams = Parameters<typeof listRoute>;
type OriginalReturn = ReturnType<typeof listRoute>;

describe('Console list', () => {
  const hexo = new Hexo(__dirname);

  const listRoutes: (...args: OriginalParams) => OriginalReturn = listRoute.bind(hexo);
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
