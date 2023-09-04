import type Hexo from '../../../hexo';

function saveDatabaseFilter(this: Hexo) {
  if (!this.env.init || !this._dbLoaded) return;

  return this.database.save().then(() => {
    this.log.debug('Database saved');
  });
}

export = saveDatabaseFilter;
