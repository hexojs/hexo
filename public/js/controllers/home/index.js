define(function(require, exports, module){
  return ['$scope', 'sharedData', function($scope, sharedData){
    sharedData.set('menu', '');
    sharedData.set('title', 'Hexo');
  }]
});