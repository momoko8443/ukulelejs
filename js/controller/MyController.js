/**
 * @author momoko
 */
function MyController() {
    this.student = {
        "name": "momoko",
        "sex": "male"
    };
    this.yourname = "anyone";
    this.message = "welcome message here";
    this.items = [{
        "name": "AAA",
        "children": [{
            "child": "child1"
        }, {
            "child": "child2"
        }]
    }, {
        "name": "BBB",
        "children": [{
            "child": "child3"
        }, {
            "child": "child4"
        }]
    }, {
        "name": "CCC",
        "children": [{
            "child": "child5"
        }, {
            "child": "child6"
        }]
    }];
    this.sayHello = function () {
        this.message = "Hi," + this.yourname;
    };
}