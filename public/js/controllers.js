define(function(require, exports, module){
  var angular = require('lib/angular');

  angular.module('hexo.controllers', [])
    .controller('HeadCtrl', require('controllers/common/head'))
    .controller('MainMenuCtrl', require('controllers/common/menu'))
    .controller('HomeCtrl', require('controllers/home/index'))
    .controller('PostIndexCtrl', require('controllers/posts/index'))
    .controller('PostEditCtrl', require('controllers/posts/edit'))
    .controller('FileIndexCtrl', require('controllers/files/index'))
    .controller('FileListCtrl', require('controllers/files/list'))
    .controller('FileShowCtrl', require('controllers/files/show'))
    .controller('FileImageCtrl', require('controllers/files/image'));
});