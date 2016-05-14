export class Event{
    eventType:string;
    element:HTMLElement;
    
    constructor(_eventType,_element?:HTMLElement){
        this.eventType = _eventType;
        this.element = _element;
    }
}