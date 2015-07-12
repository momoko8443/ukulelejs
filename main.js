require.config({
    paths: {
        "jquery": 'bower_components/jquery/dist/jquery.min',
        "jquery.bootstrap": 'bower_components/bootstrap/dist/js/bootstrap.min',
        "ukulele": 'build/js/ukulele',
        "highlight": 'bower_components/highlightjs/highlight.pack'        
    },
    shim:{
    	
		"ukulele":{
					deps:["jquery"],
					exports:"Ukulele"
				},	
    	"jquery.bootstrap":{
    		deps:["jquery"]
    	}
    }
});

require(["jquery","ukulele","jquery.bootstrap","highlight"], function($,Ukulele) {
    // todo
    function MyController() {
		this.message = "";
		this.myName = "please input your name";
		this.sayHello = function() {
			alert(this.myName);
		};
		this.sayHelloWithArgument = function(name) {
			alert("Hi," + name);
		};

		this.sayHelloWithInstanceArgument = function(instance) {
			alert("Hi," + instance.name);
		};

		this.sayHelloWith2Argument = function(name, name2) {
			alert("Hi," + name + " and " + name2);
		};

		this.add = function(num1, num2) {
			var sum = num1 + num2;
			return sum;
		};
		this.items = [
			{
				"name" : "Kamaka HF-1",
				"imgUrl": "example/images/hf1.jpg",
				"subModels" : [{"name" : "HF-1 basical version"},{"name" : "HF-1 with pickup"}]
			}, {
				"name" : "Kamaka HF-2",
				"imgUrl": "example/images/hf2.jpg",
				"subModels" : [{"name" : "HF-2 basical version"},{"name" : "HF-2 with pickup"}]
			}, {
				"name" : "Kamaka HF-3",
				"imgUrl": "example/images/hf3.jpg",
				"subModels" : [{"name" : "HF-3 basical version"},{"name" : "HF-3 with pickup"}]
			}];
		this.child = new Child();
		this.numA = 2;
		this.numB = 3;
		this.syncData = "will show json from sync request";
		var self = this;
		this.callSync = function(){
			$.get("resources/data/data.json",function(data,status){
				self.syncData = data.name;
				uku.refresh();
			});
		};
		 
		this.options = [
			{"name":"Kamaka","value":"kamaka","children":[
				{"name":"HF1"},{"name":"HF2"},{"name":"HF3"}
			]},
			{"name":"Koaloha","value":"koaloha","children":[
				{"name":"KSM"},{"name":"KCM"},{"name":"KTM"}
			]},
			{"name":"Kanilea","value":"kanilea","children":[
				{"name":"K1S"},{"name":"K2C"},{"name":"K1T"}
			]},
			{"name":"Koolau ","value":"koolau","children":[
				{"name":"CS Tenor"},{"name":"Model 100"},{"name":"Tenor Deluxe"}
			]}
		];
		this.selectedOption = this.options[2];
		this.selectedChildOption = this.selectedOption.children[0];
		
		this.selectedOptionChanged = function(){
			this.selectedChildOption = this.selectedOption.children[0];	
			uku.refresh();
		};
	}

	function Child() {
		this.name = undefined;
		this.say = function() {
			return "Hi, " + this.name;
		};
	}

	var ishljsInitial = false;
	var uku;
	$(document).ready(function() {
		uku = new Ukulele();
		uku.registerController("myCtrl", new MyController());
		uku.init();
		uku.refreshHandler = function(){
			if(!ishljsInitial){
				$('pre code').each(function(i, block) {
				    hljs.highlightBlock(block);
				});
				ishljsInitial = true;
			}			
		};
	});
});