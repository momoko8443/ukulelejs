import {ObjectUtil} from "../util/ObjectUtil";
import {Ajax} from "../extend/Ajax";
import {ControllerModel} from "../model/ControllerModel";
import {AsyncCaller} from "../util/AsyncCaller"
import {ComponentModel} from "../model/ComponentModel";
import {ComponentPoolItem} from "../model/ComponentPoolItem";
import {ComponentConfiguration} from "../model/ComponentConfiguration";
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
	private dependentScriptsCache:Object = {};
    private ajax:Ajax = new Ajax();

    getComponentsDefinition():Object{
        return this.componentsDefinition;
    }
	
	getComponentsPool():Object{
		return this.componentsPool;
	}
	
	setComponentsPool(pool):void{
		this.componentsPool = pool;
	}
	
    setComponentsDefinition(value:Object):void{
        this.componentsDefinition = value;
    }

	getComponentDefinition(tagName:string):ComponentModel{
		return this.componentsDefinition[tagName] as ComponentModel;
	}

    getControllerDefinition(instanceName:string):ControllerModel{
        return this.controllersDefinition[instanceName] as ControllerModel;
    }

	getControllersDefinition():Object{
		return this.controllersDefinition;
	}

	getComponent(tagName:string){
		return this.componentsPool[tagName];
	}

    getCopyControllers():Object{
        return this.copyControllers;
    }

    copyAllController():void{
		for (let alias in this.controllersDefinition) {
			let controllerModel = this.controllersDefinition[alias];
			let controller = controllerModel.controllerInstance;
			this.copyControllerInstance(controller, alias);
		}
	}

	copyControllerInstance(controller:Object, alias:string):void{
		let previousCtrlInst = ObjectUtil.deepClone(controller);
		delete this.copyControllers[alias];
		this.copyControllers[alias] = previousCtrlInst;
	}

    addControllerDefinition(instanceName:string, controllerInst):void{
        let controllerModel = new ControllerModel(instanceName, controllerInst);
		controllerInst._alias = instanceName;
		this.controllersDefinition[instanceName] = controllerModel;
	}
	
	getControllerInstByDomId(domId:string):Object{
		for (let alias in this.controllersDefinition) {
			let controllerModel = this.controllersDefinition[alias];
			let controller = controllerModel.controllerInstance;
			if(controller._dom && controller._dom.id === domId){
				return controller;
			}
		}
		return undefined;
	}

	
    addComponentDefinition(tag:string,templateUrl:string,preload:boolean,asyncCaller:AsyncCaller):void{
		let _this:DefinitionManager = this;
        if(!preload){
			this.componentsPool[tag] = new ComponentPoolItem(tag,templateUrl,true);
		}else{
			this.componentsPool[tag] = new ComponentPoolItem(tag,templateUrl,false);;
			asyncCaller.pushAll(dealWithComponentConfig,[tag,templateUrl]);
		}
		function dealWithComponentConfig(tag:string,template:string){
			_this.ajax.get(templateUrl,function(result){
				let componentConfig = UkuleleUtil.getComponentConfiguration(result);
				_this.analyizeComponent(tag,componentConfig,function(){
					dealWithComponentConfig.resolve(asyncCaller);
				});
			});
		}
    }

    addLazyComponentDefinition(tag:string,templateUrl:string):Promise<void>{
		return new Promise<void>((resolve ,reject) => {
			this.ajax.get(templateUrl,(result)=>{
				let componentConfig = UkuleleUtil.getComponentConfiguration(result);
				this.analyizeComponent(tag,componentConfig,()=>{
					this.componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
					//callback();
					resolve();
				});
			});
		});
	}



	getBoundAttributeValue(attr:string, ...additionalArgu):any{
		let controllerModel = this.getBoundControllerModelByName(attr);
		let controllerInst = controllerModel.controllerInstance;
		//let result = UkuleleUtil.getFinalValue(this.uku, controllerInst, attr, additionalArgu);
		let parameters:Array<any> = [this.uku,controllerInst,attr];
		parameters = parameters.concat(additionalArgu);
		let result = UkuleleUtil.getFinalValue.apply(null,parameters);
		return result;
	};


	getControllerModelByName(expression:string):ControllerModel {
		return this.getBoundControllerModelByName(expression);
	};


	getFinalValueByExpression(expression:string):any{
		let controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this.uku, controller, expression);
	};

    private getBoundControllerModelByName(attrName:string):ControllerModel{
		let instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
		let controllerModel:ControllerModel = this.controllersDefinition[instanceName];
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

    private analyizeComponent(tag:string,config:ComponentConfiguration,callback:Function):void{
		let deps:Array<string> = config.dependentScripts;
		let self:DefinitionManager = this;
		if(deps && deps.length > 0){
			let ac = new AsyncCaller();
			let tmpAMD;
			if(typeof window['define'] === 'function' && window['define'].amd){
				tmpAMD = window['define'];
				window['define'] = undefined;
			}
			for (let i = 0; i < deps.length; i++) {
				let dep = deps[i];
				ac.pushAll(loadDependentScript,[ac,dep]);
			}
			ac.exec(()=>{
				if(tmpAMD){
					window['define'] = tmpAMD;
				}
				this.buildeComponentModel(tag,config.template,config.componentControllerScript,config.stylesheet);
				callback();
			});
		}else{
			this.buildeComponentModel(tag,config.template,config.componentControllerScript,config.stylesheet);
			callback();
		}
		
		function loadDependentScript(ac:AsyncCaller,src:string):void{
			if(!self.dependentScriptsCache[src]){
				let head = document.getElementsByTagName('HEAD')[0];
				let script = document.createElement('script');
				script.type = 'text/javascript';
				script.charset = 'utf-8';
				script.async = true;
				script.src = src;
				script.onload = (e)=>{
					self.dependentScriptsCache[e.target['src']] = true;
					loadDependentScript.resolve(ac);
				};
				head.appendChild(script);
			}else{
				loadDependentScript.resolve(ac);
			}
		}
	}

	private buildeComponentModel(tag:string,template:string,script:string,style:string):void{
		let debugComment = "//# sourceURL="+tag+".js";
		try{
			let controllerClazz
			if(script){
				script += debugComment;
				controllerClazz = eval(script);
			}
			let newComp = new ComponentModel(tag, template,controllerClazz);
			this.componentsDefinition[tag] = newComp;
			if(style){
				dealWithShadowStyle(tag,style);
			}
		}catch(e){
			console.error(e);
		}

		function dealWithShadowStyle(tagName:string,stylesheet:string):void{
			let head = document.getElementsByTagName('HEAD')[0];
			let style = document.createElement('style');
			style.type = 'text/css';
			var styleArray = stylesheet.split("}");
			var newArray = [];
			styleArray.forEach((value:string,index:number)=>{
				var newValue = value.replace(/^\s*/,"");
				if(newValue){
					newArray.push(newValue);
				}
			});
			stylesheet = newArray.join("}\n" + "." + tagName + " ");
			stylesheet = "." + tagName + " " + stylesheet + "}";
			style.innerHTML = stylesheet;
			head.appendChild(style);
		}
	}
}
