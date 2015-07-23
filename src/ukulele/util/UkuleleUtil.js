function UkuleleUtil() {
	'use strict';
}
//一串对象属性引用表达式，去掉 parent 以及 control alias部分后剩下的内容
UkuleleUtil.getFinalAttribute = function(expression) {
	var temp = expression.split(".");
	var isParent = temp.shift();
	if(isParent === "parent"){		
		return UkuleleUtil.getFinalAttribute(temp.join("."));
	}
	return temp.join(".");
};
//检查字符串中是否有 uku- 字符出现
UkuleleUtil.searchUkuAttrTag = function(htmlString) {
	var re = /^uku\-.*/;
	var index = htmlString.search(re);
	return index;
};
//检测是否是一个由 {{}} 包裹的表达式
UkuleleUtil.searchUkuExpTag = function(expression) {
	var re = /^\{\{.*\}\}$/;
	var index = expression.search(re);
	return index;
};
//检测是否是一个函数格式  如  functionName()
UkuleleUtil.searchUkuFuncArg = function(htmlString) {
	var re = /\(.*\)$/;
	var index = htmlString.search(re);
	return index;
};
//element是否本身是一个 repeat
UkuleleUtil.isRepeat = function($element) {
	if ($element.attr("uku-repeat")) {
		return true;
	}
	return false;
};
//element是否在一个repeat循环体内
UkuleleUtil.isInRepeat = function($element) {
	var parents = $element.parents();
	for (var i = 0; i < parents.length; i++) {
		var parent = parents[i];
		var b = $(parent).attr("uku-repeat");
		if (b) {
			return true;
		}
	}
	return false;
};

UkuleleUtil.getBoundModelInstantName = function(expression) {
	var controlInstName = expression.split('.')[0];
	if (controlInstName) {
		return controlInstName;
	}
	return null;
};

UkuleleUtil.getAttributeFinalValue = function(object,attrName){
	var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object,attrName);
	var value = valueObject.value;
    return value;
};

UkuleleUtil.getAttributeFinalValueAndParent = function(object,attrName){
    var finalValue = object;
    var parentValue;
    attrName = UkuleleUtil.getFinalAttribute(attrName);
    var temp = attrName.split(".");
    if(attrName !== "" && finalValue){
        for (var i = 0; i < temp.length; i++) {
            var property = temp[i]; 
            parentValue = finalValue;
            finalValue = finalValue[property];
            if(finalValue === undefined || finalValue === null){
                break;
            }
        }
    }
    return {"value":finalValue,"parent":parentValue};
};

UkuleleUtil.getFinalValue = function(object,attrName){
    var re = /\(.*\)/;
    var index = attrName.search(re);
    if(index === -1){
        //is attribute
       return UkuleleUtil.getAttributeFinalValue(object,attrName);
    }else{
        //is function
        var functionName = attrName.substring(0,index);
        var finalValueObject = UkuleleUtil.getAttributeFinalValueAndParent(object,functionName);
        var finalValue = finalValueObject.value;
        if(finalValue === undefined){
        	return finalValue; 
        }
        var _arguments = attrName.substring(index+1,attrName.length-1);
        _arguments = _arguments.split(",");
        var new_arguments = [];
        for(var i=0;i<_arguments.length;i++){
            var argument = _arguments[i];
            var temp = UkuleleUtil.getFinalValue(object,argument);
            if(temp !== object){
                new_arguments.push(temp);
            }else{
               var re2 = /\'.*\'/;
               var index2 = argument.search(re2);
                if(index2 !== -1){
                    argument = argument.substring(1, argument.length - 1);
                }else{
                    var re3 = /\".*\"/;
                    var index3 = argument.search(re3);
                    if(index3 !== -1){
                        argument = argument.substring(1, argument.length - 1);
                    }
                }
                new_arguments.push(argument);
            }
            
        }
        finalValue = finalValue.apply(finalValueObject.parent,new_arguments);
        return finalValue;
    }
};
