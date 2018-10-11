const should = require('chai').should(); // eslint-disable-line

describe('json', () => {
  const r = require('../../../lib/plugins/renderer/json');

  it('normal', () => {
    const data = {
      foo: 1,
      bar: {
        baz: 2
      }
    };

    r({text: JSON.stringify(data)}).should.eql(data);
  });
});
