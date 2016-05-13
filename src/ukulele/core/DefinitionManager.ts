import {ObjectUtil} from "../util/ObjectUtil";
import {Ajax} from "../extend/Ajax";
import {ControllerModel} from "../model/ControllerModel";
import {AsyncCaller} from "../util/AsyncCaller"
import {ComponentModel} from "../model/ComponentModel";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {IUkulele} from "./IUkulele";
export class DefinitionManager{
	private uku:IUkulele;
	constructor(_uku:IUkulele){
		this.uku = _uku;
	}
    private controllersDefinition:Object = {};
	private componentsDefinition:Object = {};
	private componentsPool:Object = {};
	private copyControllers:Object = {};
    private ajax:Ajax = new Ajax();
	//let asyncCaller = new AsyncCaller();

    getComponentsDefinition(){
        return this.componentsDefinition;
    };

    setComponentsDefinition(value){
        this.componentsDefinition = value;
    };

	getComponentDefinition(tagName){
		return this.componentsDefinition[tagName];
	};

    getControllerDefinition(instanceName){
        return this.controllersDefinition[instanceName];
    };

	getControllersDefinition(){
		return this.controllersDefinition;
	};

	getComponent(tagName){
		return this.componentsPool[tagName];
	};

    getCopyControllers(){
        return this.copyControllers;
    };

    copyAllController() {
		for (let alias in this.controllersDefinition) {
			let controllerModel = this.controllersDefinition[alias];
			let controller = controllerModel.controllerInstance;
			this.copyControllerInstance(controller, alias);
		}
	};

	copyControllerInstance(controller, alias) {
		let previousCtrlModel = ObjectUtil.deepClone(controller);
		delete this.copyControllers[alias];
		this.copyControllers[alias] = previousCtrlModel;
	};

    addControllerDefinition(instanceName, controllerInst){
        let controllerModel = new ControllerModel(instanceName, controllerInst);
		controllerInst._alias = instanceName;
		this.controllersDefinition[instanceName] = controllerModel;
    };

    addComponentDefinition(tag,templateUrl,preload,asyncCaller){
        if(!preload){
			this.componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':true};
		}else{
			this.componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
			asyncCaller.pushAll(dealWithComponentConfig,[tag,templateUrl]);
		}
		function dealWithComponentConfig(tag,template){
			this.ajax.get(templateUrl,function(result){
				let componentConfig = UkuleleUtil.getComponentConfiguration(result);
				this.analyizeComponent(tag,componentConfig,function(){
					dealWithComponentConfig.resolve(asyncCaller);
				});
			});
		}
    };

    addLazyComponentDefinition(tag,templateUrl,callback){
		this.ajax.get(templateUrl,function(result){
			let componentConfig = UkuleleUtil.getComponentConfiguration(result);
			this.analyizeComponent(tag,componentConfig,function(){
				this.componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
				callback();
			});
		});
	};



	getBoundAttributeValue(attr, additionalArgu) {
		let controllerModel = this.getBoundControllerModelByName(attr);
		let controllerInst = controllerModel.controllerInstance;
		let result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
		return result;
	};


	getControllerModelByName(expression) {
		return this.getBoundControllerModelByName(expression);
	};


	getFinalValueByExpression(expression) {
		let controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this, controller, expression);
	};

    private getBoundControllerModelByName(attrName) {
		let instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
		let controllerModel = this.controllersDefinition[instanceName];
		if (!controllerModel) {
			let tempArr = attrName.split(".");
			let isParentScope = tempArr[0];
			if (isParentScope === "parent" && this.uku.parentUku) {
				tempArr.shift();
				attrName = tempArr.join(".");
				return this.uku.parentUku._internal_getDefinitionManager().getControllerModelByName(attrName);
			}
		}
		return controllerModel;
	}

    private analyizeComponent(tag,config,callback){
		let deps = config.dependentScripts;
		if(deps && deps.length > 0){
			let ac = new AsyncCaller();
			let tmpAMD;
			if(typeof window['define'] === 'function' && window['define'].amd){
				tmpAMD = window['define'];
				window['define'] = undefined;
			}
			for (let i = 0; i < deps.length; i++) {
				let dep = deps[i];
				ac.pushAll(this.loadDependentScript,[ac,dep]);
			}
			ac.exec(function(){
				if(tmpAMD){
					window['define'] = tmpAMD;
				}
				this.buildeComponentModel(tag,config.template,config.componentControllerScript);
				callback();
			});
		}else{
			this.buildeComponentModel(tag,config.template,config.componentControllerScript);
			callback();
		}
	}
	private buildeComponentModel(tag,template,script){
		let debugComment = "//# sourceURL="+tag+".js";
		script += debugComment;
		try{
			let controllerClazz = eval(script);
			let newComp = new ComponentModel(tag, template,controllerClazz);
			this.componentsDefinition[tag] = newComp;
		}catch(e){
			console.error(e);
		}
	}

	private dependentScriptsCache:Object = {};
	private loadDependentScript(ac,src){
		if(!this.dependentScriptsCache[src]){
			let head = document.getElementsByTagName('HEAD')[0];
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.async = true;
			script.src = src;
			script.onload = function(e){
				this.dependentScriptsCache[e.target['src']] = true;
				this.loadDependentScript.resolve(ac);
			};
			head.appendChild(script);
		}else{
			this.loadDependentScript.resolve(ac);
		}
	}
}
