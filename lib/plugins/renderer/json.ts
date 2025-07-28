import type { StoreFunctionData } from '../../extend/renderer.js';

function jsonRenderer(data: StoreFunctionData): any {
  return JSON.parse(data.text);
}

// For ESM/CommonJS compatibility
export default jsonRenderer;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = jsonRenderer;
  module.exports.default = jsonRenderer;
}
