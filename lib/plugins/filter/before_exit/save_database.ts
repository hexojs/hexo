import type Hexo from '../../../hexo';

function saveDatabaseFilter(this: Hexo): Promise<void> {
  if (!this.env.init || !this._dbLoaded) return;

  return this.database.save().then(() => {
    this.log.debug('Database saved');
  });
}

export default saveDatabaseFilter;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = saveDatabaseFilter;
  module.exports.default = saveDatabaseFilter;
}
