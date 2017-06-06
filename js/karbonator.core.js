/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (moduleFactory) {
    var g = this;
    
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.polyfill-es"], function () {
            return moduleFactory(g);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        require("./karbonator.polyfill-es");
        
        exports = module.exports = moduleFactory(g);
    }
    else {
        g.karbonator = moduleFactory(g);
    }
}(
(function (global) {
    "use strict";
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator namespace.
    
    var karbonator = (function (global) {
        /**
         * @global
         * @namespace
         */
        var karbonator = {};
        
        /*////////////////////////////////*/
        //Namespace private constants and functions.
        
        /**
         * @function
         * @param {*} o
         * @return {Boolean}
         */
        var _isCallable = function (o) {
            return typeof(o) === "function";// || (function () {try {o(); return true;} catch(e) {return false;}})();
        };
        
        /**
         * @function
         * @param {Object} arg
         * @return {Boolean}
         */
        var _isNotUndefined = function (arg) {
            return typeof(arg) !== "undefined";
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
         * @param {Object} global
         * @return {String}
         */
        var _determineEnvironmentType = function (global) {
            if((new Function("try{return this===window}catch(e){return false;}")).bind(global)()) {
                return "WebBrowser";
            }
            else if((typeof(global.process) !== "undefined") && (global.process.release.name === "node")) {
                return "Node.js";
            }
            else {
                return "Other";
            }
        };
        
        var _hasPropertyFunction = function (key) {
            return (key in this);
        };
        
        var _getPrototypeOfExist = _isNotUndefined(Object.getPrototypeOf);
        
        var _protoPropertyExist = Object.prototype.hasOwnProperty("__proto__");
        
        var _identifierRegEx = /^[a-zA-Z$_][0-9a-zA-Z$_]*$/;
        
        /*////////////////////////////////*/
        
        global.XMLHttpRequest = (function (global) {
            if(global.XMLHttpRequest) {
                return global.XMLHttpRequest;
            }
            else if(global.ActiveXObject) {
                return function() {
                    return new ActiveXObject(
                        global.navigator.userAgent.indexOf("MSIE 5") >= 0
                        ? "Microsoft.XMLHTTP"
                        : "Msxml2.XMLHTTP"
                    );
                };
            }
        }(global));
        
        /*////////////////////////////////*/
        //Namespace functions - part 1.
        
        /**
         * @memberof karbonator
         * @function
         */
        karbonator.onload = function () {};
        
        /**
         * @memberof karbonator
         * @function
         * @param {Object} arg
         * @return {Boolean}
         */
        karbonator.isNotUndefined = _isNotUndefined;
        
        /**
         * @memberof karbonator
         * @function
         * @param {Object} value
         * @param {Object} defaultValue
         */
        karbonator.selectNonUndefined = _selectNonUndefined;
        
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
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Environment
        
        karbonator.Environment = (function () {
            /**
             * @memberof karbonator
             * @constructor
             * @param {Object} global
             */
            var Environment = function (global) {
                this.global = global;
                
                if(this.type === "WebBrowser") {
                    this.requestAnimationFrame = window.requestAnimationFrame
                        || window.webkitRequestAnimationFrame
                        || window.mozRequestAnimationFrame
                        || window.oRequestAnimationFrame
                        || window.msRequestAnimationFrame
                        || this.requestAnimationFrame
                    ;
                    
                    this.cancelAnimationFrame = window.cancelAnimationFrame
                        || window.webkitCancelAnimationFrame
                        || window.mozCancelAnimationFrame
                        || window.oCancelAnimationFrame
                        || window.msCancelAnimationFrame
                        || this.cancelAnimationFrame
                    ;
                }
                
                this.support["XMLHttpRequest"] = karbonator.isNotUndefined(global.XMLHttpRequest);
                
                this.support["window"] = karbonator.isNotUndefined(global.window);
                this.support["document"] = karbonator.isNotUndefined(global.document);
                this.support["Window"] = karbonator.isNotUndefined(global.Window);
                this.support["HTMLDocument"] = karbonator.isNotUndefined(global.HTMLDocument);
                this.support["Element"] = karbonator.isNotUndefined(global.Element);
            };
            
            Environment.prototype.support = {};
            
            /**
             * @function
             * @return {String}
             */
            Environment.prototype.getType = function () {
                return _determineEnvironmentType(this.global);
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
             * @return {Number}
             */
            Environment.prototype.testEs6Symbol = function () {
                var Symbol = this.global.Symbol;
                if(typeof(Symbol) === "undefined" || Symbol === null) {
                    //지원 안 함.
                    return 0;
                }
                
                var Object = this.global.Object;
                var score = 12;
                var symbolKey = "karbonator";
                
                /*////////////////////////////////*/
                //생성 테스트
                
                var localSymbol1 = Symbol(symbolKey);
                if(typeof(localSymbol1) !== "undefined") {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //new 연산자에 의한 생성이 금지되었는 지 테스트.
                
                try {
                    new Symbol();
                }
                catch(e) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //비교 테스트
                
                var localSymbol2 = Symbol(symbolKey);
                if(
                    localSymbol1 !== localSymbol2
                    && localSymbol1.valueOf() !== localSymbol2.valueOf()
                ) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //Symbol.prototype.valueOf 테스트
                
                if(localSymbol1.valueOf() === localSymbol1) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                var SymbolForFunc = Symbol["for"];
                if(typeof(SymbolForFunc) !== "undefined") {
                    /*////////////////////////////////*/
                    //global 심볼과 local 심볼 비교 테스트 1.
                    
                    var registeredFoo = SymbolForFunc(symbolKey);
                    if(
                        (registeredFoo !== localSymbol1 && registeredFoo !== localSymbol2)
                        && (SymbolForFunc(symbolKey) === SymbolForFunc(symbolKey))
                    ) {
                        --score;
                    }
                    
                    /*////////////////////////////////*/
                    
                    /*////////////////////////////////*/
                    //global 심볼과 local 심볼을 오브젝트 프로퍼티로 활용하는 테스트.
                    //polyfill이 Symbol.prototype.toString 메소드를 사용하는 경우
                    //반환 값이 표준에 어긋나야 점수를 받을 수 있을 것임.
                    
                    var propTestObj = {};
                    propTestObj[localSymbol1] = symbolKey;
                    if(
                        propTestObj[localSymbol1] !== propTestObj[SymbolForFunc(symbolKey)]
                        && propTestObj[localSymbol1] !== propTestObj[localSymbol2]
                    ) {
                        --score;
                    }
                    
                    /*////////////////////////////////*/
                    
                    /*////////////////////////////////*/
                    //undefined 심볼 비교 테스트
                    
                    if(
                        SymbolForFunc() === SymbolForFunc("undefined")
                        && SymbolForFunc() === SymbolForFunc(undefined)
                        && SymbolForFunc() !== Symbol()
                        && SymbolForFunc().toString().endsWith("Symbol(undefined)")
                        && SymbolForFunc(undefined).toString().endsWith("Symbol(undefined)")
                        && SymbolForFunc("").toString().endsWith("Symbol()")
                        && SymbolForFunc("undefined").toString().endsWith("Symbol(undefined)")
                        && Symbol().toString().endsWith("Symbol()")
                        && Symbol(undefined).toString().endsWith("Symbol()")
                        && Symbol("").toString().endsWith("Symbol()")
                        && Symbol("undefined").toString().endsWith("Symbol(undefined)")
                    ) {
                        --score;
                    }
                    
                    /*////////////////////////////////*/
                    
                    if(typeof(Symbol.keyFor) !== "undefined") {
                        /*////////////////////////////////*/
                        //Symbol.keyFor 지원여부 테스트
                        
                        if(
                            Symbol.keyFor(SymbolForFunc(symbolKey)) === symbolKey
                            && typeof(Symbol.keyFor(Symbol())) === "undefined"
                        ) {
                            --score;
                        }
                        
                        /*////////////////////////////////*/
                        
                        /*////////////////////////////////*/
                        //well-known 심볼, local 심볼, global 심볼 비교 테스트
                        
                        //Symbol.iterator만 확인...
                        //나머지도 잘 되길 바라야지...
                        if(
                            typeof(Symbol.iterator) !== "undefined"
                            && Symbol.keyFor(Symbol.iterator) !== Symbol("iterator")
                            && Symbol.keyFor(Symbol.iterator) !== SymbolForFunc("iterator") //레지스트리에 심볼 최초 생성
                            && Symbol.keyFor(Symbol.iterator) !== SymbolForFunc("iterator") //생성된 심볼과 비교
                        ) {
                            --score;
                        }
                        
                        /*////////////////////////////////*/
                    }
                }
                
                /*////////////////////////////////*/
                //프토로타입 체인 테스트.
                
                (function () {
                    if(localSymbol1.constructor !== Symbol) {
                        return;
                    }
                    
                    //브라우저에 따라 테스트가 안 되는 경우(주로 IE < 9)는 다음 테스트를 패스.
                    try {
                        if(
                            (_getPrototypeOfExist && Object.getPrototypeOf(localSymbol1) !== Symbol.prototype)
                            || (_protoPropertyExist && localSymbol1.__proto__ !== Symbol.prototype)
                        ) {
                            return;
                        }
                    }
                    catch(e) {}
                    
                    --score;
                })();
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //instanceof 연산자 테스트 및
                //primitive type symbol 지원 여부 테스트.
                //polyfill인 경우 점수를 못 받을 수 있음.
                
                if(
                    !(localSymbol1 instanceof Symbol)
                    && !(localSymbol1 instanceof Object)
                    && typeof(localSymbol1) === "symbol"
                ) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                //1점이면 완벽 지원, 2점 이상이면 부분지원
                return score;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            Environment.prototype.supportsSynchronousHttpRequest = function () {
                if(typeof(this.global.XMLHttpRequest) === "undefined") {
                    return false;
                }
                
                var result = true;
                var xhr = new this.global.XMLHttpRequest();
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
            
            /**
             * @function
             * @param {Function} callback
             * @return {Number}
             */
            Environment.prototype.requestAnimationFrame = function (callback) {
                return this.global.setTimeout(callback, 1000 / 60);
            };
            
            /**
             * @function
             * @param {Number} id
             */
            Environment.prototype.cancelAnimationFrame = function (id) {
                this.global.clearTimeout(id);
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
        
        /*////////////////////////////////*/
        //Namespace functions - part 2.
        
        /**
         * @memberof karbonator
         * @function
         * @param {Object} dest
         * @param {Object} src
         * @param {Object} [options]
         * @return {Object}
         */
        karbonator.mergeObjects = (function () {
            var assignPropertyAndIgonoreExceptions = function (dest, src, key) {
                try {
                    dest[key] = src[key];
                }
                catch(e) {}
            };
            
            var assignPropertyAndThrowExceptionIfOccured = function (dest, src, key) {
                dest[key] = src[key];
            };
            
            var makeOptionsObject = function (options) {
                switch(typeof(options)) {
                case "undefined":
                    options = {};
                break;
                case "object":
                    if(options === null) {
                        options = {};
                    }
                break;
                case "function":
                break;
                default:
                    throw new Error("The parameter 'options' must be an object.");
                }
                options.copyNonOwnProperties = _selectNonUndefined(
                    options.copyNonOwnProperties,
                    false
                );
                options.deepCopy = _selectNonUndefined(
                    options.deepCopy,
                    false
                );
                options.overwrite = _selectNonUndefined(
                    options.overwrite,
                    false
                );
                options.ignoreExceptions = _selectNonUndefined(
                    options.ignoreExceptions,
                    false
                );
                
                return options;
            };
            
            var mergeObjects = function (dest, src) {
                var options = makeOptionsObject(arguments[2]);
                
                var selectedHasPropertyFunction = (
                    options.copyNonOwnProperties
                    ? _hasPropertyFunction
                    : Object.prototype.hasOwnProperty
                );
                
                var assignProperty = (
                    options.ignoreExceptions
                    ? assignPropertyAndIgonoreExceptions
                    : assignPropertyAndThrowExceptionIfOccured
                );
                
                for(var key in src) {
                    if(
                        selectedHasPropertyFunction.call(src, key)
                        && (options.overwrite || !_hasPropertyFunction.call(dest, key))
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
            var current = _selectNonUndefined(globalObject, global);
            for(var i = 0; i < tokens.length; ++i) {
                var token = tokens[i];
                if(token.match(_identifierRegEx)) {
                    current = current[token] = _selectNonUndefined(current[token], {});
                }
                else {
                    throw new Error("'" + token + "' is an illigal identifier.");
                }
            }
            
            return current;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //ScriptLoader
        
        karbonator.ScriptLoader = (function () {
            /**
             * @memberof karbonator
             * @interface
             */
            var ScriptLoader = function () {};
            
            /**
             * @memberof karbonator.ScriptLoader
             * @readonly
             * @enum {Number}
             */
            ScriptLoader.EventType = {
                loadStart : 0,
                
                loadSucceeded : 1,
                
                loadFailed : 2
            };
            
            /**
             * @function
             * @param {Array.<String>} paths
             * @param {Function} handler
             * @param {Object} [thisArg]
             */
            ScriptLoader.prototype.loadScripts = function (paths, handler, thisArg) {};
            
            return ScriptLoader;
        })();
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //DomScriptLoader
        
        karbonator.DomScriptLoader = (function () {
            var parentType = karbonator.ScriptLoader;
            
            /**
             * @memberof karbonator
             * @constructor
             * @param {HTMLDocument} document
             */
            var DomScriptLoader = function (document) {
                if(typeof(document) !== "object" || document === null) {
                    throw new TypeError("The parameter 'document' must be a non-null object.");
                }
                this._document = document;
            };
            DomScriptLoader.prototype = new parentType();
            DomScriptLoader.prototype.constructor = DomScriptLoader;
            
            /**
             * @function
             * @param {Array.<String>} paths
             * @param {Function} handler
             * @param {Object} [thisArg]
             */
            DomScriptLoader.prototype.loadScripts = function (paths, handler, thisArg) {
                handler = handler.bind(thisArg);
                
                for(var i = 0; i < paths.length; ++i) {
                    var scriptTag = this._document.createElement("script");
                    
                    if(typeof(scriptTag.onreadystatechange) === "undefined") {
                        scriptTag.onload = handler;
                        scriptTag.onerror = handler;
                    }
                    else {
                        scriptTag.onreadystatechange = handler;
                    }
                    scriptTag.src = scriptSrc;
                    destTag.appendChild(scriptTag);
                }
            };
            
            return DomScriptLoader;
        })();
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Asynchronous Module Definition implementaion.
        
        karbonator.AmdModuleLoader = (function () {
            /**
             * @memberof karbonator
             * @constructor
             * @param {Object} global
             */
            var AmdModuleLoader = function (global) {
                this._global = global;
                this._modules = [];
            };
            
            AmdModuleLoader.ModuleDescriptor = (function () {
                /**
                 * @memberof karbonator.AmdModuleLoader
                 * @constructor
                 * @param {String} [id = ""]
                 * @param {String} [relativePath = ""]
                 * @param {Function|Object} factory
                 */
                var ModuleDescriptor = function (id, relativePath, factory) {
                    switch(typeof(factory)) {
                    case "function":
                    case "object":
                        this.factory = factory;
                    break;
                    default:
                        throw new TypeError("The parameter 'factory' must be a function or an object.");
                    }
                    
                    this.id = karbonator.selectNonUndefined(id, "");
                    this.relativePath = karbonator.selectNonUndefined(relativePath, "");
                    this.loaded = false;
                };
                
                return ModuleDescriptor;
            })();
            
            /**
             * @function
             * @return {*|undefined}
             */
            AmdModuleLoader.prototype.require = (function () {
                var syncedLoad = function (path) {
                    
                };
                
                var asyncedLoad = function (paths, handler, thisArg) {
                    
                };
                
                var onModulesLoaded = function (result, loadedModules) {
                    this.context.add_modules;
                    
                    for(var i = 0, j = 0; i < this.modules.length; ++i) {
                        if(this.modules[i] === null) {
                            this.modules[i] = loadedModules[j++];
                        }
                    }
                    
                    this.handler.apply(this.context._global, this.modules);
                };
                
                var require = function () {
                    var result = undefined;
                    
                    switch(arguments.length) {
                    case 0:
                        throw new Error("At least one argument must be passed.");
                    break;
                    case 1:
                        if(this.getModuleDescriptor(id) === null) {
                            var module = syncedLoad(this.createPath(arguments[0]));
                            add_module;
                        }
                        
                        result = this.getModuleDescriptor(id).factory;
                    break;
                    case 2:
                    default:
                    {
                        if(!(arguments[0] instanceof Array)) {
                            throw new TypeError("The parameter 'dependencies' must be an string array.");
                        }
                        if(typeof(arguments[1]) !== "function") {
                            throw new TypeError("The parameter 'handler' must be a function.");
                        }
                        
                        var proxy = {
                            context : this,
                            modules : [],
                            loadTargetPaths : [],
                            dependencies : arguments[0],
                            handler : arguments[1]
                        };
                        for(var i = 0; i < proxy.dependencies.length; ++i) {
                            var id = proxy.dependencies[i];
                            if(idNotExists) {
                                proxy.loadTargetPaths.push(this.createPath(id));
                                proxy.modules.push(null);
                            }
                            else {
                                proxy.modules.push(this.getModuleDescriptor(id).module);
                            }
                        }
                        
                        asyncedLoad(loadTargetPaths, onModulesLoaded, proxy);
                    }
                    }
                    
                    return result;
                };
                
                require.toUrl = function (str) {
                    throw new Error("Not implemented yet...");
                };
                
                return require;
            })();
            
            /**
             * @function
             * @return {*}
             */
            AmdModuleLoader.prototype.define = (function () {
                var impl = function (context, id, dependencies, factory) {
                    switch(typeof(id)) {
                    case "undefined":
                        
                    break;
                    case "object":
                        if(id === null) {
                            
                        }
                        else {
                            throw new TypeError("The parameter 'id' must be a string.");
                        }
                    break;
                    case "string":
                        
                    break;
                    default:
                        throw new TypeError("The parameter 'id' must be a string.");
                    }
                    
                    if(dependencies !== null && !(dependencies instanceof Array)) {
                        throw new TypeError("The parameter 'dependencies' must be an string array.");
                    }
                    
                    var requiredModules = [];
                    var newModule = null;
                    
                    switch(typeof(factory)) {
                    case "function":
                        
                        
                        newModule = factory.apply(context._global, requiredModules);
                    break;
                    case "object":
                        
                        
                        newModule = factory;
                    break;
                    default:
                        throw new TypeError("The parameter 'factory' must be a function or an object.");
                    }
                    
                    return newModule;
                };
                
                var define = function () {
                    var result = undefined;
                    
                    switch(arguments.length) {
                    case 0:
                        throw new Error("At least the 'factory' argument must be passed.");
                    break;
                    case 1:
                        result = impl(this, null, null, arguments[0]);
                    break;
                    case 2:
                        result = impl(this, null, arguments[0], arguments[1]);
                    break;
                    case 3:
                    default:
                        result = impl(this, arguments[0], arguments[1], arguments[2]);
                    }
                    
                    return result;
                };
                
                define.amd = {};
                
                return define;
            })();
            
            /**
             * @function
             * @param {String} id
             * @return {Object}
             */
            AmdModuleLoader.prototype.getModuleDescriptor = function (id) {
                //TODO : 구현
                return null;
            };
            
            /**
             * @function
             * @param {String} id
             * @return {String}
             */
            AmdModuleLoader.prototype.createPath = function (id) {
                var termRegEx = /^\S[^/:<>\\\*\?\"\|\r\n\t]+/;
                var tokens = id.split("\\/");
                
                switch(tokens[0]) {
                case ".":
                    
                break;
                case "..":
                    
                break;
                default:
                    
                }
                
                return id;
            };
            
            return AmdModuleLoader;
        })();
        
        /*////////////////////////////////*/
        
        return karbonator;
    })(global);
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //math sub namespace.
    
    (function (global, karbonator) {
        /**
         * @namespace
         * @memberof karbonator
         */
        var math = {};
        
        karbonator.math = math;
        
        /*////////////////////////////////*/
        //Namespace functions.
        
        /**
         * @memberof karbonator.math
         * @function
         * @param {Number} lhs
         * @param {Number} rhs
         * @param {Number} epsilon
         * @return {Boolean}
         */
        math.numberEquals = function (lhs, rhs, epsilon) {
            return Math.abs(lhs - rhs) < (epsilon == undefined ? 1e-5 : epsilon);
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
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Range
        
        math.Range = (function () {
            /**
             * @memberof karbonator.math
             * @constructor
             * @param {Number} min
             * @param {Number} max
             */
            var Range = function (min, max) {
                if(min > max) {
                    throw new Error("The parameter 'min' must be less or equal to 'max'.");
                }
                
                if(max < min) {
                    throw new Error("The parameter 'max' must be greater or equal to 'min'.");
                }
                
                this._min = min;
                this._max = max;
            };
            
            /**
             * @function
             * @param {Array.<Range>} ranges
             * @param {Number} epsilon
             * @return {Array.<Range>}
             */
            Range.disjoinRanges = function (ranges, epsilon) {
//                epsilon = karbonator.selectNonUndefined(epsilon, 1e-05);
//                var pointSet = new karbonator.collection.OrderedTreeSet(
//                    function (lhs, rhs) {
//                        if(karbonator.math.numberEquals(lhs.value, rhs.value, epsilon)) {
//                            return lhs.type < rhs.type;
//                        }
//                        else {
//                            return lhs.value < rhs.value;
//                        }
//                    }
//                );
//                for(var i = 0; i < ranges.length; ++i) {
//                    pointSet.add({
//                        value : ranges[i].getMinimum(),
//                        type : 0
//                    });
//                    pointSet.add({
//                        value : ranges[i].getMaximum(),
//                        type : 1
//                    });
//                }
//                
//                var points = [];
//                for(
//                    var iter = pointSet.values(), pair = iter.next();
//                    !pair.done;
//                    pair = iter.next()
//                ) {
//                    points.push(pair.value);
//                }
//                
//                var newRanges = [];
//                for(var i = 0; i < points.length; ++i) {
//                    var point = points[i];
//                    
//                    for(var j = i + 1; j < points.length; ++j) {
//                        var other = points[j];
//                        if(other.value > point.value || other.type > point.type) {
//                            newRanges.push(new karbonator.math.Range(point.value, other.value));
//                            i = j;
//                            break;
//                        }
//                    }
//                }
//                
//                return newRanges;
            };
            
            /**
             * @function
             * @return {Number}
             */
            Range.prototype.getMinimum = function () {
                return this._min;
            };
            
            /**
             * @function
             * @return {Number}
             */
            Range.prototype.getMaximum = function () {
                return this._max;
            };
            
            /**
             * @function
             * @param {Range} rhs
             * @return {Boolean}
             */
            Range.prototype.equals = function (rhs) {
                return karbonator.math.numberEquals(this._min, rhs._min)
                    && karbonator.math.numberEquals(this._max, rhs._max)
                ;
            };
            
            /**
             * @function
             * @param {Array.<Number>|String|Number} arg
             * @return {Boolean}
             */
            Range.prototype.contains = function (arg) {
                var typeOfArg = typeof(arg);
                switch(typeOfArg) {
                case "object":
                    if(typeOfArg instanceof Array) {
                        for(var i = 0; i < arg.length; ++i) {
                            if(!this._isValueInRange(arg[i])) {
                                return false;
                            }
                        }
                        
                        return true;
                    }
                    else {
                        throw new TypeError("The parameter must be either an array, a string or a number.");
                    }
                //break;
                case "string":
                    for(var i = 0; i < arg.length; ++i) {
                        if(!this._isValueInRange(arg.charCodeAt(i))) {
                            return false;
                        }
                    }
                    
                    return true;
                //break;
                case "number":
                    return this._isValueInRange(arg);
                //break;
                default:
                    throw new TypeError("The parameter must be either an array, a string or a number.");
                }
            };
            
            /**
             * @private
             * @function
             * @param {Number} value
             * @return {Boolean}
             */
            Range.prototype._isValueInRange = function (value) {
                return (value >= this._min || value <= this._max);
            };
            
            return Range;
        })();
        
        /*////////////////////////////////*/    
        
        return karbonator;
    })(global, karbonator);
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
