var should = require('chai').should(); // eslint-disable-line

describe('json', () => {
  var r = require('../../../lib/plugins/renderer/json');

  it('normal', () => {
    var data = {
      foo: 1,
      bar: {
        baz: 2
      }
    };

    r({text: JSON.stringify(data)}).should.eql(data);
  });
});
