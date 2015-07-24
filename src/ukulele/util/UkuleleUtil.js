function UkuleleUtil() {
	'use strict';
}

UkuleleUtil.getFinalAttribute = function(expression) {
	var temp = expression.split(".");
	var isParent = temp.shift();
	if (isParent === "parent") {
		return UkuleleUtil.getFinalAttribute(temp.join("."));
	}
	return temp.join(".");
};

UkuleleUtil.searchUkuAttrTag = function(htmlString) {
	var re = /^uku\-.*/;
	var index = htmlString.search(re);
	return index;
};

UkuleleUtil.searchUkuExpTag = function(expression) {
	var re = /^\{\{.*\}\}$/;
	var index = expression.search(re);
	return index;
};

UkuleleUtil.searchUkuFuncArg = function(htmlString) {
	var re = /\(.*\)$/;
	var index = htmlString.search(re);
	return index;
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

UkuleleUtil.getAttributeFinalValue = function(object, attrName) {
	var valueObject = UkuleleUtil.getAttributeFinalValueAndParent(object, attrName);
	var value = valueObject.value;
	return value;
};

UkuleleUtil.getAttributeFinalValueAndParent = function(object, attrName) {
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
		"value" : finalValue,
		"parent" : parentValue
	};
};

UkuleleUtil.getFinalValue = function(uku,object, attrName , additionalArgu) {
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
		var _arguments = attrName.substring(index + 1, attrName.length - 1);
		_arguments = _arguments.split(",");
		var new_arguments = [];
		for (var i = 0; i < _arguments.length; i++) {
			var temp;
			var argument = _arguments[i];
			var controllerModel = uku.getControllerModelByName(argument);
			if(controllerModel && controllerModel.controllerInstance){
				var agrumentInst = controllerModel.controllerInstance;			
				if (argument.split(".").length === 1) {
					temp = agrumentInst;
				} else {
					temp = UkuleleUtil.getFinalValue(uku,agrumentInst, argument);
				}
			}else{
				temp = UkuleleUtil.getFinalValue(uku,object, argument);
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
		if(additionalArgu){
			new_arguments.concat(additionalArgu);
		}
		finalValue = finalValue.apply(finalValueObject.parent, new_arguments);
		return finalValue;
	}
};
