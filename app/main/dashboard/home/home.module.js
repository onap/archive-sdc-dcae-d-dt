(function () {

    'use strict';

    angular
        .module('dcaeApp.dashboard.home', [])
        .config(config);

    function config($stateProvider) {

        $stateProvider
            .state('dcae1.app.home', {
                url: '/home',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/home/home.html',
                        controller: 'DashboardHomeController as vm'
                    }
                },
                bodyClass: 'home'
            });

    }

})();
