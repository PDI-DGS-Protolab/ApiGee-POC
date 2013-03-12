'use strict';

angular.module('tdafApp')
    .controller('UserController', function ($scope, User) {
        $scope.user = User.query();
    });
