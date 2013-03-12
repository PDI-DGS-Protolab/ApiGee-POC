'use strict';

angular.module('tdafApp')
  .controller('AuthController', function ($scope, $window) {
        $scope.onTwitterLogin = function onTwitterLogin(){
            $window.location = 'auth/twitter';
        };
        $scope.onMovistarLogin = function onMovistarLogin(){
            $window.location = 'auth/movistar';
        };
        $scope.onGoogleLogin = function onGoogleLogin(){
            $window.location = 'auth/google';
        }

  });
