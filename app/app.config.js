(function () {
    'use strict';

    angular
        .module('dcaeApp')
        .factory('httpRequestInterceptor', function ($injector, $rootScope) {
            var httpRequestInterceptor = {
                request: function (config) {
                    // Send the user only for API requests
                    var userId = "";
                    if ($rootScope.baseURL.indexOf('localhost') !== -1) {
                        // if (config.url.indexOf($rootScope.baseURL) !== -1) {
                        config.headers = config.headers || {};
                        userId = 'ym903w';
                        // userId = $injector     .get('Sdc.Services.CookieService')     .getUserId();
                        var user = {
                            userId: userId
                        };
                        if (user) {
                            config.headers['USER_ID'] = user.userId;
                        }
                        // }
                    } else {
                        config.headers = config.headers || {};
                        var user = {
                            userId: window.userId
                        };
                        userId = window.userId;
                        // var user = {     userId: $rootScope.cookieUser }; userId =
                        // $rootScope.cookieUser;
                        if (user) {
                            config.headers['USER_ID'] = user.userId;
                            console.log('Your User is:', user.userId);
                        } else {
                            console.log('Error look on your grunt file you dont have a user set');
                        }

                    }
                    $rootScope.userId = userId;
                    return config;
                }
            };
            return httpRequestInterceptor;
        })
        .config(config);

    function config($httpProvider) {

        // Ask for cross domain from the sever (need to allow this in server).
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $httpProvider
            .interceptors
            .push('httpRequestInterceptor');

        // HTTP Interceptor definition
        /*$httpProvider.interceptors.push('httpRequestInterceptor');
        $httpProvider.interceptors.push('httpResponseInterceptor');
        $httpProvider.interceptors.push('httpRequestErrorInterceptor');
        $httpProvider.interceptors.push('httpResponseErrorInterceptor');*/

    }

})();
