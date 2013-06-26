define(function(require, exports, module){
  var $ = require('lib/jquery');

  return ['$scope', '$http', '$state', '$stateParams', '$filter', 'apiBaseUrl', 'templateBaseUrl',
    function($scope, $http, $state, $stateParams, $filter, apiBaseUrl, templateBaseUrl){

    var id = $stateParams.id,
      editor;

    $scope.$parent.selected = id;

    $scope.save = function(){
      var post = $scope.post;

      $scope.status = 'Saving...';

      $http.put(apiBaseUrl + 'posts/' + id, {content: post.content})
        .success(function(data){
          var parent = $filter('getById')($scope.$parent.posts, id);

          parent.title = data.title;
          parent.date = data.date;

          $scope.status = 'Saved';
        })
        .error(function(){
          $scope.status = 'Save failed';
        });
    };

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
        var posts = $scope.$parent.posts;

        for (var i = 0, len = posts.length; i < len; i++){
          var item = posts[i];

          if (item.id == id){
            posts.splice(i, 1);
            break;
          }
        }

        $scope.modal.close();
        $scope.$apply();
        $http.delete(apiBaseUrl + 'posts/' + id);
        $scope.$parent.selected = 0;
        $state.transitionTo('posts');
      }
    };

    $scope.bold = function(){
      //editor.replace('1234');
    };

    $scope.italic = function(){
      //
    };

    $scope.link = function(){
      //
    };

    $scope.picture = function(){
      //
    };

    $scope.fullscreen = function(){
      if ($scope.isFullscreen){
        $('#post-edit').removeClass('fullscreen');
      } else {
        $('#post-edit').addClass('fullscreen');
      }

      $scope.isFullscreen = !$scope.isFullscreen;
      editor.resize();
    };

    $http.get(apiBaseUrl + 'posts/' + id)
      .success(function(data){
        $scope.post = data;
      })
      .error(function(){
        $state.transitionTo('posts');
      });

    $scope.$on('$viewContentLoaded', function(){
      editor = $scope.editor;

      var session = editor.getSession(),
        renderer = editor.renderer;

      editor.setHighlightActiveLine(false);
      editor.setFontSize(14);
      editor.setTheme('ace/theme/tomorrow');
      session.setMode('ace/mode/markdown');
      session.setTabSize(2);
      session.setUseSoftTabs(true);
      session.setUseWrapMode(true);
      renderer.setShowGutter(false);
      renderer.setShowPrintMargin(false);
    });
  }]
});