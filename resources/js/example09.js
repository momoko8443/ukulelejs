define("Example09Ctrl", function () {
    return function (uku) {
        this.asyncData = "will show json from async request";
        var self = this;
        this.callAsync = function () {
            $.get("resources/data/data.json", function (data, status) {
                self.asyncData = data.name;
                uku.refresh("ex09Ctrl"); //you can use "uku.refresh(['myCtrl','myCtrl2'])" to refresh multiple controllers.
            });
        };
    };
});