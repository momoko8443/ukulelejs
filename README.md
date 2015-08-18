# Install UkuleleJS
```
$npm install -g bower
bower install ukulelejs
```
# Getting Start
## Native Way
**Import jquery library before ukulelejs**
```html
<head>
	...
	<script type="text/javascript" src="jquery/dist/jquery.min.js"></script>
	<script type="text/javascript" src="ukulelejs/dist/ukulele.min.js"></script>
	...
<head/>
```

**Add 'uku-application' as an attribute to any html tags, then ukulelejs will control whole this tag**

```html
<body uku-application>
	...
</body>	
```
Initialize ukulelejs and register Controller in the $(document).ready's callback function
```javascript
$(document).ready(function() {
	var uku = new Ukulele();
	uku.registerController("myCtrl", new MyController());
	uku.init();
});
function MyController() {
	this.message = "";
	....
}
```
**Bind any html attribute to your model, just add 'uku-' + attribute's name, using {{}} to show model's value**
```html
<body uku-application>
	...
	<input type="text" uku-value="myCtrl.message">
	<h3>{{myCtrl.message}}<h3/>
	...
</body>	
```

***
## AMD Way
**RequireJS's configuration**
```javascript
require.config({
    paths: {
        "jquery": 'bower_components/jquery/dist/jquery.min',
        "ukulele": 'build/js/ukulele'
    },
    shim:{  	
		"ukulele":{
			deps:["jquery"],
			exports:"Ukulele"
		}
    }
});
```
**Add 'uku-application' as an attribute to any html tags, then ukulelejs will control whole this tag**
```html
<body uku-application>
	...
</body>
```
**Initialize ukulelejs and register Controller in the $(document).ready's callback function**
```javascript
require(["jquery","ukulele","MyController"], function($,Ukulele,MyController) {
	var uku;
	$(document).ready(function() {
		uku = new Ukulele();
		uku.registerController("myCtrl", new MyController(uku));
		uku.init();
	});

});
define("MyController",function(){
	return function() {
		this.message = "";
		...
	};
});
```
**Bind any html attribute to your model, just add 'uku-' + attribute's name, using {{}} to show model's value**
```html
<body uku-application>
	...
	<input type="text" uku-value="myCtrl.message">
	<h3>{{myCtrl.message}}<h3/>
	...
</body>
```

***
 
### You can find guide and API document at [http://ukulelejs.tiger.mopaas.com/](http://ukulelejs.tiger.mopaas.com/)
