import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { stub, assert as sinonAssert } from 'sinon';
import Hexo from '../../../lib/hexo';
import listRoute from '../../../lib/plugins/console/list/route';
type OriginalParams = Parameters<typeof listRoute>;
type OriginalReturn = ReturnType<typeof listRoute>;

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('Console list', () => {
  const hexo = new Hexo(__hexo_dirname);

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
