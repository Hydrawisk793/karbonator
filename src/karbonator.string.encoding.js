/**
 * author : Hydrawisk793
 * e-mail : hyw793&#x40;naver.com
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
    global;
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    /*////////////////////////////////////////////////////////////////*/
    //Namespace functions
    
    var byteCountBorders = [
        0x80, 0x0800,
        0x010000, 0x200000,
        0x04000000, 0x80000000
    ];
    var borderCount = byteCountBorders.length;
    var firstByteMasks = [
        0x0000007F, 0x000007C0,
        0x0000F000, 0x001C0000,
        0x03000000, 0x40000000
    ];
    var firstByteMasks = [
        0x0000007F, 0x000007C0,
        0x0000F000, 0x001C0000,
        0x03000000, 0x40000000
    ];
    var shiftCounts = [
        0, 6, 
        12, 18,
        24, 30
    ];
    var restByteBitMasks = [
        0x00000000, 0x0000003F,
        0x00000FC0, 0x0003F000,
        0x00FC0000, 0x3F000000
    ];
    var byteCountBits = [
        0x00, 0xC0,
        0xE0, 0xF0,
        0xF8, 0xFC
    ];
    
    /**
     * Converts a string to utf8 byte array.
     * 
     * @memberof karbonator.string
     * @function
     * @param {String} str A string to be converted.
     * @return {karbonator.ByteArray}
     */
    string.toUtf8ByteArray = function (str) {
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }
        
        var byteArray = new ByteArray();
        
        var i = str.length, j = 0;
        var restByteCount;
        var ch;
        var byteValue = 0;
        while(i > 0) {
            --i;

            ch = str.charCodeAt(j);
            ++j;

            for(
                restByteCount = 0;
                restByteCount < borderCount;
                ++restByteCount
            ) {
                if(ch < byteCountBorders[restByteCount]) {
                    break;
                }
            }
            if(restByteCount >= borderCount) {
                throw new Error("");
            }
            
            byteValue = (((ch & firstByteMasks[restByteCount]) >>> shiftCounts[restByteCount]) | byteCountBits[restByteCount]) & 0xFF;
            byteArray.pushBack(byteValue);
            
            while(restByteCount > 0) {
                byteValue = (((ch & restByteBitMasks[restByteCount]) >>> shiftCounts[restByteCount - 1]) | 0x80) & 0xFF;
                byteArray.pushBack(byteValue);
                
                --restByteCount;
            }
        }
        
        return byteArray;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
