import Tag from '../../../lib/extend/tag';

describe('Tag Errors', () => {
  const assertNunjucksError = (err, line, type) => {
    err.should.have.property('name', 'Nunjucks Error');
    err.should.have.property('message');
    err.should.have.property('line', line);
    err.should.have.property('type', type);
  };

  it('unknown tag', async () => {
    const tag = new Tag();

    const body = [
      '{% abc %}',
      '  content',
      '{% endabc %}'
    ].join('\n');

    try {
      await tag.render(body);
    } catch (err) {
      assertNunjucksError(err, 1, 'unknown block tag: abc');
    }
  });

  it('no closing tag 1', async () => {
    const tag = new Tag();

    tag.register('test',
      (_args, _content) => { return ''; },
      { ends: true });

    const body = [
      '{% test %}',
      '  content'
    ].join('\n');

    try {
      await tag.render(body);
    } catch (err) {
      err.should.have.property('name', 'Template render error');
      err.should.have.property('message');
      err.message.should.have.string('unexpected end of file');
    }
  });

  it('no closing tag 2', async () => {
    const tag = new Tag();

    tag.register('test',
      (_args, _content) => { return ''; },
      { ends: true });

    const body = [
      '{% test %}',
      '  content',
      '{% test %}'
    ].join('\n');

    try {
      await tag.render(body);
    } catch (err) {
      err.should.have.property('name', 'Template render error');
      err.should.have.property('message');
      err.message.should.have.string('unexpected end of file');
    }
  });

  it('curly braces', async () => {
    const tag = new Tag();

    const body = [
      '<code>{{docker ps -aq | map docker inspect -f "{{.Name}} {{.Mounts}}"}}</code>'
    ].join('\n');

    try {
      await tag.render(body);
    } catch (err) {
      assertNunjucksError(err, 1, 'expected variable end');
    }
  });

  it('nested curly braces', async () => {
    const tag = new Tag();

    tag.register('test',
      (_args, _content) => { return ''; },
      { ends: true });

    const body = [
      '{% test %}',
      '  {{docker ps -aq | map docker inspect -f "{{.Name}} {{.Mounts}}"}}',
      '{% endtest %}'
    ].join('\n');

    try {
      await tag.render(body);
    } catch (err) {
      assertNunjucksError(err, 2, 'expected variable end');
    }
  });

  it('source file path', async () => {
    const source = '_posts/hello-world.md';
    const tag = new Tag();

    tag.register('test',
      (_args, _content) => { return ''; },
      { ends: true });

    const body = [
      '{% test %}',
      '  {{docker ps -aq | map docker inspect -f "{{.Name}} {{.Mounts}}"}}',
      '{% endtest %}'
    ].join('\n');

    try {
      // Add { source } as option
      await tag.render(body, { source });
    } catch (err) {
      err.message.should.contains(source);
    }
  });

  it('source file path 2', async () => {
    const source = '_posts/hello-world.md';
    const tag = new Tag();

    tag.register('test',
      (_args, _content) => { return ''; },
      { ends: true });

    const body = [
      '{% test %}',
      '${#var}',
      '{% endtest %}'
    ].join('\n');

    try {
      await tag.render(body, { source });
    } catch (err) {
      err.should.have.property('message');
      err.message.should.contains(source);
    }
  });
});
