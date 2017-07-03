/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
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
        g.define(["./karbonator.collection"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("./karbonator.collection"));
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    var detail = karbonator.detail;
    var collection = karbonator.collection;
    var assertion = karbonator.assertion;
    
    var Array = global.Array;
    var Symbol = detail._selectSymbol();
    
    var TreeMap = collection.TreeMap;
    var ListMap = collection.ListMap;
    var ListSet = collection.ListSet;
    
    var ByteArray = karbonator.ByteArray;
    var BitConverter = karbonator.BitConverter;
    var Interval = karbonator.math.Interval;
    var Set = collection.ListSet;
    var Map = collection.ListMap;
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var _minInt = karbonator.minimumSafeInteger;
    
    var _maxInt = karbonator.maximumSafeInteger;
    
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
    
    /**
     * @function
     * @param {Interval} o
     */
    var _assertIsInterval = function (o) {
        if(!(o instanceof Interval)) {
            throw new TypeError("A instance of 'Interval' must be passed.");
        }
    };
    
    /**
     * @function
     * @param {Array.<Interval>} o
     */
    var _assertIsArrayOfIntervals = function (o) {
        if(!karbonator.isArray(o)) {
            throw new TypeError("An array of 'Interval's must be passed.");
        }
        
        for(var i = 0; i < o.length; ++i) {
            var elem = o[i];
            if(!(elem instanceof Interval)) {
                throw new TypeError("An array of 'Interval's must be passed.");
            }
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
    ScannerResult.prototype.set = function (errorCode, errorMessage, position, value) {
        this.error.code = errorCode;
        this.error.message = errorMessage;
        this.position = position;
        this.value = value;
    };
    
    /*////////////////////////////////*/
    
    var RegexVm = (function () {
        /**
         * @constructor
         * @param {Number} returnAddress
         */
        var StackFrame = function (returnAddress) {
            this._returnAddress = returnAddress;
            this._repStack = [];
        };
        
        /**
         * @constructor
         */
        var RegexVm = function () {
            this._inStr = "";
            
            this._bytecode = null;
            this._bitCvrt = null;
            
            this._pc = 0;
            this._consumePtr = 0;
            this._zFlag = false;
            this._acceptedTokenKey = -1;
            this._cursorStack = [];
            this._stackFrameStack = [];
        };
        
        /*////////////////////////////////*/
        //RegexVm.OperandType
        
        /**
         * @memberof RegexVm
         * @constructor
         * @param {Number} key
         * @param {String} name
         * @param {Number} byteCount
         */
        var OperandType = function (key, name, byteCount) {
            if(!karbonator.isNonNegativeSafeInteger(key)) {
                throw new TypeError("The parameter 'key' must be a non-negative safe integer.");
            }
            if(!karbonator.isString(name)) {
                throw new TypeError("The parameter 'name' must be a string.");
            }
            if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
                throw new TypeError("The parameter 'byteCount' must be a non-negative integer.");
            }
//            if(!karbonator.isFunction(byteReader)) {
//                throw new TypeError("The parameter 'byteReader' must be a function.");
//            }
            
            this._key = key;
            this._name = name;
            this._byteCount = byteCount;
            //this._byteReader = byteReader;
        };
        
        /**
         * @function
         * @return {Number}
         */
        OperandType.prototype.getKey = function () {
            return this._key;
        };
        
        /**
         * @function
         * @return {String}
         */
        OperandType.prototype.getName = function () {
            return this._name;
        };
        
        /**
         * @function
         * @return {Number}
         */
        OperandType.prototype.getByteCount = function () {
            return this._byteCount;
        };
        
//        /**
//         * @function
//         * @param {karbonator.ByteArray} byteArray
//         * @param {Number} [startIndex=0]
//         * @return {*}
//         */
//        OperandType.prototype.readBytes = function (byteArray) {
//            return this._byteReader.call(this, byteArray, arguments[1]);
//        };
        
        /**
         * @memberof
         * @readonly
         * @enum {Number}
         */
        OperandType.keys = {
            uint16 : 0,
            int32 : 1,
            uint32 : 2
        };
        
        /**
         * @memberof RegexVm.OperandType
         */
        OperandType.int16 = new OperandType(
            OperandType.keys.uint16, "int16", 2
        );
        
        /**
         * @memberof RegexVm.OperandType
         */
        OperandType.int32 = new OperandType(
            OperandType.keys.int32, "int32", 4
        );
        
        /**
         * @memberof RegexVm.OperandType
         */
        OperandType.uint32 = new OperandType(
            OperandType.keys.uint32, "uint32", 4
        );
        
        RegexVm.OperandType = OperandType;
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //RegexVm.Instruction
        
        /**
         * @memberof RegexVm
         * @constructor
         * @param {Number} opCode
         * @param {Array.<Number>} operandSizes
         * @param {String} mnemonic
         * @param {Function} action
         */
        var Instruction = function (opCode, operandSizes, mnemonic, action) {
            if(!karbonator.isNonNegativeSafeInteger(opCode)) {
                throw new TypeError("The parameter 'opCode' must be a non-negative integer.");
            }
            if(null !== operandSizes && !karbonator.isArray(operandSizes)) {
                throw new TypeError("The parameter 'operandSizes' must be an array of 'Number'.");
            }
            if(!karbonator.isString(mnemonic)) {
                throw new TypeError("The parameter 'mnemonic' must be a string.");
            }
            if(!karbonator.isFunction(action)) {
                throw new TypeError("The parameter 'action' must be a function.");
            }
            
            this._opCode = opCode;
            this._operandSizes = (null === operandSizes ? [] : Array.from(operandSizes));
            this._mnemonic = mnemonic;
            this._action = action;
        };
        
        /**
         * @function
         * @return {Number}
         */
        Instruction.prototype.getOpCode = function () {
            return this._opCode;
        };
        
        /**
         * @function
         * @return {Number}
         */
        Instruction.prototype.getOperandCount = function () {
            return this._operandSizes.length;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Number}
         */
        Instruction.prototype.getOperandSizeAt = function (index) {
            if(
                !karbonator.isNonNegativeSafeInteger(index)
                || index >= this._operandTypes.length
            ) {
                throw new RangeError("Index out of range.");
            }
            
            return this._operandSizes[index];
        };
        
        /**
         * @function
         * @return {String}
         */
        Instruction.prototype.getMnemonic = function () {
            return this._mnemonic;
        };
        
        /**
         * @function
         * @param {RegexVm} vm
         */
        Instruction.prototype.doAction = function (vm) {
            this._action(vm);
        };
        
        /**
         * @function
         * @return {String}
         */
        Instruction.prototype.toString = function () {
            var str = '{';
            
            str += "opCode";
            str += " : ";
            str += this._opCode.toString(16);
            
            str += ", ";
            str += "operandSizes";
            str += " : ";
            str += '[' + this._operandSizes + ']';
            
            str += ", ";
            str += "mnemonic";
            str += " : ";
            str += '\"' + this._mnemonic + '\"';
            
            str += '}';
            
            return str;
        };
        
        RegexVm.Instruction = Instruction;
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //RegexVm.Bytecode
        
        /**
         * @memberof RegexVm
         * @constructor
         * @param {iterable} intervals
         * @param {Boolean} littleEndian
         * @param {karbonator.ByteArray} codeBlock
         */
        var Bytecode = function (intervals, littleEndian, codeBlock) {
            if(!karbonator.isEsIterable(intervals)) {
                throw new TypeError("The parameter 'intervals' must have the property 'Symbol.iterator'.");
            }
            if(!(codeBlock instanceof ByteArray)) {
                throw new TypeError("The parameter 'codeBlock' must be an instance of 'karbonator.ByteArray'.");
            }
            
            this._intervals = Array.from(intervals);
            this._littleEndian = !!littleEndian;
            this._codeBlock = ByteArray.from(codeBlock);
        };
        
        RegexVm.Bytecode = Bytecode;
        
        /*////////////////////////////////*/
        
        /**
         * @memberof RegexVm
         * @private
         * @readonly
         */
        RegexVm._opCodeInstMap = new collection.TreeMap(
            karbonator.numberComparator,
            Array.from(
                [
                    new Instruction(
                        0x00,
                        null,
                        "nop",
                        function () {}
                    ),
                    new Instruction(
                        0x01,
                        [2],
                        "bra",
                        function (vm) {
                            vm._pc += vm._readInt32();
                        }
                    ),
                    new Instruction(
                        0x02,
                        [2],
                        "bne",
                        function (vm) {
                            if(!vm._zFlag) {
                                vm._pc += vm._readInt32();
                            }
                        }
                    ),
                    new Instruction(
                        0x03,
                        [2],
                        "beq",
                        function (vm) {
                            if(vm._zFlag) {
                                vm._pc += vm._readInt32();
                            }
                        }
                    ),
                    new Instruction(
                        0x04,
                        [4],
                        "jsr",
                        function (vm) {
                            vm._stackFrameStack.push(
                                new StackFrame(vm._pc)
                            );
                            
                            vm._pc = vm._readUint32();
                        }
                    ),
                    new Instruction(
                        0x05,
                        [4],
                        "jmp",
                        function (vm) {
                            vm._pc = vm._readInt32();
                        }
                    ),
                    new Instruction(
                        0x06,
                        [4],
                        "accept",
                        function (vm) {
                            vm._acceptedTokenKey = vm._readUint32();
                            
                            vm._stackFrameStack.length = 0;
                        }
                    ),
                    new Instruction(
                        0x07,
                        null,
                        "rts",
                        function (vm) {
                            vm._pc = vm._getStackFrame()._returnAddress;
                            vm._stackFrameStack.pop();
                        }
                    ),
                    new Instruction(
                        0x08,
                        null,
                        "skip",
                        function (vm) {
                            vm._consumePtr = vm._getCursor();
                        }
                    ),
                    new Instruction(
                        0x09,
                        null,
                        "consume",
                        function (vm) {
                            for(var i = vm._consumePtr; i < vm._getCursor(); ++i) {
                                vm._consumedValues.push(vm._inStr.charCodeAt(i));
                            }
                        }
                    ),
                    new Instruction(
                        0x0A,
                        null,
                        "clear.z",
                        function (vm) {
                            vm._zFlag = false;
                        }
                    ),
                    new Instruction(
                        0x0B,
                        null,
                        "set.z",
                        function (vm) {
                            vm._zFlag = true;
                        }
                    ),
                    new Instruction(
                        0xC,
                        [4],
                        "test.input.code",
                        function (vm) {
                            vm._zFlag = (vm._readUint32() === vm._inStr.charCodeAt(vm.getCursor()));
                        }
                    ),
                    new Instruction(
                        0x0D,
                        [4],
                        "test.input.range",
                        function (vm) {
                            vm._zFlag = vm._getIntervalAt(vm._readUint32()).contains(vm._inStr.charCodeAt(vm._getCursor()));
                        }
                    ),
                    new Instruction(
                        0x0E,
                        [4],
                        "test.rep",
                        function (vm) {
                            vm._zFlag = (vm._readUint32() === vm._getRepetition());
                        }
                    ),
                    new Instruction(
                        0x0F,
                        [4],
                        "reserved01",
                        function () {}
                    ),
                    new Instruction(
                        0x10,
                        null,
                        "inc.rep",
                        function (vm) {
                            vm._increaseRepetition();
                        }
                    ),
                    new Instruction(
                        0x11,
                        null,
                        "inc.cur",
                        function (vm) {
                            vm._increaseCursor();
                        }
                    ),
                    new Instruction(
                        0x12,
                        null,
                        "begin.rep",
                        function (vm) {
                            vm._pushRepetition();
                        }
                    ),
                    new Instruction(
                        0x13,
                        null,
                        "push.cur",
                        function (vm) {
                            vm._pushCursor();
                        }
                    ),
                    new Instruction(
                        0x14,
                        null,
                        "end.rep",
                        function (vm) {
                            vm._popReptition();
                        }
                    ),
                    new Instruction(
                        0x15,
                        null,
                        "pop.cur",
                        function (vm) {
                            vm._popCursor();
                        }
                    ),
                    new Instruction(
                        0x16,
                        null,
                        "reserved02",
                        function () {}
                    ),
                    new Instruction(
                        0x17,
                        null,
                        "collapse.cur",
                        function (vm) {
                            vm._collapseCursor();
                        }
                    )
                ],
                function (current) {
                    return [current.getOpCode(), current];
                }
            )
        );
        
        /**
         * @memberof RegexVm
         * @readonly
         * @enum {RegexVm.Instruction}
         */
        RegexVm.Instructions = karbonator.appendAsMember(
            {},
            Array.from(
                RegexVm._opCodeInstMap,
                function (current) {
                    var instObj = current[1];
                    var propKey = instObj.getMnemonic().replace(
                        /(\.[a-z0-9][a-z0-9]*)/g,
                        function (str) {
                            var rest = (str.length >= 3 ? str.substring(2) : "");
                            var first = str.charAt(1).toUpperCase();
                            return first + rest;
                        }
                    );
                    
                    return [propKey, instObj];
                }
            )
        );
        
        RegexVm.prototype.initialize = function (str) {
            this._inStr = str;
            
            this._bytecode = arguments[1];
            this._bitCvrt = new BitConverter();
            this._bitCvrt.setByteOrderReversed(this._bytecode._littleEndian);
            
            this._pc = 0;
            this._consumePtr = 0;
            this._zFlag = false;
            this._acceptedTokenKey = -1;
            this._cursorStack.length = 0;
            this._cursorStack.push(0);
            this._stackFrameStack.length = 0;
            this._stackFrameStack.push(new StackFrame(0));
            this._consumedValues = [];
        };
        
        RegexVm.prototype.executeAll = function () {
            
        };
        
        //TODO : Instruction enum 정리
        RegexVm.prototype.executeNext = function () {
            var operand = 0;
            
            var opCode = this._bytecode._codeBlock.get(this._pc);
            ++this._pc;
            
            var inst = RegexVm._opCodeInstMap.get(opCode);
            if(karbonator.isUndefined(inst)) {
                throw new Error("An invalid opcode has been found.");
            }
            
            inst.doAction(this);
        };
        
        /**
         * @private
         * @function
         * @return {Number}
         */
        RegexVm.prototype._readInt16 = function () {
            var value = this._bitCvrt.getInt16FromBytes(
                this._bytecode._codeBlock,
                this._pc
            );
            this._pc += 2;
            
            return value;
        };
        
        /**
         * @private
         * @function
         * @return {Number}
         */
        RegexVm.prototype._readInt32 = function () {
            var value = this._bitCvrt.getInt32FromBytes(
                this._bytecode._codeBlock,
                this._pc
            );
            this._pc += 4;
            
            return value;
        };
        
        /**
         * @private
         * @function
         * @return {Number}
         */
        RegexVm.prototype._readUint32 = function () {
            var value = this._bitCvrt.getUint32FromBytes(
                this._bytecode._codeBlock,
                this._pc
            );
            this._pc += 4;
            
            return value;
        };
        
        /**
         * @private
         * @function
         * @param {Number} index
         * @return {karbonator.math.Interval}
         */
        RegexVm.prototype._getIntervalAt = function (index) {
            return this._bytecode._intervals[index];
        };
        
        /**
         * @private
         * @function
         * @return {StackFrame}
         */
        RegexVm.prototype._getStackFrame = function () {
            return this._stackFrameStack[this._stackFrameStack.length - 1];
        };
        
        /**
         * @private
         * @function
         * @return {Array.<Number>}
         */
        RegexVm.prototype._getRepetitionStack = function () {
            return this._getStackFrame()._repStack;
        };
        
        /**
         * @private
         * @function
         * @return {Number}
         */
        RegexVm.prototype._getRepetition = function () {
            var repStack = this._getRepetitionStack();
            
            return repStack[repStack.length - 1];
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._increaseRepetition = function () {
            var repStack = this._getRepetitionStack();
            
            ++repStack[repStack.length - 1];
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._pushRepetition = function () {
            this._getRepetitionStack().push(this._getRepetition());
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._popReptition = function () {
            this._getRepetitionStack().pop();
        };
        
        /**
         * @private
         * @function
         * @return {Number}
         */
        RegexVm.prototype._getCursor = function () {
            return this._cursorStack[this._cursorStack.length - 1];
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._increaseCursor = function () {
            ++this._cursorStack[this._cursorStack.length - 1];
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._pushCursor = function () {
            this._cursorStack.push(this._getCursor());
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._popCursor = function () {
            this._cursorStack.pop();
        };
        
        /**
         * @private
         * @function
         */
        RegexVm.prototype._collapseCursor = function () {
            var current = this._cursorStack.pop();
            this._cursorStack[this._cursorStack.length - 1] = current;
        };
        
        return RegexVm;
    }());
    
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
        
        /**
         * @private
         * @function
         * @param {String} name
         * @param {Nfa} fa
         * @param {String} regexStr
         */
        Lexer.prototype._addToken = function (name, fa, regexStr) {
            this._tokenMap.set(name, new Token(name, fa, regexStr));
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
            CppPrefixIterator.prototype.tryMoveToNext = function () {
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
             * @param {CppPrefixIterator} rhs
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
                        lhsIter.tryMoveToNext();
                        rhsIter.tryMoveToNext();
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
            
            this.traverseByPostfix(
                function (node) {
                    this.str += this.toStringFunc(node);
                    this.str += "\r\n";
                },
                context
            );
            
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
            nonGreedyRepetition : 5,
            terminalRangeSetMatch : 6
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
                            intervals.push(_constInterval.whiteSpaces);
                        break;
                        case 'S':
                            intervals.concat(_constIntervalSet.nonWhiteSpaces);
                        break;
                        case 'w':
                            intervals.concat(_constIntervalSet.word);
                        break;
                        case 'W':
                            intervals.concat(_constIntervalSet.nonWord);
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
                        if(str.charAt(pos) === '?') {
                            nonGreedy = true;
                            
                            ++pos;
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
                        o
                    );
                }
                else if(karbonator.isArray(o)) {
                    //TODO : 코드 작성
                    throw new Error("Write some proper codes!");
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
                    this._updateErrorAndStopParsing("Start of string meta character is not implemented yet...");
                break;
                case '$':
                    this._updateErrorAndStopParsing("End of string meta character is not implemented yet...");
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
                        this._updateErrorAndStopParsing(scannerResult.error.message);
                    }
                break;
                case '}':
                    this._updateErrorAndStopParsing("An invalid token that specifies end of constrained repetition has been found.");
                break;
                case '|':
                    exprCtx.pushOperator(OperatorTypeKeys.alternation);
                    
                    this._moveToNextIfNoError();
                break;
                case '[':
                    this._updateErrorAndStopParsing("Character set is not implemented yet...");
                break;
                case ']':
                    this._updateErrorAndStopParsing("An invalid token that specifies end of a character set has been found.");
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
                        this._updateErrorAndStopParsing(scannerResult.error.message);
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
                this._updateErrorAndStopParsing("An unknown parsing token error has been occured.");
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
        RegexParser.prototype._updateErrorAndStopParsing = function () {
            this._error = {
                occured : true,
                message : detail._selectNonUndefined(arguments[1], "An error occured."),
                position : detail._selectNonUndefined(arguments[2], this._pos)
            };
            
            this._parsing = false;
        };
        
        /*////////////////////////////////*/
        
        /*////////////////////////////////*/
        //InstructionBuffer
        
        /**
         * @constructor
         * @param {Boolean} byteOrderReversed
         */
        var InstructionBuffer = function (byteOrderReversed) {
            this._byteOrderReversed = byteOrderReversed;
//            this._bitCvrt = new BitConverter();
//            this._bitCvrt.setByteOrderReversed(this._byteOrderReversed);
            
            this._insts = [];
        };
        
        /**
         * @function
         * @return {Number}
         */
        InstructionBuffer.getCount = function () {
            return this._insts.length;
        };
        
        /**
         * @function
         * @param {InstructionBuffer} rhs
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.consume = function (rhs) {
            for(var i = 0, len = rhs._insts.length; i < len; ++i) {
                this._insts.push(rhs._insts[i]);
            }
            
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
            
            var args = Array.of(arguments);
            for(var i = 1; i < args.length; ++i) {
                if(!karbonator.isNumber(args[i])) {
                    throw new TypeError("Optional arguments must be numbers.");
                }
            }

            this._insts.push(inst.getOpCode());
            for(var i = 1; i < args.length; ++i) {
                this._insts.push(args[i]);
            }
            
            return this;
        };
        
        /**
         * @function
         * @return {InstructionBuffer}
         */
        InstructionBuffer.prototype.clear = function () {
            this._insts.length = 0;
            
            return this;
        };
        
        /**
         * @function
         * @return {karbonator.ByteArray}
         */
        InstructionBuffer.prototype.printCodeBlock = function () {
            var codeBlock = new ByteArray();
            
            debugger;
            //TODO : 메소드 작성
            
            return codeBlock;
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
        CodeEmitter.prototype.emitBytecode = function (rootNode) {
            if(!(rootNode instanceof AstNode)) {
                throw new TypeError("The parameter must be an instance of 'AstNode'.");
            }
            
            this._intervalListSet.clear();
            this._nodeCodeMap.clear();
            this._rootNode = rootNode;
            
            for(
                var iter = this._rootNode.beginPrefix(),
                endIter= this._rootNode.endPrefix();
                !iter[karbonator.equals](endIter);
                iter.tryMoveToNext()
            ) {
                this._processNode(iter.dereference());
            }
            
            var instBuffer = this._nodeCodeMap.get(rootNode);
            var codeBlock = instBuffer.printCodeBlock();
            
            return new RegexVm.Bytecode(
                Array.from(this._intervalListSet),
                this._byteOrderReversed,
                codeBlock
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
                    buffer = this._visitRepetition(node, op.getStaticArguments()[0]);
                break;
                case OperatorTypeKeys.nonGreedyRepetition:
                    throw new Error("Not implemented yet...");
                break;
                case OperatorTypeKeys.terminalRangeSetMatch:
                    throw new Error("Not implemented yet...");
                break;
                default:
                    throw new Error("An unknown operator has been found.");
                }
            break;
            case AstNodeType.terminalRange:
                buffer = this._visitRepetition(node);
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
            
            var inputRange = node.getValue();
            if(inputRange.getMinimum() === inputRange.getMaximum()) {
                buffer.put(
                    RegexVm.Instructions.testInputCode,
                    inputRange.getMinimum()
                );
            }
            else {
                this._intervalListSet.add(inputRange);
                buffer.put(
                    RegexVm.Instructions.testInputRange,
                    this._intervalListSet.findIndex(inputRange)
                );
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
            
            buffer.consume(this._nodeCodeMap.get(node.getChildAt(0)));
            //TODO : consume 명령어를 넣는 것이 타당한 지 테스트.
            buffer.put(RegexVm.Instructions.consume);
            buffer.put(RegexVm.Instructions.accept, tokenKey);
            
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
            
            var childCount = node.getChildCount();
            var childCodeLens = [];
            var offset = 0;
            for(var i = 0; i < childCount; ++i) {
                var len = this._nodeCodeMap.get(node.getChildAt(0)).getCount();
                childCodeLens.push(len);
                offset += len;
            }
            
            var paramCount = node.getChildCount();
            if(paramCount > 0) {
                offset -= childCodeLens[0];
                
                buffer.put(RegexVm.Instructions.pushCur);
                buffer.consume(this._nodeCodeMap.get(node.getChildAt(0)));
                buffer.put(RegexVm.Instructions.beq, (childCount - 1) * 3 + 2 + offset);
            }
            
            for(var i = 1; i < paramCount;++i) {
                offset -= childCodeLens[i];
                
                buffer.put(RegexVm.Instructions.popCur);
                
                buffer.put(RegexVm.Instructions.pushCur);
                buffer.consume(this._nodeCodeMap.get(node.getChildAt(i)));
                buffer.put(RegexVm.Instructions.beq, (childCount - 1 - i) * 3 + 2 + offset);
            }
            
            buffer.put(RegexVm.Instructions.popCur);
            buffer.put(RegexVm.Instructions.rts);
            
            buffer.put(RegexVm.Instructions.collapseCur);
            buffer.put(RegexVm.Instructions.incCur);
            
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
            if(childCount > 0) {
                buffer.consume(this._nodeCodeMap.get(node.getChildAt(0)));
            }
            
            for(var i = 1; i < childCount; ++i) {
                buffer.put(RegexVm.Instructions.beq, 1);
                buffer.put(RegexVm.Instructions.rts);
                buffer.put(RegexVm.Instructions.incCur);
                buffer.consume(this._nodeCodeMap.get(node.getChildAt(i)));
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
            
            var paramNode = node.getChildAt(0);
            var paramCode = this._nodeCodeMap.get(paramNode);
            var paramCodeLen = paramCode.getByteCount();
            
            if(
                repRange.getMinimum() === 0
                && repRange.getMaximum() === 1
            ) {
                buffer.consume(paramCode);
                buffer.put(RegexVm.Instructions.bne, 1);
                buffer.put(RegexVm.Instructions.incCur);
                buffer.put(RegexVm.Instructions.clearZ);
            }
            else if(
                repRange.getMinimum() === 0
                && repRange.getMaximum() >= _maxInt
            ) {
                buffer.consume(paramCode);
                buffer.put(RegexVm.Instructions.bne, 2);
                buffer.put(RegexVm.Instructions.incCur);
                buffer.put(RegexVm.Instructions.bra, -(3 + paramCodeLen));
                buffer.put(RegexVm.Instructions.clearZ);
            }
            else {
                buffer.put(RegexVm.Instructions.beginRep);
                buffer.consume(paramCode);
                
                if(repRange.getMaximum() >= _maxInt) {
                    buffer.put(RegexVm.Instructions.beq, 3);
                    buffer.put(RegexVm.Instructions.testRep, repRange.getMinimum());
                    buffer.put(RegexVm.Instructions.beq, 4);
                    buffer.put(RegexVm.Instructions.rts);
                    buffer.put(RegexVm.Instructions.incCur);
                    buffer.put(RegexVm.Instructions.incRep);
                    buffer.put(RegexVm.Instructions.bra, -(7 + paramCodeLen));
                }
                else if(repRange.getMinimum() >= repRange.getMaximum()) {
                    buffer.put(RegexVm.Instructions.beq, 3);
                    buffer.put(RegexVm.Instructions.testRep, repRange.getMinimum());
                    buffer.put(RegexVm.Instructions.beq, 5);
                    buffer.put(RegexVm.Instructions.rts);
                    buffer.put(RegexVm.Instructions.incCur);
                    buffer.put(RegexVm.Instructions.incRep);
                    buffer.put(RegexVm.Instructions.testRep, repRange.getMaximum() + 1);
                    buffer.put(RegexVm.Instructions.bne, -(8 + paramCodeLen));
                }
                else {
                    buffer.put(RegexVm.Instructions.beq, 1);
                    buffer.put(RegexVm.Instructions.rts);
                    buffer.put(RegexVm.Instructions.incCur);
                    buffer.put(RegexVm.Instructions.incRep);
                    buffer.put(RegexVm.Instructions.testRep, repRange.getMinimum());
                    buffer.put(RegexVm.Instructions.bne, -(6 + paramCodeLen));
                }
                
                buffer.put(RegexVm.Instructions.endRep);
            }
            
            return buffer;
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
                throw new Error("");
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
         * @return {Lexer|null}
         */
        LexerGenerator.prototype.generateLexer = function () {
            //TODO : 
            //[V] 1. 모든 Ast를 하나의 root 노드로 통합.
            //[-] 2. Ast 최적화
            //[ ] 3. VmCode 방출
            
            var lexer = new string.Lexer();
            
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
                    rootNode.addChild(iP.value._astRootNode);
                }
            }
            else {
                rootNode = this._tokenMap.values().next().value._astRootNode;
            }
            
            return this._bytecodeEmitter.emitBytecode(rootNode);
        };
        
        return LexerGenerator;
    }());
    
    return karbonator;
})
));
