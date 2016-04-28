import {ObjectUtil} from "../util/ObjectUtil";
import {Ajax} from "../extend/Ajax";
import {ControllerModel} from "../model/ControllerModel";
import {AsyncCaller} from "../util/AsyncCaller";
import {ComponentModel} from "../model/ComponentModel";
import {UkuleleUtil} from "../util/UkuleleUtil";
export function DefinitionManager(uku){
    let controllersDefinition = {};
	let componentsDefinition = {};
	let componentsPool = {};
	let copyControllers = {};
    let ajax = new Ajax();
	//let asyncCaller = new AsyncCaller();

    this.getComponentsDefinition = function(){
        return componentsDefinition;
    };

    this.setComponentsDefinition = function(value){
        componentsDefinition = value;
    };

	this.getComponentDefinition = function(tagName){
		return componentsDefinition[tagName];
	};

    this.getControllerDefinition = function(instanceName){
        return controllersDefinition[instanceName];
    };

	this.getControllersDefinition = function(){
		return controllersDefinition;
	};

	this.getComponent = function(tagName){
		return componentsPool[tagName];
	};

    this.getCopyControllers = function(){
        return copyControllers;
    };

    this.copyAllController = function() {
		for (let alias in controllersDefinition) {
			let controllerModel = controllersDefinition[alias];
			let controller = controllerModel.controllerInstance;
			this.copyControllerInstance(controller, alias);
		}
	};

	this.copyControllerInstance = function(controller, alias) {
		let previousCtrlModel = ObjectUtil.deepClone(controller);
		delete copyControllers[alias];
		copyControllers[alias] = previousCtrlModel;
	};

    this.addControllerDefinition = function(instanceName, controllerInst){
        let controllerModel = new ControllerModel(instanceName, controllerInst);
		controllerInst._alias = instanceName;
		controllersDefinition[instanceName] = controllerModel;
    };

    this.addComponentDefinition = function(tag,templateUrl,preload,asyncCaller){
        if(!preload){
			componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':true};
		}else{
			componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
			asyncCaller.pushAll(dealWithComponentConfig,[tag,templateUrl]);
		}
		function dealWithComponentConfig(tag,template){
			ajax.get(templateUrl,function(result){
				let componentConfig = UkuleleUtil.getComponentConfiguration(result);
				analyizeComponent(tag,componentConfig,function(){
					dealWithComponentConfig.resolve(asyncCaller);
				});
			});
		}
    };

    this.addLazyComponentDefinition = function(tag,templateUrl,callback){
		ajax.get(templateUrl,function(result){
			let componentConfig = UkuleleUtil.getComponentConfiguration(result);
			analyizeComponent(tag,componentConfig,function(){
				componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
				callback();
			});
		});
	};



	this.getBoundAttributeValue = function(attr, additionalArgu) {
		let controllerModel = getBoundControllerModelByName(attr);
		let controllerInst = controllerModel.controllerInstance;
		let result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
		return result;
	};


	this.getControllerModelByName = function (expression) {
		return getBoundControllerModelByName(expression);
	};


	this.getFinalValueByExpression = function (expression) {
		let controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this, controller, expression);
	};

    function getBoundControllerModelByName(attrName) {
		let instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
		let controllerModel = controllersDefinition[instanceName];
		if (!controllerModel) {
			let tempArr = attrName.split(".");
			let isParentScope = tempArr[0];
			if (isParentScope === "parent" && self.parentUku) {
				tempArr.shift();
				attrName = tempArr.join(".");
				return self.parentUku._internal_getDefinitionManager().getControllerModelByName(attrName);
			}
		}
		return controllerModel;
	}

    function analyizeComponent(tag,config,callback){
		let deps = config.dependentScripts;
		if(deps && deps.length > 0){
			let ac = new AsyncCaller();
			let tmpAMD;
			if(typeof define === 'function' && define.amd){
				tmpAMD = define;
				define = undefined;
			}
			for (let i = 0; i < deps.length; i++) {
				let dep = deps[i];
				ac.pushAll(loadDependentScript,[ac,dep]);
			}
			ac.exec(function(){
				if(tmpAMD){
					define = tmpAMD;
				}
				buildeComponentModel(tag,config.template,config.componentControllerScript);
				callback();
			});
		}else{
			buildeComponentModel(tag,config.template,config.componentControllerScript);
			callback();
		}
	}
	function buildeComponentModel(tag,template,script){
		let debugComment = "//# sourceURL="+tag+".js";
		script += debugComment;
		try{
			let controllerClazz = eval(script);
			let newComp = new ComponentModel(tag, template,controllerClazz);
			componentsDefinition[tag] = newComp;
		}catch(e){
			console.error(e);
		}
	}

	let dependentScriptsCache = {};
	function loadDependentScript(ac,src){
		if(!dependentScriptsCache[src]){
			let head = document.getElementsByTagName('HEAD')[0];
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.async = true;
			script.src = src;
			script.onload = function(e){
				dependentScriptsCache[e.target.src] = true;
				loadDependentScript.resolve(ac);
			};
			head.appendChild(script);
		}else{
			loadDependentScript.resolve(ac);
		}
	}
}
