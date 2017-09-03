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
        g.define(["./karbonator.string.fl"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(
            g,
            require("./karbonator.string.fl")
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
    
    //var Symbol = karbonator.getEsSymbol();
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var nes = karbonator.nes || {};
    karbonator.nes = nes;
    
    /**
     * @readonly
     * @type {String}
     */
    var _directivePrefix = '#';
    
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
    //PpSymbol
    
    var PpSymbol = function () {
        this.name = "";
        this.parent = null;
        this.children = [];
    };
    
    var PpLabel = function () {
        this.address = 0;
        this.size = 0;
    };
    PpLabel.prototype = Object.create(PpSymbol.prototype);
    
    var PpFunction = function (expr) {
        this.expression = expr;
    };
    PpFunction.prototype = Object.create(PpSymbol.prototype);
    
    /**
     * @function
     * @param {Array.<Number>} args
     * @return {Number}
     */
    PpFunction.prototype.call = function (args) {
        return 0;
    };
    
    var PpMacro = function () {
        this.lines = [];
    };
    PpMacro.prototype = Object.create(PpSymbol.prototype);
    
    /**
     * @function
     * @return {Array}
     */
    PpMacro.prototype.expand = function () {
        return [];
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Instruction
    
    /**
     * @constructor
     * @param {Number} actionCode
     * @param {Number} addrMode
     */
    var Instruction = function (actionCode, addrMode) {
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
     * @memberof Instruction
     * @readonly
     * @enum {Number}
     */
    Instruction.ActionCode = {
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
        
        pha : 0x10,
        php : 0x11,
        pla : 0x12,
        plp : 0x13,
        lda : 0x14,
        ldx : 0x15,
        ldy : 0x16,
        sta : 0x17,
        stx : 0x18,
        sty : 0x19,
        tax : 0x1A,
        tay : 0x1B,
        txa : 0x1C,
        tya : 0x1D,
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
     * @memberof Instruction
     * @readonly
     * @type {Array.<String>}
     */
    Instruction.mnemonics = [
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
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._intSrActionCodes = [
        Instruction.ActionCode.brk,
        Instruction.ActionCode.jsr,
        Instruction.ActionCode.rti,
        Instruction.ActionCode.rts
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._stackMoveIncDecActionCodes = [
        Instruction.ActionCode.php,
        Instruction.ActionCode.plp,
        Instruction.ActionCode.pha,
        Instruction.ActionCode.pla,
        Instruction.ActionCode.dey,
        Instruction.ActionCode.tay,
        Instruction.ActionCode.iny,
        Instruction.ActionCode.inx
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._branchActionCodes = [
        Instruction.ActionCode.bpl,
        Instruction.ActionCode.bmi,
        Instruction.ActionCode.bvc,
        Instruction.ActionCode.bvs,
        Instruction.ActionCode.bcc,
        Instruction.ActionCode.bcs,
        Instruction.ActionCode.bne,
        Instruction.ActionCode.beq
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._flagMoveActionCodes = [
        Instruction.ActionCode.clc,
        Instruction.ActionCode.sec,
        Instruction.ActionCode.cli,
        Instruction.ActionCode.sei,
        Instruction.ActionCode.tya,
        Instruction.ActionCode.clv,
        Instruction.ActionCode.cld,
        Instruction.ActionCode.sed
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._moveDecNopActionCodes = [
        Instruction.ActionCode.txa,
        Instruction.ActionCode.tax,
        Instruction.ActionCode.dex,
        Instruction.ActionCode.nop
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._stackPointerActionCodes = [
        Instruction.ActionCode.txs,
        Instruction.ActionCode.tsx
    ];
    
    /**
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._groupActionCodeTable = [
        [
            Instruction.ActionCode.nop,
            Instruction.ActionCode.bit,
            Instruction.ActionCode.jmp,
            Instruction.ActionCode.jmp,
            Instruction.ActionCode.sty,
            Instruction.ActionCode.ldy,
            Instruction.ActionCode.cpy,
            Instruction.ActionCode.cpx
        ],
        [
            Instruction.ActionCode.ora,
            Instruction.ActionCode.and,
            Instruction.ActionCode.eor,
            Instruction.ActionCode.adc,
            Instruction.ActionCode.sta,
            Instruction.ActionCode.lda,
            Instruction.ActionCode.cmp,
            Instruction.ActionCode.sbc
        ],
        [
            Instruction.ActionCode.asl,
            Instruction.ActionCode.rol,
            Instruction.ActionCode.lsr,
            Instruction.ActionCode.ror,
            Instruction.ActionCode.stx,
            Instruction.ActionCode.ldx,
            Instruction.ActionCode.dec,
            Instruction.ActionCode.inc
        ]
    ];
    
    /**
     * @memberof Instruction
     * @readonly
     * @enum {Number}
     */
    Instruction.AddressingMode = {
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
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<String>}
     */
    Instruction._addrModeNames = [
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
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Number>}
     */
    Instruction._operandTypeTable = [
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
     * @memberof Instruction
     * @private
     * @readonly
     * @type {Array.<Array.<Number>>}
     */
    Instruction._addrModeTable = [
        [
            Instruction.AddressingMode.imm,
            Instruction.AddressingMode.zp,
            Instruction.AddressingMode.regA,
            Instruction.AddressingMode.abs,
            Instruction.AddressingMode.imp,
            Instruction.AddressingMode.zpNdxX,
            Instruction.AddressingMode.imp,
            Instruction.AddressingMode.absNdxX
        ],
        [
            Instruction.AddressingMode.zpNdxXInd,
            Instruction.AddressingMode.zp,
            Instruction.AddressingMode.imm,
            Instruction.AddressingMode.abs,
            Instruction.AddressingMode.zpIndNdxY,
            Instruction.AddressingMode.zpNdxX,
            Instruction.AddressingMode.absNdxY,
            Instruction.AddressingMode.absNdxX
        ]
    ];
    
    /**
     * @memberof Instruction
     * @function
     * @param {Number} opCode
     * @return {Instruction|null}
     */
    Instruction.fromOpCode = function (opCode) {
        if(!karbonator.isNonNegativeSafeInteger(opCode)) {
            throw new TypeError("");
        }
        
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
                    actionCode = Instruction._intSrActionCodes[actionNdx];
                    addrMode = Instruction.AddressingMode.imp;
                break;
                case 1:
                    actionCode = Instruction._intSrActionCodes[actionNdx];
                    addrMode = Instruction.AddressingMode.abs;
                break;
                case 2:
                case 3:
                    actionCode = Instruction._intSrActionCodes[actionNdx];
                    addrMode = Instruction.AddressingMode.imp;
                break;
                case 4:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 5:
                case 6:
                case 7:
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                }
            break;
            case 2:
                actionCode = Instruction._stackMoveIncDecActionCodes[actionNdx];
                addrMode = Instruction.AddressingMode.imp;
            break;
            case 3:
                switch(actionNdx) {
                case 0:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                case 1:
                case 2:
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 3:
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction.AddressingMode.absInd;
                break;
                case 4:
                case 5:
                case 6:
                case 7:
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                }
            break;
            case 4:
                actionCode = Instruction._branchActionCodes[actionNdx];
                addrMode = Instruction.AddressingMode.pcRel;
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
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 6:
                case 7:
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                //break;
                }
            break;
            case 6:
                actionCode = Instruction._flagMoveActionCodes[actionNdx];
                addrMode = Instruction.AddressingMode.imp;
            break;
            case 7:
                if(actionNdx === 5) {
                    actionCode = Instruction._groupActionCodeTable[0][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
                actionCode = Instruction._groupActionCodeTable[1][actionNdx];
                addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
                    actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                }
                else {
                    //throw new Error("An invalid opcode has been detected.");
                    return null;
                }
            break;
            case 1:
                actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
            break;
            case 2:
                switch((actionNdx & 0x04) >> 2) {
                case 0:
                    actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
                break;
                case 1:
                    actionCode = Instruction._moveDecNopActionCodes[actionNdx & 0x03];
                    addrMode = Instruction.AddressingMode.imp;
                break;
                }
            break;
            case 3:
                actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
            break;
            case 4:
                //throw new Error("An invalid opcode has been detected.");
                return null;
            //break;
            case 5:
                actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
                    actionCode = Instruction._stackPointerActionCodes[actionNdx - 4];
                    addrMode = Instruction.AddressingMode.imp;
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
                    actionCode = Instruction._groupActionCodeTable[2][actionNdx];
                    addrMode = Instruction._addrModeTable[groupTblNdx][addrModeNdx];
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
        
        return new Instruction(
            actionCode,
            addrMode
        );
    };
    
    /**
     * A minus sign means that the operand is signed.
     * @function
     * @return {Number}
     */
    Instruction.prototype.getSize = function () {
        return 1 + Math.abs(this.getOperandType());
    };
    
    /**
     * A minus sign means that the operand is signed.
     * @function
     * @return {Number}
     */
    Instruction.prototype.getOperandType = function () {
        return Instruction._operandTypeTable[this.addressingMode];
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    Instruction.prototype.doesMemoryWrite = function () {
        var result = false;
        
        switch(this.actionCode) {
        case Instruction.ActionCode.sta:
        case Instruction.ActionCode.stx:
        case Instruction.ActionCode.sty:
            result = true;
        break;
        case Instruction.ActionCode.asl:
        case Instruction.ActionCode.lsr:
        case Instruction.ActionCode.rol:
        case Instruction.ActionCode.ror:
        case Instruction.ActionCode.inc:
        case Instruction.ActionCode.dec:
            switch(this.addressingMode) {
            case Instruction.AddressingMode.imp:
            case Instruction.AddressingMode.regA:
            case Instruction.AddressingMode.imm:
            case Instruction.AddressingMode.pcRel:
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
    Instruction.prototype.format = function (operandStr) {
        var str = "";
        
        switch(this.addressingMode) {
        case Instruction.AddressingMode.imp:
        break;
        case Instruction.AddressingMode.regA:
            str += 'A';
        break;
        case Instruction.AddressingMode.imm:
            str += _directivePrefix + operandStr;
        break;
        case Instruction.AddressingMode.pcRel:
            str += operandStr;
        break;
        case Instruction.AddressingMode.absNdxX:
            str += operandStr + ',' + 'X';
        break;
        case Instruction.AddressingMode.absNdxY:
            str += operandStr + ',' + 'Y';
        break;
        case Instruction.AddressingMode.absInd:
            str += '(' + operandStr + ')';
        break;
        case Instruction.AddressingMode.abs:
            str += operandStr;
        break;
        case Instruction.AddressingMode.zpNdxX:
            str += '<' + operandStr + ',' + 'X';
        break;
        case Instruction.AddressingMode.zpNdxY:
            str += '<' + operandStr + ',' + 'Y';
        break;
        case Instruction.AddressingMode.zpNdxXInd:
            str += '(' + '<' + operandStr + ',' + 'X' + ')';
        break;
        case Instruction.AddressingMode.zpIndNdxY:
            str += '(' + '<' + operandStr + ')' + ',' + 'Y';
        break;
        case Instruction.AddressingMode.zp:
            str += '<' + operandStr;
        break;
        }
        
        if(str !== "") {
            str = ' ' + str;
        }
        
        str = Instruction.mnemonics[this.actionCode] + str;
        
        return str;
    };
    
    /*////////////////////////////////*/
    
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
    //SrMeta
    
    /**
     * @constructor
     */
    var SrMeta = function () {
        this.valid = false;
        this.startAddress = 0;
        this.lines = [];
        this.cursor = 0;
        this.localJumpAddressSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this.srAddressSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this.dataAddressMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this.outOfRangeAddressMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
    };
    
    /**
     * @memberof SrMeta
     * @readonly
     * @enum {Number}
     */
    SrMeta.AddressType = {
        subroutine : 0,
        global : 1,
        table : 2,
        port : 3,
        memory : 4
    };
    
    /**
     * @memberof SrMeta
     * @readonly
     * @type {Array.<String>}
     */
    SrMeta.addressTypeNames = [
        "sub",
        "global",
        "table",
        "port",
        "memory"
    ];
    
    /**
     * @memberof SrMeta
     * @function
     * @param {Instruction} inst
     * @param {Number} addr
     * @return {Number}
     */
    SrMeta.getAddressTypeOf = function (inst, addr) {
        var dataLabelType = SrMeta.AddressType.memory;
        
        if(addr >= 0x8000 && addr < 0x10000) {
            if(!inst.doesMemoryWrite()) {
                dataLabelType = SrMeta.AddressType.table;
            }
            else {
                dataLabelType = SrMeta.AddressType.port;
            }
        }
        else if(addr >= 0x2000 && addr < 0x6000) {
            dataLabelType = SrMeta.AddressType.port;
        }
        else {
            dataLabelType = SrMeta.AddressType.memory;
        }

        return dataLabelType;
    };
    
    /**
     * @memberof SrMeta
     * @private
     * @param {karbonator.ByteArray} bytes
     * @param {Number} baseOffset
     * @param {Array} lines
     * @param {Number} pointerAddr
     * @return {Array.<Number>}
     */
    SrMeta._findJumpTable = function (bytes, baseOffset, lines, pointerAddr) {
        var jumpAddrs = [];
        
        //Jump table detection.
        if(lines.length >= 4) {
            var ptrLow = pointerAddr;
            var ptrHigh = pointerAddr + 1;
            
            var tableLow = 0;
            var tableHigh = 0;
            
            var lineNdx = lines.length - 1;
            var state = 0;
            for(var loop = true; loop && state < 4; ) {
                var line = lines[lineNdx];
                switch(state) {
                case 0:
                    switch(line[0].actionCode) {
                    case Instruction.ActionCode.sta:
                    case Instruction.ActionCode.stx:
                    case Instruction.ActionCode.sty:
                        if(line[1] === ptrHigh) {
                            --lineNdx;
                            ++state;
                        }
                        else {
                            loop = false;
                        }
                    break;
                    }
                break;
                case 1:
                    switch(line[0].actionCode) {
                    case Instruction.ActionCode.lda:
                    case Instruction.ActionCode.ldx:
                    case Instruction.ActionCode.ldy:
                        tableHigh = line[1];
                        
                        --lineNdx;
                        ++state;
                    break;
                    }
                break;
                case 2:
                    switch(line[0].actionCode) {
                    case Instruction.ActionCode.sta:
                    case Instruction.ActionCode.stx:
                    case Instruction.ActionCode.sty:
                        if(line[1] === ptrLow) {
                            --lineNdx;
                            ++state;
                        }
                        else {
                            loop = false;
                        }
                    break;
                    }
                break;
                case 3:
                    switch(line[0].actionCode) {
                    case Instruction.ActionCode.lda:
                    case Instruction.ActionCode.ldx:
                    case Instruction.ActionCode.ldy:
                        tableLow = line[1];
                        
                        --lineNdx;
                        ++state;
                    break;
                    }
                break;
                }
            }
            
            if(state >= 4) {
                var estimatedTableSize = tableHigh - tableLow;
                
                var tableHighOffset = tableHigh - baseOffset;
                var tableLowOffset = tableLow - baseOffset;
                for(var i = 0; i < estimatedTableSize; ) {
                    jumpAddrs.push((bytes.get(tableHighOffset) << 8) | bytes.get(tableLowOffset));
                    
                    ++i;
                    ++tableHighOffset;
                    ++tableLowOffset;
                }
            }
        }
        
        return jumpAddrs;
    };
    
    /**
     * @memberof SrMeta
     * @private
     * @param {Number} addr
     * @param {Number} baseOffset
     * @return {Boolean}
     */
    SrMeta._addressIsInRange = function (addr, baseOffset) {
        return addr >= baseOffset && addr < 0x10000;
    };
    
    /**
     * @memberof SrMeta
     * @param {karbonator.ByteArray} bytes
     * @param {Number} baseOffset
     * @param {Number} startAddr
     * @param {Number} endAddr
     * @returns {SrMeta}
     */
    SrMeta.fromBytes = function (bytes, baseOffset, startAddr, endAddr) {
        if(!(bytes instanceof karbonator.ByteArray)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(baseOffset)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(startAddr)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(endAddr)) {
            throw new TypeError("");
        }
        
        var srMeta = new SrMeta();
        srMeta.valid = true;
        srMeta.startAddress = startAddr;
        
        var returnInstAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var tableAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var longJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        srMeta.cursor = startAddr - baseOffset;
        for(var working = true; working && baseOffset + srMeta.cursor < endAddr; ) {
            //Inhibit violating data tables.
            var currentAddr = baseOffset + srMeta.cursor;
            var nearestNextTableAddr = tableAddrSet.findNotLessThan(currentAddr);
            if(
                !karbonator.isUndefined(nearestNextTableAddr)
                && currentAddr >= nearestNextTableAddr
            ) {
                break;
            }
            
            var opCode = bytes.get(srMeta.cursor);
            ++srMeta.cursor;
            var inst = Instruction.fromOpCode(opCode);
            if(null === inst) {
                srMeta.valid = false;
                break;
            }
            
            var operandType = inst.getOperandType();
            var operandSize = Math.abs(operandType);
            var operand = 0;
            if(operandSize > 0) {
                operand = karbonator.bytesToInteger(
                    bytes,
                    operandSize, (operandType < 0), true,
                    srMeta.cursor
                );
                srMeta.cursor += operandSize;
            }
            
            var dataLabelType = 0;
            currentAddr = baseOffset + srMeta.cursor;
            if((inst.actionCode & 0x30) === 0) {
                switch(inst.actionCode) {
                case Instruction.ActionCode.rti:
                case Instruction.ActionCode.rts:
                    returnInstAddrSet.add(currentAddr - inst.getSize());
                    
                    working = !karbonator.isUndefined(
                        srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                    );
                break;
                case Instruction.ActionCode.bpl:
                case Instruction.ActionCode.bmi:
                case Instruction.ActionCode.bne:
                case Instruction.ActionCode.beq:
                case Instruction.ActionCode.bvc:
                case Instruction.ActionCode.bvs:
                case Instruction.ActionCode.bcc:
                case Instruction.ActionCode.bcs:
                    srMeta.localJumpAddressSet.add(currentAddr + operand);
                    
                    working = !karbonator.isUndefined(
                            srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                        )
                        || (operand < 0 && karbonator.isUndefined(returnInstAddrSet.findNotLessThan(currentAddr + operand)))
                    ;
                break;
                case Instruction.ActionCode.jsr:
                    if(SrMeta._addressIsInRange(operand, baseOffset)) {
                        srMeta.srAddressSet.add(operand);
                    }
                    else {
                        srMeta.outOfRangeAddressMap.set(
                            operand,
                            SrMeta.AddressType.subroutine
                        );
                    }
                break;
                case Instruction.ActionCode.jmp:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.abs:
                        if(srMeta.getAddressRange().contains(operand)) {
                            srMeta.localJumpAddressSet.add(operand);
                        }
                        else {
                            if(SrMeta._addressIsInRange(operand, baseOffset)) {
                                longJumpAddrSet.add(operand);
                            }
                            else {
                                srMeta.outOfRangeAddressMap.set(
                                    operand,
                                    SrMeta.AddressType.global
                                );
                            }
                            
                            //서브루틴 범위 밖으로 점프해서
                            //제어를 넘기는 서브루틴인 경우.
                            working = !karbonator.isUndefined(
                                srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                            );
                        }
                    break;
                    case Instruction.AddressingMode.absInd:
                        dataLabelType = SrMeta.getAddressTypeOf(inst, operand);
                        srMeta.dataAddressMap.set(operand, dataLabelType);
                        
                        switch(dataLabelType) {
                        case SrMeta.AddressType.table:
                            if(SrMeta._addressIsInRange(operand, baseOffset)) {
                                tableAddrSet.add(operand);
                            }
                            else {
                                srMeta.outOfRangeAddressMap.set(
                                    operand,
                                    SrMeta.AddressType.table
                                );
                            }
                        break;
                        case SrMeta.AddressType.memory:
                            karbonator.forOf(
                                SrMeta._findJumpTable(
                                    bytes, baseOffset,
                                    srMeta.lines, operand
                                ),
                                function (jumpAddr) {
                                    srMeta.srAddressSet.add(jumpAddr);
                                },
                                this
                            );
                        break;
                        }
                        
                        //점프 테이블 주소로 간접 점프해서
                        //제어를 넘기는 경우.
                        working = !karbonator.isUndefined(
                            srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                        );
                    break;
                    default:
                        throw new Error("An invalid opcode has been detected.");
                    }
                break;
                }
            }
            else switch(inst.addressingMode) {
            case Instruction.AddressingMode.absNdxX:
            case Instruction.AddressingMode.absNdxY:
            case Instruction.AddressingMode.absInd:
            case Instruction.AddressingMode.abs:
            case Instruction.AddressingMode.zp:
            case Instruction.AddressingMode.zpNdxX:
            case Instruction.AddressingMode.zpNdxY:
            case Instruction.AddressingMode.zpIndNdxY:
            case Instruction.AddressingMode.zpNdxXInd:
                dataLabelType = SrMeta.getAddressTypeOf(inst, operand);
                switch(dataLabelType) {
                case SrMeta.AddressType.table:
                    if(SrMeta._addressIsInRange(operand, baseOffset)) {
                        srMeta.dataAddressMap.set(operand, dataLabelType);
                        tableAddrSet.add(operand);
                    }
                    else {
                        srMeta.outOfRangeAddressMap.set(
                            operand,
                            dataLabelType
                        );
                    }
                break;
                case SrMeta.AddressType.global:
                case SrMeta.AddressType.subroutine:
                    if(SrMeta._addressIsInRange(operand, baseOffset)) {
                        srMeta.dataAddressMap.set(operand, dataLabelType);
                    }
                    else {
                        srMeta.outOfRangeAddressMap.set(
                            operand,
                            dataLabelType
                        );
                    }

                    if(!SrMeta._addressIsInRange(operand, baseOffset)) {
                        srMeta.outOfRangeAddressMap.set(
                            operand,
                            dataLabelType
                        );
                    }
                break;
                default:
                    srMeta.dataAddressMap.set(operand, dataLabelType);
                }
            break;
            }
            
            srMeta.lines.push([inst, operand]);
        }
        
        if(srMeta.valid) {
            var range = srMeta.getAddressRange();
            karbonator.forOf(longJumpAddrSet, function (addr) {
                if(range.contains(addr)) {
                    srMeta.localJumpAddressSet.add(addr);
                }
                else {
                    srMeta.srAddressSet.add(addr);
                }
            }, this);
        }
        
        return srMeta;
    };
    
    /**
     * @function
     * @return {karbonator.math.Interval}
     */
    SrMeta.prototype.getAddressRange = function () {
        var lineCount = this.lines.length;
        if(lineCount < 1) {
            return new karbonator.math.Interval(
                -1,
                -1
            );
        }
        else {
            var max = this.startAddress;
            for(var i = lineCount; i > 0; ) {
                --i;
                max += this.lines[i][0].getSize();
            }
            
            return new karbonator.math.Interval(
                this.startAddress,
                max - 1
            );
        }
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
        this._baseOffset = 0;
        this._endAddr = 0;
        this._firstSrAddr = 0;
        
        this._tableMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._srMetaMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._outOfRangeAddrMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._memoryAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this._portAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this._failedAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
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
     * TODO : Refactor this fucking piece of fat, stupid and evil function.
     * @function
     * @param {karbonator.ByteArray} bytes
     * @param {Object} [options]
     * @return {Array.<String>}
     */
    Disassembler.prototype.disassemble = function (bytes) {
        this._initialize(bytes, arguments[1]);
        
        this._findSubroutines();
        this._estimateTableSizes();
        
        var textMap = this._formatCodes();
        
        var srsText = [];
        srsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        srsText.push(';' + "Subroutines." + ' ' + '(' + this._srMetaMap.getElementCount() + ')');
        srsText.push("\r\n");
        karbonator.forOf(this._srMetaMap, function (pair) {
            srsText.push(';' + "sub" + _formatHexadecimal(pair[0], 4));
        }, this);
        srsText.push("\r\n");
        srsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        srsText.push("\r\n");
        
        var tablesText = [];
        tablesText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        tablesText.push(';' + "Tables." + ' ' + '(' + this._tableMap.getElementCount() + ')');
        tablesText.push("\r\n");
        karbonator.forOf(this._tableMap, function (pair) {
            tablesText.push(';' + "table" + _formatHexadecimal(pair[0], 4) + ' ' + pair[1] + ' ' + "bytes.");
        }, this);
        tablesText.push("\r\n");
        tablesText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        tablesText.push("\r\n");
        
        var memoryLabelsText = [];
        memoryLabelsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        memoryLabelsText.push(';' + "Memory labels." + ' ' + '(' + this._memoryAddrSet.getElementCount() + ')');
        memoryLabelsText.push("\r\n");
        karbonator.forOf(this._memoryAddrSet, function (addr) {
            var minLen = (addr < 0x0100 ? 2 : 4);
            memoryLabelsText.push("memory" + _formatHexadecimal(addr, minLen) + ' ' + '=' + ' ' + '$' + _formatHexadecimal(addr, minLen));
        }, this);
        memoryLabelsText.push("\r\n");
        memoryLabelsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        memoryLabelsText.push("\r\n");
        
        var portLabelsText = [];
        portLabelsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        portLabelsText.push(';' + "Port labels." + ' ' + '(' + this._portAddrSet.getElementCount() + ')');
        portLabelsText.push("\r\n");
        karbonator.forOf(this._portAddrSet, function (addr) {
            portLabelsText.push("port" + _formatHexadecimal(addr, 4) + ' ' + '=' + ' ' + '$' + _formatHexadecimal(addr, 4));
        }, this);
        portLabelsText.push("\r\n");
        portLabelsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        portLabelsText.push("\r\n");
        
        var outOfRangeAddrsText = [];
        outOfRangeAddrsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        outOfRangeAddrsText.push(';' + "Out of range address labels." + ' ' + '(' + this._outOfRangeAddrMap.getElementCount() + ')');
        outOfRangeAddrsText.push("\r\n");
        karbonator.forOf(this._outOfRangeAddrMap, function (pair) {
            var addr = pair[0];
            var addrType = pair[1];
            
            var textLine = SrMeta.addressTypeNames[addrType];
            textLine += _formatHexadecimal(addr, 4);
            textLine += ' ' + '=' + ' ';
            textLine += '$' + _formatHexadecimal(addr, 4);
            
            outOfRangeAddrsText.push(textLine);
        }, this);
        outOfRangeAddrsText.push("\r\n");
        outOfRangeAddrsText.push(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
        outOfRangeAddrsText.push("\r\n");
        
        return [
            [
                srsText.join("\r\n"),
                tablesText.join("\r\n"),
                memoryLabelsText.join("\r\n"),
                portLabelsText.join("\r\n"),
                outOfRangeAddrsText.join("\r\n")
            ].join("\r\n"),
            Array.from(textMap).reduce(function (str, pair) {
                return str + pair[1] + "\r\n" + "\r\n";
            }, ""),
            Array.from(this._failedAddrSet).reduce(function (str, addr) {
                return str + _formatHexadecimal(addr, 4) + "\r\n";
            }, "")
        ];
    };
    
    /**
     * @private
     * @function
     * @param {karbonator.ByteArray} bytes
     * @param {Object} options
     */
    Disassembler.prototype._initialize = function (bytes, options) {
        if(karbonator.isUndefinedOrNull(bytes)) {
            throw new TypeError("");
        }
        this._bytes = bytes;
        
        this._tableMap.clear();
        this._srMetaMap.clear();
        this._outOfRangeAddrMap.clear();
        this._memoryAddrSet.clear();
        this._portAddrSet.clear();
        this._failedAddrSet.clear();
        
        if(karbonator.isObjectOrFunction(options)) {        
            this._baseOffset = 0;
            if(karbonator.isNonNegativeSafeInteger(options.baseOffset)) {
                this._baseOffset = options.baseOffset;
            }
            this._endAddr = this._baseOffset + bytes.getElementCount();
            
            this._firstSrAddr = this._baseOffset;
            if(karbonator.isNonNegativeSafeInteger(options.firstSubroutine)) {
                this._firstSrAddr = options.firstSubroutine;
            }
            
            if(karbonator.isEsIterable(options.tables)) {
                karbonator.forOf(options.tables, function (hint) {
                    if(karbonator.isObjectOrFunction(hint)) {
                        if(karbonator.isNonNegativeSafeInteger(hint.address)) {
                            var size = hint.size;
                            if(!karbonator.isNonNegativeSafeInteger(size)) {
                                size = 0;
                            }
                            
                            this._tableMap.set(hint.address, size);
                        }
                    }
                }, this);
            }
        }
    };
    
    /**
     * @private
     * @function
     */
    Disassembler.prototype._findSubroutines = function () {
        var srAddrQ = new karbonator.collection.PriorityQueue(karbonator.integerComparator);
        srAddrQ.enqueue(this._firstSrAddr);
        
        while(!srAddrQ.isEmpty()) {
            var srAddr = srAddrQ.dequeue();
            
            //레이블 주소가 어떤 테이블에 포함되어 있는 경우
            var mapPair = this._tableMap.findNotGreaterThan(srAddr);
            if(
                !karbonator.isUndefined(mapPair)
                && (
                    (mapPair.value === 0 && srAddr === mapPair.key)
                    || (srAddr >= mapPair.key && srAddr < mapPair.key + mapPair.value)
                )
            ) {
                continue;
            }
            
            //레이블 주소가 어떤 서브루틴의 지역 레이블인 경우
            mapPair = this._srMetaMap.findLessThan(srAddr);
            if(
                !karbonator.isUndefined(mapPair)
                && mapPair.value.getAddressRange().contains(srAddr)
            ) {
                continue;
            }
            
            var endAddr = this._endAddr;
            mapPair = this._tableMap.findNotLessThan(srAddr);
            if(!karbonator.isUndefined(mapPair)) {
                endAddr = mapPair.key;
            }
            
            var srMeta = SrMeta.fromBytes(
                this._bytes,
                this._baseOffset, srAddr, endAddr
            );
            if(srMeta.valid) {
                karbonator.forOf(srMeta.srAddressSet, function (addr) {
                    if(
                        (addr >= this._baseOffset && addr < this._endAddr)
                        && !this._srMetaMap.has(addr)
                    ) {
                        srAddrQ.enqueue(addr);
                    }
                }, this);
                
                karbonator.forOf(srMeta.dataAddressMap, function (pair) {
                    var addr = pair[0];
                    var addrType = pair[1];
                    
                    switch(addrType) {
                    case SrMeta.AddressType.table:
                        if(!this._tableMap.has(addr)) {
                            this._tableMap.set(addr, 0);
                        }
                    break;
                    case SrMeta.AddressType.memory:
                        this._memoryAddrSet.add(addr);
                    break;
                    case SrMeta.AddressType.port:
                        this._portAddrSet.add(addr);
                    break;
                    }
                }, this);
                
                karbonator.forOf(srMeta.outOfRangeAddressMap, function (pair) {
                    this._outOfRangeAddrMap.set(pair[0], pair[1]);
                }, this);
                
                //방금 처리된 서브루틴이
                //다른 서브루틴을 지역레이블로서 포함하는 경우
                var srRange = srMeta.getAddressRange();
                var srAddrsToBeRemoved = new karbonator.collection.TreeSet(karbonator.integerComparator);
                karbonator.forOf(this._srMetaMap, function (pair) {
                    var addr = pair[0];
                    
                    if(srAddr !== addr && srRange.contains(addr)) {
                        srAddrsToBeRemoved.add(addr);
                    }
                }, this);
                karbonator.forOf(srAddrsToBeRemoved, function (addr) {
                    this._srMetaMap.remove(addr);
                }, this);
                
                this._srMetaMap.set(srAddr, srMeta);
            }
            else {
                this._failedAddrSet.add(srAddr);
            }
            
            var nextTargetAddr = this._baseOffset + srMeta.cursor;
//            if(srMeta.getAddressRange().getMaximum() + (srMeta.lines.length > 0 ? 1 : 0) !== this._baseOffset + srMeta.cursor) {
//                debugger;
//            }
            if(
                nextTargetAddr < this._endAddr
                && !this._srMetaMap.has(nextTargetAddr)
            ) {
                srAddrQ.enqueue(nextTargetAddr);
            }
        }
        
//        karbonator.forOf(this._srMetaMap, function (pair) {
//            var srAddr = pair[0];
//            var srMeta = pair[1];
//            var srRange = srMeta.getAddressRange();
//            
//            var offset = 0;
//            for(var i = 0; i < srMeta.lines.length; ++i) {
//                var line = srMeta.lines[i];
//                var inst = line[0];
//                var operand = line[1];
//                offset += inst.getSize();
//                
//                var isBranchInstruction = false;
//                var isJumpInstruction = false;
//                var effectiveAddr = 0;
//                switch(inst.actionCode) {
//                case Instruction.ActionCode.jsr:
//                    effectiveAddr = operand;
//                    
//                    if(!srRange.contains(effectiveAddr)) {
//                        
//                    }
//                break;
//                case Instruction.ActionCode.jmp:
//                    switch(inst.addressingMode) {
//                    case Instruction.AddressingMode.abs:
//                        effectiveAddr = operand;
//                        
//                        isJumpInstruction = true;
//                    break;
//                    }
//                break;
//                case Instruction.ActionCode.bpl:
//                case Instruction.ActionCode.bmi:
//                case Instruction.ActionCode.bne:
//                case Instruction.ActionCode.beq:
//                case Instruction.ActionCode.bvc:
//                case Instruction.ActionCode.bvs:
//                case Instruction.ActionCode.bcc:
//                case Instruction.ActionCode.bcs:
//                    effectiveAddr = srAddr + offset + operand;
//                    
//                    isJumpInstruction = true;
//                    isBranchInstruction = true;
//                break;
//                }
//                
//                if(isJumpInstruction) {
//                    if(!srRange.contains(effectiveAddr)) {
//                        var mapPair = this._srMetaMap.findNotGreaterThan(effectiveAddr);
//                        if(!karbonator.isUndefined(mapPair)) {
//                            mapPair.value.localJumpAddressSet.add(effectiveAddr);
//                        }
//                        else if(!isBranchInstruction) {
//                            //this._outOfRangeAddrMap.set(effectiveAddr, "global");
//                        }
//                        else {
//                            throw new Error(
//                                "Cannot find the local branch address label "
//                                + _formatHexadecimal(effectiveAddr, 4)
//                                + '.'
//                            );
//                        }
//                    }
//                }
//            }
//        }, this);
    };
    
    /**
     * @private
     * @function
     */
    Disassembler.prototype._estimateTableSizes = function () {
        karbonator.forOf(this._tableMap, function (pair) {
            var tableAddr = pair[0];
            if(tableAddr >= this._baseOffset) {
                var tableSize = pair[1];
                if(tableSize < 1) {
                    var byteCount = this._endAddr - tableAddr;
                    var mapPair = this._srMetaMap.findGreaterThan(tableAddr);
                    if(!karbonator.isUndefined(mapPair)) {
                        byteCount = mapPair.key - tableAddr;
                    }
                    mapPair = this._tableMap.findGreaterThan(tableAddr);
                    if(
                        !karbonator.isUndefined(mapPair)
                        && byteCount > mapPair.key - tableAddr
                    ) {
                        byteCount = mapPair.key - tableAddr;
                    }
                    
                    this._tableMap.set(tableAddr, byteCount);
                }
            }
        }, this);
    };
    
    /**
     * @private
     * @function
     * @returns {karbonator.collection.TreeMap}
     */
    Disassembler.prototype._formatCodes = function () {
        var createJumpLabelPath = function (srMetaMap, srMeta, effectiveAddr) {
            var pathStr = "";
            
            var srRange = srMeta.getAddressRange();
            if(srRange.contains(effectiveAddr)) {
                pathStr += '.' + "branch" + _formatHexadecimal(effectiveAddr, 4);
            }
            else {
                var mapPair = srMetaMap.findNotGreaterThan(effectiveAddr);
                if(!karbonator.isUndefined(mapPair)) {
                    var otherSrMeta = mapPair.value;
                    if(otherSrMeta.startAddress === effectiveAddr) {
                        pathStr += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                    }
                    else if(otherSrMeta.localJumpAddressSet.has(effectiveAddr)) {
                        pathStr += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                        pathStr += '.' + "branch" + _formatHexadecimal(effectiveAddr, 4);
                    }
                    else {
                        pathStr += "EXPR(";
                        pathStr += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                        pathStr += ' ' + '+' + ' ' + (effectiveAddr - otherSrMeta.startAddress);
                        pathStr += ')';
                    }
                }
                else {
                    pathStr += "global" + _formatHexadecimal(effectiveAddr, 4);
                }
            }
            
            return pathStr;
        };
        
        var textMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        karbonator.forOf(this._srMetaMap, function (pair) {
            var srAddr = pair[0];
            var srMeta = pair[1];
            var srRange = srMeta.getAddressRange();
            
            var textLines = [];
            
            textLines.push('\t' + _directivePrefix + "org" + ' ' + '$' + _formatHexadecimal(srAddr, 4));
            textLines.push("sub" + _formatHexadecimal(srAddr, 4) + ':');
            
            var offset = 0;
            for(var i = 0; i < srMeta.lines.length; ++i) {
                var line = srMeta.lines[i];
                var textLine = '\t';
                var inst = line[0];
                var operand = line[1];
                var effectiveAddr = 0;
                
                if(srMeta.localJumpAddressSet.has(srAddr + offset)) {
                    textLines.push('.' + "branch" + _formatHexadecimal(srAddr + offset, 4) + ':');
                }
                
                offset += inst.getSize();
                
                textLine += Instruction.mnemonics[inst.actionCode];
                textLine += ' ';
                
                switch(inst.actionCode) {
                case Instruction.ActionCode.jsr:
                    textLine += "sub" + _formatHexadecimal(operand, 4);
                break;
                case Instruction.ActionCode.jmp:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.abs:
                        textLine += createJumpLabelPath(this._srMetaMap, srMeta, operand);
                    break;
                    case Instruction.AddressingMode.absInd:
                        textLine += '(';
                        
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                        
                        textLine += ')';
                    break;
                    }
                break;
                case Instruction.ActionCode.bpl:
                case Instruction.ActionCode.bmi:
                case Instruction.ActionCode.bne:
                case Instruction.ActionCode.beq:
                case Instruction.ActionCode.bvc:
                case Instruction.ActionCode.bvs:
                case Instruction.ActionCode.bcc:
                case Instruction.ActionCode.bcs:
                    effectiveAddr = srAddr + offset + operand;
                    if(!srMeta.localJumpAddressSet.has(effectiveAddr)) {
                        throw new Error("What the fuck?");
                    }
                    
                    if(srRange.contains(effectiveAddr)) {
                        textLine += '.' + "branch" + _formatHexadecimal(effectiveAddr, 4);
                    }
                    else {
                        var mapPair = this._srMetaMap.findNotGreaterThan(effectiveAddr);
                        if(karbonator.isUndefined(mapPair)) {
                            throw new Error(
                                "Cannot find the local label of "
                                + _formatHexadecimal(effectiveAddr, 4) 
                                + '.'
                            );
                        }
                        
                        var otherSrMeta = mapPair.value;
                        if(otherSrMeta.startAddress === effectiveAddr) {
                            textLine += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                        }
                        else if(otherSrMeta.localJumpAddressSet.has(effectiveAddr)) {
                            textLine += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                            textLine += '.' + "branch" + _formatHexadecimal(effectiveAddr, 4);
                        }
                        else {
                            textLine += "EXPR(";
                            textLine += "sub" + _formatHexadecimal(otherSrMeta.startAddress, 4);
                            textLine += ' ' + '+' + ' ' + (effectiveAddr - otherSrMeta.startAddress);
                            textLine += ')';
                        }
                    }
                break;
                default:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.regA:
                        textLine += 'A';
                    break;
                    case Instruction.AddressingMode.imm:
                        textLine += _directivePrefix + '$' + _formatHexadecimal(operand, 2);
                    break;
                    case Instruction.AddressingMode.abs:
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                    break;
                    case Instruction.AddressingMode.absNdxX:
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                        textLine += ',' + 'X';
                    break;
                    case Instruction.AddressingMode.absNdxY:
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                        textLine += ',' + 'Y';
                    break;
                    case Instruction.AddressingMode.zp:
                        textLine += '<';
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                    break;
                    case Instruction.AddressingMode.zpNdxX:
                        textLine += '<';
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'X';
                    break;
                    case Instruction.AddressingMode.zpNdxY:
                        textLine += '<';
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'Y';
                    break;
                    case Instruction.AddressingMode.zpNdxXInd:
                        textLine += '(';
                        textLine += '<';
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'X';
                        textLine += ')';
                    break;
                    case Instruction.AddressingMode.zpIndNdxY:
                        textLine += '(';
                        textLine += '<';
                        textLine += SrMeta.addressTypeNames[SrMeta.getAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ')';
                        textLine += ',' + 'Y';
                    break;
                    }
                }
                
                textLines.push(textLine);
            }
            
            textMap.set(pair[0], textLines.join("\r\n"));
        }, this);
        
        karbonator.forOf(this._tableMap, function (pair) {
            var tableAddr = pair[0];
            if(tableAddr >= this._baseOffset) {
                var tableSize = pair[1];
                var textLines = [];
                
                textLines.push('\t' + _directivePrefix + "org" + ' ' + '$' + _formatHexadecimal(tableAddr, 4));
                textLines.push("table" + _formatHexadecimal(tableAddr, 4) + ':');
                textLines.push(";" + tableSize + ' ' + "bytes.");
                
                var textLine = "";
                var startIndex = tableAddr - this._baseOffset;
                var endIndex = startIndex + tableSize;
                var bytesPerLineExp = 3;
                var lineCount = tableSize >> bytesPerLineExp;
                var l = 0;
                for(; l < lineCount; ++l) {
                    textLine = '\t';
                    textLine += _directivePrefix + "dc.1";
                    textLine += ' ';
                    textLine += Array.from(this._bytes.slice(
                            startIndex + (l << bytesPerLineExp),
                            startIndex + ((l + 1) << bytesPerLineExp)
                        ))
                        .reduce(function (strArr, val) {
                            strArr.push('$' + _formatHexadecimal(val, 2));
                            return strArr;
                        }, [])
                        .join(", ")
                    ;
                    
                    textLines.push(textLine);
                }
                
                if(startIndex + (l << bytesPerLineExp) < endIndex) {
                    textLine = '\t';
                    textLine += _directivePrefix + "dc.1";
                    textLine += ' ';
                    textLine += Array.from(this._bytes.slice(
                            startIndex + (l << bytesPerLineExp),
                            endIndex
                        ))
                        .reduce(function (strArr, val) {
                            strArr.push('$' + _formatHexadecimal(val, 2));
                            return strArr;
                        }, [])
                        .join(", ")
                    ;
                    
                    textLines.push(textLine);
                }
                
                textMap.set(tableAddr, textLines.join("\r\n"));
            }
        }, this);
        
        return textMap;
    };
    
    nes.Disassembler = Disassembler;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //SymbolTable
    
    var SymbolTable = function () {
        
    };
    
    /**
     * @function
     * @param {String} path
     * @return {PpSymbol}
     */
    SymbolTable.prototype.findByPath = function (path) {
        
    };
    
    /**
     * @function
     * @param {String} name
     * @return {Array.<String>}
     */
    SymbolTable.prototype.findAllPaths = function (name) {
        
    };
    
    
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Assembler
    
    var lg = new karbonator.string.LexerGenerator();
    lg.defineToken("nz_digit", "[1-9]", true);
    lg.defineToken("digit", "[0-9]", true);
    lg.defineToken("id", "[a-zA-Z_$][a-zA-Z_$0-9]*");
    lg.defineToken("lit-string", "\".*?\"");
    lg.defineToken("global_label", "{id}:");
    lg.defineToken("local_label", "\\.{global_label}");
    lg.defineToken("local_rel_label", "\\.(\\+|\\-)?[1-9][0-9]*");
    lg.defineToken("base2_int", "[0-1]{1,8}");
    lg.defineToken("base10_int", "{nz_digit}{digit}*");
    lg.defineToken("base16_int", "([a-zA-Z0-9]{2})+");
    
    /**
     * @constructor
     */
    var SourceCodeBlock = function () {
        this.filePath = "";
        this.includeStack = [];
        this.startLineIndex = 0;
        this.endLineIndex = 0;
        this.codeLines = [];
    };
    
    /**
     * @function
     * @param {String} newFilePath
     * @return {Boolean}
     */
    SourceCodeBlock.prototype.testIncludeCycle = function (newFilePath) {
        
    };
    
    /**
     * @memberof karbonator.nes
     * @constructor
     */
    var Assembler = function () {
        this._lexer = lg.generate();
        this._strLines = null;
        
        this._filePathMap = new karbonator.collection.TreeMap(karbonator.stringComparator);
        this._nsMap = new karbonator.collection.TreeMap(karbonator.stringComparator);
//        this._funcMap = new karbonator.collection.TreeMap();
//        this._macroMap = new karbonator.collection.TreeMap();
    };
    
    /**
     * @function
     * @param {String} str
     */
    Assembler.prototype.assemble = function (str) {
        //Resolve include & require directives.
        
        
        //Read and process other macro symbols.
        
        
        //Translate
        
        
    };
    
    /**
     * @private
     * @function
     * @param {String} str
     * @param {Number} startIndex
     */
    Assembler.prototype._processPp = function (str, startIndex) {
        var srcCodeBlock = null;
        var namespace = new PpSymbol("global");
        var globalLabel = null;
        var localLabel = null;
        var bank = 0;
        var org = 0;
        
        var pos = startIndex;
        var arg = "";
        var state = 0;
        while(true) {
            var ch = str.charAt(pos);
            switch(state) {
            case 0:
                switch(ch) {
                case ' ': case '\t':
                case '\v': case '\f':
                case '\r': case '\n':
                    ++pos;
                break;
                case _directivePrefix:
                    state = 1;
                    ++pos;
                break;
                }
            break;
            case 1:
                var cmd = "";
                switch(cmd.toLowerCase()) {
                case "namespace":
                    arg = ""; //TODO : read the symbol name.
                    namespace = new PpSymbol(arg);
                    if(!this._nsMap.has(arg)) {
                        this._nsMap.set(arg, namespace);
                    }
                break;
                case "function":
                    //add name to symbol table.
                    //read and add the expression.
                break;
                case "macro":
                    //add name to symbol table.
                    //read and add the macro definition.
                break;
                case "endm":
                    
                break;
                case "if":
                    
                break;
                case "elif":
                    
                break;
                case "else":
                    
                break;
                case "endif":
                    
                break;
                case "include":
                    
                break;
                case "import":
                    
                break;
                case "org":
                    arg = "8000"; //TODO : Scan the integer literal.
                    org = Number.parseInt(arg, 10); //TODO : Determine the base of the integer literal.
                break;
                case "dc":
                    
                break;
                }
            break;
            }
        }
    };
    
    nes.Assembler = Assembler;
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
