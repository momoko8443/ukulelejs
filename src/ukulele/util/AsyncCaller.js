function AsyncCaller(){
    var allTasksPool = [];
    var queueTasksPool = [];
	Function.prototype.resolve = function(ac){
		ac.aysncFunRunOver.call(ac, this);
	};
    this.pushAll = function(asyncFunc,arguArr){
        if(queueTasksPool.length === 0){
            var funcObj = {'func':asyncFunc,'argu':arguArr};
            allTasksPool.push(funcObj);
        }else {
            console.error(errorMsg);
        }
		return this;
    };
    this.pushQueue = function(asyncFunc,arguArr){
        if(allTasksPool.length === 0){
            var funcObj = {'func':asyncFunc,'argu':arguArr};
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
					//delete Function.prototype.resolve;
                    this.finalFunc();
                }
            }else{
                var funcObj = queueTasksPool[0];
                queueTasksPool.shift();
                funcObj.func.apply(this,funcObj.argu);

            }
        }else if(execType === "all"){
			for (var i = 0; i < allTasksPool.length; i++) {
				var task = allTasksPool[i];
				if(caller === task.func){
					allTasksPool.splice(i,1);
					break;
				}
			}
            if(allTasksPool.length === 0){
                if(this.finalFunc){
					//delete Function.prototype.resolve;
                    this.finalFunc();
                }
            }
        }
    };
    var execType = "queue";
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
        var funcObj = queueTasksPool[0];
        queueTasksPool.shift();
        funcObj.func.apply(null,funcObj.argu);

    }
    function executeAll(){
		for(var i=0;i<allTasksPool.length;i++){
			var funcObj = allTasksPool[i];
        	funcObj.func.apply(null,funcObj.argu);
		}
    }
    var errorMsg = "Only one type of task can be executed at same time";
}
