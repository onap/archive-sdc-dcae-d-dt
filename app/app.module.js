(function () {

    'use strict';

    angular
        .module('dcaeApp', [

            // Core
            'ui.router',
            'dcaeApp.env',

            // Modules
            'dcaeApp.header',
            'dcaeApp.navigation',
            'dcaeApp.main',
            'dcaeApp.dashboard.home',
            'dcaeApp.dashboard.about',
            'dcaeApp.dashboard.dcae',

            // Services
            'dcaeApp.services.cacheService',
            'dcaeApp.services.users'

            // Interceptors

            // Main pages

        ]);
})();
