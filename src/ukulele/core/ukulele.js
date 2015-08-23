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
	this.dealWithElement = function(element) {
			analyizeElement(element);
	};
	/**
	 * @description deal with the uku-include componnent which need be to lazy loaded.
	 * @param {object} element dom
	 */
	this.loadIncludeElement = function(element) {
			if(element.getAttribute("load") === "false"){
				element.setAttribute("load",true);
				analyizeElement(element.parentNode);
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
		return UkuleleUtil.getFinalValue(this,controller, expression);
	};
	
	//脏检测
	function watchBoundAttribute() {
		for (var alias in controllersDefinition) {
			var controllerModel = controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
				var boundAttr = controllerModel.boundAttrs[i];
				var attrName = boundAttr.attributeName;
				if (previousCtrlModel) {
					if(boundAttr.ukuTag === "selected"){
						attrName = attrName.split("|")[0];
					}
					var finalValue = UkuleleUtil.getFinalValue(self,controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(self,previousCtrlModel, attrName);
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
	function analyizeElement(element) {
        element.style.display = "none";
		searchIncludeTag(element,function(){
			var subElements = [];
			//scan element which has uku-* tag
			var isSelfHasUkuTag = Selector.fuzzyFind(element,'uku-');
			if (isSelfHasUkuTag) {
				subElements.push(isSelfHasUkuTag);
			}
            var allChildren = element.querySelectorAll("*");
            for(var i=0;i<allChildren.length;i++){
                var child = allChildren[i];
                var matchElement = Selector.fuzzyFind(child,'uku-');
                if (matchElement && !UkuleleUtil.isInRepeat(matchElement)) {
					subElements.push(matchElement);
				}
            }
			searchExpression(element);
			//解析绑定 attribute，注册event
			for (var n = 0; n < subElements.length; n++) {
				var subElement = subElements[n];
				for (var j = 0; j < subElement.attributes.length; j++) {
					var attribute = subElement.attributes[j];
					if (UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
						var tempArr = attribute.nodeName.split('-');
						tempArr.shift();					
						var attrName = tempArr.join('-');
						if (attrName !== "application") {
							if (attrName.search('on') === 0) {
								//is an event
								if (!UkuleleUtil.isRepeat(subElement) && !UkuleleUtil.isInRepeat(subElement)) {
									dealWithEvent(subElement, attrName);
								}
							} else if (attrName.search('repeat') !== -1) {
								//is an repeat
								dealWithRepeat(subElement);
							} else {
								//is an attribute
								if (!UkuleleUtil.isRepeat(subElement) && !UkuleleUtil.isInRepeat(subElement)) {
									dealWithAttribute(subElement, attrName);
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
            element.style.display = "block";
		});
			
		
		function searchIncludeTag(element,retFunc){
			var tags = element.querySelectorAll('.uku-include');
			var index = 0; 
			if(index < tags.length){
				dealWithInclude(index);
			}else{
				retFunc();
			}
			function dealWithInclude(index){
				var tag = tags[index];
				var isLoad = tag.getAttribute("load");
				if(isLoad === "false"){
					index++;
					if(index < tags.length){
						dealWithInclude(index);
					}else{
						retFunc();
					}
				}else{
					var src = tag.getAttribute("src");
                    var replace = tag.getAttribute("replace");
                    var replaceController = tag.getAttribute("replace-controller");
                    var ajax = new Ajax();
                    if(replace && replace === "true"){
                        ajax.get(src,function(html){
                            if(replaceController){
                                html = doReplace(html,replaceController);
                            }
                            tag.insertAdjacentHTML('beforeBegin',html);
                            tag.parentNode.removeChild(tag);
                            //tag.replaceWith(html);
                            searchIncludeTag(tag,function(){
                                index++;
                                if(index < tags.length){
                                    dealWithInclude(index);
                                }else{
                                    retFunc();
                                }
                            });	
                        });   
                    }else{
                        ajax.get(src,function(html){
                            if(replaceController){
                                html = doReplace(html,replaceController);
                            }
                            tag.insertAdjacentHTML('afterBegin',html);
                            tag.classList.remove('uku-include');
                            searchIncludeTag(tag,function(){
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
                function doReplace(html,replaceController){
                    var tempArr = replaceController.split("|");
                    if(tempArr && tempArr.length === 2){
                        var oldCtrl = tempArr[0];
                        var newCtrl = tempArr[1];
                        html = html.replace(new RegExp(oldCtrl,"gm"),newCtrl);
                        return html;
                    }else{
                        return html;   
                    }
                }
			}
		}
		
		//scan element which has expression {{}}
		function searchExpression(element) {
			if (UkuleleUtil.searchUkuExpTag(Selector.directText(element)) !== -1) {
				if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
					//normal expression
					dealWithExpression(element);
				}
			}
            for(var i=0;i<element.children.length;i++){
                searchExpression(element.children[i]);
            }
			/*$element.children().each(function() {
				searchExpression($(this));
			});*/
		}
		//处理绑定的expression
		function dealWithExpression(element) {
			var expression = Selector.directText(element);
			if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
				var attr = expression.slice(2, -2);
				var controllerModel = getBoundControllerModelByName(attr);
				if(controllerModel){
					var boundAttr = new BoundAttribute(attr, null, expression, element,self);
					controllerModel.addBoundAttr(boundAttr);
					boundAttr.renderExpression(controllerModel.controllerInstance);
				}
			}
		}
		//处理绑定的attribute
		function dealWithAttribute(element, tagName) {
			var attr = element.getAttribute("uku-" + tagName);
			
			var elementName = element.tagName;
			var alias = attr.split(".")[0];		
			var controllerModel = getBoundControllerModelByName(attr);
			if(controllerModel){
				var boundAttr = new BoundAttribute(attr, tagName, null, element,self);
				controllerModel.addBoundAttr(boundAttr);
				boundAttr.renderAttribute(controllerModel.controllerInstance);
				if (((elementName === "INPUT" || elementName === "TEXTAREA") && tagName === "value") || (elementName === "SELECT" && tagName === "selected") || (elementName === "INPUT" && tagName === "selected")) {
					element.addEventListener('change',function(e) {
						copyControllerInstance(controllerModel.controllerInstance,alias);
						var key;
						var _attr;
						if(elementName === "SELECT" && tagName === "selected"){		
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
                            var options = element.querySelectorAll("option");
                            for(var j=0;j<options.length;j++){
                                var option = options[j];
                                if(option.selected){
                                    var selectedItem = JSON.parse(option.getAttribute("data-item"));
                                    finalInstance[temp[temp.length - 1]] = selectedItem;
                                }
                            }
						}else if(elementName === "INPUT" && element.getAttribute("type") === "checkbox"){
							finalInstance[temp[temp.length - 1]] = element.checked;
						}else if(elementName === "INPUT" && element.getAttribute("type") === "radio"){
                            if(element.checked){
                                finalInstance[temp[temp.length - 1]] = element.value;
                            }   
                        }
                        else{
							finalInstance[temp[temp.length - 1]] = element.value;
						}
						
						watchBoundAttribute();
					});
				}
			}
			
		}
		//处理 事件 event
		function dealWithEvent(element, eventName) {
			var expression = element.getAttribute("uku-" + eventName);
			var eventNameInListener = eventName.substring(2);	
			var controllerModel = getBoundControllerModelByName(expression);	
			if(controllerModel){
				var controller = controllerModel.controllerInstance;
				var temArr = expression.split(".");
				var alias;
				if(temArr[0] === "parent"){
					alias = temArr[1];
				}else{
					alias = temArr[0];
				}
				element.addEventListener(eventNameInListener, function() {			
					copyControllerInstance(controller,alias);
					getBoundAttributeValue(expression,arguments);
					watchBoundAttribute();
				});
                //事件绑定性能优化，有待测试
                /*element.parent().on(eventNameInJQuery, function(e) {
                    if(e.target === element[0]){
                        copyControllerInstance(controller,alias);
				        getBoundAttributeValue(expression,arguments);
				        watchBoundAttribute();
                    }	
				});*/
			}	
		}
		//处理 repeat
		function dealWithRepeat(element) {
			var repeatExpression = element.getAttribute("uku-repeat");
			var tempArr = repeatExpression.split(' in ');
			var itemName = tempArr[0];
			var attr = tempArr[1];
			var controllerModel = getBoundControllerModelByName(attr);
			if(controllerModel){
				var controllerInst = controllerModel.controllerInstance;
				var boundAttr = new BoundAttribute(attr, "repeat", itemName, element, self);
				controllerModel.addBoundAttr(boundAttr);
				boundAttr.renderRepeat(controllerInst);
			}		
		}
	}
	
	//根据attrName 确定对应的ControllerModel ，比如  parent.mgr.xxx.yyy来找到以mgr为别名的ControllerModel
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
		var result = UkuleleUtil.getFinalValue(self,controllerInst,attr,additionalArgu);
		return result;
	}
	
	function manageApplication() {
        var appsDom = document.querySelectorAll("[uku-application]");
        for(var i=0;i<appsDom.length;i++){
            analyizeElement(appsDom[i]);
        }
		/*$("[uku-application]").each(function() {
			analyizeElement($(this));
		});*/
	}
}