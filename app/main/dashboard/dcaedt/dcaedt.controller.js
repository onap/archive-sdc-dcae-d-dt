(function () {

    'use strict';

    var CHECKOUT = 'NOT_CERTIFIED_CHECKOUT';

    var DashboardDCAEController = function ($rootScope, $scope, $log, $location, dcaeFactory, $stateParams, $state, appSettings, $http, $templateCache) {
        $scope.appSettings = appSettings;

        function init() {
            if ($rootScope.VNFs === undefined) {
                dcaeFactory
                    .getVNFList()
                    .then(function (response) {
                        $rootScope.VNFs = response.data;
                        $rootScope.VNFsRef = $rootScope.VNFs;
                        $scope.title = appSettings.title;
                        //var vm = this; vm.test = appSettings.title;
                    }, function (res, status, headers, config) {
                        errorHanlder(res);
                        $rootScope.VNFs = [];
                    });
            }
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }

        init();

        $scope.sortingVfcmts = function () {
            $rootScope.VNFs = $rootScope.VNFsRef;
            switch (value) {
                case 'New':
                    return $rootScope
                        .VNFs
                        .reverse()
                    case 'Abc':
                    return $rootScope.VNFs = _.sortBy($rootScope.VNFs, function (s) {
                        return s
                            .name
                            .charCodeAt() * -1;
                    }).reverse();
                default:
                    return $rootScope.VNFs;
            }
        }

        $scope.goGeneral = function (component, createMode, typeFlag) {
            // typeFlag: true when VNF, false when Service Assurance
            $rootScope.component = component;
            $rootScope.readOnlyComponent = false;
            $rootScope.resultInformation = "";
            if (component != null) {
                if (component.lastUpdaterUserId !== $rootScope.userId && component.lifecycleState === CHECKOUT) {
                    console.log('readOnlyComponent');
                    $rootScope.readOnlyComponent = true;
                }
                $rootScope.componentUser = component.lastUpdaterUserId;
            }

            $rootScope.createMode = createMode;
            $rootScope.typeFlag = typeFlag;
            $rootScope.s = '';

            console.log(createMode);
            console.log(component);
            console.log(typeFlag);

            //description
            if (component && component.uuid) {
                $http({
                    method: 'GET',
                    url: window.host + 'resource/' + component.uuid,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    } // set the headers so angular passing info as form data (not request payload)
                    })
                    .then(function (response) {
                        if (response && response.data && response.data.description)
                            $rootScope.component.description = response.data.description;
                            //console.log(response);
                        }
                    );
            }

            if (typeFlag == null) {
                $scope.pullArtifacts(component);
            } else {
                if (!typeFlag) {
                    //$scope.Services();
                }
                $scope.page = "general";
                $state.go('dcae.app.general');

            }
        }

        $scope.saveOnSdcExit = function (params) {
            if (params === 'ok') {
                document
                    .getElementById("savebtn")
                    .click();
            } else {
                window
                    .sdc
                    .notify('ACTION_COMPLETED');
            }
        }

        $scope.goSelfServe = function (component, createMode) {
            //$location.url('/general'); if(component) {
            $scope.page = "self_serve";
            $state.go('dcae.app.self_serve');
            $rootScope.component = component;
            $rootScope.createMode = createMode;
            console.log(component);
            /*} else {
               $scope.page="general";
               $state.go('dcae.app.general');
               $rootScope.createMode = true;
               $rootScope.component={};
            }*/

        }

        $scope.goImport = function (component, createMode) {
            //$location.url('/general'); if(component) {
            $scope.page = "import";
            $state.go('dcae.app.import');
            $rootScope.component = component;
            $rootScope.createMode = createMode;
            console.log(component);
            /*} else {
               $scope.page="general";
               $state.go('dcae.app.general');
               $rootScope.createMode = true;
               $rootScope.component={};
            }*/
        }

        $scope.goToBreadcrumbHome = function () {
            $scope.page = "home";
            $state.go('dcae.app.home');
        }

        $scope.goServices = function (component) {
            $scope.Services();
        }

        $scope.goComposition = function (component, typeFlag) {
            //$location.url('/general'); $scope.uuid = "";
            $scope.page = "composition";
            $rootScope.component = component;
            $state.go('dcae.app.composition');
            $rootScope.componentUrl = 'comp-fe/icecat.html';
            $rootScope.typeFlag = typeFlag;
            $rootScope.updateTime = Date.now();

            $rootScope.importVNFs = $rootScope
                .VNFs
                .filter(function (item) {
                    return item.uuid !== $rootScope.component.uuid;
                });

            $http
                .get(window.host + '/conf/composition')
                .then(function (response) {
                    // success callback console.log(response);
                    window.flowTypes = response.data.flowTypes;
                    window.isRuleEditorActive = response.data.isRuleEditorActive;
                }, function (response) {
                    // failure call back console.log(response);
                    $rootScope.dataTypes = "No Data Type";
                });
            console.log('userId: ', $rootScope.userId);
            console.log('lastUpdaterUserId: ', $rootScope.component.lastUpdaterUserId);
            $rootScope.disableImport = true;
            document.addEventListener('noComposition', function () {
                $rootScope
                    .$apply(function () {
                        $rootScope.disableImport = false;
                    });
            }, {once: true});
            // console.log($templateCache('comp-fe/icecat.html')); $rootScope.componentUrl =
            // "comp-fe/icecat.html#"+component.uuid;

        }

        $scope.selectVfcmtRow = function (importComponent, currentComponent, row) {
            $scope.importComponent = importComponent;
            $scope.currentComponent = currentComponent;
            $scope.selectedRow = row;
        }

        $scope.importVfcmt = function () {
            $scope.clone($scope.importComponent, $scope.currentComponent);
        }

        $scope.clone = function (x, y) {
            var popup = confirm('Are you sure you want to import? this action will replace the current compositio' +
                    'n!');
            if (popup == true) {
                $http({
                    method: 'GET',
                    url: window.host + 'utils/clone/resource/' + x.uuid + '/' + y.uuid,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    } // set the headers so angular passing info as form data (not request payload)
                    })
                    .then(function (response) {
                        console.log("Clone response:", response);
                        $rootScope.updateTime = Date.now();
                    })
                    .catch(function (res) {
                        $rootScope.errorMsg = errorHanlder(res);
                    });

                // $rootScope.component = x; $rootScope.updateTime = Date.now();
                // $scope.goComposition(y);
            }
        };

        $scope.openImport = function () {
            // debugger; jQuery.noConflict();
            jQuery('#import').modal("show");
        }

        $scope.goArtifact = function () {
            //$location.url('/general');
            $scope.page = "artifact";
            $state.go('dcae.app.artifact');
        }

        $scope.showAttach = function () {
            if (typeof $rootScope.service !== 'undefined' && typeof $rootScope.vnfi !== 'undefined' && !jQuery.isEmptyObject($rootScope.service) && !jQuery.isEmptyObject($rootScope.vnfi)) {
                return false;
            } else {
                return true;
            }
        }

        $scope.saveServiceSelection = function (x, y, z) {
            $scope.loader = true;

            $rootScope.service = y;
            $rootScope.vnfi = z;
            $rootScope.resultInformation2 = false;
            $http({
                method: 'POST',
                url: window.host + x.uuid + '/attachment',
                // / ' + x.uuid + ' / ' + y.uuid + ' / ' + z.name,
                data: {
                    'serviceUuid': y.uuid,
                    'instanceName': z.name
                },

                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(function (response) {
                    $scope.loader = false;
                    console.log(response.data);
                    $rootScope.resultInformation2 = true;
                })
                .catch(function (res) {
                    $rootScope.errorMsg = errorHanlder(res);
                });
        }

        $scope.save = function () {
            var generalUserInput = {};
            $scope.createMode = true;
            $scope.loader = true;
            generalUserInput.name = this.component.name;
            generalUserInput.description = this.component.description;
            console.log(JSON.stringify(generalUserInput, null, 4));
            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $rootScope.resultInformation = "";

            dcaeFactory
                .postData(window.host + 'createVFCMT', generalUserInput, config)
                .then(function (res) {
                    $scope.PostDataResponse = res.data;
                    console.log(res.data);
                    $rootScope.component = $scope.component = res.data;
                    $rootScope
                        .VNFs
                        .push($rootScope.component);
                    $rootScope.service = {};
                    $rootScope.vnfi = {};
                    showResultInfo("VFCMT Created/Saved.", 5000);
                })
                .catch(function (res) {
                    console.log("Error: ", res.data.notes);
                    showResultInfo(res.data, 5000);
                    $rootScope.resultInformation = errorHanlder(res);
                })
                . finally(function () {
                    $scope.loader = false;
                });

            function showResultInfo(msg, msDuration) {
                $rootScope.resultInformation = msg;
                setTimeout(function () {
                    $rootScope.resultInformation = "";
                }, msDuration);
            }
        }

        $scope.add = function () {
            var f = document
                    .getElementById('file')
                    .files[0],
                r = new FileReader();
            r.onloadend = function (e) {
                var binary = "";
                var bytes = new Uint8Array(e.target.result);
                var length = bytes.byteLength;

                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }

                $scope.data = (binary).toString();
                alert($scope.data);
            }
            r.readAsArrayBuffer(f);
        }

        $scope.showTypeFilter = function (type) {
            if ($rootScope.component == null) {
                return true;
            } else {
                return !(type.invariantUUID).includes($rootScope.component.invariantUUID);
            }
        }

        $scope.pullArtifacts = function (x) {
            console.log('pull artifacts commenced');
            $http({
                method: 'GET',
                url: window.host + x.uuid + '/attachment',
                headers: {
                    'Content-Type': 'application/json'
                } // set the headers so angular passing info as form data (not request payload)
                })
                .then(function (response) {

                    $rootScope.typeFlag = true;
                    var res = response.data.successResponse;

                    if (res != "No Artifacts") {
                        $rootScope.typeFlag = false;
                        var uuid = res.substring(0, res.indexOf("/"));
                        var name = res.substring(res.indexOf("resources/") + 10);
                        //$scope.Services(); $scope.VNFIs(uuid);
                        $rootScope.s = uuid + ' / ' + name;
                        $rootScope.service = {
                            uuid: uuid
                        };
                        $rootScope.vnfi = {
                            name: name
                        };
                    } else {
                        var uuid = null;
                        var name = null;
                    }
                    $rootScope.typeFlag = true;
                    console.log($rootScope.s);
                    // final navigation
                    $scope.page = "general";
                    $state.go('dcae.app.general');
                })
                .catch(function (res) {
                    $rootScope.errorMsg = errorHanlder(res);
                });
        };

        $scope.Services = function () {
            // clear dropDown
            $scope.loader = true;
            if (jQuery.isEmptyObject($rootScope.service) && jQuery.isEmptyObject($rootScope.vnfi)) {
                $rootScope.resultInformation2 = false;
                $rootScope.vnfis = [];
            } else {
                $rootScope.resultInformation2 = true;
                $scope.VNFIs($rootScope.service.uuid);
            }
            $http({
                method: 'GET',
                url: window.host + 'services/' + $rootScope.component.uuid,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                } // set the headers so angular passing info as form data (not request payload)
                })
                .then(function (response) {
                    $rootScope.services = response.data;
                    console.log($rootScope.services);
                    $rootScope.services = $rootScope
                        .services
                        .map(function (service) {
                            if (!(service.lifeCycleState === CHECKOUT && service.lastUpdaterUserId !== $rootScope.userId)) {
                                return service;
                            } else {
                                console.log("remove form dropDown:" + service.name + " " + service.lifeCycleState + " " + service.lastUpdaterUserId);
                            }
                        })
                        .filter(function (item) {
                            return item !== undefined;
                        });

                    $scope.loader = false;
                    $rootScope.vnfiTouch = false;
                    $scope.page = "services";
                    $state.go('dcae.app.services');
                })
                .catch(function (res) {
                    $rootScope.errorMsg = errorHanlder(res);
                })
                . finally(function () {
                    $scope.loader = false;
                });
        };

        $scope.vnfiChange = function (y) {
            $rootScope.vnfi = {};
            if (y) {
                $rootScope.vnfi.name = y;
            }
        }

        $scope.VNFIs = function (x) {
            $http({
                method: 'GET',
                url: window.host + 'service/' + x,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                } // set the headers so angular passing info as form data (not request payload)
                })
                .then(function (response) {
                    $rootScope.service = {};
                    $rootScope.service.uuid = x;
                    $rootScope.vnfis = [];
                    $rootScope.vnfiTouch = true;
                    if (response.data.resources) {
                        response
                            .data
                            .resources
                            .forEach(function (x) {
                                var v = {
                                    'name': x.resourceInstanceName,
                                    'uuid': x.resourceInvariantUUID
                                };
                                $rootScope
                                    .vnfis
                                    .push(v);
                            });
                    }
                    console.log($rootScope.vnfis);
                    return response.data;
                })
                .catch(function (res) {
                    $rootScope.errorMsg = errorHanlder(res);
                })
                . finally(function () {
                    $scope.loader = false;
                });
        }
    };

    DashboardDCAEController.$inject = [
        '$rootScope',
        '$scope',
        '$log',
        '$location',
        'dcaeFactory',
        '$stateParams',
        '$state',
        'appSettings',
        '$http',
        '$templateCache'
    ];

    angular
        .module('dcaeApp.dashboard.dcae')
        .controller('DashboardDCAEController', DashboardDCAEController);

    angular
        .module('dcaeApp.dashboard.dcae')
        .directive('leftMenu', function ($state) {
            return {
                templateUrl: 'main/dashboard/dcaedt/leftMenu.html',
                controller: function ($scope, $state) {
                    $scope.page = $state
                        .current
                        .url
                        .substring(1, $state.current.url.length);
                    console.log("page: " + $scope.page);
                }
            }
        });

})();

function errorHanlder(res) {
    console.log("Error: ", res.data.notes);
    var tempError = Object
        .keys(res.data.requestError)
        .map(function (key) {
            return res.data.requestError[key];
        });
    return tempError[0].formattedErrorMessage;
}
