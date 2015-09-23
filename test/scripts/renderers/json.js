'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('json', function() {
  var r = require('../../../lib/plugins/renderer/json');

  it('normal', function() {
    var data = {
      foo: 1,
      bar: {
        baz: 2
      }
    };

    r({text: JSON.stringify(data)}).should.eql(data);
  });
});
