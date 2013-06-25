define(function(require, exports, module){
  var angular = require('lib/angular');

  angular.module('hexo.services', [])
    .service('sharedData', function(){
      var store = {
        title: 'Hexo',
        menu: '',
        styles: []
      };

      this.store = function(){
        return store;
      };
    })
    .service('loadCSS', ['sharedData', function(sharedData){
      this.load = function(path){
        var styles = sharedData.store().styles;

        if (!angular.isArray(path)) path = [path];

        for (var i = 0, len = path.length; i < len; i++){
          if (styles.indexOf(path[i]) > -1){
            path.splice(i, 1)
            i--;
            len--;
          }
        }

        sharedData.store().styles = styles.concat(path);
      };
    }]);
});