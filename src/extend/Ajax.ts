export class Ajax {
    get(url:string):Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            let request:XMLHttpRequest = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        resolve(request.responseText);
                    } else {
                        reject();
                    }
                }
            };
            request.open("GET", url, true);
            request.send(null);
        });
        
    }
}
