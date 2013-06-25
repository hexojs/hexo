define(function(require, exports, module){
  return ['$scope', '$http', 'sharedData', function($scope, $http, sharedData){
    sharedData.store().menu = 'files';
    sharedData.store().title = 'Files | Hexo';
  }]
});