# Install UkuleleJS
```
$npm install -g bower
bower install ukulelejs
```
# Getting Start
## Native Way
**Import ukulelejs's library**
```html
<head>
	...
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
...
</body>
<script>
...
var uku = new Ukulele();
uku.registerController("myCtrl", new MyController());
uku.init();

function MyController() {
	this.message = "";
	....
}
</script>
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
	"domReady": 'bower_components/domReady/domReady',
        "ukulele": 'build/js/ukulele'
    },
    shim:{  	
		"ukulele":{
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
**Initialize ukulelejs and register Controller in the domReady callback function**
```javascript
require(["domReady","ukulele","MyController"], function(domReady,Ukulele,MyController) {
	var uku;
	domReady(function() {
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
 
### Find more examples and API document at [http://ukujs.tiger.mopaasapp.com/](http://ukujs.tiger.mopaasapp.com/)
