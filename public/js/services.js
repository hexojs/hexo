define(function(require, exports, module){
  var angular = require('lib/angular');

  angular.module('hexo.services', [])
    .factory('sharedData', function(){
      var store = {};

      store.get = function(key){
        return this[key];
      };

      store.set = function(key, value){
        this[key] = value;
        return this;
      };

      return store;
    });
});