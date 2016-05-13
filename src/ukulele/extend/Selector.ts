export class Selector{
    static querySelectorAll(element:any,query:string):NodeList{
        if(window.hasOwnProperty('jQuery') && typeof window['jQuery'] !== "undefined"){
            return window['jQuery'](element).find(query);
        }else{
            return element.querySelectorAll(query);
        }
    }

    static fuzzyFind(element:any,text:string):HTMLElement {
        if (element && element.attributes) {
            for (let i = 0; i < element.attributes.length; i++) {
                let attr = element.attributes[i];
                if (attr.nodeName.search(text) > -1) {
                    return element;
                }
            }
        }
        return null;
    }

    static directText(element:any,text?:any):string {
        let o = "";
        let nodes = element.childNodes;
        for (let i = 0; i <= nodes.length - 1; i++) {
            let node = nodes[i];
            if (node.nodeType === 3) {
                if (text || text ==="" || text === 0 || text === false) {
                    node.nodeValue = text;
                    return;
                } else {
                    o += node.nodeValue;
                }
            }
        }
        return o.trim();
    }

    static parents(element:any):Array<HTMLElement>{
        let parents = [];
        while(element.parentNode && (element.parentNode as HTMLElement).tagName !== 'BODY'){
            parents.push(element.parentNode as HTMLElement);
            element = element.parentNode as HTMLElement;
        }
        return parents;
    }
}
