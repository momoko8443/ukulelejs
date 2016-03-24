function elementChangedBinder(element, tagName, controllerModel, handler) {
    var elementStrategies = [inputTextCase, textareaCase, selectCase, checkboxCase, radioCase];
    for (var i = 0; i < elementStrategies.length; i++) {
        var func = elementStrategies[i];
        var goon = func.apply(this, arguments);
        if (goon) {
            break;
        }
    }
}


function inputTextCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if (elementName === "INPUT" && isSupportInputType(element) && tagName === "value") {
        var eventType = 'change';
        var inputType = element.getAttribute('type');
        if(inputType === "text"){
            eventType = 'input';
        }
        EventListener.addEventListener(element,eventType,function(e){
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function isSupportInputType(element) {
    var type = element.getAttribute("type");
    if (type !== "checkbox" && type !== "radio") {
        return true;
    }
    return false;
}

function textareaCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if (elementName === "TEXTAREA" && tagName === "value") {
        EventListener.addEventListener(element,'input',function(e){
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.value;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function selectCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;
    if ((elementName === "SELECT" && tagName === "selected")) {
        EventListener.addEventListener(element,'change',function(e){
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

            var options = Selector.querySelectorAll(element,"option");//element.querySelectorAll("option");
            for (var j = 0; j < options.length; j++) {
                var option = options[j];
                if (option.selected) {
                    var selectedItem = JSON.parse(option.getAttribute("data-item"));
                    finalInstance[temp[temp.length - 1]] = selectedItem;
                }
            }
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function checkboxCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "value" && element.getAttribute("type") === "checkbox") {
        EventListener.addEventListener(element,'change',function(e){
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            finalInstance[temp[temp.length - 1]] = element.checked;
            if (handler) {
                handler(controllerModel.alias, element);
            }
        });
        return true;
    }
    return false;
}

function radioCase(element, tagName, controllerModel, handler) {
    var elementName = element.tagName;

    if (elementName === "INPUT" && tagName === "selected" && element.getAttribute("type") === "radio") {
        EventListener.addEventListener(element,'change',function(e){
            var attr = element.getAttribute("uku-" + tagName);
            attr = UkuleleUtil.getFinalAttribute(attr);
            var temp = attr.split(".");
            var finalInstance = controllerModel.controllerInstance;
            for (var i = 0; i < temp.length - 1; i++) {
                finalInstance = finalInstance[temp[i]];
            }
            if (element.checked) {
                finalInstance[temp[temp.length - 1]] = element.value;
                if (handler) {
                    handler(controllerModel.alias, element);
                }
            }
        });
        return true;
    }
    return false;
}
