/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (factory) {
    var g = this;
    
    if(typeof(define) === "function" && define.amd) {
        define(function () {
            return factory(g);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = factory(g);
    }
    else {
        factory(g);
    }
}(
(function (global) {
    "use strict";
    
    var Object = global.Object;
    var Array = global.Array;
    var String = global.String;
    var Function = global.Function;
    var Number = global.Number;
    var Boolean = global.Boolean;
    var Date = global.Date;
    var RegExp = global.RegExp;
    var Error = global.Error;
    var TypeError = global.TypeError;
    
    var _polyfillPropNamePrefix = "_krbntr";
    
    var _hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    
    /**
     * @constructor
     */
    var _Array = function () {
        Array.apply(this, arguments);
    };
    _Array.prototype = Array.prototype;
    
    /**
     * @function
     * @param {Object} value
     * @param {Object} defaultValue
     */
    var _selectNonUndefined = function (value, defaultValue) {
        return (typeof(value) !== "undefined" ? value : defaultValue);
    };
    
    /**
     * TODO : test this code.
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isArray = function (o) {
        return typeof(o) === "object"
            && o !== null
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
    }
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isObjectOrFunction = function (o) {
        var result = true;
        
        switch(typeof(o)) {
        case "undefined":
        case "number":
        case "string":
        case "boolean":
        case "symbol":
            result = false;
        //break;
        }
        
        return result;
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
     * @constructor
     * @param {Array} arr
     */
    var ArrayKeyIterator = function (arr) {
        this._arr = arr;
        this._i = 0;
    };
    
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
    
    /**
     * @constructor
     * @param {Array} arr
     */
    var ArrayValueIterator = function (arr) {
        this._arr = arr;
        this._i = 0;
    };
    
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
    
    /**
     * @constructor
     * @param {Array} arr
     */
    var ArrayEntryIterator = function (arr) {
        this._arr = arr;
        this._i = 0;
    };
    
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
    
    /**
     * @constructor
     * @param {String} str
     */
    var StringValueIterator = function (str) {
        this._str = str;
        this._i = 0;
    };
    
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
    
    Object.keys = (function (global) {
        var originalKeys = Object.keys;
        var isOriginalEs6Spec = (function () {
            if(originalKeys) {
                try {
                    originalKeys("");
                    
                    return true;
                }
                catch(e) {
                    return false;
                }
            }
            
            return false;
        }());
        
        var missingKeys = [
            "constructor",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "toLocaleString",
            "toString",
            "valueOf"
        ];
        var canNotEnumerateToString = !({toString : null}).propertyIsEnumerable("toString");
        var throwError = function () {
            throw new Error("At least one non-null object argument must be passed.");
        };
        var getKeysFromObject = function (o) {
            if(o === null) {
                throwError();
            }
            
            var keys = [];
            for(var key in o) {
                if(_hasOwnPropertyFunction.call(o, key)) {
                    keys.push(key);
                }
            }
            
            if(canNotEnumerateToString) {
                for(var key in missingKeys) {
                    if(!_hasOwnPropertyFunction.call(o, key)) {
                        keys.push(key);
                    }
                }
            }
            
            return keys;
        };
        var getKeysFromString = function (o) {
            var keys = [];
            
            for(var i = 0; i < o.length; ++i) {
                keys.push("" + i);
            }
            
            return keys;
        };
        var pseudoKeys = function (o, getKeysFromObjectFunction) {
            switch(typeof(o)) {
            case "undefined":
                throwError();
            break;
            case "boolean":
            case "number":
            case "symbol":
                return [];
            break;
            case "string":
                return getKeysFromString(o);
            break;
            default:
                return getKeysFromObjectFunction(o);
            }
        };
        
        if(originalKeys) {
            if(isOriginalEs6Spec) {
                return originalKeys;
            }
            else {
                return function (o) {
                    return pseudoKeys(o, originalKeys);
                };
            }
        }
        else {
            return function (o) {
                return pseudoKeys(o, getKeysFromObject);
            };
        }
    }(global));
    
    Object.create = Object.create || (function (proto) {
        if(!_isObjectOrFunction(proto)) {
            throw new TypeError("The parameter 'proto' must be an object.");
        }
        
        if(proto === null) {
            throw new Error("This polyfill doesn't support null argument for the 'proto' parameter.");
        }
        
        var Derived = function () {};
        Derived.prototype = proto;
        
        var newObject = new Derived();
        if(arguments.length > 1) {
            Object.defineProperties(Derived.prototype, arguments[1]);
        }
        newObject.constructor = proto.constructor;
        
        return newObject;
    });
    
    Object.getPrototypeOf = Object.getPrototypeOf || (function (o) {
        _assertIsNotNullAndUndefined(o);
        
        if(!(o.__proto__)) {
            throw new Error("This environment doesn't support retrieving prototype of an object and the passed object also does't have '__proto__' property.");
        }
        
        return o.__proto__;
    });
    
    Object.setPrototypeOf = Object.setPrototypeOf || (function (o, proto) {
        if(proto !== null && _isObjectOrFunction(proto)) {
            _assertIsNotNullAndUndefined(o);
            
            if(!_hasOwnPropertyFunction.call(o, "__proto__")) {
                throw new Error("This environment doesn't support replacing prototype.");
            }
            
            o.__proto__ = proto;
        }
    });
    
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
    
//    Array.from = Array.from || function (arrayLike) {
//        
//    };
    
    Array.of = Array.of || function () {
        return Array.prototype.slice.call(arguments);
    };
    
    //TODO : test this code.
    Array.isArray = Array.isArray || _isArray;
    
    Array.prototype.findIndex = Array.prototype.findIndex || (function (callback) {
        var thisArg = arguments[1];
        
        var index = 0;
        for(; index < this.length; ++index) {
            if(callback.call(thisArg, this[index], index, this)) {
                return index;
            }
        }
        
        return -1;
    });
    
    Array.prototype.some = Array.prototype.some || (function (callback) {
        return (this.findIndex(callback) >= 0);
    });
    
    Array.prototype.every = Array.prototype.every || (function (callback) {
        var thisArg = arguments[1];
        
        var index = 0;
        for(; index < this.length; ++index) {
            if(!callback.call(thisArg, this[index], index, this)) {
                return false;
            }
        }
        
        return true;
    });
    
    Array.prototype.indexOf = Array.prototype.indexOf || (function (elem) {
        var index = _selectNonUndefined(arguments[1], 0);
        for(; index < this.length; ++index) {
            if(this[index] === elem) {
                break;
            }
        }
        
        return (index < this.length ? index : -1);
    });
    
    Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || (function (elem) {
        var index = _selectNonUndefined(arguments[1], this.length - 1);
        for(; index >= 0; --index) {
            if(this[index] === elem) {
                break;
            }
        }
        
        return (index >= 0 ? index : -1);
    });
    
    Array.prototype.includes = Array.prototype.includes || (function (elem) {
        return (this.indexOf(elem, arguments[1]) >= 0);
    });
    
    Array.prototype.forEach = Array.prototype.forEach || (function (callback) {
        var thisArg = arguments[1];
        
        for(var i = 0; i < this.length; ++i) {
            callback.call(thisArg, this[i], i, this);
        }
    });
    
    Array.prototype.entries = Array.prototype.entries || function () {
        return new ArrayEntryIterator(this);
    }
    
    Array.prototype.keys = Array.prototype.keys || function () {
        return new ArrayKeyIterator(this);
    };
    
    Array.prototype.values = Array.prototype.values || function () {
        return new ArrayValueIterator(this);
    };
    
//    Array.prototype.copyWithin = Array.prototype.copyWithin || function (target) {
//        var start = 0;
//        var end = 0;
//    };
    
    Array.prototype.fill = Array.prototype.fill || function (value) {
        var start = _selectNonUndefined(arguments[1], 0);
        if(start < 0) {
            start += this.length;
        }
        
        var end = _selectNonUndefined(arguments[2], this.length);
        if(end < 0) {
            end += this.length;
        }
        
        if(_isString(this)) {
            if(this.length < 1) {
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
    
    String.prototype.trim = String.prototype.trim || (function () {
        //https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/trim
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    });
    
    String.prototype.includes = String.prototype.includes || (function (elem) {
        return (this.indexOf(elem, arguments[1]) >= 0);
    });
    
    String.prototype.startsWith = String.prototype.startsWith || (function (other) {
        return this.substr(
            (arguments.length > 1 ? arguments[1] : 0),
            other.length
        ) === other;
    });
    
    String.prototype.endsWith = String.prototype.endsWith || (function (other) {
        var length = (arguments.length > 1 ? arguments[1] : this.length);
        var s = this.substr(0, length);
        
        return s.substr(s.length - other.length, other.length) === other;
    });
    
    //reference 1 : https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
    //reference 2 : https://www.reddit.com/r/javascript/comments/5ovl09/understanding_functionprototypebind_polyfill/
    Function.prototype.bind = Function.prototype.bind || (function (thisArg) {
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
    });
    
    Number.parseInt = Number.parseInt
        || global.parseInt
        || (function () {
            throw new Error("Not polyfilled yet...");
        })
    ;
    
    Number.parseFloat = Number.parseFloat
        || global.parseFloat
        || (function () {
            throw new Error("Not polyfilled yet...");
        })
    ;
    
    Date.now = Date.now || (function () {
        return new Date().getTime();
    });
    
    global.Reflect = global.Reflect || {
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
    
    global.Symbol = global.Symbol || (function (global) {
        var symbolKeyPrefix = _polyfillPropNamePrefix + "Symbol";
        
        var knownSymbolKeys = [
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
        
        var globalIdCounter = 0;
        
        /**
         * @function
         * @param {*} arg
         * @return {String}
         */
        var createKey = function (arg) {
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
        
        var FakeSymbolCtor = function () {
            this._key = createKey(arguments[0]);
            
            //A non-standard behaviour to distinguish each symbol instances...
            this._id = ++globalIdCounter;
            if(this._id == 0) {
                throw new Error("The Symbol polyfill cannot instantiate additional distinguishing symbols...");
            }
        };
        FakeSymbolCtor.prototype = Object.create(Object.prototype);
        
        /**
         * references:
         * - http://ecma-international.org/ecma-262/5.1/#sec-9.12
         * - https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/
         * @constructor
         * @param {String} [description = ""]
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
            var newSymbol = new FakeSymbolCtor(arg);
            
            return newSymbol;
        };
        Symbol.prototype = FakeSymbolCtor.prototype;
        Symbol.prototype.constructor = Symbol;
        
        var Registry = (function () {
            var Registry = function () {
                this._registry = [];
            };
            
            /**
             * @function
             * @param {String} key
             * @return {Boolean}
             */
            Registry.prototype.hasSymbol = function (key) {
                return this._findPairIndexByKey(key) >= 0;
            };
            
            /**
             * @function
             * @param {Symbol} symbol
             * @return {String|undefined}
             */
            Registry.prototype.findKeyBySymbol = function (symbol) {
                var index = this._registry.findIndex(
                    function (pair) {
                        return pair.value === symbol //Es6 스펙 19.4.2.5절에 따라 === 사용.
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
            Registry.prototype.getOrCreateSymbolByKey = function (key) {
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
            Registry.prototype._findPairIndexByKey = function (key) {
                return this._registry.findIndex(
                    function (pair) {
                        return pair.key === key;
                    }
                );
            };
            
            return Registry;
        })();
        
        var globalRegistry = new Registry();
        
        for(var i = 0; i < knownSymbolKeys.length; ++i) {
            var knownSymbolKey = knownSymbolKeys[i];
            Symbol[knownSymbolKey] = Symbol(knownSymbolKey);
        }
        
        /**
         * @memberof Symbol
         * @function
         * @param {String} key
         * @return {Symbol}
         */
        Symbol["for"] = function (key) {
            return globalRegistry.getOrCreateSymbolByKey(
                createKey(_selectNonUndefined(key, "undefined"))
            );
        };
        
        /**
         * @memberof Symbol
         * @function
         * @param {Symbol} symbol
         * @return {String|undefined}
         */
        Symbol.keyFor = function (symbol) {
            return globalRegistry.findKeyBySymbol(symbol);
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
         * Outputs 'non-standard' string for distinguishing each symbol instances.
         * To get 'SymbolDescriptiveString' of the standard, 
         * use a non-standard function 'Symbol.prototype.toSymbolDescriptiveString'.
         * @function
         * @return {String}
         * @see Symbol.prototype.toSymbolDescriptiveString
         */
        Symbol.prototype.toString = function () {
            return symbolKeyPrefix + this._id + "_" + this.toSymbolDescriptiveString();
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
        
        var symbolKeyPattern = new RegExp("^" + symbolKeyPrefix + "[0-9]+_");
        
        Object.getOwnPropertySymbols = Object.getOwnPropertySymbols || (function (o) {
            var symbolKeys = [];
            for(var key in o) {
                if(
                    Object.prototype.hasOwnProperty.call(o, key)
                    && symbolKeyPattern.test(key)
                ) {
                    symbolKeys.push(key.replace(symbolKeyPattern, ""));
                }
            }
            
            return symbolKeys;
        });
        
        Array.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator] || Array.prototype.values;
        
        String.prototype[Symbol.iterator] = String.prototype[Symbol.iterator] || function () {
            return new StringValueIterator(this);
        };
        
//        Date.prototype[Symbol.toPrimitive] = Date.prototype[Symbol.toPrimitive] || function (hint) {
//            switch(hint) {
//            case "number":
//                if(this.valueOf) {
//                    return this.valueOf();
//                }
//                else if(this.toString) {
//                    return this.toString();
//                }
//                else {
//                    throw new TypeError("Cannot convert the date instance to primitive.");
//                }
//            case "default":
//            case "string":
//                if(this.toString) {
//                    return this.toString();
//                }
//                else if(this.valueOf){
//                    return this.valueOf();
//                }
//                else {
//                    throw new TypeError("Cannot convert the date instance to primitive.");
//                }
//            //break;
//            }
//        };
        
        return Symbol;
    }(global));
})
));
