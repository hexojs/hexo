import r from '../../../lib/plugins/renderer/yaml';

describe('yaml', () => {
  it('normal', () => {
    r({text: 'foo: 1'}).should.eql({foo: 1});
  });

  it('escape', () => {
    const body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    r({text: body}).should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });
});
