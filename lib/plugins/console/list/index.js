'use strict';

var store = {
  page: require('./page'),
  post: require('./post'),
  route: require('./route'),
  tag: require('./tag')
};

function listConsole(args){
  /* jshint validthis: true */
  var type = args._.shift();
  var self = this;

  // Display help message if user didn't input any arguments
  if (!type || !store.hasOwnProperty(type)){
    return this.call('help', {_: ['list']});
  }

  return this.load().then(function(){
    return store[type].call(self, args);
  });
}

module.exports = listConsole;