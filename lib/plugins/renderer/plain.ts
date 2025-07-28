import type { StoreFunctionData } from '../../extend/renderer';

function plainRenderer(data: StoreFunctionData): string {
  return data.text;
}

// For ESM/CommonJS compatibility
export default plainRenderer;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = plainRenderer;
  module.exports.default = plainRenderer;
}
