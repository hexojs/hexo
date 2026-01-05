import { evaluate } from '@mdx-js/mdx';
import { h, Fragment } from 'preact';
import render from 'preact-render-to-string';
import type { StoreFunctionData } from '../../extend/renderer';

async function mdxRenderer(data: StoreFunctionData): Promise<string> {
  const { text } = data;

  try {
    // Evaluate MDX content with Preact JSX runtime
    const { default: Content } = await evaluate(text, {
      Fragment,
      jsx: h,
      jsxs: h,
      development: false
    });

    // Render the MDX component to HTML string
    const html = render(h(Content, {}));

    return html;
  } catch (error) {
    throw new Error(`MDX compilation error: ${error.message}`);
  }
}

// Disable Nunjucks processing for MDX files
mdxRenderer.disableNunjucks = true;

export = mdxRenderer;
