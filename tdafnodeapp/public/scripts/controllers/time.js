'use strict';

angular.module('tdafApp')
  .controller('TimeController', function ($scope, $http) {
        $scope.getTime = function getTime(){
            $http({method: 'GET', url: '/calltime'}).
                success(function(data, status, headers, config) {
                    $scope.resultTime = data;
                }).
                error(function(data, status, headers, config) {
                    $scope.resultTime = data;
                });
        };
        $scope.getDogs = function getTime(){
            $http({method: 'GET', url: '/calldogs'}).
                success(function(data, status, headers, config) {
                    $scope.resultDogs = data;
                }).
                error(function(data, status, headers, config) {
                    $scope.resultDogs = data;
                });
        };


    });
