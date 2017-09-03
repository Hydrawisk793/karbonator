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
        g.define(function () {
            return factory(g);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g);
    }
    else {
        g.karbonator = factory(g);
    }
}(
(
    typeof(global) !== "undefined"
    ? global
    : (typeof(window) !== "undefined" ? window : this)
),
(function (global) {
    "use strict";
    
    /**
     * @global
     * @namespace
     */
    var karbonator = {};
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var detail = {};
    karbonator.detail = detail;
    
    var Function = global.Function;
    var Array = global.Array;
    
    /*////////////////////////////////////////////////////////////////*/
    //Constants
    
    /**
     * @readonly
     */
    detail._twoPower7 = 128;
    
    /**
     * @readonly
     */
    detail._twoPower8 = 256;
    
    /**
     * @readonly
     */
    detail._twoPower15 = 32768;
    
    /**
     * @readonly
     */
    detail._twoPower16 = 65536;
    
    /**
     * @readonly
     */
    detail._twoPower31 = 2147483648;
    
    /**
     * @readonly
     */
    detail._twoPower32 = 4294967296;
    
    /**
     * @memberof karbonator
     * @readonly
     */
    karbonator.minimumSafeInteger = (
        Number.MIN_SAFE_INTEGER
        ? Number.MIN_SAFE_INTEGER
        : -9007199254740991
    );
    
    /**
     * @memberof karbonator
     * @readonly
     */
    karbonator.maximumSafeInteger = (
        Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : 9007199254740991
    );
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //Common internal functions.
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Object} arr
     * @param {Function} traitAssertionFunc
     * @param {*} pushBackMethodKey
     * @param {Object} arrayLike
     * @param {Function} [mapFunction]
     * @param {Object} [thisArg]
     * @return {Object}
     */
    detail._arrayFromFunctionBody = function (arr, traitAssertionFunc, pushBackMethodKey, arrayLike) {
        traitAssertionFunc = (
            karbonator.isUndefinedOrNull(traitAssertionFunc)
            ? (function (v) {return v;})
            : traitAssertionFunc
        );
        var mapFn = arguments[4];
        var mapFnExist = karbonator.isFunction(mapFn);
        var thisArg = arguments[5];
        
        if(arrayLike[global.Symbol.iterator]) {
            for(
                var i = arrayLike[global.Symbol.iterator](), iP = i.next(), j = 0;
                !iP.done;
                iP = i.next(), ++j
            ) {
                var elem = traitAssertionFunc(iP.value);
                if(mapFnExist) {
                    arr[pushBackMethodKey](mapFn.call(thisArg, elem, j));
                }
                else {
                    arr[pushBackMethodKey](elem);
                }
            }
        }
        //TODO : 코드 작성...?
//        else if (isArrayLike(arrayLike)) {
//            
//        }
        
        return arr;
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {*} preferred
     * @param {*} alternative
     * @return {*}
     */
    detail._selectNonUndefined = function (preferred, alternative) {
        return (
            !karbonator.isUndefined(preferred)
            ? preferred
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
    
    detail._objectCreate = global.Object.create || (function (proto) {
        if(null === proto) {
            throw new Error("This polyfill doesn't support null argument for the 'proto' parameter.");
        }

        if(!karbonator.isObjectOrFunction(proto)) {
            throw new TypeError("The parameter 'proto' must be an object.");
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
    
    detail._arrayFindIndex = function (arr, callback) {
        var index = 0;
        for(var thisArg = arguments[1]; index < arr.length; ++index) {
            if(callback.call(thisArg, arr[index], index, arr)) {
                return index;
            }
        }

        return -1;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //EsSymbol
    
    if(!global.Symbol) {
        /**
         * @function
         * @param {*} arg
         * @return {String}
         */
        var _createKey = function (arg) {
            var key = "";

            switch(typeof arg) {
            case "string":
                key = arg;
            break;
            case "object":
                key = (null === arg ? "null" : arg.toString());
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
            
            //A non-standard behaviour that tests if the id sequencer overflow has occured.
            //This is needed because the non-standard 'id' of polyfilled symbol must be distinct.
            this._id = ++_globalIdCounter;
            if(this._id === 0) {
                throw new Error("The Symbol polyfill cannot instantiate additional distinct symbols...");
            }
        };
        
        /**
         * Creates and returns a new symbol using a optional parameter 'description' as a key.<br/>
         * There is no way to force not using the new operator 
         * because the 'new.target' virtual property does not exist in Es3 environment.<br/>
         * references: <br/>
         * - http://ecma-international.org/ecma-262/5.1/#sec-9.12 <br/>
         * - https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/ <br/>
         * @constructor
         * @param {String} [description=""]
         * @return {karbonator.EsSymbol}
         */
        var EsSymbol = function () {
            //This code can't be a complete alternative of 'new.target' proposed in Es6 spec
            //because this can cause some problems
            //when Object.create(karbonator.EsSymbol.prototype) is used to inherit 'karbonator.EsSymbol.prototype'.
            //if((this instanceof karbonator.EsSymbol)) {
            //    throw new TypeError("'Symbol' cannot be instantiated by the new operator.");
            //}

            var arg = arguments[0];
            //It works because it's a polyfill which is an object...
            if(arg instanceof EsSymbol) {
                throw new TypeError("Cannot convert symbol value to string.");
            }
            var newSymbol = new _FakeSymbolCtor(arg);

            return newSymbol;
        };
        EsSymbol.prototype = _FakeSymbolCtor.prototype;
        EsSymbol.prototype.constructor = EsSymbol;
        
        /**
         * @memberof karbonator.EsSymbol
         * @private
         * @constructor
         */
        EsSymbol.Registry = function () {
            this._registry = [];
        };
        
        /**
         * @function
         * @param {String} key
         * @return {Boolean}
         */
        EsSymbol.Registry.prototype.hasSymbol = function (key) {
            return this._findPairIndexByKey(key) >= 0;
        };
        
        /**
         * @function
         * @param {karbonator.EsSymbol} symbol
         * @return {String|undefined}
         */
        EsSymbol.Registry.prototype.findKeyBySymbol = function (symbol) {
            var index = detail._arrayFindIndex(
                this._registry,
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
         * @return {karbonator.EsSymbol}
         */
        EsSymbol.Registry.prototype.getOrCreateSymbolByKey = function (key) {
            var index = this._findPairIndexByKey(key);
            if(index < 0) {
                index = this._registry.length;
                this._registry.push({key : key, value : EsSymbol(key)});
            }

            return this._registry[index].value;
        };
        
        /**
         * @function
         * @param {String} key
         * @return {Number}
         */
        EsSymbol.Registry.prototype._findPairIndexByKey = function (key) {
            return detail._arrayFindIndex(
                this._registry,
                function (pair) {
                    return pair.key === key;
                }
            );
        };
        
        /**
         * @memberof karbonator.EsSymbol
         * @private
         */
        EsSymbol._globalRegistry = new EsSymbol.Registry();
        
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
        
        for(var i = _knownSymbolKeys.length; i > 0; ) {
            --i;
            
            var knownSymbolKey = _knownSymbolKeys[i];
            EsSymbol[knownSymbolKey] = EsSymbol(knownSymbolKey);
        }
        
        /**
         * @memberof karbonator.EsSymbol
         * @function
         * @param {String} key
         * @return {karbonator.EsSymbol}
         */
        EsSymbol["for"] = function (key) {
            return EsSymbol._globalRegistry.getOrCreateSymbolByKey(
                _createKey((!karbonator.isUndefined(key) ? key : "undefined"))
            );
        };
        
        /**
         * @memberof karbonator.EsSymbol
         * @function
         * @param {karbonator.EsSymbol} symbol
         * @return {String|undefined}
         */
        EsSymbol.keyFor = function (symbol) {
            return EsSymbol._globalRegistry.findKeyBySymbol(symbol);
        };
        
        /**
         * A non-standard function to get 'SymbolDescriptiveString'.
         * @function
         * @return {String}
         */
        EsSymbol.prototype.toSymbolDescriptiveString = function () {
            return "Symbol(" + this._key + ")";
        };

        /**
         * Outputs a 'non-standard' string for distinguishing each symbol instances.
         * To get a 'SymbolDescriptiveString' described in the standard,
         * use a non-standard function 'karbonator.EsSymbol.prototype.toSymbolDescriptiveString' instead.
         * @function
         * @return {String}
         * @see karbonator.EsSymbol.prototype.toSymbolDescriptiveString
         */
        EsSymbol.prototype.toString = function () {
            return EsSymbol._symbolKeyPrefix + this._id + "_" + this.toSymbolDescriptiveString();
        };
        
        /**
         * @function
         * @return {karbonator.EsSymbol}
         */
        EsSymbol.prototype.valueOf = function () {
            return this;
        };

//        /**
//         * @function
//         * @param {String} hint
//         * @return {karbonator.EsSymbol}
//         */
//        EsSymbol.prototype[EsSymbol.toPrimitive] = function (hint) {
//            return this.valueOf();
//        };

        /**
         * @memberof karbonator.EsSymbol
         * @private
         * @readonly
         */
        EsSymbol._symbolKeyPattern = new RegExp("^" + EsSymbol._symbolKeyPrefix + "[0-9]+_");
        
        /**
         * @memberof karbonator.EsSymbol
         * @private
         * @readonly
         */
        EsSymbol._symbolKeyPrefix = detail._polyfillPropNamePrefix + "Symbol";
        
        karbonator.EsSymbol = EsSymbol;
    }
    
    /**
     * @memberof karbonator
     * @return {Symbol|karbonator.EsSymbol}
     */
    karbonator.getEsSymbol = function () {
        return global.Symbol ? global.Symbol : karbonator.EsSymbol;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //EsReflect
    
    if(!global.Reflect) {
        /**
         * @memberof karbonator
         */
        karbonator.EsReflect = {
            apply : function (target, thisArg, args) {
                return global.Function.prototype.apply.call(target, thisArg, args);
            },
            
            construct : function (ctor, args) {
                if(arguments.length > 2) {
                    throw new Error("This polyfill doesn't support the third argument 'newTarget'.");
                }
                
                var newObj = detail._objectCreate(ctor.prototype);
                ctor.apply(newObj, args);
                
                return newObj;
            },
            
            has : function (target, key) {
                return (key in target);
            },
            
            ownKeys : function (target) {
                if(!karbonator.isObjectOrFunction(target)) {
                    throw new TypeError("The parameter must be a object or a function.");
                }
                
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
                if(!karbonator.isObjectOrFunction(target)) {
                    throw new TypeError("The parameter must be a object or a function.");
                }
                
                return Object.isExtensible(target);
            },
            
            preventExtensions : function () {
                throw new Error("Not polyfilled yet...");
            }
        };
    }
    
    /**
     * @memberof karbonator
     * @return {global.Reflect|karbonator.EsReflect}
     */
    karbonator.getEsReflect = function () {
        return (
            global.Reflect
            ? global.Reflect
            : karbonator.EsReflect
        );
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    var Symbol = karbonator.getEsSymbol();
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._identifierRegEx = /[a-zA-Z_$][a-zA-Z_$0-9]*/;
    
//    /**
//     * @memberof karbonator.detail
//     * @function
//     * @param {Object} global
//     * @return {String}
//     */
//    detail._testEnvironmentType = function (global) {
//        var envType = "Other";
//        
//        if((new Function("try{return this===window}catch(e){return false;}")).bind(global)()) {
//            envType = "WebBrowser";
//        }
//        else if(
//            !karbonator.isUndefined(global.process)
//            && global.process.release.name === "node"
//        ) {
//            envType = "Node.js";
//        }
//        
//        return envType;
//    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Array.<Number>} src
     * @returns {Array.<Number>}
     */
    detail._copyIntArray = function (src) {
        var i = src.length;
        var cloneOfSrc = new Array(i);
        while(i > 0) {
            --i;
            cloneOfSrc[i] = src[i];
        }
        
        return cloneOfSrc;
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {Array.<Array.<Number>>} src
     * @returns {Array.<Array.<Number>>}
     */
    detail._copyTwoDimIntArray = function (src) {
        var i = src.length;
        var cloneOfSrc = new Array(i);
        while(i > 0) {
            --i;
            
            var srcElem = src[i];
            var j = srcElem.length;
            var clonedElem = new Array(j);
            while(j > 0) {
                --j;
                clonedElem[j] = srcElem[j];
            }
            cloneOfSrc[i] = clonedElem;
        }
        
        return cloneOfSrc;
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
    
    /*////////////////////////////////////////////////////////////////*/
    //Trait test functions.
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isUndefined = function (o) {
        return "undefined" === typeof o;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isUndefinedOrNull = function (o) {
        return "undefined" === typeof o
            || null === o
        ;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isObject = function (o) {
        return "object" === typeof o && null !== o;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isFunction = function (o) {
        return "function" === typeof o
            || o instanceof global.Function
        ;
    };
    
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
    karbonator.isObjectOrFunction = function (o) {
        var result = false;
        
        switch(typeof o) {
        case "function":
            result = true;
        break;
        case "object":
            result = o instanceof global.Function || null !== o;
        //break;
        }
        
        return result;
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
        return karbonator.isSafeInteger(o) || o >= 0;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    karbonator.isInteger = (
        Number.isInteger
        ? Number.isInteger
        : (function (n) {
            return global.isFinite(n)
                && n === karbonator.toInteger(n)
            ;
        })
    );
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    karbonator.isSafeInteger = (
        Number.isSafeInteger
        ? Number.isSafeInteger
        : (function (n) {
            return karbonator.isInteger(n)
                && Math.abs(n) <= karbonator.maximumSafeInteger
            ;
        })
    );

    /**
     * @memberof karbonator
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    karbonator.isPositiveZero = function (n) {
        return 1 / n === global.Infinity;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Number} n
     * @return {Boolean}
     */
    karbonator.isNegativeZero = function (n) {
        return 1 / n === -global.Infinity;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isInt8 = function (o) {
        return karbonator.isSafeInteger(o)
            && (o >= -detail._twoPower7 && o < detail._twoPower7)
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
            && (o >= -detail._twoPower15 && o < detail._twoPower15)
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
            && (o >= -detail._twoPower31 && o < detail._twoPower31)
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
    karbonator.isString = function (o) {
        var result = false;
        
        switch(typeof o) {
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
     * @memberof karbonator.detail
     * @constructor
     */
    detail._Array = function () {
        Array.apply(this, arguments);
    };
    detail._Array.prototype = Array.prototype;
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isArray = (
        Array.isArray
        ? Array.isArray
        : (function (o) {
            //Uses a 'snapshot' constructor function 
            //that has the original 'Array.prototype'.
            return karbonator.isObject(o)
                && o instanceof detail._Array
            ;
        })
    );
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    karbonator.isSymbol = function (o) {
        return (
            global.Symbol
            ? "symbol" === typeof o
            : o instanceof karbonator.EsSymbol
        );
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
    
    /*////////////////////////////////////////////////////////////////*/
    
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
     * @param {Object} o
     * @param {String} [message]
     * @return {Object}
     */
    assertion.isNotUndefined = function (o) {
        if(karbonator.isUndefined(o)) {
            throw new TypeError(arguments[1]);
        }
        
        return o;
    };
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {Object} o
     * @param {Function} klass
     * @param {String} [message]
     * @return {Object}
     */
    assertion.isInstanceOf = function (o, klass) {
        if(!(o instanceof klass)) {
            throw new TypeError(arguments[2]);
        }
        
        return o;
    };
    
    /**
     * @memberof karbonator.assertion
     * @function
     * @param {Number} n
     * @param {String} [message]
     * @return {Number}
     */
    assertion.isNonNegativeSafeInteger = function (n) {
        var message = arguments[1];
        
        if(karbonator.isSafeInteger(n)) {
            throw new TypeError(message);
        }
        else if(n < 0) {
            throw new RangeError(message);
        }
        
        return n;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //Utilities for Es3 environments.
    
    /**
     * @memberof karbonator
     * @function
     * @param {iterable} iterable
     * @param {Function} callback
     * @param {Object} [thisArg]
     * @return {Boolean} Whether the iteration has been discontinued.
     */
    karbonator.forOf = function (iterable, callback) {
        var thisArg = arguments[2];
        
        var stopIteration = false;
        for(
            var i = iterable[Symbol.iterator](), iP = i.next();
            !iP.done && !stopIteration;
            iP = i.next()
        ) {
            stopIteration = !!callback.call(thisArg, iP.value);
        }
        
        return stopIteration;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //Object comparison.
    
    /**
     * @readonly
     */
    karbonator.equals = Symbol("karbonator.equals");
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {*} lhs
     * @param {*} rhs
     * @return {Boolean}
     */
    detail._areEqual = function (lhs, rhs) {
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
            for(var i = count; i > 0; ) {
                --i;
                
                if(!detail._areEqual(lhs[i], rhs[i])) {
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
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} lhs
     * @param {*} rhs
     * @return {Boolean}
     */
    karbonator.areEqual = function (lhs, rhs) {
        return detail._areEqual(lhs, rhs);
    };
    
    /**
     * A comparison function for sorting, inserting elements into binary search trees, or etc.
     * <br/>If the return value is
     * <br/>zero : lhs and rhs are equal.
     * <br/>positive integer : lhs is greater than rhs.
     * <br/>negative integer : lhs is less than rhs.
     * 
     * @callback karbonator.comparator
     * @param {*} lhs 
     * @param {*} rhs 
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
    karbonator.integerComparator = function (l, r) {
        if(
            !karbonator.isNonNegativeSafeInteger(l)
            || !karbonator.isNonNegativeSafeInteger(r)
        ) {
            throw new TypeError("Both 'l' and 'r' must be non-negative safe integers.");
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
        return karbonator.integerComparator(Number(l), Number(r));
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
        
        var minLen = (l.length < r.length ? l.length : r.length);
        var i = 0;
        for(; i < minLen; ++i) {
            var diff = l.charCodeAt(i) - r.charCodeAt(i);
            if(diff !== 0) {
                return diff;
            }
        }
        
        if(l.length > minLen) {
            return l.charCodeAt(i);
        }
        else if(r.length > minLen) {
            return r.charCodeAt(i);
        }
        
        return 0;
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
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
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
     * @memberof karbonator._detail
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    detail._isImmutablePrimitive = function (o) {
        return !karbonator.isObjectOrFunction(o)
            && !karbonator.isArray(o)
        ;
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {*} o
     * @return {*}
     */
    detail._shallowCloneObject = function (o) {
        if(detail._isImmutablePrimitive(o)) {
            return o;
        }
        
        if(karbonator.isArray(o)) {
            var clonedArray = new Array(o.length);

            for(var i = 0; i < o.length; ++i) {
                clonedArray[i] = detail._shallowCloneObject(o[i]);
            }

            return clonedArray;
        }

        if(o[karbonator.shallowClone]) {
            return o[karbonator.shallowClone]();
        }
        
        return o;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} o
     * @return {*}
     */
    karbonator.shallowCloneObject = function (o) {
        return detail._shallowCloneObject(o);
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //Namespace functions.
    
    detail._hasPropertyFunction = function (key) {
        return (key in this);
    };

    detail._assignPropertyAndIgonoreExceptions = function (dest, src, key) {
        try {
            dest[key] = src[key];
        }
        catch(e) {}
    };

    detail._assignPropertyAndThrowExceptionIfOccured = function (dest, src, key) {
        dest[key] = src[key];
    };
    
    detail._makeMergeObjectsOptionsObject = function (options) {
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
    
    detail._mergeObjects = function (dest, src) {
        var options = detail._makeMergeObjectsOptionsObject(arguments[2]);

        var selectedHasPropertyFunction = (
            options.copyNonOwnProperties
            ? detail._hasPropertyFunction
            : Object.prototype.hasOwnProperty
        );
        
        var assignPropertyFunction = (
            options.ignoreExceptions
            ? detail._assignPropertyAndIgonoreExceptions
            : detail._assignPropertyAndThrowExceptionIfOccured
        );

        for(var key in src) {
            if(
                selectedHasPropertyFunction.call(src, key)
                && (options.overwrite || !detail._hasPropertyFunction.call(dest, key))
            ) {
                if(
                    options.deepCopy
                    && typeof(dest[key]) === "object"
                    && typeof(src[key]) === "object"
                ) {
                    detail_mergeObjects(dest[key], src[key]);
                }
                else {
                    assignPropertyFunction(dest, src, key);
                }
            }
        }

        return dest;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {Object} dest
     * @param {Object} src
     * @param {Object} [options]
     * @return {Object}
     */
    karbonator.mergeObjects = detail._mergeObjects;
    
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
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.ByteArray
    
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
    
    var _bitsPerByteExp = 3;
    
    var _bitsPerByte = 1 << _bitsPerByteExp;
    
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
        return ((_bytesPerInt - 1) - subIndex) << _bitsPerByteExp;
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
        return ((this._buffer.length - 1) << _bufNdxExp) + this._subIndex;
    };
    
    /**
     * @function
     * @return {iterator}
     */
    ByteArray.prototype[Symbol.iterator] = function () {
        return ({
            next : function () {
                var out = {
                    done : this._index >= this._target.getElementCount()
                };
                
                if(!out.done) {
                    out.value = this._target.get(this._index);
                    ++this._index;
                }
                
                return out;
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
        this._assertIsValidIndex(index);
        
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
        this._assertIsValidIndex(index);
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
        var start = (karbonator.isUndefined(arguments[1]) ? 0 : this._assertIsValidIndex(arguments[1]));
        var elemCount = this.getElementCount();
        var end = (karbonator.isUndefined(arguments[2]) ? elemCount : this._assertIsValidIndex(arguments[2], elemCount + 1));
        
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
        this._assertIsValidIndex(lhsIndex);
        this._assertIsValidIndex(rhsIndex);
        
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
        this._assertIsValidIndex(index, elemCount + 1);
        
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

        this._assertIsValidIndex(index);

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
     * @param {Number} [startIndex]
     * @param {Number} [endIndex]
     * @return {karbonator.ByteArray}
     */
    ByteArray.prototype.slice = function () {
        var byteCount = this.getElementCount();
        var startIndex = arguments[0];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new TypeError("");
        }
        else if(startIndex >= byteCount) {
            throw new RangeError("");
        }
        
        var endIndex = arguments[1];
        if(karbonator.isUndefined(endIndex)) {
            endIndex = byteCount;
        }
        else if(!karbonator.isNonNegativeSafeInteger(endIndex)) {
            throw new TypeError("");
        }
        else if(endIndex > byteCount) {
            endIndex = byteCount;
        }
        
        var slicedByteCount = endIndex - startIndex;
        var newByteArray = new ByteArray(slicedByteCount);
        for(var i = slicedByteCount, j = endIndex; j > startIndex; ) {
            --j;
            --i;
            
            newByteArray.set(i, this.get(j));
        }
        
        return newByteArray;
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
    
    /**
     * @private
     * @function
     * @param {Number} index
     * @param {Number} [maxBound]
     * @return {Number}
     */
    ByteArray.prototype._assertIsValidIndex = function (index) {
        _assertIsNonNegativeSafeInteger(index);
        
        var maxBound = arguments[1];
        if(karbonator.isUndefined(maxBound)) {
            maxBound = this.getElementCount();
        }
        
        if(index >= maxBound) {
            throw new RangeError("Index out of range.");
        }
        
        return index;
    };
    
    karbonator.ByteArray = ByteArray;
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //Conversion functions.
    
    /**
     * @memberof karbonator
     * @function
     * @param {*} v
     * @return {Number}
     */
    karbonator.toInteger = function (v) {
        var n = Number(v);
        if(global.isNaN(n)) {
            return +0;
        }
        
        if(
            n === 0
            || n === global.Infinity
            || n === -global.Infinity
        ) {
            return n;
        }
        
        return Math.sign(n) * Math.floor(Math.abs(n));
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     */
    detail._throwRangeErrorOfByteCount = function () {
        throw new RangeError("'byteCount' can be only 1, 2 or 4.");
    };
    
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
            detail._throwRangeErrorOfByteCount();
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
     * @return {karbonator.ByteArray}
     */
    karbonator.integerToBytes = function (value, byteCount) {
        if(!karbonator.isInteger(value)) {
            throw new TypeError("'value' must be an integer.");
        }
        
        detail._assertByteCountInRange(byteCount);
        
        var dest = arguments[3];
        if(karbonator.isUndefined(dest)) {
            dest = new karbonator.ByteArray(byteCount);
        }
        else if(!(dest instanceof karbonator.ByteArray)) {
            throw new TypeError("'dest' must be an instance of 'karboantor.ByteArray'.");
        }
        
        var destIndex = arguments[4];
        if(karbonator.isUndefined(destIndex)) {
            destIndex = dest.getElementCount();
        }
        else if(!karbonator.isNonNegativeSafeInteger(destIndex)) {
            throw new RangeError("'destIndex' must be a non-negative safe integer.");
        }
        
        for(
            var i = destIndex + byteCount - dest.getElementCount();
            i > 0;
        ) {
            --i;
            
            dest.pushBack(0);
        }
        
        if(!!arguments[2]) {
            for(var i = destIndex, j = byteCount; j > 0; ++i) {
                --j;
                
                dest.set(i, (value & 0xFF));
                value >>>= 8;
            }
        }
        else for(var i = destIndex + byteCount, j = byteCount; j > 0; ) {
            --j;
            --i;
            
            dest.set(i, (value & 0xFF));
            value >>>= 8;
        }
        
        return dest;
    };
    
    /**
     * @memberof karbonator
     * @function
     * @param {karbonator.ByteArray|iterable} bytes
     * @param {Number} byteCount - 1, 2 or 4 only.
     * @param {Boolean} [signed=false]
     * @param {Boolean} [byteOrderReversed=false]
     * @param {Number} [startIndex=0]
     * @return {Number}
     */
    karbonator.bytesToInteger = function (bytes, byteCount) {
        if(!(bytes instanceof karbonator.ByteArray)) {
            if(karbonator.isEsIterable(bytes)) {
                bytes = karbonator.ByteArray.from(bytes);
            }
            else {
                throw new TypeError(
                    "'byteArray' must be an instance of 'karbonator.ByteArray'"
                    + " or "
                    + "an iterable collection of integers."
                );
            }
        }
        
        if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
            throw new TypeError("'byteCount' must be a non-negative integer.");
        }
        
        var signed = !!arguments[2];
        var byteOrderReversed = !!arguments[3];
        var index = arguments[4];
        if(karbonator.isUndefined(index)) {
            index = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(index)) {
            throw new TypeError("The parameter 'startIndex' must be a non-negative safe integer.");
        }
        
        var intValue = 0;
        
        switch(byteCount) {
        case 0:
            detail._throwRangeErrorOfByteCount();
        break;
        case 1:
            intValue = bytes.get(index);
            
            if(signed && intValue >= detail._twoPower7) {
                intValue -= detail._twoPower8;
            }
        break;
        case 2:
            if(byteOrderReversed) {
                intValue = bytes.get(index);
                intValue |= (bytes.get(++index) << 8);
            }
            else {
                intValue = bytes.get(index);
                intValue <<= 8;
                intValue = bytes.get(++index);
            }
            
            if(signed && intValue >= detail._twoPower15) {
                intValue -= detail._twoPower16;
            }
        break;
        case 3:
            detail._throwRangeErrorOfByteCount();
        break;
        case 4:
            if(byteOrderReversed) {
                intValue = bytes.get(index);
                intValue |= (bytes.get(++index) << 8);
                intValue |= (bytes.get(++index) << 16);
                intValue |= (bytes.get(++index) << 24);
            }
            else {
                intValue = bytes.get(index);
                intValue <<= 8;
                intValue = bytes.get(++index);
                intValue <<= 8;
                intValue = bytes.get(++index);
                intValue <<= 8;
                intValue = bytes.get(++index);
            }
            
            if(signed && intValue >= detail._twoPower31) {
                intValue -= detail._twoPower32;
            }
        break;
        default:
            detail._throwRangeErrorOfByteCount();
        }
        
        return intValue;
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
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //global.Console polyfill.(usually for node.js)
    
    (function (console) {
        if(
            !karbonator.isUndefined(console)
            && !console.clear
            && console.log
        ) {
            console.clear = (
                global.process
                ? (function () {
                    var lines = global.process.stdout.getWindowSize()[1];
                    for(var i = 0; i < lines; i++) {
                        console.log('\x1BC');
                    }
                })
                : console.clear = (function () {
                    console.log('\x1B[EJ');
                })
            );
        }
    }(global.console));
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
