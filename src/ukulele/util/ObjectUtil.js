export class ObjectUtil{
    static isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    static getType(obj) {
        let type = typeof (obj);
        if (type === "object") {
            if (ObjectUtil.isArray(obj)) {
                return "array";
            } else {
                return type;
            }
        } else {
            return type;
        }
    }

    static compare(objA, objB) {
        let type = ObjectUtil.getType(objA);
        let typeB = ObjectUtil.getType(objB);
        let result = true;
        if (type !== typeB) {
            return false;
        } else {
            switch (type) {
            case "object":
                for (let key in objA) {
                    let valuA = objA[key];
                    let valuB = objB[key];
                    let isEqual = ObjectUtil.compare(valuA, valuB);
                    if (!isEqual) {
                        result = false;
                        break;
                    }
                }
                break;
            case "array":
                if (objA.length === objB.length) {
                    for (let i = 0; i < objA.length; i++) {
                        let itemA = objA[i];
                        let itemB = objB[i];
                        let isEqual2 = ObjectUtil.compare(itemA, itemB);
                        if (!isEqual2) {
                            result = false;
                            break;
                        }
                    }
                } else {
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

    static deepClone(obj) {
        let o, i, j, k;
        if (typeof (obj) !== "object" || obj === null) {
            return obj;
        }
        if (obj instanceof(Array)) {
            o = [];
            i = 0;
            j = obj.length;
            for (; i < j; i++) {
                if (typeof (obj[i]) === "object" && obj[i] !== null) {
                    o[i] = arguments.callee(obj[i]);
                } else {
                    o[i] = obj[i];
                }
            }
        } else {
            o = {};
            for (i in obj) {
                if (typeof (obj[i]) === "object" && obj[i] !== null && i !== "_dom") {
                    o[i] = arguments.callee(obj[i]);
                } else {
                    o[i] = obj[i];
                }
            }
        }

        return o;
    }
}
