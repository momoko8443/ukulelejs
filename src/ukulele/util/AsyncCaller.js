export function AsyncCaller(){
    let allTasksPool = [];
    let queueTasksPool = [];
	Function.prototype.resolve = function(ac){
		ac.aysncFunRunOver.call(ac, this);
	};
    this.pushAll = function(asyncFunc,arguArr){
        if(queueTasksPool.length === 0){
            let funcObj = {'func':asyncFunc,'argu':arguArr};
            allTasksPool.push(funcObj);
        }else {
            console.error(errorMsg);
        }
		return this;
    };
    this.pushQueue = function(asyncFunc,arguArr){
        if(allTasksPool.length === 0){
            let funcObj = {'func':asyncFunc,'argu':arguArr};
            queueTasksPool.push(funcObj);
        }else{
            console.error(errorMsg);
        }
		return this;
    };

    this.aysncFunRunOver = function(caller){
        if(execType === "queue"){
            if(queueTasksPool.length === 0){
                if(this.finalFunc){
                    this.finalFunc();
                }
            }else{
                let funcObj = queueTasksPool[0];
                queueTasksPool.shift();
                funcObj.func.apply(this,funcObj.argu);

            }
        }else if(execType === "all"){
			for (let i = 0; i < allTasksPool.length; i++) {
				let task = allTasksPool[i];
				if(caller === task.func){
					allTasksPool.splice(i,1);
					break;
				}
			}
            if(allTasksPool.length === 0){
                if(this.finalFunc){
                    this.finalFunc();
                }
            }
        }
    };
    let execType = "queue";
    this.exec = function(callback){
        this.finalFunc = callback;
        if(allTasksPool.length > 0){
            execType = "all";
            executeAll();
        }else if(queueTasksPool.length > 0){
            execType = "queue";
            executeQueue();
        }else{
            this.finalFunc.call();
        }

    };
    function executeQueue(){
        let funcObj = queueTasksPool[0];
        queueTasksPool.shift();
        funcObj.func.apply(null,funcObj.argu);

    }
    function executeAll(){
		for(let i=0;i<allTasksPool.length;i++){
			let funcObj = allTasksPool[i];
        	funcObj.func.apply(null,funcObj.argu);
		}
    }
    let errorMsg = "Only one type of task can be executed at same time";
}
