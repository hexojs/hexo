'use strict';

function saveDatabaseFilter() {
  if (!this.env.init) return;

  const self = this;

  return this.database.save().then(() => {
    self.log.debug('Database saved');
  });
}

module.exports = saveDatabaseFilter;
