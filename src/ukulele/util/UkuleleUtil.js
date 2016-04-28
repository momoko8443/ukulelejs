import {Selector} from '../extend/Selector';

export class UkuleleUtil{
    static getFinalAttribute(expression) {
        let temp = expression.split(".");
        let isParent = temp.shift();
        if (isParent === "parent") {
            return UkuleleUtil.getFinalAttribute(temp.join("."));
        }
        return temp.join(".");
    }

    static searchHtmlTag(htmlString, tagName) {
        let reTemp = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
        let re = new RegExp(reTemp);
        let index = htmlString.search(re);
        return index;
    }

    static getInnerHtml(htmlString, tagName) {
        let reTemp = "<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">";
        let re = new RegExp(reTemp);
        let match = htmlString.match(re);
        if(match.index > -1){
            let matchString = match[0];
            let index = matchString.search(">");
            let tempString = matchString.substr(index+1);
            let index2 = tempString.lastIndexOf("</");
            tempString = tempString.substring(0,index2);
            tempString = tempString.replace(/(^\s*)|(\s*$)/g, "");
            console.log(tempString);
            return tempString;
        }else{
            return null;
        }
    }

    static getComponentConfiguration(htmlString) {
        let tempDom = document.createElement("div");
        tempDom.innerHTML = htmlString;
        let tpl = Selector.querySelectorAll(tempDom,"template");
        let scripts = Selector.querySelectorAll(tempDom,"script");
        let deps = [];
        let ccs = null;
        for (let i = 0; i < scripts.length; i++) {
            let script = scripts[i];
            if (script.src !== "") {
                deps.push(script.src);
            } else {
                ccs = script.innerHTML;
            }
        }
        return {
            template: tpl[0].innerHTML,
            dependentScripts: deps,
            componentControllerScript: ccs
        };
    }

    static searchUkuAttrTag(htmlString) {
        let re = /^uku\-.*/;
        let index = htmlString.search(re);
        return index;
    }

    static getAttrFromUkuTag(ukuTag, camelCase){
        if(UkuleleUtil.searchUkuAttrTag(ukuTag) === 0){
            ukuTag = ukuTag.replace('uku-','');
        }
        if(camelCase){
            let names = ukuTag.split('-');
            ukuTag = names[0];
            for(let i=1;i<names.length;i++){
                let firstLetter =  names[i].charAt(0).toUpperCase();
                ukuTag = ukuTag + firstLetter + names[i].substr(1);
            }
        }
        return ukuTag;
    }

    static searchUkuExpTag(expression) {
        let re = /^\{\{.*\}\}$/;
        let index = expression.search(re);
        return index;
    }

    static searchUkuFuncArg(htmlString) {
        let re = /\(.*\)$/;
        let index = htmlString.search(re);
        return index;
    }

    static isRepeat(element) {
        if (element.getAttribute("uku-repeat")) {
            return true;
        }
        return false;
    }

    static isInRepeat(element) {
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

    static getBoundModelInstantName(expression) {
        let controlInstName = expression.split('.')[0];
        if (controlInstName) {
            return controlInstName;
        }
        return null;
    }

    static getAttributeFinalValue(object, attrName) {
        let valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
        let value = valueObject.value;
        return value;
    }

    static getAttributeFinalValueAndParent(object, attrName) {
        let finalValue = object;
        let parentValue;
        if(typeof attrName === "string"){
            let attrValue = UkuleleUtil.getFinalAttribute(attrName);
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

    static getFinalValue(uku, object, attrName, additionalArgu) {
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
