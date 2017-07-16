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
        g.define(["./karbonator.string"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.string")
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
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var nes = karbonator.nes || {};
    karbonator.nes = nes;
    
    /*////////////////////////////////*/
    //Disassembler
    
    /**
     * @memberof karbonator.nes
     * @constructor
     */
    var Disassembler = function () {
        
    };
    
    /**
     * @function
     * @param {karbonator.ByteArray} bytes
     * @param {Number} [startIndex=0]
     * @returns {undefined}
     */
    Disassembler.prototype.disassemble = function (bytes) {
        if(!(bytes instanceof karbonator.ByteArray)) {
            throw new TypeError("'bytes' must be an instance of 'karbonator.ByteArray'.");
        }
        
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new TypeError("'startIndex' must be a non-negative safe integer.");
        }
        
        //TODO : Write some codes...
    };
    
    /*////////////////////////////////*/
    
    /**
     * @memberof karbonator.nes
     * @constructor
     */
    var Assembler = function () {
        var lg = new karbonator.string.LexerGenerator();
        lg.defineToken("nz_digit", "[1-9]", true);
        lg.defineToken("digit", "[0-9]", true);
        lg.defintToken("blank", "[ \t]");
        lg.defintToken("id", "[a-zA-Z_$][a-zA-Z_$0-9]*");
        lg.defineToken("lit-string", "\".*?\"");
        lg.defineToken("global_label", "{id}:");
        lg.defineToken("local_label", "\\.{global_label}");
        lg.defineToken("local_rel_label", "\\.(\\+|\\-)?[1-9][0-9]*");
        lg.defineToken("imm_base2_int", "#%[0-1]{1,8}");
        lg.defineToken("imm_base16_int", "#([a-zA-Z0-9]{2})+");
        lg.defineToken("ows", "\\s*");
        lg.defineToken("ws", "\\s+");
        
        this._lexer = lg.generate();
    };
    
    karbonator.Disassembler = Disassembler;
    
    karbonator.Assembler = Assembler;
    
    return karbonator;
})
));
