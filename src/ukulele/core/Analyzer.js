function Analyzer(uku){
    EventEmitter.call(this);
    //解析html中各个uku的tag
    var defMgr = uku._internal_getDefinitionManager();

    this.analyizeElement = function (ele) {
        var self = this;
        searchComponent(ele,function(element){
            var subElements = [];
            //scan element which has uku-* tag
            var isSelfHasUkuTag = Selector.fuzzyFind(element, 'uku-');
            if (isSelfHasUkuTag) {
                subElements.push(isSelfHasUkuTag);
            }
            var allChildren = Selector.querySelectorAll(element,"*");
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
            defMgr.copyAllController();
            if (self.hasListener(Analyzer.ANALYIZE_COMPLETED)) {
                self.dispatchEvent({'eventType':Analyzer.ANALYIZE_COMPLETED,'element':element});
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


    function searchComponent(element, callback) {
        var comp = defMgr.getComponent(element.localName);
        if(comp){
            if(!comp.lazy){
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    var attrs = element.attributes;
                    var compDef = defMgr.getComponentsDefinition()[comp.tagName];
                    dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs, function(compElement){
                        callback && callback(compElement);
                    });
                }
            }else{
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    defMgr.addLazyComponentDefinition(comp.tagName,comp.templateUrl,function(){
                        var attrs = element.attributes;
                        var compDef = defMgr.getComponentsDefinition()[comp.tagName];
                        dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs,function(compElement){
                            callback && callback(compElement);
                        });
                    });
                }
            }
        }else{
            if(element.children && element.children.length > 0){
                var ac = new AsyncCaller();
                for (var i = 0; i < element.children.length; i++) {
                    var child = element.children[i];
                    ac.pushQueue(searchComponent,[child,function(){
                        searchComponent.resolve(ac);
                    }]);
                }
                ac.exec(function(){
                    callback && callback(element);
                });
            }else{
                callback && callback(element);
            }
        }


        function dealWithComponent(tag,template,Clazz,attrs,callback) {
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
                        var controllerModel = defMgr.getControllerModelByName(attr.nodeValue);
                        if (controllerModel) {
                            var boundItem = new BoundItemComponentAttribute(attr.nodeValue, tagName, cc, uku);
                            controllerModel.addBoundItem(boundItem);
                            boundItem.render(controllerModel.controllerInstance);
                        }
                    }
                }
            }

            tag.parentNode.removeChild(tag);
            if(htmlDom.children && htmlDom.children.length > 0){
                var ac = new AsyncCaller();
                for (var j = 0; j < htmlDom.children.length; j++) {
                    var child = htmlDom.children[j];
                    ac.pushQueue(searchComponent,[child,function(){
                        searchComponent.resolve(ac);
                    }]);
                }
                ac.exec(function(){
                    if(cc && cc._initialized && typeof(cc._initialized) === 'function'){
                        cc._initialized();
                    }
                    callback && callback(htmlDom);
                });
            }else{
                if(cc && cc._initialized && typeof(cc._initialized) === 'function'){
                    cc._initialized();
                }
                callback && callback(htmlDom);
            }

        }



    }
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

        //处理绑定的expression
        function dealWithExpression(element) {
            //通常的花括号声明方式
            var expression = Selector.directText(element);
            if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
                var attr = expression.slice(2, -2);
                var controllerModel = defMgr.getControllerModelByName(attr);
                if (controllerModel) {
                    var boundItem = new BoundItemExpression(attr, expression, element, uku);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
    }

    //处理绑定的attribute
    function dealWithAttribute(element, tagName) {
        var attr = element.getAttribute("uku-" + tagName);
        var elementName = element.tagName;
        var controllerModel = defMgr.getControllerModelByName(attr);
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
            var controllerModel = defMgr.getControllerModelByName(attr);
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
        var controllerModel = defMgr.getControllerModelByName(expression);
        if (controllerModel) {
            var controller = controllerModel.controllerInstance;
            var temArr = expression.split(".");
            var alias;
            if (temArr[0] === "parent") {
                alias = temArr[1];
            } else {
                alias = temArr[0];
            }
            EventListener.addEventListener(element,eventNameInListener,function(event){
                defMgr.copyControllerInstance(controller, alias);
                defMgr.getBoundAttributeValue(expression, arguments);
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
        var controllerModel = defMgr.getControllerModelByName(attr);
        if (controllerModel) {
            var controllerInst = controllerModel.controllerInstance;
            var boundItem = new BoundItemRepeat(attr, itemName, element, uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerInst);
        }
    }
}

Analyzer.ANALYIZE_COMPLETED = 'analyizeCompleted';
