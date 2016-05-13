declare global{
    interface Function {
        resolve(ac:AsyncCaller):void;
    }
}

class FunctionObject{
    func:Function;
    argu:Array<any>;
    constructor(_func:Function,_argu:Array<any>){
        this.func = _func;
        this.argu = _argu;
    }
}

export class AsyncCaller {
    private allTasksPool:Array<FunctionObject>;
    private queueTasksPool:Array<FunctionObject>;
    private execType:string = "queue";
    private errorMsg:string = "Only one type of task can be executed at same time";
    private finalFunc:Function;
    
    constructor(){
        Function.prototype.resolve = function(ac):void{
            ac.aysncFunRunOver.call(ac, this);
        };
    }
    
    pushAll(asyncFunc:Function,arguArr:Array<any>){
        if(this.queueTasksPool.length === 0){
            let funcObj:FunctionObject = new FunctionObject(asyncFunc,arguArr);
            this.allTasksPool.push(funcObj);
        }else {
            console.error(this.errorMsg);
        }
        return this;
    }
    pushQueue(asyncFunc,arguArr){
        if(this.allTasksPool.length === 0){
            let funcObj:FunctionObject = new FunctionObject(asyncFunc,arguArr);
            this.queueTasksPool.push(funcObj);
        }else{
            console.error(this.errorMsg);
        }
        return this;
    }

    aysncFunRunOver(caller:Function){
        if(this.execType === "queue"){
            if(this.queueTasksPool.length === 0){
                this.finalFunc && this.finalFunc();
            }else{
                let funcObj:FunctionObject = this.queueTasksPool[0];
                this.queueTasksPool.shift();
                funcObj.func.apply(this,funcObj.argu);

            }
        }else if(this.execType === "all"){
            for (let i = 0; i < this.allTasksPool.length; i++) {
                let task:FunctionObject = this.allTasksPool[i];
                if(caller === task.func){
                    this.allTasksPool.splice(i,1);
                    break;
                }
            }
            if(this.allTasksPool.length === 0){
                this.finalFunc && this.finalFunc();
            }
        }
    }
    
    exec(callback:Function){
        this.finalFunc = callback;
        if(this.allTasksPool.length > 0){
            this.execType = "all";
            this.executeAll();
        }else if(this.queueTasksPool.length > 0){
            this.execType = "queue";
            this.executeQueue();
        }else{
            this.finalFunc.call(null);
        }
    }
    private executeQueue:Function = function(){
        let funcObj:FunctionObject = this.queueTasksPool[0];
        this.queueTasksPool.shift();
        funcObj.func.apply(null,funcObj.argu);

    };
    private executeAll:Function = function(){
        for(let i=0;i<this.allTasksPool.length;i++){
            let funcObj:FunctionObject = this.allTasksPool[i];
            funcObj.func.apply(null,funcObj.argu);
        }
    };
}


