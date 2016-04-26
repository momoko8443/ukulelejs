/**
 * Create a new Ukulele
 * @class
 */

function Ukulele() {
	"use strict";
	EventEmitter.call(this);

	var self = this;
	var defMgr;
	var dirtyChecker;
	//var anylyzer;
    var asyncCaller = new AsyncCaller();

	this.parentUku = null;



	this.init = function () {
		 asyncCaller.exec(function(){
			 manageApplication();
		 });
 	};

	this.handleElement = function(element) {
		analyizeElement(element,function(e){
			self.dispatchEvent({'eventType':Ukulele.HANDLE_ELEMENT_COMPLETED,'element':element});
		});
	};

	this.registerController = function (instanceName, controllerInst) {
		this._internal_getDefinitionManager().addControllerDefinition(instanceName,controllerInst);
	};

	this.getController = function(instanceName){
		return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
	};

	this.registerComponent = function (tag,templateUrl,preload){
		this._internal_getDefinitionManager().addComponentDefinition(tag,templateUrl,preload,asyncCaller);
	};

	this.getComponent = function(tagName){
		return this._internal_getDefinitionManager().getComponent(tagName);
	};

	this.refresh = function (alias,excludeElement) {
		if(!dirtyChecker){
			dirtyChecker = new DirtyChecker(this);
		}
		dirtyChecker.runDirtyChecking(alias,excludeElement);
	};

	//internal function
	this._internal_getDefinitionManager = function(){
		if(!defMgr){
			defMgr = new DefinitionManager(this);
		}
		return defMgr;
	};
	this._internal_dealWithElement = function (element) {
		analyizeElement(element);
	};

	function manageApplication() {
		var apps = Selector.querySelectorAll(document,"[uku-application]");
		if (apps.length === 1) {
			analyizeElement(apps[0], function(ele){
				self.dispatchEvent({'eventType':Ukulele.INITIALIZED,'element':ele});
			});
		} else {
			throw new Error("Only one 'uku-application' can be declared in a whole html.");
		}
	}
	function analyizeElement(element, callback){
		var anylyzer = new Analyzer(self);
		if(callback){
			(function(retFunc){
				anylyzer.addListener(Analyzer.ANALYIZE_COMPLETED, function(e){
					retFunc(e.element);
				});
			})(callback);
		}
		anylyzer.analyizeElement(element);
	}
}

Ukulele.prototype = new EventEmitter();
Ukulele.prototype.constructor = Ukulele;

//ukulele Lifecycle event
Ukulele.INITIALIZED = 'initialized';
Ukulele.REFRESH = 'refresh';
Ukulele.HANDLE_ELEMENT_COMPLETED = "handle_element_completed";
