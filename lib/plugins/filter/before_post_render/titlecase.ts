import type { RenderData } from '../../../types';

let titlecase: (str: string) => string;

function titlecaseFilter(data: RenderData): void {
  if (!(typeof data.titlecase !== 'undefined' ? data.titlecase : this.config.titlecase) || !data.title) return;

  if (!titlecase) titlecase = require('titlecase');
  data.title = titlecase(data.title);
}

// For ESM/CommonJS compatibility
export default titlecaseFilter;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = titlecaseFilter;
  module.exports.default = titlecaseFilter;
}
