import Hexo from '../../../lib/hexo';
import renderHelper from '../../../lib/plugins/helper/render';

describe('render', () => {
  const hexo = new Hexo(__dirname);
  const render = renderHelper(hexo);

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
