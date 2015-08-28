_Routjs is a simple route tool for single page application (anchor can work on it)._

**Demo**
_[http://routejs.tiger.mopaasapp.com/](http://routejs.tiger.mopaasapp.com/)_

***

## How to use
**Import routejs' library**
```html
<script src="src/js/uku-route.js"></script>
```
**Define the route**
```javascript
var route = new RouteController("viewContainer")
.default("#page1","pages/page1.html")
.when("#page2","pages/page2.html")
.otherwise("pages/404.html")
.work();
```
```html
<body>
    <div class="borderBox">
        <a href="#page1">go to page1</a>
        <a href="#page2">go to page2</a>
        <a href="#anchor">anchor</a>
        <div class="clear"></div>
    </div>       
    <div id="viewContainer">  
    </div>
    <a name="anchor">this is an anchor's href</a>
</body>
```
**Then, enjoy it**
