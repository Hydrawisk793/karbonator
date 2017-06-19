/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-17
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(function () {
            return factory(g);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        module.exports = factory(g);
    }
    else {
        factory(g);
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global) {
    "use strict";
    
    var Object = global.Object;
    var Array = global.Array;
    var String = global.String;
    var Function = global.Function;
    var Number = global.Number;
    var Boolean = global.Boolean;
    var Math = global.Math;
    var Date = global.Date;
    var RegExp = global.RegExp;
    var Error = global.Error;
    var TypeError = global.TypeError;
    
    var _NaN = global.NaN;
    
    var _posInf = global.Infinity;
    
    var _negInf = -_posInf;
    
    var _polyfillPropNamePrefix = "_krbntr";
    
    var _hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    
    /**
     * @constructor
     */
    var _Array = (function () {
        var _Array = function () {
            Array.apply(this, arguments);
        };
        
        _Array.prototype = Array.prototype;
        
        return _Array;
    }());
    
    /**
     * @function
     * @param {*} v
     * @return {Number}
     */
    var _toInteger = function (v) {
        var n = Number(v);
        if(global.isNaN(n)) {
            return +0;
        }
        
        if(n === 0 || n === _posInf || n === _negInf) {
            return n;
        }
        
        return Math.sign(n) * Math.floor(Math.abs(n));
    };
    
    /**
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    var _isPositiveZero = function (n) {
        return 1 / n === _posInf;
    };
    
    /**
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    var _isNegativeZero = function (n) {
        return 1 / n === _negInf;
    };
    
    /**
     * @function
     * @param {Object} value
     * @param {Object} defaultValue
     */
    var _selectNonUndefined = function (value, defaultValue) {
        return (typeof(value) !== "undefined" ? value : defaultValue);
    };
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isNonNullObject = function (o) {
        return typeof(o) === "object"
            && o !== null
        ;
    };
    
    /**
     * TODO : test this code.
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isArray = function (o) {
        return _isNonNullObject(o)
            && o instanceof _Array //uses the 'snapshot' constructor function that has original 'Array.prototype'.
        ;
    };
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isString = function (o) {
        var result = false;
        
        switch(typeof(o)) {
        case "string":
            result = true;
        break;
        case "object":
            result = o instanceof String;
        //break;
        }
        
        return result;
    };
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isObjectOrFunction = function (o) {
        var result = false;
        
        switch(typeof(o)) {
        case "function":
        case "object":
            result = true;
        //break;
        }
        
        return result;
    };
    
    /**
     * @function
     * @param {Array} arr
     * @param {*} initialValue
     * @return {*}
     */
    var _selectInitialValueForReduce = function (arr, initialValue) {
        var selectedValue = _selectNonUndefined(initialValue, (arr.length > 0 ? _arrayLikeGetAt(arr, 0) : undefined));
        if(typeof(selectedValue) === "undefined") {
            throw new Error("On an empty array, the 'initialValue' argument must be passed.");
        }
        
        return selectedValue;
    };
    
    /**
     * @function
     * @param {Number} i
     * @param {Number} n
     * @return {Number}
     */
    var _adjustNegativeIndex = function (i, n) {
        return (i < 0 ? i + n : i);
    };
    
    /**
     * @function
     * @param {*} arrayLike
     * @param {Number} index
     * @return {*}
     */
    var _arrayLikeGetAt = function (arrayLike, index) {
        return (_isString(arrayLike) ? arrayLike.charAt(index) : arrayLike[index]);
    };
    
    /**
     * @function
     * @param {String} l
     * @param {String} r
     */
    var _stringComparator = function (l, r) {
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
    
    /**
     * @function
     * @param {Object} o
     */
    var _assertIsNonNullObjectOrFunction = function (o) {
        if(o === null || !_isObjectOrFunction(o)) {
            throw new Error("The parameter must be an object.");
        }
    };
    
    /**
     * @function
     * @param {Object} o
     */
    var _assertIsNotNullAndUndefined = function (o) {
        if(typeof(o) === "undefined" || o === null) {
            throw new Error("A non-null object must be passed.");
        }
    };
    
    /**
     * @function
     * @param {*} o
     */
    var _assertIsNotRegExp = function (o) {
        if(o instanceof RegExp) {
            throw new TypeError("The parameter must not be a regular expression");
        }
    };
    
    var ArrayKeyIterator = (function () {
        /**
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
    
    var ArrayValueIterator = (function () {
        /**
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
    
    
    var ArrayEntryIterator = (function () {
        /**
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
        
        var _getKeysFromObject = function (o) {
            if(typeof(o) === "undefined" || o === null) {
                _throwError();
            }
            
            var keys = [];
            for(var key in o) {
                if(_hasOwnPropertyFunction.call(o, key)) {
                    keys.push(key);
                }
            }
            
            if(_canNotEnumerateToString) {
                for(var key in _missingKeys) {
                    if(!_hasOwnPropertyFunction.call(o, key)) {
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
        Object.create = (function (proto) {
            if(!_isObjectOrFunction(proto)) {
                throw new TypeError("The parameter 'proto' must be an object.");
            }
            
            if(proto === null) {
                throw new Error("This polyfill doesn't support null argument for the 'proto' parameter.");
            }
            
            var Derived = function () {};
            Derived.prototype = proto;
            
            var newObject = new Derived();
            newObject.constructor = proto.constructor;
            if(arguments.length > 1) {
                Object.defineProperties(Derived.prototype, arguments[1]);
            }
            
            return newObject;
        });
    }
    
    if(!Object.getPrototypeOf) {
        Object.getPrototypeOf = (function (o) {
            _assertIsNotNullAndUndefined(o);
            
            if(!(o.__proto__)) {
                throw new Error("This environment doesn't support retrieving prototype of an object and the passed object also does't have '__proto__' property.");
            }
            
            return o.__proto__;
        });
    }
    
    if(!Object.setPrototypeOf) {
        Object.setPrototypeOf = (function (o, proto) {
            if(proto !== null && _isObjectOrFunction(proto)) {
                _assertIsNotNullAndUndefined(o);
                
                if(!Object.prototype.hasOwnProperty("__proto__")) {
                    throw new Error("This environment doesn't support replacing prototype.");
                }
                
                o.__proto__ = proto;
            }
        });
    }
    
    Object.defineProperty = (function (global) {
        var originalDefineProperty = Object.defineProperty;
        var pseudoDefineProperty = function (o, propName, descriptor) {
            descriptor.configurable = _selectNonUndefined(descriptor.configurable, false);
            descriptor.enumerable = _selectNonUndefined(descriptor.enumerable, false);
            if(!descriptor.configurable && !descriptor.enumerable) {
                throw new Error("This environment doesn't allow programmers to define non-configurable and non-enumerable properties.");
            }
            if("value" in descriptor) {
                descriptor.writable = _selectNonUndefined(descriptor.writable, false);
            }
            else if(("get" in descriptor) || ("set" in descriptor)) {
                throw new Error("This environment doesn't allow programmers to define accessor properties.");
                
                //descriptor.get = _selectNonUndefined(descriptor.get, undefined);
                //descriptor.set = _selectNonUndefined(descriptor.set, undefined);
            }
            else if(!("writable" in descriptor)) {
                descriptor.value = undefined;
                descriptor.writable = false;
            }
            else {
                descriptor.value = undefined;
            }
            if(!descriptor.writable) {
                throw new Error("This environment doesn't allow programmers to define readonly data properties.");
            }
            
            o[propName] = descriptor.value;
            
            return o;
        };
        
        if(originalDefineProperty) {
            try {
                Object.defineProperty({}, "_", {});
                
                return originalDefineProperty;
            }
            catch(e) {
                var ie8DefineProperty = Object.defineProperty;
                var isDomObject = (function (global) {
                    if(global.HTMLElement) {
                        return function (o) {
                            return o instanceof global.HTMLElement;
                        };
                    }
                    else if(global.HTMLDocument && global.Element) {
                        return function (o) {
                            return o instanceof global.Element
                                && typeof(o.ownerDocument) === "object"
                            ;
                        };
                    }
                    else {
                        return function (o) {
                            return (typeof(o) === "object")
                                && (o.nodeType === 1)
                                && (typeof(o.style) === "object")
                            ;
                        };
                    }
                }(global));
                
                return function (o, propName, descriptor) {
                    if(isDomObject(o)) {
                        return originalDefineProperty(o, propName, descriptor);
                    }
                    else {
                        return pseudoDefineProperty(o, propName, descriptor);
                    }
                };
            }
        }
        else {
            return pseudoDefineProperty;
        }
    }(global));
    
    if(!Array.from) {
        Array.from = function (arrayLike) {
            var mapFn = arguments[1];
            var mapFnExist = (typeof(mapFn) === "function");
            var thisArg = arguments[2];
            var arr = [];
            var elem = null;
            
            if(Array.isArray(arrayLike)) {
                for(var i = 0, paramLen = arrayLike.length; i < paramLen; ++i) {
                    elem = arrayLike[i];
                    arr.push(elem);
                    if(mapFnExist) {
                        mapFn.call(thisArg, elem, i);
                    }
                }
            }
            else if(arrayLike[global.Symbol.iterator]) {
                for(
                    var i = arrayLike[global.Symbol.iterator](), iP = i.next(), j = 0;
                    !iP.done;
                    iP = i.next(), ++j
                ) {
                    elem = iP.value;
                    arr.push(elem);
                    if(mapFnExist) {
                        mapFn.call(thisArg, elem, j);
                    }
                }
            }
            
            return arr;
        };
    }
    
    if(!Array.of) {
        Array.of = function () {
            return Array.prototype.slice.call(arguments);
        };
    }
    
    if(!Array.isArray) {
        Array.isArray = _isArray;
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
                    switch(typeof(comparator)) {
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
            target = _adjustNegativeIndex(target, len);
            var start = _adjustNegativeIndex(_selectNonUndefined(arguments[1], 0), len);
            var end = _adjustNegativeIndex(_selectNonUndefined(arguments[2], len), len);
            
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
            var start = _adjustNegativeIndex(_selectNonUndefined(arguments[1], 0), len);
            var end = _adjustNegativeIndex(_selectNonUndefined(arguments[2], len), len);
            
            if(_isString(this)) {
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
                arr.push(callback.call(thisArg, _arrayLikeGetAt(this, i), i, this));
            }
            
            return arr;
        };
    }
    
    if(!Array.prototype.reduce) {
        Array.prototype.reduce = function (callback) {
            var acc = _selectInitialValueForReduce(this, arguments[1]);
            for(var i = 0, len = this.length; i < len ; ++i) {
                acc = callback(acc, _arrayLikeGetAt(this, i), i, this);
            }
            
            return acc;
        };
    }
    
    if(!Array.prototype.reduceRight) {
        Array.prototype.reduceRight = function (callback) {
            var acc = _selectInitialValueForReduce(this, arguments[1]);
            for(var i = this.length; i > 0; ) {
                --i;
                acc = callback(acc, _arrayLikeGetAt(this, i), i, this);
            }
            
            return acc;
        };
    }
    
    if(!Array.prototype.findIndex) {
        Array.prototype.findIndex = function (callback) {
            var index = 0;
            for(var thisArg = arguments[1]; index < this.length; ++index) {
                if(callback.call(thisArg, this[index], index, this)) {
                    return index;
                }
            }
            
            return -1;
        };
    }
    
    if(!Array.prototype.some) {
        Array.prototype.some = function (callback) {
            return (this.findIndex(callback) >= 0);
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
            var index = _selectNonUndefined(arguments[1], 0);
            for(; index < this.length; ++index) {
                if(this[index] === elem) {
                    break;
                }
            }
            
            return (index < this.length ? index : -1);
        };
    }
    
    if(!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function (elem) {
            var index = _selectNonUndefined(arguments[1], this.length - 1);
            for(; index >= 0; --index) {
                if(this[index] === elem) {
                    break;
                }
            }
            
            return (index >= 0 ? index : -1);
        };
    }
    
    if(!Array.prototype.includes) {
        Array.prototype.includes = function (elem) {
            return (this.indexOf(elem, arguments[1]) >= 0);
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
            return new ArrayEntryIterator(this);
        };
    }
    
    if(!Array.prototype.keys) {
        Array.prototype.keys = function () {
            return new ArrayKeyIterator(this);
        };
    }
    
    if(!Array.prototype.values) {
        Array.prototype.values = function () {
            return new ArrayValueIterator(this);
        };
    }
    
    if(!String.prototype.repeat) {
        String.prototype.repeat = function (count) {
            count = Math.trunc(count);
            if(count < 0 || count === _posInf) {
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
            _assertIsNotRegExp(other);
            
            return this.substr(
                (arguments.length > 1 ? arguments[1] : 0),
                other.length
            ) === other;
        };
    }
    
    if(!String.prototype.endsWith) {
        String.prototype.endsWith = function (other) {
            _assertIsNotRegExp(other);
            
            var s = this.substr(0, (arguments.length > 1 ? arguments[1] : this.length));
            
            return s.substr(s.length - other.length, other.length) === other;
        };
    }
    
    if(!Function.prototype.bind) {
        //reference 1 : https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
        //reference 2 : https://www.reddit.com/r/javascript/comments/5ovl09/understanding_functionprototypebind_polyfill/
        Function.prototype.bind = function (thisArg) {
            if(typeof(this) !== "function") {
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
        Number.MIN_SAFE_INTEGER = -9007199254740991;
    }
    
    if(!Number.MAX_SAFE_INTEGER) {
        Number.MAX_SAFE_INTEGER = 9007199254740991;
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
        Number.isInteger = function (v) {
            return Number.isFinite(v) && v === _toInteger(v);
        };
    }
    
    if(!Number.isSafeInteger) {
        Number.isSafeInteger = function (v) {
            return Number.isInteger(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER;
        };
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
                ? _NaN
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
                return _NaN;
            }
            
            var isNegZero = _isNegativeZero(n);
            if(isNegZero) {
                return -0;
            }
            
            var isPosZero = _isPositiveZero(n);
            if(isPosZero) {
                return +0;
            }
            
            if(n < 0 && !isNegZero) {
                return -1;
            }
            
            if(n > 0 && !isPosZero) {
                return +0;
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
            return Math.exp(x) - 1
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
                    return _NaN;
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
    
    if(!global.Reflect) {
        global.Reflect = {
            apply : function (target, thisArg, args) {
                return Function.prototype.apply.call(target, thisArg, args);
            },
            
            construct : function (ctor, args) {
                if(arguments.length > 2) {
                    throw new Error("This polyfill doesn't support the third argument 'newTarget'.");
                }
                
                var newObj = Object.create(ctor.prototype);
                ctor.apply(newObj, args);
                
                return newObj;
            },
            
            has : function (target, key) {
                return (key in target);
            },
            
            ownKeys : function (target) {
                _assertIsNonNullObjectOrFunction(target);
                
                return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
            },
            
            getOwnPropertyDescriptor : function () {
                throw new Error("Not polyfilled yet...");
            },
            
            defineProperty : function (target, propName, descriptor) {
                try {
                    Object.defineProperty(target, propName, descriptor);
                    
                    return true;
                }
                catch(e) {
                    return false;
                }
            },
            
            deleteProperty : function (target, propKey) {
                return delete target[propKey];
            },
            
            get : function () {
                throw new Error("Not polyfilled yet...");
            },
            
            set : function (target, propName, value) {
                throw new Error("Not polyfilled yet...");
            },
            
            getPrototypeOf : function (target) {
                return Object.getPrototypeOf(target);
            },
            
            setPrototypeOf : function (target, proto) {
                throw new Error("Not polyfilled yet...");
            },
            
            isExtensible : function (target) {
                _assertIsNonNullObjectOrFunction(target);
                
                return Object.isExtensible(target);
            },
            
            preventExtensions : function () {
                throw new Error("Not polyfilled yet...");
            }
        };
    }
    
    if(!global.Symbol) {
        global.Symbol = (function () {
            var _symbolKeyPrefix = _polyfillPropNamePrefix + "Symbol";
            
            /**
             * @function
             * @param {*} arg
             * @return {String}
             */
            var _createKey = function (arg) {
                var key = "";
                
                switch(typeof(arg)) {
                case "string":
                    key = arg;
                break;
                case "object":
                    key = (arg === null ? "null" : arg.toString());
                break;
                case "undefined":
                    key = "";
                break;
                default:
                    key = arg.toString();
                }
                
                return key;
            };
            
            var _globalIdCounter = 0;
            
            var _FakeSymbolCtor = function () {
                this._key = _createKey(arguments[0]);
                
                //A non-standard behaviour to distinguish each symbol instances...
                this._id = ++_globalIdCounter;
                if(this._id === 0) {
                    throw new Error("The Symbol polyfill cannot instantiate additional distinguishing symbols...");
                }
            };
            _FakeSymbolCtor.prototype = Object.create(Object.prototype);
            
            /**
             * Creates and returns a new symbol using a optional parameter 'description' as a key.<br/>
             * There is no way to force not using the new operator 
             * because the 'new.target' virtual property does not exist in Es3 environment.<br/>
             * references: <br/>
             * - http://ecma-international.org/ecma-262/5.1/#sec-9.12 <br/>
             * - https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/ <br/>
             * @constructor
             * @param {String} [description=""]
             * @return {Symbol}
             */
            var Symbol = function () {
                //This code can't be a complete alternative of 'new.target' proposed in Es6 spec
                //because this can cause some problems
                //when Object.create(Symbol.prototype) is used to inherit 'Symbol.prototype'.
                //if((this instanceof Symbol)) {
                //    throw new TypeError("'Symbol' cannot be instantiated by the new operator.");
                //}
                
                var arg = arguments[0];
                //It works because of it's a polyfill which is an object...
                if(arg instanceof Symbol) {
                    throw new TypeError("Cannot convert symbol value to string.");
                }
                var newSymbol = new _FakeSymbolCtor(arg);
                
                return newSymbol;
            };
            Symbol.prototype = _FakeSymbolCtor.prototype;
            Symbol.prototype.constructor = Symbol;
            
            var _Registry = (function () {
                /**
                 * @constructor
                 */
                var _Registry = function () {
                    this._registry = [];
                };
                
                /**
                 * @function
                 * @param {String} key
                 * @return {Boolean}
                 */
                _Registry.prototype.hasSymbol = function (key) {
                    return this._findPairIndexByKey(key) >= 0;
                };
                
                /**
                 * @function
                 * @param {Symbol} symbol
                 * @return {String|undefined}
                 */
                _Registry.prototype.findKeyBySymbol = function (symbol) {
                    var index = this._registry.findIndex(
                        function (pair) {
                            //Es6 스펙 19.4.2.5절에 따라 === 사용.
                            return pair.value === symbol
                                //&& pair.key === symbol._key
                            ;
                        }
                    );
                    if(index >= 0) {
                        return this._registry[index].key;
                    }
                };
                
                /**
                 * @function
                 * @param {String} key
                 * @return {Symbol}
                 */
                _Registry.prototype.getOrCreateSymbolByKey = function (key) {
                    var index = this._findPairIndexByKey(key);
                    if(index < 0) {
                        index = this._registry.length;
                        this._registry.push({key : key, value : Symbol(key)});
                    }
                    
                    return this._registry[index].value;
                };
                
                /**
                 * @function
                 * @param {String} key
                 * @return {Number}
                 */
                _Registry.prototype._findPairIndexByKey = function (key) {
                    return this._registry.findIndex(
                        function (pair) {
                            return pair.key === key;
                        }
                    );
                };
                
                return _Registry;
            })();
            
            var _globalRegistry = new _Registry();
            
            (function () {
                var _knownSymbolKeys = [
                    "iterator",
                    "match",
                    "replace",
                    "search",
                    "split",
                    "hasInstance",
                    "isConcatSpreadable",
                    "unscopables",
                    "species",
                    "toPrimitive",
                    "toStringTag"
                ];
                
                for(var i = 0; i < _knownSymbolKeys.length; ++i) {
                    var knownSymbolKey = _knownSymbolKeys[i];
                    Symbol[knownSymbolKey] = Symbol(knownSymbolKey);
                }
            }());
            
            /**
             * @memberof Symbol
             * @function
             * @param {String} key
             * @return {Symbol}
             */
            Symbol["for"] = function (key) {
                return _globalRegistry.getOrCreateSymbolByKey(
                    _createKey(_selectNonUndefined(key, "undefined"))
                );
            };
            
            /**
             * @memberof Symbol
             * @function
             * @param {Symbol} symbol
             * @return {String|undefined}
             */
            Symbol.keyFor = function (symbol) {
                return _globalRegistry.findKeyBySymbol(symbol);
            };
            
            /**
             * A non-standard function to get 'SymbolDescriptiveString'.
             * @function
             * @return {String}
             */
            Symbol.prototype.toSymbolDescriptiveString = function () {
                return "Symbol(" + this._key + ")";
            };
            
            /**
             * Outputs a 'non-standard' string for distinguishing each symbol instances.
             * To get a 'SymbolDescriptiveString' described in the standard,
             * use a non-standard function 'Symbol.prototype.toSymbolDescriptiveString' instead.
             * @function
             * @return {String}
             * @see Symbol.prototype.toSymbolDescriptiveString
             */
            Symbol.prototype.toString = function () {
                return _symbolKeyPrefix + this._id + "_" + this.toSymbolDescriptiveString();
            };
            
            /**
             * @function
             * @return {Symbol}
             */
            Symbol.prototype.valueOf = function () {
                return this;
            };
            
    //        /**
    //         * @function
    //         * @param {String} hint
    //         * @return {Symbol}
    //         */
    //        Symbol.prototype[Symbol.toPrimitive] = function (hint) {
    //            return this.valueOf();
    //        };
            
            var _symbolKeyPattern = new RegExp("^" + _symbolKeyPrefix + "[0-9]+_");
            
            if(!Array.prototype[Symbol.iterator]) {
                Array.prototype[Symbol.iterator] = Array.prototype.values;
            }
            
            if(!String.prototype[Symbol.iterator]) {
                String.prototype[Symbol.iterator] = function () {
                    return new StringValueIterator(this);
                };
            }
            
            return Symbol;
        }());
    }
})
));
