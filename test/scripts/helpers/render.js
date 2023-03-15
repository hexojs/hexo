'use strict';

describe('render', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const render = require('../../../dist/plugins/helper/render')(hexo);

  before(() => hexo.init());

  it('default', () => {
    const body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    const result = render(body, 'yaml');

    result.should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });
});
