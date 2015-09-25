define("Example07Ctrl", function () {
    return function () {
        this.myName = "ukulelejs";
        this.onInclueElementLoaded = function (e) {
            var myBtn = document.getElementById("myBtn");
            myBtn.style.fontSize = "14pt";
        };
    };
});