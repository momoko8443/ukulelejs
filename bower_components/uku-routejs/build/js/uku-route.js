function RouteController(container){
    var pageStack = {};
    var currentPage;
    var defaultPage;
    var otherwisePage;
    var self = this;
    var containerId = container;
    var anchors = {};
    var pageCache = {};

    var registerRoute = function(key,path,isDefault,isOtherwise){
        var hash = window.location.hash;
        var page = {"key":key,"path":path};
        if(isDefault){
            defaultPage = page;
        }
        if(isOtherwise){
            otherwisePage = page;
        }
        pageStack[key] = page;
    };
	
	var dispatchOnRouteChange = function(page){
		if(self.onRouteChange && typeof(self.onRouteChange) === "function"){
			self.onRouteChange.call(self,page);
		}
	};

    this.default = function(key,path){
        registerRoute(key,path,true);
        return this;
    };
    this.when = function(key,path){
        registerRoute(key,path,false);
        return this;
    };
    this.otherwise = function(path){
        registerRoute("otherwise",path,false,true);
        return this;
    };
    this.goto = function(key){
        var page = pageStack[key];
        if(page){
            if(page !== currentPage){
                if(pageCache[key]){
                     var oldPageKey = currentPage.key;
                     if(pageCache[oldPageKey]){
                         pageCache[oldPageKey].style.display = "none";
                     }else{
                         cacheOldPage();
                     }
                     pageCache[key].style.display = "block";
                     pageCache[key].classList.add("showEffect");
                     currentPage = page;
					 var p = {"page":pageCache[key],"cache":true};
					 dispatchOnRouteChange(p);
                }else{             
                    cacheOldPage();
                    var ajax = new XMLHttpRequest();
                    ajax.onreadystatechange = function(){
                       if (ajax.readyState==4){
                           if (ajax.status==200){
                               var htmlText = ajax.responseText;
                               containerDOM.insertAdjacentHTML('afterBegin', '<div>'+htmlText+'</div>');
                               var html = containerDOM.children[0];
                               html.classList.add("showEffect");
                               currentPage = page;
							   var p = {"page":html,"cache":false};
							   dispatchOnRouteChange(p);
                           }else{
                               alert("Can't load the route "+ page.key +"page from "+page.path);
                           }
                       }
                    };
                    ajax.open("GET",page.path,true);
                    ajax.send(null);
                }
            }    
        }else if(anchors[key] === undefined){
            this.goto("otherwise");
        }
        
        function cacheOldPage(){
            for(var i=0;i<containerDOM.children.length;i++){
                var childDOM = containerDOM.children[i];
                if(childDOM.style.display !== "none"){
                    childDOM.style.display = "none";
                    var oldPageKey = currentPage.key;
                    pageCache[oldPageKey] = childDOM;
                    return false;
                }
            }
        }
    };
    this.work = function(){
        containerDOM = document.getElementById(containerId);
        var hash = window.location.hash;
        var anchorsDom = document.querySelectorAll("a[name]");
        for(var i=0;i<anchorsDom.length;i++){
            var anchor = anchorsDom[i].getAttribute("name");
            anchors["#"+anchor] = anchor;
        }
        var self = this;
        window.onhashchange = function(e){
            hash = window.location.hash;
            self.goto(hash);
        };
        if(hash){
            this.goto(hash);
        }else if(defaultPage){
            this.goto(defaultPage.key);
        }
    };
	this.onRouteChange = undefined;
}