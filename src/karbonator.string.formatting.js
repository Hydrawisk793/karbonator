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
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.core")
        );
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
    
    //var detail = karbonator.detail;
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    /**
     * 
     * 
     * @memberof karbonator.string
     * @function
     * @param {String} str
     * @param {String} ch
     * @param {Number} len
     */
    string.padLeft = function (str, ch, len) {
        if(!karbonator.isString(str)) {
            throw new TypeError("");
        }
        if(!karbonator.isString(ch)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(len)) {
            throw new Error("");
        }
        
        if(len > str.length) {
            var padLen = len - str.length;
            var prefix = "";
            for(var i = padLen; i > 0; ) {
                --i;
                prefix += ch;
            }
            
            str = prefix + str;
        }
        
        return str;
    };
    
    return karbonator;
})
));
