import {Selector} from "../extend/Selector";
import {ArgumentUtil} from "./ArgumentUtil";
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
            console.log(tempString);
            return tempString;
        }else{
            return null;
        }
    }

    static getComponentConfiguration(htmlString:string) {
        let tempDom:HTMLElement = document.createElement("div");
        tempDom.innerHTML = htmlString;
        let tpl:NodeList = Selector.querySelectorAll(tempDom,"template");
        let scripts:NodeList = Selector.querySelectorAll(tempDom,"script");
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
        return {
            template: (tpl[0] as HTMLElement).innerHTML,
            dependentScripts: deps,
            componentControllerScript: ccs
        };
    }

    static searchUkuAttrTag(htmlString:string):number {
        let re:RegExp = /^uku\-.*/;
        let index:number = htmlString.search(re);
        return index;
    }

    static getAttrFromUkuTag(ukuTag:string, camelCase:boolean){
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

    static searchUkuExpTag(expression):number {
        let re:RegExp = /^\{\{.*\}\}$/;
        let index:number = expression.search(re);
        return index;
    }

    static searchUkuFuncArg(htmlString):number {
        let re:RegExp = /\(.*\)$/;
        let index:number = htmlString.search(re);
        return index;
    }

    static isRepeat(element:HTMLElement):boolean {
        if (element.getAttribute("uku-repeat")) {
            return true;
        }
        return false;
    }
    //todo typescript
    static isInRepeat(element:HTMLElement):boolean {
        let parents = Selector.parents(element);
        for (let i = 0; i < parents.length; i++) {
            let parent = parents[i];
            if(parent.nodeType !== 9){
                let b = parent.getAttribute("uku-repeat");
                if (b) {
                    return true;
                }
            }
        }
        return false;
    }

    static getBoundModelInstantName(expression):string {
        let controlInstName:string = expression.split('.')[0];
        if (controlInstName) {
            return controlInstName;
        }
        return null;
    }

    static getAttributeFinalValue(object:Object, attrName:string):any {
        let valueObject:any = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
        let value:any = valueObject.value;
        return value;
    }
    //todo typescript
    static getAttributeFinalValueAndParent(object:any, attrName:string):any {
        let finalValue:Object = object;
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
        return {
            "value": finalValue,
            "parent": parentValue
        };
    }

    static getFinalValue(uku, object, attrName, additionalArgu?) {
        let index = -1;
        if(typeof attrName === "string"){
            index = UkuleleUtil.searchUkuFuncArg(attrName);
        }
        if (index === -1) {
            //is attribute
            return UkuleleUtil.getAttributeFinalValue(object, attrName);
        } else {
            //is function
            let functionName = attrName.substring(0, index);
            let finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
            let finalValue = finalValueObject.value;
            if (finalValue === undefined) {
                return finalValue;
            }
            let new_arguments = [];
            let _arguments = attrName.substring(index + 1, attrName.length - 1);
            if (_arguments !== "") {
                _arguments = ArgumentUtil.analyze(_arguments, uku);
                for (let i = 0; i < _arguments.length; i++) {
                    let temp;
                    let argument = _arguments[i];
                    let argType = typeof argument;
                    let controllerModel = null;
                    if(argType === "string"){
                        controllerModel = uku._internal_getDefinitionManager().getControllerModelByName(argument);
                        if (controllerModel && controllerModel.controllerInstance) {
                            let agrumentInst = controllerModel.controllerInstance;
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
    }
}
