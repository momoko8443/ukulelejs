define("Example06Ctrl", function () {
    return function () {
        this.numA = 2;
        this.numB = 3;
        this.myName = "ukulelejs";
        this.add = function (num1, num2) {
            var sum = num1 + num2;
            return sum;
        };
        this.showInfo = function (object) {
            return object.myName;
        };
        
        this.showString = function (str) {
            return str;
        };
    };
});