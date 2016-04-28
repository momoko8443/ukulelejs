import {EventEmitter} from "./EventEmitter";
import {Selector} from "../extend/Selector";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {AsyncCaller} from "../util/AsyncCaller";
import {BoundItemAttribute} from '../model/BoundItemAttribute';
import {BoundItemExpression} from '../model/BoundItemExpression';
import {BoundItemInnerText} from '../model/BoundItemInnerText';
import {BoundItemRepeat} from '../model/BoundItemRepeat';
import {BoundItemComponentAttribute} from "../model/BoundItemComponentAttribute";

function Analyzer(uku){
    EventEmitter.call(this);
    //解析html中各个uku的tag
    let defMgr = uku._internal_getDefinitionManager();

    this.analyizeElement = function (ele) {
        let self = this;
        searchComponent(ele,function(element){
            let subElements = [];
            //scan element which has uku-* tag
            let isSelfHasUkuTag = Selector.fuzzyFind(element, 'uku-');
            if (isSelfHasUkuTag) {
                subElements.push(isSelfHasUkuTag);
            }
            let allChildren = Selector.querySelectorAll(element,"*");
            for (let i = 0; i < allChildren.length; i++) {
                let child = allChildren[i];
                let matchElement = Selector.fuzzyFind(child, 'uku-');
                if (matchElement && !UkuleleUtil.isInRepeat(matchElement)) {
                    subElements.push(matchElement);
                }
            }
            searchExpression(element);
            //解析绑定 attribute，注册event
            for (let n = 0; n < subElements.length; n++) {
                let subElement = subElements[n];
                let orderAttrs = sortAttributes(subElement);
                for (let j = 0; j < orderAttrs.length; j++) {
                    let attribute = orderAttrs[j];
                    if (UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
                        let tempArr = attribute.nodeName.split('-');
                        tempArr.shift();
                        let attrName = tempArr.join('-');
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
        let orderAttrs = [];
        for (let i = 0; i < subElement.attributes.length; i++) {
            let attribute = subElement.attributes[i];
            if (attribute.nodeName.search("uku-on") !== -1) {
                orderAttrs.push(attribute);
            } else {
                orderAttrs.unshift(attribute);
            }
        }
        return orderAttrs;
    }


    function searchComponent(element, callback) {
        let comp = defMgr.getComponent(element.localName);
        if(comp){
            if(!comp.lazy){
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    let attrs = element.attributes;
                    let compDef = defMgr.getComponentsDefinition()[comp.tagName];
                    dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs, function(compElement){
                        callback && callback(compElement);
                    });
                }
            }else{
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    defMgr.addLazyComponentDefinition(comp.tagName,comp.templateUrl,function(){
                        let attrs = element.attributes;
                        let compDef = defMgr.getComponentsDefinition()[comp.tagName];
                        dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs,function(compElement){
                            callback && callback(compElement);
                        });
                    });
                }
            }
        }else{
            if(element.children && element.children.length > 0){
                let ac = new AsyncCaller();
                for (let i = 0; i < element.children.length; i++) {
                    let child = element.children[i];
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
            let randomAlias = 'cc_'+Math.floor(10000 * Math.random()).toString();
            template = template.replace(new RegExp('cc.','gm'),randomAlias+'.');
            let tempFragment = document.createElement('div');
            tempFragment.insertAdjacentHTML('afterBegin',template);
            if(tempFragment.children.length > 1){
                template = tempFragment.outerHTML;
            }
            tag.insertAdjacentHTML('beforeBegin', template);
            let htmlDom = tag.previousElementSibling;
            let cc;
            if(Clazz){
                cc = new Clazz(uku);
                cc._dom = htmlDom;
                cc.fire = function(eventType,data){
                    let event = document.createEvent('HTMLEvents');
                    event.initEvent(eventType.toLowerCase(), true, true);
                    event.data = data;
                    cc._dom.dispatchEvent(event);
                };
                uku.registerController(randomAlias,cc);
                for(let i=0;i<attrs.length;i++){
                    let attr = attrs[i];
                    if(UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0 || attr.nodeName.search("uku-on") !== -1){
                        htmlDom.setAttribute(attr.nodeName,attr.nodeValue);
                    }else{
                        let tagName = UkuleleUtil.getAttrFromUkuTag(attr.nodeName,true);
                        let controllerModel = defMgr.getControllerModelByName(attr.nodeValue);
                        if (controllerModel) {
                            let boundItem = new BoundItemComponentAttribute(attr.nodeValue, tagName, cc, uku);
                            controllerModel.addBoundItem(boundItem);
                            boundItem.render(controllerModel.controllerInstance);
                        }
                    }
                }
            }

            tag.parentNode.removeChild(tag);
            if(htmlDom.children && htmlDom.children.length > 0){
                let ac = new AsyncCaller();
                for (let j = 0; j < htmlDom.children.length; j++) {
                    let child = htmlDom.children[j];
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
        for (let i = 0; i < element.children.length; i++) {
            searchExpression(element.children[i]);
        }

        //处理绑定的expression
        function dealWithExpression(element) {
            //通常的花括号声明方式
            let expression = Selector.directText(element);
            if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
                let attr = expression.slice(2, -2);
                let controllerModel = defMgr.getControllerModelByName(attr);
                if (controllerModel) {
                    let boundItem = new BoundItemExpression(attr, expression, element, uku);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
    }

    //处理绑定的attribute
    function dealWithAttribute(element, tagName) {
        let attr = element.getAttribute("uku-" + tagName);
        let elementName = element.tagName;
        let controllerModel = defMgr.getControllerModelByName(attr);
        if (controllerModel) {
            let boundItem = new BoundItemAttribute(attr, tagName, element, uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerModel.controllerInstance);
            elementChangedBinder(element, tagName, controllerModel, uku.refresh);
        }
    }

    //
    function dealWithInnerText(element) {
        let attr = element.getAttribute("uku-text");
        if (attr) {
            let controllerModel = defMgr.getControllerModelByName(attr);
            if (controllerModel) {
                let boundItem = new BoundItemInnerText(attr, element, uku);
                controllerModel.addBoundItem(boundItem);
                boundItem.render(controllerModel.controllerInstance);
            }
        }
    }


    //处理 事件 event
    function dealWithEvent(element, eventName) {
        let expression = element.getAttribute("uku-" + eventName);
        let eventNameInListener = eventName.substring(2);
        eventNameInListener = eventNameInListener.toLowerCase();
        let controllerModel = defMgr.getControllerModelByName(expression);
        if (controllerModel) {
            let controller = controllerModel.controllerInstance;
            let temArr = expression.split(".");
            let alias;
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
        let repeatExpression = element.getAttribute("uku-repeat");
        let tempArr = repeatExpression.split(' in ');
        let itemName = tempArr[0];
        let attr = tempArr[1];
        let controllerModel = defMgr.getControllerModelByName(attr);
        if (controllerModel) {
            let controllerInst = controllerModel.controllerInstance;
            let boundItem = new BoundItemRepeat(attr, itemName, element, uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerInst);
        }
    }
}
Analyzer.prototype = new EventEmitter();
Analyzer.prototype.constructor = Analyzer;
Analyzer.ANALYIZE_COMPLETED = 'analyizeCompleted';

export {Analyzer};
