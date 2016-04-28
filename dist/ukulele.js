(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Ukulele = undefined;
	
	var _EventEmitter = __webpack_require__(1);
	
	var _AsyncCaller = __webpack_require__(2);
	
	var _DefinitionManager = __webpack_require__(3);
	
	var _DirtyChecker = __webpack_require__(11);
	
	var _Analyzer = __webpack_require__(12);
	
	var _Selector = __webpack_require__(9);
	
	function Ukulele() {
		"use strict";
	
		_EventEmitter.EventEmitter.call(this);
	
		var self = this;
		var defMgr = void 0;
		var dirtyChecker = void 0;
		//let anylyzer;
		var asyncCaller = new _AsyncCaller.AsyncCaller();
	
		this.parentUku = null;
	
		this.init = function () {
			asyncCaller.exec(function () {
				manageApplication();
			});
		};
	
		this.handleElement = function (element) {
			analyizeElement(element, function (e) {
				self.dispatchEvent({ 'eventType': Ukulele.HANDLE_ELEMENT_COMPLETED, 'element': element });
			});
		};
	
		this.registerController = function (instanceName, controllerInst) {
			this._internal_getDefinitionManager().addControllerDefinition(instanceName, controllerInst);
		};
	
		this.getController = function (instanceName) {
			return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
		};
	
		this.registerComponent = function (tag, templateUrl, preload) {
			this._internal_getDefinitionManager().addComponentDefinition(tag, templateUrl, preload, asyncCaller);
		};
	
		this.getComponent = function (tagName) {
			return this._internal_getDefinitionManager().getComponent(tagName);
		};
	
		this.refresh = function (alias, excludeElement) {
			if (!dirtyChecker) {
				dirtyChecker = new _DirtyChecker.DirtyChecker(this);
			}
			dirtyChecker.runDirtyChecking(alias, excludeElement);
		};
	
		//internal function
		this._internal_getDefinitionManager = function () {
			if (!defMgr) {
				defMgr = new _DefinitionManager.DefinitionManager(this);
			}
			return defMgr;
		};
		this._internal_dealWithElement = function (element) {
			analyizeElement(element);
		};
	
		function manageApplication() {
			var apps = _Selector.Selector.querySelectorAll(document, "[uku-application]");
			if (apps.length === 1) {
				analyizeElement(apps[0], function (ele) {
					self.dispatchEvent({ 'eventType': Ukulele.INITIALIZED, 'element': ele });
				});
			} else {
				throw new Error("Only one 'uku-application' can be declared in a whole html.");
			}
		}
		function analyizeElement(element, callback) {
			var anylyzer = new _Analyzer.Analyzer(self);
			if (callback) {
				(function (retFunc) {
					anylyzer.addListener(_Analyzer.Analyzer.ANALYIZE_COMPLETED, function (e) {
						retFunc(e.element);
					});
				})(callback);
			}
			anylyzer.analyizeElement(element);
		}
	}
	
	Ukulele.prototype = new _EventEmitter.EventEmitter();
	Ukulele.prototype.constructor = Ukulele;
	
	//ukulele Lifecycle event
	Ukulele.INITIALIZED = 'initialized';
	Ukulele.REFRESH = 'refresh';
	Ukulele.HANDLE_ELEMENT_COMPLETED = "handle_element_completed";
	
	exports.Ukulele = Ukulele;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var EventEmitter = exports.EventEmitter = function () {
	    function EventEmitter() {
	        _classCallCheck(this, EventEmitter);
	
	        this.eventsPool = {};
	    }
	
	    _createClass(EventEmitter, [{
	        key: "addListener",
	        value: function addListener(eventType, handler) {
	            if (!this.eventsPool[eventType]) {
	                this.eventsPool[eventType] = [];
	            }
	            this.eventsPool[eventType].push(handler);
	        }
	    }, {
	        key: "removeListener",
	        value: function removeListener(eventType, handler) {
	            if (this.eventsPool[eventType]) {
	                for (var i = this.eventsPool[eventType].length - 1; i >= 0; i--) {
	                    if (this.eventsPool[eventType][i] === handler) {
	                        this.eventsPool[eventType].splice(i, 1);
	                        break;
	                    }
	                }
	            }
	        }
	    }, {
	        key: "dispatchEvent",
	        value: function dispatchEvent(event) {
	            if (event && event.eventType) {
	                var handlers = this.eventsPool[event.eventType];
	                if (handlers) {
	                    for (var i = 0; i < handlers.length; i++) {
	                        handlers[i].call(this, event);
	                    }
	                }
	            }
	        }
	    }, {
	        key: "hasListener",
	        value: function hasListener(eventType) {
	            if (this.eventsPool[eventType] && this.eventsPool[eventType].length > 0) {
	                return true;
	            }
	            return false;
	        }
	    }]);

	    return EventEmitter;
	}();

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.AsyncCaller = AsyncCaller;
	function AsyncCaller() {
	    var allTasksPool = [];
	    var queueTasksPool = [];
	    Function.prototype.resolve = function (ac) {
	        ac.aysncFunRunOver.call(ac, this);
	    };
	    this.pushAll = function (asyncFunc, arguArr) {
	        if (queueTasksPool.length === 0) {
	            var funcObj = { 'func': asyncFunc, 'argu': arguArr };
	            allTasksPool.push(funcObj);
	        } else {
	            console.error(errorMsg);
	        }
	        return this;
	    };
	    this.pushQueue = function (asyncFunc, arguArr) {
	        if (allTasksPool.length === 0) {
	            var funcObj = { 'func': asyncFunc, 'argu': arguArr };
	            queueTasksPool.push(funcObj);
	        } else {
	            console.error(errorMsg);
	        }
	        return this;
	    };
	
	    this.aysncFunRunOver = function (caller) {
	        if (execType === "queue") {
	            if (queueTasksPool.length === 0) {
	                if (this.finalFunc) {
	                    this.finalFunc();
	                }
	            } else {
	                var funcObj = queueTasksPool[0];
	                queueTasksPool.shift();
	                funcObj.func.apply(this, funcObj.argu);
	            }
	        } else if (execType === "all") {
	            for (var i = 0; i < allTasksPool.length; i++) {
	                var task = allTasksPool[i];
	                if (caller === task.func) {
	                    allTasksPool.splice(i, 1);
	                    break;
	                }
	            }
	            if (allTasksPool.length === 0) {
	                if (this.finalFunc) {
	                    this.finalFunc();
	                }
	            }
	        }
	    };
	    var execType = "queue";
	    this.exec = function (callback) {
	        this.finalFunc = callback;
	        if (allTasksPool.length > 0) {
	            execType = "all";
	            executeAll();
	        } else if (queueTasksPool.length > 0) {
	            execType = "queue";
	            executeQueue();
	        } else {
	            this.finalFunc.call();
	        }
	    };
	    function executeQueue() {
	        var funcObj = queueTasksPool[0];
	        queueTasksPool.shift();
	        funcObj.func.apply(null, funcObj.argu);
	    }
	    function executeAll() {
	        for (var i = 0; i < allTasksPool.length; i++) {
	            var funcObj = allTasksPool[i];
	            funcObj.func.apply(null, funcObj.argu);
	        }
	    }
	    var errorMsg = "Only one type of task can be executed at same time";
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.DefinitionManager = DefinitionManager;
	
	var _ObjectUtil = __webpack_require__(4);
	
	var _Ajax = __webpack_require__(5);
	
	var _ControllerModel = __webpack_require__(6);
	
	var _AsyncCaller = __webpack_require__(2);
	
	var _ComponentModel = __webpack_require__(7);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function DefinitionManager(uku) {
		var controllersDefinition = {};
		var componentsDefinition = {};
		var componentsPool = {};
		var copyControllers = {};
		var ajax = new _Ajax.Ajax();
		//let asyncCaller = new AsyncCaller();
	
		this.getComponentsDefinition = function () {
			return componentsDefinition;
		};
	
		this.setComponentsDefinition = function (value) {
			componentsDefinition = value;
		};
	
		this.getComponentDefinition = function (tagName) {
			return componentsDefinition[tagName];
		};
	
		this.getControllerDefinition = function (instanceName) {
			return controllersDefinition[instanceName];
		};
	
		this.getControllersDefinition = function () {
			return controllersDefinition;
		};
	
		this.getComponent = function (tagName) {
			return componentsPool[tagName];
		};
	
		this.getCopyControllers = function () {
			return copyControllers;
		};
	
		this.copyAllController = function () {
			for (var alias in controllersDefinition) {
				var controllerModel = controllersDefinition[alias];
				var controller = controllerModel.controllerInstance;
				this.copyControllerInstance(controller, alias);
			}
		};
	
		this.copyControllerInstance = function (controller, alias) {
			var previousCtrlModel = _ObjectUtil.ObjectUtil.deepClone(controller);
			delete copyControllers[alias];
			copyControllers[alias] = previousCtrlModel;
		};
	
		this.addControllerDefinition = function (instanceName, controllerInst) {
			var controllerModel = new _ControllerModel.ControllerModel(instanceName, controllerInst);
			controllerInst._alias = instanceName;
			controllersDefinition[instanceName] = controllerModel;
		};
	
		this.addComponentDefinition = function (tag, templateUrl, preload, asyncCaller) {
			if (!preload) {
				componentsPool[tag] = { 'tagName': tag, 'templateUrl': templateUrl, 'lazy': true };
			} else {
				componentsPool[tag] = { 'tagName': tag, 'templateUrl': templateUrl, 'lazy': false };
				asyncCaller.pushAll(dealWithComponentConfig, [tag, templateUrl]);
			}
			function dealWithComponentConfig(tag, template) {
				ajax.get(templateUrl, function (result) {
					var componentConfig = _UkuleleUtil.UkuleleUtil.getComponentConfiguration(result);
					analyizeComponent(tag, componentConfig, function () {
						dealWithComponentConfig.resolve(asyncCaller);
					});
				});
			}
		};
	
		this.addLazyComponentDefinition = function (tag, templateUrl, callback) {
			ajax.get(templateUrl, function (result) {
				var componentConfig = _UkuleleUtil.UkuleleUtil.getComponentConfiguration(result);
				analyizeComponent(tag, componentConfig, function () {
					componentsPool[tag] = { 'tagName': tag, 'templateUrl': templateUrl, 'lazy': false };
					callback();
				});
			});
		};
	
		this.getBoundAttributeValue = function (attr, additionalArgu) {
			var controllerModel = getBoundControllerModelByName(attr);
			var controllerInst = controllerModel.controllerInstance;
			var result = _UkuleleUtil.UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
			return result;
		};
	
		this.getControllerModelByName = function (expression) {
			return getBoundControllerModelByName(expression);
		};
	
		this.getFinalValueByExpression = function (expression) {
			var controller = this.getControllerModelByName(expression).controllerInstance;
			return _UkuleleUtil.UkuleleUtil.getFinalValue(this, controller, expression);
		};
	
		function getBoundControllerModelByName(attrName) {
			var instanceName = _UkuleleUtil.UkuleleUtil.getBoundModelInstantName(attrName);
			var controllerModel = controllersDefinition[instanceName];
			if (!controllerModel) {
				var tempArr = attrName.split(".");
				var isParentScope = tempArr[0];
				if (isParentScope === "parent" && self.parentUku) {
					tempArr.shift();
					attrName = tempArr.join(".");
					return self.parentUku._internal_getDefinitionManager().getControllerModelByName(attrName);
				}
			}
			return controllerModel;
		}
	
		function analyizeComponent(tag, config, callback) {
			var deps = config.dependentScripts;
			if (deps && deps.length > 0) {
				(function () {
					var ac = new _AsyncCaller.AsyncCaller();
					var tmpAMD = void 0;
					if (true) {
						tmpAMD = __webpack_require__(10);
						__webpack_require__(10) = undefined;
					}
					for (var i = 0; i < deps.length; i++) {
						var dep = deps[i];
						ac.pushAll(loadDependentScript, [ac, dep]);
					}
					ac.exec(function () {
						if (__webpack_require__(10)) {
							define = __webpack_require__(10);
						}
						buildeComponentModel(tag, config.template, config.componentControllerScript);
						callback();
					});
				})();
			} else {
				buildeComponentModel(tag, config.template, config.componentControllerScript);
				callback();
			}
		}
		function buildeComponentModel(tag, template, script) {
			var debugComment = "//# sourceURL=" + tag + ".js";
			script += debugComment;
			try {
				var controllerClazz = eval(script);
				var newComp = new _ComponentModel.ComponentModel(tag, template, controllerClazz);
				componentsDefinition[tag] = newComp;
			} catch (e) {
				console.error(e);
			}
		}
	
		var dependentScriptsCache = {};
		function loadDependentScript(ac, src) {
			if (!dependentScriptsCache[src]) {
				var head = document.getElementsByTagName('HEAD')[0];
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.charset = 'utf-8';
				script.async = true;
				script.src = src;
				script.onload = function (e) {
					dependentScriptsCache[e.target.src] = true;
					loadDependentScript.resolve(ac);
				};
				head.appendChild(script);
			} else {
				loadDependentScript.resolve(ac);
			}
		}
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ObjectUtil = exports.ObjectUtil = function () {
	    function ObjectUtil() {
	        _classCallCheck(this, ObjectUtil);
	    }
	
	    _createClass(ObjectUtil, null, [{
	        key: "isArray",
	        value: function isArray(obj) {
	            return Object.prototype.toString.call(obj) === '[object Array]';
	        }
	    }, {
	        key: "getType",
	        value: function getType(obj) {
	            var type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
	            if (type === "object") {
	                if (ObjectUtil.isArray(obj)) {
	                    return "array";
	                } else {
	                    return type;
	                }
	            } else {
	                return type;
	            }
	        }
	    }, {
	        key: "compare",
	        value: function compare(objA, objB) {
	            var type = ObjectUtil.getType(objA);
	            var typeB = ObjectUtil.getType(objB);
	            var result = true;
	            if (type !== typeB) {
	                return false;
	            } else {
	                switch (type) {
	                    case "object":
	                        for (var key in objA) {
	                            var valuA = objA[key];
	                            var valuB = objB[key];
	                            var isEqual = ObjectUtil.compare(valuA, valuB);
	                            if (!isEqual) {
	                                result = false;
	                                break;
	                            }
	                        }
	                        break;
	                    case "array":
	                        if (objA.length === objB.length) {
	                            for (var i = 0; i < objA.length; i++) {
	                                var itemA = objA[i];
	                                var itemB = objB[i];
	                                var isEqual2 = ObjectUtil.compare(itemA, itemB);
	                                if (!isEqual2) {
	                                    result = false;
	                                    break;
	                                }
	                            }
	                        } else {
	                            result = false;
	                        }
	                        break;
	                    case "function":
	                        result = objA.toString() === objB.toString();
	                        break;
	                    default:
	                        result = objA === objB;
	                        break;
	                }
	            }
	            return result;
	        }
	    }, {
	        key: "deepClone",
	        value: function deepClone(obj) {
	            var o = void 0,
	                i = void 0,
	                j = void 0,
	                k = void 0;
	            if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object" || obj === null) {
	                return obj;
	            }
	            if (obj instanceof Array) {
	                o = [];
	                i = 0;
	                j = obj.length;
	                for (; i < j; i++) {
	                    if (_typeof(obj[i]) === "object" && obj[i] !== null) {
	                        o[i] = arguments.callee(obj[i]);
	                    } else {
	                        o[i] = obj[i];
	                    }
	                }
	            } else {
	                o = {};
	                for (i in obj) {
	                    if (_typeof(obj[i]) === "object" && obj[i] !== null && i !== "_dom") {
	                        o[i] = arguments.callee(obj[i]);
	                    } else {
	                        o[i] = obj[i];
	                    }
	                }
	            }
	
	            return o;
	        }
	    }]);

	    return ObjectUtil;
	}();

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Ajax = exports.Ajax = function () {
	    function Ajax() {
	        _classCallCheck(this, Ajax);
	    }
	
	    _createClass(Ajax, [{
	        key: "get",
	        value: function get(url, success, error) {
	            var request = new XMLHttpRequest();
	            request.onreadystatechange = function () {
	                if (request.readyState === 4) {
	                    if (request.status === 200) {
	                        success(request.responseText);
	                    } else {
	                        if (error) {
	                            error();
	                        }
	                    }
	                }
	            };
	            request.open("GET", url, true);
	            request.send(null);
	        }
	    }]);

	    return Ajax;
	}();

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ControllerModel = exports.ControllerModel = function () {
	    function ControllerModel(alias, ctrlInst) {
	        _classCallCheck(this, ControllerModel);
	
	        this.alias = alias;
	        this.controllerInstance = ctrlInst;
	        this.boundItems = [];
	    }
	
	    _createClass(ControllerModel, [{
	        key: "addBoundItem",
	        value: function addBoundItem(boundItem) {
	            this.boundItems.push(boundItem);
	        }
	    }, {
	        key: "getBoundItemsByName",
	        value: function getBoundItemsByName(name) {
	            var tempBoundItems = [];
	            for (var i = 0; i < this.boundItems.length; i++) {
	                var boundItem = this.boundItems[i];
	                if (boundItem.attributeName === name) {
	                    tempBoundItems.push(boundItem);
	                }
	            }
	            return tempBoundItems;
	        }
	    }]);

	    return ControllerModel;
	}();

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ComponentModel = exports.ComponentModel = function ComponentModel(tagName, template, clazz) {
	    _classCallCheck(this, ComponentModel);
	
	    this.tagName = tagName;
	    this.template = template;
	    this.controllerClazz = clazz;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.UkuleleUtil = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Selector = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var UkuleleUtil = exports.UkuleleUtil = function () {
	    function UkuleleUtil() {
	        _classCallCheck(this, UkuleleUtil);
	    }
	
	    _createClass(UkuleleUtil, null, [{
	        key: "getFinalAttribute",
	        value: function getFinalAttribute(expression) {
	            var temp = expression.split(".");
	            var isParent = temp.shift();
	            if (isParent === "parent") {
	                return UkuleleUtil.getFinalAttribute(temp.join("."));
	            }
	            return temp.join(".");
	        }
	    }, {
	        key: "searchHtmlTag",
	        value: function searchHtmlTag(htmlString, tagName) {
	            var reTemp = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
	            var re = new RegExp(reTemp);
	            var index = htmlString.search(re);
	            return index;
	        }
	    }, {
	        key: "getInnerHtml",
	        value: function getInnerHtml(htmlString, tagName) {
	            var reTemp = "<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">";
	            var re = new RegExp(reTemp);
	            var match = htmlString.match(re);
	            if (match.index > -1) {
	                var matchString = match[0];
	                var index = matchString.search(">");
	                var tempString = matchString.substr(index + 1);
	                var index2 = tempString.lastIndexOf("</");
	                tempString = tempString.substring(0, index2);
	                tempString = tempString.replace(/(^\s*)|(\s*$)/g, "");
	                console.log(tempString);
	                return tempString;
	            } else {
	                return null;
	            }
	        }
	    }, {
	        key: "getComponentConfiguration",
	        value: function getComponentConfiguration(htmlString) {
	            var tempDom = document.createElement("div");
	            tempDom.innerHTML = htmlString;
	            var tpl = _Selector.Selector.querySelectorAll(tempDom, "template");
	            var scripts = _Selector.Selector.querySelectorAll(tempDom, "script");
	            var deps = [];
	            var ccs = null;
	            for (var i = 0; i < scripts.length; i++) {
	                var script = scripts[i];
	                if (script.src !== "") {
	                    deps.push(script.src);
	                } else {
	                    ccs = script.innerHTML;
	                }
	            }
	            return {
	                template: tpl[0].innerHTML,
	                dependentScripts: deps,
	                componentControllerScript: ccs
	            };
	        }
	    }, {
	        key: "searchUkuAttrTag",
	        value: function searchUkuAttrTag(htmlString) {
	            var re = /^uku\-.*/;
	            var index = htmlString.search(re);
	            return index;
	        }
	    }, {
	        key: "getAttrFromUkuTag",
	        value: function getAttrFromUkuTag(ukuTag, camelCase) {
	            if (UkuleleUtil.searchUkuAttrTag(ukuTag) === 0) {
	                ukuTag = ukuTag.replace('uku-', '');
	            }
	            if (camelCase) {
	                var names = ukuTag.split('-');
	                ukuTag = names[0];
	                for (var i = 1; i < names.length; i++) {
	                    var firstLetter = names[i].charAt(0).toUpperCase();
	                    ukuTag = ukuTag + firstLetter + names[i].substr(1);
	                }
	            }
	            return ukuTag;
	        }
	    }, {
	        key: "searchUkuExpTag",
	        value: function searchUkuExpTag(expression) {
	            var re = /^\{\{.*\}\}$/;
	            var index = expression.search(re);
	            return index;
	        }
	    }, {
	        key: "searchUkuFuncArg",
	        value: function searchUkuFuncArg(htmlString) {
	            var re = /\(.*\)$/;
	            var index = htmlString.search(re);
	            return index;
	        }
	    }, {
	        key: "isRepeat",
	        value: function isRepeat(element) {
	            if (element.getAttribute("uku-repeat")) {
	                return true;
	            }
	            return false;
	        }
	    }, {
	        key: "isInRepeat",
	        value: function isInRepeat(element) {
	            var parents = _Selector.Selector.parents(element);
	            for (var i = 0; i < parents.length; i++) {
	                var parent = parents[i];
	                if (parent.nodeType !== 9) {
	                    var b = parent.getAttribute("uku-repeat");
	                    if (b) {
	                        return true;
	                    }
	                }
	            }
	            return false;
	        }
	    }, {
	        key: "getBoundModelInstantName",
	        value: function getBoundModelInstantName(expression) {
	            var controlInstName = expression.split('.')[0];
	            if (controlInstName) {
	                return controlInstName;
	            }
	            return null;
	        }
	    }, {
	        key: "getAttributeFinalValue",
	        value: function getAttributeFinalValue(object, attrName) {
	            var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
	            var value = valueObject.value;
	            return value;
	        }
	    }, {
	        key: "getAttributeFinalValueAndParent",
	        value: function getAttributeFinalValueAndParent(object, attrName) {
	            var finalValue = object;
	            var parentValue = void 0;
	            if (typeof attrName === "string") {
	                var attrValue = UkuleleUtil.getFinalAttribute(attrName);
	                var temp = attrValue.split(".");
	                if (attrValue !== "" && finalValue) {
	                    for (var i = 0; i < temp.length; i++) {
	                        var property = temp[i];
	                        parentValue = finalValue;
	                        finalValue = finalValue[property];
	                        if (finalValue === undefined || finalValue === null) {
	                            break;
	                        }
	                    }
	                } else {
	                    if (object.hasOwnProperty("_alias") && object._alias === attrName) {
	                        finalValue = object;
	                    } else {
	                        finalValue = attrName;
	                    }
	                }
	            }
	            return {
	                "value": finalValue,
	                "parent": parentValue
	            };
	        }
	    }, {
	        key: "getFinalValue",
	        value: function getFinalValue(uku, object, attrName, additionalArgu) {
	            var index = -1;
	            if (typeof attrName === "string") {
	                index = UkuleleUtil.searchUkuFuncArg(attrName);
	            }
	            if (index === -1) {
	                //is attribute
	                return UkuleleUtil.getAttributeFinalValue(object, attrName);
	            } else {
	                //is function
	                var functionName = attrName.substring(0, index);
	                var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
	                var finalValue = finalValueObject.value;
	                if (finalValue === undefined) {
	                    return finalValue;
	                }
	                var new_arguments = [];
	                var _arguments = attrName.substring(index + 1, attrName.length - 1);
	                if (_arguments !== "") {
	                    _arguments = ArgumentUtil.analyze(_arguments, uku);
	                    for (var i = 0; i < _arguments.length; i++) {
	                        var temp = void 0;
	                        var argument = _arguments[i];
	                        var argType = typeof argument === "undefined" ? "undefined" : _typeof(argument);
	                        var controllerModel = null;
	                        if (argType === "string") {
	                            controllerModel = uku._internal_getDefinitionManager().getControllerModelByName(argument);
	                            if (controllerModel && controllerModel.controllerInstance) {
	                                var agrumentInst = controllerModel.controllerInstance;
	                                if (argument.split(".").length === 1) {
	                                    temp = agrumentInst;
	                                } else {
	                                    temp = UkuleleUtil.getFinalValue(uku, agrumentInst, argument);
	                                }
	                            } else {
	                                temp = UkuleleUtil.getFinalValue(uku, object, argument);
	                            }
	                            new_arguments.push(temp);
	                        } else {
	                            new_arguments.push(argument);
	                        }
	                    }
	                }
	
	                if (additionalArgu) {
	                    var additionalArguArray = Array.prototype.slice.call(additionalArgu);
	                    new_arguments = new_arguments.concat(additionalArguArray);
	                }
	                finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
	                return finalValue;
	            }
	        }
	    }]);

	    return UkuleleUtil;
	}();

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Selector = exports.Selector = function () {
	    function Selector() {
	        _classCallCheck(this, Selector);
	    }
	
	    _createClass(Selector, null, [{
	        key: "querySelectorAll",
	        value: function querySelectorAll(element, query) {
	            if (typeof jQuery !== "undefined") {
	                return jQuery(element).find(query);
	            } else {
	                return element.querySelectorAll(query);
	            }
	        }
	    }, {
	        key: "fuzzyFind",
	        value: function fuzzyFind(element, text) {
	            if (element && element.attributes) {
	                for (var i = 0; i < element.attributes.length; i++) {
	                    var attr = element.attributes[i];
	                    if (attr.nodeName.search(text) > -1) {
	                        return element;
	                    }
	                }
	            }
	            return null;
	        }
	    }, {
	        key: "directText",
	        value: function directText(element, text) {
	            var o = "";
	            var nodes = element.childNodes;
	            for (var i = 0; i <= nodes.length - 1; i++) {
	                var node = nodes[i];
	                if (node.nodeType === 3) {
	                    if (text || text === "" || text === 0 || text === false) {
	                        node.nodeValue = text;
	                        return;
	                    } else {
	                        o += node.nodeValue;
	                    }
	                }
	            }
	            return o.trim();
	        }
	    }, {
	        key: "parents",
	        value: function parents(element) {
	            var parents = [];
	            while (element.parentNode && element.parentNode.tagName !== 'BODY') {
	                parents.push(element.parentNode);
	                element = element.parentNode;
	            }
	            return parents;
	        }
	    }]);

	    return Selector;
	}();

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.DirtyChecker = DirtyChecker;
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function DirtyChecker(uku) {
		var defMgr = uku._internal_getDefinitionManager();
		this.runDirtyChecking = function (ctrlAliasName, excludeElement) {
			if (ctrlAliasName) {
				if (typeof ctrlAliasName === "string") {
					watchController(ctrlAliasName);
				} else if (ObjectUtil.isArray(ctrlAliasName)) {
					for (var i = 0; i < ctrlAliasName.length; i++) {
						watchController(ctrlAliasName[i]);
					}
				}
			} else {
				for (var alias in defMgr.getControllersDefinition()) {
					watchController(alias);
				}
			}
	
			function watchController(alias) {
				var controllerModel = defMgr.getControllersDefinition()[alias];
				if (!controllerModel) {
					if (uku.parentUku) {
						uku.parentUku.refresh(alias);
					}
					return;
				}
				var controller = controllerModel.controllerInstance;
				var previousCtrlModel = defMgr.getCopyControllers()[alias];
				var changedElementCount = 0;
				for (var _i = 0; _i < controllerModel.boundItems.length; _i++) {
					var boundItem = controllerModel.boundItems[_i];
					var attrName = boundItem.attributeName;
					if (attrName.search('parent.') > -1) {
						return;
					}
					if (previousCtrlModel) {
						if (boundItem.ukuTag === "selected") {
							attrName = attrName.split("|")[0];
						}
						var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(uku, controller, attrName);
						var previousFinalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(uku, previousCtrlModel, attrName);
						if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
							attrName = boundItem.attributeName;
							var changedBoundItems = controllerModel.getBoundItemsByName(attrName);
							for (var j = 0; j < changedBoundItems.length; j++) {
								var changedBoundItem = changedBoundItems[j];
								if (changedBoundItem.element !== excludeElement || changedBoundItem.ukuTag !== "value") {
									changedElementCount++;
									changedBoundItem.render(controller);
								}
							}
						}
					}
				}
				if (changedElementCount > 0 && uku.hasListener(Ukulele.REFRESH)) {
					uku.dispatchEvent({ 'eventType': Ukulele.REFRESH });
				}
				defMgr.copyControllerInstance(controller, alias);
			}
		};
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Analyzer = undefined;
	
	var _EventEmitter = __webpack_require__(1);
	
	var _Selector = __webpack_require__(9);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	var _AsyncCaller = __webpack_require__(2);
	
	var _BoundItemAttribute = __webpack_require__(13);
	
	var _BoundItemExpression = __webpack_require__(15);
	
	var _BoundItemInnerText = __webpack_require__(16);
	
	var _BoundItemRepeat = __webpack_require__(17);
	
	var _BoundItemComponentAttribute = __webpack_require__(18);
	
	function Analyzer(uku) {
	    _EventEmitter.EventEmitter.call(this);
	    //解析html中各个uku的tag
	    var defMgr = uku._internal_getDefinitionManager();
	
	    this.analyizeElement = function (ele) {
	        var self = this;
	        searchComponent(ele, function (element) {
	            var subElements = [];
	            //scan element which has uku-* tag
	            var isSelfHasUkuTag = _Selector.Selector.fuzzyFind(element, 'uku-');
	            if (isSelfHasUkuTag) {
	                subElements.push(isSelfHasUkuTag);
	            }
	            var allChildren = _Selector.Selector.querySelectorAll(element, "*");
	            for (var i = 0; i < allChildren.length; i++) {
	                var child = allChildren[i];
	                var matchElement = _Selector.Selector.fuzzyFind(child, 'uku-');
	                if (matchElement && !_UkuleleUtil.UkuleleUtil.isInRepeat(matchElement)) {
	                    subElements.push(matchElement);
	                }
	            }
	            searchExpression(element);
	            //解析绑定 attribute，注册event
	            for (var n = 0; n < subElements.length; n++) {
	                var subElement = subElements[n];
	                var orderAttrs = sortAttributes(subElement);
	                for (var j = 0; j < orderAttrs.length; j++) {
	                    var attribute = orderAttrs[j];
	                    if (_UkuleleUtil.UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
	                        var tempArr = attribute.nodeName.split('-');
	                        tempArr.shift();
	                        var attrName = tempArr.join('-');
	                        if (attrName !== "application") {
	                            if (attrName.search('on') === 0) {
	                                //is an event
	                                if (!_UkuleleUtil.UkuleleUtil.isRepeat(subElement) && !_UkuleleUtil.UkuleleUtil.isInRepeat(subElement)) {
	                                    dealWithEvent(subElement, attrName);
	                                }
	                            } else if (attrName.search('repeat') !== -1) {
	                                //is an repeat
	                                dealWithRepeat(subElement);
	                            } else {
	                                //is an attribute
	                                if (!_UkuleleUtil.UkuleleUtil.isRepeat(subElement) && !_UkuleleUtil.UkuleleUtil.isInRepeat(subElement)) {
	                                    if (attrName !== "text") {
	                                        dealWithAttribute(subElement, attrName);
	                                    } else {
	                                        dealWithInnerText(subElement);
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	            defMgr.copyAllController();
	            if (self.hasListener(Analyzer.ANALYIZE_COMPLETED)) {
	                self.dispatchEvent({ 'eventType': Analyzer.ANALYIZE_COMPLETED, 'element': element });
	            }
	        });
	    };
	    function sortAttributes(subElement) {
	        var orderAttrs = [];
	        for (var i = 0; i < subElement.attributes.length; i++) {
	            var attribute = subElement.attributes[i];
	            if (attribute.nodeName.search("uku-on") !== -1) {
	                orderAttrs.push(attribute);
	            } else {
	                orderAttrs.unshift(attribute);
	            }
	        }
	        return orderAttrs;
	    }
	
	    function searchComponent(element, callback) {
	        var comp = defMgr.getComponent(element.localName);
	        if (comp) {
	            if (!comp.lazy) {
	                if (!_UkuleleUtil.UkuleleUtil.isRepeat(element) && !_UkuleleUtil.UkuleleUtil.isInRepeat(element)) {
	                    var attrs = element.attributes;
	                    var compDef = defMgr.getComponentsDefinition()[comp.tagName];
	                    dealWithComponent(element, compDef.template, compDef.controllerClazz, attrs, function (compElement) {
	                        callback && callback(compElement);
	                    });
	                }
	            } else {
	                if (!_UkuleleUtil.UkuleleUtil.isRepeat(element) && !_UkuleleUtil.UkuleleUtil.isInRepeat(element)) {
	                    defMgr.addLazyComponentDefinition(comp.tagName, comp.templateUrl, function () {
	                        var attrs = element.attributes;
	                        var compDef = defMgr.getComponentsDefinition()[comp.tagName];
	                        dealWithComponent(element, compDef.template, compDef.controllerClazz, attrs, function (compElement) {
	                            callback && callback(compElement);
	                        });
	                    });
	                }
	            }
	        } else {
	            if (element.children && element.children.length > 0) {
	                (function () {
	                    var ac = new _AsyncCaller.AsyncCaller();
	                    for (var i = 0; i < element.children.length; i++) {
	                        var child = element.children[i];
	                        ac.pushQueue(searchComponent, [child, function () {
	                            searchComponent.resolve(ac);
	                        }]);
	                    }
	                    ac.exec(function () {
	                        callback && callback(element);
	                    });
	                })();
	            } else {
	                callback && callback(element);
	            }
	        }
	
	        function dealWithComponent(tag, template, Clazz, attrs, callback) {
	            var randomAlias = 'cc_' + Math.floor(10000 * Math.random()).toString();
	            template = template.replace(new RegExp('cc.', 'gm'), randomAlias + '.');
	            var tempFragment = document.createElement('div');
	            tempFragment.insertAdjacentHTML('afterBegin', template);
	            if (tempFragment.children.length > 1) {
	                template = tempFragment.outerHTML;
	            }
	            tag.insertAdjacentHTML('beforeBegin', template);
	            var htmlDom = tag.previousElementSibling;
	            var cc = void 0;
	            if (Clazz) {
	                cc = new Clazz(uku);
	                cc._dom = htmlDom;
	                cc.fire = function (eventType, data) {
	                    var event = document.createEvent('HTMLEvents');
	                    event.initEvent(eventType.toLowerCase(), true, true);
	                    event.data = data;
	                    cc._dom.dispatchEvent(event);
	                };
	                uku.registerController(randomAlias, cc);
	                for (var i = 0; i < attrs.length; i++) {
	                    var attr = attrs[i];
	                    if (_UkuleleUtil.UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0 || attr.nodeName.search("uku-on") !== -1) {
	                        htmlDom.setAttribute(attr.nodeName, attr.nodeValue);
	                    } else {
	                        var tagName = _UkuleleUtil.UkuleleUtil.getAttrFromUkuTag(attr.nodeName, true);
	                        var controllerModel = defMgr.getControllerModelByName(attr.nodeValue);
	                        if (controllerModel) {
	                            var boundItem = new _BoundItemComponentAttribute.BoundItemComponentAttribute(attr.nodeValue, tagName, cc, uku);
	                            controllerModel.addBoundItem(boundItem);
	                            boundItem.render(controllerModel.controllerInstance);
	                        }
	                    }
	                }
	            }
	
	            tag.parentNode.removeChild(tag);
	            if (htmlDom.children && htmlDom.children.length > 0) {
	                (function () {
	                    var ac = new _AsyncCaller.AsyncCaller();
	                    for (var j = 0; j < htmlDom.children.length; j++) {
	                        var child = htmlDom.children[j];
	                        ac.pushQueue(searchComponent, [child, function () {
	                            searchComponent.resolve(ac);
	                        }]);
	                    }
	                    ac.exec(function () {
	                        if (cc && cc._initialized && typeof cc._initialized === 'function') {
	                            cc._initialized();
	                        }
	                        callback && callback(htmlDom);
	                    });
	                })();
	            } else {
	                if (cc && cc._initialized && typeof cc._initialized === 'function') {
	                    cc._initialized();
	                }
	                callback && callback(htmlDom);
	            }
	        }
	    }
	    function searchExpression(element) {
	        if (_UkuleleUtil.UkuleleUtil.searchUkuExpTag(_Selector.Selector.directText(element)) !== -1) {
	            if (!_UkuleleUtil.UkuleleUtil.isRepeat(element) && !_UkuleleUtil.UkuleleUtil.isInRepeat(element)) {
	                //normal expression
	                dealWithExpression(element);
	            }
	        }
	        for (var i = 0; i < element.children.length; i++) {
	            searchExpression(element.children[i]);
	        }
	
	        //处理绑定的expression
	        function dealWithExpression(element) {
	            //通常的花括号声明方式
	            var expression = _Selector.Selector.directText(element);
	            if (_UkuleleUtil.UkuleleUtil.searchUkuExpTag(expression) !== -1) {
	                var attr = expression.slice(2, -2);
	                var controllerModel = defMgr.getControllerModelByName(attr);
	                if (controllerModel) {
	                    var boundItem = new _BoundItemExpression.BoundItemExpression(attr, expression, element, uku);
	                    controllerModel.addBoundItem(boundItem);
	                    boundItem.render(controllerModel.controllerInstance);
	                }
	            }
	        }
	    }
	
	    //处理绑定的attribute
	    function dealWithAttribute(element, tagName) {
	        var attr = element.getAttribute("uku-" + tagName);
	        var elementName = element.tagName;
	        var controllerModel = defMgr.getControllerModelByName(attr);
	        if (controllerModel) {
	            var boundItem = new _BoundItemAttribute.BoundItemAttribute(attr, tagName, element, uku);
	            controllerModel.addBoundItem(boundItem);
	            boundItem.render(controllerModel.controllerInstance);
	            elementChangedBinder(element, tagName, controllerModel, uku.refresh);
	        }
	    }
	
	    //
	    function dealWithInnerText(element) {
	        var attr = element.getAttribute("uku-text");
	        if (attr) {
	            var controllerModel = defMgr.getControllerModelByName(attr);
	            if (controllerModel) {
	                var boundItem = new _BoundItemInnerText.BoundItemInnerText(attr, element, uku);
	                controllerModel.addBoundItem(boundItem);
	                boundItem.render(controllerModel.controllerInstance);
	            }
	        }
	    }
	
	    //处理 事件 event
	    function dealWithEvent(element, eventName) {
	        var expression = element.getAttribute("uku-" + eventName);
	        var eventNameInListener = eventName.substring(2);
	        eventNameInListener = eventNameInListener.toLowerCase();
	        var controllerModel = defMgr.getControllerModelByName(expression);
	        if (controllerModel) {
	            (function () {
	                var controller = controllerModel.controllerInstance;
	                var temArr = expression.split(".");
	                var alias = void 0;
	                if (temArr[0] === "parent") {
	                    alias = temArr[1];
	                } else {
	                    alias = temArr[0];
	                }
	                EventListener.addEventListener(element, eventNameInListener, function (event) {
	                    defMgr.copyControllerInstance(controller, alias);
	                    defMgr.getBoundAttributeValue(expression, arguments);
	                    uku.refresh(alias, element);
	                });
	            })();
	        }
	    }
	    //处理 repeat
	    function dealWithRepeat(element) {
	        var repeatExpression = element.getAttribute("uku-repeat");
	        var tempArr = repeatExpression.split(' in ');
	        var itemName = tempArr[0];
	        var attr = tempArr[1];
	        var controllerModel = defMgr.getControllerModelByName(attr);
	        if (controllerModel) {
	            var controllerInst = controllerModel.controllerInstance;
	            var boundItem = new _BoundItemRepeat.BoundItemRepeat(attr, itemName, element, uku);
	            controllerModel.addBoundItem(boundItem);
	            boundItem.render(controllerInst);
	        }
	    }
	}
	Analyzer.prototype = new _EventEmitter.EventEmitter();
	Analyzer.prototype.constructor = Analyzer;
	Analyzer.ANALYIZE_COMPLETED = 'analyizeCompleted';
	
	exports.Analyzer = Analyzer;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BoundItemAttribute = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BoundItemBase2 = __webpack_require__(14);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BoundItemAttribute = exports.BoundItemAttribute = function (_BoundItemBase) {
	    _inherits(BoundItemAttribute, _BoundItemBase);
	
	    function BoundItemAttribute(attrName, ukuTag, element, uku) {
	        _classCallCheck(this, BoundItemAttribute);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoundItemAttribute).call(this, attrName, element, uku));
	
	        _this.ukuTag = ukuTag;
	        return _this;
	    }
	
	    _createClass(BoundItemAttribute, [{
	        key: "render",
	        value: function render(controller) {
	            var attr = this.attributeName;
	            var key = void 0;
	            var elementName = this.element.tagName;
	            if (this.ukuTag === "selected" && elementName === "SELECT") {
	                var tempArr = this.attributeName.split("|");
	                attr = tempArr[0];
	                key = tempArr[1];
	            }
	            var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(this.uku, controller, attr);
	
	            if (this.ukuTag.search('data-item') !== -1) {
	                finalValue = JSON.stringify(finalValue);
	                this.element.setAttribute('data-item', finalValue);
	            } else if (this.ukuTag === "selected" && elementName === "SELECT") {
	                var value = void 0;
	                if (key) {
	                    value = finalValue[key];
	                } else {
	                    value = finalValue;
	                }
	                this.element.value = value;
	            } else if (this.element.getAttribute("type") === "checkbox") {
	                this.element.checked = finalValue;
	            } else if (this.ukuTag === "value") {
	                this.element.value = finalValue;
	            } else if (this.element.getAttribute("type") === "radio") {
	                if (this.element.value === finalValue) {
	                    this.element.setAttribute("checked", true);
	                }
	            } else if (this.element.nodeName === "IMG" && this.ukuTag === "src") {
	                if (finalValue) {
	                    this.element.setAttribute(this.ukuTag, finalValue);
	                }
	            } else if (this.ukuTag === "style") {
	                for (var cssName in finalValue) {
	                    this.element.style[cssName] = finalValue[cssName];
	                }
	            } else {
	                if (this.ukuTag === "disabled") {
	                    this.element.disabled = finalValue;
	                } else {
	                    this.element.setAttribute(this.ukuTag, finalValue);
	                }
	            }
	        }
	    }]);

	    return BoundItemAttribute;
	}(_BoundItemBase2.BoundItemBase);

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var BoundItemBase = exports.BoundItemBase = function BoundItemBase(attrName, element, uku) {
	    _classCallCheck(this, BoundItemBase);
	
	    this.attributeName = attrName;
	    this.element = element;
	    this.uku = uku;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BoundItemExpression = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BoundItemBase2 = __webpack_require__(14);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	var _Selector = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BoundItemExpression = exports.BoundItemExpression = function (_BoundItemBase) {
	    _inherits(BoundItemExpression, _BoundItemBase);
	
	    function BoundItemExpression(attrName, expression, element, uku) {
	        _classCallCheck(this, BoundItemExpression);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoundItemExpression).call(this, attrName, element, uku));
	
	        _this.expression = expression;
	        return _this;
	    }
	
	    _createClass(BoundItemExpression, [{
	        key: "render",
	        value: function render(controller) {
	            var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	            _Selector.Selector.directText(this.element, finalValue);
	        }
	    }]);

	    return BoundItemExpression;
	}(_BoundItemBase2.BoundItemBase);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BoundItemInnerText = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BoundItemBase2 = __webpack_require__(14);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BoundItemInnerText = exports.BoundItemInnerText = function (_BoundItemBase) {
	    _inherits(BoundItemInnerText, _BoundItemBase);
	
	    function BoundItemInnerText(attrName, element, uku) {
	        _classCallCheck(this, BoundItemInnerText);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoundItemInnerText).call(this, attrName, element, uku));
	
	        _this.tagName = 'text';
	        return _this;
	    }
	
	    _createClass(BoundItemInnerText, [{
	        key: "render",
	        value: function render(controller) {
	            var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	            this.element.innerHTML = finalValue;
	        }
	    }]);

	    return BoundItemInnerText;
	}(_BoundItemBase2.BoundItemBase);

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BoundItemRepeat = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BoundItemBase2 = __webpack_require__(14);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BoundItemRepeat = exports.BoundItemRepeat = function (_BoundItemBase) {
	    _inherits(BoundItemRepeat, _BoundItemBase);
	
	    function BoundItemRepeat(attrName, itemName, element, uku) {
	        _classCallCheck(this, BoundItemRepeat);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoundItemRepeat).call(this, attrName, element, uku));
	
	        _this.expression = itemName;
	        _this.renderTemplate = element.outerHTML;
	        _this.parentElement = element.parentNode;
	        _this.beginCommentString = undefined;
	        _this.endCommentString = undefined;
	        return _this;
	    }
	
	    _createClass(BoundItemRepeat, [{
	        key: "render",
	        value: function render(controller) {
	            var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	            if (!finalValue) {
	                return;
	            }
	
	            var self = this;
	            if (this.element && this.element.parentNode) {
	                //create repeate begin comment
	                this.beginCommentString = "begin uku-repeat: " + this.expression + " in " + this.attributeName;
	                var beginComment = document.createComment(this.beginCommentString);
	                this.element.parentNode.insertBefore(beginComment, this.element);
	                //create repeate end comment
	                this.endCommentString = "end uku-repeat: " + this.expression + " in " + this.attributeName;
	                var endComment = document.createComment(this.endCommentString);
	                this.element.parentNode.insertBefore(endComment, this.element.nextSibling);
	                //remove definition dom
	                this.element.parentNode.removeChild(this.element);
	            }
	            var treeWalker = document.createTreeWalker(this.parentElement, NodeFilter.SHOW_COMMENT, filter, false);
	
	            function filter(node) {
	                if (node.nodeValue === self.beginCommentString) {
	                    return NodeFilter.FILTER_ACCEPT;
	                }
	                return NodeFilter.FILTER_SKIP;
	            }
	
	            function generateTempContainer() {
	                var index = _UkuleleUtil.UkuleleUtil.searchHtmlTag(self.renderTemplate, "tr");
	                if (index === -1) {
	                    return document.createElement("div");
	                } else {
	                    return document.createElement("tbody");
	                }
	            }
	
	            while (treeWalker.nextNode()) {
	                var commentNode = treeWalker.currentNode;
	                if (commentNode && commentNode.nodeValue === this.beginCommentString) {
	                    //remove overtime dom.
	                    while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
	                        commentNode.parentNode.removeChild(commentNode.nextSibling);
	                    }
	                    //create new dom
	                    var tempDiv = generateTempContainer();
	                    var blankDiv = generateTempContainer();
	                    commentNode.parentNode.insertBefore(blankDiv, commentNode.nextSibling);
	                    for (var i = 0; i < finalValue.length; i++) {
	                        tempDiv.insertAdjacentHTML('beforeEnd', this.renderTemplate);
	                        if (i === finalValue.length - 1) {
	                            var childrenHTML = tempDiv.innerHTML;
	                            blankDiv.insertAdjacentHTML('beforeBegin', childrenHTML);
	                            commentNode.parentNode.removeChild(blankDiv);
	                            tempDiv = null;
	                            blankDiv = null;
	                        }
	                    }
	
	                    var child = commentNode.nextSibling;
	                    for (var j = 0; j < finalValue.length; j++) {
	                        child.removeAttribute("uku-repeat");
	                        var ukulele = new Ukulele();
	                        ukulele.parentUku = this.uku;
	                        var compDef = ukulele.parentUku._internal_getDefinitionManager().getComponentsDefinition();
	                        ukulele._internal_getDefinitionManager().setComponentsDefinition(compDef);
	                        var sibling = child.nextSibling;
	                        var itemType = _typeof(finalValue[j]);
	                        if (itemType === "object") {
	                            ukulele.registerController(this.expression, finalValue[j]);
	                        } else {
	                            ukulele.registerController(this.expression, { 'value': finalValue[j] });
	                            var newOuterHtml = child.outerHTML.replace(new RegExp(this.expression, "gm"), this.expression + '.value');
	                            child.insertAdjacentHTML('afterend', newOuterHtml);
	                            var newItemDom = child.nextSibling;
	                            child.parentNode.removeChild(child);
	                            child = newItemDom;
	                        }
	                        ukulele._internal_dealWithElement(child);
	                        child = sibling;
	                    }
	                }
	            }
	
	            if (this.element.tagName === "OPTION") {
	                var expression = this.parentElement.getAttribute("uku-selected");
	                var tempArr = expression.split("|");
	                expression = tempArr[0];
	                key = tempArr[1];
	                var value = this.uku._internal_getDefinitionManager().getFinalValueByExpression(expression);
	                if (key) {
	                    this.parentElement.value = value[key];
	                } else {
	                    this.parentElement.value = value;
	                }
	            }
	        }
	    }]);

	    return BoundItemRepeat;
	}(_BoundItemBase2.BoundItemBase);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BoundItemComponentAttribute = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BoundItemBase2 = __webpack_require__(14);
	
	var _UkuleleUtil = __webpack_require__(8);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BoundItemComponentAttribute = exports.BoundItemComponentAttribute = function (_BoundItemBase) {
	    _inherits(BoundItemComponentAttribute, _BoundItemBase);
	
	    function BoundItemComponentAttribute(attrName, ukuTag, cc, uku) {
	        _classCallCheck(this, BoundItemComponentAttribute);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoundItemComponentAttribute).call(this, attrName, null, uku));
	
	        _this.ukuTag = ukuTag;
	        _this.componentController = cc;
	        return _this;
	    }
	
	    _createClass(BoundItemComponentAttribute, [{
	        key: "render",
	        value: function render(controller) {
	            var finalValue = _UkuleleUtil.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	            this.componentController[this.ukuTag] = finalValue;
	            this.uku.refresh(this.componentController._alias);
	        }
	    }]);

	    return BoundItemComponentAttribute;
	}(_BoundItemBase2.BoundItemBase);

/***/ }
/******/ ])));
//# sourceMappingURL=ukulele.js.map