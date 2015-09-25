define("Example08Ctrl", function () {
    return function () {
        this.myName = "ukulelejs";
        this.items = [
            {
                "name": "Kamaka HF-1",
                "imgUrl": "pages/example/images/hf1.jpg",
                "subModels": [{
                    "name": "HF-1 basical version"
                }, {
                    "name": "HF-1 with pickup"
                }]
	}, {
                "name": "Kamaka HF-2",
                "imgUrl": "pages/example/images/hf2.jpg",
                "subModels": [{
                    "name": "HF-2 basical version"
                }, {
                    "name": "HF-2 with pickup"
                }]
	}, {
                "name": "Kamaka HF-3",
                "imgUrl": "pages/example/images/hf3.jpg",
                "subModels": [{
                    "name": "HF-3 basical version"
                }, {
                    "name": "HF-3 with pickup"
                }]
	}];
        this.sayHelloWithInstanceArgument = function (instance) {
            alert("Hi," + instance.name);
        };

        this.sayHelloWith2Argument = function (name, name2) {
            alert("Hi," + name + " and " + name2);
        };
    };
});