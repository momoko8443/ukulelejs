function MyController2(){
    this.inputValue = undefined;
    var self = this;
    this.showValue = {"do":function(){
        alert(self.inputValue);
    }};
}