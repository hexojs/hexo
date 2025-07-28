import type Hexo from '../../../hexo';

const beforeExitIndex = (ctx: Hexo) => {
  const { filter } = ctx.extend;

  filter.register('before_exit', require('./save_database'));
};

export default beforeExitIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = beforeExitIndex;
  module.exports.default = beforeExitIndex;
}
