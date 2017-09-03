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
        factory(g, karbonator);
    }
}(
(
    typeof(global) !== "undefined"
    ? global
    : (typeof(window) !== "undefined" ? window : this)
),
(function (global, karbonator) {
    "use strict";
    
    var Object = global.Object;
    var Array = global.Array;
    var String = global.String;
    var Function = global.Function;
    var Number = global.Number;
    var Math = global.Math;
    var Date = global.Date;
    var RegExp = global.RegExp;
    var Error = global.Error;
    var TypeError = global.TypeError;
    
    var detail = karbonator.detail;
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._polyfillPropNamePrefix = "_krbntr";
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Object} arrayLike
     * @param {Number} index
     * @return {*}
     */
    detail._arrayLikeGetAt = function (arrayLike, index) {
        return (
            karbonator.isString(arrayLike)
            ? arrayLike.charAt(index)
            : arrayLike[index]
        );
    };
    
    /**
     * @function
     * @param {Array} arr
     * @param {*} initialValue
     * @return {*}
     */
    detail._selectInitialValueForReduce = function (arr, initialValue) {
        var selectedValue = initialValue;
        if(karbonator.isUndefined(initialValue)) {
            if(arr.length > 0) {
                selectedValue = detail._arrayLikeGetAt(arr, 0);
            }
            else {
                throw new Error(
                    "On an empty array, "
                    + "the 'initialValue' argument must be passed."
                );
            }
        }
        
        return selectedValue;
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Number} i
     * @param {Number} n
     * @return {Number}
     */
    detail._adjustNegativeIndex = function (i, n) {
        return (i < 0 ? i + n : i);
    };
    
    Object.keys = (function () {
        var _originalKeys = Object.keys;
        
        var _isOriginalEs6Spec = (function () {
            if(_originalKeys) {
                try {
                    _originalKeys("");
                    
                    return true;
                }
                catch(e) {
                    return false;
                }
            }
            
            return false;
        }());
        
        var _missingKeys = [
            "constructor",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "toLocaleString",
            "toString",
            "valueOf"
        ];
        
        var _canNotEnumerateToString = !({toString : null}).propertyIsEnumerable("toString");
        
        var _throwError = function () {
            throw new Error("At least one non-null object argument must be passed.");
        };
        
        var _hasOwnPropertyMethod = Object.prototype.hasOwnProperty;
        
        var _getKeysFromObject = function (o) {
            if(karbonator.isUndefinedOrNull(o)) {
                _throwError();
            }
            
            var keys = [];
            for(var key in o) {
                if(_hasOwnPropertyMethod.call(o, key)) {
                    keys.push(key);
                }
            }
            
            if(_canNotEnumerateToString) {
                for(var key in _missingKeys) {
                    if(!_hasOwnPropertyMethod.call(o, key)) {
                        keys.push(key);
                    }
                }
            }
            
            return keys;
        };
        
        var _getKeysFromString = function (o) {
            var keys = [];
            
            for(var i = 0; i < o.length; ++i) {
                keys.push("" + i);
            }
            
            return keys;
        };
        
        var _pseudoKeys = function (o, getKeysFromObjectFunction) {
            switch(typeof(o)) {
            case "undefined":
                _throwError();
            break;
            case "boolean":
            case "number":
            case "symbol":
                return [];
            break;
            case "string":
                return _getKeysFromString(o);
            break;
            default:
                return getKeysFromObjectFunction(o);
            }
        };
        
        if(_originalKeys) {
            if(_isOriginalEs6Spec) {
                return _originalKeys;
            }
            else {
                return function (o) {
                    return _pseudoKeys(o, _originalKeys);
                };
            }
        }
        else {
            return function (o) {
                return _pseudoKeys(o, _getKeysFromObject);
            };
        }
    }());
    
    if(!Object.create) {
        Object.create = detail._objectCreate;
    }
    
    if(!Object.getPrototypeOf) {
        Object.getPrototypeOf = function (o) {
            if(karbonator.isUndefinedOrNull(o)) {
                throw new TypeError("The parameter cannot be undefined or null.");
            }
            
            if(!(o.__proto__)) {
                throw new Error("This environment doesn't support retrieving prototype of an object and the passed object also does't have '__proto__' property.");
            }
            
            return o.__proto__;
        };
    }
    
    detail._ArrayKeyIterator = (function () {
        /**
         * @memberof karbonator.detail
         * @constructor
         * @param {Array} arr
         */
        var ArrayKeyIterator = function (arr) {
            this._arr = arr;
            this._i = 0;
        };
        
        /**
         * @function
         * @return {Object}
         */
        ArrayKeyIterator.prototype.next = function () {
            var done = this._i >= this._arr.length;
            var result = {
                value : (done ? undefined : this._i),
                done : done
            };
            
            if(!done) {
                ++this._i;
            }
            
            return result;
        };
        
        return ArrayKeyIterator;
    }());
    
    detail._ArrayValueIterator = (function () {
        /**
         * @memberof karbonator.detail
         * @constructor
         * @param {Array} arr
         */
        var ArrayValueIterator = function (arr) {
            this._arr = arr;
            this._i = 0;
        };
        
        /**
         * @function
         * @return {Object}
         */
        ArrayValueIterator.prototype.next = function () {
            var done = this._i >= this._arr.length;
            var result = {
                value : (done ? undefined : this._arr[this._i]),
                done : done
            };
            
            if(!done) {
                ++this._i;
            }
            
            return result;
        };
        
        return ArrayValueIterator;
    }());
    
    detail._ArrayEntryIterator = (function () {
        /**
         * @memberof karbonator.detail
         * @constructor
         * @param {Array} arr
         */
        var ArrayEntryIterator = function (arr) {
            this._arr = arr;
            this._i = 0;
        };
        
        /**
         * @function
         * @return {Object}
         */
        ArrayEntryIterator.prototype.next = function () {
            var done = this._i >= this._arr.length;
            var result = {
                value : (done ? undefined : [this._i, this._arr[this._i]]),
                done : done
            };
            
            if(!done) {
                ++this._i;
            }
            
            return result;
        };
        
        return ArrayEntryIterator;
    }());
    
    if(!Array.from) {
        Array.from = function (arrayLike) {
            return detail._arrayFromFunctionBody(
                [], null,
                "push", arrayLike,
                arguments[1], arguments[2]
            );
        };
    }
    
    if(!Array.of) {
        Array.of = function () {
            return Array.prototype.slice.call(arguments);
        };
    }
    
    if(!Array.isArray) {
        Array.isArray = karbonator.isArray;
    }
    
    Array.prototype.sort = (function () {
        var _originalSort = Array.prototype.sort;
        if(_originalSort) {
            var _allowsNonFunctionArg = (function () {
                var result = false;
                
                try {
                    [7, 9, 3].sort(null);
                    
                    result = true;
                }
                catch(e) {}
                
                return result;
            }());
            
            if(_allowsNonFunctionArg) {
                return function (comparator) {
                    switch(typeof comparator) {
                    case "undefined":
                        return _originalSort.call(this);
                    break;
                    case "function":
                        return _originalSort.call(this, comparator);
                    break;
                    default:
                        throw new TypeError("The 'comparator' must be a function or an undefined value.");
                    }
                };
            }
            else {
                return _originalSort;
            }
        }
        else {
            return function (comparator) {
                throw new Error("Not polyfilled yet...");
            };
        }
    }());
    
    if(!Array.prototype.copyWithin) {
        Array.prototype.copyWithin = function (target) {
            var len = this.length;
            target = detail._adjustNegativeIndex(target, len);
            var start = detail._adjustNegativeIndex(detail._selectNonUndefined(arguments[1], 0), len);
            var end = detail._adjustNegativeIndex(detail._selectNonUndefined(arguments[2], len), len);
            
            for(var i = target + (end - start), j = end; i > target && j > start; ) {
                --i, --j;
                if(i < len && (j in this)) {
                    this[i] = this[j];
                }
            }
            
            return this;
        };
    }
    
    if(!Array.prototype.fill) {
        Array.prototype.fill = function (value) {
            var len = this.length;
            var start = detail._adjustNegativeIndex(detail._selectNonUndefined(arguments[1], 0), len);
            var end = detail._adjustNegativeIndex(detail._selectNonUndefined(arguments[2], len), len);
            
            if(karbonator.isString(this)) {
                if(len < 1) {
                    return this;
                }
                else {
                    throw new Error("Cannot modify readonly property '0'.");
                }
            }
            else {
                for(var i = start; i < end; ++i) {
                    this[i] = value;
                }
            }
            
            return this;
        };
    }
    
    if(!Array.prototype.map) {
        Array.prototype.map = function (callback) {
            var thisArg = arguments[1];
            
            var arr = [];
            for(var i = 0, len = this.length; i < len; ++i) {
                arr.push(callback.call(thisArg, detail._arrayLikeGetAt(this, i), i, this));
            }
            
            return arr;
        };
    }
    
    if(!Array.prototype.reduce) {
        Array.prototype.reduce = function (callback) {
            var acc = detail._selectInitialValueForReduce(this, arguments[1]);
            for(var i = 0, len = this.length; i < len ; ++i) {
                acc = callback(acc, detail._arrayLikeGetAt(this, i), i, this);
            }
            
            return acc;
        };
    }
    
    if(!Array.prototype.reduceRight) {
        Array.prototype.reduceRight = function (callback) {
            var acc = detail._selectInitialValueForReduce(this, arguments[1]);
            for(var i = this.length; i > 0; ) {
                --i;
                acc = callback(acc, detail._arrayLikeGetAt(this, i), i, this);
            }
            
            return acc;
        };
    }
    
    if(!Array.prototype.findIndex) {
        Array.prototype.findIndex = detail._arrayFindIndex;
    }
    
    if(!Array.prototype.some) {
        Array.prototype.some = function (callback) {
            return this.findIndex(callback) >= 0;
        };
    }
    
    if(!Array.prototype.every) {
        Array.prototype.every = function (callback) {
            var thisArg = arguments[1];
            
            var index = 0;
            for(; index < this.length; ++index) {
                if(!callback.call(thisArg, this[index], index, this)) {
                    return false;
                }
            }
            
            return true;
        };
    }
    
    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elem) {
            var index = detail._selectNonUndefined(arguments[1], 0);
            for(; index < this.length; ++index) {
                if(this[index] === elem) {
                    break;
                }
            }
            
            return index < this.length ? index : -1;
        };
    }
    
    if(!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function (elem) {
            var index = detail._selectNonUndefined(arguments[1], this.length - 1);
            for(; index >= 0; --index) {
                if(this[index] === elem) {
                    break;
                }
            }
            
            return index >= 0 ? index : -1;
        };
    }
    
    if(!Array.prototype.includes) {
        Array.prototype.includes = function (elem) {
            return this.indexOf(elem, arguments[1]) >= 0;
        };
    }
    
    if(!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback) {
            for(var i = 0, thisArg = arguments[1]; i < this.length; ++i) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }
    
    if(!Array.prototype.entries) {
        Array.prototype.entries = function () {
            return new detail._ArrayEntryIterator(this);
        };
    }
    
    if(!Array.prototype.keys) {
        Array.prototype.keys = function () {
            return new detail._ArrayKeyIterator(this);
        };
    }
    
    if(!Array.prototype.values) {
        Array.prototype.values = function () {
            return new detail._ArrayValueIterator(this);
        };
    }
    
    var StringValueIterator = (function () {
        /**
         * @constructor
         * @param {String} str
         */
        var StringValueIterator = function (str) {
            this._str = str;
            this._i = 0;
        };
        
        /**
         * @function
         * @return {Object}
         */
        StringValueIterator.prototype.next = function () {
            var done = this._i >= this._str.length;
            var result = {
                value : (done ? undefined : this._str.charAt(this._i)),
                done : done
            };
            
            if(!done) {
                ++this._i;
            }
            
            return result;
        };
        
        return StringValueIterator;
    }());
    
    if(!String.prototype.repeat) {
        String.prototype.repeat = function (count) {
            count = Math.trunc(count);
            if(count < 0 || count === global.Infinity) {
                throw new RangeError("The parameter 'count' must be greater than or equal to zero and less than positive infinity.");
            }
            
            var str = "";
            for(var i = 0; i < count; ++i) {
                str += this;
            }
            
            return str;
        };
    }
    
    if(!String.prototype.trim) {
        //https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/trim
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }
    
    if(!String.prototype.includes) {
        String.prototype.includes = function (elem) {
            return (this.indexOf(elem, arguments[1]) >= 0);
        };
    }
    
    if(!String.prototype.startsWith) {
        String.prototype.startsWith = function (other) {
            if(other instanceof RegExp) {
                throw new TypeError("The parameter must not be a RegExp object.");
            }
            
            return this.substr(
                (arguments.length > 1 ? arguments[1] : 0),
                other.length
            ) === other;
        };
    }
    
    if(!String.prototype.endsWith) {
        String.prototype.endsWith = function (other) {
            if(other instanceof RegExp) {
                throw new TypeError("The parameter must not be a RegExp object.");
            }
            
            var s = this.substr(0, (arguments.length > 1 ? arguments[1] : this.length));
            
            return s.substr(s.length - other.length, other.length) === other;
        };
    }
    
    if(!Function.prototype.bind) {
        //reference 1 : https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
        //reference 2 : https://www.reddit.com/r/javascript/comments/5ovl09/understanding_functionprototypebind_polyfill/
        Function.prototype.bind = function (thisArg) {
            if(!karbonator.isFunction(this)) {
                throw new TypeError("'this' must be a function.");
            }
            
            var args = Array.prototype.slice.call(arguments, 1);
            var TempFunction = function () {};
            var _this = this;
            var FunctionWrapper = function () {
                return _this.apply(
                    (this instanceof TempFunction ? this : thisArg),
                    args.concat(Array.prototype.slice.call(arguments))
                );
            };
            
            if(this.prototype) {
                TempFunction.prototype = this.prototype;
            }
            FunctionWrapper.prototype = new TempFunction();
            
            return FunctionWrapper;
        };
    }
    
    if(!Number.EPSILON) {
        Number.EPSILON = 2.2204460492503130808472633361816e-16;
    }
    
    if(!Number.MIN_SAFE_INTEGER) {
        Number.MIN_SAFE_INTEGER = karbonator.minimumSafeInteger;
    }
    
    if(!Number.MAX_SAFE_INTEGER) {
        Number.MAX_SAFE_INTEGER = karbonator.maximumSafeInteger;
    }
    
    if(!Number.isNaN) {
        Number.isNaN = global.isNaN
            || (function (v) {
                throw new Error("Not polyfilled yet...");
            })
        ;
    }
    
    if(!Number.isFinite) {
        Number.isFinite = global.isFinite
            || (function (v) {
                throw new Error("Not polyfilled yet...");
            })
        ;
    }
    
    if(!Number.isInteger) {
        Number.isInteger = karbonator.isInteger;
    }
    
    if(!Number.isSafeInteger) {
        Number.isSafeInteger = karbonator.isSafeInteger;
    }
    
    if(!Number.parseInt) {
        Number.parseInt = global.parseInt
            || (function () {
                throw new Error("Not polyfilled yet...");
            })
        ;
    }
    
    if(!Number.parseFloat) {
        Number.parseFloat = global.parseFloat
            || (function () {
                throw new Error("Not polyfilled yet...");
            })
        ;
    }
    
    if(!Math.trunc) {
        Math.trunc = function (x) {
            return (
                Number.isNaN(x)
                ? global.NaN
                : (
                    x < 0
                    ? Math.ceil(x)
                    : Math.floor(x)
                )
            );
        };
    }
    
    if(!Math.sign) {
        Math.sign = function (n) {
            if(Number.isNaN(n)) {
                return global.NaN;
            }
            
            var isNegZero = karbonator.isNegativeZero(n);
            if(isNegZero) {
                return -0;
            }
            
            var isPosZero = karbonator.isPositiveZero(n);
            if(isPosZero) {
                return +0;
            }
            
            if(n < 0 && !isNegZero) {
                return -1;
            }
            
            if(n > 0 && !isPosZero) {
                return +1;
            }
        };
    }
    
//    if(!Math.clz32) {
//        Math.clz32 = function (x) {
//            
//        };
//    }
        
//    if(!Math.imul) {
//        Math.imul = function (x, y) {
//            
//        };
//    }
    
    if(!Math.expm1) {
        Math.expm1 = function (x) {
            return Math.exp(x) - 1;
        };
    }
    
    if(!Math.log1p) {
        Math.log1p = function (x) {
            return Math.log(1 + x);
        };
    }
    
    if(!Math.log10) {
        Math.log10 = function (x) {
            return Math.log(x) * Math.LOG10E;
        };
    }
    
    if(!Math.log2) {
        Math.log2 = function (x) {
            return Math.log(x) * Math.LOG2E;
        };
    }
    
    if(!Math.hypot) {
        Math.hypot = function () {
            var sum = 0;
            for(var i = 0, len = arguments.length; i < len; ++i) {
                var n = Number(arguments[i]);
                if(Number.isNaN(n)) {
                    return global.NaN;
                }
                
                sum += n * n;
            }
            
            return Math.sqrt(sum);
        };
    }
    
    if(!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        };
    }
    
    global.Symbol = karbonator.getEsSymbol();
    
    if(!Array.prototype[global.Symbol.iterator]) {
        Array.prototype[global.Symbol.iterator] = Array.prototype.values;
    }

    if(!String.prototype[global.Symbol.iterator]) {
        String.prototype[global.Symbol.iterator] = function () {
            return new StringValueIterator(this);
        };
    }
    
    global.Reflect = karbonator.getEsReflect();
    
    return karbonator;
})
));
