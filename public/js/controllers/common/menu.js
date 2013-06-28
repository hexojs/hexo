define(function(require, exports, module){
  return ['$scope', 'sharedData', function($scope, sharedData){    
    $scope.data = sharedData;
  }]
});