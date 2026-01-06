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

  it('should render JSX elements', async () => {
    const jsxContent = `# JSX Test

<div className="custom">
  This is a **JSX element**.
</div>`;

    const result = await r({ text: jsxContent });
    result.should.include('<h1>JSX Test</h1>');
    result.should.include('<div class="custom">');
    result.should.include('<strong>JSX element</strong>');
  });

  it('should render JSX with expressions', async () => {
    const jsxWithExpressions = `# Dynamic Content

<div className="year">
  Year: {2024}
</div>`;

    const result = await r({ text: jsxWithExpressions });
    result.should.include('<h1>Dynamic Content</h1>');
    result.should.include('<div class="year">');
    result.should.include('Year: 2024');
  });

  it('should render JSX with inline styles', async () => {
    const jsxWithStyles = `<div style={{color: 'red', padding: '10px'}}>
  Styled content
</div>`;

    const result = await r({ text: jsxWithStyles });
    result.should.include('color:red');
    result.should.include('padding:10px');
    result.should.include('Styled content');
  });

  it('should render custom components', async () => {
    const customComponent = `export const Alert = ({children, type}) => (
  <div className={\`alert-\${type}\`}>
    {children}
  </div>
);

<Alert type="warning">
  This is a **warning**!
</Alert>`;

    const result = await r({ text: customComponent });
    result.should.include('alert-warning');
    result.should.include('<strong>warning</strong>');
  });
});
