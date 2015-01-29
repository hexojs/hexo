'use strict';

var Promise = require('bluebird');

function stopWatcherFilter(){
  /* jshint validthis: true */
  return Promise.all([
    stopWatcher(this.source),
    stopWatcher(this.theme)
  ]);
}

function stopWatcher(box){
  if (box.isWatching()) return box.unwatch();
}

module.exports = stopWatcherFilter;