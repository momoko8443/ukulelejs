import {UkuleleUtil} from '../util/UkuleleUtil';
import {EventListener} from '../extend/EventListener';
import {Selector} from '../extend/Selector';

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
        EventListener.addEventListener(element,eventType,(e)=>{
            let attr = element.getAttribute("uku-" + tagName);
            UkuleleUtil.setFinalValue(controllerModel.controllerInstance,attr,element.value);
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
            UkuleleUtil.setFinalValue(controllerModel.controllerInstance,attr,element.value);
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

            let options = Selector.querySelectorAll(element,"option");
            for (let j = 0; j < options.length; j++) {
                let option:HTMLOptionElement = options[j] as HTMLOptionElement;
                if (option.selected) {
                    let selectedItem = JSON.parse(option.getAttribute("data-item"));
                    UkuleleUtil.setFinalValue(controllerModel.controllerInstance,attr,selectedItem);
                    
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
            
            UkuleleUtil.setFinalValue(controllerModel.controllerInstance,attr,element.checked);
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
            
            if (element.checked) {
                UkuleleUtil.setFinalValue(controllerModel.controllerInstance,attr,element.value);
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
