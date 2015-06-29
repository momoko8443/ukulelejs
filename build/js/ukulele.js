/*! ukulelejs - v1.0.0 - 2015-06-29 */function Ukulele() {
	"use strict";
	this.controllersDefinition = {};
	this.viewControllerArray = [];
	this.refreshHandler = undefined;
	this.parentUku = undefined;
	this.getControllerModelByName = function(expression) {
		return getBoundControllerModelByName(expression);
	};
	var copyControllers = {};
	var self = this;
	var watchTimer;
	//心跳功能来判断bound的attribute有没有在内存中被更新，从而主动刷新视图
	function watchBoundAttribute() {
		for (var alias in self.controllersDefinition) {
			var controllerModel = self.controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
				var boundAttr = controllerModel.boundAttrs[i];
				var attrName = boundAttr.attributeName;
				if (previousCtrlModel) {
					var finalValue = UkuleleUtil.getFinalValue(controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
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
			previousCtrlModel = ObjectUtil.deepClone(controller);
			delete copyControllers[alias];
			copyControllers[alias] = previousCtrlModel;
		}
		watchTimer = setTimeout(watchBoundAttribute, 500);
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
						var attrName = attribute.nodeName.split('-')[1];
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
				var result = getBoundAttributeValue(attr);
				element.directText(result);
				var boundAttr = new BoundAttribute(attr, null, expression, element);
				var controllerModel = getBoundControllerModelByName(attr);
				controllerModel.addBoundAttr(boundAttr);
			}
		}
		//处理绑定的attribute
		function dealWithAttribute(element, tagName) {
			var attr = element.attr("uku-" + tagName);
			var result = getBoundAttributeValue(attr);
			element.attr(tagName, result);
			var boundAttr = new BoundAttribute(attr, tagName, null, element);
			var controllerModel = getBoundControllerModelByName(attr);
			controllerModel.addBoundAttr(boundAttr);
			var elementName = element[0].tagName;
			if ((elementName === "INPUT" || elementName === "SELECT" || elementName === "TEXTAREA") && tagName === "value") {
				element.change(function(e) {
					var _attr = UkuleleUtil.getFinalAttribute(attr);
					var temp = _attr.split(".");
					var finalInstance = controllerModel.controllerInstance;
					for (var i = 0; i < temp.length - 1; i++) {
						finalInstance = finalInstance[temp[i]];
					}
					finalInstance[temp[temp.length - 1]] = element.val();
				});
			}
		}
		//处理 事件 event
		function dealWithEvent(element, eventName) {
			var expression = element.attr("uku-" + eventName);
			var eventNameInJQuery = eventName.substring(2);
			element.bind(eventNameInJQuery, function() {
				getBoundAttributeValue(expression);
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
		var controllerModel = self.controllersDefinition[instanceName];
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
	function getBoundAttributeValue(attr) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var index = UkuleleUtil.searchUkuFuncArg(attr);
		var result;
		if (index === -1) {
			//is a attribute
			result = UkuleleUtil.getFinalValue(controllerInst, attr);
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
				result = finalValue.apply(finalValueObject.parent, new_arguments.concat(arguments));
			} else {
				result = finalValue.apply(finalValueObject.parent, arguments);
			}
		}
		return result;
	}
	return {
		init : function() {
			$(document).ready(function() {
				manageApplication();
				watchBoundAttribute();
			});
		},
		registerController : function(instanceName, controllerInst) {
			self.viewControllerArray.push({
				"view" : $(this),
				"controller" : controllerInst
			});
			var controllerModel = new ControllerModel(controllerInst);
			self.controllersDefinition[instanceName] = controllerModel;
		},
		dealWithElement : function($element, watch) {
			analyizeElement($element);
			if (watch) {
				watchBoundAttribute();
			}
		},
		refreshHandler : function(handler) {
			self.refreshHandler = handler;
		},
		setParentUku : function(parentUku) {
			self.parentUku = parentUku;
		}
	};
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
    var finalValue = UkuleleUtil.getFinalValue(controller,this.attributeName);
    if(this.ukuTag === "value"){
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
        ukulele.setParentUku(this.parentUku);
        ukulele.registerController(this.expression, item);
        ukulele.dealWithElement(itemRender, false);
        
    }
    for(var n=0;n<this.nextSiblings.length;n++){
        this.parentElement.append(this.nextSiblings[n]);
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
    return UkuleleUtil.getAttributeFinalValueAndParent(object,attrName).value;
};

UkuleleUtil.getAttributeFinalValueAndParent = function(object,attrName){
    var finalValue = object;
    var parentValue;
    attrName = UkuleleUtil.getFinalAttribute(attrName);
    var temp = attrName.split(".");
    if(finalValue){
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
            new_arguments.push(temp);
        }
        finalValue = finalValue.apply(finalValueObject.parent,new_arguments);
        return finalValue;
    }
};
