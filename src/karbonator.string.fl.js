/**
 * author : Hydrawisk793
 * e-mail : hyw793&#x40;naver.com
 * blog : http://blog.naver.com/hyw793
 * disclaimer : The author is not responsible for any problems 
 * that may arise by using this source code.
 * 
 * 2017-07-17 Note
 * Lexer / Regex
 * basic operators : a* a+ a? a*? a+? a?? ab a|b
 * character class : [^a-zA-Z0-9] .(any characters)
 * token regex subroutine call : {tokenName}
 */

/**
 * @param {global|window} g
 * @param {Function} factory
 */
(function (g, factory) {
    "use strict";
    
    if(typeof(g.define) === "function" && g.define.amd) {
        g.define(
            [
                "./karbonator.collection",
                "./karbonator.math.interval",
                "./karbonator.util.enum"
            ],
            function (karbonator) {
                return factory(g, karbonator);
            }
        );
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        require("./karbonator.collection");
        require("./karbonator.math.interval");
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.util.enum")
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
    var Symbol = karbonator.getEsSymbol();
    
    var TreeSet = collection.TreeSet;
    var TreeMap = collection.TreeMap;
    var ListMap = collection.ListMap;
    var ListSet = collection.ListSet;
    
    var ByteArray = karbonator.ByteArray;
    var Interval = karbonator.math.Interval;
    var Set = collection.ListSet;
    var Map = collection.ListMap;
    
    var Enum = karbonator.util.Enum;
    
    //For debugging only...
    //The original 'Array.prototype.toString' function fucking sucks.
    //Why the function just flattens all multidimensional arrays?
    //It's fucking annoying because it makes debugging hard...
    Array.prototype.toString = function () {
        var str = '[';
        
        if(this.length > 0) {
            str += this[0];
        }
        
        for(var i = 1; i < this.length; ++i) {
            str += ',';
            str += this[i];
        }
        
        str += ']';
        
        return str;
    };
    
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
     * @function
     * @param {Array.<Number>} codes
     * @returns {String}
     */
    var charCodesToString = function (codes) {
        return codes.reduce(
            function (str, code) {
                return str + String.fromCharCode(code);
            },
            ""
        );
    };
    
    /**
     * @function
     * @param {String} str
     * @returns {Array.<Number>}
     */
    var stringToCharCodes = function (str) {
        var codes = new Array(str.length);
        for(var i = 0; i < str.length; ++i) {
            codes[i] = str.charCodeAt(i);
        }
        
        return codes;
    };
    
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
    //MatchResult
    
    /**
     * @memberof karbonator.string
     * @constructor
     * @param {Number} tokenKey
     * @param {String} text
     * @param {karbonator.math.Interval} range
     */
    var MatchResult = function (tokenKey, text, range) {
        this.tokenKey = tokenKey;
        this.text = text;
        this.range = range;
    };
    
    /**
     * @function
     * @param {karbonator.string.MatchResult} rhs
     * @returns {Boolean}
     */
    MatchResult.prototype[karbonator.equals] = function (rhs) {
        return this.tokenKey === rhs.tokenKey
            && this.text === rhs.text
            && this.range[karbonator.equals](rhs.range)
        ;
    };
    
    /**
     * @function
     * @returns {String}
     */
    MatchResult.prototype.toString = function () {
        var str = '{';
        
        str += "tokenKey";
        str += " : ";
        str += this.tokenKey;
        
        str += ", ";
        str += "text";
        str += " : ";
        str += '\"' + this.text + '\"';
        
        str += ", ";
        str += "range";
        str += " : ";
        str += this.range;
        
        str += '}';
        
        return str;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //RegexVm
    
    /**
     * @constructor
     */
    var RegexVm = function () {
        this._inStr = "";
        this._bytecode = null;
        
        this._cursor = 0;
        this._thIdSeq = 0;
        this._ctxts = [];
        this._logStr = "";
    };
    
    /*////////////////////////////////*/
    //RegexVm._Frame
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     * @param {RegexVm._Frame|Number} arg0
     */
    RegexVm._Frame = function (arg0) {
        if(arg0 instanceof RegexVm._Frame) {
            this._returnAddress = arg0._returnAddress;
            this._repStack = detail._copyIntArray(arg0._repStack);
        }
        else if(karbonator.isNonNegativeSafeInteger(arg0)) {
            this._returnAddress = arg0;
            this._repStack = [];
        }
        else {
            throw new TypeError("An invalid argument.");
        }
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RegexVm._Thread
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     * @param {RegexVm} vm
     * @param {Number} id
     * @param {Number} pc
     * @param {RegexVm._Thread} [parent]
     * @param {Number} [forkKey]
     * @param {Boolean} [prioritize]
     */
    RegexVm._Thread = function (vm, id, pc) {
        if(!(vm instanceof RegexVm)) {
            throw new TypeError("'vm' must be an instance of 'RegexVm'.");
        }
        if(!karbonator.isNonNegativeSafeInteger(id)) {
            throw new TypeError("'id' must be a non-negative safe integer.");
        }
        if(!karbonator.isNonNegativeSafeInteger(pc)) {
            throw new TypeError("'pc' must be a non-negative safe integer.");
        }
        
        this._vm = vm;
        this._id = id;
        this._initialPc = pc;
        this._pc = pc;
        this._matchResult = null;
        
        var parent = arguments[3];
        var forkKey = arguments[4];
        if(
            (parent instanceof RegexVm._Thread)
            && karbonator.isNonNegativeSafeInteger(forkKey)
        ) {
            var parentFrameStack = parent._frameStack;
            var i = parentFrameStack.length;
            var newThFrameStack = new Array(i);
            while(i > 0) {
                --i;
                newThFrameStack[i] = new RegexVm._Frame(
                    parentFrameStack[i]
                );
            }
            this._frameStack = newThFrameStack;
            
            var parentPath = parent._path;
            parentPath.push([forkKey, 0, 0]);
            var lastNdx = parentPath.length - 1;
            var newThPath = detail._copyTwoDimIntArray(parentPath);
            parentPath[lastNdx][1] = +!!arguments[5];
            this._path = newThPath;
            
            this._consumeRanges = detail._copyIntArray(parent._consumeRanges);
            
            this._groupNdxStack = detail._copyIntArray(parent._groupNdxStack);
            
            parent._consumedValues.push([1, -forkKey]);
            this._consumedValues = detail._copyTwoDimIntArray(parent._consumedValues);
            parent._consumedValues[parent._consumedValues.length - 1][1] = (+!!arguments[5] ? forkKey : -forkKey);
            
            this._instAddr = parent._instAddr;
            this._lastOpCode = parent._lastOpCode;
        }
        else {
            this._frameStack = [new RegexVm._Frame(0)];
            this._path = [];
            this._consumeRanges = [vm._cursor];
            
            this._groupNdxStack = [];
            
            this._consumedValues = [];
            
            this._instAddr = 0;
            this._lastOpCode = 0x00;
        }
    };
    
    /**
     * @memberof RegexVm._Thread
     * @readonly
     */
    RegexVm._Thread._skipDelimiter = 0;
    
    /**
     * @function
     * @return {karbonator.string.MatchResult}
     */
    RegexVm._Thread.prototype.getMatchResult = function () {
        return this._matchResult;
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} rhs
     * @return {Boolean}
     */
    RegexVm._Thread.prototype.comparePriorityTo = function (rhs) {
        var thisPath = this._path;
        var rhsPath = rhs._path;
        var thisPathLen = thisPath.length;
        var rhsPathLen = rhsPath.length;
        
        var lenDiff = thisPathLen - rhsPathLen;
        var minLen = (lenDiff < 0 ? thisPathLen : rhsPathLen);
        
        for(var i = 0; i < minLen; ++i) {
            var lhsPoint = thisPath[i];
            var rhsPoint = rhsPath[i];
            
            if(lhsPoint[0] !== rhsPoint[0]) {
                break;
            }
            
            var priorityDiff = lhsPoint[1] - rhsPoint[1];
            if(priorityDiff !== 0) {
                return priorityDiff;
            }
        }
        
        switch(
            (this._frameStack.length < 1 ? 0x02 : 0)
            | (rhs._frameStack.length < 1 ? 0x01 : 0)
        ) {
        case 0x00:
            //Select the shortest path.
            return -lenDiff;
        //break;
        case 0x01:
            return 1;
        //break;
        case 0x02:
            return -1;
        //break;
        case 0x03:
            var lhsResult = this._matchResult;
            var rhsResult = rhs._matchResult;
            switch(
                (null !== lhsResult ? 0x02 : 0)
                | (null !== rhsResult ? 0x01 : 0)
            ) {
            case 0:
                return lenDiff;
            //break;
            case 1:
                return -1;
            //break;
            case 2:
                return 1;
            //break;
            case 3:
                //Select the longest matched one.
                var matchedTextDiff = lhsResult.text.length - rhsResult.text.length;
                if(matchedTextDiff !== 0) {
                    return matchedTextDiff;
                }
                
                //If that failed, then select the shortest path.
                return -lenDiff;
            //break;
            }
        //break;
        }
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} rhs
     * @return {Boolean}
     */
    RegexVm._Thread.prototype.isPriorTo = function (rhs) {
        return this.comparePriorityTo(rhs) > 0;
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} rhs
     * @return {Boolean}
     */
    RegexVm._Thread.prototype.hasSamePathPostfixWith = function (rhs) {
        var lhsPath = this._path;
        var rhsPath = rhs._path;
        
        var lhsPathLen = lhsPath.length;
        var rhsPathLen = rhsPath.length;
        
        var count = 0;
        for(
            var l = lhsPathLen, r = rhsPathLen;
            l > 0 && r > 0;
        ) {
            --l;
            --r;
            
            var lhsPoint = lhsPath[l];
            var rhsPoint = rhsPath[r];
            if(
                lhsPoint[0] !== rhsPoint[0]
                || lhsPoint[1] !== rhsPoint[1]
                || lhsPoint[2] !== rhsPoint[2]
            ) {
                break;
            }
            
            ++count;
        }
        
        return count > 0;
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.execute = function () {
        var opCode = this.readOpCode();
        switch(opCode) {
        case 0x00:
            this.branch();
        break;
        case 0x01:
            throw new Error("A not implemented opcode has been found.");
        break;
        case 0x02:
        case 0x03:
            throw new Error("An invalid opcode has been found.");
        break;
        case 0x04:
            throw new Error("A not implemented opcode has been found.");
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
            this.moveConsumePointer((opCode & 0x01) !== 0);
        break;
        case 0x0C:
        case 0x0D:
            throw new Error("An invalid opcode has been found.");
        break;
        case 0x0E:
            this.beginGroup();
        break;
        case 0x0F:
            this.endGroup();
        break;
        case 0x10:
            this.testCode();
        break;
        case 0x11:
            throw new Error("An invalid opcode has been found.");
        break;
        case 0x12:
            this.testRange();
        break;
        case 0x13:
            this.testRanges();
        break;
        default:
            throw new Error("An invalid opcode has been found.");
        }
    };
    
    /**
     * Reads the next opcode from the bytecode and increment the pc.
     * 
     * @function
     * @return {Number}
     */
    RegexVm._Thread.prototype.readOpCode = function () {
        this._instAddr = this._pc;
        
        var opCode = this.readInteger(false, 1);
        this._lastOpCode = opCode;
        
        return opCode;
    };
    
    /**
     * Reads the next integer value from the bytecode and increment the pc.
     * 
     * @param {Boolean} signed
     * @param {Number} byteCount
     * @return {Number}
     */
    RegexVm._Thread.prototype.readInteger = function (signed, byteCount) {
        var intValue = this._vm._bytecode.readInteger(this._pc, signed, byteCount);
        
        this._pc += byteCount;
        
        return intValue;
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
        var offset = this.readInteger(true, 2);
        
        this._pc += offset;
    };
    
    /**
     * @function
     * @return {RegexVm._Frame}
     */
    RegexVm._Thread.prototype.getCurrentFrame = function () {
        if(this.isDead()) {
            throw new Error("The thread has been already dead.");
        }
        
        return this._frameStack[this._frameStack.length - 1];
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.jumpToSubroutine = function () {
        var addr = this.readInteger(false, 4);
        
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
        var goToOffset = this.readInteger(true, 2);
        var newThreadPcOffset = this.readInteger(true, 2);
        
        var forkPc = this._instAddr;
        for(var i = this._path.length; i > 0; ) {
            --i;
            
            var point = this._path[i];
            if(point[2] > 0) {
                break;
            }
            
            if(point[0] === forkPc) {
                this._frameStack.length = 0;
                return;
            }
        }
        
        this._vm.createThread(
            this._pc + newThreadPcOffset,
            this,
            prioritize
        );
        
        this._pc += goToOffset;
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.accept = function () {
        var tokenKey = this.readInteger(false, 4);
        
        this._matchResult = new MatchResult(
            tokenKey,
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
            this._vm._cursor
        );
        
        this._frameStack.length = 0;
    };
    
    /**
     * @function
     * @param {Boolean} consume
     */
    RegexVm._Thread.prototype.moveConsumePointer = function (consume) {
        if(!consume) {
            this._consumeRanges.push(RegexVm._Thread._skipDelimiter);
        }
        this._consumeRanges.push(this._vm._cursor);
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.beginGroup = function () {
        var groupIndex = this.readInteger(false, 1);
        
        this._groupNdxStack.push(groupIndex);
        this._consumedValues.push([2, groupIndex]);
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.endGroup = function () {
        var groupIndex = this.readInteger(false, 1);
        
        this._groupNdxStack.pop();
        this._consumedValues.push([3, groupIndex]);
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.testCode = function () {
        var charCode = this.readInteger(false, 4);
        
        if(!this._vm.inputMatchesCode(charCode)) {
            this._frameStack.length = 0;
        }
        else {
            if(this._path.length > 0) {
                ++this._path[this._path.length - 1][2];
            }
            
            this._consumedValues.push([0, this._vm.getCurrentCharacterCode()]);
        }
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.testRange = function () {
        var rangeIndex = this.readInteger(false, 4);
        
        if(!this._vm.inputIsInRange(rangeIndex)) {
            this._frameStack.length = 0;
        }
        else {
            if(this._path.length > 0) {
                ++this._path[this._path.length - 1][2];
            }
            
            this._consumedValues.push([0, this._vm.getCurrentCharacterCode()]);
        }
    };
    
    /**
     * @function
     */
    RegexVm._Thread.prototype.testRanges = function () {
        var rangeSetIndex = this.readInteger(false, 4);
        
        if(!this._vm.inputIsInRangeSet(rangeSetIndex)) {
            this._frameStack.length = 0;
        }
        else {
            if(this._path.length > 0) {
                ++this._path[this._path.length - 1][2];
            }
            
            this._consumedValues.push([0, this._vm.getCurrentCharacterCode()]);
        }
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RegexVm.Bytecode
    
    /**
     * @memberof RegexVm
     * @constructor
     * @param {iterable} rangeSet
     * @param {iterable} rangeIndexSets
     * @param {Boolean} littleEndian
     * @param {karbonator.ByteArray} codeBlock
     * @param {String} [sourceCodeForDebug]
     */
    RegexVm.Bytecode = function (
        rangeSet, rangeIndexSets,
        littleEndian, codeBlock
    ) {
        if(!karbonator.isEsIterable(rangeSet)) {
            throw new TypeError("The parameter 'ranges' must have the property 'Symbol.iterator'.");
        }
        if(!karbonator.isEsIterable(rangeIndexSets)) {
            throw new TypeError("The parameter 'rangeIndexSets' must have the property 'Symbol.iterator'.");
        }
        if(!(codeBlock instanceof ByteArray)) {
            throw new TypeError("The parameter 'codeBlock' must be an instance of 'karbonator.ByteArray'.");
        }
        
        this._ranges = Array.from(rangeSet);
        this._rangeIndexSets = Array.from(rangeIndexSets);
        this._littleEndian = !!littleEndian;
        this._codeBlock = ByteArray.from(codeBlock);
        this._sourceCodeForDebug = arguments[4];
        if(karbonator.isUndefined(this._sourceCodeForDebug)) {
            this._sourceCodeForDebug = "";
        }
    };
    
    /**
     * @function
     * @param {Number} addr
     * @param {Boolean} signed
     * @param {Number} byteCount
     * @return {Number}
     */
    RegexVm.Bytecode.prototype.readInteger = function (addr, signed, byteCount) {
        return karbonator.bytesToInteger(
            this._codeBlock,
            byteCount, signed,
            this._littleEndian,
            addr
        );
    };
    
    /*////////////////////////////////*/
    
    /**
     * @memberof RegexVm
     * @private
     * @constructor
     */
    RegexVm._IntegerType = Enum.create(
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
    RegexVm.OperandType = Enum.create(
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
                str += this[Enum.getKey]();
                
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
    RegexVm.Instruction = Enum.create(
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
                throw new TypeError("The parameter 'opCode' must be a non-negative safe integer.");
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
                    "reserved02",
                    0x02,
                    null
                ],
                [
                    "reserved03",
                    0x03,
                    null
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
                    "skip",
                    0x0A,
                    null
                ],
                [
                    "consume",
                    0x0B,
                    null
                ],
                [
                    "reserved0C",
                    0x0C,
                    [RegexVm.OperandType.characterCode]
                ],
                [
                    "reserved0D",
                    0x0D,
                    [RegexVm.OperandType.characterCode]
                ],
                [
                    "begin.group",
                    0x0E,
                    [RegexVm.OperandType.byteIndex]
                ],
                [
                    "end.group",
                    0x0F,
                    [RegexVm.OperandType.byteIndex]
                ],
                [
                    "test.code",
                    0x10,
                    [RegexVm.OperandType.characterCode]
                ],
                [
                    "reserved11",
                    0x11,
                    null
                ],
                [
                    "test.range",
                    0x12,
                    [RegexVm.OperandType.index]
                ],
                [
                    "test.ranges",
                    0x13,
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
        karbonator.integerComparator,
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
            throw new Error(
                "The opcode '"
                + opCode.toString(16)
                + "' doesn't exist."
            );
        }
        
        return inst;
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
     * @param {Number} [start=0]
     * @return {karbonator.string.MatchResult|null}
     */
    RegexVm.prototype.find = function (str) {
        if(karbonator.isUndefinedOrNull(this._bytecode)) {
            throw new Error("Set the bytecode of the regex first.");
        }
        
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }        
        this._inStr = str;
        
        var start = arguments[1];
        if(karbonator.isUndefined(start)) {
            start = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(start)) {
            throw new TypeError("'start' must be a non-negative safe integer.");
        }
        
        return this._run(start);
    };
    
    /**
     * @function
     * @param {String} str
     * @param {Number} [start=0]
     * @param {Number} [end]
     * @return {Array<karbonator.string.MatchResult>}
     */
    RegexVm.prototype.findAll = function (str) {
        if(karbonator.isUndefinedOrNull(this._bytecode)) {
            throw new Error("Set the bytecode of the regex first.");
        }
        
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }
        this._inStr = str;
        
        var start = arguments[1];
        if(karbonator.isUndefined(start)) {
            start = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(start)) {
            throw new TypeError("'start' must be a non-negative safe integer.");
        }
        
        var end = arguments[2];
        if(karbonator.isUndefined(end)) {
            end = this._inStr.length;
        }
        else if(!karbonator.isNonNegativeSafeInteger(end)) {
            throw new TypeError("'end' must be a non-negative safe integer.");
        }
        
        var results = [];
        for(var i = start; ; ) {
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
                
                if(i >= end) {
                    break;
                }
            }
        }
        
        return results;
    };
    
    /**
     * @private
     * @function
     * @param {Number} startIndex
     * @return {karbonator.string.MatchResult}
     */
    RegexVm.prototype._run = function (startIndex) {
        this._cursor = startIndex;
        
        this._thIdSeq = 0;
        this._ctxts.length = 0;
        var finalMatchThreadFound = false;
        var matchThread = null;
        
        this._logStr = "";
        
        this.createThread(0);
        
        var aliveThreads = [];
        var acceptedThreads = [];
        var deadThreads = [];
        for(
            ;
            this._ctxts.length > 0 && !finalMatchThreadFound;//;//
            ++this._cursor
        ) {
            for(var i = 0; i < this._ctxts.length; ++i) {
                var th = this._ctxts[i];
                while(!th.isDead()) {
                    th.execute();
                    this._logStr += this.createExecInfoDebugMessage(th) + "\r\n";
                    
                    if(((th._lastOpCode & 0xF0) >>> 4) === 1) {
                        break;
                    }
                }
                
                if(th.isDead()) {
                    if(null === th._matchResult){
                        deadThreads.push(th);
                    }
                    else {
                        acceptedThreads.push(th);
                    }
                }
                else {
                    var addCurrent = true;
                    for(var j = aliveThreads.length; j > 0; ) {
                        --j;
                        
                        var aliveThread = aliveThreads[j];
                        if(th.hasSamePathPostfixWith(aliveThread)) {
                            if(th.isPriorTo(aliveThread)) {
                                aliveThreads.splice(j, 1);
                            }
                            else {
                                addCurrent = false;
                                break;
                            }
                        }
                    }
                    
                    if(addCurrent) {
                        aliveThreads.push(th);
                    }
                    
//                    aliveThreads.push(th);
                }
                
                this._logStr += ".............................." + "\r\n";
                
                //debugger;
            }
            
            var temp = this._ctxts;
            this._ctxts = aliveThreads;
            aliveThreads = temp;
            aliveThreads.length = 0;
            
            this._logStr += "threads(" + this._ctxts.length + ") === [" + "\r\n";
            for(var i = 0; i < this._ctxts.length; ++i) {
                var th = this._ctxts[i];
                this._logStr += 'T' + th._id + '(' + '[' + _createConsumedValuesDebugString(th._consumedValues) + ']' + ')' + "\r\n";
            }
            this._logStr += ']';
            if(this._ctxts.length < 1) {
                this._logStr += "\r\n";
            }
            
//            if(acceptedThreads.length > 0) {
//                debugger;
//            }
            
            for(var i = acceptedThreads.length; i > 0; ) {
                --i;
                
                var th = acceptedThreads[i];
                
                this._logStr += this.createMatchResultDebugMessage(th)
                    + "\r\n"
                ;
                
                if(null === matchThread) {
                    matchThread = th;
                    
                    finalMatchThreadFound = true;
                    for(var j = this._ctxts.length; finalMatchThreadFound && j > 0; ) {
                        --j;
                        
                        finalMatchThreadFound = !this._ctxts[j].isPriorTo(th);
                    }
                }
                else {
                    if(th.isPriorTo(matchThread)) {
                        matchThread = th;
                        
                        this._logStr += 'T' + th._id + " is prior to the selected thread." + "\r\n";
                    }
                    
                    var priorToAlivingThs = true;
                    for(var j = 0; priorToAlivingThs && j < this._ctxts.length; ++j) {
                        priorToAlivingThs = th.isPriorTo(this._ctxts[j]);
                    }
                    if(priorToAlivingThs) {
                        finalMatchThreadFound = true;
                        
                        this._logStr += 'T' + th._id + " is prior to aliving threads." + "\r\n";
                    }
                }
            }
            acceptedThreads.length = 0;
            deadThreads.length = 0;
            
            if(null !== matchThread) {
                for(var i = this._ctxts.length; i > 0; ) {
                    --i;
                    
                    var th = this._ctxts[i];
                    if(th.comparePriorityTo(matchThread) >= 0) {
                        aliveThreads.push(th);
                    }
                }
                
                var temp = this._ctxts;
                this._ctxts = aliveThreads;
                aliveThreads = temp;
                aliveThreads.length = 0;
                
                this._logStr += "selectedResult === "
                    + this.createMatchResultDebugMessage(matchThread)
                    + "\r\n"
                ;
            }
            
            this._logStr += "\r\n";
            this._logStr += "------------------------------" + "\r\n";
            
            //debugger;
        }
        
        this._logStr += (null === matchThread ? "Failed..." : "Found!!!") + "\r\n";
        this._logStr += "==============================" + "\r\n";
        
        //console.log(this._logStr);
        
        return (null !== matchThread ? matchThread._matchResult : null);
    };
    
    /**
     * @fucntion
     * @param {Array.<Array.<Number>>} values
     * @returns {String}
     */
    var _createConsumedValuesDebugString = function (values) {
        var str = "";
        
        for(var i = 0; i < values.length; ++i) {
            var value = values[i];
            
            switch(value[0]) {
            case 0:
                str += '\'' + String.fromCharCode(value[1]) + '\'';
            break;
            case 1:
                str += '{' + (value[1] >= 0 ? '+' : '') + value[1] + '}';
            break;
            case 2:
                str += '(' + value[1];
            break;
            case 3:
                str += ')' + value[1];
            break;
            }
        }
        
        return str;
    };
    
    /**
     * @function
     * @param {Number} pc
     * @param {RegexVm._Thread} [parent]
     * @param {Boolean} [prioritize=false]
     * @return {RegexVm._Thread}
     */
    RegexVm.prototype.createThread = function (pc) {
        var parent = arguments[1];
        
        var newThreadId = this._thIdSeq;
        ++this._thIdSeq;
        
        var newThread = (
            !karbonator.isUndefinedOrNull(parent)
            ? new RegexVm._Thread(
                this, newThreadId, pc,
                parent,
                parent._pc - RegexVm.Instruction.fork.getSize(),
                arguments[2]
            )
            : new RegexVm._Thread(this, newThreadId, pc)
        );
        this._ctxts.push(newThread);
        
        return newThread;
    };
    
    /**
     * @function
     * @param {Number} code
     * @return {Boolean}
     */
    RegexVm.prototype.inputMatchesCode = function (code) {
        return code === this.getCurrentCharacterCode();
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {Boolean}
     */
    RegexVm.prototype.inputIsInRange = function (index) {
        if(index >= this._bytecode._ranges.length) {
            return false;
        }
        
        return this._bytecode._ranges[index].contains(
            this.getCurrentCharacterCode()
        );
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {Boolean}
     */
    RegexVm.prototype.inputIsInRangeSet = function (index) {
        if(index >= this._bytecode._rangeIndexSets.length) {
            return false;
        }
        
        var current = this.getCurrentCharacterCode();
        var rangeIndexSet = this._bytecode._rangeIndexSets[index];
        for(var i = 0; i < rangeIndexSet.length; ++i) {
            var range = this._bytecode._ranges[rangeIndexSet[i]];
            if(range.contains(current)) {
                return true;
            }
        }
        
        return false;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexVm.prototype.getCurrentCharacterCode = function () {
        var code = (
            this._cursor < this._inStr.length
            ? this._inStr.charCodeAt(this._cursor)
            : -1
        );
        
        return code;
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} matchThread
     * @returns {String}
     */
    RegexVm.prototype.createMatchResultDebugMessage = function (matchThread) {
        return 'T' + matchThread._id
            + '(' + '[' + _createConsumedValuesDebugString(matchThread._consumedValues) + ']' + ')'
            + "."
            + "result === "
            + matchThread._matchResult.toString()
        ;
    };
    
    /**
     * @function
     * @param {RegexVm._Thread} th
     * @returns {String}
     */
    RegexVm.prototype.createExecInfoDebugMessage = function (th) {
        var inst = RegexVm.findInstructionByOpCode(th._lastOpCode);
        if(karbonator.isUndefined(inst)) {
            throw new Error("An invalid opcode has been found.");
        }
        
        var debugStr = 'T' + th._id;
        debugStr += '(';
        debugStr += '[' + _createConsumedValuesDebugString(th._consumedValues) + ']';
        debugStr += ')';
        
        var mnemonic = inst.getMnemonic();
        debugStr += " " + (th._instAddr) + ":";
        debugStr += "\t" + mnemonic;
        
        if(mnemonic.endsWith("fork")) {
            debugStr += " " + "parent : T" + th._id;
            debugStr += '(' + th._pc + ')';
            var childTh = th._vm._ctxts[th._vm._ctxts.length - 1];
            debugStr += ", child : T" + childTh._id;
            debugStr += '(' + childTh._pc + ')';
        }
        else if(mnemonic.startsWith("test")) {
            var cursor = th._vm._cursor;
            debugStr += "\t" + "at " + cursor + " " + th._vm._inStr.charAt(cursor);
        }
        
        return debugStr;
    };
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////*/
    //AstNode
    
    /**
     * @constructor
     * @param {Number} type
     * @param {Object} value
     * @param {Boolean} [rootOfGroup=false]
     */
    var AstNode = function (type, value) {
        assertion.isTrue(karbonator.isNonNegativeSafeInteger(type));
        assertion.isTrue(!karbonator.isUndefined(value));
        
        this._type = type;
        this._value = value;
        this._rootOfGroup = !!arguments[2];
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
    
    /**
     * @memberof AstNode
     * @constructor
     * @param {AstNode} rootNode
     * @param {AstNode} currentNode
     */
    AstNode.CppPrefixIterator = function (rootNode, currentNode) {
        this._rootNode = rootNode;
        this._currentNode = currentNode;
    };

    /**
     * @function
     * @return {Boolean}
     */
    AstNode.CppPrefixIterator.prototype.moveToNext = function () {
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
    AstNode.CppPrefixIterator.prototype.dereference = function () {
        assertion.isTrue(null !== this._currentNode);

        return this._currentNode;
    };

    /**
     * @function
     * @param {AstNode.CppPrefixIterator} rhs
     * @return {Boolean}
     */
    AstNode.CppPrefixIterator.prototype[karbonator.equals] = function (rhs) {
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

    /**
     * @memberof AstNode
     * @constructor
     * @param {AstNode} rootNode
     * @param {AstNode} currentNode
     */
    AstNode.CppPostfixIterator = function (rootNode, currentNode) {
        this._rootNode = rootNode;
        this._currentNode = currentNode;
    };

    /**
     * @function
     * @return {Boolean}
     */
    AstNode.CppPostfixIterator.prototype.moveToNext = function () {
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
    AstNode.CppPostfixIterator.prototype.dereference = function () {
        assertion.isTrue(null !== this._currentNode);

        return this._currentNode;
    };

    /**
     * @function
     * @param {AstNode.CppPostfixIterator} rhs
     * @return {Boolean}
     */
    AstNode.CppPostfixIterator.prototype[karbonator.equals] = function (rhs) {
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
    //Scanner interface...?
    
    /**
     * @constructor
     * @param {Number} [code=0]
     * @param {String} [message=""]
     */
    var ScannerError = function () {
        this.code = arguments[0];
        if(karbonator.isUndefinedOrNull(this.code)) {
            this.code = 0;
        }
        
        this.message = arguments[1];
        if(karbonator.isUndefinedOrNull(this.message)) {
            this.message = "";
        }
    };
    
    /**
     * @constructor
     * @param {Number} valueType
     * @param {Array.<Number>} value
     * @param {karbonator.math.Interval} range
     * @param {ScannerError} [error]
     */
    var ScannerResult = function (valueType, value, range) {
        this.valueType = valueType;
        this.value = value;
        this.range = range;
        
        this.error = arguments[3];
        if(karbonator.isUndefinedOrNull(this.error)) {
            this.error = new ScannerError();
        }
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
     * @memberof OperatorType
     * @readonly
     * @enum {Number}
     */
    OperatorType.Associativity = {
        none : 0,
        leftToRight : 1,
        rightToLeft : 2
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
        
    /*////////////////////////////////*/
    //RegexParser
    
    /**
     * @readonly
     * @enum {Number}
     */
    var OperatorTypeKeys = {
        regexAlternation : 0,
        accept : 1,
        tokenExpressionCall : 2,
        alternation : 3,
        concatenation : 4,
        repetition : 5
    };
    
    /**
     * @readonly
     * @type {Map.<Number, Operator>}
     */
    var _opTypeMap = new TreeMap(
        karbonator.integerComparator,
        Array.from(
            [
                new OperatorType(
                    OperatorTypeKeys.regexAlternation,
                    "regexAlternation",
                    2, 1,
                    OperatorType.Associativity.leftToRight
                ),
                new OperatorType(
                    OperatorTypeKeys.accept,
                    "accept",
                    0, 20,
                    OperatorType.Associativity.leftToRight
                ),
                new OperatorType(
                    OperatorTypeKeys.tokenExpressionCall,
                    "tokenExpressionCall",
                    0, 10,
                    OperatorType.Associativity.leftToRight
                ),
                new OperatorType(
                    OperatorTypeKeys.alternation,
                    "alternation",
                    2, 1,
                    OperatorType.Associativity.leftToRight
                ),
                new OperatorType(
                    OperatorTypeKeys.concatenation,
                    "concatenation",
                    2, 2,
                    OperatorType.Associativity.leftToRight
                ),
                new OperatorType(
                    OperatorTypeKeys.repetition,
                    "repetition",
                    1, 3,
                    OperatorType.Associativity.leftToRight
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
     * @constructor
     */
    var RegexParser = function () {
        this._regexStr = "";
        this._state = 0;
        this._pos = 0;
        this._parsing = false;
        this._exprCtxStack = [];
        this._error = {
            occured : false,
            message : "",
            position : 0
        };
        
        this._edgeSet = new Set(_edgeComparator);
    };
    
    /**
     * @memberof RegexParser
     * @readonly
     * @enum {Number}
     */
    RegexParser.AstNodeType = {
        operator : 0,
        terminal : 1
    };
    
    /**
     * @memberof RegexParser
     * @private
     * @enum {Object}
     */
    RegexParser._CharRange = Enum.create(
        /**
         * @param {karbonator.util.Enum} proto
         */
        function (proto) {
            proto.getRange = function () {
                return this._range;
            };
        },
        function (min) {
            var max = arguments[1];
            if(karbonator.isUndefined(max)) {
                max = min;
            }
            
            this._range = new karbonator.math.Interval(min, max);
        },
        [
            ["anyChars", [_charCodeMin, _charCodeMax]],
            ["docCtrlCodes", [0x09, 0x0D]],
            ["posixLower", [0x61, 0x7A]],
            ["posixUpper", [0x41, 0x5A]],
            ["posixDigit", [0x30, 0x39]],
            ["posixGraph", [0x21, 0x7E]],
            ["horizontalTab", [0x09]],
            ["lineFeed", [0x0A]],
            ["verticalTab", [0x0B]],
            ["formFeed", [0x0C]],
            ["carrigeReturn", [0x0D]],
            ["space", [0x20]],
            ["underscore", [0x5F]],
            ["del", [0x7F]]
        ]
    );
    
    /**
     * @memberof RegexParser
     * @private
     * @enum {Object}
     */
    RegexParser._CharRangeSet = Enum.create(
        /**
         * @param {karbonator.util.Enum} proto
         * @param {Function} ctor
         */
        function (proto, ctor) {
            proto._ctor = ctor;
            
            proto.getRanges = function () {
                return this._ranges;
            };
        },
        function () {
            this._ranges = [];
            
            for(var i = 0; i < arguments.length; ++i) {
                var arg = arguments[i];
                if(karbonator.isString(arg)) {
                    this._ranges = this._ranges.concat((
                        arg[0] === '!'
                        ? Interval.negate(
                            this._ctor[arg.substring(1)].getRanges(),
                            _minInt,
                            _maxInt
                        )
                        : this._ctor[arg].getRanges()
                    ));
                }
                else {
                    if(!(arg instanceof Interval)) {
                        throw new TypeError("");
                    }

                    this._ranges.push(arg);
                }
            }
        },
        [
            ["lower", [new Interval(0x61, 0x7A)]],
            ["upper", [new Interval(0x41, 0x5A)]],
            ["digit", [new Interval(0x30, 0x39)]],
            ["graph", [new Interval(0x21, 0x7E)]],
            [
                "print",
                [
                    RegexParser._CharRange.space.getRange(),
                    RegexParser._CharRange.posixGraph.getRange()
                ]
            ],
            [
                "alpha",
                [
                    RegexParser._CharRange.posixLower.getRange(),
                    RegexParser._CharRange.posixUpper.getRange()
                ]
            ],
            [
                "alnum",
                [
                    "alpha",
                    RegexParser._CharRange.posixDigit.getRange()
                ]
            ],
            [
                "blank",
                [
                    RegexParser._CharRange.space.getRange(),
                    RegexParser._CharRange.horizontalTab.getRange()
                ]
            ],
            [
                "space",
                [
                    RegexParser._CharRange.space.getRange(),
                    RegexParser._CharRange.docCtrlCodes.getRange()
                ]
            ],
            [
                "xdigit",
                [
                    RegexParser._CharRange.posixDigit.getRange(),
                    new Interval(0x41, 0x46),
                    new Interval(0x61, 0x66)
                ]
            ],
            [
                "cntrl",
                [
                    RegexParser._CharRange.del.getRange(),
                    new Interval(0x00, 0x1F)
                ]
            ],
            [
                "nonWhiteSpaces",
                [
                    "!space"
                ]
            ],
            [
                "word",
                [
                    "alnum",
                    RegexParser._CharRange.underscore.getRange()
                ]
            ],
            [
                "nonWord",
                [
                    "!word"
                ]
            ]
        ]
    );
    
    /**
     * @memberof RegexParser
     * @private
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @returns {ScannerResult}
     */
    RegexParser._scanInteger = function (str) {
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new RangeError("'startIndex' must be an non-negative safe integer.");
        }
        
        var pos = startIndex;
        
        var errorCode = 0;
        var errorMessage = "";
        
        var valueType = 0;
        var value = [];
        var valid = true;
        
        var state = 0;
        while(
            state < 2
            && pos < str.length
            && errorCode === 0
        ) {
            var ch = str.charAt(pos);

            switch(state) {
            case 0:
                switch(ch) {
                case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    value.push(ch.charCodeAt(0));

                    ++pos;
                    ++state;
                break;
                case '0':
                case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                    valueType = 1;
                    value.push(ch.charCodeAt(0));

                    ++pos;
                    ++state;
                break;
                default:
                    state = 2;
                }
            break;
            case 1:
                switch(ch) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    value.push(ch.charCodeAt(0));

                    ++pos;
                break;
                case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                    valueType = 1;
                    value.push(ch.charCodeAt(0));

                    ++pos;
                break;
                default:
                    state = 2;
                }
            break;
            }
        }

        if(errorCode === 0 && !valid) {
            errorCode = 2;
            errorMessage = "";
        }

        return new ScannerResult(
            valueType, value,
            new karbonator.math.Interval(startIndex, pos),
            new ScannerError(errorCode, errorMessage)
        );
    };

    /**
     * Value types.
     * 0 : charCode
     * 1 : charRangeIndex
     * 2 : charRangeSetIndex
     * 3 : backRefIndex
     * 
     * @memberof RegexParser
     * @private
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @returns {ScannerResult}
     */
    RegexParser._scanEscapedCharacter = function (str) {
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new RangeError("'startIndex' must be an non-negative safe integer.");
        }
        
        var pos = detail._selectNonUndefined(arguments[1], 0);
        
        var errorCode = 0;
        var errorMessage = "";
        
        var scanResult = null;
        
        var valueType = 0;
        var value = [];
        var valid = false;
        
        var state = 0;
        while(
            state < 10
            && errorCode === 0
            && pos < str.length
        ) {
            var ch = str.charAt(pos);
            
            switch(state) {
            case 0:
                if(ch !== '\\') {
                    errorCode = 1;
                    errorMessage = "An escaped character must start with '\\'.";
                }
                else {
                    ++pos;
                    ++state;
                }
            break;
            case 1:
                switch(ch) {
                case 's':
                    valueType = 2;
                    value.push(
                        RegexParser._CharRangeSet.space[
                            Enum.getIndex
                        ]()
                    );
                    
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'S':
                    valueType = 2;
                    value.push(
                        RegexParser._CharRangeSet.nonWhiteSpaces[
                            Enum.getIndex
                        ]()
                    );
                    
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'w':
                    valueType = 2;
                    value.push(
                        RegexParser._CharRangeSet.word[
                            Enum.getIndex
                        ]()
                    );
                    
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'W':
                    valueType = 2;
                    value.push(
                        RegexParser._CharRangeSet.nonWord[
                            Enum.getIndex
                        ]()
                    );
                    
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    scanResult = RegexParser._scanInteger(str, pos);
                    if(scanResult.error.code !== 0) {
                        errorCode = scanResult.error.code + 10;
                        errorMessage = scanResult.error.message;
                    }
                    else {
                        valueType = 3;
                        var index = Number.parseInt(
                            charCodesToString(scanResult.value),
                            (scanResult.valueType === 0 ? 10 : 16)
                        );
                        value.push(index);
                        pos = scanResult.range.getMaximum();
                        valid = true;
                        state = 10;
                    }
                break;
                case 'd':
                    ++pos;
                    state = 2;
                break;
                case 'x':
                    ++pos;
                    state = 3;
                break;
                case 'u':
                    valueType = 0;
                    errorCode = 5;
                    errorMessage = "Unicode code point is not implemented yet...";
                break;
                case 'p':
                    valueType = 2;
                    errorCode = 5;
                    errorMessage = "Unicode category is not implemented yet...";
                break;
                case 't':
                    valueType = 0;
                    value.push(0x09);
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'n':
                    valueType = 0;
                    value.push(0x0A);
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'v':
                    valueType = 0;
                    value.push(0x0B);
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'f':
                    valueType = 0;
                    value.push(0x0C);
                    ++pos;
                    valid = true;
                    state = 10;
                break;
                case 'r':
                    valueType = 0;
                    value.push(0x0D);
                    ++pos;
                    valid = true;
                    state = 10;
                break;
//                case '^': case '$':
//                case '[': case ']': case '-':
//                case '(': case ')':
//                case '*': case '+': case '?':
//                case '{': case '}':
//                case '|':
//                case '.':
//                case '/':
//                case '\\':
//                case '#':
//                case '"': case '\'':
                default:
                    valueType = 0;
                    value.push(ch.charCodeAt(0));
                    ++pos;
                    valid = true;
                    state = 10;
                }
            break;
            case 2:
            case 3:
                scanResult = RegexParser._scanInteger(str, pos);
                if(scanResult.error.code !== 0) {
                    errorCode = scanResult.error.code + 10;
                    errorMessage = scanResult.error.message;
                }
                else {
                    valueType = 0;
                    value.push(
                        Number.parseInt(
                            charCodesToString(scanResult.value),
                            (state === 2 ? 10 : 16)
                        )
                    );
                    pos = scanResult.range.getMaximum();
                    valid = true;
                    state = 10;
                }
            break;
            }
        }
        
        if(errorCode === 0 && !valid) {
            errorCode = 4;
            errorMessage = "";
        }
        
        return new ScannerResult(
            valueType, value,
            new karbonator.math.Interval(startIndex, pos),
            new ScannerError(errorCode, errorMessage)
        );
    };
    
    /**
     * @memberof RegexParser
     * @private
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @param {Number} [positiveInfinityValue=Number.MAX_SAFE_INTEGER]
     * @return {ScannerResult}
     */
    RegexParser._scanRepetitionOperator = function (str) {
        var startIndex = detail._selectNonUndefined(arguments[1], 0);
        var pos = startIndex;
        var errorCode = 0;
        var errorMessage = "";
        
        var valueType = 0;
        var min = _minInt;
        var max = detail._selectNonUndefined(arguments[2], _maxInt);
        var valid = false;
        
        var scanResult = null;
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
                scanResult = RegexParser._scanInteger(str, pos);
                if(scanResult.error.code === 0) {
                    min = Number.parseInt(
                        charCodesToString(scanResult.value),
                        (
                            scanResult.valueType === 0
                            ? 10
                            : 16
                        )
                    );
                    pos = scanResult.range.getMaximum();
                    ++state;
                }
                else {
                    errorCode = 2;
                    errorMessage = scanResult.error.message;
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
                scanResult = RegexParser._scanInteger(str, pos);
                var valueStr = charCodesToString(scanResult.value);
                if(scanResult.error.code === 0 && valueStr !== "") {
                    max = Number.parseInt(
                        valueStr,
                        (
                            scanResult.valueType === 0
                            ? 10
                            : 16
                        )
                    );
                    
                    if(min <= max) {
                        pos = scanResult.range.getMaximum();
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
                case '+':
                    valueType = 1;
                    
                    ++pos;
                break;
                case '?':
                    valueType = 2;
                    
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
        
        return new ScannerResult(
            valueType, [min, max],
            new karbonator.math.Interval(startIndex, pos),
            new ScannerError(errorCode, errorMessage)
        );
    };
    
    /**
     * @memberof RegexParser
     * @private
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @return {ScannerResult}
     */
    RegexParser._scanIdInBraces = function (str) {
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new TypeError("'startIndex' must be a non-negative integer.");
        }
        
        var pos = startIndex;
        var value = [];
        
        var valid = false;
        var errorCode = 0;
        var errorMessage = "";
        
        var state = 0;
        
        while(
            state < 10
            && pos < str.length
            && errorCode === 0
        ) {
            var ch = str.charAt(pos);
            
            switch(state) {
            case 0:
                if(ch === '{') {
                    ++pos;
                    state = 1;
                }
                else {
                    errorCode = 1;
                    errorMessage = "An id in braces term must start with '{'.";
                }
            break;
            case 1:
                switch(ch) {
                case '_': case '$':
                case 'a': case 'b': case 'c': case 'd': case 'e':
                case 'f': case 'g': case 'h': case 'i': case 'j':
                case 'k': case 'l': case 'm': case 'n': case 'o':
                case 'p': case 'q': case 'r': case 's': case 't':
                case 'u': case 'v': case 'w': case 'x': case 'y':
                case 'z':
                case 'A': case 'B': case 'C': case 'D': case 'E':
                case 'F': case 'G': case 'H': case 'I': case 'J':
                case 'K': case 'L': case 'M': case 'N': case 'O':
                case 'P': case 'Q': case 'R': case 'S': case 'T':
                case 'U': case 'V': case 'W': case 'X': case 'Y':
                case 'Z':
                    value.push(ch.charCodeAt(0));
                    ++pos;
                    state = 2;
                break;
                default:
                    errorCode = 2;
                    errorMessage = "An invalid character has been found in the identifier.";
                }
            break;
            case 2:
                switch(ch) {
                case '_': case '$':
                case 'a': case 'b': case 'c': case 'd': case 'e':
                case 'f': case 'g': case 'h': case 'i': case 'j':
                case 'k': case 'l': case 'm': case 'n': case 'o':
                case 'p': case 'q': case 'r': case 's': case 't':
                case 'u': case 'v': case 'w': case 'x': case 'y':
                case 'z':
                case 'A': case 'B': case 'C': case 'D': case 'E':
                case 'F': case 'G': case 'H': case 'I': case 'J':
                case 'K': case 'L': case 'M': case 'N': case 'O':
                case 'P': case 'Q': case 'R': case 'S': case 'T':
                case 'U': case 'V': case 'W': case 'X': case 'Y':
                case 'Z':
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    value.push(ch.charCodeAt(0));
                    ++pos;
                break;
                default:
                    state = 3;
                }
            break;
            case 3:
                if(ch === '}') {
                    valid = true;
                    ++pos;
                    state = 10;
                }
                else {
                    errorCode = 5;
                    errorMessage = "An id in braces term must end with '}'.";
                }
            break;
            }
        }
        
        if(errorCode === 0 && !valid) {
            errorCode = 10;
            errorMessage = "";
        }
        
        return new ScannerResult(
            0, value,
            new karbonator.math.Interval(startIndex, pos),
            new ScannerError(errorCode, errorMessage)
        );
    };
    
    /**
     * @memberof RegexParser
     * @private
     * @constructor
     */
    RegexParser._CharSetParser = function () {
        this._exprCtxts = [];
        this._str = "";
        this._pos = 0;
        this._state = 0;
    };
    
    /**
     * @memberof RegexParser._CharSetParser
     * @private
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @returns {ScannerResult}
     */
    RegexParser._CharSetParser._scanPosixCharSet = function (str) {
        var startIndex = detail._selectNonUndefined(arguments[1], 0);
        var pos = startIndex;
        
        var state = 0;
        var ch = '';
        var className = "";
        
        var valueType = 0;
        var errorCode = 0;
        var errorMessage = "";
        
        while(
            state < 5
            && errorCode === 0
            && pos < str.length
        ) {
            switch(state) {
            case 0:
                if(str.charAt(pos) === '[') {
                    ++pos;
                    ++state;
                }
                else {
                    errorCode = 1;
                    errorMessage = "";
                }
            break;
            case 1:
                if(str.charAt(pos) === ':') {
                    ++pos;
                    ++state;
                }
                else {
                    errorCode = 2;
                    errorMessage = "";
                }
            break;
            case 2:
                ch = str.charAt(pos);
                if(ch === '^') {
                    valueType = 1;
                    ++pos;
                }

                ++state;
            break;
            case 3:
                ch = str.charAt(pos);
                if(ch >= 'A' && ch <= 'z') {
                    className += ch;
                    ++pos;
                }
                else if(ch === ':') {
                    ++pos;
                    ++state;
                }
                else {
                    errorCode = 3;
                    errorMessage = "";
                }
            break;
            case 4:
                if(str.charAt(pos) === ']') {
                    ++pos;
                    ++state;
                }
                else {
                    errorCode = 4;
                    errorMessage = "";
                }
            break;
            }
        }
        
        if(state < 5) {
            errorCode = 5;
            errorMessage = "";
        }
        
        return new ScannerResult(
            valueType, stringToCharCodes(className),
            new karbonator.math.Interval(startIndex, pos),
            new ScannerError(errorCode, errorMessage)
        );
    };
    
    /**
     * @memberof RegexParser._CharSetParser
     * @constructor
     * @param {Array.<karbonator.math.Interval>} codeRanges
     * @param {karbonator.math.Interval} textRange
     * @param {ScannerError} [error]
     */
    RegexParser._CharSetParser.Result = function (codeRanges, textRange) {
        this.codeRanges = codeRanges;
        this.textRange = textRange;
        
        this.error = arguments[3];
        if(karbonator.isUndefinedOrNull(this.error)) {
            this.error = new ScannerError();
        }
    };
    
    /**
     * @memberof RegexParser._CharSetParser
     * @private
     * @param {Number} type
     * @param {Object} value
     * @constructor
     */
    RegexParser._CharSetParser._Term = function (type, value) {
        this._type = type;
        this._value = value;
    };
    
    /**
     * @memberof RegexParser._CharSetParser
     * @private
     * @param {Number} returnState
     * @constructor
     */
    RegexParser._CharSetParser._ExprContext = function (returnState) {
        if(!karbonator.isNonNegativeSafeInteger(returnState)) {
            throw new TypeError("'returnState' must be a non-negative safe integer.");
        }
        
        this._returnState = returnState;
        this._negated = false;
        this._terms = [];
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexParser._CharSetParser._ExprContext.prototype.isEmpty = function () {
        return this._terms.length < 1;
    };
    
    /**
     * @function
     * @return {RegexParser._CharSetParser._Term}
     */
    RegexParser._CharSetParser._ExprContext.prototype.getLastTerm = function () {
        if(this.isEmpty()) {
            throw new Error("Expression context term stack underflow.");
        }
        
        return this._terms[this._terms.length - 1];
    };
    
    /**
     * @function
     * @param {Object} arg
     */
    RegexParser._CharSetParser._ExprContext.prototype.pushTerm = function (arg) {
        var newTerm = null;
        if(karbonator.isNonNegativeSafeInteger(arg)) {
            newTerm = new RegexParser._CharSetParser._Term(
                0,
                arg
            );
        }
        else if(arg instanceof Interval) {
            newTerm = new RegexParser._CharSetParser._Term(
                1,
                [arg]
            );
        }
        else if(karbonator.isArray(arg)) {
            newTerm = new RegexParser._CharSetParser._Term(
                1,
                arg
            );
        }
        else {
            throw new TypeError("");
        }
        
        this._terms.push(newTerm);
    };
    
    /**
     * @function
     * @return {Array.<karbonator.math.Interval>}
     */
    RegexParser._CharSetParser._ExprContext.prototype.evaluate = function () {
        var finalRanges = [];
        for(var i = 0; i < this._terms.length; ++i) {
            var term = this._terms[i];
            switch(term._type) {
            case 0:
                finalRanges.push(
                    new Interval(term._value, term._value)
                );
            break;
            case 1:
                finalRanges = finalRanges.concat(term._value);
            break;
            }
        }
        
        return (
            (
                !this._negated
                ? Interval.merge(finalRanges, _minInt, _maxInt)
                : Interval.negate(finalRanges, _minInt, _maxInt)
            )
        );
    };
    
    /**
     * @function
     * @param {String} str
     * @param {Number} [startIndex=0]
     * @return {RegexParser._CharSetParser.Result}
     */
    RegexParser._CharSetParser.prototype.parse = function (str) {
        this._str = str;
        
        var startIndex = detail._selectNonUndefined(arguments[1], 0);
        this._pos = startIndex;
        
        var valid = false;
        var errorCode = 0;
        var errorMessage = "";
        var scanResult = null;
        
        var negated = false;
        var finalRanges = null;
        
        this._state = 0;
        while(
            this._state < 10
            && this._pos < this._str.length
            && errorCode === 0
        ) {
            var exprCtxt = null;
            var ch = this._str.charAt(this._pos);
            
            switch(this._state) {
            case 0:
                if(ch === '[') {
                    this._exprCtxts.push(
                        new RegexParser._CharSetParser._ExprContext(this._state)
                    );
                    
                    ++this._pos;
                    this._state = 1;
                }
                else {
                    errorCode = 1;
                    errorMessage = "";
                }
            break;
            case 1:
                if(ch === '^') {
                    exprCtxt = this._getLastExprContext();
                    exprCtxt._negated = true;
                }
                
                this._state = 2;
            break;
            case 2:
                switch(ch) {
                case '[':
                    ++this._pos;
                    this._state = 3;
                break;
                case ']':
                    switch(this._exprCtxts.length) {
                    case 0:
                        errorCode = 11;
                        errorMessage = "There's no character sets to close.";
                    break;
                    case 1:
                        exprCtxt = this._exprCtxts.pop();
                        finalRanges = exprCtxt.evaluate();
                        
                        valid = true;
                        ++this._pos;
                        this._state = 10;                        
                    break;
                    default:
                        var ctxtToEval = this._exprCtxts.pop();
                        this._getLastExprContext().pushTerm(ctxtToEval.evaluate());
                        
                        ++this._pos;
                        this._state = ctxtToEval._returnState;
                    }
                break;
                case '-':
                    exprCtxt = this._getLastExprContext();
                    if(!exprCtxt.isEmpty()) {
                        ++this._pos;
                        this._state = 4;
                    }
                    else {
                        errorCode = 7;
                        errorMessage = "Range operators or "
                            + "character set difference operators "
                            + "must be appered after a left hand side term."
                        ;
                    }
                break;
                case '&':
                    errorCode = 2;
                    errorMessage = "Character set intersection operator"
                        + " is not implemented yet..."
                    ;
                break;
                case '\\':
                    scanResult = RegexParser._scanEscapedCharacter(this._str, this._pos);
                    if(scanResult.error.code === 0) {
                        exprCtxt = this._getLastExprContext();
                        
                        switch(scanResult.valueType) {
                        case 0:
                            exprCtxt.pushTerm(scanResult.value[0]);
                            
                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 1:
                            exprCtxt.pushTerm(
                                Enum.getValueAt(
                                    RegexParser._CharRange,
                                    scanResult.value[0]
                                ).getRange()
                            );
                            
                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 2:
                            exprCtxt.pushTerm(
                                Enum.getValueAt(
                                    RegexParser._CharRangeSet,
                                    scanResult.value[0]
                                ).getRanges()
                            );
                            
                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 3:
                            errorCode = 2;
                            errorMessage = "Referencing captures in character set is not valid.";
                        break;
                        }
                    }
                    else {
                        errorCode = scanResult.error.code + 20;
                        errorMessage = scanResult.error.message;
                    }
                break;
                default:
                    exprCtxt = this._getLastExprContext();
                    exprCtxt.pushTerm(ch.charCodeAt(0));
                    
                    ++this._pos;
                }
            break;
            case 3:
                switch(ch) {
                case ':':
                    --this._pos;
                    scanResult = RegexParser
                        ._CharSetParser
                        ._scanPosixCharSet(this._str, this._pos)
                    ;
                    if(scanResult.error.code === 0) {
                        exprCtxt = this._getLastExprContext();
                        
                        var charSet = RegexParser._CharRangeSet[
                            charCodesToString(scanResult.value)
                        ].getRanges();
                        if(scanResult.valueType !== 0) {
                            charSet = Interval.negate(
                                charSet,
                                _minInt,
                                _maxInt
                            );
                        }
                        exprCtxt.pushTerm(charSet);
                        
                        this._pos = scanResult.range.getMaximum();
                        this._state = 2;
                    }
                    else {
                        errorCode = scanResult.error.code + 10;
                        errorMessage = scanResult.error.message;
                    }
                break;
                case '=':
                    errorCode = 3;
                    errorMessage = "Posix collation sequences are not supported.";
                break;
                case '.':
                    errorCode = 4;
                    errorMessage = "Posix character equivalences are not supported.";                    
                break;
                default:
                    --this._pos;
                    this._state = 0;
                }
            break;
            case 4:
                exprCtxt = this._getLastExprContext();
                var rangeMax = 0;
                var lastTerm = exprCtxt._terms[exprCtxt._terms.length - 1];
                if(lastTerm._type === 0) {
                    switch(ch) {
                    case '['://Character set difference operator
                        //TODO : Write some proper codes...
                        throw new Error("Write some proper codes!");
                    break;
                    case '\\'://Range operator
                        scanResult = RegexParser._scanEscapedCharacter(this._str, this._pos);
                        if(scanResult.error.code === 0) {
                            switch(scanResult.valueType) {
                            case 0:
                                rangeMax = scanResult.value[0];
                                
                                this._pos = scanResult.range.getMaximum();
                            break;
                            case 1:
                            case 2:
                            case 3:
                                errorCode = 2;
                                errorMessage = "The right hand side of range operators must be a single character.";
                            break;
                            }
                        }
                        else {
                            errorCode = scanResult.error.code + 20;
                            errorMessage = scanResult.error.message;
                        }
                    break;
                    default://Range operator
                        rangeMax = ch.charCodeAt(0);

                        ++this._pos;
                    }
                    
                    if(errorCode === 0) {
                        exprCtxt._terms.pop();
                        exprCtxt.pushTerm(new Interval(lastTerm._value, rangeMax));
                        
                        this._state = 2;
                    }
                }
                else {
                    errorCode = 80;
                    errorMesssage = "The left hand side of range operators"
                        + " must be a single character."
                    ;
                }
            break;
            case 5:
                //TODO : Do character set operation
                //after the rhs character set has been parsed.
                
            break;
            case 6:
                if(ch === ']') {
                    //TODO : Create final ranges.
                    throw new Error("Write some proper codes!");
                }
                else {
                    errorCode = 90;
                    errorMesssage = "More terms"
                        + " after character set operation"
                        + " is not allowed."
                    ;
                }
            break;
            }
        }
        
        if(errorCode === 0 && !valid) {
            errorCode = 50;
            errorMessage = "";
        }
        
        return new RegexParser._CharSetParser.Result(
            finalRanges,
            new karbonator.math.Interval(startIndex, this._pos),
            new ScannerError(errorCode, errorMessage)
        );
    };
    
    /**
     * @private
     * @function
     * @return {RegexParser._CharSetParser._ExprContext}
     */
    RegexParser._CharSetParser.prototype._getLastExprContext = function () {
        if(this._exprCtxts.length < 1) {
            throw new Error("No more character set contexts left.");
        }
        
        return this._exprCtxts[this._exprCtxts.length - 1];
    };
    
    //테스트용 코드 삭제
    //karbonator.detail._CharSetParser = RegexParser._CharSetParser;
    
    /**
     * @memberof RegexParser
     * @private
     * @constructor
     */
    RegexParser._ExprContext = function () {
        this._opStack = [];
        this._termNodeStack = [];
        this._lastNodeType = -1;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RegexParser._ExprContext.prototype.getTermNodeCount = function () {
        return this._termNodeStack.length;
    };
    
    /**
     * @function
     * @param {Number} opKey
     * @param {Array.<Object>} [staticArgs]
     */
    RegexParser._ExprContext.prototype.pushOperator = function (opKey) {
        if(!karbonator.isNonNegativeSafeInteger(opKey)) {
            throw new TypeError("The parameter 'opKey' must be a non-negative safe integer.");
        }

        var opType = _opTypeMap.get(opKey);
        if(karbonator.isUndefinedOrNull(opType)) {
            throw new Error("A fatal error has occured. Cannot find the operator type information.");
        }
        
        var op = new Operator(opType, arguments[1]);
        //TODO : tokenExpressionCall을 term 취급하기 위한 임시 조치.
        if(opType.getParameterCount() < 2) {
            //TODO : 임시 조치
            if(opType.getKey() === OperatorTypeKeys.tokenExpressionCall) {
                if(
                    this._termNodeStack.length >= 1
                    && this._lastNodeType === RegexParser.AstNodeType.terminal
                ) {
                    this.pushOperator(OperatorTypeKeys.concatenation);
                }
            }
            
            this._createAndPushOperatorNode(op);
        }
        else {
            while(
                this._opStack.length > 0
            ) {
                var lastOp = this._opStack[this._opStack.length - 1];
                var lastOpType = lastOp.getType();
                if(
                    lastOpType.precedes(opType)
                    || (
                        opType.getAssociativity() === OperatorType.Associativity.leftToRight
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
            
            this._opStack.push(op);
            this._lastNodeType = RegexParser.AstNodeType.operator;
        }
    };
    
    /**
     * @function
     * @param {Number|karbonator.math.Interval|Array.<karbonator.math.Interval>|AstNode} arg
     */
    RegexParser._ExprContext.prototype.pushTerm = function (arg) {
        var termNode = null;
        if(arg instanceof AstNode) {
            termNode = arg;
        }
        else if(karbonator.isNonNegativeSafeInteger(arg)) {
            termNode = new AstNode(
                RegexParser.AstNodeType.terminal,
                [new Interval(arg, arg)]
            );
        }
        else if(arg instanceof Interval) {
            termNode = new AstNode(
                RegexParser.AstNodeType.terminal,
                [arg]
            );
        }
        else if(karbonator.isArray(arg)) {
            termNode = new AstNode(
                RegexParser.AstNodeType.terminal,
                arg
            );
        }
        else {
            throw new TypeError(
                "The argument must be either "
                + "'AstNode', 'Interval', an array of 'Interval'"
                + ", or a non-negative safe integer."
            );
        }
        
        if(
            this._termNodeStack.length >= 1
            && this._lastNodeType === RegexParser.AstNodeType.terminal
        ) {
            this.pushOperator(OperatorTypeKeys.concatenation);
        }
        
        this._termNodeStack.push(termNode);
        this._lastNodeType = RegexParser.AstNodeType.terminal;
    };

    /**
     * @function
     * @return {AstNode|null}
     */
    RegexParser._ExprContext.prototype.evaluateAll = function () {
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
    RegexParser._ExprContext.prototype._createAndPushOperatorNode = function (op) {
        assertion.isInstanceOf(op, Operator);
        
        var opType = op.getType();
        
        var termNodeCount = this._termNodeStack.length;
        var paramCount = opType.getParameterCount();
        if(termNodeCount < paramCount) {
            throw new Error("Not enough parameters.");
        }
        
        var opNode = new AstNode(RegexParser.AstNodeType.operator, op);
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
            case OperatorType.Associativity.none:
            break;
            case OperatorType.Associativity.leftToRight:
                childNode = opNode.getChildAt(0);
                if(
                    !childNode.isRootOfGroup()
                    && childNode.getType() === RegexParser.AstNodeType.operator
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
            case OperatorType.Associativity.rightToLeft:
                childNode = opNode.getChildAt(1);
                if(
                    !childNode.isRootOfGroup()
                    && childNode.getType() === RegexParser.AstNodeType.operator
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
        
        this._lastNodeType = RegexParser.AstNodeType.terminal;
    };
    
    /**
     * @function
     * @param {String} regexStr
     * @param {Number} [tokenKey=0]
     * @param {karbonator.collection.TreeMap|karbonator.collection.ListMap} [tokenNameKeyMap]
     * @return {AstNode}
     */
    RegexParser.prototype.parse = function (regexStr) {
        if(!karbonator.isString(regexStr)) {
            throw new TypeError("'regexStr' must be a string that represents a regular expression.");
        }
        
        var tokenKey = arguments[1];
        if(karbonator.isUndefined(tokenKey)) {
            tokenKey = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(tokenKey)) {
            throw new TypeError("'tokenKey' must be a non-negative safe integer.");
        }
        
        var tokenNameKeyMap = arguments[2];
        if(
            !karbonator.isUndefined(tokenNameKeyMap)
            && !(
                tokenNameKeyMap instanceof karbonator.collection.TreeMap
                || tokenNameKeyMap instanceof karbonator.collection.ListMap
            )
        ) {
            throw new TypeError(
                "'tokenNameKeyMap'"
                + " must be a "
                + "{string, non-negative integer}"
                + " map collection."
            );
        }
        
        var charSetParser = new RegexParser._CharSetParser();
        
        this._regexStr = regexStr;
        this._state = 0;
        this._exprCtxStack.length = 0;
        this._exprCtxStack.push(new RegexParser._ExprContext());
        this._pos = 0;
        this._error.occured = false;
        
        this._parsing = true;
        
        //1. infix to postfix 및 postfix 계산기 기법 활용
        //2. 반복 연산자는 연산자 스택에 넣지 말고
        //   가장 마지막으로 입력된 character-term에 대해 바로 연산을 수행 해서
        //   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
        //3. ')'가 입력되는 순간 '('까지의 모든 연산자들을 즉시 계산하고
        //   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
        //4. '('가 입력되면 concat 연산자를 먼저 push하고 '('를 스택에 push.
        //5. character-term이 입력되면 concat 연산자를 먼저 연산자 스택에 push하고
        //   입력된 character-term을 토큰 스택에 push.
        
        for(
            var regexLen = this._regexStr.length;
            this._parsing && this._pos < regexLen;
        ) {
            var groupRootNode = null;
            var scanResult = null;
            
            var exprCtx = this._getLastExpressionContext();
            var ch = this._regexStr.charAt(this._pos);
            
            switch(this._state) {
            case 0:
                switch(ch) {
                case '\r': case '\n':
                break;
                case '^':
                    this._cancelParsing("Start of string anchor is not implemented yet...");
                break;
                case '$':
                    this._cancelParsing("End of string anchor is not implemented yet...");
                break;
                case '(':
                    this._exprCtxStack.push(new RegexParser._ExprContext());
                    
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
                            this._cancelParsing("There are some errors in the grouped expression.");
                        }
                    }
                    else {
                        this._cancelParsing("There is no open parenthesis.");
                    }
                break;
                case '{':
                    ++this._pos;
                    this._state = 1;
                break;
                case '*': case '+': case '?':
                    this._processRepetitionOperator();
                break;
                case '}':
                    this._cancelParsing("An invalid token that specifies end of constrained repetition has been found.");
                break;
                case '|':
                    exprCtx.pushOperator(OperatorTypeKeys.alternation);

                    this._moveToNextIfNoError();
                break;
                case '\\':
                    scanResult = RegexParser._scanEscapedCharacter(
                        this._regexStr,
                        this._pos
                    );
                    if(scanResult.error.code === 0) {
                        switch(scanResult.valueType) {
                        case 0:
                            exprCtx.pushTerm(scanResult.value[0]);

                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 1:
                            exprCtx.pushTerm(
                                Enum.getValueAt(
                                    RegexParser._CharRange,
                                    scanResult.value[0]
                                ).getRange()
                            );

                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 2:
                            exprCtx.pushTerm(
                                Enum.getValueAt(
                                    RegexParser._CharRangeSet,
                                    scanResult.value[0]
                                ).getRanges()
                            );

                            this._pos = scanResult.range.getMaximum();
                        break;
                        case 3:
                            this._cancelParsing("Back referencing is not supported.");
                        break;
                        }
                    }
                    else {
                        this._cancelParsing(scanResult.error.message);
                    }
                break;
                case '[':
                    var charSetResult = charSetParser.parse(
                        this._regexStr,
                        this._pos
                    );
                    if(charSetResult.error.code === 0) {
                        exprCtx.pushTerm(charSetResult.codeRanges);

                        this._pos = charSetResult.textRange.getMaximum();
                    }
                    else {
                        this._cancelParsing(charSetResult.error.message);
                    }
                break;
                case ']':
                    this._cancelParsing("An invalid token that specifies end of a character set has been found.");
                break;
                case '.':
                    exprCtx.pushTerm(RegexParser._CharRange.anyChars.getRange());

                    this._moveToNextIfNoError();
                break;
                default:
                    exprCtx.pushTerm(this._regexStr.charCodeAt(this._pos));

                    this._moveToNextIfNoError();
                }
            break;
            case 1://Starts with '{'.
                switch(ch) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    --this._pos;
                    this._processRepetitionOperator();
                    
                    this._state = 0;
                break;
                default:
                    --this._pos;
                    scanResult = RegexParser._scanIdInBraces(
                        this._regexStr,
                        this._pos
                    );
                    if(scanResult.error.code === 0) {
                        var targetTokenName = charCodesToString(scanResult.value);
                        var targetTokenKey = tokenNameKeyMap.get(targetTokenName);
                        if(!karbonator.isUndefined(targetTokenKey)) {
                            exprCtx.pushOperator(
                                OperatorTypeKeys.tokenExpressionCall,
                                [targetTokenKey]
                            );
                            
                            this._pos = scanResult.range.getMaximum();
                            this._state = 0;
                        }
                        else {
                            this._cancelParsing("'" + targetTokenName + "' is not defined.");
                        }
                    }
                    else {
                        this._cancelParsing(scanResult.error.message);
                    }
                }
            break;
            case 2://Starts with '('.
                
            break;
            }
        }
        
        var astRootNode = null;
        var exprRootNode = null;
        if(this._parsing) {
            this._parsing = false;
            exprRootNode = this._getLastExpressionContext().evaluateAll();
        }
        
        if(null !== exprRootNode) {
            astRootNode = new AstNode(
                RegexParser.AstNodeType.operator,
                new Operator(
                    _opTypeMap.get(OperatorTypeKeys.accept),
                    [tokenKey]
                )
            );
            astRootNode.addChild(exprRootNode);
        }
        else {
            this._cancelParsing(this._error.message);
        }
        
        return astRootNode;
    };
    
    /**
     * @private
     * @function
     * @return {RegexParser._ExprContext}
     */
    RegexParser.prototype._getLastExpressionContext = function () {
        return this._exprCtxStack[this._exprCtxStack.length - 1];
    };
    
    /**
     * @private
     * @function
     */
    RegexParser.prototype._processRepetitionOperator = function () {
        var scanResult = RegexParser._scanRepetitionOperator(
            this._regexStr,
            this._pos
        );
        if(scanResult.error.code === 0) {
            if(scanResult.valueType === 1) {
                this._cancelParsing("Possessive quantifiers are not supported.");
            }
            else {
                this._getLastExpressionContext().pushOperator(
                    OperatorTypeKeys.repetition,
                    [
                        scanResult.valueType,
                        new Interval(
                            scanResult.value[0], 
                            scanResult.value[1]
                        )
                    ]
                );
                
                this._pos = scanResult.range.getMaximum();
            }
        }
        else {
            this._cancelParsing(scanResult.error.message);
        }
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
            this._lines.push(detail._copyIntArray(rhs._lines[i]));
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
    InstructionBuffer.prototype.putFront = function (inst) {
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
        
        this._lines.splice(0, 0, line);
        
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
     * @param {Array.<karbonator.math.Interval>} ranges
     * @param {Array.<Number>} rangeIndexSets
     * @return {RegexVm.Bytecode}
     */
    InstructionBuffer.prototype.printBytecode = function (ranges, rangeIndexSets) {
        var lineLen = this._lines.length;
        for(var i = 0; i < lineLen; ++i) {
            var line = this._lines[i];

            var inst = RegexVm.findInstructionByOpCode(line[0]);
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
        
        return new RegexVm.Bytecode(
            ranges,
            rangeIndexSets,
            this._byteOrderReversed,
            codeBlock,
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
        this._tokenKeySrNdxMap = new TreeMap(karbonator.integerComparator);
        this._localSrBuffers = [];
        this._tokenSrBuffers = [];
        this._keyTokenMap = null;
        
        this._ranges = new ListSet(_edgeComparator);
        this._rangeIndexSets = new ListSet(
            function (l, r) {
                var lenDiff = l.length - r.length;
                if(lenDiff !== 0) {
                    return lenDiff;
                }
                
                for(var i = 0; i < l.length; ++i) {
                    var ndxDiff = l[i] - r[i];
                    if(ndxDiff !== 0) {
                        return ndxDiff;
                    }
                }
                
                return 0;
            }
        );
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
     * @param {karbonator.collection.ListMap} keyTokenMap
     * @return {RegexVm.Bytecode}
     */
    CodeEmitter.prototype.emitCode = function (rootNode, keyTokenMap) {
        if(!(rootNode instanceof AstNode)) {
            throw new TypeError("The parameter must be an instance of 'AstNode'.");
        }
        
        this._keyTokenMap = keyTokenMap;
        this._tokenKeySrNdxMap.clear();
        this._localSrBuffers.length = 0;
        this._tokenSrBuffers.length = 0;
        this._ranges.clear();
        this._rangeIndexSets.clear();
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
        
        var bytecode = instBuffer.printBytecode(
            Array.from(this._ranges),
            Array.from(this._rangeIndexSets)
        ); 
        
        this._keyTokenMap = null;
        
        return bytecode;
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
        
        var buffer = new InstructionBuffer(this._byteOrderReversed);
        
        if(node.isRootOfGroup()) {
            buffer.put(RegexVm.Instruction.beginGroup, 0);
        }
        
        switch(node.getType()) {
        case RegexParser.AstNodeType.operator:
            var op = node.getValue();
            switch(op.getType().getKey()) {
            case OperatorTypeKeys.accept:
                buffer = this._visitAccept(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            case OperatorTypeKeys.tokenExpressionCall:
                buffer = this._visitTokenExpressionCall(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            case OperatorTypeKeys.regexAlternation:
                buffer = this._visitRegexAlternation(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            case OperatorTypeKeys.alternation:
                buffer = this._visitAlternation(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            case OperatorTypeKeys.concatenation:
                buffer = this._visitConcatenation(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            case OperatorTypeKeys.repetition:
                buffer = this._visitRepetition(
                    buffer,
                    node,
                    op.getStaticArguments()
                );
            break;
            default:
                throw new Error("An unknown operator has been found.");
            }
        break;
        case RegexParser.AstNodeType.terminal:
            buffer = this._visitTerminal(
                buffer,
                node
            );
        break;
        default:
            throw new Error("An unknown ast node type has been detected.");
        }
        
        if(node.isRootOfGroup()) {
            buffer.put(RegexVm.Instruction.endGroup, 0);
        }
        
        this._nodeCodeMap.set(node, buffer);
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitRegexAlternation = function (buffer, node) {
        var offsetInfo = this._caculateSumOfChildCodeOffset(node);
        var offset = offsetInfo.sum;
        var childCount = node.getChildCount();
        var codeLen = 2;
        var calledTokenCount = 0;
        for(var i = 0; i < childCount; ++i) {
            var childNode = node.getChildAt(i);
            if(
                childNode.getType() !== RegexParser.AstNodeType.operator
                || childNode.getValue().getType().getKey() !== OperatorTypeKeys.accept
            ) {
                throw new Error("Parameter nodes of 'regexAlternation' operator must be 'accept' operator nodes.");
            }
            
            var token = this._keyTokenMap.get(childNode.getValue().getStaticArguments()[0]);
            if(token._subRoutineOnly) {
                continue;
            }
            
            if(i < childCount - 1) {
                offset -= offsetInfo.lengths[i];
                buffer.put(RegexVm.Instruction.fork, 0, offsetInfo.lengths[i] + 1);
            }
            
            buffer.consume(this._nodeCodeMap.get(childNode));
            
            if(i < childCount - 1) {
                buffer.put(RegexVm.Instruction.bra, (childCount - 2 - i) * codeLen + offset);
            }
            
            ++calledTokenCount;
        }
        
        if(calledTokenCount < 1) {
            buffer.put(RegexVm.Instruction.rts);
        }
        
        this._mergeAllTokenSubRoutines(buffer);
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @param {Array.<Number>} staticArgs
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitAccept = function (buffer, node, staticArgs) {
        var tokenKey = staticArgs[0];
        
        this._createTokenSubRoutine(node, tokenKey);
        
        buffer.put(RegexVm.Instruction.jsr, 0.2, tokenKey);
        buffer.put(RegexVm.Instruction.accept, tokenKey);
        buffer.put(RegexVm.Instruction.rts);
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @param {Array.<Number>} staticArgs
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitTokenExpressionCall = function (buffer, node, staticArgs) {
        node;
        
        buffer.put(RegexVm.Instruction.jsr, 0.2, staticArgs[0]);
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitAlternation = function (buffer, node) {
        var offsetInfo = this._caculateSumOfChildCodeOffset(node);
        var offset = offsetInfo.sum;
        var childCount = node.getChildCount();
        var codeLen = 2;
        for(var i = 0; i < childCount - 1; ++i) {
            offset -= offsetInfo.lengths[i];
            
            buffer.put(RegexVm.Instruction.pfork, 0, offsetInfo.lengths[i] + 1);
            buffer.consume(this._getAndWrapChildCode(node, i));
            buffer.put(RegexVm.Instruction.bra, (childCount - 2 - i) * codeLen + offset);
        }
        if(i < childCount) {
            buffer.consume(this._getAndWrapChildCode(node, i));
        }
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitConcatenation = function (buffer, node) {
        var childCount = node.getChildCount();
        for(var i = 0; i < childCount; ++i) {
            buffer.consume(this._getAndWrapChildCode(node, i));
        }
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @param {Array.<Number>} staticArgs
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitRepetition = function (buffer, node, staticArgs) {
        var repType = staticArgs[0];
        var repRange = staticArgs[1];
        
        var childNode = node.getChildAt(0);
        var childCode = this._nodeCodeMap.get(childNode);
        
        var minRep = repRange.getMinimum();
        switch(minRep) {
        case 0:
        break;
        case 1:
            buffer.add(childCode);
        break;
        default:
            //TODO : A stub. Should be optimized
            //by using repetition bytecodes if possible.
            for(var i = 0; i < minRep; ++i) {
                buffer.add(childCode);
            }
        }
        
        var childCodeLen = childCode.getCount();
        var isNonGreedy = repType === 2;
        var maxRep = repRange.getMaximum();
        if(maxRep >= _maxInt) {
            if(isNonGreedy) {
                buffer.put(RegexVm.Instruction.pfork, childCodeLen + 1, 0);
            }
            else {
                buffer.put(RegexVm.Instruction.pfork, 0, childCodeLen + 1);
            }
            
            buffer.consume(childCode);
            
            buffer.put(RegexVm.Instruction.bra, -(childCodeLen + 2));
        }
        else if(minRep !== maxRep) {
            var optRepCount = repRange.getMaximum() - repRange.getMinimum();
            
            //TODO : A stub. Should be optimized
            //by using repetition bytecodes if possible.
            for(var i = 0; i < optRepCount; ++i) {
                if(isNonGreedy) {
                    buffer.put(RegexVm.Instruction.pfork, childCodeLen, 0);
                }
                else {
                    buffer.put(RegexVm.Instruction.pfork, 0, childCodeLen);
                }
                
                if(i < optRepCount - 1) {
                    buffer.add(childCode);
                }
                else {
                    buffer.consume(childCode);
                }
            }
        }
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @param {AstNode} node
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._visitTerminal = function (buffer, node) {
        var ranges = node.getValue();
        
        var range = null;
        switch(ranges.length) {
        case 0:
            throw new Error("A list of terminal input range must have at least 1 range.");
        //break;
        case 1:
            range = ranges[0];
            if(range.getMinimum() === range.getMaximum()) {
                buffer.put(
                    RegexVm.Instruction.testCode,
                    range.getMinimum()
                );
            }
            else {
                this._ranges.add(range);
                buffer.put(
                    RegexVm.Instruction.testRange,
                    this._ranges.indexOf(range)
                );
            }
        break;
        default:
            var rangeSet = [];
            for(var i = 0; i < ranges.length; ++i) {
                range = ranges[i];
                this._ranges.add(range);
                var rangeNdx = this._ranges.indexOf(range);
                rangeSet.push(rangeNdx);
            }
            
            this._rangeIndexSets.add(rangeSet);
            buffer.put(
                RegexVm.Instruction.testRanges,
                this._rangeIndexSets.indexOf(rangeSet)
            );
        }
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {AstNode} node
     * @param {Number} tokenKey
     * @return {Number}
     */
    CodeEmitter.prototype._createTokenSubRoutine = function (node, tokenKey) {
        var buffer = new InstructionBuffer(this._byteOrderReversed);
        
        var srNdx = this._tokenSrBuffers.length;
        
        buffer.put(RegexVm.Instruction.beginGroup, 0);
        buffer.consume(this._getAndWrapChildCode(node, 0));
        buffer.put(RegexVm.Instruction.endGroup, 0);
        
        this._labelGroups(buffer);
        
        buffer.put(RegexVm.Instruction.consume);
        buffer.put(RegexVm.Instruction.rts);
        
        this._tokenSrBuffers.push(buffer);
        
        this._tokenKeySrNdxMap.set(tokenKey, srNdx);
        
        return srNdx;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     */
    CodeEmitter.prototype._mergeAllTokenSubRoutines = function (buffer) {
        var offset = buffer.getCount();
        var tokenSrAddrs = [];
        for(var i = 0; i < this._tokenSrBuffers.length; ++i) {
            var tokenSrBuffer = this._tokenSrBuffers[i];
            var tokenSrLineCount = tokenSrBuffer.getCount();
            
            tokenSrAddrs.push(offset);
            buffer.consume(tokenSrBuffer);
            
            offset += tokenSrLineCount;
        }
        this._tokenSrBuffers.length = 0;
        
        var jsrOpCode = RegexVm.Instruction.jsr.getOpCode();
        for(var i = 0; i < buffer.getCount(); ++i) {
            var line = buffer.getLineAt(i);
            if(line[0] === jsrOpCode && line[1] === 0.2) {
                line[1] = tokenSrAddrs[this._tokenKeySrNdxMap.get(line[2])];
                line.pop();
            }
        }
    };
    
    /**
     * @private
     * @function
     * @param {AstNode} parentNode
     * @param {Number} childIndex
     * @returns {InstructionBuffer}
     */
    CodeEmitter.prototype._getAndWrapChildCode = function (parentNode, childIndex) {
        var childNode = parentNode.getChildAt(childIndex);
        var childCode = this._nodeCodeMap.get(childNode);
        
        //this._fillLabelAddress(childCode, childCode.getCount(), 0.1);
//        if(childNode.isRootOfGroup()) {
//            this._wrapWithGroupBoundary(childCode);
//        }
        
        return childCode;
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
     * @param {InstructionBuffer} buffer
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._wrapWithGroupBoundary = function (buffer) {
        buffer.putFront(RegexVm.Instruction.beginGroup, 0);
        buffer.put(RegexVm.Instruction.endGroup, 0);
        
        return buffer;
    };
    
    /**
     * @private
     * @function
     * @param {InstructionBuffer} buffer
     * @return {InstructionBuffer}
     */
    CodeEmitter.prototype._labelGroups = function (buffer) {
        var startIndex = 0;
        
        var beginGroupOpCode = RegexVm.Instruction.beginGroup.getOpCode();
        var endGroupOpCode = RegexVm.Instruction.endGroup.getOpCode();        
        
        var lineCount = buffer.getCount();
        var groupIndex = startIndex;
        
        var groupIndexStack = [];
        for(var i = 0; i < lineCount; ++i) {
            var line = buffer.getLineAt(i);
            
            switch(line[0]) {
            case beginGroupOpCode:
                groupIndexStack.push(groupIndex);
                line[1] = groupIndex;
                ++groupIndex;
            break;
            case endGroupOpCode:
                if(groupIndexStack.length < 1) {
                    throw new Error("Some group pairs lack an open or close parenthesis.");
                }
                line[1] = groupIndexStack.pop();
            break;
            }
        }
        
        if(groupIndexStack.length > 0) {
            throw new Error("Some group pairs lack an open or close parenthesis.");
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
    //Lexer
    
    /**
     * @memberof karbonator.string
     * @constructor
     */
    var Lexer = function () {
        this._keyTokenMap = new TreeMap(karbonator.integerComparator);
        this._nameKeyMap = new ListMap(karbonator.stringComparator);
        this._regexVm = new RegexVm();
        
        this._inStr = "";
        this._pos = 0;
        this._scannedTokenCount = 0;
        this._prevResult = null;
    };
    
    /**
     * @memberof karbonator.string.Lexer
     * @constructor
     * @param {Number} key
     * @param {String} name
     * @param {String} regexText
     * @param {Boolean} subRoutineOnly
     */
    Lexer.Token = function (key, name, regexText, subRoutineOnly) {
        if(!karbonator.isNonNegativeSafeInteger(key)) {
            throw new TypeError("'key' must be a non-negative safe integer.");
        }
        if(!karbonator.isString(name)) {
            throw new TypeError("'name' must be a string.");
        }
        if(!karbonator.isString(regexText)) {
            throw new TypeError("'regexText' must be a string.");
        }
        
        this.key = key;
        this.name = name;
        this.regexText = regexText;
        this.subRoutineOnly = !!subRoutineOnly;
    };
    
    /**
     * @function
     * @returns {String}
     */
    Lexer.Token.prototype.toString = function () {
        var str = '{';
        
        str += "key";
        str += " : ";
        str += this.key;
        
        str += ", ";
        str += "name";
        str += " : ";
        str += '\"' + this.name + '\"';
        
        str += ", ";
        str += "regexText";
        str += " : ";
        str += '\"' + this.regexText + '\"';
        
        str += ", ";
        str += "subRoutineOnly";
        str += " : ";
        str += this.subRoutineOnly;
        
        str += '}';
        
        return str;
    };
    
    /**
     * @function
     * @param {Number|String} arg0
     * @param {karbonator.string.Lexer.Token|null}
     */
    Lexer.prototype.getToken = function (arg0) {
        var key = arg0;
        if(karbonator.isString(arg0)) {
            key = this._nameKeyMap.get(arg0);
            if(karbonator.isUndefined(key)) {
                return null;
            }
        }
        else if(!karbonator.isNonNegativeSafeInteger(arg0)) {
            throw new TypeError("A non-negative integer or a string must be passed.");
        }
        
        var token = this._keyTokenMap.get(key);
        if(karbonator.isUndefined(token)) {
            token = null;
        }
            
        return token;
    };
    
    /**
     * @function
     * @param {String} str
     */
    Lexer.prototype.setInput = function (str) {
        if(!karbonator.isString(str)) {
            throw new TypeError("'str' must be a string.");
        }
        this._inStr = str;
        this.rewind();
    };
    
    /**
     * @function
     * @param {Function} callback
     * @return {Boolean}
     */
    Lexer.prototype.scanNext = function (callback) {
        if(!karbonator.isFunction(callback)) {
            throw new TypeError("'callback' must be a function.");
        }
        
        var hasNext = true;
        
        var result = this._regexVm.find(this._inStr, this._pos);
        if(null !== result) {
            if(
                null === this._prevResult
                || !this._prevResult[karbonator.equals](result)
            ) {
                this._pos = result.range.getMaximum();
                
                callback(result, this._scannedTokenCount, this);
                
                this._prevResult = result;
                ++this._scannedTokenCount;
            }
            else {
                hasNext = false;
            }
        }
        else {
            ++this._pos;
            
            if(this._pos >= this._inStr.length) {
                hasNext = false;
            }
        }
        
        return hasNext;
    };
    
    /**
     * @function
     */
    Lexer.prototype.rewind = function () {
        this._scannedTokenCount = 0;
        this._pos = 0;
        this._prevResult = null;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //LexerGenerator
    
    /**
     * @memberof karbonator.string
     * @constructor
     */
    var LexerGenerator = function () {
        this._keySeq = 0;
        this._keyTokenMap = new TreeMap(karbonator.integerComparator);
        this._nameKeyMap = new ListMap(karbonator.stringComparator);
        this._regexParser = new RegexParser();
        this._bytecodeEmitter = new CodeEmitter();
    };
    
    /**
     * @memberof LexerGenerator
     * @private
     * @constructor
     * @param {Number} key
     * @param {String} name
     * @param {String} regexText
     * @param {Boolean} subRoutineOnly
     * @param {AstNode} astRootNode
     */
    LexerGenerator._Token = function (
        key, name,
        regexText,
        subRoutineOnly,
        astRootNode
    ) {
        this._key = key;
        this._name = name;
        this._regexText = regexText;
        this._subRoutineOnly = subRoutineOnly;
        this._astRootNode = astRootNode;
    };
    
    /**
     * @function
     * @return {String}
     */
    LexerGenerator._Token.prototype.toString = function () {
        var str = '{';
        
        str += "key";
        str += " : ";
        str += this._key;
        
        str += ", ";
        str += "name";
        str += " : ";
        str += this._name;
        
        str += ", ";
        str += "regex";
        str += " : ";
        str += this._regexText;
        
        str += ", ";
        str += "subRoutineOnly";
        str += " : ";
        str += this._subRoutineOnly;
        
        str += ", ";
        str += "ast";
        str += " : ";
        str += this._astRootNode;
        
        str += '}';
        
        return str;
    };
    
    /**
     * @function
     * @return {Number}
     */
    LexerGenerator.prototype.getTokenCount = function () {
        return this._nameKeyMap.getElementCount();
    };
    
    /**
     * @function
     * @param {String} name
     * @return {LexerGenerator._Token|undefined}
     */
    LexerGenerator.prototype.getToken = function (name) {
        return this._nameKeyMap.get(name);
    };
    
    /**
     * @function
     * @param {String} name
     * @param {String} regexText
     * @param {Boolean} [subRoutineOnly=false]
     * @return {Number}
     */
    LexerGenerator.prototype.defineToken = function (name, regexText) {
        var tokenKey = this._nameKeyMap.get(name);
        if(karbonator.isUndefined(tokenKey)) {
            tokenKey = this._keySeq;
            ++this._keySeq;
            
            this._nameKeyMap.set(name, tokenKey);
        }
        
        var astRootNode = this._regexParser.parse(
            regexText,
            tokenKey, this._nameKeyMap
        );
        if(null === astRootNode) {
            this._nameKeyMap.remove(name);
            --this._keySeq;
            
            throw new Error(this._regexParser._error.message);
        }
        
        var newToken = new LexerGenerator._Token(
            tokenKey, name,
            regexText,
            !!arguments[2],
            astRootNode
        );
        this._keyTokenMap.set(tokenKey, newToken);
        
        return tokenKey;
    };
    
    /**
     * @function
     * @param {String} name
     */
    LexerGenerator.prototype.undefineToken = function (name) {
        this._nameKeyMap.remove(name);
    };
    
    /**
     * @function
     */
    LexerGenerator.prototype.undefineAllTokens = function () {
        this._nameKeyMap.clear();
        this._keyTokenMap.clear();
        this._keySeq = 0;
    };
    
    /**
     * @function
     * @return {karbonator.string.Lexer|null}
     */
    LexerGenerator.prototype.generate = function () {
        var regexStr = "";
        var rootNode = new AstNode(
            RegexParser.AstNodeType.operator,
            new Operator(
                _opTypeMap.get(OperatorTypeKeys.regexAlternation)
            )
        );
        karbonator.forOf(
            this._keyTokenMap,
            function (pair) {
                var token = pair[1];
                regexStr += (regexStr === "" ? "" : "|||");
                if(token._subRoutineOnly) {
                    regexStr += "(@{subRoutineOnly}" + token._regexText + ')';
                }
                else {
                    regexStr += token._regexText;
                }
                regexStr += "(@{accept}{" + token._key + '})';
                rootNode.addChild(token._astRootNode);
            },
            this
        );
        
        var lexer = new string.Lexer();
        var bytecode = this._bytecodeEmitter.emitCode(
            rootNode,
            this._keyTokenMap
        );
        bytecode._regexStr = regexStr;
        lexer._regexVm._bytecode = bytecode;
        
        karbonator.forOf(
            this._keyTokenMap,
            function (pair) {
                var key = pair[0];
                var token = pair[1];
                this._keyTokenMap.set(
                    key,
                    new Lexer.Token(
                        key, token._name,
                        token._regexText,
                        token._subRoutineOnly
                    )
                );
                this._nameKeyMap.set(token._name, key);
            },
            lexer
        );
        
        return lexer;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //LrParser
    
    var LrParser = function () {
        
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //LrParserGenerator
    
    var GrammarSyntax = function () {
        this._symbolNdxes = [];
    };
    
    var GrammarRule = function () {
        this._nonTermNdx = 0;
        this._syntaxes = [];
    };
    
    var LrItem = function () {
        this._ruleNdx = 0;
        this._lookaheadNdxes = [];
    };
    
    /**
     * @constructor
     */
    var LrParserGenerator = function () {
        this._lg = new LexerGenerator();
    };
    
    /**
     * @function
     * @param {String} name
     * @param {String|Array.<String>} syntaxArg
     * @param {Boolean} [overwrite=false]
     */
    LrParserGenerator.prototype.addRule = function (name, syntaxArg) {
        
    };
    
    /**
     * @function
     * @return {karbonator.string.LrParser|null}
     */
    LrParserGenerator.prototype.generate = function () {
        
    };
    
    /*////////////////////////////////*/
    
    string.MatchResult = MatchResult;
    string.Lexer = Lexer;
    string.LexerGenerator = LexerGenerator;
    
    string.LrParser = LrParser;
    string.LrParserGenerator = LrParserGenerator;
    
    return karbonator;
})
));
