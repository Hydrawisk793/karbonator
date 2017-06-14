(function () {
    /**
     * @function
     * @param {Number} l
     * @param {Number} r
     * @return {Number}
     */
    var numberComparator = function (l, r) {
        return l-r;
    };
    
    /**
     * @function
     * @param {Set} set
     */
    var printSet = function (set) {
        var str = "";
        for(var iter = set.keys(), pair = iter.next(); !pair.done; pair = iter.next()) {
            var value = pair.value;
            
            str += " ";
            str += value;
        }
//        for(var value of set) {
//            str += " ";
//            str += value;
//        }
        console.log(str);
    };
    
    /**
     * @param {Function} setClass
     */
    var testSet = function (setClass) {
        console.log("================ start of test 1 ===================");
        var set1 = new setClass(numberComparator);
        set1.add(1);
        set1.add(2);
        set1.add(3);
        set1.add(4);
        set1.add(5);
        set1.add(6);
        set1.add(7);
        set1.add(8);
        set1.remove(2);
        set1.remove(1);
        set1.remove(3);
        printSet(set1);
        console.log("================ start of test 1 ===================");
        
        console.log("================ start of test 2 ===================");
        set1.clear();
        var set2 = set1;//new setClass(numberComparator);
        set2.add(41);
        set2.add(38);
        set2.add(31);
        set2.add(12);
        set2.add(19);
        set2.add(8);
        printSet(set2);
        console.log("================ start of test 3 ===================");
        
        console.log("================ start of test 3 ===================");
        set1.clear();
        var set3 = set1;//new setClass(numberComparator);
        set3.add(10);
        set3.add(85);
        set3.add(15);
        set3.add(70);
        set3.add(20);
        set3.add(60);
        set3.add(30);
        set3.add(50);
        set3.add(65);
        set3.add(80);
        set3.add(90);
        set3.add(40);
        set3.add(5);
        set3.add(55);
        printSet(set3);
        if(setClass === ns.OrderedTreeSet) {
            console.log("set3.findNotLessThan(83) == " + set3.findNotLessThan(83));
            console.log("set3.findGreaterThan(83) == " + set3.findGreaterThan(83));
        }
        
        console.log(set3.toArray());
        console.log(set3.toString());
        
        console.log("================ end of test 3 ===================");
    };
    
    var ns = karbonator.collection;
    testSet(ns.OrderedTreeSet);
    testSet(ns.ListSet);
}());
