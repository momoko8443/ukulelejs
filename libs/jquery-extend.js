/**
 * @author momoko
 */
(function ($) {
    $.fn.directText = function (text) {
        var o = "";
        this.each(function () {
            var nodes = this.childNodes;
            for (var i = 0; i <= nodes.length - 1; i++) {
            	var node = nodes[i];
                if (node.nodeType == 3){
                	if(text && $.trim(node.nodeValue) != ""){
                		node.nodeValue = text;
                		return;
                	}else{
                		o += node.nodeValue;
                	}
                	
                } 
            }
        });
        return $.trim(o);
    };
    
    $.fn.fuzzyFind = function(text) {
    	if(this.hasOwnProperty('context')){
    		var element = this.context;
    		if(element && element.hasOwnProperty("attributes")){
	    		for(var i=0;i<element.attributes.length;i++){
	    			var attr = element.attributes[i];
	    			if(attr.nodeName.search(text) > -1){
	    				return element;
	    			}
	    		}
	    	}
    	}
    	return null;
    };
})(jQuery);