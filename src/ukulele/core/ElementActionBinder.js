import {UkuleleUtil} from '../util/UkuleleUtil';
import {EventListener} from '../extend/EventListener';

function elementChangedBinder(element, tagName, controllerModel, handler, host) {
    let elementStrategies = [inputTextCase, textareaCase, selectCase, checkboxCase, radioCase];
    for (let i = 0; i < elementStrategies.length; i++) {
        let func = elementStrategies[i];
        let goon = func.apply(this, arguments);
        if (goon) {
            break;
        }
    }
}


function inputTextCase(element, tagName, controllerModel, handler, host) {
    let elementName = element.tagName;
    if (elementName === "INPUT" && isSupportInputType(element) && tagName === "value") {
        let eventType = 'change';
        let inputType = element.getAttribute('type');
        if(inputType === "text"){
            eventType = 'input';
        }
        EventListener.addEventListener(element,eventType,function(e){
            let attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            let temp = attr.split(".");
            let finalInstance = controllerModel.controllerInstance;
            for (let i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler.call(host,controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function isSupportInputType(element) {
    let type = element.getAttribute("type");
    if (type !== "checkbox" && type !== "radio") {
        return true;
    }
    return false;
}

function textareaCase(element, tagName, controllerModel, handler, host) {
    let elementName = element.tagName;
    if (elementName === "TEXTAREA" && tagName === "value") {
        EventListener.addEventListener(element,'input',function(e){
            let attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            let temp = attr.split(".");
            let finalInstance = controllerModel.controllerInstance;
            for (let i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler.call(host,controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function selectCase(element, tagName, controllerModel, handler, host) {
    let elementName = element.tagName;
    if ((elementName === "SELECT" && tagName === "selected")) {
        EventListener.addEventListener(element,'change',function(e){
            let attr = element.getAttribute("uku-" + tagName);
            let key;
            let tmpArr = attr.split("|");
            attr = tmpArr[0];
            key = tmpArr[1];
            attr = UkuleleUtil.getFinalAttribute(attr);
            let temp = attr.split(".");
            let finalInstance = controllerModel.controllerInstance;
            for (let i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }

            let options = Selector.querySelectorAll(element,"option");//element.querySelectorAll("option");
            for (let j = 0; j < options.length; j++) {
                let option = options[j];
                if (option.selected) {
                    let selectedItem = JSON.parse(option.getAttribute("data-item"));
                    finalInstance[temp[temp.length - 1]] = selectedItem;
                }
            }
            if (handler) {
                handler.call(host,controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function checkboxCase(element, tagName, controllerModel, handler, host) {
    let elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "value" && element.getAttribute("type") === "checkbox") {
        EventListener.addEventListener(element,'change',function(e){
            let attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            let temp = attr.split(".");
            let finalInstance = controllerModel.controllerInstance;
            for (let i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.checked;
            if (handler) {
                handler.call(host,controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function radioCase(element, tagName, controllerModel, handler, host) {
    let elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "selected" && element.getAttribute("type") === "radio") {
        EventListener.addEventListener(element,'change',function(e){
            let attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            let temp = attr.split(".");
            let finalInstance = controllerModel.controllerInstance;
            for (let i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            if (element.checked) {
                finalInstance[temp[temp.length - 1]] = element.value;
                if (handler) {
                    handler.call(host,controllerModel.alias, element);
                }
            }
        });
        return true;
    }
    return false;
}

export {elementChangedBinder};
