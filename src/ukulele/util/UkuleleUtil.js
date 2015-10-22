function UkuleleUtil() {
    'use strict';
}
//一张1x1像素的png转成base64来解决绑定的src暂时无值的问题
/*UkuleleUtil.blankImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wkPAw8vVMDpsgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC";*/

//一串对象属性引用表达式，去掉 parent 以及 control alias部分后剩下的内容，如parent.myCtrl.username -> username / myCtrl.username -> username
UkuleleUtil.getFinalAttribute = function (expression) {
    var temp = expression.split(".");
    var isParent = temp.shift();
    if (isParent === "parent") {
        return UkuleleUtil.getFinalAttribute(temp.join("."));
    }
    return temp.join(".");
};
//检查字符串是否以 '<xx '开始并以 ' /xx>' 结束
UkuleleUtil.searchHtmlTag = function (htmlString, tagName) {
    var reTemp = "^<" + tagName + "\\s[\\s\\S]*</" + tagName + ">$";
    var re = new RegExp(reTemp);
    var index = htmlString.search(re);
    return index;
};

//检查字符串是否以 引号' " '开始并以 引号' " ' 结束
UkuleleUtil.isStringArgument = function (htmlString, tagName) {
    var re1 = /^"[\s\S]*"$/;
    var index = htmlString.search(re1);
    var re2 = /^'[\s\S]*'$/;
    if(index === 0){
        return true;
    }else{
        var index2 = htmlString.search(re2);
        if(index2 === 0){
            return true;
        }
    }
    return false;
};
//检查字符串中是否有 uku- 字符出现
UkuleleUtil.searchUkuAttrTag = function (htmlString) {
    var re = /^uku\-.*/;
    var index = htmlString.search(re);
    return index;
};
//检测是否是一个由 {{}} 包裹的表达式
UkuleleUtil.searchUkuExpTag = function (expression) {
    var re = /^\{\{.*\}\}$/;
    var index = expression.search(re);
    return index;
};
//检测是否是一个函数格式, 如  functionName()
UkuleleUtil.searchUkuFuncArg = function (htmlString) {
    var re = /\(.*\)$/;
    var index = htmlString.search(re);
    return index;
};
//element是否本身是一个 repeat
UkuleleUtil.isRepeat = function (element) {
    if (element.getAttribute("uku-repeat")) {
        return true;
    }
    return false;
};
//element是否在一个repeat循环体内
UkuleleUtil.isInRepeat = function (element) {
    var parents = Selector.parents(element);
    for (var i = 0; i < parents.length; i++) {
        var parent = parents[i];
        var b = parent.getAttribute("uku-repeat");
        if (b) {
            return true;
        }
    }
    return false;
};
//获取表达式中 Controller的alias ，如 myCtrl.username -> myCtrl
UkuleleUtil.getBoundModelInstantName = function (expression) {
    var controlInstName = expression.split('.')[0];
    if (controlInstName) {
        return controlInstName;
    }
    return null;
};

UkuleleUtil.getAttributeFinalValue = function (object, attrName) {
    var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
    var value = valueObject.value;
    return value;
};

//根据attrname，获取object中的具体某个属性值，如 从user对象中 获取  address.city.name
UkuleleUtil.getAttributeFinalValueAndParent = function (object, attrName) {
    var finalValue = object;
    var parentValue;
    attrName = UkuleleUtil.getFinalAttribute(attrName);
    var temp = attrName.split(".");
    if (attrName !== "" && finalValue) {
        for (var i = 0; i < temp.length; i++) {
            var property = temp[i];
            parentValue = finalValue;
            finalValue = finalValue[property];
            if (finalValue === undefined || finalValue === null) {
                break;
            }
        }
    }
    return {
        "value": finalValue,
        "parent": parentValue
    };
};

UkuleleUtil.getFinalValue = function (uku, object, attrName, additionalArgu) {
    var index = UkuleleUtil.searchUkuFuncArg(attrName);
    if (index === -1) {
        //is attribute
        return UkuleleUtil.getAttributeFinalValue(object, attrName);
    } else {
        //is function
        var functionName = attrName.substring(0, index);
        var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, functionName);
        var finalValue = finalValueObject.value;
        if (finalValue === undefined) {
            return finalValue;
        }
        var new_arguments = [];
        var _arguments = attrName.substring(index + 1, attrName.length - 1);
        if (_arguments !== "") {
            var isStringArg = UkuleleUtil.isStringArgument(_arguments);
            if(isStringArg){
                _arguments = [_arguments];
            }else{
                _arguments = _arguments.split(",");
            }
            
            for (var i = 0; i < _arguments.length; i++) {
                var temp;
                var argument = _arguments[i];
                var controllerModel = uku.getControllerModelByName(argument);
                if (controllerModel && controllerModel.controllerInstance) {
                    var agrumentInst = controllerModel.controllerInstance;
                    if (argument.split(".").length === 1) {
                        temp = agrumentInst;
                    } else {
                        temp = UkuleleUtil.getFinalValue(uku, agrumentInst, argument);
                    }
                } else {
                    temp = UkuleleUtil.getFinalValue(uku, object, argument);
                }
                if (temp !== object) {
                    new_arguments.push(temp);
                } else {
                    var re2 = /\'.*\'/;
                    var index2 = argument.search(re2);
                    var re3 = /\".*\"/;
                    var index3 = argument.search(re3);
                    if (index2 !== -1) {
                        argument = argument.substring(1, argument.length - 1);
                        new_arguments.push(argument);
                    } else if (index3 !== -1) {
                        argument = argument.substring(1, argument.length - 1);
                        new_arguments.push(argument);
                    } else {
                        new_arguments.push(temp);
                    }
                }
            }
        }

        if (additionalArgu) {
            var additionalArguArray = Array.prototype.slice.call(additionalArgu);
            new_arguments = new_arguments.concat(additionalArguArray);
        }
        finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
        return finalValue;
    }
};