define(function(require, exports, module){
  return ['$scope', 'sharedData', function($scope, sharedData){
    $scope.breadcrumbs = [];

    sharedData.set('title', 'Files | Hexo');
  }]
});