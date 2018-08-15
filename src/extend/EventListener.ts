export class EventListener{
    static addEventListener(element:HTMLElement,eventType:string,handler:any):void{
        return element.addEventListener(eventType,handler);
    }
}
