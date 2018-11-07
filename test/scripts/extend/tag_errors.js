'use strict';

const expect = require('chai').expect;

describe('Tag Errors', () => {
  const Tag = require('../../../lib/extend/tag');

  const assertNunjucksError = (err, line, type) => {
    console.log(err.name, err.line, err.type);
    console.log(err.message);

    err.should.have.property('name', 'Nunjucks Error');
    err.should.have.property('message');
    err.should.have.property('line', line);
    err.should.have.property('type', type);
  };

  it('unknown tag', () => {
    const tag = new Tag();

    const body = [
      '{% abc %}',
      '  content',
      '{% endabc %}'
    ].join('\n');

    return tag.render(body)
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        assertNunjucksError(err, 1, 'unknown block tag: abc');
      });
  });

  it('no closing tag 1', () => {
    const tag = new Tag();

    tag.register('test',
      (args, content) => {},
      { ends: true });

    const body = [
      '{% test %}',
      '  content'
    ].join('\n');

    return tag.render(body)
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        err.should.have.property('name', 'Template render error');
        err.should.have.property('message');
        expect(err.message).to.contain('unexpected end of file');
      });
  });

  it('no closing tag 2', () => {
    const tag = new Tag();

    tag.register('test',
      (args, content) => {},
      { ends: true });

    const body = [
      '{% test %}',
      '  content',
      '{% test %}'
    ].join('\n');

    return tag.render(body)
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        err.should.have.property('name', 'Template render error');
        err.should.have.property('message');
        expect(err.message).to.contain('unexpected end of file');
      });
  });

  it('curly braces', () => {
    const tag = new Tag();

    const body = [
      '<code>{{docker ps -aq | map docker inspect -f "{{.Name}} {{.Mounts}}"}}</code>'
    ].join('\n');

    return tag.render(body)
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        assertNunjucksError(err, 1, 'expected variable end');
      });
  });

  it('nested curly braces', () => {
    const tag = new Tag();

    tag.register('test',
      (args, content) => {},
      { ends: true });

    const body = [
      '{% test %}',
      '  {{docker ps -aq | map docker inspect -f "{{.Name}} {{.Mounts}}"}}',
      '{% endtest %}'
    ].join('\n');

    return tag.render(body)
      .then(result => {
        console.log(result);
        throw new Error('should return error');
      })
      .catch(err => {
        assertNunjucksError(err, 2, 'expected variable end');
      });
  });

});
