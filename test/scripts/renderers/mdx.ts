import r from '../../../lib/plugins/renderer/mdx';

describe('mdx', () => {
  it('should render basic MDX content', async () => {
    const result = await r({ text: '# Hello World' });
    result.should.include('<h1>Hello World</h1>');
  });

  it('should render MDX with bold text', async () => {
    const result = await r({ text: 'This is **bold** text.' });
    result.should.include('<strong>bold</strong>');
  });

  it('should render MDX with links', async () => {
    const result = await r({ text: '[Link](https://example.com)' });
    result.should.include('<a href="https://example.com">Link</a>');
  });

  it('should render MDX with multiple elements', async () => {
    const mdxContent = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[Link](https://example.com)`;

    const result = await r({ text: mdxContent });
    result.should.include('<h1>Title</h1>');
    result.should.include('<strong>bold</strong>');
    result.should.include('<em>italic</em>');
    result.should.include('<li>List item 1</li>');
    result.should.include('<a href="https://example.com">Link</a>');
  });

  it('should handle errors gracefully', async () => {
    try {
      // Invalid MDX syntax - JSX that can't be evaluated
      await r({ text: '<Component with invalid syntax', path: 'test.mdx' });
      throw new Error('Should have thrown an error');
    } catch (error) {
      error.message.should.include('MDX compilation error');
      error.message.should.include('test.mdx');
    }
  });

  it('should have disableNunjucks flag set', () => {
    r.disableNunjucks.should.be.true;
  });
});
