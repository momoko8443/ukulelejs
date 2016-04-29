export class EventListener{
    static addEventListener(element,eventType,handler) {
        if(typeof jQuery !== "undefined"){
            return jQuery(element).on(eventType,handler);
        }else{
            return element.addEventListener(eventType,handler);
        }
    }
}
