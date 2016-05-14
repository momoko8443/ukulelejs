import {Event} from "./Event";
export interface IEventEmitter{
    addListener(eventType:string, handler:Function):void;
    removeListener(eventType:string, handler:Function):void
    hasListener(eventType:string):boolean;
    dispatchEvent(event:Event):void;
}
