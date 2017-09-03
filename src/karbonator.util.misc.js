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
    "use strict";
    
    global;
    
    var detail = karbonator.detail;
    
    var Symbol = karbonator.getEsSymbol();
    var Reflect = karbonator.getEsReflect();
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var util = {};
    karbonator.util = util;
    
    /**
     * @memberof karbonator.util
     * @function
     * @param {Function} symbolKlass
     * @return {Number} 1 for complete support, otherwise partial support.
     */
    util.testEsSymbol = function (symbolKlass) {
        if(!karbonator.isFunction(symbolKlass)) {
            throw new TypeError("'symbolKlass' must be a constructor.");
        }
        
        var Object = global.Object;
        var score = 17;
        var symbolKey = "karbonator";
        
        /*////////////////////////////////*/
        //Construction test.
        
        var localSymbol1 = symbolKlass(symbolKey);
        if(!karbonator.isUndefined(localSymbol1)) {
            --score;
        }
        
        if(!karbonator.isUndefined(symbolKlass.iterator)) {
            --score;
            
            try {
                symbolKlass(symbolKlass.iterator);
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
            new symbolKlass();
        }
        catch(e) {
            --score;
        }
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Comparison test.
        
        var localSymbol2 = symbolKlass(symbolKey);
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
        
        var symbolForFunc = symbolKlass["for"];
        if(!karbonator.isUndefined(symbolForFunc)) {
            /*////////////////////////////////*/
            //global 심볼과 local 심볼 비교 테스트 1.
            
            var registeredFoo = symbolForFunc(symbolKey);
            if(
                (registeredFoo !== localSymbol1 && registeredFoo !== localSymbol2)
                && (symbolForFunc(symbolKey) === symbolForFunc(symbolKey))
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
                propTestObj[localSymbol1] !== propTestObj[symbolForFunc(symbolKey)]
                && propTestObj[localSymbol1] !== propTestObj[localSymbol2]
            ) {
                --score;
            }
            
            /*////////////////////////////////*/
            
            /*////////////////////////////////*/
            //'undefined' symbol comparison test.
            
            if(
                symbolForFunc() === symbolForFunc("undefined")
                && symbolForFunc() === symbolForFunc(undefined)
                && symbolForFunc() !== symbolKlass()
                && symbolForFunc().toString().endsWith("Symbol(undefined)")
                && symbolForFunc(undefined).toString().endsWith("Symbol(undefined)")
                && symbolForFunc("").toString().endsWith("Symbol()")
                && symbolForFunc("undefined").toString().endsWith("Symbol(undefined)")
                && symbolKlass().toString().endsWith("Symbol()")
                && symbolKlass(undefined).toString().endsWith("Symbol()")
                && symbolKlass("").toString().endsWith("Symbol()")
                && symbolKlass("undefined").toString().endsWith("Symbol(undefined)")
            ) {
                --score;
            }
            
            /*////////////////////////////////*/
            
            //'toString' should be used to create description.
            if(
                symbolForFunc("true") === symbolForFunc(true)
                && symbolForFunc("false") === symbolForFunc(false)
                && symbolForFunc("0") === symbolForFunc(0)
                && symbolForFunc({}) === symbolForFunc(({}).toString())
                && symbolForFunc(function () {}) === symbolForFunc("function () {}")
            ) {
                --score;
            }
            
            if(typeof(symbolKlass.keyFor) !== "undefined") {
                /*////////////////////////////////*/
                //Symbol.keyFor 지원여부 테스트
                
                if(
                    symbolKlass.keyFor(symbolForFunc(symbolKey)) === symbolKey
                    && typeof(symbolKlass.keyFor(symbolKlass())) === "undefined"
                ) {
                    --score;
                }
                
                /*////////////////////////////////*/
                
                /*////////////////////////////////*/
                //well-known 심볼, local 심볼, global 심볼 비교 테스트
                
                //Symbol.iterator만 확인...
                //나머지도 잘 되길 바라야지...
                if(
                    typeof(symbolKlass.iterator) !== "undefined"
                    && symbolKlass.keyFor(symbolKlass.iterator) !== symbolKlass("iterator")
                    && symbolKlass.keyFor(symbolKlass.iterator) !== symbolForFunc("iterator") //레지스트리에 심볼 최초 생성
                    && symbolKlass.keyFor(symbolKlass.iterator) !== symbolForFunc("iterator") //생성된 심볼과 비교
                ) {
                    --score;
                }
                
                /*////////////////////////////////*/
            }
        }
        
        /*////////////////////////////////*/
        //Prototype chain test.
        
        (function () {
            if(localSymbol1.constructor !== symbolKlass) {
                return;
            }
            
            //브라우저에 따라 테스트가 안 되는 경우(주로 IE < 9)는 다음 테스트를 패스.
            try {
                if(
                    (
                        !karbonator.isUndefined(Object.getPrototypeOf)
                        && Object.getPrototypeOf(localSymbol1) !== symbolKlass.prototype
                    )
                    || (
                        Object.prototype.hasOwnProperty("__proto__")
                        && localSymbol1.__proto__ !== symbolKlass.prototype
                    )
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
                symbolKlass.apply(this, arguments);
            };
            Inherited.prototype = detail._objectCreate(symbolKlass.prototype);
            
            var inheritedInstance = new Inherited();
            if(inheritedInstance.constructor === symbolKlass) {
                --score;
                
                try {
                    symbolKlass(new Inherited());
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
            !(localSymbol1 instanceof symbolKlass)
            && !(localSymbol1 instanceof Object)
            && typeof(localSymbol1) === "symbol"
        ) {
            --score;
        }
        
        /*////////////////////////////////*/
        
        return score;
    };
    
    /**
     * @memberof karbonator.util
     * @function
     * @param {Number} milliseconds
     */
    util.wait = function (milliseconds) {
        for(
            var start = Date.now();
            Date.now() - start < milliseconds;
        );
    };
    
    /**
     * @memberof karbonator.util
     * @function
     * @param {Object|Function} dest
     * @param {iterable} pairs
     * @return {Object|Function}
     */
    util.appendAsMember = function (dest, pairs) {
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
     * @memberof karbonator.util
     * @function
     * @param {Object|Function} dest
     * @param {Function} ctor
     * @param {iterable} pairs
     * @return {Object|Function}
     */
    util.createAndAppendAsMember = function (dest, ctor, pairs) {
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
    
    return karbonator;
})
));
