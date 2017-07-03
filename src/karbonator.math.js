/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    "use strict";
    
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.core"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = factory(g, require("./karbonator.core"));
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global, karbonator) {
    /**
     * @memberof karbonator
     * @namespace
     */
    var math = karbonator.math || {};
    
    karbonator.math = math;
    
    math.Vector3 = (function () {
        /**
         * @memberof karbonator.math
         * @constructor
         */
        var Vector3 = function () {
            this._elements = [0, 0, 0];
            
            switch(arguments.length) {
            case 1:
                if(arguments[0] instanceof Vector3) {
                    this.assign(arguments[0]);
                }
            break;
            case Vector3.elementCount:
                for(var i = 0; i < Vector3.elementCount; ++i) {
                    if(typeof(arguments[0]) === "number") {
                        this.set(i, arguments[i]);
                    }
                }
            //break;
            }
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Number}
         */
        Vector3.prototype.get = function (index) {
            return this._elements[index];
        };
        
        /**
         * @function
         * @param {Number} index
         * @param {Number} value
         */
        Vector3.prototype.set = function (index, value) {
            this._elements[index] = value;
        };
        
        /**
         * @function
         * @param {Vector3} rhs
         * @return {Vector3}
         */
        Vector3.prototype.assign = function (rhs) {
            this._elements[0] = rhs._elements[0];
            this._elements[1] = rhs._elements[1];
            this._elements[2] = rhs._elements[2];
            
            return this;
        };
        
        /**
         * @function
         * @param {Vector3} rhs
         * @param {Number} epsilon
         * @return {Boolean}
         */
        Vector3.prototype.equals = function (rhs, epsilon) {
            for(var i = 0; i < Vector3.elementCount; ++i) {
                if(!karbonator.math.numberEquals(
                    this._elements[i],
                    rhs._elements[i],
                    epsilon
                )) {
                    return false;
                }
            };
            
            return true;
        };
        
        /**
         * @function
         * @param {Vector3} rhs
         * @return {Vector3}
         */
        Vector3.prototype.addAssign = function (rhs) {
            this._elements[0] += rhs._elements[0];
            this._elements[1] += rhs._elements[1];
            this._elements[2] += rhs._elements[2];
            
            return this;
        };
    
        /**
         * @function
         * @param {Vector3} rhs
         * @return {Vector3}
         */
        Vector3.prototype.subtractAssign = function (rhs) {
            this._elements[0] -= rhs._elements[0];
            this._elements[1] -= rhs._elements[1];
            this._elements[2] -= rhs._elements[2];
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} number
         * @return {Vector3}
         */
        Vector3.prototype.multiplyAssign = function (number) {
            this._elements[0] *= number;
            this._elements[1] *= number;
            this._elements[2] *= number;
            
            return this;
        };
        
        /**
         * @function
         * @param {Number} number
         * @param {Number} epsilon
         * @return {Vector3}
         */
        Vector3.prototype.divideAssign = function (number, epsilon) {
            if(karbonator.math.numberEquals(number, 0, epsilon)) {
                throw new Error("Division by zero.");
            }
            
            this._elements[0] /= number;
            this._elements[1] /= number;
            this._elements[2] /= number;
            
            return this;
        };
        
        /**
         * @readonly
         */
        Vector3.zero = new Vector3();
        
        /**
         * @readonly
         */
        Vector3.one = new Vector3(1, 1, 1);
        
        /**
         * @readonly
         */
        Vector3.elementCount = 3;
        
        return Vector3;
    })();
    
    return karbonator;
})
));
