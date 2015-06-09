function ObjectUtil() {

}

ObjectUtil.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}
ObjectUtil.getType = function (obj) {
    var type = typeof(obj);
    if(type === "object"){
        if(ObjectUtil.isArray(obj)){
            return "array";
        }else{
            return type;
        }
    }else{
        return type;
    }
}

ObjectUtil.compare = function (objA,objB) {
    var type = ObjectUtil.getType(objA);
    var typeB = ObjectUtil.getType(objB);
    var result = true;
    if(type !== typeB){
        return false;
    }else{
        switch(type){
            case "object":
                for(var key in objA){
                    var itemA = objA[key];
                    var itemB = objB[key];
                    var isEqual = ObjectUtil.compare(itemA,itemB);
                    if(!isEqual){
                        result = false;
                        break;
                    }
                }
                break;
            case "array":
                if(objA.length === objB.length){
                    for(var i=0;i<objA.length;i++){
                        var itemA = objA[i];
                        var itemB = objB[i];
                        var isEqual = ObjectUtil.compare(itemA,itemB);
                        if(!isEqual){
                            result = false;
                            break;
                        }
                    }
                }else{
                    result = false;
                }
                break;
            case "function":
                result = objA.toString() === objB.toString();
                break;
            default:
                result = objA === objB;
                break;
        }
    }
    return result;
}