import {Selector} from "../extend/Selector";
import {ArgumentUtil} from "./ArgumentUtil";
import {ComponentConfiguration} from "../model/ComponentConfiguration";
import {IUkulele} from "../core/IUkulele";
import {ControllerModel} from "../model/ControllerModel";
class ValueAndParent{
    value:any;
    parent:Object;
    constructor(_value:any,_parant:Object){
        this.value = _value;
        this.parent = _parant;
    }
}
export class UkuleleUtil{
    static getFinalAttribute(expression:string):string {
        let temp:Array<string> = expression.split(".");
        let isParent:string = temp.shift();
        if (isParent === "parent") {
            return UkuleleUtil.getFinalAttribute(temp.join("."));
        }
        return temp.join(".");
    }

    static searchHtmlTag(htmlString:string, tagName:string):number {
        let reTemp:string = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
        let re:RegExp = new RegExp(reTemp);
        let index:number = htmlString.search(re);
        return index;
    }

    static getInnerHtml(htmlString:string, tagName:string):string{
        let reTemp:string = "<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">";
        let re:RegExp = new RegExp(reTemp);
        let match:RegExpMatchArray = htmlString.match(re);
        if(match.index > -1){
            let matchString:string = match[0];
            let index:number = matchString.search(">");
            let tempString = matchString.substr(index+1);
            let index2:number = tempString.lastIndexOf("</");
            tempString = tempString.substring(0,index2);
            tempString = tempString.replace(/(^\s*)|(\s*$)/g, "");
            return tempString;
        }else{
            return null;
        }
    }

    static getComponentConfiguration(htmlString:string):ComponentConfiguration{
        let tempDom:HTMLElement = document.createElement("div");
        tempDom.innerHTML = htmlString;
        let tpl:NodeList = Selector.querySelectorAll(tempDom,"template");
        let scripts:NodeList = Selector.querySelectorAll(tempDom,"script");
        let stylesheet:NodeList = Selector.querySelectorAll(tempDom,"style");
        let deps:Array<string> = [];
        let ccs:string = null;
        for (let i = 0; i < scripts.length; i++) {
            let script:HTMLScriptElement = scripts[i] as HTMLScriptElement;
            if (script.src !== "") {
                deps.push(script.src);
            } else {
                ccs = script.innerHTML;
            }
        }
        if(stylesheet && stylesheet[0]){
            return new ComponentConfiguration((tpl[0] as HTMLElement).innerHTML,deps,ccs,(stylesheet[0] as HTMLElement).innerHTML);
        }else{
            return new ComponentConfiguration((tpl[0] as HTMLElement).innerHTML,deps,ccs);
        }
        
    }

    static searchUkuAttrTag(htmlString:string):number {
        let re:RegExp = /^uku\-.*/;
        let index:number = htmlString.search(re);
        return index;
    }

    static getAttrFromUkuTag(ukuTag:string, camelCase:boolean = false){
        if(UkuleleUtil.searchUkuAttrTag(ukuTag) === 0){
            ukuTag = ukuTag.replace('uku-','');
        }
        if(camelCase){
            let names:Array<string> = ukuTag.split('-');
            ukuTag = names[0];
            for(let i=1;i<names.length;i++){
                let firstLetter:string =  names[i].charAt(0).toUpperCase();
                ukuTag = ukuTag + firstLetter + names[i].substr(1);
            }
        }
        return ukuTag;
    }

    static searchUkuExpTag(expression:string):number {
        let re:RegExp = /^\{\{.*\}\}$/;
        let index:number = expression.search(re);
        return index;
    }

    static searchUkuFuncArg(htmlString:string):number {
        let re1:RegExp = /[\+\-\*\/\%\?\:\>\<]/;
        let index = htmlString.search(re1);
        if(index === -1){
            let re2:RegExp = /\(.*\)$/;
            index = htmlString.search(re2);
            return index;
        }else{
            return -1;
        }
    }

    static isRepeat(element:HTMLElement):boolean {
        if (element.getAttribute("uku-repeat")) {
            return true;
        }
        return false;
    }
    
    static isInRepeat(element:HTMLElement):boolean {
        let parents:Array<HTMLElement> = Selector.parents(element);
        for (let i = 0; i < parents.length; i++) {
            let parent:HTMLElement = parents[i] as HTMLElement;
            if(parent.nodeType !== 9){
                let b:string = parent.getAttribute("uku-repeat");
                if (b) {
                    return true;
                }
            }
        }
        return false;
    }

    static getBoundModelInstantName(expression:string):string {
        let controlInstName:string = expression.split('.')[0];
        if (controlInstName) {
            return controlInstName;
        }
        return undefined;
    }

    static getBoundModelInstantNames(controller_alias_list,expression):any{
        let arr = [];
        controller_alias_list.forEach(alias => {
            let pattern = new RegExp("\\b"+alias+"\\.","gm");
            if(expression.search(pattern) > -1){
                arr.push(alias);
            }
        });
        return arr;
    }
    static getAttributeFinalValue(object:Object, attrName:string):any {
        let valueObject:ValueAndParent = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
        let value:any = valueObject.value;
        return value;
    }
    
    static getAttributeFinalValueAndParent(object:any, attrName:string):ValueAndParent {
        let finalValue:any = object;
        let parentValue;
        if(typeof attrName === "string"){
            let attrValue:string = UkuleleUtil.getFinalAttribute(attrName);
            let temp = attrValue.split(".");
            if (attrValue !== "" && finalValue) {
                for (let i = 0; i < temp.length; i++) {
                    let property = temp[i];
                    parentValue = finalValue;
                    finalValue = finalValue[property];
                    if (finalValue === undefined || finalValue === null) {
                        break;
                    }
                }
            }else{
                if(object.hasOwnProperty("_alias") && object._alias === attrName){
                    finalValue = object;
                }else{
                    finalValue = attrName;
                }
            }
        }
        return new ValueAndParent(finalValue,parentValue);
    }

    static getFinalValue(uku:IUkulele, objects:Object[], attrName:string, ...additionalArgu){
       return (function(){
           var tempScope = {};
           objects.forEach( object => {
               tempScope[object['_alias']] = object;
               let pattern = new RegExp("\\b"+object['_alias']+"\\.","gm");
               attrName = attrName.replace(pattern,"tempScope."+object['_alias']+".");
           });
           
           var result = eval(attrName);
           tempScope = null;
           return result;
       })();
    }
    /*static getFinalValue(uku:IUkulele, object:Object, attrName:string, ...additionalArgu) { 
        let index:number = -1;
        if(typeof attrName === "string"){
            index = UkuleleUtil.searchUkuFuncArg(attrName);
        }
        if (index === -1) {
            //is attribute
            return UkuleleUtil.getAttributeFinalValue(object, attrName);
        } else {
            //is function
            let functionName = attrName.substring(0, index);
            let finalValueObject:ValueAndParent = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
            let finalValue = finalValueObject.value;
            if (finalValue === undefined) {
                return finalValue;
            }
            let new_arguments = [];
            let _argumentsString:string = attrName.substring(index + 1, attrName.length - 1);
            if (_argumentsString !== "") {
                let _arguments:Array<any> = ArgumentUtil.analyze(_argumentsString, uku);
                for (let i = 0; i < _arguments.length; i++) {
                    let temp:any;
                    let argument:any = _arguments[i];
                    let argType:string = typeof argument;
                    let controllerModel:ControllerModel = null;
                    if(argType === "string"){
                        controllerModel = uku._internal_getDefinitionManager().getControllerModelByName(argument);
                        if (controllerModel && controllerModel.controllerInstance) {
                            let agrumentInst:Object = controllerModel.controllerInstance;
                            if (argument.split(".").length === 1) {
                                temp = agrumentInst;
                            } else {
                                temp = UkuleleUtil.getFinalValue(uku, agrumentInst, argument);
                            }
                        } else {
                            temp = UkuleleUtil.getFinalValue(uku, object, argument);
                        }
                        new_arguments.push(temp);
                    }else{
                        new_arguments.push(argument);
                    }
                }
            }

            if (additionalArgu) {
                let additionalArguArray = Array.prototype.slice.call(additionalArgu);
                new_arguments = new_arguments.concat(additionalArguArray);
            }
            finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
            return finalValue;
        }
    } */
}
