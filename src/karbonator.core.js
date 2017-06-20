/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-21
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.polyfill-es"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = factory(g, require("./karbonator.polyfill-es"));
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    var detail = karbonator.detail;
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._identifierRegEx = /^[a-zA-Z$_][0-9a-zA-Z$_]*$/;
    
    var _hasPropertyMethod = function (key) {
        return (key in this);
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Object} global
     * @return {String}
     */
    detail._testEnvironmentType = function (global) {
        if((new Function("try{return this===window}catch(e){return false;}")).bind(global)()) {
            return "WebBrowser";
        }
        else if(
            !detail._isUndefined(global.process)
            && global.process.release.name === "node"
        ) {
            return "Node.js";
        }
        else {
            return "Other";
        }
    };
    
    /**
     * @function
     * @memberof karbonator.detail
     * @param {Number} prefered
     * @param {Number} alternative
     * @return {Number}
     */
    detail._selectInt = function (prefered, alternative) {
        return (
            Number.isInteger(prefered)
            ? prefered
            : alternative
        );
    };
    
    /**
     * @function
     * @memberof karbonator.detail
     * @param {Number} prefered
     * @param {Number} alternative
     * @return {Number}
     */
    detail._selectFloat = function (prefered, alternative) {
        return (
            !Number.isNaN(prefered)
            ? prefered
            : alternative
        );
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Number} v
     * @return {String}
     */
    detail._intToString = function (v) {
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
     * @memberof karbonator.detail
     * @function
     * @param {String} l
     * @param {String} r
     */
    detail._stringComparator = function (l, r) {
        var diff = 0;
        var minLen = (l.length < r.length ? l.length : r.length);
        for(var i = 0; i < minLen; ++i) {
            diff = l.charCodeAt(i) - r.charCodeAt(i);
            if(diff !== 0) {
                break;
            }
        }
        
        return diff;
    };
    
    /*////////////////////////////////*/
    //global.Console polyfill.(usually for node.js)
    
    (function (console) {
        if(
            "undefined" !== typeof(console)
            && !console.clear
            && console.log
        ) {
            if(global.process) {
                console.clear = function () {
                    var lines = global.process.stdout.getWindowSize()[1];
                    for(var i = 0; i < lines; i++) {
                        console.log('\x1BC');
                    }
                };
            }
            else {
                console.clear = function () {
                    console.log('\x1B[EJ');
                };
            }
        }
    }(global.console));
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //XMLHttpRequest
    
    var XMLHttpRequest = (function (global) {
        if(global.XMLHttpRequest) {
            return global.XMLHttpRequest;
        }
        else if(global.ActiveXObject) {
            return function() {
                return new global.ActiveXObject(
                    global.navigator.userAgent.indexOf("MSIE 5") >= 0
                    ? "Microsoft.XMLHTTP"
                    : "Msxml2.XMLHTTP"
                );
            };
        }
    }(global));
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //The snapshots of 'polyfilled' ECMAScript built-in objects
    
    var Object = global.Object;
    var Array = global.Array;
    var Date = global.Date;
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator namespace.
    
    /*////////////////////////////////*/
    //Interface & Callback definitions.
    
    /**
     * 비교 함수<br/>
     * 0 : 좌변과 우변이 동등<br/>
     * 양의 정수 : 좌변이 우변보다 큼<br/>
     * 음의 정수 : 좌변이 우변보다 작음<br/>
     * @callback karbonator.comparator
     * @param {*} l
     * @param {*} r
     * @return {Number}
     */
    
    /**
     * 복제 함수<br/>
     * 컬렉션 객체 등에서 요소를 복제할 때 호출되며,
     * 이 콜백이 제공되지 않으면 요소의 레퍼런스를 대입하는 얕은 복사가 진행 됨.
     * @callback karbonator.cloner
     * @param {Object} o
     * @return {Object}
     */
    
    /**
     * @memberof karbonator
     * @readonly
     * @type {Symbol}
     */
    karbonator.shallowCopy = global.Symbol("karbonator.shallowCopy");
    
    /**
     * @memberof karbonator
     * @readonly
     * @type {Symbol}
     */
    karbonator.deepCopy = global.Symbol("karbonator.deepCopy");
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Functions.
    
    /**
     * @memberof karbonator
     * @function
     */
    karbonator.onload = function () {};
    
    /**
     * @memberof karbonator
     * @function
     * @param {Object} value
     * @param {Object} defaultValue
     */
    karbonator.selectNonUndefined = detail._selectNonUndefined;
    
    /**
     * @memberof karbonator
     * @function
     * @param {Object} lhs
     * @param {Object} rhs
     * @return {Boolean}
     */
    karbonator.areBothNull = function (lhs, rhs) {
        return null === lhs === rhs;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} milliseconds
     */
    karbonator.wait = function (milliseconds) {
        for(
            var start = Date.now();
            Date.now() - start < milliseconds;
        );
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Object} dest
     * @param {Object} src
     * @param {Object} [options]
     * @return {Object}
     */
    karbonator.mergeObjects = (function () {
        var _assignPropertyAndIgonoreExceptions = function (dest, src, key) {
            try {
                dest[key] = src[key];
            }
            catch(e) {}
        };
        
        var _assignPropertyAndThrowExceptionIfOccured = function (dest, src, key) {
            dest[key] = src[key];
        };
        
        var _makeOptionsObject = function (options) {
            switch(typeof(options)) {
            case "undefined":
                options = {};
            break;
            case "object":
                if(null === options) {
                    options = {};
                }
            break;
            case "function":
            break;
            default:
                throw new Error("The parameter 'options' must be an object.");
            }
            options.copyNonOwnProperties = detail._selectNonUndefined(
                options.copyNonOwnProperties,
                false
            );
            options.deepCopy = detail._selectNonUndefined(
                options.deepCopy,
                false
            );
            options.overwrite = detail._selectNonUndefined(
                options.overwrite,
                false
            );
            options.ignoreExceptions = detail._selectNonUndefined(
                options.ignoreExceptions,
                false
            );
            
            return options;
        };
        
        var mergeObjects = function (dest, src) {
            var options = _makeOptionsObject(arguments[2]);
            
            var selectedHasPropertyMethod = (
                options.copyNonOwnProperties
                ? _hasPropertyMethod
                : detail._hasOwnPropertyMethod
            );
            
            var assignProperty = (
                options.ignoreExceptions
                ? _assignPropertyAndIgonoreExceptions
                : _assignPropertyAndThrowExceptionIfOccured
            );
            
            for(var key in src) {
                if(
                    selectedHasPropertyMethod.call(src, key)
                    && (options.overwrite || !_hasPropertyMethod.call(dest, key))
                ) {
                    if(
                        options.deepCopy
                        && typeof(dest[key]) === "object"
                        && typeof(src[key]) === "object"
                    ) {
                        mergeObjects(dest[key], src[key]);
                    }
                    else {
                        assignProperty(dest, src, key);
                    }
                }
            }
            
            return dest;
        };
        
        return mergeObjects;
    })();
    
    /**
     * @memberof karbonator
     * @function
     * @param {String} nsStr
     * @param {Object} globalObject
     * @return {Object}
     */
    karbonator.defineNamespace = function (nsStr, globalObject) {
        var tokens = nsStr.split(".");
        var current = detail._selectNonUndefined(globalObject, global);
        for(var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
            if(token.match(detail._identifierRegEx)) {
                current = current[token] = detail._selectNonUndefined(current[token], {});
            }
            else {
                throw new Error("'" + token + "' is an illigal identifier.");
            }
        }
        
        return current;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //class Environment
    
    karbonator.Environment = (function () {
        /**
         * @memberof karbonator
         * @constructor
         * @param {Object} global
         */
        var Environment = function (global) {
            this.global = global;
            
            this.support["XMLHttpRequest"] = !detail._isUndefined(XMLHttpRequest);
            
            this.support["window"] = !detail._isUndefined(global.window);
            this.support["document"] = !detail._isUndefined(global.document);
            this.support["Window"] = !detail._isUndefined(global.Window);
            this.support["HTMLDocument"] = !detail._isUndefined(global.HTMLDocument);
            this.support["Element"] = !detail._isUndefined(global.Element);
        };
        
        Environment.prototype.support = {};
        
        /**
         * @function
         * @return {String}
         */
        Environment.prototype.getType = function () {
            return detail._testEnvironmentType(this.global);
        };
        
        /**
         * @function
         * @return {String}
         */
        Environment.prototype.getAbsoluteRootPath = function () {
            var path = "/";
            
            switch(this.type) {
            case "WebBrowser":
                path = global.location.href.replace(/[\\/][^/:<>\\\*\?\"\|\r\n\t]+$/, "");
            break;
            case "Node.js":
                path = global.process.cwd();
            break;
            case "Other":
                
            break;
            }
            
            return path;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        Environment.prototype.supportsSynchronousHttpRequest = function () {
            if(typeof(XMLHttpRequest) === "undefined") {
                return false;
            }
            
            var result = true;
            var xhr = new XMLHttpRequest();
            try {
                xhr.open(
                    "GET",
                    (this.type === "WebBrowser" ? window.location.href : ""),
                    false
                );
                xhr.abort();
            }
            catch(e) {
                result = false;
            }
            
            return result;
        };
        
        return Environment;
    })();
    
    /*////////////////////////////////*/
    
    /**
     * @memberof karbonator
     * @readonly
     * @type {karbonator.Environment}
     */
    karbonator.environment = new karbonator.Environment(global);
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.math namespace.
    
    (function (global, karbonator) {
        /**
         * @namespace
         * @memberof karbonator
         */
        var math = (karbonator.math = karbonator.math || {
            /**
             * @readonly
             */
            epsilon : 1e-5,
            
            /**
             * @memberof karbonator.math
             * @function
             * @param {*} v
             * @return {Number}
             */
            toInt : detail._toInteger,
            
            /**
             * @memberof karbonator.math
             * @function
             * @param {Number} min
             * @param {Number} max
             * @return {Number}
             */
            nextInt : function (min, max) {
                return math.toInt(math.nextFloat(math.toInt(min), math.toInt(max)));
            },
            
            /**
             * @memberof karbonator.math
             * @function
             * @param {Number} min
             * @param {Number} max
             * @return {Number}
             */
            nextFloat : function (min, max) {
                return (Math.random() * (max - min)) + min;
            },
            
            /**
             * @memberof karbonator.math
             * @function
             * @param {Number} lhs
             * @param {Number} rhs
             * @param {Number} [epsilon=karbonator.math.epsilon]
             * @return {Boolean}
             */
            numberEquals : function (lhs, rhs) {
                return Math.abs(lhs - rhs) < (typeof(arguments[2]) === "undefined" ? math.epsilon : arguments[2]);
            },
            
            /**
             * @memberof karbonator.math
             * @function
             * @param {Number} value
             * @param {Number} start
             * @param {Number} end
             * @return {Number}
             */
            clamp : function (value, start, end) {
                var result = value;
                
                if(value < start) {
                    result = start;
                }
                else if(value > end) {
                    result = end;
                }
                
                return result;
            }
        });
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Interval
        
        math.Interval = (function () {
            /**
             * @memberof karbonator.math
             * @constructor
             * @param {Number} value1
             * @param {Number} value2
             */
            var Interval = function (value1, value2) {
                if(value1 < value2) {
                    this._min = value1;
                    this._max = value2;
                }
                else {
                    this._min = value2;
                    this._max = value1;
                }
            };
            
            /**
             * @function
             * @param {Interval} o
             * @param {Number} value
             * @return {Boolean}
             */
            var _isValueInInterval = function (o, value) {
                return (value >= o._min || value <= o._max);
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
                    return (l.equals(r) ? 0 : -1);
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
             * @memberof karbonator.math.Interval
             * @function
             * @param {Array.<karbonator.math.Interval>} intervals
             * @param {Number} [epsilon=karbonator.math.epsilon]
             * @param {Boolean} [mergePoints=false]
             * @return {Array.<karbonator.math.Interval>}
             */
            Interval.disjoin = (function () {
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
                
                return function (intervals) {
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
            }());
            
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
                var epsilon = karbonator.selectNonUndefined(arguments[3], karbonator.math.epsilon);
                var disjoinedIntervals = Interval.disjoin(intervals, epsilon, true);
                var intervalCount = disjoinedIntervals.length;
                var i, j = 0;
                
                if(intervalCount > 0) {
                    var min = disjoinedIntervals[j]._min;
                    if(Number.isInteger(min)) {
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
                        max + (Number.isInteger(max) ? 1 : epsilon),
                        min - (Number.isInteger(min) ? 1 : epsilon)
                    ));
                }
                
                if(i < intervalCount) {
                    var max = disjoinedIntervals[i]._max;
                    if(Number.isInteger(max)) {
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
                
                var targetIndex = (typeof(arguments[1]) !== "undefined" ? arguments[1] : 0);
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
             * @param {karbonator.math.Interval} rhs
             * @param {Number} [epsilon=karbonator.math.epsilon]
             * @return {Boolean}
             */
            Interval.prototype.equals = function (rhs) {
                var epsilon = arguments[1];
                return math.numberEquals(this._min, rhs._min, epsilon)
                    && math.numberEquals(this._max, rhs._max, epsilon)
                ;
            };
            
            /**
             * @function
             * @param {karbonator.math.Interval} rhs
             * @return {Boolean}
             */
            Interval.prototype.intersectsWith = function (rhs) {
                if(this._min < rhs._min) {
                    return this._max >= rhs._min && rhs._max >= this._min;
                }
                else {
                    return rhs._max >= this._min && this._max >= rhs._min;
                }
            };
            
            /**
             * @function
             * @param {karbonator.math.Interval|Array|String|Number} arg
             * @return {Boolean}
             */
            Interval.prototype.contains = function (arg) {
                var typeOfArg = typeof(arg);
                switch(typeOfArg) {
                case "object":
                    if(arg instanceof Interval) {
                        if(this._min < arg._min) {
                            return _isValueInInterval(this, arg._min)
                                && _isValueInInterval(this, arg._max)
                            ;
                        }
                        else {
                            return _isValueInInterval(arg, this._min)
                                && _isValueInInterval(arg, this._max)
                            ;
                        }
                    }
                    else if(Array.isArray(arg)) {
                        for(var i = 0, len = arg.length; i < len; ++i) {
                            if(!this.contains(arg[i])) {
                                return false;
                            }
                        }
                        
                        return true;
                    }
                    else {
                        throw new TypeError("The parameter must be either an Interval instance, an array, a string or a number.");
                    }
                //break;
                case "string":
                    for(var i = 0; i < arg.length; ++i) {
                        if(!_isValueInInterval(this, arg.charCodeAt(i))) {
                            return false;
                        }
                    }
                    
                    return true;
                //break;
                case "number":
                    return _isValueInInterval(this, arg);
                //break;
                default:
                    throw new TypeError("The parameter must be either an Interval instance, an array, a string or a number.");
                }
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
                
                if(Number.isInteger(this._min)) {
                    negatedIntervals.push(new Interval(
                        detail._selectInt(arguments[0], Number.MIN_SAFE_INTEGER),
                        this._min - 1
                    ));
                }
                else {
                    negatedIntervals.push(new Interval(
                        detail._selectFloat(arguments[0], -Number.MAX_VALUE),
                        this._min - karbonator.selectNonUndefined(arguments[2], karbonator.math.epsilon)
                    ));
                }
                
                if(Number.isInteger(this._max)) {
                    negatedIntervals.push(new Interval(
                        detail._selectInt(arguments[1], Number.MAX_SAFE_INTEGER),
                        this._max + 1
                    ));
                }
                else {
                    negatedIntervals.push(new Interval(
                        detail._selectFloat(arguments[1], Number.MAX_VALUE),
                        this._max + karbonator.selectNonUndefined(arguments[2], karbonator.math.epsilon)
                    ));
                }
                
                return negatedIntervals;
            };
            
            /**
             * @function
             * @return {String}
             */
            Interval.prototype.toString = function () {
                return '['
                    + detail._intToString(this._min)
                    + ", "
                    + detail._intToString(this._max)
                    + ']'
                ;
            };
            
            return Interval;
        })();
        
        /*////////////////////////////////*/
        
        /**
         * @function
         * @param {karbonator.math.Interval} l
         * @param {karbonator.math.Interval} r
         * @return {Number}
         */
        detail._intervalComparator = function (l, r) {
            if(l.equals(r)) {
                return 0;
            }
            
            return l._min - r._min;
        };
        
        return karbonator;
    })(global, karbonator);
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.string namespace.
    
    (function (global, karbonator) {
        "use strict";
        
        /**
         * @memberof karbonator
         * @namespace
         */
        var string = karbonator.string || {};
        karbonator.string = string;
        
        ////////////////////////////////
        //Namespace functions.
        
        /**
         * @memberof karbonator.string
         * @function
         * @param {String} lhs
         * @param {String} rhs
         * @return {Number}
         */
        string.compareTo = function (lhs, rhs) {
            if(detail._isString(lhs) || detail._isString(rhs)) {
                throw new TypeError("Both 'lhs' and 'rhs' must be strings.");
            }
            
            return detail._stringComparator(lhs, rhs);
        };
        
        ////////////////////////////////
        
        return karbonator;
    })(global, karbonator);
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
