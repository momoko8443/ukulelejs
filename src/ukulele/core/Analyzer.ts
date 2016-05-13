import {EventEmitter} from "./EventEmitter";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {AsyncCaller} from "../util/AsyncCaller";
import {BoundItemAttribute} from '../model/BoundItemAttribute';
import {BoundItemExpression} from '../model/BoundItemExpression';
import {BoundItemInnerText} from '../model/BoundItemInnerText';
import {BoundItemRepeat} from '../model/BoundItemRepeat';
import {BoundItemComponentAttribute} from "../model/BoundItemComponentAttribute";
import {elementChangedBinder} from "./ElementActionBinder";
import {IUkulele} from "./IUkulele";
import {EventListener} from "../extend/EventListener";
import {Selector} from "../extend/Selector";

export class Analyzer extends EventEmitter{
    private uku:IUkulele;
    private defMgr;
    static ANALYIZE_COMPLETED:string = 'analyizeCompleted';
    constructor(_uku:IUkulele){
        super();
        this.uku = _uku;
        this.defMgr = this.uku._internal_getDefinitionManager();
    }
    //解析html中各个uku的tag

    analyizeElement(ele):void{
        this.searchComponent(ele,function(element){
            let subElements = [];
            //scan element which has uku-* tag
            let isSelfHasUkuTag = Selector.fuzzyFind(element, 'uku-');
            if (isSelfHasUkuTag) {
                subElements.push(isSelfHasUkuTag);
            }
            let allChildren = Selector.querySelectorAll(element,"*");
            for (let i = 0; i < allChildren.length; i++) {
                let child:HTMLElement = allChildren[i] as HTMLElement;
                let matchElement = Selector.fuzzyFind(child, 'uku-');
                if (matchElement && !UkuleleUtil.isInRepeat(matchElement)) {
                    subElements.push(matchElement);
                }
            }
            this.searchExpression(element);
            //解析绑定 attribute，注册event
            for (let n = 0; n < subElements.length; n++) {
                let subElement = subElements[n];
                let orderAttrs = this.sortAttributes(subElement);
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
                                    this.dealWithEvent(subElement, attrName);
                                }
                            } else if (attrName.search('repeat') !== -1) {
                                //is an repeat
                                this.dealWithRepeat(subElement);
                            } else {
                                //is an attribute
                                if (!UkuleleUtil.isRepeat(subElement) && !UkuleleUtil.isInRepeat(subElement)) {
                                    if (attrName !== "text") {
                                        this.dealWithAttribute(subElement, attrName);
                                    } else {
                                        this.dealWithInnerText(subElement);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this.defMgr.copyAllController();
            if (this.hasListener(Analyzer.ANALYIZE_COMPLETED)) {
                this.dispatchEvent({'eventType':Analyzer.ANALYIZE_COMPLETED,'element':element});
            }
        });
    }

    private sortAttributes(subElement):Array<any>{
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


    private searchComponent(element, callback):void{
        let comp = this.defMgr.getComponent(element.localName);
        if(comp){
            if(!comp.lazy){
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    let attrs = element.attributes;
                    let compDef = this.defMgr.getComponentsDefinition()[comp.tagName];
                    dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs, function(compElement){
                        callback && callback(compElement);
                    });
                }
            }else{
                if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                    this.defMgr.addLazyComponentDefinition(comp.tagName,comp.templateUrl,function(){
                        let attrs = element.attributes;
                        let compDef = this.defMgr.getComponentsDefinition()[comp.tagName];
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
                    ac.pushQueue(this.searchComponent,[child,function(){
                        this.searchComponent.resolve(ac);
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
                cc = new Clazz(this.uku);
                cc._dom = htmlDom;
                cc.fire = function(eventType,data){
                    let event = document.createEvent('HTMLEvents');
                    event.initEvent(eventType.toLowerCase(), true, true);
                    event['data'] = data;
                    cc._dom.dispatchEvent(event);
                };
                this.uku.registerController(randomAlias,cc);
                for(let i=0;i<attrs.length;i++){
                    let attr = attrs[i];
                    if(UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0 || attr.nodeName.search("uku-on") !== -1){
                        htmlDom.setAttribute(attr.nodeName,attr.nodeValue);
                    }else{
                        let tagName = UkuleleUtil.getAttrFromUkuTag(attr.nodeName,true);
                        let controllerModel = this.defMgr.getControllerModelByName(attr.nodeValue);
                        if (controllerModel) {
                            let boundItem = new BoundItemComponentAttribute(attr.nodeValue, tagName, cc, this.uku);
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
                    ac.pushQueue(this.searchComponent,[child,function(){
                        this.searchComponent.resolve(ac);
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
    
    private searchExpression(element:HTMLElement):void{
        if (UkuleleUtil.searchUkuExpTag(Selector.directText(element)) !== -1) {
            if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
                //normal expression
                dealWithExpression(element);
            }
        }
        for (let i = 0; i < element.children.length; i++) {
            this.searchExpression(element.children[i] as HTMLElement);
        }

        //处理绑定的expression
        function dealWithExpression(element) {
            //通常的花括号声明方式
            let expression = Selector.directText(element);
            if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
                let attr = expression.slice(2, -2);
                let controllerModel = this.defMgr.getControllerModelByName(attr);
                if (controllerModel) {
                    let boundItem = new BoundItemExpression(attr, expression, element, this.uku);
                    controllerModel.addBoundItem(boundItem);
                    boundItem.render(controllerModel.controllerInstance);
                }
            }
        }
    }

    //处理绑定的attribute
    private dealWithAttribute:Function = function(element, tagName) {
        let attr = element.getAttribute("uku-" + tagName);
        let elementName = element.tagName;
        let controllerModel = this.defMgr.getControllerModelByName(attr);
        if (controllerModel) {
            let boundItem = new BoundItemAttribute(attr, tagName, element, this.uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerModel.controllerInstance);
            elementChangedBinder(element, tagName, controllerModel, this.uku.refresh ,this.uku);
        }
    }

    //
    private dealWithInnerText(element) {
        let attr = element.getAttribute("uku-text");
        if (attr) {
            let controllerModel = this.defMgr.getControllerModelByName(attr);
            if (controllerModel) {
                let boundItem = new BoundItemInnerText(attr, element, this.uku);
                controllerModel.addBoundItem(boundItem);
                boundItem.render(controllerModel.controllerInstance);
            }
        }
    }


    //处理 事件 event
    private dealWithEvent(element, eventName) {
        let expression = element.getAttribute("uku-" + eventName);
        let eventNameInListener = eventName.substring(2);
        eventNameInListener = eventNameInListener.toLowerCase();
        let controllerModel = this.defMgr.getControllerModelByName(expression);
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
                this.defMgr.copyControllerInstance(controller, alias);
                this.defMgr.getBoundAttributeValue(expression, arguments);
                this.uku.refresh(alias, element);
            });
        }
    }
    //处理 repeat
    private dealWithRepeat(element){
        let repeatExpression = element.getAttribute("uku-repeat");
        let tempArr = repeatExpression.split(' in ');
        let itemName = tempArr[0];
        let attr = tempArr[1];
        let controllerModel = this.defMgr.getControllerModelByName(attr);
        if (controllerModel) {
            let controllerInst = controllerModel.controllerInstance;
            let boundItem = new BoundItemRepeat(attr, itemName, element, this.uku);
            controllerModel.addBoundItem(boundItem);
            boundItem.render(controllerInst);
        }
    }
}
