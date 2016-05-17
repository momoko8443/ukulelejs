export class EventListener{
    static addEventListener(element:HTMLElement,eventType:string,handler:any):void{
        if(window.hasOwnProperty('jQuery') && typeof window['jQuery'] !== undefined){
            return window['jQuery'](element).on(eventType,(e)=>{
                handler && handler(e);
            });
        }else{
            return element.addEventListener(eventType,handler);
        }
    }
}
