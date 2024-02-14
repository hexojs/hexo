import type { StoreFunctionData } from '../../extend/renderer';

function plainRenderer(data: StoreFunctionData): string {
  return data.text;
}

export = plainRenderer;
