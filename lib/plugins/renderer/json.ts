import type { StoreFunctionData } from '../../extend/renderer';

function jsonRenderer(data: StoreFunctionData) {
  return JSON.parse(data.text);
}

export = jsonRenderer;
