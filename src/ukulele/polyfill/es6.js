/* jshint loopfunc:true */
var observeList = {};
if (!Object.hasOwnProperty("observe")) {
    if (!Object.hasOwnProperty("defineProperty")) {
        console.error("Current browser can't support this site.");
    } else {
        Object.observe = function (obj, callback) {
            for (var key in obj) {
                var oldValue = obj[key];
                obj['_' + key] = obj[key];
                if (obj.hasOwnProperty(key)) {
                    (function (o, k) {
                        Object.defineProperty(obj, '_' + k, {
                            writable: false
                        });
                    })(obj, key);
                    (function (o, k, old) {
                        Object.defineProperty(obj, k, {
                            get: function () {
                                return obj['_' + k];
                            },
                            set: function (value) {
                                this['_' + k] = value;
                                var change = {
                                    "name": k,
                                    "object": this,
                                    "type": "update",
                                    "oldValue": old
                                };
                                callback.call(null, [change]);
                            }
                        });
                    })(obj, key, oldValue);
                }
            }
            observeList[observeList] = true;
        };
    }

}

if (!Object.hasOwnProperty("unobserve")) {
    if (!Object.hasOwnProperty("defineProperty")) {
        console.error("Current browser can't support this site.");
    } else {
        Object.unobserve = function (obj, callback) {
            if (observeList[obj]) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (key.search('_') === -1) {
                            delete obj[key];
                            obj[key] = obj['_' + key];
                            delete obj['_' + key];
                        }
                    }
                }
                delete observeList[obj];
                callback();
            }
        };
    }
}