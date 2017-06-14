(function () {
    var result = {i : 0};
    for(result.i = 0; result.i < 20000; ) {
        ++result.i;
        console.log("살펴가기 + " + result.i);
    }
    
    alert("test2!");
    
    return result;
})();
