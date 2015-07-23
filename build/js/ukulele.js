/*! ukulelejs - v1.0.0 - 2015-07-21 */function Ukulele() {
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
	function getBoundAttributeValue(attr,argu) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var index = UkuleleUtil.searchUkuFuncArg(attr);
		var result;
		if (index === -1) {
			//is a attribute
			if(attr.split(".").length === 1){
				result = controllerInst;
			}else{
				result = UkuleleUtil.getFinalValue(controllerInst, attr);
			}		
		} else {
			//is a function
			var functionName = attr.substring(0, index);
			var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(controllerInst, functionName);
			var finalValue = finalValueObject.value;
			if(finalValue === undefined){
	        	return finalValue; 
	        }
			var _arguments = attr.substring(index + 1, attr.length - 1);
			var withoutArgument = false;
			if (_arguments === "") {
				withoutArgument = true;
			}
			_arguments = _arguments.split(",");
			if (!withoutArgument) {
				var new_arguments = [];
				for (var i = 0; i < _arguments.length; i++) {
					var argument = _arguments[i];
					var agrumentInst = getBoundControllerModelByName(argument).controllerInstance;
					var temp;
					if (argument.split(".").length === 1) {
						temp = agrumentInst;
					} else {
						temp = UkuleleUtil.getFinalValue(agrumentInst, argument);
					}
					new_arguments.push(temp);
				}
				result = finalValue.apply(finalValueObject.parent, new_arguments.concat(argu));
			} else {
				result = finalValue.apply(finalValueObject.parent, argu);
			}
		}
		return result;
	}
	
	function manageApplication() {
		$("[uku-application]").each(function() {
			analyizeElement($(this));
		});
	}
}
(function ($) {
    $.fn.directText = function (text) {
        var o = "";
        this.each(function () {
            var nodes = this.childNodes;
            for (var i = 0; i <= nodes.length - 1; i++) {
                var node = nodes[i];
                if (node.nodeType === 3) {
                    
                    if (text || text ==="" || text === 0) {
                        node.nodeValue = text;
                        return;
                    } else {
                        o += node.nodeValue;
                    }
                }
            }
        });
        return $.trim(o);
    };

    $.fn.fuzzyFind = function (text) {
        if (this.length === 1) {
            var element = this[0];
            if (element && element.attributes) {
                for (var i = 0; i < element.attributes.length; i++) {
                    var attr = element.attributes[i];
                    if (attr.nodeName.search(text) > -1) {
                        return element;
                    }
                }
            }
        }
        return null;
    };
})(jQuery);
function BoundAttribute(attrName, ukuTag, expression, element,parentUku) {
    "use strict";
    this.attributeName = attrName;
    this.ukuTag = ukuTag;
    this.expression = expression;
    this.element = element;
    this.renderTemplate = undefined;
    this.parentElement = undefined;
    this.parentUku = undefined;
    if (ukuTag === "repeat") {
        this.renderTemplate = element.prop("outerHTML");
        this.parentElement = element.parent();
        this.parentUku = parentUku;
    }
    this.previousSiblings = undefined;
    this.nextSiblings = undefined;
}
BoundAttribute.prototype.renderAttribute = function (controller) {
    var attr = this.attributeName;
    var key;
    var elementName = this.element[0].tagName;
    if(this.ukuTag === "selecteditem" && elementName === "SELECT"){
        var tempArr = this.attributeName.split("|");
        attr = tempArr[0];
        key = tempArr[1];
    }
    var finalValue = UkuleleUtil.getFinalValue(controller,attr);
    if(this.ukuTag.search('data-item') !== -1){
    	finalValue = JSON.stringify(finalValue);
        this.element.data('data-item',finalValue);
    }else if(this.ukuTag === "selecteditem" && elementName === "SELECT"){
    	var value;
    	if(key){
    		value = finalValue[key];
    	}else{
    		value = finalValue;
    	}     
        this.element.val(value);
    }else if(this.element.attr("type") === "checkbox"){
		this.element.attr("checked",finalValue);
	}
	else if(this.ukuTag === "value"){
        this.element.val(finalValue);
    }else{
        this.element.attr(this.ukuTag, finalValue);
    }    
};

BoundAttribute.prototype.renderExpression = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(controller,this.attributeName);
    this.element.directText(finalValue);
};

BoundAttribute.prototype.renderRepeat = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(controller,this.attributeName);
    if(!finalValue){
        return;
    }
    var index = $(this.element).index();
    if(index !== -1){
        this.previousSiblings = $(this.element).prevAll();
        this.nextSiblings = $(this.element).nextAll();
    }
    this.parentElement.children().remove();
    for(var p=0;p<this.previousSiblings.length;p++){
        this.parentElement.append(this.previousSiblings[p]);
    }
    for (var i in finalValue) {
        var item = finalValue[i];
        var itemRender = $(this.renderTemplate).removeAttr("uku-repeat");
        this.parentElement.append(itemRender);

        var ukulele = new Ukulele();
        ukulele.parentUku = this.parentUku;
        ukulele.registerController(this.expression, item);
        ukulele.dealWithElement(itemRender);     
    }
    for(var n=0;n<this.nextSiblings.length;n++){
        this.parentElement.append(this.nextSiblings[n]);
    }
    if(this.element[0].tagName === "OPTION"){
    	var expression = this.parentElement.attr("uku-selecteditem");
    	var tempArr = expression.split("|");
		expression = tempArr[0];
		key = tempArr[1];
    	var value = this.parentUku.getFinalValueByExpression(expression);
    	if(key){
    		this.parentElement.val(value[key]);
    	}else{
    		this.parentElement.val(value);
    	}
    	
    }
};
function ControllerModel(ctrlInst) {
    "use strict";
    this.controllerInstance = ctrlInst;
    this.boundAttrs = [];
    //以后重构到prototype中去
    this.addBoundAttr = function (boundAttr) {
        this.boundAttrs.push(boundAttr);
    };
    //以后重构到prototype中去
    this.getBoundAttrByName = function (name) {
        var boundAttrs = [];
        for (var i = 0; i < this.boundAttrs.length; i++) {
            var boundAttr = this.boundAttrs[i];
            if (boundAttr.attributeName === name) {
                boundAttrs.push(boundAttr);
            }
        }
        return boundAttrs;
    };
}
function ObjectUtil() {
    'use strict';
}

ObjectUtil.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
ObjectUtil.getType = function (obj) {
    var type = typeof (obj);
    if (type === "object") {
        if (ObjectUtil.isArray(obj)) {
            return "array";
        } else {
            return type;
        }
    } else {
        return type;
    }
};


//对象比较
ObjectUtil.compare = function (objA, objB) {
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
};
//深度克隆
ObjectUtil.deepClone = function(obj){

	var o,i,j,k;
	if(typeof(obj)!=="object" || obj===null){
        return obj;
    }
	if(obj instanceof(Array))
	{
		o=[];
		i=0;j=obj.length;
		for(;i<j;i++)
		{
			if(typeof(obj[i])==="object" && obj[i]!==null)
			{
				o[i]=arguments.callee(obj[i]);
			}
			else
			{
				o[i]=obj[i];
			}
		}
	}
	else
	{
		o={};
		for(i in obj)
		{
			if(typeof(obj[i])==="object" && obj[i]!==null)
			{
				o[i]=arguments.callee(obj[i]);
			}
			else
			{
				o[i]=obj[i];
			}
		}
	}
 
	return o;
};
function UkuleleUtil() {
	'use strict';
}

UkuleleUtil.getFinalAttribute = function(expression) {
	var temp = expression.split(".");
	var isParent = temp.shift();
	if(isParent === "parent"){		
		return UkuleleUtil.getFinalAttribute(temp.join("."));
	}
	return temp.join(".");
};

UkuleleUtil.searchUkuAttrTag = function(htmlString) {
	var re = /^uku\-.*/;
	var index = htmlString.search(re);
	return index;
};

UkuleleUtil.searchUkuExpTag = function(expression) {
	var re = /^\{\{.*\}\}$/;
	var index = expression.search(re);
	return index;
};

UkuleleUtil.searchUkuFuncArg = function(htmlString) {
	var re = /\(.*\)$/;
	var index = htmlString.search(re);
	return index;
};

UkuleleUtil.isRepeat = function($element) {
	if ($element.attr("uku-repeat")) {
		return true;
	}
	return false;
};

UkuleleUtil.isInRepeat = function($element) {
	var parents = $element.parents();
	for (var i = 0; i < parents.length; i++) {
		var parent = parents[i];
		var b = $(parent).attr("uku-repeat");
		if (b) {
			return true;
		}
	}
	return false;
};

UkuleleUtil.getBoundModelInstantName = function(expression) {
	var controlInstName = expression.split('.')[0];
	if (controlInstName) {
		return controlInstName;
	}
	return null;
};

UkuleleUtil.getAttributeFinalValue = function(object,attrName){
	var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object,attrName);
	var value = valueObject.value;
    return value;
};

UkuleleUtil.getAttributeFinalValueAndParent = function(object,attrName){
    var finalValue = object;
    var parentValue;
    attrName = UkuleleUtil.getFinalAttribute(attrName);
    var temp = attrName.split(".");
    if(attrName !== "" && finalValue){
        for (var i = 0; i < temp.length; i++) {
            var property = temp[i]; 
            parentValue = finalValue;
            finalValue = finalValue[property];
            if(finalValue === undefined || finalValue === null){
                break;
            }
        }
    }
    return {"value":finalValue,"parent":parentValue};
};

UkuleleUtil.getFinalValue = function(object,attrName){
    var re = /\(.*\)/;
    var index = attrName.search(re);
    if(index === -1){
        //is attribute
       return UkuleleUtil.getAttributeFinalValue(object,attrName);
    }else{
        //is function
        var functionName = attrName.substring(0,index);
        var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object,functionName);
        var finalValue = finalValueObject.value;
        if(finalValue === undefined){
        	return finalValue; 
        }
        var _arguments = attrName.substring(index+1,attrName.length-1);
        _arguments = _arguments.split(",");
        var new_arguments = [];
        for(var i=0;i<_arguments.length;i++){
            var argument = _arguments[i];
            var temp = UkuleleUtil.getFinalValue(object,argument);
            if(temp !== object){
                new_arguments.push(temp);
            }else{
               var re2 = /\'.*\'/;
               var index2 = argument.search(re2);
                if(index2 !== -1){
                    argument = argument.substring(1, argument.length - 1);
                }else{
                    var re3 = /\".*\"/;
                    var index3 = argument.search(re3);
                    if(index3 !== -1){
                        argument = argument.substring(1, argument.length - 1);
                    }
                }
                new_arguments.push(argument);
            }
            
        }
        finalValue = finalValue.apply(finalValueObject.parent,new_arguments);
        return finalValue;
    }
};
