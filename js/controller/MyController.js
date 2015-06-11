/**
 * @author momoko
 */
function MyController() {
    this.images = [{"src":"images/detail1.jpg"},{"src":"images/detail2.jpg"},{"src":"images/detail3.jpg"}];
    
    
    this.myStyle = "myCSS";
    
    this.student = {
        "name": "momoko",
        "sex": "male"
    };
    this.yourname = "anyone";
    this.message = "welcome message here";
    var self = this;
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
        self.message = "Hi," + self.yourname;
    };
    this.itemName = undefined;
    this.addItem = function(){
        self.items.push({"name":self.itemName});
    }
    this.changeCSS = function(){
        self.myStyle = "myCSS2";
    }
}