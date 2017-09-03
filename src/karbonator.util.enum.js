/**
 * author : Hydrawisk793
 * e-mail : hyw793&#x40;naver.com
 * blog : http://blog.naver.com/hyw793
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
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
    
    /*////////////////////////////////////////////////////////////////*/
    //karbonator.util.Enum
    
    var _pSymMemberIndex = Symbol("karbonator.util.Enum.prototype.index");
    var _pSymMemberKey = Symbol("karbonator.util.Enum.prototype.key");
    var _pSymStaticKeys = Symbol("karbonator.util.Enum.keys");
    
    /**
     * @memberof karbonator
     * @constructor
     */
    var Enum = function () {
        throw new Error(
            "'karbonator.util.Enum' cannot be directly instantiated."
            + " use 'karbonator.util.Enum.create' static method"
            + " to create a subtype of 'karbonator.util.Enum'."
        );
    };

    /**
     * @memberof karbonator.util.Enum
     * @readonly
     * @type {Symbol}
     */
    Enum.getIndex = Symbol("karbonator.util.Enum.getIndex");

    /**
     * @memberof karbonator.util.Enum
     * @readonly
     * @type {Symbol}
     */
    Enum.getKey = Symbol("karbonator.util.Enum.getKey");

    /**
     * @memberof karbonator.util.Enum
     * @readonly
     * @type {Symbol}
     */
    Enum.getValue = Symbol("karbonator.util.Enum.getValue");

    /**
     * @function
     * @return {Number}
     */
    Enum.prototype[Enum.getIndex] = function () {
        return this[_pSymMemberIndex];
    };

    /**
     * @function
     * @return {String|Symbol}
     */
    Enum.prototype[Enum.getKey] = function () {
        return this[_pSymMemberKey];
    };

    /**
     *  var ColorEnum = karbonator.util.Enum.create(
     *      function (proto) {
     *          proto.getNumber = function () {
     *              return this._num;
     *          };
     *          proto.getAlpha = function () {
     *              return this._alpha;
     *          };
     *      },
     *      function (num, alpha) {
     *          this._num = num;
     *          this._alpha = alpha;
     *      },
     *      [["red", [0, 0.125]], ["green", [1, 0.125]], ["blue", [2, 0.125]], [Symbol("violet"), [123, 0.5]]]
     *  );
     *
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} protoHandler
     * @param {Function} ctor
     * @param {iterable} pairs
     * @return {karbonator.util.Enum}
     */
    Enum.create = function (protoHandler, ctor, pairs) {
        if(!karbonator.isFunction(protoHandler)) {
            throw new TypeError("The parameter 'protoHandler' must be a function.");
        }

        if(!karbonator.isFunction(ctor)) {
            throw new TypeError("The parameter 'ctor' must be a function.");
        }

        if(!karbonator.isEsIterable(pairs)) {
            throw new TypeError(
                "The parameter "
                + "'pairs'"
                + " must have a property "
                + "'Symbol.iterator'."
            );
        }

        var EnumType = ctor;
        var proto = detail._objectCreate(Enum.prototype);
        protoHandler(proto, ctor);
        EnumType.prototype = proto;

        var keys = [];
        for(
            var i = pairs[Symbol.iterator](), iP = i.next(), ndx = 0;
            !iP.done;
            iP = i.next(), ++ndx
        ) {
            var key = iP.value[0];
            if(!karbonator.isString(key) && !karbonator.isSymbol(key)) {
                throw new TypeError("Keys of enum members must be strings or symbols.");
            }
            if(EnumType.hasOwnProperty(key)) {
                throw new Error(
                    "The key '"
                    + key
                    + "' already exists."
                );
            }
            keys.push(key);

            EnumType[key] = Reflect.construct(EnumType, iP.value[1]);
            EnumType[key][_pSymMemberIndex] = ndx;
            EnumType[key][_pSymMemberKey] = key;
        }
        EnumType[_pSymStaticKeys] = keys;

        EnumType[Symbol.iterator] = function () {
            return ({
                _keys : EnumType[_pSymStaticKeys],

                _index : 0,

                next : function () {
                    var result = {
                        done : this._index >= this._keys.length
                    };

                    if(!result.done) {
                        var key = this._keys[this._index];
                        result.value = [
                            this._keys[this._index],
                            EnumType[key]
                        ];

                        ++this._index;
                    }

                    return result;
                }
            });
        };

        return EnumType;
    };
    
    /**
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} enumType
     * @returns {Array.<String|Symbol>}
     */
    Enum.getKeys = function (enumType) {
        Enum._assertIsEnumType(enumType);

        return enumType[_pSymStaticKeys].slice();
    };

    /**
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} enumType
     * @param {Number} index
     * @return {String|Symbol}
     */
    Enum.getKeyAt = function (enumType, index) {
        Enum._assertIsEnumType(enumType);

        return enumType[_pSymStaticKeys][index];
    };

    /**
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} enumType
     * @param {Number} index
     * @return {*}
     */
    Enum.getValueAt = function (enumType, index) {
        Enum._assertIsEnumType(enumType);

        return Enum.findByKey(enumType, Enum.getKeyAt(enumType, index));
    };

    /**
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} enumType
     * @return {Number}
     */
    Enum.getCount = function (enumType) {
        Enum._assertIsEnumType(enumType);

        return enumType[_pSymStaticKeys].length;
    };

    /**
     * @memberof karbonator.util.Enum
     * @function
     * @param {Function} enumType
     * @param {String|Symbol} key
     * @return {karbonator.util.Enum}
     */
    Enum.findByKey = function (enumType, key) {
        Enum._assertIsEnumType(enumType);

        if(!enumType.hasOwnProperty(key)) {
            throw new Error(
                "The enum member '"
                + key
                + "' doesn't exist."
            );
        }

        return enumType[key];
    };
    
    /**
     * @memberof karbonator.util.Enum
     * @private
     * @param {Object} enumType
     * @returns {Object}
     */
    Enum._assertIsEnumType = function (enumType) {
        if(!karbonator.isFunction(enumType)) {
            throw new TypeError(
                "The paramter 'enumType'"
                + " must be a derived type of "
                + "'karbonator.util.Enum'."
            );
        }
        
        return enumType;
    };
    
    util.Enum = Enum;
    
    /*////////////////////////////////////////////////////////////////*/
        
    return karbonator;
})
));
