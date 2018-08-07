(function () {

    'use strict';

    angular
        .module('dcaeApp.services.cacheService', [])
        .service('cacheService', function () {

            var data = {};

            this.get = function (key) {
                return data[key];
            };

            this.delete = function (key) {
                return data[key] = undefined;
            };

            this.deleteAll = function () {
                return data = {};
            };

            this.set = function (key, value) {
                if (data[key] === undefined) {
                    data[key] = value;
                } else {
                    data[key] = $.extend({}, value, data[key]);
                }
            };

            this.toString = function () {
                return data;
            };

        });

})();
