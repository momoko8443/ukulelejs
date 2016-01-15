function Analyzer(uku){
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
                uku.refreshHandler.call(uku, element);
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
        var tempFragment = document.createElement('div');
        tempFragment.insertAdjacentHTML('afterBegin',template);
        if(tempFragment.children.length > 1){
            template = tempFragment.outerHTML;
        }
        tag.insertAdjacentHTML('beforeBegin', template);
        var htmlDom = tag.previousElementSibling;
        var cc;
        if(Clazz){
            cc = new Clazz(uku);
            cc._dom = htmlDom;
            cc.fire = function(eventType,data){
                var event = document.createEvent('HTMLEvents');
                event.initEvent(eventType.toLowerCase(), true, true);
                event.data = data;
                cc._dom.dispatchEvent(event);
            };
            uku.registerController(randomAlias,cc);
            for(var i=0;i<attrs.length;i++){
                var attr = attrs[i];
                if(UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0 || attr.nodeName.search("uku-on") !== -1){
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
        }

        tag.parentNode.removeChild(tag);
        for (var j = 0; j < htmlDom.children.length; j++) {
            var child = htmlDom.children[j];
            self.searchComponent(child);
        }
        if(cc && cc._initialized && typeof(cc._initialized) === 'function'){
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
        eventNameInListener = eventNameInListener.toLowerCase();
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
