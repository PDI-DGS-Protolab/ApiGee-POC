angular.module('tdafApp.services', ['ngResource']).
    factory('User', function($resource){
        return $resource('user', {}, {
            query: {method:'GET', isArray:false}
        });
    });