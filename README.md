# Install UkuleleJS
```
bower install ukulelejs
```
or
```
npm install ukulelejs
```

# Getting Start
## Native Way
**Import ukulelejs's library**
```html
<head>
	...
	<script type="text/javascript" src="ukulelejs/dist/uku.js"></script>
	...
</head>
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
	<h3>{{myCtrl.message}}</h3>
	...
</body>
```

### Find more examples and API document at [https://momoko8443.github.io/ukulelejs_website/](https://momoko8443.github.io/ukulelejs_website/)


### Then, enjoy it!

