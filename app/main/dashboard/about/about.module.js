(function () {

    'use strict';

    angular
        .module('dcaeApp.dashboard.about', [])
        .config(config);

    function config($stateProvider) {

        $stateProvider.state('dcae.app.about', {
            url: '/about',
            views: {
                'content@dcae.app': {
                    templateUrl: 'main/dashboard/about/about.html',
                    controller: 'DashboardAboutController as vm'
                }
            },
            bodyClass: 'about'
        });

    }

})();
