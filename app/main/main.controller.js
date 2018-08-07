(function () {
    'use strict';

    /** @ngInject */
    function mainController($scope, $rootScope) {
        // Data

        //////////

        // Remove the splash screen
        $scope.$on('$viewContentAnimationEnded', function (event) {
            if (event.targetScope.$id === $scope.$id) {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });
    }

    angular
        .module('dcaeApp.main', [])
        .controller('MainController', mainController);
    
})();
