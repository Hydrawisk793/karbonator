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
        define(["./karbonator.collection"], function (collection) {
            return moduleFactory(g, collection);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = moduleFactory(g, require("./karbonator.collection"));
    }
}(
(function (global, karbonator) {
    "use strict";
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var ListMap = karbonator.collection.ListMap;
    
    string.Token = (function () {
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var Token = function (name, definition) {
            this._name = name;
            this._definition = definition;
        };
        
        /**
         * @function
         * @return {String}
         */
        Token.prototype.getName = function () {
            return this._name;
        };
        
        /**
         * @function
         * @return {String}
         */
        Token.prototype.getDefinition = function () {
            return this._definition;
        };
        
        /**
         * @function
         * @param {Token} rhs
         * @return {Boolean}
         */
        Token.prototype.equals = function (rhs) {
            return this._name === rhs._name
                && this._definition === rhs._definition
            ;
        };
        
        return Token;
    }());
    
    var tokenEqualComparator = function (lhs, rhs) {
        return lhs.equals(rhs);
    };
    
    string.Scanner = (function () {
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var Scanner = function () {
            this._edgeMap = {};
            this._states = [];
        };
        
        /**
         * @function
         * @param {String} str
         */
        Scanner.prototype.initialize = function (str) {
            
        };
        
        /**
         * @function
         * @return {Object}
         */
        Scanner.prototype.scanNextToken = function () {
            
        };
        
        /**
         * @function
         */
        Scanner.prototype.rewind = function () {
            
        };
        
        return Scanner;
    }());
    
    string.ScannerGenerator = (function () {
        var Token = string.Token;
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var ScannerGenerator = function () {
            this._tokenMap = new ListMap(tokenEqualComparator);
            
            this._edgeMap = {};
            this._stateMap = {};
        };
        
        /**
         * @function
         * @return {Number}
         */
        ScannerGenerator.prototype.getTokenCount = function () {
            return this._tokenMap.getElementCount();
        };
        
        /**
         * @function
         * @param {String} name
         * @param {String} regExStr
         */
        ScannerGenerator.prototype.setToken = function (name, regExStr) {
            this._tokenMap.set(name, new Token(name, regExStr));
        };
        
        /**
         * @function
         * @param {String} name
         */
        ScannerGenerator.prototype.removeToken = function (name) {
            this._tokenMap.remove(name);
        };
        
        /**
         * @function
         * @param {ScannerGenerator} o
         * @param {String} regExStr
         * @return {Object}
         */
        var createNfa = function (o, regExStr) {
            
        };
        
        /**
         * @function
         * @return {Object}
         */
        ScannerGenerator.prototype.generateScanner = function () {
            //TODO : 함수 작성
            //1. 각 토큰에 대한 NFA 생성
            //1-1. RegEx 분석 및 NFA 생성
            //1-2. 오류 발생 시 내용을 기록하고 종료
            //2. 별도의 시작 상태를 만들고 각 NFA의 시작 상태를 새로운 시작상태에 오메가로 연결
            //3. NFA -> DFA
            //4. 상태 최적화
        };
        
        return ScannerGenerator;
    }());
    
    return karbonator;
})
));
