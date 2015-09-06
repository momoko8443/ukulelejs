/*! ukulelejs - v1.0.0 - 2015-09-04 */function elementChangedBinder(element,tagName,controllerModel,handler){
    var elementStrategies = [inputTextCase,selectCase,checkboxCase,radioCase];
    for(var i=0;i<elementStrategies.length;i++){
        var func = elementStrategies[i];
        var goon = func.apply(this,arguments);
        if(goon){
            break;
        }
    }
}


function inputTextCase(element,tagName,controllerModel,handler){
    var elementName = element.tagName;
    if(elementName === "INPUT" && element.getAttribute("type") === "text" && tagName === "value"){
        element.addEventListener('change', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if(handler){
                handler();
            }
        });
        return true;
    }
    return false;
}

function selectCase(element,tagName,controllerModel,handler){
    var elementName = element.tagName;
    if((elementName === "SELECT" && tagName === "selected")){   
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
            if(handler){
                handler();
            }    
        });
        return true;
    }
    return false;
}

function checkboxCase(element,tagName,controllerModel,handler){
    var elementName = element.tagName;
    
    if (elementName === "INPUT" && tagName === "value" && element.getAttribute("type") === "checkbox"){
        element.addEventListener('change', function (e) {
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.checked;
            if(handler){
                handler();
            }
        });
        return true;
    }
    return false;
}

function radioCase(element,tagName,controllerModel,handler){
    var elementName = element.tagName;
    
    if (elementName === "INPUT" && tagName === "selected" && element.getAttribute("type") === "radio"){  
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
                if(handler){
                    handler();
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
    this.init = function () {
        manageApplication();
    };
    /**
     * @description Register a controller model which you want to bind with view
     * @param {string} instanceName controller's alias
     * @param {object}  controllerInst controller's instance
     */
    this.registerController = function (instanceName, controllerInst) {
        var controllerModel = new ControllerModel(controllerInst);
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
    this.refresh = function () {
        watchBoundAttribute();
        copyAllController();
    };
    /**
     * @description get value by expression
     * @param {string} expression
     */
    this.getFinalValueByExpression = function (expression) {
        var controller = this.getControllerModelByName(expression).controllerInstance;
        return UkuleleUtil.getFinalValue(this, controller, expression);
    };

    //脏检测
    function watchBoundAttribute() {
        for (var alias in controllersDefinition) {
            var controllerModel = controllersDefinition[alias];
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
                            changedBoundItem.render(controller);
                        }
                        if (self.refreshHandler) {
                            self.refreshHandler.call(self);
                        }
                    }
                }
            }
            copyControllerInstance(controller, alias);
        }
    }

    function copyAllController() {
        for (var alias in controllersDefinition) {
            var controllerModel = controllersDefinition[alias];
            var controller = controllerModel.controllerInstance;
            copyControllerInstance(controller, alias);
        }
    }

    function copyControllerInstance(controller, alias) {
        var previousCtrlModel = ObjectUtil.deepClone(controller);
        delete copyControllers[alias];
        copyControllers[alias] = previousCtrlModel;
    }


    //解析html中各个uku的tag
    function analyizeElement(element) {
        element.style.display = "none";
        searchIncludeTag(element, function () {
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
                self.refreshHandler.call(self);
            }
            if (self.initHandler) {
                self.initHandler.call(self, element);
            }
            copyAllController();
            element.style.display = "block";
        });


        function searchIncludeTag(element, retFunc) {
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
                                searchIncludeTag(htmlDom, function () {
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
                                searchIncludeTag(x, function () {
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
        }

        //scan element which has expression {{}}
        function searchExpression(element) {
            if (UkuleleUtil.searchUkuExpTag(Selector.directText(element)) !== -1) {
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    //normal expression
                    dealWithExpression(element);
                }
            }
            for (var i = 0; i < element.children.length; i++) {
                searchExpression(element.children[i]);
            }
        }
        //处理绑定的expression
        function dealWithExpression(element) {
            var expression = Selector.directText(element);
            if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
                var attr = expression.slice(2, -2);
                var controllerModel = getBoundControllerModelByName(attr);
                if (controllerModel) {
                    var boundItem = new BoundItemExpression(attr, expression, element, self);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
        //处理绑定的attribute
        function dealWithAttribute(element, tagName) {
            var attr = element.getAttribute("uku-" + tagName);

            var elementName = element.tagName;
            var alias = attr.split(".")[0];
            var controllerModel = getBoundControllerModelByName(attr);
            if (controllerModel) {
                var boundItem = new BoundItemAttribute(attr, tagName, element, self);
                controllerModel.addBoundItem(boundItem);
                boundItem.render(controllerModel.controllerInstance);
                
                elementChangedBinder(element,tagName,controllerModel,watchBoundAttribute);  
            }
        }
        //处理 事件 event
        function dealWithEvent(element, eventName) {
            var expression = element.getAttribute("uku-" + eventName);
            var eventNameInListener = eventName.substring(2);
            var controllerModel = getBoundControllerModelByName(expression);
            if (controllerModel) {
                var controller = controllerModel.controllerInstance;
                var temArr = expression.split(".");
                var alias;
                if (temArr[0] === "parent") {
                    alias = temArr[1];
                } else {
                    alias = temArr[0];
                }
                element.addEventListener(eventNameInListener, function () {
                    copyControllerInstance(controller, alias);
                    getBoundAttributeValue(expression, arguments);
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
            if (controllerModel) {
                var controllerInst = controllerModel.controllerInstance;
                var boundItem = new BoundItemRepeat(attr, itemName, element, self);
                controllerModel.addBoundItem(boundItem);
                boundItem.render(controllerInst);
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

    function getBoundAttributeValue(attr, additionalArgu) {
        var controllerModel = getBoundControllerModelByName(attr);
        var controllerInst = controllerModel.controllerInstance;
        var result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
        return result;
    }

    function manageApplication() {
        var apps = document.querySelectorAll("[uku-application]");
        if (apps.length === 1) {
            analyizeElement(apps[0]);
        } else {
            throw new Error("Only one 'uku-application' can be declared in a whole html.");
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

/*Selector.val = function(element,value){
    if(value){
        if(element.hasAttributes("value")){
            element.value = value;
        }
        return;
    }else{
        if(element.tagName === "INPUT"){
            
        }
    }
};*/

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
		this.element.setAttribute("checked",finalValue);
	}
	else if(this.ukuTag === "value"){
        this.element.value = finalValue;
    }
    else if(this.element.getAttribute("type") === "radio"){
        if(this.element.value === finalValue){
            this.element.setAttribute("checked",true);
        }
    }
    else{
        this.element.setAttribute(this.ukuTag, finalValue);
    }    
};
function BoundItemBase(attrName, element, uku) {
    "use strict";
    this.attributeName = attrName;
    this.element = element;
    this.uku = uku;
}
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

    while (treeWalker.nextNode()) {
        var commentNode = treeWalker.currentNode;
        if (commentNode && commentNode.nodeValue === this.beginCommentString) {
            //remove overtime dom.
            while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
                commentNode.parentNode.removeChild(commentNode.nextSibling);
            }
            //create new dom
            var tempDiv;
            for (var i = 0; i < finalValue.length; i++) {
                if (i === 0 && !tempDiv) {
                    tempDiv = document.createElement("div");
                    commentNode.parentNode.insertBefore(tempDiv, commentNode.nextSibling);
                }
                var item = finalValue[i];
                tempDiv.insertAdjacentHTML('beforeBegin', this.renderTemplate);
                var itemRender = tempDiv.previousSibling;
                itemRender.removeAttribute("uku-repeat");
                var ukulele = new Ukulele();
                ukulele.parentUku = this.uku;
                ukulele.registerController(this.expression, item);
                ukulele.dealWithElement(itemRender);
                if (i === finalValue.length - 1) {
                    tempDiv.parentNode.removeChild(tempDiv);
                }
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
function ControllerModel(ctrlInst) {
    "use strict";
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
//一串对象属性引用表达式，去掉 parent 以及 control alias部分后剩下的内容
UkuleleUtil.getFinalAttribute = function (expression) {
    var temp = expression.split(".");
    var isParent = temp.shift();
    if (isParent === "parent") {
        return UkuleleUtil.getFinalAttribute(temp.join("."));
    }
    return temp.join(".");
};
//检查字符串中是否有 uku- 字符出现
UkuleleUtil.searchUkuAttrTag = function (htmlString) {
    var re = /^uku\-.*/;
    var index = htmlString.search(re);
    return index;
};
//检测是否是一个由 {{}} 包裹的表达式
UkuleleUtil.searchUkuExpTag = function (expression) {
    var re = /^\{\{.*\}\}$/;
    var index = expression.search(re);
    return index;
};
//检测是否是一个函数格式  如  functionName()
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
        var _arguments = attrName.substring(index + 1, attrName.length - 1);
        _arguments = _arguments.split(",");
        var new_arguments = [];
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
        if (additionalArgu) {
            new_arguments.concat(additionalArgu);
        }
        finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
        return finalValue;
    }
};