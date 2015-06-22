/*! ukulelejs2 - v1.0.0 - 2015-06-22 */function Ukulele() {
    "use strict";
    this.controllersDefinition = {};
    this.viewControllerArray = [];
    this.refreshHandler = undefined;
    var copyControllers = {};
    var self = this;
    var watchTimer;
    //心跳功能来判断bound的attribute有没有在内存中被更新，从而主动刷新视图
    var watchBoundAttribute = function () {
        for (var alias in self.controllersDefinition) {
            var controllerModel = self.controllersDefinition[alias];
            var controller = controllerModel.controllerInstance;
            var previousCtrlModel = copyControllers[alias];
            for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
                var boundAttr = controllerModel.boundAttrs[i];
                var attrName = boundAttr.attributeName;
                if (previousCtrlModel) {
                    var finalValue = ObjectUtil.getFinalValue(controller, attrName);
                    var previousFinalValue = ObjectUtil.getFinalValue(previousCtrlModel, attrName);
                    if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
                        var changedBoundAttrs = controllerModel.getBoundAttrByName(attrName);
                        for(var j=0;j<changedBoundAttrs.length;j++){
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
                            if(self.refreshHandler){
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
    };

    function getFinalAttr(attrName) {
        var temp = attrName.split(".");
        temp.shift();
        return temp.join(".");
    }
    var manageApplication = function () {
        $("[uku-application]").each(function () {
            analyizeElement($(this));
        });

    };

    function isRepeat($element) {
        if ($element.attr("uku-repeat")) {
            return true;
        }
        return false;
    }

    function isInRepeat($element) {
            var parents = $element.parents();
            for (var i = 0; i < parents.length; i++) {
                var parent = parents[i];
                var b = $(parent).attr("uku-repeat");
                if (b) {
                    return true;
                }
            }
            return false;
        }
        //解析html中各个uku的tag    
    var analyizeElement = function ($element) {
        var subElements = [];
        //scan element which has uku-* tag
        var isSelfHasUkuTag = $element.fuzzyFind('uku-');
        if(isSelfHasUkuTag){
            subElements.push(isSelfHasUkuTag);
        }
        $element.find("*").each(function () {
            var matchElement = $(this).fuzzyFind('uku-');
            if (matchElement && !isInRepeat($(matchElement))) {
                subElements.push(matchElement);
            }
        });
        searchExpression($element);

        //解析绑定 attribute，注册event
        for (var i = 0; i < subElements.length; i++) {
            var subElement = subElements[i];
            for (var j = 0; j < subElement.attributes.length; j++) {
                var attribute = subElement.attributes[j];
                if (attribute.nodeName.search('uku-') > -1) {
                    var attrName = attribute.nodeName.split('-')[1];
                    if (attrName !== "application") {
                        if (attrName.search('on') === 0) {
                            //is an event 
                            if (!isRepeat($(subElement)) && !isInRepeat($(subElement))) {
                                dealWithEvent($(subElement), attrName);
                            }

                        } else if (attrName.search('repeat') !== -1) {
                            //is an repeat
                            dealWithRepeat($(subElement));
                        } else {
                            //is an attribute
                            if (!isRepeat($(subElement)) && !isInRepeat($(subElement))) {
                                dealWithAttribute($(subElement), attrName);
                            }

                        }
                    }

                }
            }
        }
        if(self.refreshHandler){
            self.refreshHandler.call(null);
        }
        //scan element which has expression {{}} 
        function searchExpression($element) {
            if ($element.directText().search("{{") !== -1) {
                if (!isRepeat($element) && !isInRepeat($element)) {
                    //normal expression
                    dealWithExpression($element);
                }
            }
            $element.children().each(function () {
                searchExpression($(this));
            });
        }

        //处理绑定的expression
        function dealWithExpression(element) {

            var expression = element.directText();
            if (expression.search("{{") > -1 && expression.search("}}") > -1) {
                var attr = expression.slice(2, -2);
                var controllerModel = getBoundControllerModelByName(attr);
                var controllerInst = controllerModel.controllerInstance;
                attr = getFinalAttr(attr);
                element.directText(ObjectUtil.getFinalValue(controllerInst, attr));   
                var boundAttr = new BoundAttribute(attr, null, expression, element);
                controllerModel.addBoundAttr(boundAttr);
            }
        }

        //处理绑定的attribute
        function dealWithAttribute(element, tagName) {
                var attr = element.attr("uku-" + tagName);
                var controllerModel = getBoundControllerModelByName(attr);
                var controllerInst = controllerModel.controllerInstance;
                attr = getFinalAttr(attr);
                element.attr(tagName, ObjectUtil.getFinalValue(controllerInst, attr));
                var boundAttr = new BoundAttribute(attr, tagName, null, element);
                controllerModel.addBoundAttr(boundAttr);
                var elementName = element[0].tagName;
                if (elementName === "INPUT" && tagName === "value") {
                    element.change(function () {
                        var temp = attr.split(".");
                        var finalInstance = controllerInst;
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
            var controllerModel = getBoundControllerModelByName(expression);
            var controllerInst = controllerModel.controllerInstance;

            var eventNameInJQuery = eventName.substring(2);
            
            var re = /\(.*\)/;
            var index = expression.search(re);
            var functionName = expression.substring(0,index);
            functionName =getFinalAttr(functionName);
            var finalValueObject = ObjectUtil.getAttributeFinalValue2(controllerInst,functionName);
            var finalValue = finalValueObject.value;
            var _arguments = expression.substring(index+1,expression.length-1);
            _arguments = _arguments.split(",");
            
            element.bind(eventNameInJQuery, function () {
                
                var new_arguments = [];
                for(var i=0;i<_arguments.length;i++){
                    var argument = _arguments[i];
                    var temp = ObjectUtil.getFinalValue(controllerInst,argument);
                    new_arguments.push(temp);
                }
                finalValue.apply(finalValueObject.parent,new_arguments.concat(arguments));
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
            attr = getFinalAttr(attr);
            var boundAttr = new BoundAttribute(attr, "repeat", itemName, element);
            controllerModel.addBoundAttr(boundAttr);
            boundAttr.renderRepeat(controllerInst);
        }

        function getBoundModelInstantName(attrName) {
            var controlInstName = attrName.split('.')[0];
            if (controlInstName) {
                return controlInstName;
            }
            return null;
        }

        function getBoundControllerModelByName(attrName) {
            var instanceName = getBoundModelInstantName(attrName);
            var controllerModel = self.controllersDefinition[instanceName];
            return controllerModel;
        }
    };

    return {
        init: function () {
            $(document).ready(function () {
                manageApplication();
                watchBoundAttribute();
            });
        },
        registerController: function (instanceName, controllerInst) {
            self.viewControllerArray.push({
                "view": $(this),
                "controller": controllerInst
            });
            var controllerModel = new ControllerModel(controllerInst);
            self.controllersDefinition[instanceName] = controllerModel;
        },
        dealWithElement: function ($element, watch) {
            analyizeElement($element);
            if (watch) {
                watchBoundAttribute();
            }
        },
        refreshHandler: function(handler){
            self.refreshHandler = handler;
        }
    };
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
function BoundAttribute(attrName, ukuTag, expression, element) {
    "use strict";
    this.attributeName = attrName;
    this.ukuTag = ukuTag;
    this.expression = expression;
    this.element = element;
    this.renderTemplate = undefined;
    this.parentElement = undefined;
    if (ukuTag === "repeat") {
        this.renderTemplate = element.prop("outerHTML");
        this.parentElement = element.parent();
    }
    this.previousSiblings = undefined;
    this.nextSiblings = undefined;
}
BoundAttribute.prototype.renderAttribute = function (controller) {
    var finalValue = ObjectUtil.getFinalValue(controller,this.attributeName);
    if(this.ukuTag === "value"){
        this.element.val(finalValue);
    }else{
        this.element.attr(this.ukuTag, finalValue);
    }
    
};

BoundAttribute.prototype.renderExpression = function (controller) {
    var finalValue = ObjectUtil.getFinalValue(controller,this.attributeName);
    this.element.directText(finalValue);
};

BoundAttribute.prototype.renderRepeat = function (controller) {
    var finalValue = ObjectUtil.getFinalValue(controller,this.attributeName);
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

ObjectUtil.getAttributeFinalValue = function(object,attrName){
    return ObjectUtil.getAttributeFinalValue2(object,attrName).value;
};

ObjectUtil.getAttributeFinalValue2 = function(object,attrName){
    var finalValue = object;
    var parentValue;
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

ObjectUtil.getFinalValue = function(object,attrName){
    var re = /\(.*\)/;
    var index = attrName.search(re);
    if(index === -1){
        //is attribute
       return ObjectUtil.getAttributeFinalValue(object,attrName);
    }else{
        //is function
        var functionName = attrName.substring(0,index);
        var finalValueObject = ObjectUtil.getAttributeFinalValue2(object,functionName);
        var finalValue = finalValueObject.value;
        var _arguments = attrName.substring(index+1,attrName.length-1);
        _arguments = _arguments.split(",");
        var new_arguments = [];
        for(var i=0;i<_arguments.length;i++){
            var argument = _arguments[i];
            var temp = ObjectUtil.getFinalValue(object,argument);
            new_arguments.push(temp);
        }
        finalValue = finalValue.apply(finalValueObject.parent,new_arguments);
        return finalValue;
    }
};

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