/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-17
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.polyfill-es"], function () {
            return factory(g);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        require("./karbonator.polyfill-es");
        exports = module.exports = factory(g);
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global) {
    "use strict";
    
    /*////////////////////////////////////////////////////////////////*/
    //The snapshots of 'polyfilled' ECMAScript built-in objects
    //by 'karbonator.polyfill-es' module.
    
    var Object = global.Object;
    var Array = global.Array;
    var Date = global.Date;
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator namespace.
    
    var karbonator = (function (global) {
        /**
         * @global
         * @namespace
         */
        var karbonator = {};
        
        /*////////////////////////////////*/
        //Interface & Callback documentations.
        
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
        karbonator.shallowCopy = Symbol("karbonator.shallowCopy");
        
        /**
         * @memberof karbonator
         * @readonly
         * @readonly
         * @type {Symbol}
         */
        karbonator.deepCopy = Symbol("karbonator.shallowCopy");
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //global.Console polyfill.(usually for node.js)
        
        (function (console) {
            if(typeof(console) === "undefined") {
                return;
            }
            
            if(!console.clear && console.log) {
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
        //Namespace private constants and functions.
        
        /**
         * @function
         * @param {*} o
         * @return {Boolean}
         */
        var _isCallable = function (o) {
            return typeof(o) === "function"
                //|| (function () {try {o(); return true;} catch(e) {return false;}})()
            ;
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
            return (_isNotUndefined(value) ? value : defaultValue);
        };
        
        /**
         * @function
         * @param {Object} global
         * @return {String}
         */
        var _testEnvironmentType = function (global) {
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
                return _testEnvironmentType(this.global);
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
                    //It means that this environment doen't support 'Symbol'.
                    return 0;
                }
                
                var Object = this.global.Object;
                var score = 17;
                var symbolKey = "karbonator";
                
                /*////////////////////////////////*/
                //Construction test.
                
                var localSymbol1 = Symbol(symbolKey);
                if(typeof(localSymbol1) !== "undefined") {
                    --score;
                }
                
                if(typeof(Symbol.iterator) !== "undefined") {
                    --score;
                    
                    try {
                        Symbol(Symbol.iterator);
                    }
                    catch(e) {
                        --score;
                    }
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //Test if the polyfiiled Symbol prevents programmers instantiating symbol by using new operator.
                //This feature requires 'new.target' virtual property proposed in Es6.
                //I don't think that this can be implemented in Es3 environment...
                
                try {
                    new Symbol();
                }
                catch(e) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //Comparison test.
                
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
                    //if the polyfill uses Symbol.prototype.toString,
                    //the return value must be different to standard's one(e.g. Symbol(foo))
                    //and it must be some kind of unique string.
                    
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
                    //'undefined' symbol comparison test.
                    
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
                    
                    //'toString' should be used to create description.
                    if(
                        Symbol["for"]("true") === Symbol["for"](true)
                        && Symbol["for"]("false") === Symbol["for"](false)
                        && Symbol["for"]("0") === Symbol["for"](0)
                        && Symbol["for"]({}) === Symbol["for"](({}).toString())
                        && Symbol["for"](function () {}) === Symbol["for"]("function () {}")
                    ) {
                        --score;
                    }
                    
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
                //Prototype chain test.
                
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
                
                //Should allow objects to inherit Symbol.prototype using Object.create function.
                try {
                    var Inherited = function () {
                        Symbol.apply(this, arguments);
                    };
                    Inherited.prototype = Object.create(Symbol.prototype);
                    
                    var inheritedInstance = new Inherited();
                    if(inheritedInstance.constructor === Symbol) {
                        --score;
                        
                        try {
                            Symbol(new Inherited());
                        }
                        catch(ei) {
                            --score;
                        }
                    }
                }
                catch(eo) {}
                
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
                    
                    //scriptTag.src = scriptSrc;
                    //destTag.appendChild(scriptTag);
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
                 * @param {String} [id=""]
                 * @param {String} [relativePath=""]
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
                    //break;
                    case 1:
                        if(this.getModuleDescriptor(id) === null) {
                            var module = syncedLoad(this.createPath(arguments[0]));
                            //add_module;
                        }
                        
                        result = this.getModuleDescriptor(id).factory;
                    break;
                    case 2:
                    default:
                    {
                        if(!Array.isArray(arguments[0])) {
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
//                            if(idNotExists) {
//                                proxy.loadTargetPaths.push(this.createPath(id));
//                                proxy.modules.push(null);
//                            }
//                            else {
//                                proxy.modules.push(this.getModuleDescriptor(id).module);
//                            }
                        }
                        
                        //asyncedLoad(loadTargetPaths, onModulesLoaded, proxy);
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
                    
                    if(dependencies !== null && !Array.isArray(dependencies)) {
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
                    //break;
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
            toInt : function (v) {
                //TODO : polyfill-es 모듈에 있는 _toInteger와 코드 병합.
                var n = Number(v);
                if(global.isNaN(n)) {
                    return +0;
                }
                
                if(
                    n === 0
                    || n === Number.POSITIVE_INFINITY
                    || n === Number.NEGATIVE_INFINITY
                ) {
                    return n;
                }
                
                return Math.sign(n) * Math.floor(Math.abs(n));
            },
            
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
             * @function
             * @param {Number} v
             * @return {String}
             */
            var _intToString = function (v) {
                if(v === Number.MAX_SAFE_INTEGER) {
                    return "INT_MAX";
                }
                else if(v === Number.MIN_SAFE_INTEGER) {
                    return "INT_MIN";
                }
                else {
                    return v.toString();
                }
            };
            
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
             * @function
             * @param {Number} prefered
             * @param {Number} alternative
             * @return {Number}
             */
            var _selectInt = function (prefered, alternative) {
                return (
                    Number.isInteger(prefered)
                    ? prefered
                    : alternative
                );
            };
            
            /**
             * @function
             * @param {Number} prefered
             * @param {Number} alternative
             * @return {Number}
             */
            var _selectFloat = function (prefered, alternative) {
                return (
                    !Number.isNaN(prefered)
                    ? prefered
                    : alternative
                );
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
                            _selectInt(arguments[1], Number.MIN_SAFE_INTEGER),
                            min - 1
                        ));
                    }
                    else {
                        negatedIntervals.push(new Interval(
                            _selectFloat(arguments[1], -Number.MAX_VALUE),
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
                            _selectInt(arguments[2], Number.MAX_SAFE_INTEGER)
                        ));
                    }
                    else {
                        negatedIntervals.push(new Interval(
                            max + epsilon,
                            _selectFloat(arguments[2], Number.MAX_VALUE)
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
                        _selectInt(arguments[0], Number.MIN_SAFE_INTEGER),
                        this._min - 1
                    ));
                }
                else {
                    negatedIntervals.push(new Interval(
                        _selectFloat(arguments[0], -Number.MAX_VALUE),
                        this._min - karbonator.selectNonUndefined(arguments[2], karbonator.math.epsilon)
                    ));
                }
                
                if(Number.isInteger(this._max)) {
                    negatedIntervals.push(new Interval(
                        _selectInt(arguments[1], Number.MAX_SAFE_INTEGER),
                        this._max + 1
                    ));
                }
                else {
                    negatedIntervals.push(new Interval(
                        _selectFloat(arguments[1], Number.MAX_VALUE),
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
                    + _intToString(this._min)
                    + ", "
                    + _intToString(this._max)
                    + ']'
                ;
            };
            
            //math._insertIfNotExistAndSort = _insertIfNotExistAndSort;
            
            return Interval;
        })();
        
        /*////////////////////////////////*/
        
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
            var lhsLen = lhs.length, rhsLen = rhs.length;
            var minLen = (lhsLen < rhsLen ? lhsLen : rhsLen);
            var diff = 0;
            for(var i = 0; i < minLen; ++i) {
                diff = lhs.charAt(i).charCodeAt(0) - rhs.charAt(i).charCodeAt(0);
                if(diff !== 0) {
                    break;
                }
            }
            
            return diff;
        };
        
        ////////////////////////////////
        
        return karbonator;
    })(global, karbonator);
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
