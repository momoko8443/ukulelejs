define("Example05Ctrl", function () {
    return function () {
        this.child = new Child();

        function Child() {
            this.name = "child";
            this.say = function () {
                return "Hi, " + this.name;
            };
        }
    };
});