function DefinitionManager(uku){
    var controllersDefinition = {};
	var componentsDefinition = {};
	var componentsPool = {};
	var copyControllers = {};
    var ajax = new Ajax();
	//var asyncCaller = new AsyncCaller();

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
		for (var alias in controllersDefinition) {
			var controllerModel = controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			this.copyControllerInstance(controller, alias);
		}
	};

	this.copyControllerInstance = function(controller, alias) {
		var previousCtrlModel = ObjectUtil.deepClone(controller);
		delete copyControllers[alias];
		copyControllers[alias] = previousCtrlModel;
	};

    this.addControllerDefinition = function(instanceName, controllerInst){
        var controllerModel = new ControllerModel(instanceName, controllerInst);
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
				var componentConfig = UkuleleUtil.getComponentConfiguration(result);
				analyizeComponent(tag,componentConfig,function(){
					dealWithComponentConfig.resolve(asyncCaller);
				});
			});
		}
    };

    this.addLazyComponentDefinition = function(tag,templateUrl,callback){
		ajax.get(templateUrl,function(result){
			var componentConfig = UkuleleUtil.getComponentConfiguration(result);
			analyizeComponent(tag,componentConfig,function(){
				componentsPool[tag] = {'tagName':tag,'templateUrl':templateUrl,'lazy':false};
				callback();
			});
		});
	};



	this.getBoundAttributeValue = function(attr, additionalArgu) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
		return result;
	};


	this.getControllerModelByName = function (expression) {
		return getBoundControllerModelByName(expression);
	};


	this.getFinalValueByExpression = function (expression) {
		var controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this, controller, expression);
	};

    function getBoundControllerModelByName(attrName) {
		var instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
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

    function analyizeComponent(tag,config,callback){
		var deps = config.dependentScripts;
		if(deps && deps.length > 0){
			var ac = new AsyncCaller();
			var tmpAMD;
			if(typeof define === 'function' && define.amd){
				tmpAMD = define;
				define = undefined;
			}
			for (var i = 0; i < deps.length; i++) {
				var dep = deps[i];
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
		var debugComment = "//# sourceURL="+tag+".js";
		script += debugComment;
		try{
			var controllerClazz = eval(script);
			var newComp = new ComponentModel(tag, template,controllerClazz);
			componentsDefinition[tag] = newComp;
		}catch(e){
			console.error(e);
		}
	}

	var dependentScriptsCache = {};
	function loadDependentScript(ac,src){
		if(!dependentScriptsCache[src]){
			var head = document.getElementsByTagName('HEAD')[0];
			var script = document.createElement('script');
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
