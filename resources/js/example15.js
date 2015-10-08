define("Example15Ctrl", function () {
    return function (uku) {
        this.obj = {
            "value": "initial value"
        };
        this.message = "";
        var self = this;

        var watchHandler = function (change) {
            self.message = change.name + " has been changed, old value is " + change.oldValue + " ,new value is " + self.obj[change.name];
            uku.refresh("ex15Ctrl");
        };
        this.addWatch = function () {
            uku.watch(self.obj, watchHandler);
        };
        this.removeWatch = function () {
            uku.unwatch(this.obj, watchHandler);
        };
    };
});