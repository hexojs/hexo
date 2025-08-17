import type Hexo from '../../../hexo/index.js';
import saveDatabase from './save_database.js';

const beforeExitIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_exit', saveDatabase);
};

export default beforeExitIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = beforeExitIndex;
  module.exports.default = beforeExitIndex;
}
