'use strict';

angular.module('tdafApp', ['tdafApp.services'])
  .config(function ($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: '/views/login.html'
        })
        .when('/auth', {
            templateUrl: '/views/auth.html'
        })
      .otherwise({
        redirectTo: '/login'
      });
  });
