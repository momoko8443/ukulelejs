define("Example09Ctrl", function () {
    return function (uku) {
        this.syncData = "will show json from sync request";
        var self = this;
        this.callSync = function () {
            $.get("resources/data/data.json", function (data, status) {
                self.syncData = data.name;
                uku.refresh("ex09Ctrl"); //you can use "uku.refresh(['myCtrl','myCtrl2'])" to refresh multiple controllers.
            });
        };
    };
});