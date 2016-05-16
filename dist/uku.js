(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var EventEmitter_1 = __webpack_require__(1);
	var AsyncCaller_1 = __webpack_require__(2);
	var DefinitionManager_1 = __webpack_require__(3);
	var DirtyChecker_1 = __webpack_require__(13);
	var Analyzer_1 = __webpack_require__(16);
	var Selector_1 = __webpack_require__(10);
	var UkuEventType_1 = __webpack_require__(14);
	var Event_1 = __webpack_require__(15);
	var Ukulele = (function (_super) {
	    __extends(Ukulele, _super);
	    function Ukulele() {
	        _super.apply(this, arguments);
	        this.asyncCaller = new AsyncCaller_1.AsyncCaller();
	    }
	    Ukulele.prototype.init = function () {
	        var _this = this;
	        this.asyncCaller.exec(function () {
	            _this.manageApplication();
	        });
	    };
	    Ukulele.prototype.handleElement = function (element) {
	        var _this = this;
	        this.analyizeElement(element, function (e) {
	            _this.dispatchEvent(new Event_1.Event(UkuEventType_1.UkuEventType.HANDLE_ELEMENT_COMPLETED, element));
	        });
	    };
	    Ukulele.prototype.registerController = function (instanceName, controllerInst) {
	        this._internal_getDefinitionManager().addControllerDefinition(instanceName, controllerInst);
	    };
	    Ukulele.prototype.getController = function (instanceName) {
	        return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
	    };
	    Ukulele.prototype.registerComponent = function (tag, templateUrl, preload) {
	        this._internal_getDefinitionManager().addComponentDefinition(tag, templateUrl, preload, this.asyncCaller);
	    };
	    Ukulele.prototype.getComponent = function (tagName) {
	        return this._internal_getDefinitionManager().getComponent(tagName);
	    };
	    Ukulele.prototype.refresh = function (alias, excludeElement) {
	        if (!this.dirtyChecker) {
	            this.dirtyChecker = new DirtyChecker_1.DirtyChecker(this);
	        }
	        this.dirtyChecker.runDirtyChecking(alias, excludeElement);
	    };
	    //internal function
	    Ukulele.prototype._internal_getDefinitionManager = function () {
	        if (!this.defMgr) {
	            this.defMgr = new DefinitionManager_1.DefinitionManager(this);
	        }
	        return this.defMgr;
	    };
	    Ukulele.prototype._internal_dealWithElement = function (element) {
	        this.analyizeElement(element);
	    };
	    Ukulele.prototype.manageApplication = function () {
	        var _this = this;
	        var apps = Selector_1.Selector.querySelectorAll(document, "[uku-application]");
	        if (apps.length === 1) {
	            this.analyizeElement(apps[0], function (ele) {
	                _this.dispatchEvent(new Event_1.Event(UkuEventType_1.UkuEventType.INITIALIZED, ele));
	            });
	        }
	        else {
	            throw new Error("Only one 'uku-application' can be declared in a whole html.");
	        }
	    };
	    Ukulele.prototype.analyizeElement = function (element, callback) {
	        var anylyzer = new Analyzer_1.Analyzer(this);
	        // if(callback){
	        // 	anylyzer.addListener(Analyzer.ANALYIZE_COMPLETED,(e)=>{
	        // 		callback(e.element);
	        // 	});
	        // }
	        if (callback) {
	            (function (retFunc) {
	                anylyzer.addListener(Analyzer_1.Analyzer.ANALYIZE_COMPLETED, function (e) {
	                    retFunc(e.element);
	                });
	            })(callback);
	        }
	        anylyzer.analyizeElement(element);
	    };
	    Ukulele.INITIALIZED = 'initialized';
	    Ukulele.REFRESH = 'refresh';
	    Ukulele.HANDLE_ELEMENT_COMPLETED = "handle_element_completed";
	    return Ukulele;
	}(EventEmitter_1.EventEmitter));
	exports.Ukulele = Ukulele;


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var EventEmitter = (function () {
	    function EventEmitter() {
	        this.eventsPool = {};
	    }
	    EventEmitter.prototype.addListener = function (eventType, handler) {
	        if (!this.eventsPool[eventType]) {
	            this.eventsPool[eventType] = [];
	        }
	        this.eventsPool[eventType].push(handler);
	    };
	    EventEmitter.prototype.removeListener = function (eventType, handler) {
	        if (this.eventsPool[eventType]) {
	            for (var i = this.eventsPool[eventType].length - 1; i >= 0; i--) {
	                if (this.eventsPool[eventType][i] === handler) {
	                    this.eventsPool[eventType].splice(i, 1);
	                    break;
	                }
	            }
	        }
	    };
	    EventEmitter.prototype.hasListener = function (eventType) {
	        if (this.eventsPool[eventType] && this.eventsPool[eventType].length > 0) {
	            return true;
	        }
	        return false;
	    };
	    EventEmitter.prototype.dispatchEvent = function (event) {
	        if (event && event.eventType) {
	            var handlers = this.eventsPool[event.eventType];
	            if (handlers) {
	                for (var i = 0; i < handlers.length; i++) {
	                    handlers[i].call(this, event);
	                }
	            }
	        }
	    };
	    return EventEmitter;
	}());
	exports.EventEmitter = EventEmitter;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var FunctionObject = (function () {
	    function FunctionObject(_func, _argu) {
	        this.func = _func;
	        this.argu = _argu;
	    }
	    return FunctionObject;
	}());
	var AsyncCaller = (function () {
	    function AsyncCaller() {
	        this.allTasksPool = [];
	        this.queueTasksPool = [];
	        this.execType = "queue";
	        this.errorMsg = "Only one type of task can be executed at same time";
	        Function.prototype.resolve = function (ac) {
	            ac.aysncFunRunOver.call(ac, this);
	        };
	    }
	    AsyncCaller.prototype.pushAll = function (asyncFunc, arguArr) {
	        if (this.queueTasksPool.length === 0) {
	            var funcObj = new FunctionObject(asyncFunc, arguArr);
	            this.allTasksPool.push(funcObj);
	        }
	        else {
	            console.error(this.errorMsg);
	        }
	        return this;
	    };
	    AsyncCaller.prototype.pushQueue = function (asyncFunc, arguArr) {
	        if (this.allTasksPool.length === 0) {
	            var funcObj = new FunctionObject(asyncFunc, arguArr);
	            this.queueTasksPool.push(funcObj);
	        }
	        else {
	            console.error(this.errorMsg);
	        }
	        return this;
	    };
	    AsyncCaller.prototype.aysncFunRunOver = function (caller) {
	        if (this.execType === "queue") {
	            if (this.queueTasksPool.length === 0) {
	                this.finalFunc && this.finalFunc();
	            }
	            else {
	                var funcObj = this.queueTasksPool[0];
	                this.queueTasksPool.shift();
	                funcObj.func.apply(funcObj, funcObj.argu);
	            }
	        }
	        else if (this.execType === "all") {
	            for (var i = 0; i < this.allTasksPool.length; i++) {
	                var task = this.allTasksPool[i];
	                if (caller === task.func) {
	                    this.allTasksPool.splice(i, 1);
	                    break;
	                }
	            }
	            if (this.allTasksPool.length === 0) {
	                this.finalFunc && this.finalFunc();
	            }
	        }
	    };
	    AsyncCaller.prototype.exec = function (callback) {
	        this.finalFunc = callback;
	        if (this.allTasksPool.length > 0) {
	            this.execType = "all";
	            this.executeAll();
	        }
	        else if (this.queueTasksPool.length > 0) {
	            this.execType = "queue";
	            this.executeQueue();
	        }
	        else {
	            this.finalFunc && this.finalFunc();
	        }
	    };
	    AsyncCaller.prototype.executeQueue = function () {
	        var funcObj = this.queueTasksPool[0];
	        this.queueTasksPool.shift();
	        funcObj.func.apply(funcObj, funcObj.argu);
	    };
	    ;
	    AsyncCaller.prototype.executeAll = function () {
	        for (var i = 0; i < this.allTasksPool.length; i++) {
	            var funcObj = this.allTasksPool[i];
	            funcObj.func.apply(funcObj, funcObj.argu);
	        }
	    };
	    ;
	    return AsyncCaller;
	}());
	exports.AsyncCaller = AsyncCaller;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ObjectUtil_1 = __webpack_require__(4);
	var Ajax_1 = __webpack_require__(5);
	var ControllerModel_1 = __webpack_require__(6);
	var AsyncCaller_1 = __webpack_require__(2);
	var ComponentModel_1 = __webpack_require__(7);
	var ComponentPoolItem_1 = __webpack_require__(8);
	var UkuleleUtil_1 = __webpack_require__(9);
	var DefinitionManager = (function () {
	    function DefinitionManager(_uku) {
	        this.controllersDefinition = {};
	        this.componentsDefinition = {};
	        this.componentsPool = {};
	        this.copyControllers = {};
	        this.dependentScriptsCache = {};
	        this.ajax = new Ajax_1.Ajax();
	        this.uku = _uku;
	    }
	    DefinitionManager.prototype.getComponentsDefinition = function () {
	        return this.componentsDefinition;
	    };
	    DefinitionManager.prototype.getComponentsPool = function () {
	        return this.componentsPool;
	    };
	    DefinitionManager.prototype.setComponentsPool = function (pool) {
	        this.componentsPool = pool;
	    };
	    DefinitionManager.prototype.setComponentsDefinition = function (value) {
	        this.componentsDefinition = value;
	    };
	    DefinitionManager.prototype.getComponentDefinition = function (tagName) {
	        return this.componentsDefinition[tagName];
	    };
	    DefinitionManager.prototype.getControllerDefinition = function (instanceName) {
	        return this.controllersDefinition[instanceName];
	    };
	    DefinitionManager.prototype.getControllersDefinition = function () {
	        return this.controllersDefinition;
	    };
	    DefinitionManager.prototype.getComponent = function (tagName) {
	        return this.componentsPool[tagName];
	    };
	    DefinitionManager.prototype.getCopyControllers = function () {
	        return this.copyControllers;
	    };
	    DefinitionManager.prototype.copyAllController = function () {
	        for (var alias in this.controllersDefinition) {
	            var controllerModel = this.controllersDefinition[alias];
	            var controller = controllerModel.controllerInstance;
	            this.copyControllerInstance(controller, alias);
	        }
	    };
	    DefinitionManager.prototype.copyControllerInstance = function (controller, alias) {
	        var previousCtrlInst = ObjectUtil_1.ObjectUtil.deepClone(controller);
	        delete this.copyControllers[alias];
	        this.copyControllers[alias] = previousCtrlInst;
	    };
	    DefinitionManager.prototype.addControllerDefinition = function (instanceName, controllerInst) {
	        var controllerModel = new ControllerModel_1.ControllerModel(instanceName, controllerInst);
	        controllerInst._alias = instanceName;
	        this.controllersDefinition[instanceName] = controllerModel;
	    };
	    DefinitionManager.prototype.addComponentDefinition = function (tag, templateUrl, preload, asyncCaller) {
	        var _this = this;
	        if (!preload) {
	            this.componentsPool[tag] = new ComponentPoolItem_1.ComponentPoolItem(tag, templateUrl, true);
	        }
	        else {
	            this.componentsPool[tag] = new ComponentPoolItem_1.ComponentPoolItem(tag, templateUrl, false);
	            ;
	            asyncCaller.pushAll(dealWithComponentConfig, [tag, templateUrl]);
	        }
	        function dealWithComponentConfig(tag, template) {
	            _this.ajax.get(templateUrl, function (result) {
	                var componentConfig = UkuleleUtil_1.UkuleleUtil.getComponentConfiguration(result);
	                _this.analyizeComponent(tag, componentConfig, function () {
	                    dealWithComponentConfig.resolve(asyncCaller);
	                });
	            });
	        }
	    };
	    DefinitionManager.prototype.addLazyComponentDefinition = function (tag, templateUrl, callback) {
	        var _this = this;
	        this.ajax.get(templateUrl, function (result) {
	            var componentConfig = UkuleleUtil_1.UkuleleUtil.getComponentConfiguration(result);
	            _this.analyizeComponent(tag, componentConfig, function () {
	                _this.componentsPool[tag] = { 'tagName': tag, 'templateUrl': templateUrl, 'lazy': false };
	                callback();
	            });
	        });
	    };
	    DefinitionManager.prototype.getBoundAttributeValue = function (attr) {
	        var additionalArgu = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            additionalArgu[_i - 1] = arguments[_i];
	        }
	        var controllerModel = this.getBoundControllerModelByName(attr);
	        var controllerInst = controllerModel.controllerInstance;
	        var result = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controllerInst, attr, additionalArgu);
	        return result;
	    };
	    ;
	    DefinitionManager.prototype.getControllerModelByName = function (expression) {
	        return this.getBoundControllerModelByName(expression);
	    };
	    ;
	    DefinitionManager.prototype.getFinalValueByExpression = function (expression) {
	        var controller = this.getControllerModelByName(expression).controllerInstance;
	        return UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, expression);
	    };
	    ;
	    DefinitionManager.prototype.getBoundControllerModelByName = function (attrName) {
	        var instanceName = UkuleleUtil_1.UkuleleUtil.getBoundModelInstantName(attrName);
	        var controllerModel = this.controllersDefinition[instanceName];
	        if (!controllerModel) {
	            var tempArr = attrName.split(".");
	            var isParentScope = tempArr[0];
	            if (isParentScope === "parent" && this.uku.parentUku) {
	                tempArr.shift();
	                attrName = tempArr.join(".");
	                return this.uku.parentUku._internal_getDefinitionManager().getControllerModelByName(attrName);
	            }
	        }
	        return controllerModel;
	    };
	    DefinitionManager.prototype.analyizeComponent = function (tag, config, callback) {
	        var _this = this;
	        var deps = config.dependentScripts;
	        var self = this;
	        if (deps && deps.length > 0) {
	            var ac = new AsyncCaller_1.AsyncCaller();
	            var tmpAMD_1;
	            if (typeof window['define'] === 'function' && window['define'].amd) {
	                tmpAMD_1 = window['define'];
	                window['define'] = undefined;
	            }
	            for (var i = 0; i < deps.length; i++) {
	                var dep = deps[i];
	                ac.pushAll(loadDependentScript, [ac, dep]);
	            }
	            ac.exec(function () {
	                if (tmpAMD_1) {
	                    window['define'] = tmpAMD_1;
	                }
	                _this.buildeComponentModel(tag, config.template, config.componentControllerScript);
	                callback();
	            });
	        }
	        else {
	            this.buildeComponentModel(tag, config.template, config.componentControllerScript);
	            callback();
	        }
	        function loadDependentScript(ac, src) {
	            if (!self.dependentScriptsCache[src]) {
	                var head = document.getElementsByTagName('HEAD')[0];
	                var script = document.createElement('script');
	                script.type = 'text/javascript';
	                script.charset = 'utf-8';
	                script.async = true;
	                script.src = src;
	                script.onload = function (e) {
	                    self.dependentScriptsCache[e.target['src']] = true;
	                    loadDependentScript.resolve(ac);
	                };
	                head.appendChild(script);
	            }
	            else {
	                loadDependentScript.resolve(ac);
	            }
	        }
	    };
	    DefinitionManager.prototype.buildeComponentModel = function (tag, template, script) {
	        var debugComment = "//# sourceURL=" + tag + ".js";
	        script += debugComment;
	        try {
	            var controllerClazz = eval(script);
	            var newComp = new ComponentModel_1.ComponentModel(tag, template, controllerClazz);
	            this.componentsDefinition[tag] = newComp;
	        }
	        catch (e) {
	            console.error(e);
	        }
	    };
	    return DefinitionManager;
	}());
	exports.DefinitionManager = DefinitionManager;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var ObjectUtil = (function () {
	    function ObjectUtil() {
	    }
	    ObjectUtil.isArray = function (obj) {
	        return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	    ObjectUtil.getType = function (obj) {
	        var type = typeof (obj);
	        if (type === "object") {
	            if (ObjectUtil.isArray(obj)) {
	                return "array";
	            }
	            else {
	                return type;
	            }
	        }
	        else {
	            return type;
	        }
	    };
	    ObjectUtil.compare = function (objA, objB) {
	        var type = ObjectUtil.getType(objA);
	        var typeB = ObjectUtil.getType(objB);
	        var result = true;
	        if (type !== typeB) {
	            return false;
	        }
	        else {
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
	                    }
	                    else {
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
	    };
	    ObjectUtil.deepClone = function (obj) {
	        var o;
	        var i;
	        var j;
	        if (typeof (obj) !== "object" || obj === null) {
	            return obj;
	        }
	        if (obj instanceof (Array)) {
	            o = [];
	            i = 0;
	            j = obj.length;
	            for (; i < j; i++) {
	                if (typeof (obj[i]) === "object" && obj[i] !== null) {
	                    o[i] = ObjectUtil.deepClone(obj[i]);
	                }
	                else {
	                    o[i] = obj[i];
	                }
	            }
	        }
	        else {
	            o = {};
	            for (i in obj) {
	                if (typeof (obj[i]) === "object" && obj[i] !== null && i !== "_dom") {
	                    o[i] = ObjectUtil.deepClone(obj[i]);
	                }
	                else {
	                    o[i] = obj[i];
	                }
	            }
	        }
	        return o;
	    };
	    return ObjectUtil;
	}());
	exports.ObjectUtil = ObjectUtil;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	var Ajax = (function () {
	    function Ajax() {
	    }
	    Ajax.prototype.get = function (url, success, error) {
	        var request = new XMLHttpRequest();
	        request.onreadystatechange = function () {
	            if (request.readyState === 4) {
	                if (request.status === 200) {
	                    success(request.responseText);
	                }
	                else {
	                    if (error) {
	                        error();
	                    }
	                }
	            }
	        };
	        request.open("GET", url, true);
	        request.send(null);
	    };
	    return Ajax;
	}());
	exports.Ajax = Ajax;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var ControllerModel = (function () {
	    function ControllerModel(alias, ctrlInst) {
	        this.alias = alias;
	        this.controllerInstance = ctrlInst;
	        this.boundItems = [];
	    }
	    ControllerModel.prototype.addBoundItem = function (boundItem) {
	        this.boundItems.push(boundItem);
	    };
	    ControllerModel.prototype.getBoundItemsByName = function (name) {
	        var tempBoundItems = [];
	        for (var i = 0; i < this.boundItems.length; i++) {
	            var boundItem = this.boundItems[i];
	            if (boundItem.attributeName === name) {
	                tempBoundItems.push(boundItem);
	            }
	        }
	        return tempBoundItems;
	    };
	    return ControllerModel;
	}());
	exports.ControllerModel = ControllerModel;


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var ComponentModel = (function () {
	    function ComponentModel(tagName, template, clazz) {
	        this.tagName = tagName;
	        this.template = template;
	        this.controllerClazz = clazz;
	    }
	    return ComponentModel;
	}());
	exports.ComponentModel = ComponentModel;


/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	var ComponentPoolItem = (function () {
	    function ComponentPoolItem(_tagName, _templateUrl, _lazy) {
	        this.tagName = _tagName;
	        this.templateUrl = _templateUrl;
	        this.lazy = _lazy;
	    }
	    return ComponentPoolItem;
	}());
	exports.ComponentPoolItem = ComponentPoolItem;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Selector_1 = __webpack_require__(10);
	var ArgumentUtil_1 = __webpack_require__(11);
	var ComponentConfiguration_1 = __webpack_require__(12);
	var ValueAndParent = (function () {
	    function ValueAndParent(_value, _parant) {
	        this.value = _value;
	        this.parent = _parant;
	    }
	    return ValueAndParent;
	}());
	var UkuleleUtil = (function () {
	    function UkuleleUtil() {
	    }
	    UkuleleUtil.getFinalAttribute = function (expression) {
	        var temp = expression.split(".");
	        var isParent = temp.shift();
	        if (isParent === "parent") {
	            return UkuleleUtil.getFinalAttribute(temp.join("."));
	        }
	        return temp.join(".");
	    };
	    UkuleleUtil.searchHtmlTag = function (htmlString, tagName) {
	        var reTemp = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
	        var re = new RegExp(reTemp);
	        var index = htmlString.search(re);
	        return index;
	    };
	    UkuleleUtil.getInnerHtml = function (htmlString, tagName) {
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
	        }
	        else {
	            return null;
	        }
	    };
	    UkuleleUtil.getComponentConfiguration = function (htmlString) {
	        var tempDom = document.createElement("div");
	        tempDom.innerHTML = htmlString;
	        var tpl = Selector_1.Selector.querySelectorAll(tempDom, "template");
	        var scripts = Selector_1.Selector.querySelectorAll(tempDom, "script");
	        var deps = [];
	        var ccs = null;
	        for (var i = 0; i < scripts.length; i++) {
	            var script = scripts[i];
	            if (script.src !== "") {
	                deps.push(script.src);
	            }
	            else {
	                ccs = script.innerHTML;
	            }
	        }
	        return new ComponentConfiguration_1.ComponentConfiguration(tpl[0].innerHTML, deps, ccs);
	    };
	    UkuleleUtil.searchUkuAttrTag = function (htmlString) {
	        var re = /^uku\-.*/;
	        var index = htmlString.search(re);
	        return index;
	    };
	    UkuleleUtil.getAttrFromUkuTag = function (ukuTag, camelCase) {
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
	    };
	    UkuleleUtil.searchUkuExpTag = function (expression) {
	        var re = /^\{\{.*\}\}$/;
	        var index = expression.search(re);
	        return index;
	    };
	    UkuleleUtil.searchUkuFuncArg = function (htmlString) {
	        var re = /\(.*\)$/;
	        var index = htmlString.search(re);
	        return index;
	    };
	    UkuleleUtil.isRepeat = function (element) {
	        if (element.getAttribute("uku-repeat")) {
	            return true;
	        }
	        return false;
	    };
	    UkuleleUtil.isInRepeat = function (element) {
	        var parents = Selector_1.Selector.parents(element);
	        for (var i = 0; i < parents.length; i++) {
	            var parent_1 = parents[i];
	            if (parent_1.nodeType !== 9) {
	                var b = parent_1.getAttribute("uku-repeat");
	                if (b) {
	                    return true;
	                }
	            }
	        }
	        return false;
	    };
	    UkuleleUtil.getBoundModelInstantName = function (expression) {
	        var controlInstName = expression.split('.')[0];
	        if (controlInstName) {
	            return controlInstName;
	        }
	        return undefined;
	    };
	    UkuleleUtil.getAttributeFinalValue = function (object, attrName) {
	        var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
	        var value = valueObject.value;
	        return value;
	    };
	    UkuleleUtil.getAttributeFinalValueAndParent = function (object, attrName) {
	        var finalValue = object;
	        var parentValue;
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
	            }
	            else {
	                if (object.hasOwnProperty("_alias") && object._alias === attrName) {
	                    finalValue = object;
	                }
	                else {
	                    finalValue = attrName;
	                }
	            }
	        }
	        return new ValueAndParent(finalValue, parentValue);
	    };
	    UkuleleUtil.getFinalValue = function (uku, object, attrName) {
	        var additionalArgu = [];
	        for (var _i = 3; _i < arguments.length; _i++) {
	            additionalArgu[_i - 3] = arguments[_i];
	        }
	        var index = -1;
	        if (typeof attrName === "string") {
	            index = UkuleleUtil.searchUkuFuncArg(attrName);
	        }
	        if (index === -1) {
	            //is attribute
	            return UkuleleUtil.getAttributeFinalValue(object, attrName);
	        }
	        else {
	            //is function
	            var functionName = attrName.substring(0, index);
	            var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
	            var finalValue = finalValueObject.value;
	            if (finalValue === undefined) {
	                return finalValue;
	            }
	            var new_arguments = [];
	            var _argumentsString = attrName.substring(index + 1, attrName.length - 1);
	            if (_argumentsString !== "") {
	                var _arguments = ArgumentUtil_1.ArgumentUtil.analyze(_argumentsString, uku);
	                for (var i = 0; i < _arguments.length; i++) {
	                    var temp = void 0;
	                    var argument = _arguments[i];
	                    var argType = typeof argument;
	                    var controllerModel = null;
	                    if (argType === "string") {
	                        controllerModel = uku._internal_getDefinitionManager().getControllerModelByName(argument);
	                        if (controllerModel && controllerModel.controllerInstance) {
	                            var agrumentInst = controllerModel.controllerInstance;
	                            if (argument.split(".").length === 1) {
	                                temp = agrumentInst;
	                            }
	                            else {
	                                temp = UkuleleUtil.getFinalValue(uku, agrumentInst, argument);
	                            }
	                        }
	                        else {
	                            temp = UkuleleUtil.getFinalValue(uku, object, argument);
	                        }
	                        new_arguments.push(temp);
	                    }
	                    else {
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
	    };
	    return UkuleleUtil;
	}());
	exports.UkuleleUtil = UkuleleUtil;


/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	var Selector = (function () {
	    function Selector() {
	    }
	    Selector.querySelectorAll = function (element, query) {
	        if (window.hasOwnProperty('jQuery') && typeof window['jQuery'] !== "undefined") {
	            return window['jQuery'](element).find(query);
	        }
	        else {
	            return element.querySelectorAll(query);
	        }
	    };
	    Selector.fuzzyFind = function (element, text) {
	        if (element && element.attributes) {
	            for (var i = 0; i < element.attributes.length; i++) {
	                var attr = element.attributes[i];
	                if (attr.nodeName.search(text) > -1) {
	                    return element;
	                }
	            }
	        }
	        return null;
	    };
	    Selector.directText = function (element, text) {
	        var o = "";
	        var nodes = element.childNodes;
	        for (var i = 0; i <= nodes.length - 1; i++) {
	            var node = nodes[i];
	            if (node.nodeType === 3) {
	                if (text || text === "" || text === 0 || text === false) {
	                    node.nodeValue = text;
	                    return;
	                }
	                else {
	                    o += node.nodeValue;
	                }
	            }
	        }
	        return o.trim();
	    };
	    Selector.parents = function (element) {
	        var parents = [];
	        while (element.parentNode && element.parentNode.tagName !== 'BODY') {
	            parents.push(element.parentNode);
	            element = element.parentNode;
	        }
	        return parents;
	    };
	    return Selector;
	}());
	exports.Selector = Selector;


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	var ArgumentUtil = (function () {
	    function ArgumentUtil() {
	    }
	    ArgumentUtil.analyze = function (argumentString, uku) {
	        var re = /^\{\{.*\}\}$/;
	        argumentString = argumentString.replace(/'/g, '"');
	        var tempArr = argumentString.split(",");
	        for (var i = 0; i < tempArr.length; i++) {
	            var arr = tempArr[i];
	            for (var alias in uku._internal_getDefinitionManager().getControllersDefinition()) {
	                var index = arr.search(alias);
	                var index2 = arr.search("parent.");
	                if (index > -1 || index2 > -1) {
	                    tempArr[i] = '"' + arr + '"';
	                }
	            }
	        }
	        argumentString = tempArr.join(",");
	        argumentString = '[' + argumentString + ']';
	        try {
	            var jsonArr = JSON.parse(argumentString);
	            return jsonArr;
	        }
	        catch (e) {
	            console.error(e);
	            return null;
	        }
	    };
	    return ArgumentUtil;
	}());
	exports.ArgumentUtil = ArgumentUtil;


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	var ComponentConfiguration = (function () {
	    function ComponentConfiguration(_template, _dependentScripts, _componentControllerScript) {
	        this.template = _template;
	        this.dependentScripts = _dependentScripts;
	        this.componentControllerScript = _componentControllerScript;
	    }
	    return ComponentConfiguration;
	}());
	exports.ComponentConfiguration = ComponentConfiguration;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var UkuleleUtil_1 = __webpack_require__(9);
	var ObjectUtil_1 = __webpack_require__(4);
	var UkuEventType_1 = __webpack_require__(14);
	var Event_1 = __webpack_require__(15);
	var DirtyChecker = (function () {
	    function DirtyChecker(_uku) {
	        this.uku = _uku;
	        this.defMgr = this.uku._internal_getDefinitionManager();
	    }
	    DirtyChecker.prototype.runDirtyChecking = function (ctrlAliasName, excludeElement) {
	        var _this = this;
	        if (ctrlAliasName) {
	            if (typeof (ctrlAliasName) === "string") {
	                watchController(ctrlAliasName);
	            }
	            else if (ObjectUtil_1.ObjectUtil.isArray(ctrlAliasName)) {
	                for (var i = 0; i < ctrlAliasName.length; i++) {
	                    watchController(ctrlAliasName[i]);
	                }
	            }
	        }
	        else {
	            for (var alias in this.defMgr.getControllersDefinition()) {
	                watchController(alias);
	            }
	        }
	        function watchController(alias) {
	            var controllerModel = _this.defMgr.getControllersDefinition()[alias];
	            if (!controllerModel) {
	                if (_this.uku.parentUku) {
	                    _this.uku.parentUku.refresh(alias);
	                }
	                return;
	            }
	            var controller = controllerModel.controllerInstance;
	            var previousCtrlModel = _this.defMgr.getCopyControllers()[alias];
	            var changedElementCount = 0;
	            for (var i = 0; i < controllerModel.boundItems.length; i++) {
	                var boundItem = controllerModel.boundItems[i];
	                var attrName = boundItem.attributeName;
	                if (attrName.search('parent.') > -1) {
	                    return;
	                }
	                if (previousCtrlModel) {
	                    if (boundItem.hasOwnProperty('ukuTag') && boundItem['ukuTag'] === "selected") {
	                        attrName = attrName.split("|")[0];
	                    }
	                    var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(_this.uku, controller, attrName);
	                    var previousFinalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(_this.uku, previousCtrlModel, attrName);
	                    if (!ObjectUtil_1.ObjectUtil.compare(previousFinalValue, finalValue)) {
	                        attrName = boundItem.attributeName;
	                        var changedBoundItems = controllerModel.getBoundItemsByName(attrName);
	                        for (var j = 0; j < changedBoundItems.length; j++) {
	                            var changedBoundItem = changedBoundItems[j];
	                            if (changedBoundItem.element !== excludeElement || (boundItem.hasOwnProperty('ukuTag') && changedBoundItem['ukuTag'] !== "value")) {
	                                changedElementCount++;
	                                changedBoundItem.render(controller);
	                            }
	                        }
	                    }
	                }
	            }
	            if (changedElementCount > 0 && _this.uku.hasListener(UkuEventType_1.UkuEventType.REFRESH)) {
	                _this.uku.dispatchEvent(new Event_1.Event(UkuEventType_1.UkuEventType.REFRESH));
	            }
	            _this.defMgr.copyControllerInstance(controller, alias);
	        }
	    };
	    ;
	    return DirtyChecker;
	}());
	exports.DirtyChecker = DirtyChecker;


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	var UkuEventType = (function () {
	    function UkuEventType() {
	    }
	    UkuEventType.INITIALIZED = 'initialized';
	    UkuEventType.REFRESH = 'refresh';
	    UkuEventType.HANDLE_ELEMENT_COMPLETED = "handle_element_completed";
	    return UkuEventType;
	}());
	exports.UkuEventType = UkuEventType;


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	var Event = (function () {
	    function Event(_eventType, _element) {
	        this.eventType = _eventType;
	        this.element = _element;
	    }
	    return Event;
	}());
	exports.Event = Event;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var EventEmitter_1 = __webpack_require__(1);
	var UkuleleUtil_1 = __webpack_require__(9);
	var AsyncCaller_1 = __webpack_require__(2);
	var BoundItemAttribute_1 = __webpack_require__(17);
	var BoundItemExpression_1 = __webpack_require__(19);
	var BoundItemInnerText_1 = __webpack_require__(20);
	var BoundItemRepeat_1 = __webpack_require__(21);
	var BoundItemComponentAttribute_1 = __webpack_require__(22);
	var ElementActionBinder_1 = __webpack_require__(23);
	var EventListener_1 = __webpack_require__(24);
	var Selector_1 = __webpack_require__(10);
	var Event_1 = __webpack_require__(15);
	var Analyzer = (function (_super) {
	    __extends(Analyzer, _super);
	    function Analyzer(_uku) {
	        _super.call(this);
	        //处理绑定的attribute
	        this.dealWithAttribute = function (element, tagName) {
	            var attr = element.getAttribute("uku-" + tagName);
	            var elementName = element.tagName;
	            var controllerModel = this.defMgr.getControllerModelByName(attr);
	            if (controllerModel) {
	                var boundItem = new BoundItemAttribute_1.BoundItemAttribute(attr, tagName, element, this.uku);
	                controllerModel.addBoundItem(boundItem);
	                boundItem.render(controllerModel.controllerInstance);
	                ElementActionBinder_1.elementChangedBinder(element, tagName, controllerModel, this.uku.refresh, this.uku);
	            }
	        };
	        this.uku = _uku;
	        this.defMgr = this.uku._internal_getDefinitionManager();
	    }
	    //解析html中各个uku的tag
	    Analyzer.prototype.analyizeElement = function (ele) {
	        var _this = this;
	        this.searchComponent(ele, function (element) {
	            var subElements = [];
	            //scan element which has uku-* tag
	            var isSelfHasUkuTag = Selector_1.Selector.fuzzyFind(element, 'uku-');
	            if (isSelfHasUkuTag) {
	                subElements.push(isSelfHasUkuTag);
	            }
	            var allChildren = Selector_1.Selector.querySelectorAll(element, "*");
	            for (var i = 0; i < allChildren.length; i++) {
	                var child = allChildren[i];
	                var matchElement = Selector_1.Selector.fuzzyFind(child, 'uku-');
	                if (matchElement && !UkuleleUtil_1.UkuleleUtil.isInRepeat(matchElement)) {
	                    subElements.push(matchElement);
	                }
	            }
	            _this.searchExpression(element);
	            //解析绑定 attribute，注册event
	            for (var n = 0; n < subElements.length; n++) {
	                var subElement = subElements[n];
	                var orderAttrs = _this.sortAttributes(subElement);
	                for (var j = 0; j < orderAttrs.length; j++) {
	                    var attribute = orderAttrs[j];
	                    if (UkuleleUtil_1.UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
	                        var tempArr = attribute.nodeName.split('-');
	                        tempArr.shift();
	                        var attrName = tempArr.join('-');
	                        if (attrName !== "application") {
	                            if (attrName.search('on') === 0) {
	                                //is an event
	                                if (!UkuleleUtil_1.UkuleleUtil.isRepeat(subElement) && !UkuleleUtil_1.UkuleleUtil.isInRepeat(subElement)) {
	                                    _this.dealWithEvent(subElement, attrName);
	                                }
	                            }
	                            else if (attrName.search('repeat') !== -1) {
	                                //is an repeat
	                                _this.dealWithRepeat(subElement);
	                            }
	                            else {
	                                //is an attribute
	                                if (!UkuleleUtil_1.UkuleleUtil.isRepeat(subElement) && !UkuleleUtil_1.UkuleleUtil.isInRepeat(subElement)) {
	                                    if (attrName !== "text") {
	                                        _this.dealWithAttribute(subElement, attrName);
	                                    }
	                                    else {
	                                        _this.dealWithInnerText(subElement);
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	            _this.defMgr.copyAllController();
	            if (_this.hasListener(Analyzer.ANALYIZE_COMPLETED)) {
	                _this.dispatchEvent(new Event_1.Event(Analyzer.ANALYIZE_COMPLETED, element));
	            }
	        });
	    };
	    Analyzer.prototype.sortAttributes = function (subElement) {
	        var orderAttrs = [];
	        for (var i = 0; i < subElement.attributes.length; i++) {
	            var attribute = subElement.attributes[i];
	            if (attribute.nodeName.search("uku-on") !== -1) {
	                orderAttrs.push(attribute);
	            }
	            else {
	                orderAttrs.unshift(attribute);
	            }
	        }
	        return orderAttrs;
	    };
	    Analyzer.prototype.searchComponent = function (element, callback) {
	        var _this = this;
	        var comp = this.defMgr.getComponent(element.localName);
	        if (comp) {
	            if (!comp.lazy) {
	                var attrs = element.attributes;
	                var compDef = this.defMgr.getComponentsDefinition()[comp.tagName];
	                if (!UkuleleUtil_1.UkuleleUtil.isRepeat(element) && !UkuleleUtil_1.UkuleleUtil.isInRepeat(element)) {
	                    this.dealWithComponent(element, compDef.template, compDef.controllerClazz, attrs, function (compElement) {
	                        callback && callback(compElement);
	                    });
	                }
	                else {
	                    callback && callback(element);
	                }
	            }
	            else {
	                this.defMgr.addLazyComponentDefinition(comp.tagName, comp.templateUrl, function () {
	                    var attrs = element.attributes;
	                    var compDef = _this.defMgr.getComponentsDefinition()[comp.tagName];
	                    if (!UkuleleUtil_1.UkuleleUtil.isRepeat(element) && !UkuleleUtil_1.UkuleleUtil.isInRepeat(element)) {
	                        _this.dealWithComponent(element, compDef.template, compDef.controllerClazz, attrs, function (compElement) {
	                            callback && callback(compElement);
	                        });
	                    }
	                    else {
	                        callback && callback(element);
	                    }
	                });
	            }
	        }
	        else {
	            if (element.children && element.children.length > 0) {
	                var ac_1 = new AsyncCaller_1.AsyncCaller();
	                for (var i = 0; i < element.children.length; i++) {
	                    var child = element.children[i];
	                    ac_1.pushQueue(this.searchComponent.bind(this), [child, function () {
	                            _this.searchComponent.resolve(ac_1);
	                        }]);
	                }
	                ac_1.exec(function () {
	                    callback && callback(element);
	                });
	            }
	            else {
	                callback && callback(element);
	            }
	        }
	    };
	    Analyzer.prototype.dealWithComponent = function (tag, template, Clazz, attrs, callback) {
	        var _this = this;
	        var randomAlias = 'cc_' + Math.floor(10000 * Math.random()).toString();
	        template = template.replace(new RegExp('cc.', 'gm'), randomAlias + '.');
	        var tempFragment = document.createElement('div');
	        tempFragment.insertAdjacentHTML('afterBegin', template);
	        if (tempFragment.children.length > 1) {
	            template = tempFragment.outerHTML;
	        }
	        tag.insertAdjacentHTML('beforeBegin', template);
	        var htmlDom = tag.previousElementSibling;
	        var cc;
	        if (Clazz) {
	            cc = new Clazz(this.uku);
	            cc._dom = htmlDom;
	            cc.fire = function (eventType, data) {
	                var event = document.createEvent('HTMLEvents');
	                event.initEvent(eventType.toLowerCase(), true, true);
	                event['data'] = data;
	                cc._dom.dispatchEvent(event);
	            };
	            this.uku.registerController(randomAlias, cc);
	            for (var i = 0; i < attrs.length; i++) {
	                var attr = attrs[i];
	                if (UkuleleUtil_1.UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0 || attr.nodeName.search("uku-on") !== -1) {
	                    htmlDom.setAttribute(attr.nodeName, attr.nodeValue);
	                }
	                else {
	                    var tagName = UkuleleUtil_1.UkuleleUtil.getAttrFromUkuTag(attr.nodeName, true);
	                    var controllerModel = this.defMgr.getControllerModelByName(attr.nodeValue);
	                    if (controllerModel) {
	                        var boundItem = new BoundItemComponentAttribute_1.BoundItemComponentAttribute(attr.nodeValue, tagName, cc, this.uku);
	                        controllerModel.addBoundItem(boundItem);
	                        boundItem.render(controllerModel.controllerInstance);
	                    }
	                }
	            }
	        }
	        tag.parentNode.removeChild(tag);
	        if (htmlDom.children && htmlDom.children.length > 0) {
	            var ac_2 = new AsyncCaller_1.AsyncCaller();
	            for (var j = 0; j < htmlDom.children.length; j++) {
	                var child = htmlDom.children[j];
	                ac_2.pushQueue(this.searchComponent.bind(this), [child, function () {
	                        _this.searchComponent.resolve(ac_2);
	                    }]);
	            }
	            ac_2.exec(function () {
	                if (cc && cc._initialized && typeof (cc._initialized) === 'function') {
	                    cc._initialized();
	                }
	                callback && callback(htmlDom);
	            });
	        }
	        else {
	            if (cc && cc._initialized && typeof (cc._initialized) === 'function') {
	                cc._initialized();
	            }
	            callback && callback(htmlDom);
	        }
	    };
	    Analyzer.prototype.searchExpression = function (element) {
	        if (UkuleleUtil_1.UkuleleUtil.searchUkuExpTag(Selector_1.Selector.directText(element)) !== -1) {
	            if (!UkuleleUtil_1.UkuleleUtil.isRepeat(element) && !UkuleleUtil_1.UkuleleUtil.isInRepeat(element)) {
	                //normal expression
	                this.dealWithExpression(element);
	            }
	        }
	        for (var i = 0; i < element.children.length; i++) {
	            this.searchExpression(element.children[i]);
	        }
	    };
	    Analyzer.prototype.dealWithExpression = function (element) {
	        //通常的花括号声明方式
	        var expression = Selector_1.Selector.directText(element);
	        if (UkuleleUtil_1.UkuleleUtil.searchUkuExpTag(expression) !== -1) {
	            var attr = expression.slice(2, -2);
	            var controllerModel = this.defMgr.getControllerModelByName(attr);
	            if (controllerModel) {
	                var boundItem = new BoundItemExpression_1.BoundItemExpression(attr, expression, element, this.uku);
	                controllerModel.addBoundItem(boundItem);
	                boundItem.render(controllerModel.controllerInstance);
	            }
	        }
	    };
	    //
	    Analyzer.prototype.dealWithInnerText = function (element) {
	        var attr = element.getAttribute("uku-text");
	        if (attr) {
	            var controllerModel = this.defMgr.getControllerModelByName(attr);
	            if (controllerModel) {
	                var boundItem = new BoundItemInnerText_1.BoundItemInnerText(attr, element, this.uku);
	                controllerModel.addBoundItem(boundItem);
	                boundItem.render(controllerModel.controllerInstance);
	            }
	        }
	    };
	    //处理 事件 event
	    Analyzer.prototype.dealWithEvent = function (element, eventName) {
	        var _this = this;
	        var expression = element.getAttribute("uku-" + eventName);
	        var eventNameInListener = eventName.substring(2);
	        eventNameInListener = eventNameInListener.toLowerCase();
	        var controllerModel = this.defMgr.getControllerModelByName(expression);
	        if (controllerModel) {
	            var controller_1 = controllerModel.controllerInstance;
	            var temArr = expression.split(".");
	            var alias_1;
	            if (temArr[0] === "parent") {
	                alias_1 = temArr[1];
	            }
	            else {
	                alias_1 = temArr[0];
	            }
	            EventListener_1.EventListener.addEventListener(element, eventNameInListener, function (event) {
	                _this.defMgr.copyControllerInstance(controller_1, alias_1);
	                _this.defMgr.getBoundAttributeValue(expression, event);
	                _this.uku.refresh(alias_1, element);
	            });
	        }
	    };
	    //处理 repeat
	    Analyzer.prototype.dealWithRepeat = function (element) {
	        var repeatExpression = element.getAttribute("uku-repeat");
	        var tempArr = repeatExpression.split(' in ');
	        var itemName = tempArr[0];
	        var attr = tempArr[1];
	        var controllerModel = this.defMgr.getControllerModelByName(attr);
	        if (controllerModel) {
	            var controllerInst = controllerModel.controllerInstance;
	            var boundItem = new BoundItemRepeat_1.BoundItemRepeat(attr, itemName, element, this.uku);
	            controllerModel.addBoundItem(boundItem);
	            boundItem.render(controllerInst);
	        }
	    };
	    Analyzer.ANALYIZE_COMPLETED = 'analyizeCompleted';
	    return Analyzer;
	}(EventEmitter_1.EventEmitter));
	exports.Analyzer = Analyzer;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BoundItemBase_1 = __webpack_require__(18);
	var UkuleleUtil_1 = __webpack_require__(9);
	var BoundItemAttribute = (function (_super) {
	    __extends(BoundItemAttribute, _super);
	    function BoundItemAttribute(attrName, ukuTag, element, uku) {
	        _super.call(this, attrName, element, uku);
	        this.ukuTag = ukuTag;
	    }
	    BoundItemAttribute.prototype.render = function (controller) {
	        var attr = this.attributeName;
	        var key;
	        var elementName = this.element.tagName;
	        if (this.ukuTag === "selected" && elementName === "SELECT") {
	            var tempArr = this.attributeName.split("|");
	            attr = tempArr[0];
	            key = tempArr[1];
	        }
	        var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, attr);
	        if (this.ukuTag.search('data-item') !== -1) {
	            finalValue = JSON.stringify(finalValue);
	            this.element.setAttribute('data-item', finalValue);
	        }
	        else if (this.ukuTag === "selected" && elementName === "SELECT") {
	            var value = void 0;
	            if (key) {
	                value = finalValue[key];
	            }
	            else {
	                value = finalValue;
	            }
	            this.element.value = value;
	        }
	        else if (this.element.getAttribute("type") === "checkbox") {
	            this.element.checked = finalValue;
	        }
	        else if (this.ukuTag === "value") {
	            this.element.value = finalValue;
	        }
	        else if (this.element.getAttribute("type") === "radio") {
	            if (this.element.value === finalValue) {
	                this.element.setAttribute("checked", "true");
	            }
	        }
	        else if (this.element.nodeName === "IMG" && this.ukuTag === "src") {
	            if (finalValue) {
	                this.element.setAttribute(this.ukuTag, finalValue);
	            }
	        }
	        else if (this.ukuTag === "style") {
	            for (var cssName in finalValue) {
	                this.element.style[cssName] = finalValue[cssName];
	            }
	        }
	        else {
	            if (this.ukuTag === "disabled") {
	                this.element.disabled = finalValue;
	            }
	            else {
	                this.element.setAttribute(this.ukuTag, finalValue);
	            }
	        }
	    };
	    return BoundItemAttribute;
	}(BoundItemBase_1.BoundItemBase));
	exports.BoundItemAttribute = BoundItemAttribute;


/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	var BoundItemBase = (function () {
	    function BoundItemBase(_attrName, _element, _uku) {
	        this.attributeName = _attrName;
	        this.element = _element;
	        this.uku = _uku;
	    }
	    BoundItemBase.prototype.render = function (controller) {
	    };
	    return BoundItemBase;
	}());
	exports.BoundItemBase = BoundItemBase;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BoundItemBase_1 = __webpack_require__(18);
	var UkuleleUtil_1 = __webpack_require__(9);
	var Selector_1 = __webpack_require__(10);
	var BoundItemExpression = (function (_super) {
	    __extends(BoundItemExpression, _super);
	    function BoundItemExpression(attrName, expression, element, uku) {
	        _super.call(this, attrName, element, uku);
	        this.expression = expression;
	    }
	    BoundItemExpression.prototype.render = function (controller) {
	        var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	        Selector_1.Selector.directText(this.element, finalValue);
	    };
	    return BoundItemExpression;
	}(BoundItemBase_1.BoundItemBase));
	exports.BoundItemExpression = BoundItemExpression;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BoundItemBase_1 = __webpack_require__(18);
	var UkuleleUtil_1 = __webpack_require__(9);
	var BoundItemInnerText = (function (_super) {
	    __extends(BoundItemInnerText, _super);
	    function BoundItemInnerText(attrName, element, uku) {
	        _super.call(this, attrName, element, uku);
	        this.tagName = 'text';
	    }
	    BoundItemInnerText.prototype.render = function (controller) {
	        var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	        this.element.innerHTML = finalValue;
	    };
	    return BoundItemInnerText;
	}(BoundItemBase_1.BoundItemBase));
	exports.BoundItemInnerText = BoundItemInnerText;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BoundItemBase_1 = __webpack_require__(18);
	var UkuleleUtil_1 = __webpack_require__(9);
	var BoundItemRepeat = (function (_super) {
	    __extends(BoundItemRepeat, _super);
	    function BoundItemRepeat(attrName, itemName, element, uku) {
	        _super.call(this, attrName, element, uku);
	        this.expression = itemName;
	        this.renderTemplate = element.outerHTML;
	        this.parentElement = element.parentNode;
	        this.beginCommentString = undefined;
	        this.endCommentString = undefined;
	    }
	    BoundItemRepeat.prototype.render = function (controller) {
	        var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
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
	        var treeWalker = document.createTreeWalker(this.parentElement, NodeFilter.SHOW_COMMENT, { acceptNode: function (node) {
	                if (node.nodeValue === self.beginCommentString) {
	                    return NodeFilter.FILTER_ACCEPT;
	                }
	                return NodeFilter.FILTER_SKIP;
	            } }, false);
	        function filter(node) {
	            if (node.nodeValue === self.beginCommentString) {
	                return (NodeFilter.FILTER_ACCEPT);
	            }
	            return (NodeFilter.FILTER_SKIP);
	        }
	        function generateTempContainer() {
	            var index = UkuleleUtil_1.UkuleleUtil.searchHtmlTag(self.renderTemplate, "tr");
	            if (index === -1) {
	                return document.createElement("div");
	            }
	            else {
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
	                    var Uku_Clazz = this.uku.constructor;
	                    var ukulele = new Uku_Clazz(); //new Ukulele();
	                    ukulele.parentUku = this.uku;
	                    var compDef = ukulele.parentUku._internal_getDefinitionManager().getComponentsDefinition();
	                    var compPool = ukulele.parentUku._internal_getDefinitionManager().getComponentsPool();
	                    ukulele._internal_getDefinitionManager().setComponentsDefinition(compDef);
	                    ukulele._internal_getDefinitionManager().setComponentsPool(compPool);
	                    var sibling = child.nextSibling;
	                    var itemType = typeof finalValue[j];
	                    if (itemType === "object") {
	                        ukulele.registerController(this.expression, finalValue[j]);
	                    }
	                    else {
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
	            var key = tempArr[1];
	            var value = this.uku._internal_getDefinitionManager().getFinalValueByExpression(expression);
	            if (key) {
	                this.parentElement.value = value[key];
	            }
	            else {
	                this.parentElement.value = value;
	            }
	        }
	    };
	    return BoundItemRepeat;
	}(BoundItemBase_1.BoundItemBase));
	exports.BoundItemRepeat = BoundItemRepeat;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BoundItemBase_1 = __webpack_require__(18);
	var UkuleleUtil_1 = __webpack_require__(9);
	var BoundItemComponentAttribute = (function (_super) {
	    __extends(BoundItemComponentAttribute, _super);
	    function BoundItemComponentAttribute(attrName, ukuTag, cc, uku) {
	        _super.call(this, attrName, null, uku);
	        this.ukuTag = ukuTag;
	        this.componentController = cc;
	    }
	    BoundItemComponentAttribute.prototype.render = function (controller) {
	        var finalValue = UkuleleUtil_1.UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
	        this.componentController[this.ukuTag] = finalValue;
	        this.uku.refresh(this.componentController._alias);
	    };
	    return BoundItemComponentAttribute;
	}(BoundItemBase_1.BoundItemBase));
	exports.BoundItemComponentAttribute = BoundItemComponentAttribute;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var UkuleleUtil_1 = __webpack_require__(9);
	var EventListener_1 = __webpack_require__(24);
	var Selector_1 = __webpack_require__(10);
	function elementChangedBinder(element, tagName, controllerModel, handler, host) {
	    var elementStrategies = [inputTextCase, textareaCase, selectCase, checkboxCase, radioCase];
	    for (var i = 0; i < elementStrategies.length; i++) {
	        var func = elementStrategies[i];
	        var goon = func.apply(this, arguments);
	        if (goon) {
	            break;
	        }
	    }
	}
	exports.elementChangedBinder = elementChangedBinder;
	function inputTextCase(element, tagName, controllerModel, handler, host) {
	    var elementName = element.tagName;
	    if (elementName === "INPUT" && isSupportInputType(element) && tagName === "value") {
	        var eventType = 'change';
	        var inputType = element.getAttribute('type');
	        if (inputType === "text") {
	            eventType = 'input';
	        }
	        EventListener_1.EventListener.addEventListener(element, eventType, function (e) {
	            var attr = element.getAttribute("uku-" + tagName);
	            attr = UkuleleUtil_1.UkuleleUtil.getFinalAttribute(attr);
	            var temp = attr.split(".");
	            var finalInstance = controllerModel.controllerInstance;
	            for (var i = 0; i < temp.length - 1; i++) {
	                finalInstance = finalInstance[temp[i]];
	            }
	            finalInstance[temp[temp.length - 1]] = element.value;
	            if (handler) {
	                handler.call(host, controllerModel.alias, element);
	            }
	        });
	        return true;
	    }
	    return false;
	}
	function isSupportInputType(element) {
	    var type = element.getAttribute("type");
	    if (type !== "checkbox" && type !== "radio") {
	        return true;
	    }
	    return false;
	}
	function textareaCase(element, tagName, controllerModel, handler, host) {
	    var elementName = element.tagName;
	    if (elementName === "TEXTAREA" && tagName === "value") {
	        EventListener_1.EventListener.addEventListener(element, 'input', function (e) {
	            var attr = element.getAttribute("uku-" + tagName);
	            attr = UkuleleUtil_1.UkuleleUtil.getFinalAttribute(attr);
	            var temp = attr.split(".");
	            var finalInstance = controllerModel.controllerInstance;
	            for (var i = 0; i < temp.length - 1; i++) {
	                finalInstance = finalInstance[temp[i]];
	            }
	            finalInstance[temp[temp.length - 1]] = element.value;
	            if (handler) {
	                handler.call(host, controllerModel.alias, element);
	            }
	        });
	        return true;
	    }
	    return false;
	}
	function selectCase(element, tagName, controllerModel, handler, host) {
	    var elementName = element.tagName;
	    if ((elementName === "SELECT" && tagName === "selected")) {
	        EventListener_1.EventListener.addEventListener(element, 'change', function (e) {
	            var attr = element.getAttribute("uku-" + tagName);
	            var key;
	            var tmpArr = attr.split("|");
	            attr = tmpArr[0];
	            key = tmpArr[1];
	            attr = UkuleleUtil_1.UkuleleUtil.getFinalAttribute(attr);
	            var temp = attr.split(".");
	            var finalInstance = controllerModel.controllerInstance;
	            for (var i = 0; i < temp.length - 1; i++) {
	                finalInstance = finalInstance[temp[i]];
	            }
	            var options = Selector_1.Selector.querySelectorAll(element, "option");
	            for (var j = 0; j < options.length; j++) {
	                var option = options[j];
	                if (option.selected) {
	                    var selectedItem = JSON.parse(option.getAttribute("data-item"));
	                    finalInstance[temp[temp.length - 1]] = selectedItem;
	                }
	            }
	            if (handler) {
	                handler.call(host, controllerModel.alias, element);
	            }
	        });
	        return true;
	    }
	    return false;
	}
	function checkboxCase(element, tagName, controllerModel, handler, host) {
	    var elementName = element.tagName;
	    if (elementName === "INPUT" && tagName === "value" && element.getAttribute("type") === "checkbox") {
	        EventListener_1.EventListener.addEventListener(element, 'change', function (e) {
	            var attr = element.getAttribute("uku-" + tagName);
	            attr = UkuleleUtil_1.UkuleleUtil.getFinalAttribute(attr);
	            var temp = attr.split(".");
	            var finalInstance = controllerModel.controllerInstance;
	            for (var i = 0; i < temp.length - 1; i++) {
	                finalInstance = finalInstance[temp[i]];
	            }
	            finalInstance[temp[temp.length - 1]] = element.checked;
	            if (handler) {
	                handler.call(host, controllerModel.alias, element);
	            }
	        });
	        return true;
	    }
	    return false;
	}
	function radioCase(element, tagName, controllerModel, handler, host) {
	    var elementName = element.tagName;
	    if (elementName === "INPUT" && tagName === "selected" && element.getAttribute("type") === "radio") {
	        EventListener_1.EventListener.addEventListener(element, 'change', function (e) {
	            var attr = element.getAttribute("uku-" + tagName);
	            attr = UkuleleUtil_1.UkuleleUtil.getFinalAttribute(attr);
	            var temp = attr.split(".");
	            var finalInstance = controllerModel.controllerInstance;
	            for (var i = 0; i < temp.length - 1; i++) {
	                finalInstance = finalInstance[temp[i]];
	            }
	            if (element.checked) {
	                finalInstance[temp[temp.length - 1]] = element.value;
	                if (handler) {
	                    handler.call(host, controllerModel.alias, element);
	                }
	            }
	        });
	        return true;
	    }
	    return false;
	}


/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	var EventListener = (function () {
	    function EventListener() {
	    }
	    EventListener.addEventListener = function (element, eventType, handler) {
	        if (window.hasOwnProperty('jQuery') && typeof window['jQuery'] !== undefined) {
	            return window['jQuery'](element).on(eventType, handler);
	        }
	        else {
	            return element.addEventListener(eventType, handler);
	        }
	    };
	    return EventListener;
	}());
	exports.EventListener = EventListener;


/***/ }
/******/ ])
});
;