'use strict';

function saveDatabaseFilter(){
  /* jshint validthis: true */
  if (!this.env.init) return;

  var self = this;

  return this.database.save().then(function(){
    self.log.debug('Database saved');
  });
}

module.exports = saveDatabaseFilter;