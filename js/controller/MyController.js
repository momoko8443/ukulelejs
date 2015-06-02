/**
 * @author momoko
 */
function MyController(){
	this.yourname = "anyone";
	this.message = "welcome message here";
	this.sayHello = function(){
		this.message = "Hi,"+this.yourname;		
	};
}
