'use strict';

function saveDatabaseFilter() {
  if (!this.env.init || !this._dbLoaded) return;

  return this.database.save().then(() => {
    this.log.debug('Database saved');
  });
}

module.exports = saveDatabaseFilter;
