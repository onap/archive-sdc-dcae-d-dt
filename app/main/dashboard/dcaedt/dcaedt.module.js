(function () {

    'use strict';

    angular
        .module('dcaeApp.dashboard.dcae', [])
        .config(config);

    function config($stateProvider) {

        $stateProvider.state('dcae.app.home', {
            url: '/home',
            views: {
                'content@dcae.app': {
                    templateUrl: 'main/dashboard/dcaedt/dcaedt.html',
                    controller: 'DashboardDCAEController as vm'
                }
            },
            bodyClass: 'about'
        })

            .state('dcae.app.general', {
                url: '/general',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_general.html',
                        controller: 'DashboardDCAEController as vm'
                    },
                    'leftMenu': {
                        templateUrl: 'main/dashboard/dcaedt/leftMenu.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            })

            .state('dcae.app.services', {
                url: '/services',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_services.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            })
            /*
            .state('dcae.app.general_vnf', {
                url: '/general_vnf',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_general_vnf.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },

                /*onEnter: function () {
                        //i hide header tabs, you can add your code here
                        openNav();
                    },
                onExit: function () {
                        //i hide header tabs, you can add your code here
                        closeNav();
                    }, //////////
                bodyClass: 'about'
            })
            .state('dcae.app.general_service', {
                url: '/general_service',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_general_service.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },

                /*onEnter: function () {
                        //i hide header tabs, you can add your code here
                        openNav();
                    },
                onExit: function () {
                        //i hide header tabs, you can add your code here
                        closeNav();
                    }, //////////
                bodyClass: 'about'
            })*/
            .state('dcae.app.import', {
                url: '/import',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_import.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            })
            .state('dcae.app.self_serve', {
                url: '/self_serve',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_self_serve.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            })
            .state('dcae.app.artifact', {
                url: '/artifact',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_artifact.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            })
            .state('dcae.app.comp-fe', {
                url: '/comp-fe',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'comp-fe/icecat.html',
                        controller: ''
                    }
                },
                bodyClass: 'about'
            })
            .state('dcae.app.composition', {
                url: '/composition',
                views: {
                    'content@dcae.app': {
                        templateUrl: 'main/dashboard/dcaedt/dcaedt_composition.html',
                        controller: 'DashboardDCAEController as vm'
                    }
                },
                bodyClass: 'about'
            });

    }

    function openNav() {
        document.getElementById("dcaeSidenav").style.width = "150px";
        document.getElementById("content-container").style.marginLeft = "150px";
    }

    function closeNav() {
        document.getElementById("dcaeSidenav").style.width = "0";
    }

})();
