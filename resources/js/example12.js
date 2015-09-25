define("Example12Ctrl", function () {
    return function (uku) {
        this.isShown = true;
        this.hideStyle = "display:block";
        this.showHideFunction = function () {
            if (!this.isShown) {
                this.hideStyle = "display:none";
            } else {
                this.hideStyle = "display:block";
            }
        };

        this.classList = ["class1"].join(" ");
        this.addClass = function () {
            this.classList = ["class1", "class2"].join(" ");
        };
        this.removeClass = function () {
            this.classList = ["class1"].join(" ");
        };
    };
});