(function () {

    'use strict';

    angular
        .module('dcaeApp')
        .config(routeConfig);

    function routeConfig($stateProvider, $urlRouterProvider, dcaeConstants) {

        //$urlRouterProvider.otherwise('/dcae/home');

        var layoutStyle = 'contentOnly';

        var layouts = {
            contentWithHeaderAndNavigation: {
                main: 'core/layouts/header-navigation-content/header-navigation-content.html',
                header: 'core/header/layouts/horizontal-navigation/header.html',
                navigation: 'core/navigation/layouts/horizontal-navigation/navigation.html'
            },
            contentOnly: {
                main: 'core/layouts/content-only/content-only.html',
                header: '',
                navigation: ''
            },
            contentWithHeader: {
                main: 'core/layouts/content-with-header/content-with-header.html',
                header: 'header/layouts/content-with-header/header.html',
                navigation: ''
            }
        };

        // @if DEBUG
        // Note: this section is removed when running grunt.
        // If you want to run the application as standalone from the dist folder you need to remove: if DEBUG and endif and build the grunt again.
        $stateProvider.state('dcae', {
            url: '/dcae',
            views: {
                'dcae@': {
                    template: '<div id="main" ui-view="main"></div>'
                }
            }
        });
        // @endif

        // State definitions
        $stateProvider
            .state('dcae.app', {
                parent: 'dcae',
                abstract: true,
                views: {
                    // This is the main view (defined in the hosting application)
                    'main@dcae': {
                        templateUrl: layouts[layoutStyle].main,
                        controller: 'MainController as vm'
                    }/*,

                    // According to the view used in "main@" we have another 3 views in main: 'header@app', 'navigation@app' and 'content@app' (defined in each page module)
                    'header@dcae.app': { // View inside the main
                        templateUrl: layouts[layoutStyle].header,
                        controller: 'HeaderController as vm'
                    },
                    'navigation@dcae.app': { // View inside the main
                        templateUrl: layouts[layoutStyle].navigation,
                        controller: 'NavigationController as vm'
                    }*/
                }
            });

    }

})();
