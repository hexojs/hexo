import type Hexo from '../../../hexo';

const templateLocals = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('template_locals', require('./i18n'));
};

// For ESM compatibility
export default templateLocals;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = templateLocals;
  // For ESM compatibility
  module.exports.default = templateLocals;
}
