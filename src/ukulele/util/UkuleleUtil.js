function UkuleleUtil() {
	'use strict';
}

UkuleleUtil.getFinalAttribute = function(expression) {
	var temp = expression.split(".");
	temp.shift();
	return temp.join(".");
};

UkuleleUtil.isRepeat = function($element) {
	if ($element.attr("uku-repeat")) {
		return true;
	}
	return false;
};

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
    return UkuleleUtil.getAttributeFinalValue2(object,attrName).value;
};

UkuleleUtil.getAttributeFinalValue2 = function(object,attrName){
    var finalValue = object;
    var parentValue;
    var temp = attrName.split(".");

    if(finalValue){
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
        var finalValueObject = UkuleleUtil.getAttributeFinalValue2(object,functionName);
        var finalValue = finalValueObject.value;
        var _arguments = attrName.substring(index+1,attrName.length-1);
        _arguments = _arguments.split(",");
        var new_arguments = [];
        for(var i=0;i<_arguments.length;i++){
            var argument = _arguments[i];
            var temp = UkuleleUtil.getFinalValue(object,argument);
            new_arguments.push(temp);
        }
        finalValue = finalValue.apply(finalValueObject.parent,new_arguments);
        return finalValue;
    }
};
