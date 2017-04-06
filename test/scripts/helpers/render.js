var should = require('chai').should(); // eslint-disable-line

describe('render', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var render = require('../../../lib/plugins/helper/render')(hexo);

  before(() => hexo.init());

  it('default', () => {
    var body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    var result = render(body, 'yaml');

    result.should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });
});
