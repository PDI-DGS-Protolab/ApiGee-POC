
angular.module('tdafApp')
    .controller('AuthController', function ($scope, Auth) {
        $scope.auth = Auth.query();
    });
