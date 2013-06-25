define(function(require, exports, module){
  var $ = require('lib/jquery');

  return ['$scope', '$http', '$state', 'sharedData', 'loadCSS', 'apiBaseUrl', 'templateBaseUrl',
    function($scope, $http, $state, sharedData, loadCSS, apiBaseUrl, templateBaseUrl){

    sharedData.store().menu = 'posts';
    sharedData.store().title = 'Posts | Hexo';
    loadCSS.load('posts/index');

    $scope.modal = {
      options: {
        backdropFade: true,
        dialogFade: true
      },
      show: false,
      open: function(){
        $scope.modal.show = true;
      },
      close: function(){
        $scope.modal.show = false;
      },
      submit: function(){
        $scope.modal.close();

        if (!$scope.modal.data.title) return;

        $http.post(apiBaseUrl + 'posts', $scope.modal.data)
          .success(function(data){
            $scope.posts.unshift({
              id: data._id,
              title: data.title,
              date: data.date
            });

            $scope.modal.data = {};
            $scope.edit(data._id);
          });
      }
    };

    $scope.edit = function(id){
      $state.transitionTo('posts.edit', {id: id});
    };

    $scope.search = function(){
      $('#post-search-input').focus();
    };

    $http.get(apiBaseUrl + 'posts').success(function(data){
      $scope.posts = data;
    });
  }]
});