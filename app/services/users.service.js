(function () {

    'use strict';

    angular.module('dcaeApp.services.users', [])

        .service('usersService', ['$http', '$q', 'cacheService', function ($http, $q, cacheService) {

            var urls = cacheService.get("configuration").urls;

            this.login = function (postData) {
                var deferred = $q.defer();
                $http.post(urls.auth.login, postData).success(function (data, status, headers, config) {
                    deferred.resolve({data: data, status: status});
                }).error(function (data, status, headers, config) {
                    deferred.reject({message: data, status: status});
                });
                return deferred.promise;
            };

            this.register = function (postData) {
                var deferred = $q.defer();
                $http.post(urls.auth.register, postData).success(function (data, status, headers, config) {
                    deferred.resolve({data: data, status: status});
                }).error(function (data, status, headers, config) {
                    deferred.reject({message: data, status: status});
                });
                return deferred.promise;
            };

        }]);

})();
