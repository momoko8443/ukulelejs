/*! ukulelejs - v1.0.0 - 2015-12-01 */function Analyzer(uku){
    var self = this;
    //解析html中各个uku的tag
    var onloadHandlerQueue;
    this.analyizeElement = function (element) {
        onloadHandlerQueue = [];
        this.searchIncludeTag(element, function () {
            element = self.searchComponent(element);
            var subElements = [];
            //scan element which has uku-* tag
            var isSelfHasUkuTag = Selector.fuzzyFind(element, 'uku-');
            if (isSelfHasUkuTag) {
                subElements.push(isSelfHasUkuTag);
            }
            var allChildren = element.querySelectorAll("*");
            for (var i = 0; i < allChildren.length; i++) {
                var child = allChildren[i];
                var matchElement = Selector.fuzzyFind(child, 'uku-');
                if (matchElement && !UkuleleUtil.isInRepeat(matchElement)) {
                    subElements.push(matchElement);
                }
            }
            self.searchExpression(element);
            //解析绑定 attribute，注册event
            for (var n = 0; n < subElements.length; n++) {
                var subElement = subElements[n];
                var orderAttrs = sortAttributes(subElement);
                for (var j = 0; j < orderAttrs.length; j++) {
                    var attribute = orderAttrs[j];
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
                                    if (attrName !== "text") {
                                        dealWithAttribute(subElement, attrName);
                                    } else {
                                        dealWithInnerText(subElement);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            uku.copyAllController();
            while (onloadHandlerQueue.length > 0) {
                var handler = onloadHandlerQueue.pop();
                handler.func.apply(this, handler.args);
            }
            if (uku.refreshHandler) {
                uku.refreshHandler.call(uku);
            }
            if (uku.initHandler) {
                uku.initHandler.call(uku, element);
            }
        });
    };
    function sortAttributes(subElement) {
        var orderAttrs = [];
        for (var i = 0; i < subElement.attributes.length; i++) {
            var attribute = subElement.attributes[i];
            if (attribute.nodeName.search("uku-on") !== -1) {
                orderAttrs.push(attribute);
            } else {
                orderAttrs.unshift(attribute);
            }
        }
        return orderAttrs;
    }

    this.searchComponent = function(element) {
        var key = isComponent(element);
        if(key){
            if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                var attrs = element.attributes;
                var compDef = uku.getComponentsDefinition()[key];
                element = dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs);
            }
        }else{
            for (var i = 0; i < element.children.length; i++) {
                var child = element.children[i];
                this.searchComponent(child);
            }
        }
        return element;
    };
    function isComponent(element){
        for(var key in uku.getComponentsDefinition()){
            if(element.localName === key){
                return key;
            }
        }
        return null;
    }
    function dealWithComponent(tag,template,Clazz,attrs) {
        var randomAlias = 'cc_'+Math.floor(10000 * Math.random()).toString();
        template = template.replace(new RegExp('cc.','gm'),randomAlias+'.');
        tag.insertAdjacentHTML('beforeBegin', template);
        var htmlDom = tag.previousElementSibling;
        var cc = new Clazz(uku);
        cc._dom = htmlDom;
        cc.fire = function(eventType,data){
            var event = document.createEvent('HTMLEvents');
            event.initEvent("on"+eventType.toLowerCase(), true, true);
            event.data = data;
            cc._dom.dispatchEvent(event);
        };
        uku.registerController(randomAlias,cc);
        for(var i=0;i<attrs.length;i++){
            var attr = attrs[i];
            if(UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0){
                htmlDom.setAttribute(attr.nodeName,attr.nodeValue);
            }else{
                var tagName = UkuleleUtil.getAttrFromUkuTag(attr.nodeName,true);
                var controllerModel = uku.getControllerModelByName(attr.nodeValue);
                if (controllerModel) {
                    var boundItem = new BoundItemComponentAttribute(attr.nodeValue, tagName, cc, uku);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
        tag.parentNode.removeChild(tag);
        for (var j = 0; j < htmlDom.children.length; j++) {
            var child = htmlDom.children[j];
            self.searchComponent(child);
        }
        if(cc._initialized && typeof(cc._initialized) === 'function'){
            cc._initialized();
        }
        return htmlDom;
    }

    this.searchIncludeTag = function(element, retFunc) {
        var tags = element.querySelectorAll('.uku-include');
        var index = 0;
        if (index < tags.length) {
            dealWithInclude(index);
        } else {
            retFunc();
        }

        function dealWithInclude(index) {
            var tag = tags[index];
            var isLoad = tag.getAttribute("load");
            if (isLoad === "false") {
                index++;
                if (index < tags.length) {
                    dealWithInclude(index);
                } else {
                    retFunc();
                }
            } else {
                var src = tag.getAttribute("src");
                var replace = tag.getAttribute("replace");
                var replaceController = tag.getAttribute("replace-controller");
                var ajax = new Ajax();
                if (replace && replace === "true") {
                    (function (x) {
                        ajax.get(src, function (html) {
                            if (replaceController) {
                                html = doReplace(html, replaceController);
                            }
                            x.insertAdjacentHTML('beforeBegin', html);
                            var htmlDom = x.previousElementSibling;
                            x.parentNode.removeChild(x);
                            onloadHandlerQueue.push({
                                'func': runOnLoadFunc,
                                'args': [x, htmlDom]
                            });
                            self.searchIncludeTag(htmlDom, function () {
                                index++;
                                if (index < tags.length) {
                                    dealWithInclude(index);
                                } else {
                                    retFunc();
                                }
                            });
                        });
                    })(tag);
                } else {
                    (function (x) {
                        ajax.get(src, function (html) {
                            if (replaceController) {
                                html = doReplace(html, replaceController);
                            }
                            x.insertAdjacentHTML('afterBegin', html);
                            x.classList.remove('uku-include');
                            onloadHandlerQueue.push({
                                'func': runOnLoadFunc,
                                'args': [x]
                            });
                            self.searchIncludeTag(x, function () {
                                index++;
                                if (index < tags.length) {
                                    dealWithInclude(index);
                                } else {
                                    retFunc();
                                }
                            });
                        });
                    })(tag);
                }
            }

            function runOnLoadFunc(hostElement, replaceElement) {
                var expression = hostElement.getAttribute("uku-onload");
                if (expression) {
                    if (replaceElement) {
                        uku.getBoundAttributeValue(expression, [replaceElement]);
                    } else {
                        uku.getBoundAttributeValue(expression, [hostElement]);
                    }
                }
            }

            function doReplace(html, replaceController) {
                var tempArr = replaceController.split("|");
                if (tempArr && tempArr.length === 2) {
                    var oldCtrl = tempArr[0];
                    var newCtrl = tempArr[1];
                    html = html.replace(new RegExp(oldCtrl, "gm"), newCtrl);
                    return html;
                } else {
                    return html;
                }
            }
        }
    };

    this.searchExpression = function(element) {
        if (UkuleleUtil.searchUkuExpTag(Selector.directText(element)) !== -1) {
            if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                //normal expression
                dealWithExpression(element);
            }
        }
        for (var i = 0; i < element.children.length; i++) {
            this.searchExpression(element.children[i]);
        }

        //处理绑定的expression
        function dealWithExpression(element) {
            //通常的花括号声明方式
            var expression = Selector.directText(element);
            if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
                var attr = expression.slice(2, -2);
                var controllerModel = uku.getControllerModelByName(attr);
                if (controllerModel) {
                    var boundItem = new BoundItemExpression(attr, expression, element, uku);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
    };

    //处理绑定的attribute
    function dealWithAttribute(element, tagName) {
        var attr = element.getAttribute("uku-" + tagName);
        var elementName = element.tagName;
        var controllerModel = uku.getControllerModelByName(attr);
        if (controllerModel) {
            var boundItem = new BoundItemAttribute(attr, tagName, element, uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerModel.controllerInstance);
            elementChangedBinder(element, tagName, controllerModel, uku.refresh);
        }
    }

    //
    function dealWithInnerText(element) {
        var attr = element.getAttribute("uku-text");
        if (attr) {
            var controllerModel = uku.getControllerModelByName(attr);
            if (controllerModel) {
                var boundItem = new BoundItemInnerText(attr, element, uku);
                controllerModel.addBoundItem(boundItem);
                boundItem.render(controllerModel.controllerInstance);
            }
        }
    }

    //处理 事件 event
    function dealWithEvent(element, eventName) {
        var expression = element.getAttribute("uku-" + eventName);
        var eventNameInListener = eventName.substring(2);
        var controllerModel = uku.getControllerModelByName(expression);
        if (controllerModel) {
            var controller = controllerModel.controllerInstance;
            var temArr = expression.split(".");
            var alias;
            if (temArr[0] === "parent") {
                alias = temArr[1];
            } else {
                alias = temArr[0];
            }
            element.addEventListener(eventNameInListener, function (event) {
                uku.copyControllerInstance(controller, alias);
                uku.getBoundAttributeValue(expression, arguments);
                uku.refresh(alias, element);
            });
        }
    }
    //处理 repeat
    function dealWithRepeat(element) {
        var repeatExpression = element.getAttribute("uku-repeat");
        var tempArr = repeatExpression.split(' in ');
        var itemName = tempArr[0];
        var attr = tempArr[1];
        var controllerModel = uku.getControllerModelByName(attr);
        if (controllerModel) {
            var controllerInst = controllerModel.controllerInstance;
            var boundItem = new BoundItemRepeat(attr, itemName, element, uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerInst);
        }
    }
}

function elementChangedBinder(element, tagName, controllerModel, handler) {
    var elementStrategies = [inputTextCase, textareaCase, selectCase, checkboxCase, radioCase];
    for (var i = 0; i < elementStrategies.length; i++) {
        var func = elementStrategies[i];
        var goon = func.apply(this, arguments);
        if (goon) {
            break;
        }
    }
}


function inputTextCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if (elementName === "INPUT" && isSupportInputType(element) && tagName === "value") {
        var eventType = 'change';
        var inputType = element.getAttribute('type');
        if(inputType === "text"){
            eventType = 'input';
        }
        element.addEventListener(eventType, function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function isSupportInputType(element) {
    var type = element.getAttribute("type");
    if (type !== "checkbox" && type !== "radio") {
        return true;
    }
    return false;
}

function textareaCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if (elementName === "TEXTAREA" && tagName === "value") {
        element.addEventListener('input', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function selectCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if ((elementName === "SELECT" && tagName === "selected")) {
        element.addEventListener('change', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            var key;
            var tmpArr = attr.split("|");
            attr = tmpArr[0];
            key = tmpArr[1];
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }

            var options = element.querySelectorAll("option");
            for (var j = 0; j < options.length; j++) {
                var option = options[j];
                if (option.selected) {
                    var selectedItem = JSON.parse(option.getAttribute("data-item"));
                    finalInstance[temp[temp.length - 1]] = selectedItem;
                }
            }
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function checkboxCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "value" && element.getAttribute("type") === "checkbox") {
        element.addEventListener('change', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.checked;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function radioCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "selected" && element.getAttribute("type") === "radio") {
        element.addEventListener('change', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            if (element.checked) {
                finalInstance[temp[temp.length - 1]] = element.value;
                if (handler) {
                    handler(controllerModel.alias, element);
                }
            }

        });
        return true;
    }
    return false;
}
function Ukulele() {
	"use strict";
	var controllersDefinition = {};
	var componentsDefinition = {};
	var copyControllers = {};
	var self = this;
	/**
	 * @access a callback function when view was refreshed.
	 */
	this.refreshHandler = null;

	/**
	 * @access a callback function when view was initialized.
	 */
	this.initHandler = null;
	/**
	 * @access When using uku-repeat, parentUku to reference the Parent controller model's uku
	 */
	this.parentUku = null;

	/**
	 * @description getter of componentsDefinition
	 * @return {object} componentsDefinition
	 */
	this.getComponentsDefinition = function(){
        return componentsDefinition;
    };
	/**
	 * @description setter of componentsDefinition
	 * @param {object} value of componentsDefinition
	 */
    this.setComponentsDefinition = function(value){
        componentsDefinition = value;
    };
	/**
	 * @description bootstrap Ukulelejs
	 */
	this.init = function () {
		if(ajaxCounter > 0){
			setTimeout(this.init,200);
		}else{
			manageApplication();
		}
	};
	/**
	 * @description Register a controller model which you want to bind with view
	 * @param {string} instanceName controller's alias
	 * @param {object}  controllerInst controller's instance
	 */
	this.registerController = function (instanceName, controllerInst) {
		var controllerModel = new ControllerModel(instanceName, controllerInst);
		controllerInst._alias = instanceName;
		controllersDefinition[instanceName] = controllerModel;
	};
	/**
	 * @description deal with partial html element you want to manage by UkuleleJS
	 * @param {object} $element jquery html object e.g. $("#myButton")
	 * @param {boolean} watch whether refresh automatically or not
	 */
	this.dealWithElement = function (element) {
		analyizeElement(element);
	};
	/**
	 * @description deal with the uku-include componnent which need be to lazy loaded.
	 * @param {object} element dom
	 */
	this.loadIncludeElement = function (element) {
		if (element.getAttribute("load") === "false") {
			element.setAttribute("load", true);
			analyizeElement(element.parentNode);
		}
	};
	/**
	 * @description get the controller model's instance by alias.
	 * @param {object} expression  controller model's alias.
	 * @returns {object} controller model's instance
	 */
	this.getControllerModelByName = function (expression) {
		return getBoundControllerModelByName(expression);
	};
	/**
	 * @description refresh the view manually, e.g. you can call refresh in sync request's callback.
	 */
	this.refresh = function (alias,excludeElement) {
		runDirtyChecking(alias,excludeElement);
	};
	/**
	 * @description get value by expression
	 * @param {string} expression
	 */
	this.getFinalValueByExpression = function (expression) {
		var controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this, controller, expression);
	};
	/**
	 * @description register component is ukujs
	 * @param {string} tag component's tag in html e.g 'user-list' (<user-list></user-list>)
	 * @param {string} templateUrl component's url
	 */
	var ajax;
	var ajaxCounter = 0;
	this.registerComponent = function (tag,templateUrl){
		if(!ajax){
			ajax = new Ajax();
		}
		ajaxCounter++;
		ajax.get(templateUrl,function(result){
			var componentTemplate = UkuleleUtil.getInnerHtml(result,'template');
			var script = UkuleleUtil.getInnerHtml(result,'script');
			script = '('+script+")";
			var controllerClazz = eval(script);
			var newComp = new ComponentModel(tag, componentTemplate,controllerClazz);
			componentsDefinition[tag] = newComp;
			ajaxCounter--;
		});
	};

	//脏检测
	function runDirtyChecking(ctrlAliasName, excludeElement) {
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName);
			} else if (ObjectUtil.isArray(ctrlAliasName)) {
				for (var i = 0; i < ctrlAliasName.length; i++) {
					watchController(ctrlAliasName[i]);
				}
			}
		} else {
			for (var alias in controllersDefinition) {
				watchController(alias);
			}
		}

		function watchController(alias) {
			var controllerModel = controllersDefinition[alias];
			if (!controllerModel) {
				if (self.parentUku) {
					self.parentUku.refresh(alias);
				}
				return;
			}
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundItems.length; i++) {
				var boundItem = controllerModel.boundItems[i];
				var attrName = boundItem.attributeName;
				if (previousCtrlModel) {
					if (boundItem.ukuTag === "selected") {
						attrName = attrName.split("|")[0];
					}
					var finalValue = UkuleleUtil.getFinalValue(self, controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(self, previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundItem.attributeName;
						var changedBoundItems = controllerModel.getBoundItemsByName(attrName);
						for (var j = 0; j < changedBoundItems.length; j++) {
							var changedBoundItem = changedBoundItems[j];
							if(changedBoundItem.element !== excludeElement){
								changedBoundItem.render(controller);
							}
						}
						if (self.refreshHandler) {
							self.refreshHandler.call(self);
						}
					}
				}
			}
			self.copyControllerInstance(controller, alias);
		}
	}

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

	this.getBoundAttributeValue = function(attr, additionalArgu) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
		return result;
	};

	function manageApplication() {
		var apps = document.querySelectorAll("[uku-application]");
		if (apps.length === 1) {
			analyizeElement(apps[0]);
		} else {
			throw new Error("Only one 'uku-application' can be declared in a whole html.");
		}
	}
	var anylyzer;
	function analyizeElement(element){
		if(!anylyzer){
			anylyzer = new Analyzer(self);
			anylyzer.analyizeElement(element);
		}
	}
}

function Ajax(){

}

Ajax.prototype.get = function(url,success,error){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
       if (request.readyState===4){
           if (request.status===200){
               success(request.responseText);
           }else{
               if(error){
                   error();
               }
           }
       }
    };
    request.open("GET",url,true);
    request.send(null);
};

function Selector(){
    
}
Selector.fuzzyFind = function (element,text) {
    if (element && element.attributes) {
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (attr.nodeName.search(text) > -1) {
                return element;
            }
        }
    }
    return null;
};

Selector.directText = function (element,text) {
    var o = "";
    var nodes = element.childNodes;
    for (var i = 0; i <= nodes.length - 1; i++) {
        var node = nodes[i];
        if (node.nodeType === 3) {

            if (text || text ==="" || text === 0 || text === false) {
                node.nodeValue = text;
                return;
            } else {
                o += node.nodeValue;
            }
        }
    }
    return o.trim();
};

Selector.parents = function(element){
    var parents = [];
    while(element.parentNode && element.parentNode.tagName !== 'BODY'){
        parents.push(element.parentNode);
        element = element.parentNode;
    }
    return parents;
};
function BoundItemAttribute(attrName, ukuTag, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.ukuTag = ukuTag;
}

BoundItemAttribute.prototype = new BoundItemBase();
BoundItemAttribute.prototype.constructor = BoundItemAttribute;

BoundItemAttribute.prototype.render = function (controller) {
    var attr = this.attributeName;
    var key;
    var elementName = this.element.tagName;
    if(this.ukuTag === "selected" && elementName === "SELECT"){
        var tempArr = this.attributeName.split("|");
        attr = tempArr[0];
        key = tempArr[1];
    }
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);
    
    
    if(this.ukuTag.search('data-item') !== -1){
    	finalValue = JSON.stringify(finalValue);
        this.element.setAttribute('data-item',finalValue);
    }else if(this.ukuTag === "selected" && elementName === "SELECT"){
    	var value;
    	if(key){
    		value = finalValue[key];
    	}else{
    		value = finalValue;
    	}     
        this.element.value = value;
    }else if(this.element.getAttribute("type") === "checkbox"){
		this.element.checked = finalValue;
	}
	else if(this.ukuTag === "value"){
        this.element.value = finalValue;
    }
    else if(this.element.getAttribute("type") === "radio"){
        if(this.element.value === finalValue){
            this.element.setAttribute("checked",true);
        }
    }
    else if(this.element.nodeName === "IMG" && this.ukuTag === "src"){
        if(finalValue){
            this.element.setAttribute(this.ukuTag,finalValue);
        }
        /*if(!finalValue){
            this.element.setAttribute(this.ukuTag,UkuleleUtil.blankImg);
        }else{
            this.element.setAttribute(this.ukuTag,finalValue);
        }*/
    }
	else if(this.ukuTag === "style"){
		for(var cssName in finalValue){
			this.element.style[cssName] = finalValue[cssName];
		}
	}
    else{
        if(this.ukuTag === "disabled"){
            this.element.disabled = finalValue;
        }else{
            this.element.setAttribute(this.ukuTag, finalValue);
        }    
    }    
};
function BoundItemBase(attrName, element, uku) {
    "use strict";
    this.attributeName = attrName;
    this.element = element;
    this.uku = uku;
}
function BoundItemComponentAttribute(attrName, ukuTag, cc, uku){
    BoundItemBase.call(this,attrName,null,uku);
    //special value after 'uku-'
    this.ukuTag = ukuTag;
    this.componentController = cc;
}

BoundItemComponentAttribute.prototype = new BoundItemBase();
BoundItemComponentAttribute.prototype.constructor = BoundItemComponentAttribute;

BoundItemComponentAttribute.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    this.componentController[this.ukuTag] = finalValue;
    this.uku.refresh(this.componentController._alias);
};

function BoundItemExpression(attrName, expression, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.expression = expression;
}

BoundItemExpression.prototype = new BoundItemBase();
BoundItemExpression.prototype.constructor = BoundItemExpression;

BoundItemExpression.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    Selector.directText(this.element,finalValue);
};
function BoundItemInnerText(attrName, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.tagName = 'text';
}

BoundItemInnerText.prototype = new BoundItemBase();
BoundItemInnerText.prototype.constructor = BoundItemInnerText;

BoundItemInnerText.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    this.element.innerHTML = finalValue;
};
function BoundItemRepeat(attrName, itemName, element, uku) {
    BoundItemBase.call(this, attrName, element, uku);
    //this.ukuTag = "repeat";
    this.expression = itemName;

    this.renderTemplate = element.outerHTML;
    this.parentElement = element.parentNode;

    this.beginCommentString = undefined;
    this.endCommentString = undefined;
}

BoundItemRepeat.prototype = new BoundItemBase();
BoundItemRepeat.prototype.constructor = BoundItemRepeat;

BoundItemRepeat.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);

    if (!finalValue) {
        return;
    }

    var self = this;
    if (this.element && this.element.parentNode) {
        //create repeate begin comment
        this.beginCommentString = "begin uku-repeat: " + this.expression + " in " + this.attributeName;
        var beginComment = document.createComment(this.beginCommentString);
        this.element.parentNode.insertBefore(beginComment, this.element);
        //create repeate end comment
        this.endCommentString = "end uku-repeat: " + this.expression + " in " + this.attributeName;
        var endComment = document.createComment(this.endCommentString);
        this.element.parentNode.insertBefore(endComment, this.element.nextSibling);
        //remove definition dom
        this.element.parentNode.removeChild(this.element);

    }
    var treeWalker = document.createTreeWalker(this.parentElement,
        NodeFilter.SHOW_COMMENT,
        filter,
        false);

    function filter(node) {
        if (node.nodeValue === self.beginCommentString) {
            return (NodeFilter.FILTER_ACCEPT);
        }
        return (NodeFilter.FILTER_SKIP);
    }

    function generateTempContainer(){
        var index = UkuleleUtil.searchHtmlTag(self.renderTemplate,"tr");
        if(index === -1){
            return document.createElement("div");
        }else{
            return document.createElement("tbody");
        }
    }

    while (treeWalker.nextNode()) {
        var commentNode = treeWalker.currentNode;
        if (commentNode && commentNode.nodeValue === this.beginCommentString) {
            //remove overtime dom.
            while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
                commentNode.parentNode.removeChild(commentNode.nextSibling);
            }
            //create new dom
            var tempDiv = generateTempContainer();
            var blankDiv = generateTempContainer();
            commentNode.parentNode.insertBefore(blankDiv, commentNode.nextSibling);
            for (var i = 0; i < finalValue.length; i++) {
                tempDiv.insertAdjacentHTML('beforeEnd', this.renderTemplate);
                if (i === finalValue.length - 1) {
                    var childrenHTML = tempDiv.innerHTML;
                    blankDiv.insertAdjacentHTML('beforeBegin', childrenHTML);
                    commentNode.parentNode.removeChild(blankDiv);
                    tempDiv = null;
                    blankDiv = null;
                }
            }

            var child = commentNode.nextSibling;
            for (var j = 0; j < finalValue.length; j++) {
                child.removeAttribute("uku-repeat");
                var ukulele = new Ukulele();
                ukulele.parentUku = this.uku;
                var compDef = ukulele.parentUku.getComponentsDefinition();
                ukulele.setComponentsDefinition(compDef);
                ukulele.registerController(this.expression, finalValue[j]);
                var sibling = child.nextSibling;
                ukulele.dealWithElement(child);
                child = sibling;
            }
        }
    }

    if (this.element.tagName === "OPTION") {
        var expression = this.parentElement.getAttribute("uku-selected");
        var tempArr = expression.split("|");
        expression = tempArr[0];
        key = tempArr[1];
        var value = this.uku.getFinalValueByExpression(expression);
        if (key) {
            this.parentElement.value = value[key];
        } else {
            this.parentElement.value = value;
        }
    }
};

function ComponentModel(tagName,template,clazz){
    "use strict";
    this.tagName = tagName;
    this.template = template;
    this.controllerClazz = clazz;
}

function ControllerModel(alias,ctrlInst) {
    "use strict";
    this.alias = alias;
    this.controllerInstance = ctrlInst;
    this.boundItems = [];
}

ControllerModel.prototype.addBoundItem = function (boundItem) {
        this.boundItems.push(boundItem);
};

ControllerModel.prototype.getBoundItemsByName = function (name) {
    var tempBoundItems = [];
    for (var i = 0; i < this.boundItems.length; i++) {
        var boundItem = this.boundItems[i];
        if (boundItem.attributeName === name) {
            tempBoundItems.push(boundItem);
        }
    }
    return tempBoundItems;
};
var observeList = {};
if (!Object.hasOwnProperty("observe")) {
    if (!Object.hasOwnProperty("defineProperty")) {
        console.error("Current browser can't support this site.");
    } else {
        Object.observe = function (obj, callback) {
            for (var key in obj) {
                var oldValue = obj[key];
                obj['_' + key] = obj[key];
                if (obj.hasOwnProperty(key)) {
                    (function (o, k) {
                        Object.defineProperty(obj, '_' + k, {
                            writable: false
                        });
                    })(obj, key);
                    (function (o, k, old) {
                        Object.defineProperty(obj, k, {
                            get: function () {
                                return obj['_' + k];
                            },
                            set: function (value) {
                                this['_' + k] = value;
                                var change = {
                                    "name": k,
                                    "object": this,
                                    "type": "update",
                                    "oldValue": old
                                };
                                callback.call(null, [change]);
                            }
                        });
                    })(obj, key, oldValue);
                }
            }
            observeList[observeList] = true;
        };
    }

}

if (!Object.hasOwnProperty("unobserve")) {
    if (!Object.hasOwnProperty("defineProperty")) {
        console.error("Current browser can't support this site.");
    } else {
        Object.unobserve = function (obj, callback) {
            if (observeList[obj]) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (key.search('_') === -1) {
                            delete obj[key];
                            obj[key] = obj['_' + key];
                            delete obj['_' + key];
                        }
                    }
                }
                delete observeList[obj];
                callback();
            }
        };
    }
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
ObjectUtil.deepClone = function (obj) {

    var o, i, j, k;
    if (typeof (obj) !== "object" || obj === null) {
        return obj;
    }
    if (obj instanceof(Array)) {
        o = [];
        i = 0;
        j = obj.length;
        for (; i < j; i++) {
            if (typeof (obj[i]) === "object" && obj[i] !== null) {
                o[i] = arguments.callee(obj[i]);
            } else {
                o[i] = obj[i];
            }
        }
    } else {
        o = {};
        for (i in obj) {
            if (typeof (obj[i]) === "object" && obj[i] !== null && i !== "_dom") {
                o[i] = arguments.callee(obj[i]);
            } else {
                o[i] = obj[i];
            }
        }
    }

    return o;
};

function UkuleleUtil() {
    'use strict';
}
//一张1x1像素的png转成base64来解决绑定的src暂时无值的问题
/*UkuleleUtil.blankImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPAw8vVMDpsgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC";*/

//一串对象属性引用表达式，去掉 parent 以及 control alias部分后剩下的内容，如parent.myCtrl.username -> username / myCtrl.username -> username
UkuleleUtil.getFinalAttribute = function (expression) {
    var temp = expression.split(".");
    var isParent = temp.shift();
    if (isParent === "parent") {
        return UkuleleUtil.getFinalAttribute(temp.join("."));
    }
    return temp.join(".");
};
//检查字符串是否以 '<xx '开始并以 '</xx>' 结束
UkuleleUtil.searchHtmlTag = function (htmlString, tagName) {
    var reTemp = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
    var re = new RegExp(reTemp);
    var index = htmlString.search(re);
    return index;
};

UkuleleUtil.getInnerHtml = function(htmlString, tagName) {
    var reTemp = "<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">";
    var re = new RegExp(reTemp);
    var match = htmlString.match(re);
    if(match.index > -1){
        var matchString = match[0];
        var index = matchString.search(">");
        var tempString = matchString.substr(index+1);
        var index2 = tempString.lastIndexOf("</");
        tempString = tempString.substring(0,index2);
        tempString = tempString.replace(/(^\s*)|(\s*$)/g, "");
        console.log(tempString);
        return tempString;
    }else{
        return null;
    }
};

//检查字符串是否以 引号' " '开始并以 引号' " ' 结束
UkuleleUtil.isStringArgument = function (htmlString, tagName) {
    var re1 = /^"[\s\S]*"$/;
    var index = htmlString.search(re1);
    var re2 = /^'[\s\S]*'$/;
    if(index === 0){
        return true;
    }else{
        var index2 = htmlString.search(re2);
        if(index2 === 0){
            return true;
        }
    }
    return false;
};
//检查字符串中是否有 uku- 字符出现
UkuleleUtil.searchUkuAttrTag = function (htmlString) {
    var re = /^uku\-.*/;
    var index = htmlString.search(re);
    return index;
};
//取字符串中uku-之后的内容
UkuleleUtil.getAttrFromUkuTag = function (ukuTag, camelCase){
    if(UkuleleUtil.searchUkuAttrTag(ukuTag) === 0){
        ukuTag = ukuTag.replace('uku-','');
    }
    if(camelCase){
        var names = ukuTag.split('-');
        ukuTag = names[0];
        for(var i=1;i<names.length;i++){
            var firstLetter =  names[i].charAt(0).toUpperCase();
            ukuTag = ukuTag + firstLetter + names[i].substr(1);
        }
    }
    return ukuTag;
};

//检测是否是一个由 {{}} 包裹的表达式
UkuleleUtil.searchUkuExpTag = function (expression) {
    var re = /^\{\{.*\}\}$/;
    var index = expression.search(re);
    return index;
};
//检测是否是一个函数格式, 如  functionName()
UkuleleUtil.searchUkuFuncArg = function (htmlString) {
    var re = /\(.*\)$/;
    var index = htmlString.search(re);
    return index;
};
//element是否本身是一个 repeat
UkuleleUtil.isRepeat = function (element) {
    if (element.getAttribute("uku-repeat")) {
        return true;
    }
    return false;
};
//element是否在一个repeat循环体内
UkuleleUtil.isInRepeat = function (element) {
    var parents = Selector.parents(element);
    for (var i = 0; i < parents.length; i++) {
        var parent = parents[i];
        var b = parent.getAttribute("uku-repeat");
        if (b) {
            return true;
        }
    }
    return false;
};
//获取表达式中 Controller的alias ，如 myCtrl.username -> myCtrl
UkuleleUtil.getBoundModelInstantName = function (expression) {
    var controlInstName = expression.split('.')[0];
    if (controlInstName) {
        return controlInstName;
    }
    return null;
};

UkuleleUtil.getAttributeFinalValue = function (object, attrName) {
    var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
    var value = valueObject.value;
    return value;
};

//根据attrname，获取object中的具体某个属性值，如 从user对象中 获取  address.city.name
UkuleleUtil.getAttributeFinalValueAndParent = function (object, attrName) {
    var finalValue = object;
    var parentValue;
    attrName = UkuleleUtil.getFinalAttribute(attrName);
    var temp = attrName.split(".");
    if (attrName !== "" && finalValue) {
        for (var i = 0; i < temp.length; i++) {
            var property = temp[i];
            parentValue = finalValue;
            finalValue = finalValue[property];
            if (finalValue === undefined || finalValue === null) {
                break;
            }
        }
    }
    return {
        "value": finalValue,
        "parent": parentValue
    };
};

UkuleleUtil.getFinalValue = function (uku, object, attrName, additionalArgu) {
    var index = UkuleleUtil.searchUkuFuncArg(attrName);
    if (index === -1) {
        //is attribute
        return UkuleleUtil.getAttributeFinalValue(object, attrName);
    } else {
        //is function
        var functionName = attrName.substring(0, index);
        var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
        var finalValue = finalValueObject.value;
        if (finalValue === undefined) {
            return finalValue;
        }
        var new_arguments = [];
        var _arguments = attrName.substring(index + 1, attrName.length - 1);
        if (_arguments !== "") {
            var isStringArg = UkuleleUtil.isStringArgument(_arguments);
            if(isStringArg){
                _arguments = [_arguments];
            }else{
                _arguments = _arguments.split(",");
            }

            for (var i = 0; i < _arguments.length; i++) {
                var temp;
                var argument = _arguments[i];
                var controllerModel = uku.getControllerModelByName(argument);
                if (controllerModel && controllerModel.controllerInstance) {
                    var agrumentInst = controllerModel.controllerInstance;
                    if (argument.split(".").length === 1) {
                        temp = agrumentInst;
                    } else {
                        temp = UkuleleUtil.getFinalValue(uku, agrumentInst, argument);
                    }
                } else {
                    temp = UkuleleUtil.getFinalValue(uku, object, argument);
                }
                if (temp !== object) {
                    new_arguments.push(temp);
                } else {
                    var re2 = /\'.*\'/;
                    var index2 = argument.search(re2);
                    var re3 = /\".*\"/;
                    var index3 = argument.search(re3);
                    if (index2 !== -1) {
                        argument = argument.substring(1, argument.length - 1);
                        new_arguments.push(argument);
                    } else if (index3 !== -1) {
                        argument = argument.substring(1, argument.length - 1);
                        new_arguments.push(argument);
                    } else {
                        new_arguments.push(temp);
                    }
                }
            }
        }

        if (additionalArgu) {
            var additionalArguArray = Array.prototype.slice.call(additionalArgu);
            new_arguments = new_arguments.concat(additionalArguArray);
        }
        finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
        return finalValue;
    }
};
