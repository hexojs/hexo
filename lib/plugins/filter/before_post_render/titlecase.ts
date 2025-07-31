import type { RenderData } from '../../../types.js';
import titlecase from 'titlecase';

function titlecaseFilter(this: any, data: RenderData): void {
  if (!(typeof data.titlecase !== 'undefined' ? data.titlecase : this.config.titlecase) || !data.title) return;
  data.title = titlecase(data.title);
}

// For ESM/CommonJS compatibility
export default titlecaseFilter;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = titlecaseFilter;
  module.exports.default = titlecaseFilter;
}
