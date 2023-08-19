import type { StoreFunctionData } from '../../extend/renderer';

function plainRenderer(data: StoreFunctionData) {
  return data.text;
}

export = plainRenderer;
