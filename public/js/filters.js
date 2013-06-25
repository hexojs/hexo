define(function(require, exports, module){
  var angular = require('lib/angular'),
    moment = require('lib/moment'),
    config = module.config().config;

  if (config.language){
    require('lib/moment/lang/' + config.language.toLowerCase());
  }

  angular.module('hexo.filters', [])
    .filter('getById', function(){
      return function(arr, id){
        for (var i = 0, len = arr.length; i < len; i++){
          var item = arr[i];

          if (+item.id == +id){
            return item;
          }
        }
      }
    })
    .filter('moment', function(){
      return moment;
    });
});