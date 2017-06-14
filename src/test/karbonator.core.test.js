(function () {
    var math = karbonator.math;
    var Interval = math.Interval;
    var intervals = [
        new Interval(0, 15),
        new Interval(7, 13),
        new Interval(13, 20),
        new Interval(18, 25),
        new Interval(15, 30),
        new Interval(35, 38),
        new Interval(40, 45)
    ];
    
    var expectedDisjoinedIntervals = [
        new Interval(0, 7),
        new Interval(7, 13),
        new Interval(13, 15),
        new Interval(15, 18),
        new Interval(18, 20),
        new Interval(20, 25),
        new Interval(25, 30),
        new Interval(35, 38),
        new Interval(40, 45)
    ];
    var disjoinedIntervals = Interval.disjoin(intervals);
    console.log(disjoinedIntervals);
    for(var i = 0; i < expectedDisjoinedIntervals.length; ++i) {
        var lhs = expectedDisjoinedIntervals[i];
        if(disjoinedIntervals.findIndex(function (rhs) {return lhs.equals(rhs);}) < 0) {
            throw new Error("Interval.disjoin lacked some intervals.");
        }
    }
    
    var expectedClosure = [
        new Interval(0, 15),
        new Interval(7, 13),
        new Interval(13, 20),
        new Interval(18, 25),
        new Interval(15, 30)
    ];
    var closure = Interval.findClosure(intervals, 4);
    console.log(closure);
    for(var i = 0; i < expectedClosure.length; ++i) {
        var lhs = expectedClosure[i];
        if(closure.findIndex(function (rhs) {return lhs.equals(rhs);}) < 0) {
            throw new Error("Interval.findClosure lacked some intervals.");
        }
    }
    
    var expectedNegatedIntervals = [
        new Interval(Number.MIN_SAFE_INTEGER, -1),
        new Interval(31, 34),
        new Interval(39, 39),
        new Interval(46, Number.MAX_SAFE_INTEGER)
    ];
    var negatedIntervals = Interval.negate(intervals);
    console.log(negatedIntervals);
    for(var i = 0; i < expectedNegatedIntervals.length; ++i) {
        var lhs = expectedNegatedIntervals[i];
        if(negatedIntervals.findIndex(function (rhs) {return lhs.equals(rhs);}) < 0) {
            throw new Error("Interval.negate lacked some intervals.");
        }
    }
}());

(function () {
    var math = karbonator.math;
    var Interval = math.Interval;
    var insertAndSort = math._insertIfNotExistAndSort;
    var random = math.nextInt;
    
    for(var j = 0, jMax = random(0, 10000); j < jMax; ++j) {
        var result = {
            input : [],
            output : []
        };
        for(var i = 0, iMax = random(0, 100); i < iMax; ++i) {
            var interval = new Interval(random(-10, 10), random(-10, 10));
            result.input.push(interval);
            insertAndSort(result.output, interval, function (l, r) {
                var diff = l.getMinimum() - r.getMinimum();
                if(math.numberEquals(diff, 0)) {
                    if(l.equals(r)) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                }
                
                return diff;
            });
        }
        
        if(result.output.length !== result.input.length) {
            for(var i = 0; i < result.input.length; ++i) {
                if(result.output.findIndex(function (elem) {return elem.equals(result.input[i]);}) < 0) {
                    throw new Error("Lack of some elements.");
                }
            }
        }
        
        console.log(result);
    }
}());
