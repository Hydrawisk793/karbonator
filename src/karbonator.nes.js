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
    
    var detail = karbonator.detail;
    
    var Symbol = detail._selectSymbol();
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var nes = karbonator.nes || {};
    karbonator.nes = nes;
    
    var lg = new karbonator.string.LexerGenerator();
    lg.defineToken("nz_digit", "[1-9]", true);
    lg.defineToken("digit", "[0-9]", true);
    lg.defineToken("blank", "[ \t]");
    lg.defineToken("id", "[a-zA-Z_$][a-zA-Z_$0-9]*");
    lg.defineToken("lit-string", "\".*?\"");
    lg.defineToken("global_label", "{id}:");
    lg.defineToken("local_label", "\\.{global_label}");
    lg.defineToken("local_rel_label", "\\.(\\+|\\-)?[1-9][0-9]*");
    lg.defineToken("imm_base2_int", "#%[0-1]{1,8}");
    lg.defineToken("imm_base16_int", "#([a-zA-Z0-9]{2})+");
    lg.defineToken("ows", "\\s*");
    lg.defineToken("ws", "\\s+");
    
    /**
     * @function
     * @param {Number} value
     * @param {Number} figure
     * @returns {String}
     */
    var _formatHexadecimal = function (value, figure) {
        var zeros = "";
        var str = value.toString("16").toUpperCase();
        for(var i = figure - str.length; i > 0; ) {
            --i;
            zeros += "0";
        }
        
        return zeros + str;
    };
    
    /*////////////////////////////////*/
    //Label
    
    /**
     * @constructor
     * @param {Number} id
     * @param {String} name
     * @param {Number} type
     * @param {Number} address
     * @param {Number} [byteCount=0]
     * @param {Label} [parent=null]
     */
    var Label = function (id, name, type, address) {
        if(!karbonator.isNonNegativeSafeInteger(id)) {
            throw new TypeError("");
        }
        if(!karbonator.isString(name)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(type)) {
            throw new TypeError("");
        }
        
        if(!karbonator.isNonNegativeSafeInteger(address)) {
            throw new TypeError("");
        }
        
        this.id = id;
        this.name = name;
        this.type = 0;
        this.address = address;
        
        this.byteCount = arguments[4];
        if(karbonator.isUndefined(this.byteCount)) {
            this.byteCount = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(this.byteCount)) {
            throw new TypeError("");
        }
        
        this.parent = arguments[5];
        if(karbonator.isUndefined(this.parent)) {
            this.parent = null;
        }
        else if(!(this.parent instanceof Label)) {
            throw new TypeError("");
        }
    };
    
//    /**
//     * @memberof Label
//     * @readonly
//     * @function
//     * @param {Label} lhs
//     * @param {Label} rhs
//     * @return {Number}
//     */
//    Label.comparator = function (lhs, rhs) {
//        if(!(lhs instanceof Label) || !(rhs instanceof Label)) {
//            throw new Error("Both 'lhs' and 'rhs' must be an instnaceof 'Label'.");
//        }
//        
//        return karbonator.stringComparator(lhs.name, rhs.name);
//    };
    
    /**
     * @function
     * @return {String}
     */
    Label.prototype.toString = function () {
        var str = '{';
        
        str += "name";
        str += " : ";
        str += this.name;
        
        str += ", ";
        str += "type";
        str += " : ";
        str += this.type;

        str += ", ";
        str += "address";
        str += " : ";
        str += "0x" + _formatHexadecimal(this.address, 4);
        
        str += '}';
        
        return str;
    };
    
    /**
     * @memberof Label
     * @readonly
     * @enum {Number}
     */
    Label.Type = {
        code : 0,
        data : 1
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Disassembler
    
    /**
     * @memberof karbonator.nes
     * @constructor
     */
    var Disassembler = function () {
        this._bytes = null;
        this._baseOff = 0;
        this._endAddr = 0;
        this._cursor = 0;
        
        this._srMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._failedLineListMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        
        this._visitedGcAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this._visitedAddrRangeSet = new karbonator.collection.TreeSet(
            /**
             * @readonly
             * @param {karbonator.math.Interval} l
             * @param {karbonator.math.Interval} r
             */
            function (l, r) {
                return l[karbonator.compareTo](r);
            }
        );
        this._cLabelQ = new karbonator.collection.PriorityQueue(Disassembler._LabelComparator);
        
        this._labelIdSeq = 0;
        this._labelMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._cLabelMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._dLabelMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
    };
    
    /**
     * @memberof Disassembler
     * @private
     * @function
     * @param {Label} l
     * @param {Label} r
     * @return {Number}
     */
    Disassembler._LabelComparator = function (l, r) {
        return l.address - r.address;
    };
    
    /**
     * @memberof Disassembler
     * @constructor
     * @param {Number} type
     * @param {Object} value
     */
    Disassembler.Line = function (type, value) {
        if(!karbonator.isNonNegativeSafeInteger(type)) {
            throw new TypeError("");
        }
        if(karbonator.isUndefinedOrNull(value)) {
            throw new TypeError("");
        }
        
        this.type = type;
        this.value = value;
    };
    
    /**
     * @memberof Disassembler.Line
     * @readonly
     * @enum {Number}
     */
    Disassembler.Line.Type = {
        instruction : 0,
        directive : 1,
        label : 2
    };
    
    /**
     * @function
     * @return {Number}
     */
    Disassembler.Line.prototype.getByteCount = function () {
        var byteCount = 0;
        
        if(this.type === Disassembler.Line.Type.instruction) {
            byteCount = 1 + (Math.abs(Disassembler._operandTypeTable[this.value[0].addressingMode]));
        }
        
        return byteCount;
    };
    
    /**
     * @function
     * @return {String}
     */
    Disassembler.Line.prototype.toString = function () {
        var str = "";
        
        switch(this.type) {
        case Disassembler.Line.Type.instruction:
            str = '\t' + this.value[0].format(this.value[1]);
        break;
        case Disassembler.Line.Type.directive:
            str = '\t' + '.' + this.value[0];
            for(var i = 1; i < this.value.length; ++i) {
                str += ' ';
                str += this.value[i];
            }
        break;
        case Disassembler.Line.Type.label:
            str = (this.value.parent === null ? '' : '@') + this.value.name + ':';
        break;
        default:
            throw new Error("An unknown line type has been detected.");
        }
        
        return str;
    };
    
    /**
     * @memberof Disassembler
     * @param {Number} startAddress
     * @constructor
     */
    Disassembler.LineList = function (startAddress) {
        if(!karbonator.isNonNegativeSafeInteger(startAddress)) {
            throw new TypeError("");
        }
        this.startAddress = startAddress;
        
        this._lines = [];
    };
    
    /**
     * @readonly
     */
    Disassembler.LineList.prototype.startAddress = 0;
    
    /**
     * @function
     * @return {karbonator.math.Interval}
     */
    Disassembler.LineList.prototype.getAddressRange = function () {
        var max = this.startAddress;
        for(var i = this._lines.length; i > 0; ) {
            --i;
            max += this._lines[i].getByteCount();
        }
        
        return new karbonator.math.Interval(
            this.startAddress,
            max
        );
    };
    
    /**
     * @function
     * @return {Number}
     */
    Disassembler.LineList.prototype.getCount = function () {
        return this._lines.length;
    };
    
    /**
     * @function
     * @param {Number} type
     * @return {Number}
     */
    Disassembler.LineList.prototype.getCountOf = function (type) {
        if(!karbonator.isNonNegativeSafeInteger(type)) {
            throw new TypeError("");
        }
        
        var count = 0;
        for(var i = this._lines.length; i > 0; ) {
            --i;
            
            if(this._lines[i].type === type) {
                ++count;
            }
        }
        
        return count;
    };
    
    /**
     * @function
     * @param {Number} address
     * @return {Number}
     */
    Disassembler.LineList.prototype.findIndexOfAddress = function (address) {
        if(!karbonator.isNonNegativeSafeInteger(address)) {
            throw new RangeError("'address' must be a non-negative safe integer.");
        }
        var offset = address - this.startAddress;
        if(offset < 0) {
            throw new RangeError("address out of range.");
        }
        
        var lineNdx = 0;
        for(
            var offSum = 0, lineCount = this._lines.length;
            lineNdx < lineCount && offSum < offset;
            ++lineNdx
        ) {
            offSum += this._lines[lineNdx].getByteCount();
        }
        
        return lineNdx;
    };
    
    /**
     * @function
     * @param {Number} startIndex
     * @return {Number}
     */
    Disassembler.LineList.prototype.findInstructionIndex = function (startIndex) {
        if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new RangeError("'startIndex' must be a non-negative safe integer.");
        }
        
        for(
            var lineCount = this._lines.length;
            startIndex < lineCount
            && this._lines[startIndex].type !== Disassembler.Line.Type.instruction;
            ++startIndex
        );
        
        return startIndex;
    };
    
    /**
     * @function
     * @param {Disassembler.Line} line
     */
    Disassembler.LineList.prototype.add = function (line) {
        if(!(line instanceof Disassembler.Line)) {
            throw new TypeError("");
        }
        
        this._lines.push(line);
    };
    
    /**
     * This function ignore directives.
     * @function
     * @param {Disassembler.Line} line
     * @param {Number} index
     */
    Disassembler.LineList.prototype.insert = function(line, index) {
        if(!(line instanceof Disassembler.Line)) {
            throw new TypeError("");
        }
        
        if(!karbonator.isNonNegativeSafeInteger(index)) {
            throw new RangeError("'index' must be a non-negative safe integer.");
        }
        
        this._lines.splice(index, 0, line);
    };
    
    /**
     * @function
     * @param {Disassembler.Line} line
     * @param {Number} byteOffset
     */
    Disassembler.LineList.prototype.insertAtNegativeOffset = function (
        line, byteOffset
    ) {
        if(!(line instanceof Disassembler.Line)) {
            throw new TypeError("");
        }
        if(!karbonator.isSafeInteger(byteOffset) || byteOffset > 0) {
            throw new RangeError("'byteOffset' must be a non-positive safe integer.");
        }
        
        var lineNdx = this.getCount();
        var byteOffSum = 0;
        var absOffset = Math.abs(byteOffset);
        while(lineNdx > 0 && byteOffSum < absOffset) {
            --lineNdx;
            byteOffSum += this._lines[lineNdx].getByteCount();
        }
        
        this._lines.splice(lineNdx, 0, line);
    };
    
    /**
     * @function
     */
    Disassembler.LineList.prototype.clear = function () {
        this._lines.length = 0;
    };
    
    /**
     * @function
     * @return {String}
     */
    Disassembler.LineList.prototype.toString = function () {
        return this._lines.reduce(
            function (acc, cur) {
                return acc + cur + "\r\n";
            },
            ""
        );
    };
    
    /**
     * @memberof Disassembler
     * @readonly
     * @enum {Number}
     */
    Disassembler.ActionCode = {
        reserved00 : 0x00,
        reserved01 : 0x01,
        reserved02 : 0x02,
        jmp : 0x03,
        brk : 0x04,
        jsr : 0x05,
        rti : 0x06,
        rts : 0x07,
        bpl : 0x08,
        bmi : 0x09,
        bvc : 0x0A,
        bvs : 0x0B,
        bcc : 0x0C,
        bcs : 0x0D,
        bne : 0x0E,
        beq : 0x0F,
        
        php : 0x10,
        plp : 0x11,
        pha : 0x12,
        pla : 0x13,
        ldx : 0x14,
        stx : 0x15,
        ldy : 0x16,
        sty : 0x17,
        lda : 0x18,
        sta : 0x19,
        txa : 0x1A,
        tax : 0x1B,
        tya : 0x1C,
        tay : 0x1D,
        tsx : 0x1E,
        txs : 0x1F,
        
        clc : 0x20,
        sec : 0x21,
        cli : 0x22,
        sei : 0x23,
        clv : 0x24,
        nop : 0x25,
        cld : 0x26,
        sed : 0x27,
        and : 0x28,
        bit : 0x29,
        ora : 0x2A,
        eor : 0x2B,
        asl : 0x2C,
        lsr : 0x2D,
        rol : 0x2E,
        ror : 0x2F,
        
        inx : 0x30,
        iny : 0x31,
        inc : 0x32,
        adc : 0x33,
        dex : 0x34,
        dey : 0x35,
        dec : 0x36,
        sbc : 0x37,
        cpx : 0x38,
        cpy : 0x39,
        cmp : 0x3A,
        reserved3B : 0x3B,
        reserved3C : 0x3C,
        reserved3D : 0x3D,
        reserved3E : 0x3E,
        reserved3F : 0x3F
    };
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._intSrActionCodes = [
        Disassembler.ActionCode.brk,
        Disassembler.ActionCode.jsr,
        Disassembler.ActionCode.rti,
        Disassembler.ActionCode.rts
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._stackMoveIncDecActionCodes = [
        Disassembler.ActionCode.php,
        Disassembler.ActionCode.plp,
        Disassembler.ActionCode.pha,
        Disassembler.ActionCode.pla,
        Disassembler.ActionCode.dey,
        Disassembler.ActionCode.tay,
        Disassembler.ActionCode.iny,
        Disassembler.ActionCode.inx
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._branchActionCodes = [
        Disassembler.ActionCode.bpl,
        Disassembler.ActionCode.bmi,
        Disassembler.ActionCode.bvc,
        Disassembler.ActionCode.bvs,
        Disassembler.ActionCode.bcc,
        Disassembler.ActionCode.bcs,
        Disassembler.ActionCode.bne,
        Disassembler.ActionCode.beq
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._flagMoveActionCodes = [
        Disassembler.ActionCode.clc,
        Disassembler.ActionCode.sec,
        Disassembler.ActionCode.cli,
        Disassembler.ActionCode.sei,
        Disassembler.ActionCode.tya,
        Disassembler.ActionCode.clv,
        Disassembler.ActionCode.cld,
        Disassembler.ActionCode.sed
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._moveDecNopActionCodes = [
        Disassembler.ActionCode.txa,
        Disassembler.ActionCode.tax,
        Disassembler.ActionCode.dex,
        Disassembler.ActionCode.nop
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._stackPointerActionCodes = [
        Disassembler.ActionCode.txs,
        Disassembler.ActionCode.tsx
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._groupActionCodeTable = [
        [
            Disassembler.ActionCode.nop,
            Disassembler.ActionCode.bit,
            Disassembler.ActionCode.jmp,
            Disassembler.ActionCode.jmp,
            Disassembler.ActionCode.sty,
            Disassembler.ActionCode.ldy,
            Disassembler.ActionCode.cpy,
            Disassembler.ActionCode.cpx
        ],
        [
            Disassembler.ActionCode.ora,
            Disassembler.ActionCode.and,
            Disassembler.ActionCode.eor,
            Disassembler.ActionCode.adc,
            Disassembler.ActionCode.sta,
            Disassembler.ActionCode.lda,
            Disassembler.ActionCode.cmp,
            Disassembler.ActionCode.sbc
        ],
        [
            Disassembler.ActionCode.asl,
            Disassembler.ActionCode.rol,
            Disassembler.ActionCode.lsr,
            Disassembler.ActionCode.ror,
            Disassembler.ActionCode.stx,
            Disassembler.ActionCode.ldx,
            Disassembler.ActionCode.dec,
            Disassembler.ActionCode.inc
        ]
    ];
    
    /**
     * @memberof Disassembler
     * @readonly
     * @type {Array.<String>}
     */
    Disassembler.mnemonics = [
        "reserved00",
        "reserved01",
        "reserved02",
        "jmp",
        "brk",
        "jsr",
        "rti",
        "rts",
        "bpl",
        "bmi",
        "bvc",
        "bvs",
        "bcc",
        "bcs",
        "bne",
        "beq",
        
        "php",
        "plp",
        "pha",
        "pla",
        "ldx",
        "stx",
        "ldy",
        "sty",
        "lda",
        "sta",
        "txa",
        "tax",
        "tya",
        "tay",
        "tsx",
        "txs",
        
        "clc",
        "sec",
        "cli",
        "sei",
        "clv",
        "nop",
        "cld",
        "sed",
        "and",
        "bit",
        "ora",
        "eor",
        "asl",
        "lsr",
        "rol",
        "ror",
        
        "inx",
        "iny",
        "inc",
        "adc",
        "dex",
        "dey",
        "dec",
        "sbc",
        "cpx",
        "cpy",
        "cmp",
        "reserved3B",
        "reserved3C",
        "reserved3D",
        "reserved3E",
        "reserved3F"
    ];
    
    /**
     * @memberof Disassembler
     * @readonly
     * @enum {Number}
     */
    Disassembler.AddressingMode = {
        imp : 0,
        regA : 1,
        imm : 2,
        pcRel : 3,
        absNdxX : 4,
        absNdxY : 5,
        absInd : 6,
        abs : 7,
        zpNdxX : 8,
        zpNdxY : 9,
        zpNdxXInd : 10,
        zpIndNdxY : 11,
        zp : 12
    };
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Array.<Number>>}
     */
    Disassembler._addrModeTable = [
        [
            Disassembler.AddressingMode.imm,
            Disassembler.AddressingMode.zp,
            Disassembler.AddressingMode.regA,
            Disassembler.AddressingMode.abs,
            Disassembler.AddressingMode.imp,
            Disassembler.AddressingMode.zpNdxX,
            Disassembler.AddressingMode.imp,
            Disassembler.AddressingMode.absNdxX
        ],
        [
            Disassembler.AddressingMode.zpNdxXInd,
            Disassembler.AddressingMode.zp,
            Disassembler.AddressingMode.imm,
            Disassembler.AddressingMode.abs,
            Disassembler.AddressingMode.zpIndNdxY,
            Disassembler.AddressingMode.zpNdxX,
            Disassembler.AddressingMode.absNdxY,
            Disassembler.AddressingMode.absNdxX
        ]
    ];
    
    /**
     * @memberof Disassembler
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Disassembler._operandTypeTable = [
        0,
        0,
        1,
        -1,
        2,
        2,
        2,
        2,
        1,
        1,
        1,
        1,
        1
    ];
    
    /**
     * @memberof Disassembler
     * @readonly
     * @type {Array.<String>}
     */
    Disassembler._addrModeNames = [
        "imp",
        "regA",
        "imm",
        "pcRel",
        "absNdxX",
        "absNdxY",
        "absInd",
        "abs",
        "zpNdxY",
        "zpNdxX",
        "zpNdxXInd",
        "zpIndNdxY",
        "zp"
    ];
    
    /**
     * @memberof Disassembler
     * @constructor
     * @param {Number} actionCode
     * @param {Number} addrMode
     */
    Disassembler.DecodedOpCode = function (actionCode, addrMode) {
        if(!karbonator.isNonNegativeSafeInteger(actionCode)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(addrMode)) {
            throw new TypeError("");
        }
        
        this.actionCode = actionCode;
        this.addressingMode = addrMode;
    };
    
    /**
     * TODO : Write some proper code...
     * @function
     * @return {Boolean}
     */
    Disassembler.DecodedOpCode.prototype.doesMemoryWrite = function () {
        var result = false;
        
        switch(this.actionCode) {
        case Disassembler.ActionCode.sta:
        case Disassembler.ActionCode.stx:
        case Disassembler.ActionCode.sty:
            result = true;
        break;
        case Disassembler.ActionCode.asl:
        case Disassembler.ActionCode.lsr:
        case Disassembler.ActionCode.rol:
        case Disassembler.ActionCode.ror:
        case Disassembler.ActionCode.inc:
        case Disassembler.ActionCode.dec:
            switch(this.addressingMode) {
            case Disassembler.AddressingMode.imp:
            case Disassembler.AddressingMode.regA:
            case Disassembler.AddressingMode.imm:
            case Disassembler.AddressingMode.pcRel:
                result = false;
            break;
            default:
                result = true;
            }
        break;
        }
        
        return result;
    };
    
    /**
     * @function
     * @param {String} operandStr
     * @return {String}
     */
    Disassembler.DecodedOpCode.prototype.format = function (operandStr) {
        var str = "";
        
        switch(this.addressingMode) {
        case Disassembler.AddressingMode.imp:
        break;
        case Disassembler.AddressingMode.regA:
            str += 'A';
        break;
        case Disassembler.AddressingMode.imm:
            str += '#' + operandStr;
        break;
        case Disassembler.AddressingMode.pcRel:
            str += operandStr;
        break;
        case Disassembler.AddressingMode.absNdxX:
            str += operandStr + ',' + 'X';
        break;
        case Disassembler.AddressingMode.absNdxY:
            str += operandStr + ',' + 'Y';
        break;
        case Disassembler.AddressingMode.absInd:
            str += '(' + operandStr + ')';
        break;
        case Disassembler.AddressingMode.abs:
            str += operandStr;
        break;
        case Disassembler.AddressingMode.zpNdxX:
            str += '<' + operandStr + ',' + 'X';
        break;
        case Disassembler.AddressingMode.zpNdxY:
            str += '<' + operandStr + ',' + 'Y';
        break;
        case Disassembler.AddressingMode.zpNdxXInd:
            str += '(' + '<' + operandStr + ',' + 'X' + ')';
        break;
        case Disassembler.AddressingMode.zpIndNdxY:
            str += '(' + '<' + operandStr + ')' + ',' + 'Y';
        break;
        case Disassembler.AddressingMode.zp:
            str += '<' + operandStr;
        break;
        }
        
        if(str !== "") {
            str = ' ' + str;
        }
        
        str = Disassembler.mnemonics[this.actionCode] + str;
        
        return str;
    };
    
    /**
     * @memberof Disassembler
     * @function
     * @param {String} prefix
     * @param {Number} addr
     * @return {String}
     */
    Disassembler.createLabelName = function (prefix, addr) {
        return "" + prefix + _formatHexadecimal(addr, 4);
    };
    
    /**
     * @function
     * @param {karbonator.ByteArray} bytes
     * @param {Number} [startIndex=0]
     * @param {Number} [baseOffset=0]
     * @param {Object} [options]
     * @return {Array.<String>}
     */
    Disassembler.prototype.disassemble = function (bytes) {
        if(karbonator.isUndefinedOrNull(bytes)) {
            throw new TypeError("");
        }
        
        var startIndex = arguments[1];
        if(karbonator.isUndefined(startIndex)) {
            startIndex = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startIndex)) {
            throw new TypeError("'startIndex' must be a non-negative safe integer.");
        }
        
        this._baseOff = arguments[2];
        if(karbonator.isUndefined(this._baseOff)) {
            this._baseOff = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(this._baseOff)) {
            throw new TypeError("'baseOffset' must be a non-negative safe integer.");
        }
        
        this._bytes = bytes;
        var byteCount = bytes.getElementCount();
        var endOfBytes = this._baseOff + byteCount;
        
        this._initialize();
        this._acceptOptions(arguments[3]);
        
        this._enqueueGcLabel(this._addGcLabel(this._baseOff));
        while(!this._cLabelQ.isEmpty()) {
            var gcLabel = this._cLabelQ.dequeue();
            
            var nextAddr = gcLabel.address;
            var found = false;
            do {
                var nearestPair = this._dLabelMap.findNotLessThan(nextAddr);
                if(!karbonator.isUndefined(nearestPair)) {
                    var nearsetDLabel = nearestPair.value;
                    var range = new karbonator.math.Interval(
                        nearsetDLabel.address,
                        nearsetDLabel.address + nearsetDLabel.byteCount
                    );
                    if(range.contains(nextAddr)) {
                        nextAddr = range.getMaximum();
                        
                        if(nextAddr === range.getMinimum()) {
                            ++nextAddr;
                        }
                    }
                    else {
                        found = true;
                    }
                }
                else {
                    found = true;
                }
            }
            while(nextAddr < endOfBytes && !found);
            
            if(nextAddr !== gcLabel.address) {
                if(found) {
                    this._enqueueGcLabel(this._addGcLabel(nextAddr));
                }
                
                continue;
            }
            
            //TODO : 코드 검증
            //레이블 주소가 어떤 서브루틴의 지역 레이블인 경우
            var nearestPair = this._srMap.findNearestLessThan(gcLabel.address);
            if(!karbonator.isUndefined(nearestPair)) {
                debugger;
                var nearestSrLineList = nearestPair.value;
                //TODO : 코드 범위 최대치를 -1 해야하는지 확인.
                //만약 그렇다면 코드 리팩토링.
                var range = nearestSrLineList.getAddressRange();
                range = new karbonator.math.Interval(
                    range.getMinimum(),
                    range.getMaximum() - 1
                );
                if(range.contains(gcLabel.address)) {
                    continue;
                }
            }
            
            var lineList = this._disassembleSubroutine(gcLabel);
            if(lineList !== null && lineList.getCountOf(Disassembler.Line.Type.instruction) > 0) {
                this._srMap.set(gcLabel.address, lineList);
            }
            
            if(this._cursor < byteCount) {
                var nextAddr = this._getCurrentAddress();
                this._enqueueGcLabel(this._addGcLabel(nextAddr));
            }
        }
        
        
        
        return this._createResult();
    };
    
    /**
     * @private
     * @function
     */
    Disassembler.prototype._initialize = function () {
        this._endAddr = this._baseOff + this._bytes.getElementCount();
        this._cursor = 0;
        
        this._srMap.clear();
        this._failedLineListMap.clear();
        
        this._visitedGcAddrSet.clear();
        this._cLabelQ.clear();
        
        this._labelIdSeq = 0;
        this._cLabelMap.clear();
        this._dLabelMap.clear();
    };
    
    /**
     * @private
     * @function
     * @param {Object} options
     */
    Disassembler.prototype._acceptOptions = function (options) {
        if(karbonator.isUndefined(options)) {
            return;
        }
        
        if(!karbonator.isObjectOrFunction(options)) {
            throw new TypeError("");
        }
        
        if(options.predefinedDataLabels) {
            if(!karbonator.isEsIterable(options.predefinedDataLabels)) {
                throw new TypeError("");
            }

            for(
                var iter = options.predefinedDataLabels[Symbol.iterator](), iP = iter.next();
                !iP.done;
                iP = iter.next()
            ) {
                if(
                    !karbonator.isArray(iP.value)
                    || iP.value.length < 2
                    || !karbonator.isNonNegativeSafeInteger(iP.value[0])
                    || !karbonator.isNonNegativeSafeInteger(iP.value[1])
                ) {
                    throw new TypeError("[addr, byteCount]");
                }

                this._addGdLabel(iP.value[0], iP.value[1]);
            }
        }
    };
    
    /**
     * @private
     * @function
     * @param {Label} srLabel
     * @return {Disassembler.LineList|null}
     */
    Disassembler.prototype._disassembleSubroutine = function (srLabel) {
        this._cursor = srLabel.address - this._baseOff;
        
        var lineList = new Disassembler.LineList(srLabel.address);
        lineList.add(
            new Disassembler.Line(
                Disassembler.Line.Type.directive,
                ["ORG", srLabel.address]
            )
        );
        lineList.add(
            new Disassembler.Line(
                Disassembler.Line.Type.label,
                srLabel
            )
        );
        
        var portAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var dataAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var memoryAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        var jsrAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var longJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var lcLabelAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        var returnCount = 0;
        var byteCount = this._bytes.getElementCount();
        for(var working = true; working && this._cursor < byteCount; ) {
            //Inhibit violating data tables.
            var currentAddr = this._getCurrentAddress();
            var mapPair = this._dLabelMap.findNotLessThan(currentAddr);
            if(
                !karbonator.isUndefined(mapPair)
                && (currentAddr >= mapPair.value.address)
            ) {
                break;
            }
            
            var opCode = this._readOpCode();
            var decodedOpCode = this._decodeOpCode(opCode);
            if(null === decodedOpCode) {
                if(lineList.getCountOf(Disassembler.Line.Type.instruction) > 0) {
                    this._failedLineListMap.set(srLabel.address, lineList);
                }
                
                lineList = null;
                break;
            }
            var operand = this._readOperand(decodedOpCode.addressingMode);
            
            currentAddr = this._getCurrentAddress();
            if((decodedOpCode.actionCode & 0x30) === 0) {
                switch(decodedOpCode.actionCode) {
                case Disassembler.ActionCode.rti:
                case Disassembler.ActionCode.rts:
                    ++returnCount;
                    
                    if(karbonator.isUndefined(
                        lcLabelAddrSet.findNotLessThan(currentAddr)
                    )) {
                        working = false;
                    }
                break;
                case Disassembler.ActionCode.bpl:
                case Disassembler.ActionCode.bmi:
                case Disassembler.ActionCode.bne:
                case Disassembler.ActionCode.beq:
                case Disassembler.ActionCode.bvc:
                case Disassembler.ActionCode.bvs:
                case Disassembler.ActionCode.bcc:
                case Disassembler.ActionCode.bcs:
                    lcLabelAddrSet.add(currentAddr + operand);
                    
                    if(
                        returnCount > 0
                        && karbonator.isUndefined(
                            lcLabelAddrSet.findNotLessThan(currentAddr)
                        )
                    ) {
                        working = false;
                    }
                break;
                case Disassembler.ActionCode.jsr:
                    jsrAddrSet.add(operand);
                break;
                case Disassembler.ActionCode.jmp:
                    switch(decodedOpCode.addressingMode) {
                    case Disassembler.AddressingMode.abs:
                        if(lineList.getAddressRange().contains(operand)) {
                            lcLabelAddrSet.add(operand);
                        }
                        else {
                            longJumpAddrSet.add(operand);
                        }
                        
                        //서브루틴 범위 밖으로 점프해서
                        //제어를 넘기는 서브루틴인 경우.
                        if(
                            operand < lineList.startAddress
                            && karbonator.isUndefined(
                                lcLabelAddrSet.findNotLessThan(currentAddr)
                            )
                        ) {
                            working = false;
                        }
                    break;
                    case Disassembler.AddressingMode.absInd:
                        dataAddrSet.add(operand);
                        
                        //점프 테이블 주소로 간접 점프해서
                        //제어를 넘기는 경우.
                        if(karbonator.isUndefined(
                            lcLabelAddrSet.findNotLessThan(currentAddr)
                        )) {
                            working = false;
                        }
                    break;
                    default:
                        throw new Error("An invalid opcode has been detected.");
                    }
                break;
                }
            }
            else switch(decodedOpCode.addressingMode) {
            case Disassembler.AddressingMode.absNdxX:
            case Disassembler.AddressingMode.absNdxY:
            case Disassembler.AddressingMode.abs:
                if(!this._addressIsInPortArea(operand)) {
                    memoryAddrSet.add(operand);
                }
                else if(
                    this._addressIsInCodeArea(operand)
                    && !decodedOpCode.doesMemoryWrite()
                ) {
                    dataAddrSet.add(operand);
                }
                else {
                    portAddrSet.add(operand);
                }
            break;
            }
            
//            var operandStr = '$' + _formatHexadecimal(
//                operand,
//                (Math.abs(Disassembler._operandTypeTable[decodedOpCode.addressingMode]) << 1)
//            );
            lineList.add(new Disassembler.Line(
                Disassembler.Line.Type.instruction,
                [decodedOpCode, operand]
            ));
        }
        
        console.clear();
        
        if(null !== lineList && lineList.getCount > 0) {
            console.log(lineList.toString());
            
            var filteredLongJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
            //TODO : 코드 범위 최대치를 -1 해야하는지 확인.
            //만약 그렇다면 코드 리팩토링.
            var range = lineList.getAddressRange();
            range = new karbonator.math.Interval(
                range.getMinimum(),
                range.getMaximum() - 1
            );
            karbonator.forOf(longJumpAddrSet, function (addr) {
                if(range.contains(addr)) {
                    lcLabelAddrSet.add(addr);
                }
                else {
                    filteredLongJumpAddrSet.add(addr);
                }
            }, this);
            
            //TODO : 코드 검증
            //방금 처리된 서브루틴이
            //다른 서브루틴을 지역레이블로서 포함하는 경우
            var cLabelAddrsToRemove = new karbonator.collection.TreeSet(karbonator.integerComparator);
            karbonator.forOf(this._cLabelMap, function (pair) {
                if(
                    srLabel.address !== pair[1].address
                    && range.contains(pair[1].address)
                ) {
                    cLabelAddrsToRemove.add(pair[1].address);
                }
            }, this);
            if(cLabelAddrsToRemove.getElementCount() > 0) {
                debugger;
            }
            karbonator.forOf(cLabelAddrsToRemove, function (addr) {
                this._cLabelMap.remove(addr);
                this._labelMap.get(addr).parent = srLabel;
            }, this);
            
            karbonator.forOf(filteredLongJumpAddrSet, function (addr) {
                this._enqueueGcLabel(this._addGcLabel(addr));
            }, this);
            
            karbonator.forOf(lcLabelAddrSet, function (addr) {
                if(addr >= lineList.startAddress) {
                    lineList.insert(
                        new Disassembler.Line(
                            Disassembler.Line.Type.label,
                            this._addLcLabel(srLabel, addr)
                        ),
                        lineList.findInstructionIndex(
                            lineList.findIndexOfAddress(addr)
                        )
                    );
                }
                else {
                    //TODO : 전역 레이블의 자식 레이블 참조 코드 작성
                    debugger;
                }
            }, this);
            
            
            
            karbonator.forOf(jsrAddrSet, function (addr) {
                var label = this._addGcLabel(addr);
                this._enqueueGcLabel(label);
            }, this);
            
            
            
            karbonator.forOf(portAddrSet, function (addr) {
                this._addPortLabel(addr);
            }, this);
            
            karbonator.forOf(memoryAddrSet, function (addr) {
                this._addMemoryLabel(addr);
            }, this);
            
            karbonator.forOf(dataAddrSet, function (addr) {
                this._addGdLabel(addr);
            }, this);
            
            console.clear();
            console.log(lineList.toString());
        }
        
        if(null === lineList) {
            console.log("Failed to disassemble : 0x" + _formatHexadecimal(srLabel.address) + "\r\n");
        }
        
        return lineList;
    };
    
    /**
     * @private
     * @function
     * @return {Array.<String>}
     */
    Disassembler.prototype._createResult = function () {
        return [
            Array.from(this._srMap).reduce(
                function (acc, cur) {
                    return acc + cur[1] + "\r\n";
                },
                ""
            ),
            Array.from(this._dLabelMap).reduce(
                function (acc, cur) {
                    return acc + cur[1].name + "\r\n";
                },
                ""
            ),
            Array.from(this._failedLineListMap).reduce(
                function (acc, cur) {
                    return acc + cur[1] + "\r\n";
                },
                ""
            )
        ];
    };
    
    /**
     * @private
     * @function
     * @return {Number}
     */
    Disassembler.prototype._readOpCode = function () {
        var opCode = this._bytes.get(this._cursor);
        ++this._cursor;
        
        return opCode;
    };
    
    /**
     * @private
     * @function
     * @param {Number} addrMode
     * @return {Number}
     */
    Disassembler.prototype._readOperand = function (addrMode) {
        var operandType = Disassembler._operandTypeTable[addrMode];
        
        var operand = 0;
        var size = Math.abs(operandType);
        if(size > 0) {
            operand = karbonator.bytesToInteger(
                this._bytes,
                size, (operandType < 0), true,
                this._cursor
            );
            
            this._cursor += size;
        }
        
        return operand;
    };
    
    /**
     * @private
     * @function
     * @param {Number} addrMode
     * @return {Number}
     */
    Disassembler.prototype._getOperandSize = function (addrMode) {
        var operandType = Disassembler._operandTypeTable[addrMode];
        
        return Math.abs(operandType);
    };
    
    /**
     * @private
     * @function
     * @return {Number}
     */
    Disassembler.prototype._getCurrentAddress = function () {
        return this._baseOff + this._cursor;
    };
    
    /**
     * @private
     * @function
     * @param {Number} opCode
     * @return {Disassembler.DecodedOpCode|null}
     */
    Disassembler.prototype._decodeOpCode = function (opCode) {
        var groupNdx = opCode & 0x03;
        var groupTblNdx = opCode & 0x01;
        var addrModeNdx = (opCode & 0x1C) >>> 2;
        var actionNdx = (opCode & 0xE0) >>> 5;
        
        var addrMode = 0;
        var actionCode = 0;
        
        switch(groupNdx) {
        case 0:
            switch(addrModeNdx) {
            case 0:
                switch(actionNdx) {
                case 0:
                    actionCode = Disassembler._intSrActionCodes[actionNdx];
                    addrMode = Disassembler.AddressingMode.imp;
                break;
                case 1:
                    actionCode = Disassembler._intSrActionCodes[actionNdx];
                    addrMode = Disassembler.AddressingMode.abs;
                break;
                case 2:
                case 3:
                    actionCode = Disassembler._intSrActionCodes[actionNdx];
                    addrMode = Disassembler.AddressingMode.imp;
                break;
                case 4:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 5:
                case 6:
                case 7:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                }
            break;
            case 1:
                switch(actionNdx) {
                case 0:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 1:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 2:
                case 3:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 4:
                case 5:
                case 6:
                case 7:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                }
            break;
            case 2:
                actionCode = Disassembler._stackMoveIncDecActionCodes[actionNdx];
                addrMode = Disassembler.AddressingMode.imp;
            break;
            case 3:
                switch(actionNdx) {
                case 0:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 1:
                case 2:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 3:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler.AddressingMode.absInd;
                break;
                case 4:
                case 5:
                case 6:
                case 7:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                }
            break;
            case 4:
                actionCode = Disassembler._branchActionCodes[actionNdx];
                addrMode = Disassembler.AddressingMode.pcRel;
            break;
            case 5:
                switch(actionNdx) {
                case 0:
                case 1:
                case 2:
                case 3:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 4:
                case 5:
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 6:
                case 7:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                }
            break;
            case 6:
                actionCode = Disassembler._flagMoveActionCodes[actionNdx];
                addrMode = Disassembler.AddressingMode.imp;
            break;
            case 7:
                if(actionNdx === 5) {
                    actionCode = Disassembler._groupActionCodeTable[0][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                }
                else {
                    //4 : SHY
                    //.throw new Error("An invalid opcode has been detected.");
                    return null;
                }
            break;
            }
        break;
        case 1:
            if(opCode !== 0x89) {
                actionCode = Disassembler._groupActionCodeTable[1][actionNdx];
                addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
            }
            else {
                //throw new Error("An invalid opcode has been detected.");
                return null;
            }
        break;
        case 2:
            switch(addrModeNdx) {
            case 0:
                if(actionNdx === 5) {
                    actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                }
                else {
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                }
            break;
            case 1:
                actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
            break;
            case 2:
                switch((actionNdx & 0x04) >> 2) {
                case 0:
                    actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 1:
                    actionCode = Disassembler._moveDecNopActionCodes[actionNdx & 0x03];
                    addrMode = Disassembler.AddressingMode.imp;
                break;
                }
            break;
            case 3:
                actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
            break;
            case 4:
                //throw new Error("An invalid opcode has been detected.");
                return null;
            //break;
            case 5:
                actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
            break;
            case 6:
                switch(actionNdx) {
                case 0:
                case 1:
                case 2:
                case 3:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 4:
                case 5:
                    actionCode = Disassembler._stackPointerActionCodes[actionNdx - 4];
                    addrMode = Disassembler.AddressingMode.imp;
                break;
                case 6:
                case 7:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                }
            break;
            case 7:
                if(actionNdx !== 4) {
                    actionCode = Disassembler._groupActionCodeTable[2][actionNdx];
                    addrMode = Disassembler._addrModeTable[groupTblNdx][addrModeNdx];
                }
                else {
                    //SHX
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                }
            break;
            }
        break;
        case 3:
            //throw new Error("An invalid opcode has been detected.");
            return null;
        //break;
        }
        
        return new Disassembler.DecodedOpCode(
            actionCode,
            addrMode
        );
    };
    
    /**
     * @private
     * @function
     * @param {Number} addr
     * @return {Boolean}
     */
    Disassembler.prototype._addressIsInPortArea = function (addr) {
        return this._addressIsInCodeArea(addr)
            || (addr >= 0x5000 && addr < 0x6000)
        ;
    };
    
    /**
     * @private
     * @function
     * @param {Number} addr
     * @return {Boolean}
     */
    Disassembler.prototype._addressIsInCodeArea = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        return addr >= 0x8000 && addr < 0x10000;
    };
    
    /**
     * @function
     * @param {Number} addr
     * @return {Boolean}
     */
    Disassembler.prototype._addressIsInRange = function (addr) {
        if(karbonator.isUndefinedOrNull(this._bytes)) {
            throw new Error("");
        }
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        return addr >= this._baseOff && addr < this._endAddr;
    };
    
    /**
     * @function
     * @param {Label} parent
     * @param {Number} addr
     * @param {String} [name]
     * @return {Label}
     */
    Disassembler.prototype._addLcLabel = function (parent, addr) {
        if(!(parent instanceof Label)) {
            throw new TypeError("");
        }
        if(!karbonator.isSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        var labelName = arguments[2];
        if(karbonator.isUndefined(labelName)) {
            labelName = Disassembler.createLabelName("local", addr);
        }
        else if(!karbonator.isString(labelName)) {
            throw new TypeError("");
        }
        
        var label = new Label(
            ++this._labelIdSeq,
            labelName,
            Label.Type.code,
            addr,
            0,
            parent
        );
        
        this._labelMap.set(addr, label);
        
        return label;
    };
    
    /**
     * @function
     * @param {Number} addr
     * @param {String} [name]
     * @return {Label}
     */
    Disassembler.prototype._addGcLabel = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        var labelName = arguments[1];
        if(karbonator.isUndefined(labelName)) {
            labelName = Disassembler.createLabelName("global", addr);
        }
        else if(!karbonator.isString(labelName)) {
            throw new TypeError("'name' must be a string.");
        }
        
        var label = this._cLabelMap.get(addr);
        if(karbonator.isUndefined(label)) {
            label = new Label(
                ++this._labelIdSeq,
                labelName,
                Label.Type.code,
                addr,
                0
            );
            
            this._labelMap.set(addr, label);
            this._cLabelMap.set(addr, label);
        }
        
        return label;
    };
    
    /**
     * @function
     * @private
     * @param {Label} label
     */
    Disassembler.prototype._enqueueGcLabel = function (label) {
        if(
            this._addressIsInRange(label.address)
            && !this._visitedGcAddrSet.has(label.address)
        ) {
            this._cLabelQ.enqueue(label);
            this._visitedGcAddrSet.add(label.address);
        }
    };
    
    /**
     * @function
     * @param {Number} addr
     * @param {Number} [byteCount=0]
     * @return {Label}
     */
    Disassembler.prototype._addMemoryLabel = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        var byteCount = arguments[1];
        if(karbonator.isUndefined(byteCount)) {
            byteCount = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
            throw new TypeError("");
        }
        
        var labelName = labelName = Disassembler.createLabelName(
            "memory",
            addr
        );
        
        var label = this._dLabelMap.get(addr);
        if(karbonator.isUndefined(label)) {
            label = new Label(
                ++this._labelIdSeq,
                labelName,
                Label.Type.data,
                addr,
                byteCount
            );
            
            this._labelMap.set(label.address, label);
            this._dLabelMap.set(label.address, label);
        }
        
        return label;
    };
    
    /**
     * @function
     * @param {Number} addr
     * @param {Number} [byteCount=0]
     * @return {Label}
     */
    Disassembler.prototype._addPortLabel = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        var byteCount = arguments[1];
        if(karbonator.isUndefined(byteCount)) {
            byteCount = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
            throw new TypeError("");
        }
        
        var labelName = labelName = Disassembler.createLabelName(
            "port",
            addr
        );
        
        var label = this._dLabelMap.get(addr);
        if(karbonator.isUndefined(label)) {
            label = new Label(
                ++this._labelIdSeq,
                labelName,
                Label.Type.data,
                addr,
                byteCount
            );
            
            this._labelMap.set(label.address, label);
            this._dLabelMap.set(label.address, label);
        }
        
        return label;
    };
    
    /**
     * @function
     * @param {Number} addr
     * @param {Number} [byteCount=0]
     * @return {Label}
     */
    Disassembler.prototype._addGdLabel = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        var byteCount = arguments[1];
        if(karbonator.isUndefined(byteCount)) {
            byteCount = 0;
        }
        else if(!karbonator.isNonNegativeSafeInteger(byteCount)) {
            throw new TypeError("");
        }
        
        var labelName = labelName = Disassembler.createLabelName(
            "table",
            addr
        );
        
        var label = this._dLabelMap.get(addr);
        if(karbonator.isUndefined(label)) {
            label = new Label(
                ++this._labelIdSeq,
                labelName,
                Label.Type.data,
                addr,
                byteCount
            );
            
            this._labelMap.set(label.address, label);
            this._dLabelMap.set(label.address, label);
        }
        
        return label;
    };
    
    nes.Disassembler = Disassembler;
    
    /*////////////////////////////////*/
    
    /**
     * @memberof karbonator.nes
     * @constructor
     */
    var Assembler = function () {

        
        this._lexer = lg.generate();
    };
    
    karbonator.Disassembler = Disassembler;
    
    karbonator.Assembler = Assembler;
    
    return karbonator;
})
));
