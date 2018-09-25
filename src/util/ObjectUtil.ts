export class ObjectUtil {
    static isArray(obj: Object): boolean {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    static getType(obj: any): string {
        let type: string = typeof (obj);
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

    static compare(objA: any, objB: any): boolean {
        let type: string = ObjectUtil.getType(objA);
        let typeB: string = ObjectUtil.getType(objB);
        let result: boolean = true;
        if (type !== typeB) {
            return false;
        } else {
            switch (type) {
                case "object":
                    if (objA === null && objB === null) {
                        result = true;
                    } else if (objA === null || objB === null) {
                        result = false;
                    } else {
                        let keys_a = Object.keys(objA);
                        let keys_b = Object.keys(objB);

                        if (keys_a.length != keys_b.length) {
                            result = false;
                        } else if (keys_a.length === 0 && keys_b.length === 0) {
                            result = true;
                        } else {
                            for (let key in objA) {
                                let valuA = objA[key];
                                let valuB = objB[key];
                                let isEqual: boolean = ObjectUtil.compare(valuA, valuB);
                                if (!isEqual) {
                                    result = false;
                                    break;
                                }
                            }
                        }
                    }
                    break;
                case "array":
                    if (objA.length === objB.length) {
                        for (let i = 0; i < objA.length; i++) {
                            let itemA = objA[i];
                            let itemB = objB[i];
                            let isEqual2: boolean = ObjectUtil.compare(itemA, itemB);
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
}
