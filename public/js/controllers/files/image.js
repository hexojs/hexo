define(function(require, exports, module){
  return ['$scope', '$state', '$stateParams', '$window',
    function($scope, $state, $stateParams, $window){

    var path = $stateParams.path.replace('$', '/'),
      name = $stateParams.name,
      $content = angular.element(document.getElementById('preview-modal-content'));

    $scope.title = name;
    $scope.src = path + '/' + name;

    $scope.close = function(){
      $window.history.back();
    };

    $content.css('lineHeight', ($window.innerHeight - 94) + 'px');

    angular.element($window).bind('resize', function(){
      $content.css('lineHeight', ($window.innerHeight - 94) + 'px');
    });

    $scope.destroy = function(){
      //
    };
  }]
});