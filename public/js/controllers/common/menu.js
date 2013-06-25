define(function(require, exports, module){
  return ['$scope', 'sharedData', function($scope, sharedData){    
    $scope.data = sharedData.store();

    $scope.menu = [
      {href: 'posts', title: 'Posts'},
      {href: 'files', title: 'Files'}
    ];
  }]
});