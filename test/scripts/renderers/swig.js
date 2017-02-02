'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('swig', function() {
  var r = require('../../../lib/plugins/renderer/swig');

  it('normal', function() {
    var body = [
      'Hello {{ name }}!'
    ].join('\n');

    r({text: body}, {
      name: 'world'
    }).should.eql('Hello world!');
  });

  it('override "for" tag', function() {
    var body = [
      '{% for x in arr %}',
      '{{ x }}',
      '{% endfor %}'
    ].join('');

    var data = {
      arr: {
        toArray: function() {
          return [1, 2, 3];
        }
      }
    };

    r({text: body}, data).should.eql('123');
  });

  it('compile', function() {
    var body = [
      'Hello {{ name }}!'
    ].join('\n');

    var render = r.compile({
      text: body
    });

    render({
      name: 'world'
    }).should.eql('Hello world!');
  });
});
