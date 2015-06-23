describe("UkuleleUtil Test Suite", function() {
    it("test getFinalAttribute", function() {
        var expression1 = "myCtrl.name";
        var attr = UkuleleUtil.getFinalAttribute(expression1);
        var expression2 = "myCtrl.child.name";
        var attr2 = UkuleleUtil.getFinalAttribute(expression2);
        expect(attr).toBe("name");
        expect(attr2).toBe("child.name");
    });
});