angular.module('tdafApp.services', ['ngResource']).
    factory('Auth', function($resource){
        return $resource('authinfo', {}, {
            query: {method:'GET', isArray:false}
        });
    });