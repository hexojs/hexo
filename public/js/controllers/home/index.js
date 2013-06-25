define(function(require, exports, module){
  return ['$scope', 'sharedData', function($scope, sharedData){
    sharedData.store().menu = '';
    sharedData.store().title = 'Hexo';
  }]
});