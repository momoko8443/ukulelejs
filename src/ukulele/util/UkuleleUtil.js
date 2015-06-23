function UkuleleUtil() {
    'use strict';
}

UkuleleUtil.getFinalAttribute = function (expression){
    var temp = expression.split(".");
    temp.shift();
    return temp.join(".");
};