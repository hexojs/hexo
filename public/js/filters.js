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
    })
    .filter('size', function(){
      var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        length = units.length;

      return function(size){
        for (var i = 0; i < length; i++){
          if (size / 1024 < 1){
            return size + ' ' + units[i];
          } else {
            size /= 1024;
          }
        }
      }
    });
});