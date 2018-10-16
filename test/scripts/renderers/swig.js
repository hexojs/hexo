require('chai').should(); // eslint-disable-line strict

describe('swig', () => {
  const r = require('../../../lib/plugins/renderer/swig');

  it('normal', () => {
    const body = [
      'Hello {{ name }}!'
    ].join('\n');

    r({text: body}, {
      name: 'world'
    }).should.eql('Hello world!');
  });

  it('override "for" tag', () => {
    const body = [
      '{% for x in arr %}',
      '{{ x }}',
      '{% endfor %}'
    ].join('');

    const data = {
      arr: {
        toArray() {
          return [1, 2, 3];
        }
      }
    };

    r({text: body}, data).should.eql('123');
  });

  it('compile', () => {
    const body = [
      'Hello {{ name }}!'
    ].join('\n');

    const render = r.compile({
      text: body
    });

    render({
      name: 'world'
    }).should.eql('Hello world!');
  });
});
