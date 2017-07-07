/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * disclaimer : The author is not responsible for any problems 
 * that that may arise by using this source code.
 */

/**
 * @param {global|window} g
 * @param {Function} factory
 */
(function (g, factory) {
    "use strict";
    
    if(typeof(g.define) === "function" && g.define.amd) {
        g.define(["./karbonator.polyfill-es"],
            function (karbonator) {
                return factory(g, karbonator);
            }
        );
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.polyfill-es")
        );
    }
}(
(
    typeof(global) !== "undefined"
    ? global
    : (typeof(window) !== "undefined" ? window : this)
),
(function (global, karbonator) {
    "use strict";
    
    var detail = karbonator.detail;
    var assertion = karbonator.assertion;
    
    var Number = global.Number;
    var Symbol = detail._selectSymbol();
    var Reflect = detail._selectReflect();
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._identifierRegEx = /^[a-zA-Z$_][0-9a-zA-Z$_]*$/;
    
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
            !karbonator.isUndefined(global.process)
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
     * @param {Function} callback
     * @return {Number}
     */
    detail._requestAnimationFrame = (
        window
        ? (
            window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
        )
        : (function (callback) {
            return global.setTimeout(callback, 1000 / 60);
        })
    );
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Number} id
     */
    detail._cancelAnimationFrame = (
        window
        ? (
            window.cancelAnimationFrame
            || window.webkitCancelAnimationFrame
            || window.mozCancelAnimationFrame
            || window.oCancelAnimationFrame
            || window.msCancelAnimationFrame
        )
        : (function (id) {
            global.clearTimeout(id);
        })
    );
    
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
    
    /*////////////////////////////////////////////////////////////////*/
    //The snapshots of 'polyfilled' ECMAScript built-in objects
    
    var Object = global.Object;
    var Array = global.Array;
    var Date = global.Date;
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator namespace.
    
    /*////////////////////////////////*/
    //Trait test functions.
    
    /**
     * @readonly
     */
    detail._twoPower8 = 256;
    
    /**
     * @readonly
     */
    detail._twoPower16 = 65536;
    
    /**
     * @readonly
     */
    detail._twoPower32 = 4294967296;
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isCallable = function (o) {
        return karbonator.isFunction(o);
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isBoolean = function (o) {
        return "boolean" === typeof o
            || o instanceof Boolean
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isNumber = function (o) {
        return ("number" === typeof o || o instanceof Number)
            && !global.isNaN(o)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isNonNegativeSafeInteger = function (o) {
        return karbonator.isSafeInteger(o) && o >= 0;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isInt8 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= -128 && o < 128)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isUint8 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= 0 && o < detail._twoPower8)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isInt16 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= -32768 && o < 32768)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isUint16 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= 0 && o < detail._twoPower16)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isInt32 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= -2147483648 && o < 2147483648)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isUint32 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= 0 && o < detail._twoPower32)
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isEsIterable = function (o) {
        return !karbonator.isUndefinedOrNull(o)
            && !karbonator.isUndefinedOrNull(o[Symbol.iterator])
        ;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Object comparison.
    
    /**
     * @readonly
     */
    karbonator.equals = Symbol("karbonator.equals");
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} lhs
     * @param {*} rhs
     * @return {Boolean}
     */
    karbonator.areEqual = (function () {
        var areEqual = function (lhs, rhs) {
            if(lhs === rhs) {
                return true;
            }
            
            if(
                karbonator.isArray(lhs)
                && karbonator.isArray(rhs)
            ) {
                if(lhs.length !== rhs.length) {
                    return false;
                }
                
                var count = lhs.length;
                for(var i = 0; i < count; ++i) {
                    if(!areEqual(lhs[i], rhs[i])) {
                        return false;
                    }
                }
                
                return true;
            }
            
            if(
                karbonator.isObjectOrFunction(lhs)
                && lhs[karbonator.equals]
            ) {
                return lhs[karbonator.equals](rhs);
            }
            
            if(
                karbonator.isObjectOrFunction(rhs)
                && rhs[karbonator.equals]
            ) {
                return rhs[karbonator.equals](lhs);
            }
            
            return false;
        };
        
        return areEqual;
    }());
    
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
     * @readonly
     */
    karbonator.compareTo = Symbol("karbonator.compareTo");
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isComparator = function (o) {
        return karbonator.isFunction(o)
            && o.length >= 2
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} l
     * @param {Number} r
     * @return {Number}
     */
    karbonator.numberComparator = function (l, r) {
        if(!karbonator.isNumber(l) || !karbonator.isNumber(r)) {
            throw new TypeError("Both 'l' and 'r' must be numbers.");
        }
        
        return l - r;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} l
     * @param {Number} r
     * @return {Number}
     */
    karbonator.booleanComparator = function (l, r) {
        return karbonator.numberComparator(Number(l), Number(r));
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {String} l
     * @param {String} r
     */
    karbonator.stringComparator = function (l, r) {
        if(!karbonator.isString(l) || !karbonator.isString(r)) {
            throw new TypeError("Both 'l' and 'r' must be strings.");
        }
        
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
     * @memberof karbonator
     * @function
     * @param {Object} l
     * @param {Object} r
     * @return {Number}
     */
    karbonator.objectComparator = function (l, r) {
        if(karbonator.areEqual(l, r)) {
            return 0;
        }
        
        var diff = karbonator.stringComparator(l.toString(), r.toString());
        if(0 !== diff) {
            return diff;
        }
        
        for(var lKey in l) {
            for(var rKey in r) {
                var diff = karbonator.stringComparator(lKey.toString(), rKey.toString());
                if(0 !== diff) {
                    return diff;
                }
            }
        }
        
        return -1;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Object cloning.
    
    /**
     * @memberof karbonator
     * @readonly
     */
    karbonator.shallowClone = Symbol("karbonator.shallowClone");
    
    /**
     * @memberof karbonator
     * @readonly
     */
    karbonator.deepClone = Symbol("karbonator.deepClone");
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isImmutablePrimitive = function (o) {
        return karbonator.isUndefinedOrNull(o)
            || karbonator.isNumber(o)
            || karbonator.isBoolean(o)
            || karbonator.isSymbol(o)
            || karbonator.isString(o)
            //|| karbonator.isFunction(o)
        ;
    };
    
    /**
     * @function
     * @param {*} o
     * @return {*}
     */
    karbonator.shallowCloneObject = (function () {
        var shallowCloneObject = function (o) {
            if(_isImmutablePrimitive(o)) {
                return o;
            }
            
            if(karbonator.isArray(o)) {
                var clonedArray = new Array(o.length);
                
                for(var i = 0; i < o.length; ++i) {
                    clonedArray[i] = shallowCloneObject(o[i]);
                }
                
                return clonedArray;
            }
            
            if(o[karbonator.shallowClone]) {
                return o[karbonator.shallowClone]();
            }
            
            return o;
        };
        
        return shallowCloneObject;
    }());
    
    //TODO : Find a way to handle cyclic reference problems.
//    /**
//     * @function
//     * @param {*} o
//     * @return {*}
//     */
//    karbonator.deepCloneObject = (function () {
//        var deepCloneObject = function (o) {
//            if(_isImmutablePrimitive(o)) {
//                return o;
//            }
//            
//            if(karbonator.isArray(o)) {
//                var clonedArray = new Array(o.length);
//                
//                for(var i = 0; i < o.length; ++i) {
//                    clonedArray[i] = deepCloneObject(o[i]);
//                }
//                
//                return clonedArray;
//            }
//            
//            if(o[karbonator.deepClone]) {
//                return o[karbonator.deepClone]();
//            }
//            
//            return o;
//        };
//        
//        return deepCloneObject;
//    }());
    
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
        var _hasPropertyMethod = function (key) {
            return (key in this);
        };
        
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
    
    /**
     * @function
     * @param {Object|Function} dest
     * @param {iterable} pairs
     * @return {Object|Function}
     */
    karbonator.appendAsMember = function (dest, pairs) {
        if(!karbonator.isObjectOrFunction(dest)) {
            throw new TypeError("The parameter 'dest' must be an object or a function.");
        }
        if(!karbonator.isEsIterable(pairs)) {
            throw new TypeError("The parameter 'pairs' must have a property 'Symbol.iterator'.");
        }
        
        var temp = {};
        var propKeys = [];
        for(
            var i = pairs[Symbol.iterator](), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            if(!karbonator.isArray(iP.value)) {
                throw new TypeError(
                    "The pair must be an array"
                    + " which has a string or symbol as the first element"
                    + " and a value or an object as the second element."
                );
            }
            
            var propKey = iP.value[0];
            if(!karbonator.isString(propKey) && !karbonator.isSymbol(propKey)) {
                throw new Error("An enum member name must be a string or a symbol.");
            }
            if(dest.hasOwnProperty(propKey)) {
                throw new Error("'dest' has already have a property '" + propKey + "'.");
            }
            
            temp[propKey] = iP.value[1];
            propKeys.push(propKey);
        }
        
        for(var i = 0, count = propKeys.length; i < count; ++i) {
            var propKey = propKeys[i];
            dest[propKey] = temp[propKey];
        }
        
        return dest;
    };
    
    /**
     * @function
     * @param {Object|Function} dest
     * @param {Function} ctor
     * @param {iterable} pairs
     * @return {Object|Function}
     */
    karbonator.createAndAppendAsMember = function (dest, ctor, pairs) {
        if(!karbonator.isObjectOrFunction(dest)) {
            throw new TypeError("The parameter 'dest' must be an object or a function.");
        }
        if(!karbonator.isFunction(ctor)) {
            throw new TypeError("The parameter 'ctor' must be a function.");
        }
        if(!karbonator.isEsIterable(pairs)) {
            throw new TypeError("The parameter 'pairs' must have a property 'Symbol.iterator'.");
        }
        
        var temp = {};
        var propKeys = [];
        for(
            var i = pairs[Symbol.iterator](), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            if(!karbonator.isArray(iP.value)) {
                throw new TypeError(
                    "The pair must be an array"
                    + " which has a string or symbol as the first element"
                    + " and an array of constructor arguments as the second element."
                );
            }
            
            var propKey = iP.value[0];
            if(!karbonator.isString(propKey) && !karbonator.isSymbol(propKey)) {
                throw new Error("An enum member name must be a string or a symbol.");
            }
            if(dest.hasOwnProperty(propKey)) {
                throw new Error("'dest' has already have a property '" + propKey.toString() + "'.");
            }
            
            if(!karbonator.isArray(iP.value[1])) {
                throw new TypeError("The second element of a pair must be an array of constructor arguments.");
            }
            
            temp[propKey] = Reflect.construct(ctor, iP.value[1]);
            propKeys.push(propKey);
        }
        
        for(var i = 0, count = propKeys.length; i < count; ++i) {
            var propKey = propKeys[i];
            dest[propKey] = temp[propKey];
        }
        
        return dest;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //karbonator.Enum
    
    karbonator.Enum = (function () {
        var _pSymMemberIndex = Symbol("karbonator.Enum.prototype.index");
        var _pSymMemberKey = Symbol("karbonator.Enum.prototype.key");
        var _pSymStaticKeys = Symbol("karbonator.Enum.keys");
        
        /**
         * @memberof karbonator
         * @constructor
         */
        var Enum = function () {
            throw new Error(
                "'karbonator.Enum' cannot be directly instantiated."
                + " use 'karbonator.Enum.create' static method"
                + " to create a subtype of 'karbonator.Enum'."
            );
        };
        
        /**
         * @memberof karbonator.Enum
         * @readonly
         * @type {Symbol}
         */
        Enum.getIndex = Symbol("karbonator.Enum.getIndex");
        
        /**
         * @memberof karbonator.Enum
         * @readonly
         * @type {Symbol}
         */
        Enum.getKey = Symbol("karbonator.Enum.getKey");
        
        /**
         * @memberof karbonator.Enum
         * @readonly
         * @type {Symbol}
         */
        Enum.getValue = Symbol("karbonator.Enum.getValue");
        
        /**
         * @function
         * @return {Number}
         */
        Enum.prototype[Enum.getIndex] = function () {
            return this[_pSymMemberIndex];
        };
        
        /**
         * @function
         * @return {String|Symbol}
         */
        Enum.prototype[Enum.getKey] = function () {
            return this[_pSymMemberKey];
        };
        
        /**
         *  var ColorEnum = karbonator.Enum.create(
         *      function (proto) {
         *          proto.getNumber = function () {
         *              return this._num;
         *          };
         *          proto.getAlpha = function () {
         *              return this._alpha;
         *          };
         *      },
         *      function (num, alpha) {
         *          this._num = num;
         *          this._alpha = alpha;
         *      },
         *      [["red", [0, 0.125]], ["green", [1, 0.125]], ["blue", [2, 0.125]], [Symbol("violet"), [123, 0.5]]]
         *  );
         *
         * @memberof karbonator.Enum
         * @function
         * @param {Function} protoHandler
         * @param {Function} ctor
         * @param {iterable} pairs
         * @return {karbonator.Enum}
         */
        Enum.create = function (protoHandler, ctor, pairs) {
            if(!karbonator.isFunction(protoHandler)) {
                throw new TypeError("The parameter 'protoHandler' must be a function.");
            }
            
            if(!karbonator.isFunction(ctor)) {
                throw new TypeError("The parameter 'ctor' must be a function.");
            }
            
            if(!karbonator.isEsIterable(pairs)) {
                throw new TypeError(
                    "The parameter "
                    + "'pairs'"
                    + " must have a property "
                    + "'Symbol.iterator'."
                );
            }
            
            var proto = Object.create(Enum.prototype);
            protoHandler(proto);
            
            var EnumType = ctor;
            EnumType.prototype = proto;
            
            var temp = {};
            var keys = [];
            for(
                var i = pairs[Symbol.iterator](), iP = i.next(), ndx = 0;
                !iP.done;
                iP = i.next(), ++ndx
            ) {
                var key = iP.value[0];
                if(!karbonator.isString(key) && !karbonator.isSymbol(key)) {
                    throw new TypeError("Keys of enum members must be strings or symbols.");
                }
                if(temp.hasOwnProperty(key)) {
                    throw new Error(
                        "The key '"
                        + key
                        + "' already exists."
                    );
                }
                keys.push(key);
                
                temp[key] = Reflect.construct(EnumType, iP.value[1]);
                temp[key][_pSymMemberIndex] = ndx;
                temp[key][_pSymMemberKey] = key;
            }
            
            EnumType = function () {
                throw new Error("Cannot instantiate the enum type directly.");
            };
            EnumType.prototype = proto;
            proto.constructor = EnumType;
            
            EnumType[_pSymStaticKeys] = keys;
            for(var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                EnumType[key] = temp[key];
            }
            
            EnumType[Symbol.iterator] = function () {
                return ({
                    _keys : EnumType[_pSymStaticKeys],
                    
                    _index : 0,
                    
                    next : function () {
                        var result = {
                            done : this._index >= this._keys.length
                        };
                        
                        if(!result.done) {
                            var key = this._keys[this._index];
                            result.value = [
                                this._keys[this._index],
                                EnumType[key]
                            ];
                            
                            ++this._index;
                        }
                        
                        return result;
                    }
                });
            };
            
            return EnumType;
        };
        
        var _assertIsEnumType = function (enumType) {
            if(!karbonator.isFunction(enumType)) {
                throw new TypeError(
                    "The paramter 'enumType'"
                    + " must be a derived type of "
                    + "'karbonator.Enum'."
                );
            }
        };
        
        /**
         * @memberof karbonator.Enum
         * @function
         * @param {Function} enumType
         * @returns {Array.<String|Symbol>}
         */
        Enum.getKeys = function (enumType) {
            _assertIsEnumType(enumType);
            
            return enumType[_pSymStaticKeys].slice();
        };
        
        /**
         * @memberof karbonator.Enum
         * @function
         * @param {Function} enumType
         * @param {Number} index
         * @return {String|Symbol}
         */
        Enum.getKeyAt = function (enumType, index) {
            _assertIsEnumType(enumType);
            
            return enumType[_pSymStaticKeys][index];
        };
        
        /**
         * @memberof karbonator.Enum
         * @function
         * @param {Function} enumType
         * @param {Number} index
         * @return {*}
         */
        Enum.getValueAt = function (enumType, index) {
            _assertIsEnumType(enumType);
            
            return Enum.findByKey(enumType, Enum.getKeyAt(enumType, index));
        };
        
        /**
         * @memberof karbonator.Enum
         * @function
         * @param {Function} enumType
         * @return {Number}
         */
        Enum.getCount = function (enumType) {
            _assertIsEnumType(enumType);
            
            return enumType[_pSymStaticKeys].length;
        };
        
        /**
         * @memberof karbonator.Enum
         * @function
         * @param {Function} enumType
         * @param {String|Symbol} key
         * @return {karbonator.Enum}
         */
        Enum.findByKey = function (enumType, key) {
            _assertIsEnumType(enumType);
            
            if(!enumType.hasOwnProperty(key)) {
                throw new Error(
                    "The enum member '"
                    + key
                    + "' doesn't exist."
                );
            }
            
            return enumType[key];
        };
        
        return Enum;
    }());
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //karbonator.ByteArray
    
    karbonator.ByteArray = (function () {
        /**
         * @function
         * @param {Number} v
         * @return {Number}
         */
        var _assertIsNonNegativeSafeInteger = function (v) {
            if(!karbonator.isNonNegativeSafeInteger(v)) {
                throw new TypeError("The value must be a non-negative safe integer.");
            }
            
            return v;
        };
        
        /**
         * @function
         * @param {Number} v
         * @return {Number}
         */
        var _assertIsUint8 = function (v) {
            if(!karbonator.isUint8(v)) {
                throw new TypeError("The value must be in range [0, 255].");
            }
            
            return v;
        };
        
        var _bitsPerByteEep = 3;
        
        var _bitsPerByte = 1 << _bitsPerByteEep;
        
        var _byteBm = (1 << _bitsPerByte) - 1;
        
        var _bufNdxExp = 2;
        
        var _subNdxBm = (1 << _bufNdxExp) - 1;
        
        var _bytesPerInt = 1 << _bufNdxExp;
        
        /**
         * @function
         * @param {Number} subIndex
         * @return {Number}
         */
        var _calculateShiftCount = function (subIndex) {
            return ((_bytesPerInt - 1) - subIndex) << _bitsPerByteEep;
        };
        
        /**
         * @memberof karbonator
         * @constructor
         * @param {Number} [elementCount=0]
         * @param {Number} [initialValue=0]
         */
        var ByteArray = function () {
            var elementCount = (
                karbonator.isUndefined(arguments[0])
                ? 0
                : _assertIsNonNegativeSafeInteger(arguments[0])
            );
            
            if(elementCount < 1) {
                this._buffer = [0];
                this._subIndex = 0;
                
                if(!karbonator.isUndefined(arguments[1])) {
                    this.fill(arguments[1]);
                }
            }
            else {
                this._buffer = new Array(((elementCount - 1) >>> _bufNdxExp) + 1);
                this._subIndex = ((elementCount - 1) & _subNdxBm) + 1;
                this.fill((karbonator.isUndefined(arguments[1]) ? 0 : arguments[1]));
            }
        };
        
        /**
         * @function
         * @param {ByteArray} oThis
         * @param {Number} index
         * @param {Number} [maxBound]
         * @return {Number}
         */
        var _assertIsValidIndex = function (oThis, index) {
            _assertIsNonNegativeSafeInteger(index);
            
            var maxBound = (karbonator.isUndefined(arguments[2]) ? oThis.getElementCount() : arguments[2]);
            if(index >= maxBound) {
                throw new RangeError("Index out of range.");
            }
            
            return index;
        };
        
        /**
         * @function
         * @param {Array.<Number>} buffer
         * @param {Number} bufferIndex
         * @param {Number} subIndex
         * @return {Number}
         */
        var _get = function (buffer, bufferIndex, subIndex) {
            var shiftCount = _calculateShiftCount(subIndex);
            
            return (buffer[bufferIndex] & (_byteBm << shiftCount)) >>> shiftCount;
        };
        
        /**
         * @function
         * @param {Array.<Number>} buffer
         * @param {Number} bufferIndex
         * @param {Number} subIndex
         * @param {Number} v
         */
        var _set = function (buffer, bufferIndex, subIndex, v) {
            var shiftCount = _calculateShiftCount(subIndex);
            
            buffer[bufferIndex] &= ~(_byteBm << shiftCount);
            buffer[bufferIndex] |= (v << shiftCount);
        };
        
        /**
         * @memberof karbonator.ByteArray
         * @param {Object} numberArrayLike
         * @param {Function} [mapFunction]
         * @param {Object} [thisArg]
         * @return {karbonator.ByteArray}
         */
        ByteArray.from = function (numberArrayLike) {
            return detail._arrayFromFunctionBody(
                new ByteArray(), _assertIsUint8,
                "pushBack", numberArrayLike,
                arguments[1], arguments[2]
            );
        };
        
        /**
         * @function
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype[karbonator.shallowClone] = function () {
            return ByteArray.from(this);
        };
        
        /**
         * @function
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype[karbonator.deepClone] = function () {
            return ByteArray.from(this);
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        ByteArray.prototype.isEmpty = function () {
            return this._buffer.length < 2 && this._subIndex < 1;
        };
        
        /**
         * @function
         * @return {Number}
         */
        ByteArray.prototype.getElementCount = function () {
            return (this._buffer.length - 1) * _bytesPerInt + this._subIndex;
        };
        
        /**
         * @function
         * @return {iterator}
         */
        ByteArray.prototype[Symbol.iterator] = function () {
            return ({
                next : function () {
                    var done = this._index >= this._target.getElementCount();
                    var value = undefined;
                    
                    if(!done) {
                        value = this._target.get(this._index);
                        ++this._index;
                    }
                    
                    return ({
                        done : done,
                        value : value
                    });
                },
                _target : this,
                _index : 0
            });
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Number}
         */
        ByteArray.prototype.get = function (index) {
            _assertIsValidIndex(this, index);
            
            var bufNdx = index >>> _bufNdxExp;
            var subNdx = index & _subNdxBm;
            
            return _get(this._buffer, bufNdx, subNdx);
        };
        
        /**
         * @function
         * @param {Number} index
         * @param {Number} v
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.set = function (index, v) {
            _assertIsValidIndex(this, index);
            _assertIsUint8(v); 
            
            var bufNdx = index >>> _bufNdxExp;
            var subNdx = index & _subNdxBm;
            
            _set(this._buffer, bufNdx, subNdx, v);
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} v
         * @param {Number} [start]
         * @param {Number} [end]
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.fill = function (v) {
            _assertIsUint8(v);
            var start = (karbonator.isUndefined(arguments[1]) ? 0 : _assertIsValidIndex(this, arguments[1]));
            var elemCount = this.getElementCount();
            var end = (karbonator.isUndefined(arguments[2]) ? elemCount : _assertIsValidIndex(this, arguments[2], elemCount + 1));
            
            for(var i = start; i < end; ++i) {
                this.set(i, v);
            };
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} lhsIndex
         * @param {Number} rhsIndex
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.swapElements = function (lhsIndex, rhsIndex) {
            _assertIsValidIndex(this, lhsIndex);
            _assertIsValidIndex(this, rhsIndex);
            
            var lhsElem = this.get(lhsIndex);
            this.set(lhsIndex, this.get(rhsIndex));
            this.set(rhsIndex, lhsElem);
            
            return this;
        };
        
        /**
         * @function
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.reverse = function () {
            var count = this.getElementCount();
            var halfCount = count >>> 1;
            for(var i = 0, j = count; i < halfCount; ++i) {
                --j;
                this.swapElements(i, j);
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} v
         * @param {Number} [index]
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.insert = function (v, index) {
            _assertIsUint8(v);
            var elemCount = this.getElementCount();
            index = (karbonator.isUndefined(index) ? elemCount : index);
            _assertIsValidIndex(this, index, elemCount + 1);
            
            if(this._subIndex >= _bytesPerInt) {
                this._buffer.push(0);
                this._subIndex = 0;
            }
            
            var destBufNdx = index >>> _bufNdxExp;
            var destSubNdx = index & _subNdxBm;
            
            for(var i = this._buffer.length - 1; i > destBufNdx; --i) {
                this._buffer[i] >>>= _bitsPerByte;
                _set(
                    this._buffer,
                    i, 0,
                    _get(this._buffer, i - 1, _bytesPerInt - 1)
                );
            }
            
            if(destSubNdx === 0) {
                this._buffer[destBufNdx] >>>= _bitsPerByte;
            }
            else if(destSubNdx < _bytesPerInt - 1) {
                for(var i = _bytesPerInt - 1; i > destSubNdx; --i) {
                    _set(
                        this._buffer,
                        destBufNdx, i,
                        _get(this._buffer, destBufNdx, i - 1)
                    );
                }
            }
            
            _set(this._buffer, destBufNdx, destSubNdx, v);
            ++this._subIndex;
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Number}
         */
        ByteArray.prototype.removeAt = function (index) {
            if(this.isEmpty()) {
                throw new Error("No more bytes left.");
            }
            
            _assertIsValidIndex(this, index);
            
            var destBufNdx = index >>> _bufNdxExp;
            var destSubNdx = index & _subNdxBm;
            
            var value = _get(this._buffer, destBufNdx, destSubNdx);
            
            if(destSubNdx === 0) {
                this._buffer[destBufNdx] <<= _bitsPerByte;
            }
            else if(destSubNdx >= _bytesPerInt - 1) {
                this._buffer[destBufNdx] &= ~_byteBm;
            }
            else {
                for(var i = destSubNdx + 1; i < _bytesPerInt; ++i) {
                    _set(
                        this._buffer,
                        destBufNdx, i - 1,
                        _get(this._buffer, destBufNdx, i)
                    );
                }
            }
            
            for(var i = destBufNdx + 1, len = this._buffer.length; i < len; ++i) {
                _set(this._buffer,
                    i - 1, _bytesPerInt - 1,
                    _get(this._buffer, i, 0)
                );
                this._buffer[i] <<= _bitsPerByte;
            };
            
            --this._subIndex;
            if(this._subIndex < 1 && this._buffer.length > 1) {
                this._buffer.pop();
                this._subIndex = _bytesPerInt;
            }
            
            return value;
        };
        
        /**
         * @function
         * @param {iterable} iterable
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.concatenateAssign = function (iterable) {
            return detail._arrayFromFunctionBody(
                this, _assertIsUint8,
                "pushBack", iterable
            );
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} v
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.pushFront = function (v) {
            this.insert(v, 0);
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} v
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.pushBack = function (v) {
            this.insert(v);
            
            return this;
        };
        
        /**
         * @function
         * @return {Number}
         */
        ByteArray.prototype.popFront = function () {
            return this.removeAt(0);
        };
        
        /**
         * @function
         * @return {Number}
         */
        ByteArray.prototype.popBack = function () {
            return this.removeAt(this.getElementCount() - 1);
        };
        
        /**
         * @function
         * @return {karbonator.ByteArray}
         */
        ByteArray.prototype.clear = function () {
            this._buffer.length = 1;
            this._buffer[0] = 0;
            this._subIndex = 0;
            
            return this;
        };
        
        /**
         * @function
         * @param {karbonator.ByteArray} rhs
         * @return {Boolean}
         */
        ByteArray.prototype[karbonator.equals] = function (rhs) {
            if(this === rhs) {
                return true;
            }
            
            if(karbonator.isUndefinedOrNull(rhs)) {
                return false;
            }
            
            var elemCount = this.getElementCount();
            if(elemCount !== rhs.getElementCount()) {
                return false;
            }
            
            for(var i = 0; i < elemCount; ++i) {
                if(this.get(i) !== rhs.get(i)) {
                    return false;
                }
            }
            
            return true;
        };
        
        /**
         * @function
         * @param {Number} [base=10]
         * @return {String}
         */
        ByteArray.prototype.toString = function () {
            var base = arguments[0];
            var str = '[';
            
            var count = this.getElementCount();
            if(count > 0) {
                str += this.get(0).toString(base);
            }
            
            for(var i = 1; i < count; ++i) {
                str += ", ";
                str += this.get(i).toString(base);
            }
            
            str += ']';
            
            return str;
        };
        
        return ByteArray;
    }());
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //karbonator namespace bit conversion functions.
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Number} byteCount
     * @return {Number}
     */
    detail._assertByteCountInRange = function (byteCount) {
        if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
            throw new TypeError("'byteCount' must be a non-negative safe integer.");
        }
        if(!([1, 2, 4].includes(byteCount))) {
            throw new RangeError("'byteCount' can be only 1, 2 or 4.");
        }
        
        return byteCount;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} value
     * @param {Number} byteCount - 1, 2 or 4 only.
     * @param {Boolean} [byteOrderReversed=false]
     * @param {karbonator.ByteArray} [dest]
     * @param {Number} [destIndex]
     * @returns {karbonator.ByteArray}
     */
    karbonator.integerToBytes = function (value, byteCount) {
        if(!karbonator.isInteger(value)) {
            throw new TypeError("'value' must be an integer.");
        }
        
        detail._assertByteCountInRange(byteCount);
        
        var dest = null;
        if(karbonator.isUndefined(arguments[3])) {
            dest = new karbonator.ByteArray(byteCount);
        }
        else {
            dest = arguments[3];
            if(!(dest instanceof karbonator.ByteArray)) {
                throw new TypeError("'dest' must be an instance of 'karboantor.ByteArray'.");
            }
        }
        
        var destIndex = dest.getElementCount();
        if(!karbonator.isUndefined(arguments[4])) {
            destIndex = arguments[4];
            if(!karbonator.isNonNegativeSafeInteger(destIndex)) {
                throw new RangeError("'destIndex' must be a non-negative safe integer.");
            }            
        }
        
        if(!!arguments[2]) {
            for(var i = 0; i < byteCount; ++i) {
                dest.insert((value & 0xFF), destIndex + i);
                value >>>= 8;
            }
        }
        else {
            for(var i = 0, j = byteCount; i < byteCount; ++i) {
                --j;
                dest.insert((value & 0xFF), destIndex + j);
                value >>>= 8;
            }
        }
        
        return dest;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {karbonator.ByteArray} bytes
     * @param {Number} byteCount - 1, 2 or 4 only.
     * @param {Boolean} [signed=false]
     * @param {Boolean} [byteOrderReversed=false]
     * @param {Number} [startIndex=0]
     * @returns {Number}
     */
    karbonator.bytesToInteger = function (bytes, byteCount) {
        if(!(bytes instanceof karbonator.ByteArray)) {
            throw new TypeError("The parameter 'byteArray' must be an instance of 'karbonator.ByteArray'.");
        }
        
        detail._assertByteCountInRange(byteCount);
        
        var startIndex = 0;
        if(!karbonator.isUndefined(arguments[4])) {
            startIndex = arguments[4];
            if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
                throw new TypeError("The parameter 'startIndex' must be a non-negative safe integer.");
            }
        }
        
        var buffer = new karbonator.ByteArray();
        var count = 0;
        for(var len = bytes.getElementCount(); count < byteCount && count < len; ++count) {
            buffer.pushBack((bytes.get(startIndex + count) & 0xFF));
        }
        if(count < byteCount) {
            throw new Error("Not enough bytes.");
        }
        
        if(!!arguments[3]) {
            buffer.reverse();
        }
        
        var value = 0;
        for(var i = 0; i < byteCount; ++i) {
            value <<= 8;
            value |= buffer.get(i);
        }
        
        if((byteCount & 0x01) !== 0) {
            if(!!arguments[2] && (value & 0x80) !== 0) {
                value -= detail._twoPower8;
            }
        }
        else if(((byteCount >>> 1) & 0x01) !== 0) {
            if(!!arguments[2] && (value & 0x8000) !== 0) {
                value -= detail._twoPower16;
            }
        }
        else if(((byteCount >>> 2) & 0x01) !== 0) {
            if(!arguments[2] && value < 0) {
                value += detail._twoPower32;
            }
        }
        
        return value;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.assertion namespace.
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var assertion = karbonator.assertion || {};
    karbonator.assertion = assertion;
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {Boolean} boolExpr
     * @param {String} [message]
     * @param {Function} [errorClass]
     */
    assertion.isTrue = function (boolExpr) {
        if(!boolExpr) {
            var errorClass = (
                karbonator.isFunction(arguments[2])
                ? arguments[2] :
                Error
            );
            
            throw new errorClass((
                karbonator.isUndefinedOrNull(arguments[1])
                ? "Assertion Failed" :
                arguments[1].toString()
            ));
        }
    };
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {Boolean} boolExpr
     * @param {String} [message]
     * @param {Function} [errorClass]
     */
    assertion.isFalse = function (boolExpr) {
        return assertion.isTrue(
            !boolExpr,
            arguments[1],
            arguments[2]
        );
    };
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {*} o
     * @param {String} [message]
     * @param {Function} [errorClass]
     */
    assertion.isNotUndefined = function (o) {
        assertion.isTrue(!karbonator.isUndefined(o), arguments[1], arguments[2]);
    };
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {Object} o
     * @param {Function} klass
     * @param {String} [message]
     * @param {Function} [errorClass]
     */
    assertion.isInstanceOf = function (o, klass) {
        assertion.isTrue(o instanceof klass, arguments[2], arguments[3]);
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.math namespace.
    
    /**
     * @namespace
     * @memberof karbonator
     */
    var math = karbonator.math || {};
    karbonator.math = math;
    
    /**
     * @memberof karbonator.math
     * @readonly
     */
    math.epsilon = 1e-5;
    
    /**
     * @memberof karbonator.math
     * @function
     * @param {Number} min
     * @param {Number} max
     * @return {Number}
     */
    math.nextInt = function (min, max) {
        return karbonator.toInteger(
            math.nextFloat(
                karbonator.toInteger(min),
                karbonator.toInteger(max)
            )
        );
    };
    
    /**
     * @memberof karbonator.math
     * @function
     * @param {Number} min
     * @param {Number} max
     * @return {Number}
     */
    math.nextFloat = function (min, max) {
        return (Math.random() * (max - min)) + min;
    };
    
    /**
     * @memberof karbonator.math
     * @function
     * @param {Number} lhs
     * @param {Number} rhs
     * @param {Number} [epsilon=karbonator.math.epsilon]
     * @return {Boolean}
     */
    math.numberEquals = function (lhs, rhs) {
        return Math.abs(lhs - rhs) < (karbonator.isUndefined(arguments[2]) ? math.epsilon : arguments[2]);
    };
    
    /**
     * @memberof karbonator.math
     * @function
     * @param {Number} value
     * @param {Number} start
     * @param {Number} end
     * @return {Number}
     */
    math.clamp = function (value, start, end) {
        var result = value;
        
        if(value < start) {
            result = start;
        }
        else if(value > end) {
            result = end;
        }
        
        return result;
    };
    
    math.Interval = (function (global, karbonator) {
        var detail = karbonator.detail;
        var math = karbonator.math;
        
        var Number = global.Number;
        var Error = global.Error;
        var TypeError = global.TypeError;
        
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
        
        return Interval;
    }(global, karbonator));
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
