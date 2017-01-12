# Release Notes
v1.2.5: add two arguments for component._initialized function, the first one is randomAlias of cc, the second one is instance of component's dom
v1.2.4: Added CustomEvent polyfill for IE 10+ support
v1.2.3: Fixed treewalker bug for IE browser.
v1.2.2: A grant improvement for callback hell, using Promise/Async/Await replaced. & supported components' external script to include component controller's script.
v1.2.1: Fixed issue for uku-visible can't works with input element & refactoring for BoundItemAttribute
v1.2.0: Add new directives uku-visible & uku-render 
v1.1.0: Supporting shadow style of components

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
	<script type="text/javascript" src="ukulelejs/dist/uku.js"></script>
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

### Find more examples and API document at [http://momoko8443.github.io/ukulelejs_website/](http://momoko8443.github.io/ukulelejs_website/)
