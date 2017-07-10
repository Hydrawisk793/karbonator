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
        g.define(["./karbonator.collection"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.collection")
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
    
    var detail = karbonator.detail;
    var collection = karbonator.collection;
    var assertion = karbonator.assertion;
    
    var Array = global.Array;
    var Symbol = detail._selectSymbol();
    
    var TreeSet = collection.TreeSet;
    var TreeMap = collection.TreeMap;
    var ListMap = collection.ListMap;
    var ListSet = collection.ListSet;
    
    var ByteArray = karbonator.ByteArray;
    var Interval = karbonator.math.Interval;
    var Set = collection.ListSet;
    var Map = collection.ListMap;
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var _minInt = Number.MIN_SAFE_INTEGER;
    
    var _maxInt = Number.MAX_SAFE_INTEGER;
    
    var _charCodeMin = 0x000000;
    
    var _charCodeMax = 0x10FFFF;
    
    /**
     * @readonly
     * @param {karbonator.math.Interval} l
     * @param {karbonator.math.Interval} r
     */
    var _edgeComparator = function (l, r) {
        return l[karbonator.compareTo](r);
    };
    
    /**
     * @function
     * @param {Number} chCode
     * @return {Interval}
     */
    var _createIntervalFromCharCode = function (chCode) {
        return new Interval(chCode, chCode);
    };
    
    /**
     * @readonly
     * @enum {Interval}
     */
    var _constInterval = {
        epsilon : new Interval(
            karbonator.minimumSafeInteger,
            karbonator.maximumSafeInteger
        ),
        anyCharacters : new Interval(_charCodeMin, _charCodeMax),
        whiteSpaces : new Interval(0x09, 0x0D),
        posixLower : new Interval(0x61, 0x7A),
        posixUpper : new Interval(0x41, 0x5A),
        posixDigit : new Interval(0x30, 0x39),
        posixGraph : new Interval(0x21, 0x7E),
        horizontalTab : _createIntervalFromCharCode(0x09),
        carrigeReturn : _createIntervalFromCharCode(0x0A),
        lineFeed : _createIntervalFromCharCode(0x0B),
        verticalTab : _createIntervalFromCharCode(0x0C),
        formFeed : _createIntervalFromCharCode(0x0D),
        space : _createIntervalFromCharCode(0x20),
        underscore : _createIntervalFromCharCode(0x5F),
        del : _createIntervalFromCharCode(0x7F)
    };
    
    /**
     * @readonly
     * @enum {Array.<Interval>}
     */
    var _constIntervalSet = (function () {
        var _posixSpace = [
            _constInterval.space,
            _constInterval.whiteSpaces
        ];
        var _posixAlpha = [
            _constInterval.posixLower,
            _constInterval.posixUpper
        ];
        var _posixAlnum = _posixAlpha.slice();
        _posixAlnum.push(_constInterval.posixDigit);
        var _word = _posixAlnum.slice();
        _word.push(_constInterval.underscore);
        
        return {
            posixPrint : [
                _constInterval.space,
                _constInterval.posixGraph
            ],
            posixAlnum : _posixAlnum,
            posixAlpha : _posixAlpha,
            posixBlank : [
                _constInterval.space,
                _constInterval.horizontalTab
            ],
            posixSpace : _posixSpace,
            posixXdigit : [
                new Interval(0x41, 0x46),
                new Interval(0x61, 0x66),
                _constInterval.posixDigit
            ],
            posixCntrl : [
                new Interval(0x00, 0x1F),
                _constInterval.del
            ],
            nonWhiteSpaces : Interval.negate(_posixSpace),
            word : _word,
            nonWord : Interval.negate(_word)
        };
    }());
    
    /**
     * @function
     * @param {Number} v
     */
    var _assertIsNonNegativeSafeInteger = function (v) {
        if(!karbonator.isNonNegativeSafeInteger(v)) {
            throw new Error("The parameter must not be less than zero.");
        }
    };
    
    /**
     * @function
     * @param {*} o
     * @param {String} [argName]
     */
    var _assertIsString = function (o) {
        if(!karbonator.isString(o)) {
            throw new TypeError(
                "The parameter "
                + (detail._selectNonUndefined(arguments[1], ""))
                + " must be a string."
            );
        }
    };
    
    /*////////////////////////////////*/
    //ScannerResult
    
    /**
     * @constructor
     */
    var ScannerResult = function () {
        this.error = {
            code : 0,
            message : ""
        };
        this.position = 0;
        this.value = "";
    };
    
    /**
     * @function
     * @param {Number} errorCode
     * @param {String} errorMessage
     * @param {Number} position
     * @param {Object} value
     */
    ScannerResult.prototype.set = function (
        errorCode, errorMessage,
        position, value
    ) {
        this.error.code = errorCode;
        this.error.message = errorMessage;
        this.position = position;
        this.value = value;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RegexVm
    
    /**
     * @constructor
     */
    var RegexVm = function () {
        this._inStr = "";
        this._bytecode = null;
        
        this._acceptedTokenKey = -1;
        this._acceptedText = "";
        this._thIdSeq = 0;
        this._ctxts = [];
        this._suspendedCtxts = [];
        this._thIdMap = new TreeMap(karbonator.numberComparator);
        this._forkMap =  new TreeMap(karbonator.numberComparator);
    };
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     * @param {RegexVm._Frame|Number} arg0
     */
    RegexVm._Frame = function (arg0) {
        if(arg0 instanceof RegexVm._Frame) {
            this._returnAddress = arg0._returnAddress;
            this._repStack = arg0._repStack.slice();
        }
        else if(karbonator.isNonNegativeSafeInteger(arg0)) {
            this._returnAddress = arg0;
            this._repStack = [];
        }
        else {
            throw new TypeError("An invalid argument.");
        }
    };
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     * @param {RegexVm} vm
     * @param {Number} id
     * @param {Number} pc
     * @param {Number} cursor
     * @param {RegexVm._Thread} [parent]
     * @param {Number} [forkKey]
     */
    RegexVm._Thread = function (vm, id, pc, cursor) {
        this._vm = vm;
        this._id = id;
        this._pc = pc;
        this._cursor = cursor;
        this._zFlag = true;
        this._child = null;
        if(!karbonator.isUndefinedOrNull(arguments[4])) {
            this._parent = arguments[4];
            this._parent._child = this;
            this._consumePtr = this._parent._consumePtr;
            this._consumeRanges = this._parent._consumeRanges.slice();
            this._frameStack = new Array(this._parent._frameStack.length);
            for(var i = 0; i < this._frameStack.length; ++i) {
                this._frameStack[i] = new RegexVm._Frame(
                    this._parent._frameStack[i]
                );
            }
            
            this._forkLevel = this._parent._forkLevel + 1;
        }
        else {
            this._parent = null;
            this._consumePtr = 0;
            this._consumeRanges = [this._cursor];
            this._frameStack = [new RegexVm._Frame(0)];
            
            this._forkLevel = 0;
        }
        this._matchResult = null;
        
        if(null !== this._parent) {
            this._forkScores = this._parent._forkScores[karbonator.shallowClone]();
        }
        else {
            this._forkScores = new TreeMap(karbonator.numberComparator);
        }
        if(!karbonator.isUndefinedOrNull(arguments[5])) {
            var forkKey = arguments[5];
            var parentScore = this._parent._forkScores.get(forkKey, 0);
            
            this._forkScores.set(forkKey, parentScore);
            this._parent._forkScores.set(forkKey, parentScore + 1);
        }
    };
    
    /**
     * @memberof RegexVm._Thread
     * @readonly
     */
    RegexVm._Thread._skipDelimiter = 0;
    
    /**
     * @function
     * @return {RegexVm.MatchResult}
     */
    RegexVm._Thread.prototype.getMatchResult = function () {
        return this._matchResult;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.getLevel = function () {
        var level = 0;
        for(
            var current = this._parent;
            null !== current;
            current = current._parent, ++ level
        );
        
        return level;
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} other
     * @return {Boolean}
     */
    RegexVm._Thread.prototype.isDescendantOf = function (other) {
        var result = false;
        for(
            var current = this._parent;
            null !== current;
            current = current._parent
        ) {
            if(current === other) {
                result = true;
                break;
            }
        }
        
        return result;
    };
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     */
    RegexVm._IntegerType = karbonator.Enum.create(
        /**
         * @param {Object} proto
         */
        function (proto) {
            proto.getByteCount = function () {
                return this._byteCount;
            };
            
            proto.bytesToValue = function (bytes) {
                return karbonator.bytesToInteger(
                    bytes,
                    this._byteCount, this._signed,
                    arguments[1],
                    arguments[2]
                );
            };
            
            proto.valueToBytes = function (v) {
                return karbonator.integerToBytes(
                    v, this._byteCount,
                    arguments[1],
                    arguments[2], arguments[3]
                );
            };
        },
        function (byteCount, signed) {
            this._byteCount = byteCount;
            this._signed = signed;
        },
        [
            ["uint8", [1, false]],
            ["int16", [2, true]],
            ["uint16", [2, false]],
            ["int32", [4, true]],
            ["uint32", [4, false]]
        ]
    );
    
    /**
     * @memberof RegexVm
     * @constructor
     */
    RegexVm.OperandType = karbonator.Enum.create(
        /**
         * @param {Object} proto
         */
        function (proto) {
            proto.getByteCount = function () {
                return this._typeMeta.getByteCount();
            };
            
            proto.valueToBytes = function (v) {
                return this._typeMeta.valueToBytes(
                    v,
                    arguments[1],
                    arguments[2], arguments[3]
                );
            };
            
            proto.toString = function () {
                var str = '{';
                
                str += "name";
                str += " : ";
                str += this[karbonator.Enum.getKey]();
                
                str += '}';
                
                return str;
            };
        },
        function (typeMeta) {
            this._typeMeta = typeMeta;
        },
        [
            ["offset", [RegexVm._IntegerType.int16]],
            ["address", [RegexVm._IntegerType.uint32]],
            ["byteIndex", [RegexVm._IntegerType.uint8]],
            ["index", [RegexVm._IntegerType.uint32]],
            ["characterCode", [RegexVm._IntegerType.uint32]],
            ["integerLiteral", [RegexVm._IntegerType.uint32]]
        ]
    );
    
    /**
     * @memberof RegexVm
     * @constructor
     */
    RegexVm.Instruction = karbonator.Enum.create(
        /**
         * @param {Object} proto
         */
        function (proto) {
            /**
             * @function
             * @return {Number}
             */
            proto.getOpCode = function () {
                return this._opCode;
            };
            
            /**
             * @function
             * @return {Number}
             */
            proto.getOperandCount = function () {
                return this._operandTypes.length;
            };
            
            /**
             * @function
             * @param {Number} index
             * @return {RegexVm.OperandType}
             */
            proto.getOperandTypeAt = function (index) {
                if(
                    !karbonator.isNonNegativeSafeInteger(index)
                    || index >= this._operandTypes.length
                ) {
                    throw new RangeError("Index out of range.");
                }

                return this._operandTypes[index];
            };
            
            /**
             * @function
             * @param {Number} index
             * @return {Number}
             */
            proto.getOperandSizeAt = function (index) {
                return this.getOperandTypeAt(index).getByteCount();
            };
            
            /**
             * @function
             * @return {Number}
             */
            proto.getSize = function () {
                return 1 + this._operandTypes.reduce(
                    function (acc, current) {
                        return acc + current.getByteCount();
                    },
                    0
                );
            };
            
            /**
             * @function
             * @return {String}
             */
            proto.getMnemonic = function () {
                return this._mnemonic;
            };
            
            /**
             * @function
             * @return {String}
             */
            proto.toString = function () {
                var str = '{';
                
                str += "opCode";
                str += " : ";
                str += this._opCode.toString(16);
                
                str += ", ";
                str += "operandTypes";
                str += " : ";
                str += '[' + this._operandTypes + ']';
                
                str += ", ";
                str += "mnemonic";
                str += " : ";
                str += '\"' + this._mnemonic + '\"';
                
                str += '}';
                
                return str;
            };
        },
        function (mnemonic, opCode, operandTypes) {
            if(!karbonator.isString(mnemonic)) {
                throw new TypeError("The parameter 'mnemonic' must be a string.");
            }
            if(!karbonator.isNonNegativeSafeInteger(opCode)) {
                throw new TypeError("The parameter 'opCode' must be a non-negative integer.");
            }
            if(null !== operandTypes && !karbonator.isArray(operandTypes)) {
                throw new TypeError("The parameter 'operandTypes' must be an array of type meta objects.");
            }
            
            this._opCode = opCode;
            this._operandTypes = (null === operandTypes ? [] : operandTypes);
            this._mnemonic = mnemonic;
        },
        Array.from(
            [

                [
                    "bra",
                    0x00,
                    [RegexVm.OperandType.offset]
                ],
                [
                    "bsr",
                    0x01,
                    [RegexVm.OperandType.offset]
                ],
                [
                    "bne",
                    0x02,
                    [RegexVm.OperandType.offset]
                ],
                [
                    "beq",
                    0x03,
                    [RegexVm.OperandType.offset]
                ],
                [
                    "jmp",
                    0x04,
                    [RegexVm.OperandType.address]
                ],
                [
                    "jsr",
                    0x05,
                    [RegexVm.OperandType.address]
                ],
                [
                    "rts",
                    0x06,
                    null
                ],
                [
                    "accept",
                    0x07,
                    [RegexVm.OperandType.integerLiteral]
                ],
                [
                    "fork",
                    0x08,
                    [
                        RegexVm.OperandType.offset,
                        RegexVm.OperandType.offset
                    ]
                ],
                [
                    "pfork",
                    0x09,
                    [
                        RegexVm.OperandType.offset,
                        RegexVm.OperandType.offset
                    ]
                ],
                [
                    "clear.z",
                    0x0A,
                    null
                ],
                [
                    "set.z",
                    0x0B,
                    null
                ],
                [
                    "skip",
                    0x0C,
                    null
                ],
                [
                    "consume",
                    0x0D,
                    null
                ],
                [
                    "test.code",
                    0x0E,
                    [RegexVm.OperandType.characterCode]
                ],
                [
                    "test.range",
                    0x0F,
                    [RegexVm.OperandType.index]
                ]
            ],
            function (current) {
                return ([
                    current[0].replace(
                        /(\.[A-Za-z0-9]+)/g,
                        function (text) {
                            return text[1].toUpperCase() + text.substring(2);
                        }
                    ),
                    current
                ]);
            }
        )
    );
    
    /**
     * @memberof RegexVm
     * @private
     * @readonly
     */
    RegexVm._opCodeInstMap = new TreeMap(
        karbonator.numberComparator,
        Array.from(
            RegexVm.Instruction,
            /**
             * @param {Array} enumPair
             * @returns {Array}
             */
            function (enumPair) {
                var inst = enumPair[1];
                return [inst.getOpCode(), inst];
            }
        )
    );
    
    /**
     * @memberof RegexVm
     * @function
     * @param {Number} opCode
     * @return {RegexVm.Instruction}
     */
    RegexVm.findInstructionByOpCode = function (opCode) {
        if(!karbonator.isNonNegativeSafeInteger(opCode)) {
            throw new TypeError("'opCode' must be a non-negative safe integer.");
        }
        
        var inst = RegexVm._opCodeInstMap.get(opCode);
        if(karbonator.isUndefined(inst)) {
            throw new Error("The opcode '" + opCode.toString(16) + "' doesn't exist.");
        }
        
        return inst;
    };
    
    /**
     * @memberof RegexVm
     * @constructor
     * @param {iterable} intervals
     * @param {Boolean} littleEndian
     * @param {karbonator.ByteArray} codeBlock
     * @param {karbonator.collection.ListSet} pforkKeys
     * @param {String} [sourceCodeForDebug]
     */
    RegexVm.Bytecode = function (intervals, littleEndian, codeBlock, pforkKeys) {
        if(!karbonator.isEsIterable(intervals)) {
            throw new TypeError("The parameter 'intervals' must have the property 'Symbol.iterator'.");
        }
        if(!(codeBlock instanceof ByteArray)) {
            throw new TypeError("The parameter 'codeBlock' must be an instance of 'karbonator.ByteArray'.");
        }
        if(!(pforkKeys instanceof ListSet) && !(pforkKeys instanceof TreeSet)) {
            throw new TypeError("'pforkKeys' must be an instanceof 'karbonator.collection.ListSet' or 'karbonator.collection.TreeSet'.");
        }
        
        this._intervals = Array.from(intervals);
        this._littleEndian = !!littleEndian;
        this._codeBlock = ByteArray.from(codeBlock);
        this._pforkKeys = pforkKeys;
        this._sourceCodeForDebug = arguments[4];
        if(karbonator.isUndefined(this._sourceCodeForDebug)) {
            this._sourceCodeForDebug = "";
        }
    };
    
    /**
     * @memberof RegexVm
     * @constructor
     * @param {Number} tokenKey
     * @param {String} text
     * @param {karbonator.math.Interval} range
     */
    RegexVm.MatchResult = function (tokenKey, text, range) {
        this.tokenKey = tokenKey;
        this.text = text;
        this.range = range;
    };
    
    /**
     * @function
     * @param {RegexVm.MatchResult} rhs
     * @returns {Boolean}
     */
    RegexVm.MatchResult.prototype[karbonator.equals] = function (rhs) {
        return this.tokenKey === rhs.tokenKey
            && this.text === rhs.text
            && this.range[karbonator.equals](rhs.range)
        ;
    };
    
    /**
     * @function
     * @returns {String}
     */
    RegexVm.MatchResult.prototype.toString = function () {
        var str = '{';
        
        str += "tokenKey";
        str += " : ";
        str += this.tokenKey;
        
        str += ", ";
        str += "text";
        str += " : ";
        str += this.text;
        
        str += ", ";
        str += "range";
        str += " : ";
        str += this.range;
        
        str += '}';
        
        return str;
    };
    
    /**
     * @function
     * @param {RegexVm.Bytecode} bytecode
     */
    RegexVm.prototype.setBytecode = function (bytecode) {
        this._bytecode = bytecode;
    };
    
    /**
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @return {RegexVm.MatchResult|null}
     */
    RegexVm.prototype.find = function (str) {
        if(karbonator.isUndefinedOrNull(this._bytecode)) {
            throw new Error("Set the bytecode of the regex first.");
        }
        
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }
        this._inStr = str;
        
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeInteger(startIndex)) {
            throw new TypeError("'startIndex' must be a non-negative integer.");
        }
        
        return this._run(startIndex);
    };
    
    /**
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @return {Array<RegexVm.MatchResult>}
     */
    RegexVm.prototype.findAll = function (str) {
        if(karbonator.isUndefinedOrNull(this._bytecode)) {
            throw new Error("Set the bytecode of the regex first.");
        }
        
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }
        this._inStr = str;
        
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeInteger(startIndex)) {
            throw new TypeError("'startIndex' must be a non-negative integer.");
        }
        
        if(this._bytecode._regexStr === "((a*b*c*)|(a*c*b*))*") {
            debugger;
        }
        
        var results = [];
        for(var i = startIndex; ; ) {
            var result = this._run(i);
            if(null !== result) {
                if(
                    results.length > 0
                    && result[karbonator.equals](results[results.length - 1])
                ) {
                    break;
                }
                
                results.push(result);
                
                i = result.range.getMaximum();
            }
            else {                
                ++i;
                
                if(i >= this._inStr.length) {
                    break;
                }
            }
        }
        
        return results;
    };
    
    RegexVm.prototype._isLhsPriorToRhs = function (forkKeys, lhsScores, rhsScores) {
        var result = false;
        
        for(
            var keyIter = forkKeys.keys(), iP = keyIter.next();
            !iP.done;
            iP = keyIter.next()
        ) {
            var forkKey = iP.value;
            
            var lhsScore = lhsScores.get(forkKey);
            if(karbonator.isUndefined(lhsScore)) {
                continue;
            }
            
            var rhsScore = rhsScores.get(forkKey);
            if(karbonator.isUndefined(rhsScore)) {
                continue;
            }
            
            if(lhsScore !== rhsScore) {
                result = lhsScore > rhsScore;
                
                break;
            }
        }
        
        return result;
        
//        var result = false;
//        
//        for(
//            var keyIter = forkKeys.keys(), iP = keyIter.next();
//            !iP.done;
//            iP = keyIter.next()
//        ) {
//            var forkKey = iP.value;
//            
//            var lhsScore = lhsScores.get(forkKey, 0);
//            var rhsScore = rhsScores.get(forkKey, 0);
//            if(lhsScore !== rhsScore) {
//                if(lhsScore < rhsScore) {
//                    result = true;
//                }
//                break;
//            }
//        }
//        
//        return result;
    };
    
    /**
     * @private
     * @function
     * @param {Number} startIndex
     * @return {RegexVm.MatchResult}
     */
    RegexVm.prototype._run = function (startIndex) {
        this._thIdMap.clear();
        this._forkMap.clear();
        
        this._thIdSeq = 0;
        this._suspendedCtxts.length = 0;
        this._ctxts.length = 0;
        
        var pforkKeys = this._bytecode._pforkKeys;
        var found = false;
        var matchThread = null;
        var matchThreads = [];
        var debugStr = "";
        
        this.createThread(0, startIndex);
        
        //쓰레드를 동시에 굴리는 버전.
        var aliveThreads = [];
        var deadThreads = [];
        while(this._ctxts.length > 0 && !found) {
            aliveThreads.length = 0;
            
            for(var i = 0; !found && i < this._ctxts.length; ++i) {
                var th = this._ctxts[i];
                for(var running = true; running && !th.isDead(); ) {
                    var execInfo = th.execute();
                    switch(execInfo.opCode) {
                        case 0x0E:
                        case 0x0F:
                            if(th._zFlag) {
                                aliveThreads.push(th);
                            }
                            else {
                                th._frameStack.pop();
                            }
                            
                            running = false;
                        break;
                    }
                    
                    debugStr += this.createExecInfoDebugMessage(execInfo) + "\r\n";
                }
                
                if(th.isDead()) {
                    deadThreads.push(th);
                }
                
                //debugStr += ".............................." + "\r\n";
            }
            
            var temp = this._ctxts;
            this._ctxts = aliveThreads;
            aliveThreads = temp;
            
            debugStr += "threads === "
                + Array.from(
                    this._ctxts,
                    function (current) {
                        return 'T' + current._id + '(' + current._forkScores.toString() + ')';
                    }
                ).toString()
                 + "\r\n"
            ;
            
            debugStr += "pforkKeys === " + pforkKeys.toString() + "\r\n";
            
            for(var i = 0; i < deadThreads.length; ++i) {
                var th = deadThreads[i];
                if(null === th._matchResult) {
                    continue;
                }
                
                debugStr += this.createMatchResultDebugMessage(th)
                    + "\r\n"
                ;
                
                matchThreads.push(th);
                
                if(null === matchThread) {
                    matchThread = th;
                    
                    var noMore = true;
                    for(var j = 0; noMore && j < this._ctxts.length; ++j) {
                        noMore = !this._isLhsPriorToRhs(
                            pforkKeys,
                            this._ctxts[j]._forkScores, th._forkScores
                        );
                    }
                    
                    if(noMore) {
                        found = true;
                    }
                }
                else {
                    var priorToSelected = this._isLhsPriorToRhs(
                        pforkKeys,
                        th._forkScores, matchThread._forkScores
                    );
                    
                    if(priorToSelected) {
                        debugStr += 'T' + th._id + " is prior to the selected thread." + "\r\n";
                    }
                    
                    var priorToAlivingThs = true;
                    for(var j = 0; priorToAlivingThs && j < this._ctxts.length; ++j) {
                        priorToAlivingThs = this._isLhsPriorToRhs(
                            pforkKeys,
                            th._forkScores, this._ctxts[j]._forkScores
                        );
                    }
                    
                    if(priorToAlivingThs) {
                        debugStr += 'T' + th._id + " is prior to aliving threads." + "\r\n";
                    }
                    
                    
                    
                    if(priorToAlivingThs) {
                        found = true;
                    }
                    
                    if(priorToSelected) {
                        matchThread = th;
                    }
                }
            }
            deadThreads.length = 0;
            
            if(null !== matchThread) {
                debugStr += "selectedResult === "
                    + this.createMatchResultDebugMessage(matchThread)
                    + "\r\n"
                ;
            }
            
            debugStr += "matchThreads === ";
            for(var t = 0; t < matchThreads.length; ++t) {
                debugStr += this.createMatchResultDebugMessage(matchThreads[t])
                    + "\r\n"
                ;
            }
            debugStr += "\r\n";
            
            debugStr += "------------------------------" + "\r\n";
        }
        
        debugStr += (null === matchThread ? "Failed..." : "Found!!!") + "\r\n";
        
        //쓰레드가 끝날 때까지 기다리는 버전.
        //전형적인 backtracking 방식.
        //버그 있음???
//        while(this._ctxts.length > 0 && null === matchThread) {
//            var thNdx = this._ctxts.length - 1;
//            
//            var th = this._ctxts[thNdx];
//            while(!th.isDead()) {
//                 th.execute();
//            }
//            
//            //debugStr += ("------------------------------");
//            
//            if(null === matchThread) {
//                matchThread = th;
//                break;
//                //debugStr += ("T" + th._id + '(' + th._forkScores.toString() + ").result === " + th._matchResult);
//            }
//            this._ctxts.splice(thNdx, 1);
//        }
        
        //debugStr += "==============================" + "\r\n";
        
        //console.log(debugStr);
        
        return (null !== matchThread ? matchThread._matchResult : null);
    };
    
    /**
     * @function
     * @param {Number} pc
     * @param {Number} cursor
     * @param {RegexVm._Thread} [parent]
     * @param {Boolean} [prioritize=false]
     * @return {RegexVm._Thread}
     */
    RegexVm.prototype.createThread = function (pc, cursor) {
        var parent = arguments[2];
        
        var parentId = -1;
        var forkKey = -RegexVm.Instruction.fork.getSize();
        if(!karbonator.isUndefinedOrNull(parent)) {
            parentId = parent._id;
            forkKey += parent._pc;
        }
        
        var newThreadId = this._thIdSeq;
        var newThread = new RegexVm._Thread(
            this, newThreadId,
            pc, cursor,
            parent, (!!arguments[3] && forkKey >= 0 ? forkKey : null)
        );
        this._ctxts.push(newThread);
        ++this._thIdSeq;
        
        if(!!arguments[3] && forkKey >= 0) {
            if(!this._forkMap.has(forkKey)) {
                this._forkMap.set(
                    forkKey,
                    new ListSet(
                        karbonator.numberComparator
                    )
                );
            }
            var set = this._forkMap.get(forkKey);
            set.add(parentId);
        }
        
        return newThread;
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {Number}
     */
    RegexVm.prototype.getCurrentCharacterCode = function (index) {
        var code = (
            index < this._inStr.length
            ? this._inStr.charCodeAt(index)
            : -1
        );
        
        return code;
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {karbonator.math.Interval}
     */
    RegexVm.prototype.getIntervalAt = function (index) {
        return this._bytecode._intervals[index];
    };
    
    /**
     * @function
     * @return {Object}
     */
    RegexVm._Thread.prototype.execute = function () {
        var info = {
            thread : this,
            instructionAddress : this._pc,
            postExecutionPc : 0,
            opCode : 0
        };
        
        var opCode = this.getNextOpCode();
        ++this._pc;
        
        info.opCode = opCode;
        
        switch(opCode) {
        case 0x00:
            this.branch();
        break;
        case 0x01:
            throw new Error("A not implemented opcode.");
        break;
        case 0x02:
        case 0x03:
            this.branchIfZeroIs((opCode & 0x01) !== 0);
        break;
        case 0x04:
            throw new Error("An invalid opcode.");
        break;
        case 0x05:
            this.jumpToSubroutine();
        break;
        case 0x06:
            this.returnFromSubroutine();
        break;
        case 0x07:
            this.accept();
        break;
        case 0x08:
        case 0x09:
            this.fork((opCode & 0x01) !== 0);
        break;
        case 0x0A:
        case 0x0B:
            this.setZFlag((opCode & 0x01) !== 0);
        break;
        case 0x0C:
        case 0x0D:
            this.moveConsumePointer((opCode & 0x01) !== 0);
        break;
        case 0x0E:
            this.testCode(false);
        break;
        case 0x0F:
            this.testRange(false);
        break;
        default:
            throw new Error("An invalid opcode has been found.");
        }
        
        info.postExecutionPc = this._pc;
        
        return info;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.getNextOpCode = function () {
        return this._vm._bytecode._codeBlock.get(this._pc);
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} matchThread
     * @returns {String}
     */
    RegexVm.prototype.createMatchResultDebugMessage = function (matchThread) {
        return 'T' + matchThread._id
            + '(' + matchThread._forkScores.toString() + ')'
            + "."
            + "result === "
            + matchThread._matchResult.toString()
        ;
    };
    
    /**
     * @function
     * @param {Object} execInfo
     * @returns {String}
     */
    RegexVm.prototype.createExecInfoDebugMessage = function (execInfo) {
        var th = execInfo.thread;
        var inst = RegexVm.findInstructionByOpCode(execInfo.opCode);
        if(karbonator.isUndefined(inst)) {
            throw new Error("An invalid opcode has been found.");
        }
        
        var debugStr = "";
        for(
            var current = th;
            null !== current;
            current = current._parent
        ) {
            debugStr += '.';
            debugStr += 'T' + current._id;
        }
        
        var mnemonic = inst.getMnemonic();
        debugStr += " " + (execInfo.instructionAddress) + ":";
        debugStr += "\t" + mnemonic;
        
        if(mnemonic.endsWith("fork")) {
            debugStr += " " + "parent : T" + th._id;
            debugStr += '(' + execInfo.postExecutionPc + ')';
            var childTh = th._vm._ctxts[th._vm._ctxts.length - 1];
            debugStr += ", child : T" + childTh._id;
            debugStr += '(' + childTh._pc + ')';
        }
        else if(mnemonic.startsWith("test")) {
            var cursor = th._cursor - (th._zFlag ? 1 : 0);
            debugStr += "\t" + "at " + cursor + " " + th._vm._inStr.charAt(cursor);
        }
        
        return debugStr;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.readInt16 = function () {
        var value = karbonator.bytesToInteger(
            this._vm._bytecode._codeBlock,
            2, true,
            this._vm._bytecode._littleEndian,
            this._pc
        );
        this._pc += 2;
        
        return value;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.readInt32 = function () {
        var value = karbonator.bytesToInteger(
            this._vm._bytecode._codeBlock,
            4, true,
            this._vm._bytecode._littleEndian,
            this._pc
        );
        this._pc += 4;
        
        return value;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.readUint32 = function () {
        var value = karbonator.bytesToInteger(
            this._vm._bytecode._codeBlock,
            4, false,
            this._vm._bytecode._littleEndian,
            this._pc
        );
        this._pc += 4;
        
        return value;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    RegexVm._Thread.prototype.isDead = function () {
        return this._frameStack.length < 1;
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.branch = function () {
        var offset = this.readInt16();
        
        this._pc += offset;
    };
    
    /**
     * @function
     * @param {Boolean} flag
     */
    RegexVm._Thread.prototype.branchIfZeroIs = function (flag) {
        var offset = this.readInt16();
        
        if(this._zFlag === !!flag) {
            this._pc += offset;
        }
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.jumpToSubroutine = function () {
        var addr = this.readUint32();
        
        this._frameStack.push(new RegexVm._Frame(this._pc));
        this._pc = addr;
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.returnFromSubroutine = function () {
        this._pc = this.getCurrentFrame()._returnAddress;
        this._frameStack.pop();
    };
    
    /**
     * @function
     * @param {Boolean} prioritize
     */
    RegexVm._Thread.prototype.fork = function (prioritize) {        
        var goToOffset = this.readInt16();
        var newThreadPcOffset = this.readInt16();
        
        this._vm.createThread(
            this._pc + newThreadPcOffset,
            this._cursor,
            this,
            prioritize
        );
        
        this._pc += goToOffset;
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.accept = function () {
        var tokenIndex = this.readUint32();
        
        this._matchResult = new RegexVm.MatchResult(
            tokenIndex,
            "",
            null
        );
        
        var cursorStart = this._consumeRanges[0];
        var start = cursorStart;
        for(var i = 1; i < this._consumeRanges.length; ++i) {
            var end = this._consumeRanges[i];
            if(RegexVm._Thread._skipDelimiter === end) {
                ++i;
                if(i >= this._consumeRanges.length) {
                    break;
                }
                
                start = this._consumeRanges[i];
            }
            else {
                this._matchResult.text += this._vm._inStr.substring(start, end);
                
                start = end;
            }
        }
        
        this._matchResult.range = new karbonator.math.Interval(
            cursorStart,
            this._cursor
        );
        
        this._frameStack.length = 0;
    };
    
    /**
     * @function
     * @param {Boolean} flag
     */
    RegexVm._Thread.prototype.setZFlag = function (flag) {
        this._zFlag = !!flag;
    };
    
    /**
     * @function
     * @param {Boolean} consume
     */
    RegexVm._Thread.prototype.moveConsumePointer = function (consume) {
        this._consumePtr = this._cursor;
        if(!consume) {
            this._consumeRanges.push(RegexVm._Thread._skipDelimiter);
        }
        this._consumeRanges.push(this._cursor);
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.testCode = function () {
        var charCode = this.readUint32();
        
        var currentCharCode = this._vm.getCurrentCharacterCode(this._cursor);
        this._zFlag = (charCode === currentCharCode);
        if(this._zFlag) {
            ++this._cursor;
        }
        else {
            this._frameStack.length = 0;
        }
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.testRange = function () {
        var intervalIndex = this.readUint32();
        var vm = this._vm;
        
        this._zFlag = vm.getIntervalAt(intervalIndex)
            .contains(vm.getCurrentCharacterCode(this._cursor))
        ;
        if(this._zFlag) {
            ++this._cursor;
        }
        else {
            this._frameStack.length = 0;
        }
    };
    
    /**
     * @function
     * @return {RegexVm._Frame}
     */
    RegexVm._Thread.prototype.getCurrentFrame = function () {
        if(this.isDead()) {
            throw new Error("The thread is already dead.");
        }
        
        return this._frameStack[this._frameStack.length - 1];
    };
    
    /*////////////////////////////////*/
    
    string.Lexer = (function () {
        var Token = (function () {
            /**
             * @constructor
             * @param {String} name
             * @param {Nfa} fa
             * @param {String} regexStr
             */
            var Token = function (name, fa, regexStr) {
                this._name = name;
                this._fa = fa;
                this._regexStr = regexStr;
            };
            
            /**
             * @function
             * @return {String}
             */
            Token.prototype.toString = function () {
                var str = '{';
                
                str += '"';
                str += this._name;
                str += '"';
                
                str += ", ";
                str += this._fa.toString();
                
                str += ", ";
                str += '/';
                str += this._regexStr;
                str += '/';
                
                str += '}';
                
                return str;
            };
            
            return Token;
        }());
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var Lexer = function () {
            this._tokenMap = new Map(karbonator.stringComparator);
            this._regexVm = new RegexVm();
        };
        
        /**
         * @function
         * @param {String} str
         */
        Lexer.prototype.inputString = function (str) {
            this._input = str;
        };
        
        /**
         * @function
         * @return {Object}
         */
        Lexer.prototype.scanNextToken = function () {
            
        };
        
        /**
         * @function
         */
        Lexer.prototype.rewind = function () {
            
        };
        
        return Lexer;
    }());
    
    string.LexerGenerator = (function () {
        /*////////////////////////////////*/
        //AstNode
        
        /**
         * @constructor
         * @param {Number} type
         * @param {Object} value
         * @param {Boolean} [rootOfGroup]
         */
        var AstNode = function (type, value) {
            assertion.isTrue(karbonator.isNonNegativeSafeInteger(type));
            assertion.isTrue(!karbonator.isUndefined(value));
            
            this._type = type;
            this._value = value;
            this._rootOfGroup = (karbonator.isUndefined(arguments[2]) ? false : !!arguments[2]);
            this._parent = null;
            this._children = [];
        };
        
        /**
         * @memberof AstNode
         * @private
         * @function
         * @param {*} o
         */
        AstNode._assertIsAstNode = function (o) {
            if(!(o instanceof AstNode)) {
                throw new TypeError("The parameter must be an instance of AstNode.");
            }
        };
        
        AstNode.CppPrefixIterator = (function () {
            /**
             * @memberof AstNode
             * @constructor
             * @param {AstNode} rootNode
             * @param {AstNode} currentNode
             */
            var CppPrefixIterator = function (rootNode, currentNode) {
                this._rootNode = rootNode;
                this._currentNode = currentNode;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            CppPrefixIterator.prototype.moveToNext = function () {
                if(null !== this._currentNode) {
                    if(this._currentNode.isLeaf()) {
                        while(null !== this._currentNode) {
                            var nextSibling = this._currentNode.getNextSibling();
                            if(null !== nextSibling) {
                                this._currentNode = nextSibling;
                                break;
                            }
                            
                            this._currentNode = this._currentNode.getParent();
                        }
                    }
                    else {
                        this._currentNode = (
                            this._currentNode.getChildCount() > 0
                            ? this._currentNode.getChildAt(0)
                            : null
                        );
                    }
                }
                
                return null !== this._currentNode;
            };
            
            /**
             * @function
             * @return {AstNode}
             */
            CppPrefixIterator.prototype.dereference = function () {
                assertion.isTrue(null !== this._currentNode);
                
                return this._currentNode;
            };
            
            /**
             * @function
             * @param {AstNode.CppPrefixIterator} rhs
             * @return {Boolean}
             */
            CppPrefixIterator.prototype[karbonator.equals] = function (rhs) {
                if(this === rhs) {
                    return true;
                }
                
                if(karbonator.isUndefinedOrNull(rhs)) {
                    return false;
                }
                
                return this._rootNode === rhs._rootNode
                    && this._currentNode === rhs._currentNode
                ;
            };
            
            return CppPrefixIterator;
        }());
        
        AstNode.CppPostfixIterator = (function () {
            /**
             * @memberof AstNode
             * @constructor
             * @param {AstNode} rootNode
             * @param {AstNode} currentNode
             */
            var CppPostfixIterator = function (rootNode, currentNode) {
                this._rootNode = rootNode;
                this._currentNode = currentNode;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            CppPostfixIterator.prototype.moveToNext = function () {
                do {
                    var nextSibling = this._currentNode.getNextSibling();
                    if(null === nextSibling) {
                        this._currentNode = this._currentNode.getParent();
                        if(null === this._currentNode) {
                            break;
                        }
                    }
                    else {
                        this._currentNode = nextSibling.getLeftmostLeaf();
                    }
                }
                while(null === this._currentNode);
            };
            
            /**
             * @function
             * @return {AstNode}
             */
            CppPostfixIterator.prototype.dereference = function () {
                assertion.isTrue(null !== this._currentNode);
                
                return this._currentNode;
            };
            
            /**
             * @function
             * @param {AstNode.CppPostfixIterator} rhs
             * @return {Boolean}
             */
            CppPostfixIterator.prototype[karbonator.equals] = function (rhs) {
                if(this === rhs) {
                    return true;
                }
                
                if(karbonator.isUndefinedOrNull(rhs)) {
                    return false;
                }
                
                return this._rootNode === rhs._rootNode
                    && this._currentNode === rhs._currentNode
                ;
            };
            
            return CppPostfixIterator;
        }());
        
        /**
         * @function
         * @return {AstNode}
         */
        AstNode.prototype[karbonator.shallowClone] = function () {
            return new AstNode(
                this._type,
                karbonator.shallowCloneObject(this._value),
                this._rootOfGroup
            );
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        AstNode.prototype.isRootOfGroup = function () {
            return this._rootOfGroup;
        };
        
        /**
         * @function
         * @param {Boolean} flag
         */
        AstNode.prototype.setRootOfGroup = function (flag) {
            this._rootOfGroup = !!flag;
        };
        
        /**
         * @function
         * @return {Number}
         */
        AstNode.prototype.getType = function () {
            return this._type;
        };
        
        /**
         * @function
         * @return {Object}
         */
        AstNode.prototype.getValue = function () {
            return this._value;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        AstNode.prototype.isLeaf = function () {
            return this._children.length < 1;
        };
        
        /**
         * @function
         * @return {AstNode|null}
         */
        AstNode.prototype.getRoot = function () {
            var current = this._parent;
            if(null === current) {
                return this;
            }
            
            var previous = null;
            while(null !== current) {
                previous = current;
                current = current._parent;
            }
            
            return previous;
        };
        
        /**
         * @function
         * @return {AstNode|null}
         */
        AstNode.prototype.getParent = function () {
            return this._parent;
        };
        
        /**
         * @function
         * @return {Number}
         */
        AstNode.prototype.getChildIndex = function () {
            var index = -1;
            if(null !== this._parent) {
                index = this._parent._children.indexOf(this);
            }
            
            return index;
        };
        
        /**
         * @function
         * @return {AstNode|null}
         */
        AstNode.prototype.getNextSibling = function () {
            var nextSibling = null;
            if(null !== this._parent) {
                var childIndex = this.getChildIndex() + 1;
                if(childIndex < this._parent.getChildCount()) {
                    nextSibling = this._parent.getChildAt(childIndex);
                }
            }
            
            return nextSibling;
        };
        
        /**
         * @function
         * @return {Number}
         */
        AstNode.prototype.getChildCount = function () {
            return this._children.length;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {AstNode}
         */
        AstNode.prototype.getChildAt = function (index) {
            assertion.isTrue(karbonator.isNonNegativeSafeInteger(index));
            
            if(index >= this._children.length) {
                throw new Error("Index out of range.");
            }
            
            return this._children[index];
        };
        
        /**
         * @function
         * @return {AstNode}
         */
        AstNode.prototype.getLastChild = function () {
            if(this.isLeaf()) {
                throw new Error("The node has no children.");
            }
            
            return this._children[this._children.length - 1];
        };
        
        /**
         * @function
         * @return {AstNode}
         */
        AstNode.prototype.getLeftmostLeaf = function () {
            var current = this;
            while(!current.isLeaf()) {
                current = current._children[0];
            }
            
            return current;
        };
        
        /**
         * @function
         * @param {AstNode} child
         */
        AstNode.prototype.addChild = function (child) {
            AstNode._assertIsAstNode(child);
            
            if(this === child) {
                throw new Error("'this' node cannot be of a child of 'this'.");
            }
            
            if(this._children.includes(child)) {
                throw new Error("The node already has the 'child' node.");
            }
            
            if(null !== child.getParent()) {
                child.getParent().removeChild(child);
            }
            this._children.push(child);
            child._parent = this;
        };
        
        /**
         * @function
         * @param {iterable} nodes
         * @param {Number} index
         */
        AstNode.prototype.insertChildren = function (nodes, index) {
            assertion.isTrue(karbonator.isEsIterable(nodes));
            assertion.isTrue(karbonator.isNonNegativeSafeInteger(index));
            
            if(index > this._children.length) {
                throw new Error("Index out of range.");
            }
            
            for(
                var iter = nodes[Symbol.iterator](), iterPair = iter.next();
                !iterPair.done;
                iterPair = iter.next(), ++index
            ) {
                var child = iterPair.value;
                AstNode._assertIsAstNode(child);
                
                if(null !== child.getParent()) {
                    child.getParent().removeChild(child);
                }
                
                this._children.splice(index, 0, child);
                child._parent = this;
            }
        };
        
        /**
         * @function
         * @param {AstNode} child
         * @return {Number}
         */
        AstNode.prototype.removeChild = function (child) {
            assertion.isInstanceOf(child, AstNode);
            
            var index = this._children.indexOf(child);
            if(index >= 0) {
                this.removeChildAt(index);
            }
            
            return index;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {AstNode}
         */
        AstNode.prototype.removeChildAt = function (index) {
            assertion.isTrue(karbonator.isNonNegativeSafeInteger(index));
            
            if(index > this._children.length) {
                throw new Error("Index out of range.");
            }
            
            var removedChild = this._children.splice(index, 1)[0];
            assertion.isTrue(this === removedChild._parent);
            removedChild._parent = null;
            
            return removedChild;
        };
        
        /**
         * @function
         * @return {Array.<AstNode>}
         */
        AstNode.prototype.removeAllChildren = function () {
            var removedChildren = this._children.slice();
            for(var i = 0, count = removedChildren.lenght; i < count; ++i) {
                assertion.isTrue(this === removedChildren._parent);
                removedChildren[i]._parent = null;
            }
            this._children.length = 0;
            
            return removedChildren;
        };
        
        /**
         * @function
         * @return {AstNode.CppPrefixIterator}
         */
        AstNode.prototype.beginPrefix = function () {
            return new AstNode.CppPrefixIterator(this.getRoot(), this);
        };
        
        /**
         * @function
         * @return {AstNode.CppPrefixIterator}
         */
        AstNode.prototype.endPrefix = function () {
            return new AstNode.CppPrefixIterator(this.getRoot(), null);
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         * @param {Boolean}
         */
        AstNode.prototype.traverseByPrefix = function (callback) {
            if(!karbonator.isCallable(callback)) {
                throw new TypeError("The callback must be a callable object.");
            }
            
            var thisArg = arguments[1];
            
            var nodeStack = [this];
            
            var continueTraversal = true;
            while(continueTraversal && nodeStack.length > 0) {
                var currentNode = nodeStack.pop();
                continueTraversal = !callback.call(thisArg, currentNode);
                
                if(continueTraversal) {
                    for(var i = currentNode._children.length; i > 0; ) {
                        --i;
                        nodeStack.push(currentNode._children[i]);
                    }
                }
            }
            
            return continueTraversal;
        };
        
        /**
         * @function
         * @return {AstNode.CppPostfixIterator}
         */
        AstNode.prototype.beginPostfix = function () {
            return new AstNode.CppPostfixIterator(this.getRoot(), this.getLeftmostLeaf());
        };
        
        /**
         * @function
         * @return {AstNode.CppPostfixIterator}
         */
        AstNode.prototype.endPostfix = function () {
            return new AstNode.CppPostfixIterator(this.getRoot(), null);
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         * @param {Boolean}
         */
        AstNode.prototype.traverseByPostfix = function (callback) {
            if(!karbonator.isCallable(callback)) {
                throw new TypeError("The callback must be a callable object.");
            }
            
            var thisArg = arguments[1];
            
            var nodeStack = [this];
            
            var continueTraversal = true;
            for(
                var lastTraversedNode = null;
                continueTraversal && nodeStack.length > 0;
            ) {
                var currentNode = nodeStack[nodeStack.length - 1];
                if(
                    !currentNode.isLeaf()                                           
                    && currentNode.getLastChild() !== lastTraversedNode
                ) {
                    for(var i = currentNode._children.length; i > 0; ) {
                        --i;
                        nodeStack.push(currentNode._children[i]);
                    }
                }
                else {
                    continueTraversal = !callback.call(thisArg, currentNode);
                    lastTraversedNode = currentNode;
                    nodeStack.pop();
                }
            }
            
            return continueTraversal;
        };
        
        /**
         * @function
         * @param {AstNode} rhs
         * @return {Boolean}
         */
        AstNode.prototype[karbonator.equals] = function (rhs) {
            if(this === rhs) {
                return true;
            }
            
            if(karbonator.isUndefinedOrNull(rhs)) {
                return false;
            }
            
            if(
                this._type !== rhs._type
                || this._rootOfGroup !== rhs._rootOfGroup
            ) {
                return false;
            }
            
            return karbonator.areEqual(this._value, rhs._value);
        };
        
        /**
         * @function
         * @param {AstNode} otherRoot
         * @return {Boolean}
         */
        AstNode.prototype.subtreeEquals = function (otherRoot) {
            AstNode._assertIsAstNode(otherRoot);
            
            var lhsIter = this.beginPrefix();
            var lhsEndIter = this.endPrefix();
            var rhsIter = otherRoot.beginPrefix();
            var rhsEndIter = otherRoot.endPrefix();
            var result = false;
            
            for(var loop = true; loop; ) {
                var lhsHasNext = !lhsIter[karbonator.equals](lhsEndIter);
                var rhsHasNext = !rhsIter[karbonator.equals](rhsEndIter);
                if(lhsHasNext !== rhsHasNext) {
                    loop = false;
                }
                else if(lhsHasNext) {
                    if(!lhsIter.dereference()[karbonator.equals](rhsIter.dereference())) {
                        loop = false;
                    }
                    else {
                        lhsIter.moveToNext();
                        rhsIter.moveToNext();
                    }
                }
                else {
                    result = true;
                    loop = false;
                }
            }
            
            return result;
        };
        
        /**
         * @function
         * @return {String}
         */
        AstNode.prototype.toString = function () {
            var context = {
                str : "",
                toStringFunc : AstNode._astNodeToString
            };
            
            for(
                var iter = this.beginPostfix(), endIter = this.endPostfix();
                !iter[karbonator.equals](endIter);
                iter.moveToNext()
            ) {
                context.str += context.toStringFunc(iter.dereference());
                context.str += "\r\n";
            }
            
//            this.traverseByPostfix(
//                function (node) {
//                    this.str += this.toStringFunc(node);
//                    this.str += "\r\n";
//                },
//                context
//            );
            
            return context.str;
        };
        
        /**
         * @memberof AstNode
         * @private
         * @function
         * @param {AstNode} oThis
         * @return {String}
         */
        AstNode._astNodeToString = function (oThis) {
            var str = detail._colStrBegin;
            
            str += "rootOfGroup";
            str += " : ";
            str += oThis._rootOfGroup;
            
            str += ", ";
            str += "type";
            str += " : ";
            str += oThis._type;
            
            str += ", ";
            str += "value";
            str += " : ";
            str += oThis._value;
            
            str += ", ";
            str += "childCount";
            str += " : ";
            str += oThis._children.length;
            
            str += detail._colStrEnd;
            
            return str;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //OperatorType
        
        /**
         * @constructor
         * @param {Number} key
         * @param {String} name
         * @param {Number} parameterCount
         * @param {Number} priority
         * @param {Number} associativity
         */
        var OperatorType = function (key, name, parameterCount, priority, associativity) {
            _assertIsNonNegativeSafeInteger(key);
            _assertIsString(name);
            _assertIsNonNegativeSafeInteger(parameterCount);
            _assertIsNonNegativeSafeInteger(priority);
            _assertIsNonNegativeSafeInteger(associativity);
            
            this._key = key;
            this._name = name;
            this._parameterCount = parameterCount;
            this._priority = priority;
            this._associativity = associativity;
        };
        
        /**
         * @function
         * @return {Number}
         */
        OperatorType.prototype.getKey = function () {
            return this._key;
        };
        
        /**
         * @function
         * @return {String}
         */
        OperatorType.prototype.getName = function () {
            return this._name;
        };
        
        /**
         * @function
         * @return {Number}
         */
        OperatorType.prototype.getParameterCount = function () {
            return this._parameterCount;
        };
        
        /**
         * @function
         * @param {OperatorType} rhs
         * @return {Boolean}
         */
        OperatorType.prototype.precedes = function (rhs) {
            return rhs._priority < this._priority;
        };
        
        /**
         * @function
         * @return {Number}
         */
        OperatorType.prototype.getAssociativity = function () {
            return this._associativity;
        };
        
        /**
         * @function
         * @param {OperatorType} rhs
         * @return {Boolean}
         */
        OperatorType.prototype[karbonator.equals] = function (rhs) {
            if(this === rhs) {
                return true;
            }
            
            if(karbonator.isUndefinedOrNull(rhs)) {
                return false;
            }
            
            var result = this._key === rhs._key;
            if(result) {
                if(
                    this._name !== rhs._name
                    || this._parameterCount !== rhs._parameterCount
                    || this._priority !== rhs._priority
                    || this._associativity !== rhs._associativity
                    || this._action !== rhs._action
                ) {
                    throw new Error("Operators that have the same key must have same properties and values.");
                }
            }
            
            return result;
        };
        
        /**
         * @function
         * @return {String}
         */
        OperatorType.prototype.toString = function () {
            var str = '{';
            
            str += "name";
            str += " : ";
            str += this._name;
            
            str += ", ";
            str += "parameterCount";
            str += " : ";
            str += this._parameterCount;
            
            str += ", ";
            str += "priority";
            str += " : ";
            str += this._priority;
            
            str += '}';
            
            return str;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Operator
        
        /**
         * @constructor
         * @param {OperatorType} type
         * @param {Array.<Object>} [staticArgs]
         */
        var Operator = function (type) {
            assertion.isTrue(!karbonator.isNonNegativeSafeInteger(type));
            
            this._type = type;
            this._staticArgs = (
                karbonator.isUndefined(arguments[1])
                ? []
                : Array.from(arguments[1])
            );
        };
        
        /**
         * @function
         * @return {Operator}
         */
        Operator.prototype[karbonator.shallowClone] = function () {
            return new Operator(
                this._type,
                karbonator.shallowCloneObject(this._staticArgs)
            );
        };
        
        /**
         * @function
         * @return {OperatorType}
         */
        Operator.prototype.getType = function () {
            return this._type;
        };
        
        /**
         * @function
         * @return {Number}
         */
        Operator.prototype.getStaticArgumentCount = function () {
            return this._staticArgs.length;
        };
        
        /**
         * @function
         * @return {Array.<Object>}
         */
        Operator.prototype.getStaticArguments = function () {
            return this._staticArgs;
        };
        
        /**
         * @function
         * @param {Operator} rhs
         * @return {Boolean}
         */
        Operator.prototype[karbonator.equals] = function (rhs) {
            if(this === rhs) {
                return true;
            }
            
            if(karbonator.isUndefinedOrNull(rhs)) {
                return false;
            }
            
            return this._type === rhs._type
                && karbonator.areEqual(this._staticArgs, rhs._staticArgs)
            ;
        };
        
        /**
         * @function
         * @return {String}
         */
        Operator.prototype.toString = function () {
            var str = '{';
            
            str += "type";
            str += " : ";
            str += this._type;
            
            str += ", ";
            str += "staticArgs";
            str += " : ";
            str += '[';
            str += this._staticArgs;
            str += ']';
            
            str += '}';
            
            return str;
        };
        
        /*////////////////////////////////*/
        
        /**
         * @readonly
         * @enum {Number}
         */
        var OperatorTypeKeys = {
            regexAlternation : 0,
            accept : 1,
            alternation : 2,
            concatenation : 3,
            repetition : 4,
            nonGreedyRepetition : 5
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        var Associativity = {
            none : 0,
            leftToRight : 1,
            rightToLeft : 2
        };
        
        /**
         * @readonly
         * @type {Map.<Number, Operator>}
         */
        var _opTypeMap = new TreeMap(
            karbonator.numberComparator,
            Array.from(
                [
                    new OperatorType(
                        OperatorTypeKeys.regexAlternation,
                        "regexAlternation",
                        2, 0,
                        Associativity.leftToRight
                    ),
                    new OperatorType(
                        OperatorTypeKeys.accept,
                        "accept",
                        1, 1,
                        Associativity.leftToRight
                    ),
                    new OperatorType(
                        OperatorTypeKeys.alternation,
                        "alternation",
                        2, 10,
                        Associativity.leftToRight
                    ),
                    new OperatorType(
                        OperatorTypeKeys.concatenation,
                        "concatenation",
                        2, 11,
                        Associativity.leftToRight
                    ),
                    new OperatorType(
                        OperatorTypeKeys.repetition,
                        "repetition",
                        1, 12,
                        Associativity.leftToRight
                    ),
                    new OperatorType(
                        OperatorTypeKeys.nonGreedyRepetition,
                        "nonGreedyRepetition",
                        1, 12,
                        Associativity.leftToRight
                    )
                ],
                /**
                 * @function
                 * @param {OperatorType} current
                 * @return {Array}
                 */
                function (current) {
                    return [current.getKey(), current];
                }
            )
        );
        
        /**
         * @readonly
         * @enum {Number}
         */
        var AstNodeType = {
            operator : 0,
            terminalRange : 1
        };
        
        /*////////////////////////////////*/
        //RegexParser
        
        /**
         * @constructor
         */
        var RegexParser = function () {
            this._exprCtxStack = [];
            this._pos = 0;
            this._parsing = false;
            this._error = {
                occured : false,
                message : "",
                position : 0
            };
            
            this._regexStr = "";
            this._regexLen = 0;
            
            this._edgeSet = new Set(_edgeComparator);
            this._primitiveScanner = null;
        };
        
        RegexParser.PrimitiveScanner = (function () {
            /**
             * @memberof RegexParser
             * @constructor
             */
            var PrimitiveScanner = function () {
                this._result = new ScannerResult();
            };
            
            /**
             * @function
             * @param {String} str
             * @param {Number} [start=0]
             * @param {ScannerResult}
             */
            PrimitiveScanner.prototype.scanDecimalInteger = function (str) {
                var startPos = detail._selectNonUndefined(arguments[1], 0);
                var pos = startPos;
                var errorCode = 0;
                var errorMessage = "";
                var value = "";
                
                for(
                    var ch = '', scanning = true, len = str.length;
                    scanning && pos < len;
                ) {
                    ch = str.charAt(pos);
                    switch(ch) {
                    case '0': case '1': case '2': case '3': case '4':
                    case '5': case '6': case '7': case '8': case '9':
                        if(value.length < 1 || str.charAt(startPos) !== '0') {
                            value += ch;
                            ++pos;
                        }
                        else {
                            errorCode = 1;
                            errorMessage = (
                                ch === '0'
                               ? "A decimal integer doesn't start with a sequence of '0'."
                               : "A decimal integer doesn't start with '0'."
                            );
                            
                            scanning = false;
                        }
                    break;
                    default:
                        scanning = false;
                    }
                }
                
                this._result.set(errorCode, errorMessage, pos, value);
                
                return this._result;
            };
            
            /**
             * @function
             * @param {String} str
             * @param {Number} [start=0]
             * @param {ScannerResult}
             */
            PrimitiveScanner.prototype.scanHexadecimalInteger = function (str) {
                var startPos = detail._selectNonUndefined(arguments[1], 0);
                var pos = startPos;
                var errorCode = 0;
                var errorMessage = "";
                var value = "";
                
                for(
                    var ch = '', scanning = true, len = str.length;
                    scanning && pos < len;
                ) {
                    ch = str.charAt(pos);
                    switch(ch) {
                    case '0':
                        value += ch;
                        ++pos;
                    break;
                    case '1': case '2': case '3': case '4':
                    case '5': case '6': case '7': case '8': case '9':
                    case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                    case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                        value += ch;
                        ++pos;
                    break;
                    default:
                        scanning = false;
                    }
                }
                
                this._result.set(errorCode, errorMessage, pos, value);
                
                return this._result;
            };
            
            /**
             * @function
             * @param {String} str
             * @param {Number} [start=0]
             * @return {ScannerResult}
             */
            PrimitiveScanner.prototype.scanEscapedCharacter = function (str) {
                var pos = detail._selectNonUndefined(arguments[1], 0);
                var errorCode = 0;
                var errorMessage = "";
                var intervals = [];
                
                var len = str.length;
                if(pos < len && str.charAt(pos) === '\\') {
                    if(++pos < len) {
                        switch(str.charAt(pos)) {
                        case 't':
                            intervals.push(_constInterval.horizontalTab);
                        break;
                        case 'r':
                            intervals.push(_constInterval.carrigeReturn);
                        break;
                        case 'n':
                            intervals.push(_constInterval.lineFeed);
                        break;
                        case 'v':
                            intervals.push(_constInterval.verticalTab);
                        break;
                        case 'f':
                            intervals.push(_constInterval.formFeed);
                        break;
                        case 'd':
                            if(++pos >= len) {
                                errorCode = 3;
                                errorMessage = "A decimal integer literal must be specified.";
                            }
                            else {
                                this.scanDecimalInteger(str, pos);
                                if(this._result.error.code === 0) {
                                    intervals.push(
                                        _createIntervalFromCharCode(
                                            Number.parseInt(this._result.value, 10)
                                        )
                                    );
                                    pos = this._result.position;
                                }
                                else {
                                    errorCode = 3;
                                    errorMessage = this._result.error.message;
                                }
                            }
                        break;
                        case 'x':
                            if(++pos >= len) {
                                errorCode = 4;
                                errorMessage = "A hexadecimal integer literal must be specified.";
                            }
                            else {
                                this.scanHexadecimalInteger(str, pos);
                                if(this._result.error.code === 0) {
                                    intervals.push(
                                        _createIntervalFromCharCode(
                                            Number.parseInt(this._result.value, 16)
                                        )
                                    );
                                    pos = this._result.position;
                                }
                                else {
                                    errorCode = 4;
                                    errorMessage = this._result.error.message;
                                }
                            }
                        break;
                        case 's':
                            intervals = intervals.concat(_constIntervalSet.posixSpace);
                        break;
                        case 'S':
                            intervals = intervals.concat(_constIntervalSet.nonWhiteSpaces);
                        break;
                        case 'w':
                            intervals = intervals.concat(_constIntervalSet.word);
                        break;
                        case 'W':
                            intervals = intervals.concat(_constIntervalSet.nonWord);
                        break;
                        case '0': case '1': case '2': case '3': case '4':
                        case '5': case '6': case '7': case '8': case '9':
                            errorCode = 5;
                            errorMessage = "Back referencing is not supported";
                        break;
                        case '^': case '$':
                        case '[': case ']': case '-':
                        case '(': case ')':
                        case '*': case '+': case '?':
                        case '{': case '}':
                        case '|':
                        case '.':
                        case '/':
                        case '\\':
                        case '#':
                        case '"': case '\'':
                        default:
                            intervals.push(
                                _createIntervalFromCharCode(
                                    str.charCodeAt(pos)
                                )
                            );
                        }
                        
                        if(errorCode === 0) {
                            ++pos;
                        }
                    }
                    else {
                        errorCode = 2;
                        errorMessage = "A character to escape must be specified.";
                    }
                }
                else {
                    errorCode = 1;
                    errorMessage = "An escaped character must start with '\\'";
                }
                
                this._result.set(errorCode, errorMessage, pos, intervals);
                
                return this._result;
            };
            
            /**
             * @function
             * @param {String} str
             * @param {Number} [start=0]
             * @param {Number} [positiveInfinityValue=Number.MAX_SAFE_INTEGER]
             * @return {ScannerResult}
             */
            PrimitiveScanner.prototype.scanRepetitionOperator = function (str) {
                var pos = detail._selectNonUndefined(arguments[1], 0);
                var errorCode = 0;
                var errorMessage = "";
                var min = _minInt;
                var max = detail._selectNonUndefined(arguments[2], _maxInt);
                var nonGreedy = false;
                var valid = false;
                
                var len = str.length;
                var state = 0;
                
                var scanning = true;
                while(scanning && pos < len) {
                    switch(state) {
                    case 0:
                        switch(str.charAt(pos)) {
                        case '{':
                            ++pos;
                            ++state;
                        break;
                        case '*':
                            min = 0;
                            max = _maxInt;
                            
                            ++pos;
                            valid = true;
                            state = 5;
                        break;
                        case '+':
                            min = 1;
                            max = _maxInt;
                            
                            ++pos;
                            valid = true;
                            state = 5;
                        break;
                        case '?':
                            min = 0;
                            max = 1;
                            
                            ++pos;
                            valid = true;
                            state = 5;
                        break;
                        default:
                            errorCode = 1;
                            errorMessage = "A repetition operator must start with '*', '+', '?' or '{'.";
                            scanning = false;
                        }
                    break;
                    case 1:
                        this.scanDecimalInteger(str, pos);
                        if(this._result.error.code === 0) {
                            min = Number.parseInt(this._result.value, 10);
                            pos = this._result.position;
                            ++state;
                        }
                        else {
                            errorCode = 2;
                            errorMessage = this._result.error.message;
                            scanning = false;
                        }
                    break;
                    case 2:
                        if(str.charAt(pos) === ',') {
                            ++pos;
                            ++state;
                        }
                        else {
                            max = min;
                            state = 4;
                        }
                    break;
                    case 3:
                        this.scanDecimalInteger(str, pos);
                        if(this._result.error.code === 0 && this._result.value !== "") {
                            max = Number.parseInt(this._result.value, 10);
                            
                            if(min <= max) {
                                pos = this._result.position;
                                ++state;
                            }
                            else {
                                errorCode = 4;
                                errorMessage = "The minimum value must be equal to or less than the maximum value.";
                                scanning = false;
                            }
                        }
                        else {
                            ++state;
                        }
                    break;
                    case 4:
                        if(str.charAt(pos) === '}') {
                            ++pos;
                            ++state;
                            valid = true;
                        }
                        else {
                            errorCode = 5;
                            errorMessage = "A repetition operator must end with '}'.";
                            scanning = false;
                        }
                    break;
                    case 5:
                        switch(str.charAt(pos)) {
                        case '?':
                            nonGreedy = true;
                            
                            ++pos;
                        break;
                        case '+':
                            errorCode = 8;
                            errorMessage = "Possessive quantifiers are not supported.";
                            
                            ++pos;
                        break;
                        }
                        
                        valid = true;
                        scanning = false;
                    break;
                    default:
                        errorCode = 7;
                        errorMessage = "A fatal error occured when scanning a repetition operator.";
                        scanning = false;
                    }
                }
                
                if(scanning && !valid) {
                    errorCode = 6;
                    errorMessage = "Not enough characters for parsing a repetition operator.";
                }
                
                this._result.set(
                    errorCode,
                    errorMessage,
                    pos,
                    (
                        errorCode === 0
                        ? ({
                            nonGreedy : nonGreedy,
                            range : new Interval(min, max)
                        })
                        : null
                    )
                );
                
                return this._result;
            };
            
            return PrimitiveScanner;
        }());
        
        RegexParser.ExpressionContext = (function () {
            /**
             * @memberof RegexParser
             * @constructor
             */
            var ExpressionContext = function () {
                this._opStack = [];
                this._termNodeStack = [];
                this._lastNodeType = -1;
            };
            
            /**
             * @function
             * @return {Number}
             */
            ExpressionContext.prototype.getTermNodeCount = function () {
                return this._termNodeStack.length;
            };
            
            /**
             * @function
             * @param {Number} opKey
             * @param {Array.<Object>} [staticArgs]
             */
            ExpressionContext.prototype.pushOperator = function (opKey) {
                if(!karbonator.isNonNegativeSafeInteger(opKey)) {
                    throw new TypeError("The parameter 'opKey' must be a non-negative safe integer.");
                }
                
                var opType = _opTypeMap.get(opKey);
                if(karbonator.isUndefinedOrNull(opType)) {
                    throw new Error("A fatal error has occured. Cannot find the operator type information.");
                }
                
                var op = new Operator(opType, arguments[1]);
                
                if(opType.getParameterCount() === 1) {
                    this._createAndPushOperatorNode(op);
                }
                else {
                    while(
                        //!this._error.occured
                        //&&
                        this._opStack.length > 0
                    ) {
                        var lastOp = this._opStack[this._opStack.length - 1];
                        var lastOpType = lastOp.getType();
                        if(
                            lastOpType.precedes(opType)
                            || (
                                opType.getAssociativity() === Associativity.leftToRight
                                && !opType.precedes(lastOpType)
                            )
                        ) {
                            this._createAndPushOperatorNode(lastOp);
                            this._opStack.pop();
                        }
                        else {
                            break;
                        }
                    }
                    
                    //if(!this._error.occured) {
                        this._opStack.push(op);
                        this._lastNodeType = AstNodeType.operator;
                    //}
                }
            };
            
            /**
             * @function
             * @param {Object} o
             */
            ExpressionContext.prototype.pushTerm = function (o) {
                if(
                    this._termNodeStack.length >= 1
                    && this._lastNodeType === AstNodeType.terminalRange
                ) {
                    this.pushOperator(OperatorTypeKeys.concatenation);
                }
                
                var termNode = null;
                if(o instanceof AstNode) {
                    termNode = o;
                }
                else if(o instanceof Interval) {
                    termNode = new AstNode(
                        AstNodeType.terminalRange,
                        [o]
                    );
                }
                else if(karbonator.isArray(o)) {
                    termNode = new AstNode(
                        AstNodeType.terminalRange,
                        o
                    );
                }
                
                if(null !== termNode) {
                    this._termNodeStack.push(termNode);
                    this._lastNodeType = AstNodeType.terminalRange;
                }
            };
            
            /**
             * @function
             * @return {AstNode|null}
             */
            ExpressionContext.prototype.evaluateAll = function () {
                while(this._opStack.length > 0) {
                    var op = this._opStack.pop();
                    this._createAndPushOperatorNode(op);
                }
                
                if(this._termNodeStack.length !== 1) {
                    //Error
                    throw new Error("There are some not calculated term nodes.");
                    
                    //return null;
                }
                else {
                    return this._termNodeStack.pop();
                }
            };
            
            /**
             * @private
             * @function
             * @param {Operator} op
             */
            ExpressionContext.prototype._createAndPushOperatorNode = function (op) {
                assertion.isInstanceOf(op, Operator);
                
                var opType = op.getType();
                
                var termNodeCount = this._termNodeStack.length;
                var paramCount = opType.getParameterCount();
                if(termNodeCount < paramCount) {
                    //Error
                    throw new Error("Not enough parameters.");
                }
                
                var opNode = new AstNode(AstNodeType.operator, op);
                var startTermNodeIndex = termNodeCount - paramCount;
                for(var i = startTermNodeIndex; i < termNodeCount; ++i) {
                    opNode.addChild(this._termNodeStack[i]);
                }
                this._termNodeStack.splice(startTermNodeIndex, paramCount);
                
                this._termNodeStack.push(opNode);
                
                //TODO : 코드 최적화
                if(paramCount === 2) {
                    var childNode = null;
                    
                    switch(opType.getAssociativity()) {
                    case Associativity.none:
                    break;
                    case Associativity.leftToRight:
                        childNode = opNode.getChildAt(0);
                        if(
                            !childNode.isRootOfGroup()
                            && childNode.getType() === AstNodeType.operator
                            && childNode.getValue().getType()[karbonator.equals](op.getType())
                            //A stub for static argument array comparison.
                            && (
                                op.getStaticArgumentCount() === 0
                                && childNode.getValue().getStaticArgumentCount() === 0
                            )
                        ) {
                            opNode.removeChildAt(0);
                            opNode.insertChildren(
                                childNode.removeAllChildren(),
                                0
                            );
                        }
                    break;
                    //TODO : 코드 검증
                    case Associativity.rightToLeft:
                        childNode = opNode.getChildAt(1);
                        if(
                            !childNode.isRootOfGroup()
                            && childNode.getType() === AstNodeType.operator
                            && childNode.getValue().getType()[karbonator.equals](op.getType())
                            //A stub for static argument array comparison.
                            && (
                                op.getStaticArgumentCount() === 0
                                && childNode.getValue().getStaticArgumentCount() === 0
                            )
                        ) {
                            opNode.removeChildAt(1);
                            opNode.insertChildren(
                                childNode.removeAllChildren(),
                                opNode.getChildCount()
                            );
                        }
                    break;
                    default:
                        throw new Error("An unknown associativity value of an operator has been found.");
                    }
                }
                
                this._lastNodeType = AstNodeType.terminalRange;
            };
            
            return ExpressionContext;
        }());
        
        /**
         * @function
         * @param {String} regexStr
         */
        RegexParser.prototype.inputString = function (regexStr) {
            this._regexStr = regexStr;
            this._regexLen = regexStr.length;
            
            this._initializeContext();
            this._parsing = true;
        };
        
        /**
         * @private
         * @function
         */
        RegexParser.prototype._initializeContext = function () {
            if(null === this._primitiveScanner) {
                this._primitiveScanner = new RegexParser.PrimitiveScanner();
            }
            
            this._exprCtxStack.length = 0;
            this._exprCtxStack.push(new RegexParser.ExpressionContext());
            this._pos = 0;
            this._error.occured = false;
        };
        
        /**
         * @function
         * @param {String} name
         * @return {AstNode}
         */
        RegexParser.prototype.createAst = function (name) {
            if(!karbonator.isString(name)) {
                throw new TypeError("The parameter must be a string representing the name of the regular expression.");
            }
            
            /*/////////////////////////////////////////////*/
            //1. infix to postfix 및 postfix 계산기 기법 활용
            //2. 반복 연산자는 연산자 스택에 넣지 말고
            //   가장 마지막으로 입력된 character-term에 대해 바로 연산을 수행 해서
            //   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
            //3. ')'가 입력되는 순간 '('까지의 모든 연산자들을 즉시 계산하고
            //   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
            //4. '('가 입력되면 concat 연산자를 먼저 push하고 '('를 스택에 push.
            //5. character-term이 입력되면 concat 연산자를 먼저 연산자 스택에 push하고
            //   입력된 character-term을 토큰 스택에 push.
            
            while(this._parsing && this._pos < this._regexLen) {
                var groupRootNode = null;
                var scannerResult = null;
                var exprCtx = this._getLastExpressionContext();
                var ch = this._regexStr.charAt(this._pos);
                switch(ch) {
                case '\r': case '\n':
                    //Skip those characters.
                break;
                case '^':
                    this._cancelParsing("Start of string meta character is not implemented yet...");
                break;
                case '$':
                    this._cancelParsing("End of string meta character is not implemented yet...");
                break;
                case '(':
                    this._exprCtxStack.push(new RegexParser.ExpressionContext());
                    
                    this._moveToNextIfNoError();
                break;
                case ')':
                    if(this._exprCtxStack.length >= 1) {
                        groupRootNode = exprCtx.evaluateAll();
                        if(null !== groupRootNode) {
                            groupRootNode.setRootOfGroup(true);
                            this._exprCtxStack.pop();
                            this._getLastExpressionContext().pushTerm(groupRootNode);
                            
                            this._moveToNextIfNoError();
                        }
                        else {
                            //Error - 
                            throw new Error("");
                        }
                    }
                    else {
                        //Error - 
                        throw new Error("");
                    }
                break;
                case '?': case '*':
                case '+': case '{':
                    scannerResult = this._primitiveScanner.scanRepetitionOperator(
                        this._regexStr,
                        this._pos
                    );
                    if(scannerResult.error.code === 0) {
                        exprCtx.pushOperator(
                            (
                                scannerResult.value.nonGreedy
                                ? OperatorTypeKeys.nonGreedyRepetition
                                : OperatorTypeKeys.repetition
                            ),
                            [scannerResult.value.range]
                        );
                        
                        this._pos = scannerResult.position;
                    }
                    else {
                        this._cancelParsing(scannerResult.error.message);
                    }
                break;
                case '}':
                    this._cancelParsing("An invalid token that specifies end of constrained repetition has been found.");
                break;
                case '|':
                    exprCtx.pushOperator(OperatorTypeKeys.alternation);
                    
                    this._moveToNextIfNoError();
                break;
                case '[':
                    this._cancelParsing("Character set is not implemented yet...");
                break;
                case ']':
                    this._cancelParsing("An invalid token that specifies end of a character set has been found.");
                break;
                case '\\':
                    scannerResult = this._primitiveScanner.scanEscapedCharacter(
                        this._regexStr,
                        this._pos
                    );
                    if(scannerResult.error.code === 0) {
                        exprCtx.pushTerm(scannerResult.value);
                        
                        this._pos = scannerResult.position;
                    }
                    else {
                        this._cancelParsing(scannerResult.error.message);
                    }
                break;
                case '.':
                    exprCtx.pushTerm(_constInterval.anyCharacters);
                    
                    this._moveToNextIfNoError();
                break;
                default:
                    exprCtx.pushTerm(
                        _createIntervalFromCharCode(
                            this._regexStr.charCodeAt(this._pos)
                        )
                    );
                    
                    this._moveToNextIfNoError();
                }
            }
            
            var astRootNode = null;
            var exprRootNode = null;
            if(this._parsing) {
                this._parsing = false;
                exprRootNode = this._getLastExpressionContext().evaluateAll();
            }
            
            if(null === exprRootNode) {
                this._cancelParsing(this._error.message);
            }
            else {
                //TODO : 토큰 맵에서 토큰 인덱스 찾아내기
                astRootNode = new AstNode(
                    AstNodeType.operator,
                    new Operator(
                        _opTypeMap.get(OperatorTypeKeys.accept),
                        [0]//name]
                    )
                );
                astRootNode.addChild(exprRootNode);
            }
            
            return astRootNode;
        };
        
        /**
         * @private
         * @function
         * @return {RegexParser.ExpressionContext}
         */
        RegexParser.prototype._getLastExpressionContext = function () {
            return this._exprCtxStack[this._exprCtxStack.length - 1];
        };
        
        /**
         * @private
         * @function
         */
        RegexParser.prototype._moveToNextIfNoError = function () {
            if(!this._error.occured) {
                ++this._pos;
            }
        };
        
        /**
         * @private
         * @function
         * @param {String} [message]
         * @param {Number} [position]
         */
        RegexParser.prototype._cancelParsing = function () {
            this._error = {
                occured : true,
                message : detail._selectNonUndefined(arguments[0], "An error occured."),
                position : detail._selectNonUndefined(arguments[1], this._pos)
            };
            
            this._parsing = false;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //InstructionBuffer
        
        /**
         * @constructor
         * @param {InstructionBuffer|Boolean} arg0
         */
        var InstructionBuffer = function (arg0) {
            if(arg0 instanceof InstructionBuffer) {
                this._byteOrderReversed = arg0._byteOrderReversed;
                this._lines = new Array(arg0._lines.length);
                for(var i = 0; i < arg0._lines.length; ++i) {
                    this._lines[i] = arg0._lines[i].slice();
                }
                
                this._lineAddrs = null;
            }
            else {
                this._byteOrderReversed = !!arg0;
                this._lines = [];
                
                this._lineAddrs = null;
            }
        };
        
        /**
         * @function
         * @return {Number}
         */
        InstructionBuffer.prototype.getCount = function () {
            return this._lines.length;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Array}
         * 
         */
        InstructionBuffer.prototype.getLineAt = function (index) {
            return this._lines[index];
        };
        
        /**
         * @function
         * @param {InstructionBuffer} rhs
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.add = function (rhs) {
            if(!(rhs instanceof InstructionBuffer)) {
                throw new TypeError("'rhs' must be an instanceof 'InstructionBuffer'.");
            }
            
            for(var i = 0, len = rhs._lines.length; i < len; ++i) {
                this._lines.push(rhs._lines[i]);
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {InstructionBuffer} rhs
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.consume = function (rhs) {
            this.add(rhs);
            
            rhs.clear();
            
            return this;
        };
        
        /**
         * @function
         * @param {RegexVm.Instruction} inst
         * @param {...Number} [operands]
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.put = function (inst) {
            if(!(inst instanceof RegexVm.Instruction)) {
                throw new TypeError("The parameter 'inst' must be an instance of 'RegexVm.Instruction.'.");
            }
            
            var line = [inst.getOpCode()];
            var args = Array.prototype.slice.call(arguments);
            for(var i = 1; i < args.length; ++i) {
                var arg = args[i];
                if(!karbonator.isNumber(arg)) {
                    throw new TypeError("Optional arguments must be numbers.");
                }
                
                line.push(arg);
            }
            
            this._lines.push(line);
            
            return this;
        };
        
        /**
         * @function
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.clear = function () {
            this._lines.length = 0;
            
            return this;
        };
        
        /**
         * @function
         * @param {Array.<karbonator.math.Interval>} intervals
         * @return {RegexVm.Bytecode}
         */
        InstructionBuffer.prototype.printBytecode = function (intervals) {
            var forkLineNdxes = [];
            
            var lineLen = this._lines.length;
            for(var i = 0; i < lineLen; ++i) {
                var line = this._lines[i];
                
                var inst = RegexVm.findInstructionByOpCode(line[0]);
                if(inst.getMnemonic() === "pfork") {
                    forkLineNdxes.push(i);
                }
                
                for(var j = 0; j < inst.getOperandCount(); ++j) {
                    if(inst.getOperandTypeAt(j) === RegexVm.OperandType.offset) {
                        var offset = line[j + 1];
                        
                        line[j + 1] = (
                            offset < 0
                            ? -this._calculateByteCount(i + offset + 1, i + 1)
                            : this._calculateByteCount(i + 1, i + offset + 1)
                        );
                    }
                    else if(inst.getOperandTypeAt(j) === RegexVm.OperandType.address) {
                        line[j + 1] = this._calculateByteCount(0, line[j + 1]);
                    }
                }
            }
            
            this._lineAddrs = new Array(this._lines.length);
            var codeBlock = new karbonator.ByteArray();
            for(var i = 0; i < lineLen; ++i) {
                var line = this._lines[i];
                this._lineAddrs[i] = codeBlock.getElementCount();
                
                var opCode = line[0] & 0xFF;
                codeBlock.pushBack(opCode);
                
                var inst = RegexVm.findInstructionByOpCode(opCode);
                for(var j = 0; j < inst.getOperandCount(); ++j) {
                    var opType = inst.getOperandTypeAt(j);
                    opType.valueToBytes(
                        line[j + 1],
                        this._byteOrderReversed,
                        codeBlock
                    );
                }
            }
            
            var forkKeys = new TreeSet(karbonator.numberComparator);
            for(var i = 0; i < forkLineNdxes.length; ++i) {
                forkKeys.add(this._lineAddrs[forkLineNdxes[i]]);
            }
            
            return new RegexVm.Bytecode(
                intervals,
                this._byteOrderReversed,
                codeBlock,
                forkKeys,
                this.toString()
            );
        };
        
        /**
         * @function
         * @return {String}
         */
        InstructionBuffer.prototype.toString = function () {
            var str = "";
            
            var offset = 0;
            for(var i = 0, len = this._lines.length; i < len; ++i) {
                var line = this._lines[i];
                var inst = RegexVm.findInstructionByOpCode(line[0]);
                
                str += offset + '\t';
                
                str += i + '\t';
                
                str += inst.getMnemonic();
                
                for(var j = 1; j < line.length; ++j) {
                    str += ' ';
                    str += line[j];
                }
                
                str += "\r\n";
                
                offset += inst.getSize();
            };
            
            return str;
        };
        
        /**
         * @param {Number} startLineIndex
         * @param {Number} endLineIndex
         * @returns {Number}
         */
        InstructionBuffer.prototype._calculateByteCount = function (
            startLineIndex,
            endLineIndex
        ) {
            if(startLineIndex < 0) {
                throw new RangeError("'startLineIndex' can not be less than zero.");
            }
            
            return this._lines
                .slice(startLineIndex, endLineIndex)
                .reduce(
                    function (acc, line) {
                        return acc + RegexVm.findInstructionByOpCode(line[0]).getSize();
                    },
                    0
                )
            ;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //CodeEmitter
        
        /**
         * @constructor
         */
        var CodeEmitter = function () {
            this._intervalListSet = new ListSet(_edgeComparator);
            this._nodeCodeMap = new ListMap(
                function (l, r) {
                    return (l === r ? 0 : -1);
                }
            );
            
            this._byteOrderReversed = true;
            this._rootNode = null;
        };
        
        /**
         * @function
         * @param {AstNode} rootNode
         * @return {RegexVm.Bytecode} 
         */
        CodeEmitter.prototype.emitCode = function (rootNode) {
            if(!(rootNode instanceof AstNode)) {
                throw new TypeError("The parameter must be an instance of 'AstNode'.");
            }
            
            this._intervalListSet.clear();
            this._nodeCodeMap.clear();
            this._rootNode = rootNode;
            
            for(
                var iter = this._rootNode.beginPostfix(),
                endIter= this._rootNode.endPostfix();
                !iter[karbonator.equals](endIter);
                iter.moveToNext()
            ) {
                this._processNode(iter.dereference());
            }
            
            var instBuffer = this._nodeCodeMap.get(rootNode);
            
            return instBuffer.printBytecode(
                Array.from(this._intervalListSet)
            );
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         */
        CodeEmitter.prototype._processNode = function (node) {
            if(this._nodeCodeMap.has(node)) {
                throw new Error("The node has been already processed.");
            }
            
            var buffer = null;
            switch(node.getType()) {
            case AstNodeType.operator:
                var op = node.getValue();
                switch(op.getType().getKey()) {
                case OperatorTypeKeys.accept:
                    buffer = this._visitAccept(node, op.getStaticArguments()[0]);
                break;
                case OperatorTypeKeys.regexAlternation:
                case OperatorTypeKeys.alternation:
                    buffer = this._visitAlternation(node);
                break;
                case OperatorTypeKeys.concatenation:
                    buffer = this._visitConcatenation(node);
                break;
                case OperatorTypeKeys.repetition:
                case OperatorTypeKeys.nonGreedyRepetition:
                    buffer = this._visitRepetition(node, op.getStaticArguments()[0]);
                break;
                default:
                    throw new Error("An unknown operator has been found.");
                }
            break;
            case AstNodeType.terminalRange:
                buffer = this._visitTerminalRange(node);
            break;
            default:
                throw new Error("Not implemented yet...");
            }
            
            this._nodeCodeMap.set(node, buffer);
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @return {InstructionBuffer}
         */
        CodeEmitter.prototype._visitTerminalRange = function (node) {
            var buffer = new InstructionBuffer(this._byteOrderReversed);
            
            var inputRanges = node.getValue();
            
            var count = inputRanges.length;
            if(count < 1) {
                throw new Error("A list of terminal input range must have at least 1 range.");
            }
            
            for(var i = 0; i < count; ++i) {
                var inputRange = inputRanges[i];
                if(inputRange.getMinimum() === inputRange.getMaximum()) {
                    buffer.put(
                        RegexVm.Instruction.testCode,
                        inputRange.getMinimum()
                    );
                }
                else {
                    this._intervalListSet.add(inputRange);
                    buffer.put(
                        RegexVm.Instruction.testRange,
                        this._intervalListSet.findIndex(inputRange)
                    );
                }
                
                if(i < count - 1) {
                    buffer.put(RegexVm.Instruction.beq, ((count - 1 - i) << 1) - 1);
                }
            }
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @param {Number} tokenKey
         * @return {InstructionBuffer}
         */
        CodeEmitter.prototype._visitAccept = function (node, tokenKey) {
            var buffer = new InstructionBuffer(this._byteOrderReversed);
            
            this._consumeCode(buffer, node, 0);
            
            //TODO : consume 명령어를 넣는 것이 타당한 지 테스트.
            buffer.put(RegexVm.Instruction.bne, 2);
            buffer.put(RegexVm.Instruction.consume);
            buffer.put(RegexVm.Instruction.accept, tokenKey);
            buffer.put(RegexVm.Instruction.rts);
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @return {InstructionBuffer}
         */
        CodeEmitter.prototype._visitAlternation = function (node) {
            var buffer = new InstructionBuffer(this._byteOrderReversed);
            
            var offsetInfo = this._caculateSumOfChildCodeOffset(node);
            var offset = offsetInfo.sum;
            var childCount = node.getChildCount();
            var codeLen = 2;
            for(var i = 0; i < childCount - 1; ++i) {
                offset -= offsetInfo.lengths[i];
                
                buffer.put(RegexVm.Instruction.pfork, 0, offsetInfo.lengths[i] + 1);
                this._consumeCode(buffer, node, i);
                buffer.put(RegexVm.Instruction.bra, (childCount - 2 - i) * codeLen + offset);
            }
            if(i < childCount) {
                this._consumeCode(buffer, node, i);
            }
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @return {InstructionBuffer}
         */
        CodeEmitter.prototype._visitConcatenation = function (node) {
            var buffer = new InstructionBuffer(this._byteOrderReversed);
            
            var childCount = node.getChildCount();
            for(var i = 0; i < childCount - 1; ++i) {
                this._consumeCode(buffer, node, i);
                buffer.put(RegexVm.Instruction.bne, 0.1);
            }
            
            if(i < childCount) {
                this._consumeCode(buffer, node, i);
            }
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @param {karbonator.math.Interval} repRange
         * @return {InstructionBuffer}
         */
        CodeEmitter.prototype._visitRepetition = function (node, repRange) {
            var buffer = new InstructionBuffer(this._byteOrderReversed);
            
            var minRep = repRange.getMinimum();
            switch(minRep) {
            case 0:
            break;
            case 1:
                this._addCode(buffer, node, 0);
                buffer.put(RegexVm.Instruction.bne, 0.1);
            break;
            default:
                //TODO : A stub. Must be optimized by using repetition bytecodes.
                for(var i = 0; i < minRep; ++i) {
                    this._addCode(buffer, node, 0);
                    buffer.put(RegexVm.Instruction.bne, 0.1);
                }
            }
            
            var maxRep = repRange.getMaximum();
            if(maxRep >= _maxInt) {
                var offset = this._nodeCodeMap.get(node.getChildAt(0)).getCount();
                
                if(node.getValue().getType().getKey() !== OperatorTypeKeys.nonGreedyRepetition) {
                    buffer.put(RegexVm.Instruction.pfork, 0, offset + 2);
                }
                else {
                    buffer.put(RegexVm.Instruction.pfork, offset + 2, 0);
                }
                
                this._consumeCode(buffer, node, 0);
                buffer.put(RegexVm.Instruction.bne, 0.1);
                buffer.put(RegexVm.Instruction.bra, -(offset + 3));
            }
            else if(minRep !== maxRep) {
                //var optRepCount = repRange.getMaximum() - repRange.getMinimum();
                
                throw new Error("Not implemented yet...");
            }
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {InstructionBuffer} buffer
         * @param {AstNode} parentNode
         * @param {Number} childIndex
         * @returns {InstructionBuffer}
         */
        CodeEmitter.prototype._addCode = function (buffer, parentNode, childIndex) {
            var childCode = new InstructionBuffer(
                this._nodeCodeMap.get(parentNode.getChildAt(childIndex))
            );
            this._fillLabelAddress(childCode, childCode.getCount(), 0.1);
            buffer.consume(childCode);
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {InstructionBuffer} buffer
         * @param {AstNode} parentNode
         * @param {Number} childIndex
         * @returns {InstructionBuffer}
         */
        CodeEmitter.prototype._consumeCode = function (buffer, parentNode, childIndex) {
            var childCode = this._nodeCodeMap.get(parentNode.getChildAt(childIndex));
            this._fillLabelAddress(childCode, childCode.getCount(), 0.1);
            buffer.consume(childCode);
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {InstructionBuffer} buffer
         * @param {Number} labelAddress
         * @param {Number} placeholderValue
         * @param {Number} [epsilon]
         * @returns {InstructionBuffer}
         */
        CodeEmitter.prototype._fillLabelAddress = function (
            buffer,
            labelAddress,
            placeholderValue
        ) {
            var epsilon = arguments[3];
            if(karbonator.isUndefined(epsilon)) {
                epsilon = karbonator.math.epsilon;
            }
            
            for(var i = 0, lineCount = buffer.getCount(); i < lineCount; ++i) {
                --labelAddress;
                
                var line = buffer.getLineAt(i);
                
                //함수 마지막 부분으로 점프하는 모든 레이블 조사
                var inst = RegexVm.findInstructionByOpCode(line[0]);
                for(var j = 0; j < inst.getOperandCount(); ++j) {
                    var param = line[j + 1];
                    if(
                        inst.getOperandTypeAt(j) === RegexVm.OperandType.offset
                        && !karbonator.isNonNegativeSafeInteger(param)
                        && karbonator.math.numberEquals(param, placeholderValue, epsilon)
                    ) {
                        line[j + 1] = labelAddress;
                    }
                }
            }
            
            return buffer;
        };
        
        /**
         * @private
         * @function
         * @param {AstNode} node
         * @returns {Object}
         */
        CodeEmitter.prototype._caculateSumOfChildCodeOffset = function (node) {
            var childCodeLens = [];
            var sumOfOffset = 0;
            for(var i = 0, childCount = node.getChildCount(); i < childCount; ++i) {
                var len = this._nodeCodeMap.get(node.getChildAt(i)).getCount();
                childCodeLens.push(len);
                sumOfOffset += len;
            }
            
            return ({
                sum : sumOfOffset,
                lengths : childCodeLens
            });
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //Token
        
        /**
         * @constructor
         * @param {String} name
         * @param {String} regexStr
         * @param {AstNode} astRootNode
         */
        var Token = function (name, regexStr, astRootNode) {
            this._name = name;
            this._regexStr = regexStr;
            this._astRootNode = astRootNode;
        };
        
        /**
         * @function
         * @return {String}
         */
        Token.prototype.toString = function () {
            var str = '{';
            
            str += "name";
            str += " : ";
            str += this._name;
            
            str += "regex";
            str += " : ";
            str += this._regexStr;
            
            str += "ast";
            str += " : ";
            str += this._astRootNode;
            
            str += '}';
            
            return str;
        };
        
        /*////////////////////////////////*/
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var LexerGenerator = function () {
            this._tokenMap = new Map(karbonator.stringComparator);
            this._regexParser = new RegexParser();
            this._bytecodeEmitter = new CodeEmitter();
        };
        
        /**
         * @function
         * @return {Number}
         */
        LexerGenerator.prototype.getTokenCount = function () {
            return this._tokenMap.getElementCount();
        };
        
        /**
         * @function
         * @param {String} name
         * @return {Token|undefined}
         */
        LexerGenerator.prototype.getToken = function (name) {
            return this._tokenMap.get(name);
        };
        
        /**
         * @function
         * @param {String} name
         * @param {String} regexStr
         */
        LexerGenerator.prototype.defineToken = function (name, regexStr) {
            this._regexParser.inputString(regexStr);
            var astRootNode = this._regexParser.createAst(name);
            
            if(null === astRootNode) {
                throw new Error(this._regexParser._error.message);
            }
            
            this._tokenMap.set(name, new Token(name, regexStr, astRootNode));
        };
        
        /**
         * @function
         * @param {String} name
         */
        LexerGenerator.prototype.undefineToken = function (name) {
            this._tokenMap.remove(name);
        };
        
        /**
         * @function
         * @return {karbonator.string.Lexer|null}
         */
        LexerGenerator.prototype.generateLexer = function () {
            //TODO : 
            //[V] 1. 모든 Ast를 하나의 root 노드로 통합.
            //[-] 2. Ast 최적화
            //[ ] 3. VmCode 방출
            
            var lexer = new string.Lexer();
            
            var regexStr = "";
            
            var rootNode = null;
            if(this._tokenMap.getElementCount() >= 2) {
                rootNode = new AstNode(
                    AstNodeType.operator,
                    new Operator(
                        _opTypeMap.get(OperatorTypeKeys.regexAlternation)
                    )
                );
                for(
                    var i = this._tokenMap.values(), iP = i.next();
                    !iP.done;
                    iP = i.next()
                ) {
                    regexStr += (regexStr === "" ? "" : "||") + iP.value._regexStr;
                    rootNode.addChild(iP.value._astRootNode);
                }
            }
            else {
                regexStr = this._tokenMap.values().next().value._regexStr;
                rootNode = this._tokenMap.values().next().value._astRootNode;
            }
            
            lexer._regexVm._bytecode = this._bytecodeEmitter.emitCode(rootNode);
            lexer._regexVm._bytecode._regexStr = regexStr;
            
            return lexer;
        };
        
        return LexerGenerator;
    }());
    
    return karbonator;
})
));
