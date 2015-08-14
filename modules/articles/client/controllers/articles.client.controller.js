'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Articles',
  function ($scope,$http,$stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function () {
      // Create new Article object
      var article = new Articles({
        title: this.title,
        content: this.content

      });

      // Redirect after save
      article.$save(function (response) {
        $location.path('articles/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Article
    $scope.remove = function (article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };

    // Update existing Article
    $scope.update = function () {
      var article = $scope.article;
      article.comments = $scope.comments;
      article.$update(function () {
        $location.path('articles/' + article._id);
        $scope.comments = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function () {
      $scope.articles = Articles.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
    
    $scope.approveComment =  function(commentId){
      var article = $scope.article;
      $http({
        url: 'api/articles/' + article._id + '/approve',
        method: 'POST',
        data: { 'commentId' : commentId }
      })
      .then(function(response) {
            // success
            article.comments = response.data;
            article.$update(function () {
              $location.path('articles/' + article._id);
              $scope.comments = '';
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });

          }, 
          function(response) { 
            // failed
          });
    };


    $scope.comment = function(comment) {
          var article = $scope.article;
      $http({
        url: 'api/articles/' + article._id + '/comment',
        method: 'POST',
        data: { 'comment' : $scope.comments }
      })
      .then(function(response) {
            // success
            article.comments = response.data;
            article.$update(function () {
              $location.path('articles/' + article._id);
              $scope.comments = '';
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
              $scope.flash_notify = true;
          }, 
          function(response) { 
            // failed
          });
    };

  }
  ]);
