export class EventEmitter{
    private eventsPool:Object;
    constructor(){
        this.eventsPool = {};
    }
    addListener(eventType, handler):void{
        if(!this.eventsPool[eventType]){
            this.eventsPool[eventType] = [];
        }
        this.eventsPool[eventType].push(handler);
    }
    removeListener(eventType, handler):void{
        if(this.eventsPool[eventType]){
            for(let i=this.eventsPool[eventType].length-1;i>=0;i--){
                if(this.eventsPool[eventType][i] === handler){
                    this.eventsPool[eventType].splice(i,1);
                    break;
                }
            }
        }
    }
    hasListener(eventType):boolean{
        if(this.eventsPool[eventType] && this.eventsPool[eventType].length > 0){
            return true;
        }
        return false;
    }
    dispatchEvent(event):void{
        if(event && event.eventType){
            let handlers = this.eventsPool[event.eventType];
            if(handlers){
                for(let i=0;i<handlers.length;i++){
                    handlers[i].call(this,event);
                }
            }
        }
    }
}
