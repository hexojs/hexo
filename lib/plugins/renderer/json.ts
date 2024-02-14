import type { StoreFunctionData } from '../../extend/renderer';

function jsonRenderer(data: StoreFunctionData): any {
  return JSON.parse(data.text);
}

export = jsonRenderer;
