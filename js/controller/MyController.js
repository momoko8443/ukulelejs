/**
 * @author momoko
 */
function MyController(){
    this.student = {"name":"momoko","sex":"male"};
	this.yourname = "anyone";
	this.message = "welcome message here";
	this.items = [{"name":"AAA"},{"name":"BBB"},{"name":"CCC"}];
    this.sayHello = function(){
		this.message = "Hi,"+this.yourname;		
	};
}
