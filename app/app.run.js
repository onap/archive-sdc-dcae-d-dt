(function () {

    'use strict';

    angular
        .module('dcaeApp')
        .run(runBlock);

    function runBlock($rootScope, $timeout, $state, cacheService, ENV) {

        $rootScope.user = {};

        // Show loading circle
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function () {
            $rootScope.loadingProgress = true;
        });

        // Hide loading circle
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function () {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // Cleanup
        $rootScope.$on('$destroy', function () {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });

        // Load configuration
        $rootScope.baseURL = ENV.apiBase;
        window.host = ENV.host;
        $rootScope.catalogImport = ENV.catalogImport;
        window.catalogImport = ENV.catalogImport;
        window.catalogPrefix = ENV.catalogPrefix;
        $rootScope.cookieUser = ENV.cookieUser;
        window.ruleEditorUrl = ENV.ruleEditorUrl;
        // debugger;

        cacheService.set('configuration', {
            "urls": {
                "auth": {
                    "login": $rootScope.baseURL + "dcaeApp/v1/engmgr/login",
                    "register": $rootScope.baseURL + "dcaeApp/v1/engmgr/signup"
                }
            }
        });

        /*$rootScope.$on('$stateChangeStart', function(e, to, toP, from, fromP) {
            to.views['item-'+toP.itemId+'@home'] = to.views['item-:itemId@home'];
            delete to.views['item-:itemId@home'];
        });*/

    }
})();
