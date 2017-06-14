(function () {
    var result = {i : 0};
    for(result.i = 0; result.i < 20000; ) {
        ++result.i
        console.log("쉬어가기 + " + result.i);
    }
    
    alert(this);
    
    return result;
})();
