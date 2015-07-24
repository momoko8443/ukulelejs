/**
 * Create a new Ukulele
 * @class
 */

function Ukulele() {
	"use strict";
	var controllersDefinition = {};
	var copyControllers = {};
	var self = this;
	/**
	 * @access a callback function when view was refreshed.
	 */
	this.refreshHandler = null;
	/**
	 * @access When using uku-repeat, parentUku to reference the Parent controller model's uku
	 */
	this.parentUku = null;
	this.init = function() {		
		manageApplication();
	};
	/**
	 * @description Register a controller model which you want to bind with view
	 * @param {string} instanceName controller's alias
	 * @param {object}  controllerInst controller's instance
	 */
	this.registerController = function(instanceName, controllerInst) {
			var controllerModel = new ControllerModel(controllerInst);
			controllersDefinition[instanceName] = controllerModel;
	};
	/**
	 * @description deal with partial html element you want to manage by UkuleleJS
	 * @param {object} $element jquery html object e.g. $("#myButton")
	 * @param {boolean} watch whether refresh automatically or not
	 */
	this.dealWithElement = function($element) {
			analyizeElement($element);
	};
	/**
	 * @description deal with the uku-include componnent which need be to lazy loaded.
	 * @param {object} $element jquery html object e.g. $("#myButton")
	 */
	this.loadIncludeElement = function($element) {
			if($element.attr("load") === "false"){
				$element.attr("load",true);
				analyizeElement($element.parent());
			}			
	};
	/**
	 * @description get the controller model's instance by alias.
	 * @param {object} expression  controller model's alias.
	 * @returns {object} controller model's instance
	 */
	this.getControllerModelByName = function(expression) {
		return getBoundControllerModelByName(expression);
	};
	/**
	 * @description refresh the view manually, e.g. you can call refresh in sync request's callback.
	 */
	this.refresh = function() {
		watchBoundAttribute();
		copyAllController();
	};
	/**
	 * @description get value by expression
	 * @param {string} expression
	 */
	this.getFinalValueByExpression = function(expression) {
		var controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(controller, expression);
	};
	
	//心跳功能来判断bound的attribute有没有在内存中被更新，从而主动刷新视图
	function watchBoundAttribute() {
		for (var alias in controllersDefinition) {
			var controllerModel = controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
				var boundAttr = controllerModel.boundAttrs[i];
				var attrName = boundAttr.attributeName;
				if (previousCtrlModel) {
					if(boundAttr.ukuTag === "selecteditem"){
						attrName = attrName.split("|")[0];
					}
					var finalValue = UkuleleUtil.getFinalValue(controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundAttr.attributeName;
						var changedBoundAttrs = controllerModel.getBoundAttrByName(attrName);
						for (var j = 0; j < changedBoundAttrs.length; j++) {
							var changedBoundAttr = changedBoundAttrs[j];
							if (changedBoundAttr.ukuTag === "repeat") {
								//1.repeat的处理，先把repeat的render逻辑写在这里，以后移到各自的class
								changedBoundAttr.renderRepeat(controller);
							} else if (changedBoundAttr.expression !== null) {
								//2. 处理expression
								changedBoundAttr.renderExpression(controller);
							} else {
								//3. 与属性attribute bind，目前理论上全属性支持
								changedBoundAttr.renderAttribute(controller);
							}
							if (self.refreshHandler) {
								self.refreshHandler.call(null);
							}
						}
					}
				}
			}
			copyControllerInstance(controller,alias);
		}
	}
	function copyAllController(){
		for (var alias in controllersDefinition) {
			var controllerModel = controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			copyControllerInstance(controller,alias);
		}
	}
	
	function copyControllerInstance(controller,alias){
		var previousCtrlModel = ObjectUtil.deepClone(controller);
		delete copyControllers[alias];
		copyControllers[alias] = previousCtrlModel;
	}
	
	
	//解析html中各个uku的tag
	function analyizeElement($element) {
		searchIncludeTag($element,function(){
			var subElements = [];
			//scan element which has uku-* tag
			var isSelfHasUkuTag = $element.fuzzyFind('uku-');
			if (isSelfHasUkuTag) {
				subElements.push(isSelfHasUkuTag);
			}
			$element.find("*").each(function() {
				var matchElement = $(this).fuzzyFind('uku-');
				if (matchElement && !UkuleleUtil.isInRepeat($(matchElement))) {
					subElements.push(matchElement);
				}
			});
			searchExpression($element);
			//解析绑定 attribute，注册event
			for (var i = 0; i < subElements.length; i++) {
				var subElement = subElements[i];
				for (var j = 0; j < subElement.attributes.length; j++) {
					var attribute = subElement.attributes[j];
					if (UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
						var tempArr = attribute.nodeName.split('-');
						tempArr.shift();					
						var attrName = tempArr.join('-');
						if (attrName !== "application") {
							if (attrName.search('on') === 0) {
								//is an event
								if (!UkuleleUtil.isRepeat($(subElement)) && !UkuleleUtil.isInRepeat($(subElement))) {
									dealWithEvent($(subElement), attrName);
								}
							} else if (attrName.search('repeat') !== -1) {
								//is an repeat
								dealWithRepeat($(subElement));
							} else {
								//is an attribute
								if (!UkuleleUtil.isRepeat($(subElement)) && !UkuleleUtil.isInRepeat($(subElement))) {
									dealWithAttribute($(subElement), attrName);
								}
							}
						}
					}
				}
			}
			if (self.refreshHandler) {
				self.refreshHandler.call(null);
			}
			copyAllController();
		});
			
		
		function searchIncludeTag($element,retFunc){
			var tags = $element.find('.uku-include');
			var index = 0; 
			if(index < tags.length){
				dealWithInclude(index);
			}else{
				retFunc();
			}
			function dealWithInclude(index){
				var $tag = $(tags[index]);
				var isLoad = $tag.attr("load");
				if(isLoad === "false"){
					index++;
					if(index < tags.length){
						dealWithInclude(index);
					}else{
						retFunc();
					}
				}else{
					var src = $tag.attr("src");
					$tag.load(src,function(){
						searchIncludeTag($tag,function(){
							index++;
							if(index < tags.length){
								dealWithInclude(index);
							}else{
								retFunc();
							}
						});										
					});
				}			
			}
		}
		
		//scan element which has expression {{}}
		function searchExpression($element) {
			if (UkuleleUtil.searchUkuExpTag($element.directText()) !== -1) {
				if (!UkuleleUtil.isRepeat($element) && !UkuleleUtil.isInRepeat($element)) {
					//normal expression
					dealWithExpression($element);
				}
			}
			$element.children().each(function() {
				searchExpression($(this));
			});
		}
		//处理绑定的expression
		function dealWithExpression(element) {
			var expression = element.directText();
			if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
				var attr = expression.slice(2, -2);
				var boundAttr = new BoundAttribute(attr, null, expression, element);
				var controllerModel = getBoundControllerModelByName(attr);
				controllerModel.addBoundAttr(boundAttr);
				boundAttr.renderExpression(controllerModel.controllerInstance);
				
			}
		}
		//处理绑定的attribute
		function dealWithAttribute(element, tagName) {
			var attr = element.attr("uku-" + tagName);
			
			var elementName = element[0].tagName;
			var alias = attr.split(".")[0];
				
			var boundAttr = new BoundAttribute(attr, tagName, null, element);
			var controllerModel = getBoundControllerModelByName(attr);
			controllerModel.addBoundAttr(boundAttr);
			boundAttr.renderAttribute(controllerModel.controllerInstance);
			if (((elementName === "INPUT" || elementName === "TEXTAREA") && tagName === "value") || (elementName === "SELECT" && tagName === "selecteditem")) {
				element.change(function(e) {
					copyControllerInstance(controllerModel.controllerInstance,alias);
					var key;
					var _attr;
					if(elementName === "SELECT" && tagName === "selecteditem"){		
						var tmpArr = attr.split("|");			
						_attr = tmpArr[0];
						key = tmpArr[1];		
					}else{
						_attr = attr;
					}
					_attr = UkuleleUtil.getFinalAttribute(_attr);
					var temp = _attr.split(".");
					var finalInstance = controllerModel.controllerInstance;
					for (var i = 0; i < temp.length - 1; i++) {
						finalInstance = finalInstance[temp[i]];
					}
					if(elementName === "SELECT" && key){						
						var selectedItem = element.find("option:selected").data("data-item");
						selectedItem = JSON.parse(selectedItem);
						finalInstance[temp[temp.length - 1]] = selectedItem;
					}else if(elementName=== "INPUT" && element.attr("type") === "checkbox"){
						finalInstance[temp[temp.length - 1]] = element.is(':checked');
					}else{
						finalInstance[temp[temp.length - 1]] = element.val();
					}
					
					watchBoundAttribute();
				});
			}
		}
		//处理 事件 event
		function dealWithEvent(element, eventName) {
			var expression = element.attr("uku-" + eventName);
			var eventNameInJQuery = eventName.substring(2);		
			var controller = getBoundControllerModelByName(expression).controllerInstance;
			var temArr = expression.split(".");
			var alias;
			if(temArr[0] === "parent"){
				alias = temArr[1];
			}else{
				alias = temArr[0];
			}
			element.bind(eventNameInJQuery, function() {			
				copyControllerInstance(controller,alias);
				getBoundAttributeValue(expression,arguments);
				watchBoundAttribute();
			});
		}
		//处理 repeat
		function dealWithRepeat(element) {
			var repeatExpression = element.attr("uku-repeat");
			var tempArr = repeatExpression.split(' in ');
			var itemName = tempArr[0];
			var attr = tempArr[1];
			var controllerModel = getBoundControllerModelByName(attr);
			var controllerInst = controllerModel.controllerInstance;
			var boundAttr = new BoundAttribute(attr, "repeat", itemName, element, self);
			controllerModel.addBoundAttr(boundAttr);
			boundAttr.renderRepeat(controllerInst);
		}
	}
	function getBoundControllerModelByName(attrName) {
		var instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
		var controllerModel = controllersDefinition[instanceName];
		if (!controllerModel) {
			var tempArr = attrName.split(".");
			var isParentScope = tempArr[0];
			if (isParentScope === "parent" && self.parentUku) {
				tempArr.shift();
				attrName = tempArr.join(".");
				return self.parentUku.getControllerModelByName(attrName);
			}
		}
		return controllerModel;
	}
	function getBoundAttributeValue(attr,additionalArgu) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var result = UkuleleUtil.getFinalValue(controllerInst,attr,additionalArgu);
		return result;
	}
	
	function manageApplication() {
		$("[uku-application]").each(function() {
			analyizeElement($(this));
		});
	}
}