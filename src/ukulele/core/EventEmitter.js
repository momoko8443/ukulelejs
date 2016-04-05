function EventEmitter(){
    this.eventsPool = {};
}

EventEmitter.prototype.addListener = function(eventType, handler){
    if(!this.eventsPool[eventType]){
        this.eventsPool[eventType] = [];
    }
    this.eventsPool[eventType].push(handler);
};

EventEmitter.prototype.removeListener = function(eventType, handler){
    if(this.eventsPool[eventType]){
        for(var i=this.eventsPool[eventType].length-1;i>=0;i--){
            if(this.eventsPool[eventType][i] === handler){
                this.eventsPool[eventType].splice(i,1);
                break;
            }
        }
    }
};

EventEmitter.prototype.dispatchEvent = function(event){
    if(event && event.eventType){
        var handlers = this.eventsPool[event.eventType];
        if(handlers){
            for(var i=0;i<handlers.length;i++){
                handlers[i].call(this,event);
            }
        }
    }
};

EventEmitter.prototype.hasListener = function(eventType){
    if(this.eventsPool[eventType] && this.eventsPool[eventType].length > 0){
        return true;
    }
    return false;
};

Analyzer.prototype = new EventEmitter();
Analyzer.prototype.constructor = Analyzer;
