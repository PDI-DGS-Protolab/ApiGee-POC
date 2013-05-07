'use strict';


angular.module('tdafApp')
  .controller('ServicesController', function ($scope, $http) {
    var addResults = function addResults(where) {
      return function(data, status, headers, config){
        $scope[where] = data;
      };
    };

    var callServiceWrapper = function callServiceWrapper(path, where){
      return function() {
        $scope[where] = null;
        $http({method: 'GET', url: path})
          .success(addResults(where))
          .error(addResults(where));
      };
    };

    ['Time', 'Dogs', 'Cats', 'Proxy'].forEach(function (service) {
       $scope['get'+service] = callServiceWrapper('/call'+service, 'result'+service);
    });

  });
