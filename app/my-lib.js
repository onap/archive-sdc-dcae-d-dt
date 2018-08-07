window["MyLib"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_pubsub_1 = __webpack_require__(1);
var PluginPubSub = /** @class */ (function (_super) {
    __extends(PluginPubSub, _super);
    function PluginPubSub(pluginId, parentUrl, eventsToWait) {
        var _this = _super.call(this, pluginId) || this;
        _this.register('sdc-hub', window.parent, parentUrl);
        _this.subscribe(eventsToWait);
        return _this;
    }
    PluginPubSub.prototype.subscribe = function (eventsToWait) {
        var registerData = {
            pluginId: this.clientId,
            eventsToWait: eventsToWait || []
        };
        this.notify('PLUGIN_REGISTER', registerData);
    };
    PluginPubSub.prototype.unsubscribe = function () {
        var unregisterData = {
            pluginId: this.clientId
        };
        this.notify('PLUGIN_UNREGISTER', unregisterData);
    };
    return PluginPubSub;
}(base_pubsub_1.BasePubSub));
exports.default = PluginPubSub;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BasePubSub = /** @class */ (function () {
    function BasePubSub(pluginId) {
        this.subscribers = new Map();
        this.eventsCallbacks = [];
        this.eventsToWait = new Map();
        this.clientId = pluginId;
        this.onMessage = this
            .onMessage
            .bind(this);
        window.addEventListener('message', this.onMessage);
    }
    BasePubSub.prototype.onMessage = function (event) {
        if (this.subscribers.has(event.data.originId)) {
            this
                .eventsCallbacks
                .forEach(function (callback) {
                callback(event.data, event);
            });
        }
    };
    BasePubSub.prototype.register = function (subscriberId, subscriberWindow, subscriberUrl) {
        var subscriber = {
            window: subscriberWindow,
            locationUrl: subscriberUrl || subscriberWindow.location.href
        };
        this
            .subscribers
            .set(subscriberId, subscriber);
    };
    BasePubSub.prototype.unregister = function (subscriberId) {
        this
            .subscribers
            .delete(subscriberId);
    };
    BasePubSub.prototype.on = function (callback) {
        var functionExists = this
            .eventsCallbacks
            .find(function (func) {
            return callback.toString() === func.toString();
        });
        if (!functionExists) {
            this
                .eventsCallbacks
                .push(callback);
        }
    };
    BasePubSub.prototype.off = function (callback) {
        var index = this
            .eventsCallbacks
            .indexOf(callback);
        this
            .eventsCallbacks
            .splice(index, 1);
    };
    BasePubSub.prototype.notify = function (eventType, eventData) {
        var eventObj = {
            type: eventType,
            data: eventData,
            originId: this.clientId
        };
        this
            .subscribers
            .forEach(function (subscriber, subscriberId) {
            subscriber
                .window
                .postMessage(eventObj, subscriber.locationUrl);
        });
        return {
            subscribe: function (callbackFn) {
                var _this = this;
                if (this.subscribers.size !== 0) {
                    var subscribersToNotify_1 = Array.from(this.subscribers.keys());
                    var checkNotifyComplete_1 = function (subscriberId) {
                        var index = subscribersToNotify_1.indexOf(subscriberId);
                        subscribersToNotify_1.splice(index, 1);
                        if (subscribersToNotify_1.length === 0) {
                            callbackFn();
                        }
                    };
                    this
                        .subscribers
                        .forEach(function (subscriber, subscriberId) {
                        if (_this.eventsToWait.has(subscriberId) && _this.eventsToWait.get(subscriberId).indexOf(eventType) !== -1) {
                            var actionCompletedFunction_1 = function (eventData, subId) {
                                if (subId === void 0) { subId = subscriberId; }
                                if (eventData.type === 'ACTION_COMPLETED') {
                                    checkNotifyComplete_1(subId);
                                }
                                _this.off(actionCompletedFunction_1);
                            };
                            _this.on(actionCompletedFunction_1);
                        }
                        else {
                            checkNotifyComplete_1(subscriberId);
                        }
                    });
                }
                else {
                    callbackFn();
                }
            }.bind(this)
        };
    };
    return BasePubSub;
}());
exports.BasePubSub = BasePubSub;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
//# sourceMappingURL=my-lib.js.map