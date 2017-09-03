/**
 * author : Hydrawisk793
 * e-mail : hyw793&#x40;naver.com
 * blog : http://blog.naver.com/hyw793
 * disclaimer : The author is not responsible for any problems 
 * that may arise by using this source code.
 */

/**
 * @param {global|window} g
 * @param {Function} factory
 */
(function (g, factory) {
    "use strict";
    
    if(typeof(g.define) === "function" && g.define.amd) {
        g.define(["./karbonator.core"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("./karbonator.core"));
    }
    else {
        factory(g, g.karbonator);
    }
}(
(
    typeof(global) !== "undefined"
    ? global
    : (typeof(window) !== "undefined" ? window : this)
),
(function (global, karbonator) {
    global;
    
    var detail = karbonator.detail;
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var math = karbonator.math || {};
    karbonator.math = math;
    
    /*////////////////////////////////////////////////////////////////*/
    //Interval
    
    var _epsilon = math.epsilon;
    var _minInt = karbonator.minimumSafeInteger;
    var _maxInt = karbonator.maximumSafeInteger;
    
    /**
     * @memberof karbonator.math
     * @constructor
     * @param {Number} value1
     * @param {Number} [value2]
     */
    var Interval = function (value1) {
        switch(arguments.length) {
        case 0:
            throw new TypeError("At least one number or an Interval instance must be passed.");
        break;
        case 1:
            if(value1 instanceof Interval) {
                this._min = value1._min;
                this._max = value1._max;
            }
            else if(karbonator.isNumber(value1)) {
                this._min = this._max = value1;
            }
            else {
                throw new TypeError("The parameter must be a number or an Interval instance.");
            }
        break;
        case 2:
        default:
            var value2 = arguments[1];

            if(
                !karbonator.isNumber(value1)
                || !karbonator.isNumber(value2)
            ) {
                throw new TypeError("Both 'value1' and 'value2' must be numbers.");
            }            

            if(value1 < value2) {
                this._min = value1;
                this._max = value2;
            }
            else {
                this._min = value2;
                this._max = value1;
            }
        //break;
        }
    };

    /**
     * @function
     * @param {*} o
     */
    var _assertIsInterval = function (o) {
        if(!(o instanceof Interval)) {
            throw new TypeError("The parameter must be an instance of karbonator.math.Interval.");
        }
    };

    /**
     * @function
     * @param {Interval} o
     * @param {Number} value
     * @return {Boolean}
     */
    var _isValueInInterval = function (o, value) {
        return (value >= o._min && value <= o._max);
    };

    /**
     * @function
     * @param {Array.<Interval>} sortedArray
     * @param {Interval} o
     * @param {Function} comparator
     * @param {Object} [thisArg]
     * @return {Boolean}
     */
    var _insertIfNotExistAndSort = function (sortedArray, o, comparator) {
        var thisArg = arguments[3];
        comparator = (
            typeof(comparator) !== "undefined"
            ? comparator
            : (function (lhs, rhs) {return lhs - rhs;})
        );

        var len = sortedArray.length;
        var result = true;
        if(len < 1) {
            sortedArray.push(o);
        }
        else {
            var loop = true;
            for(var i = 0; loop && i < len; ) {
                var cp = comparator.call(thisArg, sortedArray[i], o);                        
                if(cp === 0) {
                    result = false;
                    loop = false;
                }
                else if(cp > 0) {
                    sortedArray.splice(i, 0, o);
                    loop = false;
                }
                else {
                    ++i;
                }
            }

            if(loop) {
                sortedArray.push(o);
            }
        }

        return result;
    };

    /**
     * @function
     * @param {Interval} l
     * @param {Interval} r
     * @return {Number}
     */
    var _intervalComparatorForSort = function (l, r) {
        var diff = l._min - r._min;
        if(math.numberEquals(diff, 0, this.epsilon)) {
            return (l[karbonator.equals](r) ? 0 : -1);
        }

        return diff;
    };

    /**
     * @function
     * @param {Array.<Interval>} intervals
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Array.<Interval>}
     */
    var _createSortedIntervalListSet = function (intervals) {
        var comparatorParams = {epsilon : arguments[1]};
        var sortedIntervals = [];
        for(var i = 0, len = intervals.length; i < len; ++i) {
            _insertIfNotExistAndSort(
                sortedIntervals,
                intervals[i],
                _intervalComparatorForSort,
                comparatorParams
            );
        }

        return sortedIntervals;
    };

    /**
     * @function
     * @param {Interval|Number} o
     */
    var _coerceArgumentToInterval = function (o) {
        var result = o;
        if(karbonator.isNumber(o)) {
            result = new Interval(o, o);
        }

        _assertIsInterval(result);

        return result;
    };

    /**
     * @function
     * @param {Array.<Interval>} sortedListSet
     * @param {Number} startIndex
     * @return {Number}
     */
    var _findEndOfClosureIndex = function (sortedListSet, startIndex) {
        var endOfClosureIndex = startIndex + 1;
        for(
            var i = startIndex, len = sortedListSet.length;
            i < endOfClosureIndex && i < len;
            ++i
        ) {
            var current = sortedListSet[i];

            var loopJ = true;
            var endOfNeighborIndex = i + 1;
            for(var j = endOfNeighborIndex; loopJ && j < len; ) {
                var other = sortedListSet[j];

                if(current._max < other._min) {
                    endOfNeighborIndex = j;
                    loopJ = false;
                }
                else {
                    ++j;
                }
            }
            if(loopJ) {
                endOfNeighborIndex = len;
            }

            endOfClosureIndex = (
                endOfClosureIndex < endOfNeighborIndex
                ? endOfNeighborIndex
                : endOfClosureIndex
            );
        }

        return endOfClosureIndex;
    };

    /**
     * @memberof karbonator.math.Interval
     * @function
     * @param {Array.<karbonator.math.Interval>} intervals
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @param {Boolean} [mergePoints=false]
     * @return {Array.<karbonator.math.Interval>}
     */
    Interval.disjoin = function (intervals) {
        switch(intervals.length) {
        case 0:
            return [];
        //break;
        case 1:
            return [new Interval(intervals[0]._min, intervals[0]._max)];
        //break;
        }

        var disjoinedIntervals = [];

        var j = 0, sortedPointMaxIndex = 0, endOfClosureIndex = 0;
        var neighbor = null;
        var sortedPoints = [];
        var sortedListSet = _createSortedIntervalListSet(intervals, arguments[1]);
        for(var i = 0, len = sortedListSet.length; i < len; ) {
            j = 0;

            endOfClosureIndex = _findEndOfClosureIndex(sortedListSet, i);
            sortedPoints.length = 0;
            for(j = i; j < endOfClosureIndex; ++j) {
                neighbor = sortedListSet[j];
                _insertIfNotExistAndSort(
                    sortedPoints,
                    neighbor._min
                );
                _insertIfNotExistAndSort(
                    sortedPoints,
                    neighbor._max
                );
            }

            sortedPointMaxIndex = sortedPoints.length - 1;
            if(arguments[2]) {
                disjoinedIntervals.push(new Interval(sortedPoints[0], sortedPoints[sortedPointMaxIndex]));
            }
            else {
                //TODO : 안전성 검사(e.g. Interval이 1개인 경우)
                j = 0;
                do {
                    disjoinedIntervals.push(new Interval(sortedPoints[j], sortedPoints[j + 1]));
                    ++j;
                }
                while(j < sortedPointMaxIndex);
            }

            i = endOfClosureIndex;
        }

        return disjoinedIntervals;
    };

    /**
     * @memberof karbonator.math.Interval
     * @function
     * @param {Array.<karbonator.math.Interval>} intervals
     * @param {Number} [minimumValue=Number.MIN_VALUE]
     * @param {Number} [maximumValue=Number.MAX_VALUE]
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Array.<karbonator.math.Interval>}
     */
    Interval.merge = function (intervals) {
        var min = arguments[1];
        if(karbonator.isUndefined(min)) {
            min = Number.MIN_VALUE;
        }
        else if(!karbonator.isNumber(min)) {
            throw new TypeError("'minimumValue' must be a number.");
        }

        var max = arguments[2];
        if(karbonator.isUndefined(max)) {
            max = Number.MIN_VALUE;
        }
        else if(!karbonator.isNumber(max)) {
            throw new TypeError("'maximumValue' must be a number.");
        }
        else if(max < min) {
            throw new RangeError(
                "'maximumValue'"
                + " cannot be less than "
                + "'minimumValue'."
            );
        }

        var epsilon = arguments[3];
        if(karbonator.isUndefined(epsilon)) {
            epsilon = _epsilon;
        }
        else if(!karbonator.isNumber(epsilon)) {
            throw new TypeError("'epsilon' must be a number.");
        }

        //TODO : 맞는지 확인
        var disjoined = Interval.disjoin(intervals, epsilon, true);
        for(var i = 0, j = 1; j < disjoined.length; ++i, ++j) {
            if(
                karbonator.math.numberEquals(
                    disjoined[i]._max,
                    disjoined[j]._min
                )
            ) {
                console.warn(
                    "'karbonator.math.Interval.merge' method"
                    + " does wrong behaviour."
                    + " It doesn't merge intervals well."
                );
            }
        }

        return disjoined;
    };

    /**
     * @memberof karbonator.math.Interval
     * @function
     * @param {Array.<karbonator.math.Interval>} intervals
     * @param {Number} [minimumValue=Number.MIN_VALUE]
     * @param {Number} [maximumValue=Number.MAX_VALUE]
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Array.<karbonator.math.Interval>}
     */
    Interval.negate = function (intervals) {
        var negatedIntervals = [];

        //Must be sorted in lowest minimum value order.
        var epsilon = detail._selectNonUndefined(arguments[3], _epsilon);
        var disjoinedIntervals = Interval.disjoin(intervals, epsilon, true);
        var intervalCount = disjoinedIntervals.length;
        var i, j = 0;

        if(intervalCount > 0) {
            var min = disjoinedIntervals[j]._min;
            if(karbonator.isInteger(min)) {
                negatedIntervals.push(new Interval(
                    detail._selectInt(arguments[1], Number.MIN_SAFE_INTEGER),
                    min - 1
                ));
            }
            else {
                negatedIntervals.push(new Interval(
                    detail._selectFloat(arguments[1], -Number.MAX_VALUE),
                    min - epsilon
                ));
            }

            i = 0, ++j;
        }

        for(; j < intervalCount; ++j, ++i) {
            var max = disjoinedIntervals[i]._max;
            var min = disjoinedIntervals[j]._min;
            negatedIntervals.push(new Interval(
                max + (karbonator.isInteger(max) ? 1 : epsilon),
                min - (karbonator.isInteger(min) ? 1 : epsilon)
            ));
        }

        if(i < intervalCount) {
            var max = disjoinedIntervals[i]._max;
            if(karbonator.isInteger(max)) {
                negatedIntervals.push(new Interval(
                    max + 1,
                    detail._selectInt(arguments[2], Number.MAX_SAFE_INTEGER)
                ));
            }
            else {
                negatedIntervals.push(new Interval(
                    max + epsilon,
                    detail._selectFloat(arguments[2], Number.MAX_VALUE)
                ));
            }
        }

        return negatedIntervals;
    };

    /**
     * @memberof karbonator.math.Interval
     * @function
     * @param {Array.<karbonator.math.Interval>} intervals
     * @param {Number} [targetIndex=0]
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Array.<karbonator.math.Interval>}
     */
    Interval.findClosure = function (intervals) {
        var sortedListSet = _createSortedIntervalListSet(intervals, arguments[2]);

        var targetIndex = (karbonator.isUndefined(arguments[1]) ? 0 : arguments[1]);
        var len = sortedListSet.length;
        var visitFlags = [];
        for(var i = 0; i < len; ++i) {
            visitFlags.push(false);
        }

        var closureStartIndex = targetIndex;
        var closureInclusiveEndIndex = targetIndex;
        var targetIndices = [targetIndex];
        for(; targetIndices.length > 0; ) {
            var i = targetIndices.pop();
            if(!visitFlags[i]) {
                visitFlags[i] = true;

                var lhs = sortedListSet[i];
                for(var j = 0; j < len; ++j) {
                    if(j !== i && lhs.intersectsWith(sortedListSet[j])) {
                        targetIndices.push(j);

                        closureStartIndex = (closureStartIndex > j ? j : closureStartIndex);
                        closureInclusiveEndIndex = (closureInclusiveEndIndex < j ? j : closureInclusiveEndIndex);
                    }
                }
            }
        }

        var closure = [];
        for(var i = closureStartIndex; i <= closureInclusiveEndIndex; ++i) {
            closure.push(sortedListSet[i]);
        }

        return closure;
    };

    /**
     * @function
     * @return {karbonator.math.Interval}
     */
    Interval.prototype[karbonator.shallowClone] = function () {
        return new Interval(this._min, this._max);
    };

    /**
     * @function
     * @return {Number}
     */
    Interval.prototype.getMinimum = function () {
        return this._min;
    };

    /**
     * @function
     * @return {Number}
     */
    Interval.prototype.getMaximum = function () {
        return this._max;
    };

    /**
     * @function
     * @param {karbonator.math.Interval|Number} rhs
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Boolean}
     */
    Interval.prototype[karbonator.equals] = function (rhs) {
        if(this === rhs) {
            return true;
        }

        if(karbonator.isUndefinedOrNull(rhs)) {
            return false;
        }

        var epsilon = arguments[1];
        if(karbonator.isNumber(rhs)) {
            return math.numberEquals(this._min, this._max, epsilon)
                && math.numberEquals(this._min, rhs, epsilon)
            ;
        }

        return math.numberEquals(this._min, rhs._min, epsilon)
            && math.numberEquals(this._max, rhs._max, epsilon)
        ;
    };

    /**
     * @function
     * @param {karbonator.math.Interval|Number} rhs
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Number}
     */
    Interval.prototype[karbonator.compareTo] = function (rhs) {
        if(this[karbonator.equals](rhs, arguments[1])) {
            return 0;
        }

        var target = _coerceArgumentToInterval(rhs);
        var diff = this._min - target._min;
        return (
            math.numberEquals(diff, 0, karbonator.math.epsilon)
            ? 0
            : diff
        );
    };

    /**
     * @function
     * @param {karbonator.math.Interval|Number} rhs
     * @return {Boolean}
     */
    Interval.prototype.intersectsWith = function (rhs) {
        var target = _coerceArgumentToInterval(rhs);

        if(this._min < target._min) {
            return this._max >= target._min && target._max >= this._min;
        }
        else {
            return target._max >= this._min && this._max >= target._min;
        }
    };

    /**
     * @function
     * @param {karbonator.math.Interval|Number|Array|String} rhs
     * @return {Boolean}
     */
    Interval.prototype.contains = function (rhs) {
        if(rhs instanceof Interval) {
            if(this._min < rhs._min) {
                return _isValueInInterval(this, rhs._min)
                    && _isValueInInterval(this, rhs._max)
                ;
            }
            else {
                return _isValueInInterval(rhs, this._min)
                    && _isValueInInterval(rhs, this._max)
                ;
            }
        }

        if(karbonator.isNumber(rhs)) {
            return _isValueInInterval(this, rhs);
        }

        if(karbonator.isArray(rhs)) {
            for(var i = 0, len = rhs.length; i < len; ++i) {
                if(!this.contains(rhs[i])) {
                    return false;
                }
            }

            return true;
        }

        if(karbonator.isString(rhs)) {
            for(var i = 0; i < rhs.length; ++i) {
                if(!_isValueInInterval(this, rhs.charCodeAt(i))) {
                    return false;
                }
            }

            return true;
        }

        throw new TypeError("The parameter must be either an karbonator.math.Interval instance, an array, a string or a number.");
    };

    /**
     * @function
     * @param {Number} [minimumValue]
     * @param {Number} [maximumValue]
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Array.<karbonator.math.Interval>}
     */
    Interval.prototype.negate = function () {
        var negatedIntervals = [];

        if(karbonator.isInteger(this._min)) {
            negatedIntervals.push(new Interval(
                detail._selectInt(arguments[0], _minInt),
                this._min - 1
            ));
        }
        else {
            negatedIntervals.push(new Interval(
                detail._selectFloat(arguments[0], -Number.MAX_VALUE),
                this._min - detail._selectNonUndefined(arguments[2], _epsilon)
            ));
        }

        if(karbonator.isInteger(this._max)) {
            negatedIntervals.push(new Interval(
                detail._selectInt(arguments[1], _maxInt),
                this._max + 1
            ));
        }
        else {
            negatedIntervals.push(new Interval(
                detail._selectFloat(arguments[1], Number.MAX_VALUE),
                this._max + detail._selectNonUndefined(arguments[2], _epsilon)
            ));
        }

        return negatedIntervals;
    };

    /**
     * @function
     * @param {Number} v
     * @return {String}
     */
    var _intToString = function (v) {
        if(v === detail._maxInt) {
            return "INT_MAX";
        }
        else if(v === detail._minInt) {
            return "INT_MIN";
        }
        else {
            return v.toString();
        }
    };
    
    /**
     * @function
     * @return {String}
     */
    Interval.prototype.toString = function () {
        return '['
            + _intToString(this._min)
            + ", "
            + _intToString(this._max)
            + ']'
        ;
    };
    
    math.Interval = Interval;
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
