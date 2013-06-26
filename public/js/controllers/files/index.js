define(function(require, exports, module){
  return ['$scope', '$http', 'sharedData', function($scope, $http, sharedData){
    sharedData.set('menu', 'files');
    sharedData.set('title', 'Files | Hexo');
  }]
});