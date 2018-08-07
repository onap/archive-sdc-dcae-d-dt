(function () {

    'use strict';

    var dcaeFactory = function ($http, appSettings) {

        var factory = {};

        factory.getVNFList = function () {
            return $http.get(window.host + 'getResourcesByCategory');
        };

        factory.postData = function (url, data, config) {
            return $http.post(url, data, config);
        };

        return factory;
    };

    dcaeFactory.$inject = ['$http', 'appSettings'];

    angular
        .module('dcaeApp.dashboard.dcae')
        .factory('dcaeFactory', dcaeFactory);


})();
