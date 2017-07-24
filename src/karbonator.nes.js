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
            str += '#' + operandStr;
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
    };
    
    /**
     * @memberof SrMeta
     * @readonly
     * @enum {Number}
     */
    SrMeta.DataAddressType = {
        table : 0,
        port : 1,
        pointer : 2,
        memory : 3
    };
    
    /**
     * @memberof SrMeta
     * @readonly
     * @type {Array.<String>}
     */
    SrMeta.DataAddressTypeNames = [
        "table",
        "port",
        "pointer",
        "memory"
    ];
    
    /**
     * @memberof SrMeta
     * @function
     * @param {Instruction} inst
     * @param {Number} addr
     * @return {Number}
     */
    SrMeta.getDataAddressTypeOf = function (inst, addr) {
        var dataLabelType = SrMeta.DataAddressType.memory;
        
        if(addr >= 0x8000 && addr < 0x10000) {
            if(!inst.doesMemoryWrite()) {
                dataLabelType = SrMeta.DataAddressType.table;
            }
            else {
                dataLabelType = SrMeta.DataAddressType.port;
            }
        }
        else if(addr >= 0x4000 && addr < 0x6000) {
            dataLabelType = SrMeta.DataAddressType.port;
        }
        else {
            dataLabelType = SrMeta.DataAddressType.memory;
        }

        return dataLabelType;
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
        srMeta.cursor = startAddr - baseOffset;
        
        var tableAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var longJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        var returnCount = 0;
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
                    ++returnCount;
                    
                    if(karbonator.isUndefined(
                        srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                    )) {
                        working = false;
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
                    srMeta.localJumpAddressSet.add(currentAddr + operand);
                    
                    if(
                        returnCount > 0
                        && karbonator.isUndefined(
                            srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                        )
                    ) {
                        working = false;
                    }
                break;
                case Instruction.ActionCode.jsr:
                    srMeta.srAddressSet.add(operand);
                break;
                case Instruction.ActionCode.jmp:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.abs:
                        if(srMeta.getAddressRange().contains(operand)) {
                            srMeta.localJumpAddressSet.add(operand);
                        }
                        else {
                            longJumpAddrSet.add(operand);
                        }
                        
                        //서브루틴 범위 밖으로 점프해서
                        //제어를 넘기는 서브루틴인 경우.
                        if(
                            operand < srMeta.startAddress
                            && karbonator.isUndefined(
                                srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
                            )
                        ) {
                            working = false;
                        }
                    break;
                    case Instruction.AddressingMode.absInd:
                        dataLabelType = SrMeta.getDataAddressTypeOf(inst, operand);
                        srMeta.dataAddressMap.set(operand, dataLabelType);
                        if(dataLabelType === SrMeta.DataAddressType.table) {
                            tableAddrSet.add(operand);
                        }
                        
                        //점프 테이블 주소로 간접 점프해서
                        //제어를 넘기는 경우.
                        if(karbonator.isUndefined(
                            srMeta.localJumpAddressSet.findNotLessThan(currentAddr)
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
                dataLabelType = SrMeta.getDataAddressTypeOf(inst, operand);
                srMeta.dataAddressMap.set(operand, dataLabelType);
                if(dataLabelType === SrMeta.DataAddressType.table) {
                    tableAddrSet.add(operand);
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
            });
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
                this.startAddress,
                this.startAddress
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
     * @param {Label} lhs
     * @param {Label} rhs
     * @return {Number}
     */
    Disassembler._LabelComparator = function (lhs, rhs) {
        if(!(lhs instanceof Label) || !(rhs instanceof Label)) {
            throw new Error("Both 'lhs' and 'rhs' must be an instnaceof 'Label'.");
        }
        
        return lhs.address - rhs.address;
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
        
        this._localJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
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
        var lineCount = this._lines.length;
        if(lineCount < 1) {
            return new karbonator.math.Interval(
                this.startAddress,
                this.startAddress
            );
        }
        else {
            var max = this.startAddress;
            for(var i = lineCount; i > 0; ) {
                --i;
                max += this._lines[i].getByteCount();
            }
            
            return new karbonator.math.Interval(
                this.startAddress,
                max - 1
            );
        }
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
     */
    Disassembler.LineList.prototype.clear = function () {
        this._lines.length = 0;
    };
    
    /**
     * @function
     * @param {Number} addr
     */
    Disassembler.LineList.prototype.addLocalJumpAddress = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        this._localJumpAddrSet.add(addr);
    };
    
    /**
     * @function
     * @param {Number} addr
     * @return {Boolean}
     */
    Disassembler.LineList.prototype.hasLocalJumpAddress = function (addr) {
        if(!karbonator.isNonNegativeSafeInteger(addr)) {
            throw new TypeError("");
        }
        
        return this._localJumpAddrSet.has(addr);
    };
    
    /**
     * @function
     * @return {String}
     */
    Disassembler.LineList.prototype.toString = function () {
        
//            var operandStr = '$' + _formatHexadecimal(
//                operand,
//                (Math.abs(Disassembler._operandTypeTable[decodedOpCode.addressingMode]) << 1)
//            );
        
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
    Disassembler.DataLabelType = {
        table : 0,
        port : 1,
        pointer : 2,
        memory : 3
    };
    
    /**
     * @memberof Disassembler
     * @private
     * @constructor
     * @param {Number} startAddress
     */
    Disassembler._SrDisasmResult = function (startAddress) {
        this.succeeded = false;
        this.lineList = new Disassembler.LineList(startAddress);
        this.srAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        this.dataAddrMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this.cursor = 0;
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
     * @param {Number} baseOffset
     * @param {Number} [startAddr]
     * @param {Object} [options]
     * @return {Array.<String>}
     */
    Disassembler.prototype.disassemble = function (bytes, baseOffset) {
        if(karbonator.isUndefinedOrNull(bytes)) {
            throw new TypeError("");
        }
        this._bytes = bytes;
        
        if(!karbonator.isNonNegativeSafeInteger(baseOffset)) {
            throw new TypeError("'baseOffset' must be a non-negative safe integer.");
        }
        this._baseOff = baseOffset;
        
        var startAddr = arguments[2];
        if(karbonator.isUndefined(startAddr)) {
            startAddr = this._baseOff;
        }
        else if(!karbonator.isNonNegativeSafeInteger(startAddr)) {
            throw new TypeError("'startAddr' must be a non-negative safe integer.");
        }
        else if(startAddr < baseOffset) {
            throw new RangeError("'startAddr' cannot be less than 'baseOffset'.");
        }
        
        var tableMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        var srMetaMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        var failedAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        this._initialize();
        var byteCount = bytes.getElementCount();
        var endOfBytes = this._baseOff + byteCount;
        var options = arguments[3];
        if(karbonator.isObjectOrFunction(options)) {
            if(karbonator.isEsIterable(options.predefinedDataLabels)) {
                karbonator.forOf(options.predefinedDataLabels, function (pair) {
                    if(
                        !karbonator.isArray(pair)
                        || pair.length < 2
                        || !karbonator.isNonNegativeSafeInteger(pair[0])
                        || !karbonator.isNonNegativeSafeInteger(pair[1])
                    ) {
                        throw new TypeError("[addr, byteCount]");
                    }
                    
                    tableMap.set(pair[0], pair[1]);
                }, this);
            }
        }
        
        var srAddrQ = new karbonator.collection.PriorityQueue(karbonator.integerComparator);
        srAddrQ.enqueue(startAddr);
        while(!srAddrQ.isEmpty()) {
            var srAddr = srAddrQ.dequeue();
            
            //TODO : 코드 검증
            //레이블 주소가 어떤 서브루틴의 지역 레이블인 경우
            var mapPair = srMetaMap.findNearestLessThan(srAddr);
            if(!karbonator.isUndefined(mapPair)) {
                if(mapPair.value.getAddressRange().contains(srAddr)) {
                    continue;
                }
            }
            
            var endAddr = endOfBytes;
            mapPair = tableMap.findNotLessThan(srAddr);
            if(!karbonator.isUndefined(mapPair)) {
                endAddr = mapPair.key;
            }
            
            var srMeta = SrMeta.fromBytes(
                this._bytes,
                this._baseOff, srAddr, endAddr
            );
            
            if(srMeta.valid) {
                karbonator.forOf(srMeta.srAddressSet, function (addr) {
                    if(addr >= this._baseOff && addr < endOfBytes && !srMetaMap.has(addr)) {
                        srAddrQ.enqueue(addr);
                    }
                }, this);
                
                karbonator.forOf(srMeta.dataAddressMap, function (pair) {
                    if(
                        pair[1] === SrMeta.DataAddressType.table
                        && !tableMap.has(pair[0])
                    ) {
                        tableMap.set(pair[0], 0);
                    }
                }, this);
                
                //TODO : 코드 검증
                //방금 처리된 서브루틴이
                //다른 서브루틴을 지역레이블로서 포함하는 경우
                var srRange = srMeta.getAddressRange();
                var srAddrsToBeRemoved = new karbonator.collection.TreeSet(karbonator.integerComparator);
                karbonator.forOf(srMetaMap, function (pair) {
                    var addr = pair[0];
                    
                    if(srAddr !== addr && srRange.contains(addr)) {
                        srAddrsToBeRemoved.add(addr);
                    }
                }, this);
                karbonator.forOf(srAddrsToBeRemoved, function (addr) {
                    srMetaMap.remove(addr);
                }, this);
                
                srMetaMap.set(srAddr, srMeta);
            }
            else {
                failedAddrSet.add(srAddr);
            }
            this._cursor = srMeta.cursor;
            
            if(this._cursor < byteCount && !srMetaMap.has(this._baseOff + this._cursor)) {
                srAddrQ.enqueue(this._baseOff + this._cursor);
            }
        }
        
        //Estimate the size of tables.
        karbonator.forOf(tableMap, function (pair) {
            var tableAddr = pair[0];
            if(tableAddr >= this._baseOff) {
                var tableSize = pair[1];
                if(tableSize < 1) {
                    var byteCount = endOfBytes - tableAddr;
                    var mapPair = srMetaMap.findGreaterThan(tableAddr);
                    if(!karbonator.isUndefined(mapPair)) {
                        byteCount = mapPair.key - tableAddr;
                    }
                    mapPair = tableMap.findGreaterThan(tableAddr);
                    if(
                        !karbonator.isUndefined(mapPair)
                        && byteCount > mapPair.key - tableAddr
                    ) {
                        byteCount = mapPair.key - tableAddr;
                    }
                    
                    tableMap.set(tableAddr, byteCount);
                }
            }
        }, this);
        
        //Format and output the results.
        var textMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        karbonator.forOf(srMetaMap, function (pair) {
            var srAddr = pair[0];
            var srMeta = pair[1];
            
            var textLines = [];
            
            textLines.push('\t' + '#' + "org" + ' ' + '$' + _formatHexadecimal(srAddr, 4));
            textLines.push("global" + _formatHexadecimal(srAddr, 4) + ':');
            
            var offset = 0;
            for(var i = 0; i < srMeta.lines.length; ++i) {
                var line = srMeta.lines[i];
                var textLine = '\t';
                var inst = line[0];
                var operand = line[1];
                var effectiveAddr = 0;
                
                if(
                    srAddr + offset !== srAddr
                    && srMeta.localJumpAddressSet.has(srAddr + offset)
                ) {
                    textLines.push('.' + "local" + _formatHexadecimal(srAddr + offset, 4) + ':');
                }
                
                offset += inst.getSize();
                
                textLine += Instruction.mnemonics[inst.actionCode];
                textLine += ' ';
                
                switch(inst.actionCode) {
                case Instruction.ActionCode.jsr:
                    textLine += "global" + _formatHexadecimal(operand, 4);
                break;
                case Instruction.ActionCode.jmp:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.abs:
                        textLine += "global" + _formatHexadecimal(operand, 4);
                    break;
                    case Instruction.AddressingMode.absInd:
                        textLine += '(';
                        
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
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
                    
                    if(srMeta.localJumpAddressSet.has(effectiveAddr)) {
                        if(effectiveAddr >= srAddr) {
                            textLine += '.' + "local" + _formatHexadecimal(effectiveAddr, 4);
                        }
                        else {
                            //TODO : 다른 전역 레이블 안에 있는 지역 레이블 참조
                            textLine += operand;//'$' + _formatHexadecimal(effectiveAddr, 2);
                        }
                    }
                    else {
                        throw new Error("What the fuck?");
                    }
                break;
                default:
                    switch(inst.addressingMode) {
                    case Instruction.AddressingMode.regA:
                        textLine += 'A';
                    break;
                    case Instruction.AddressingMode.imm:
                        textLine += '#' + '$' + _formatHexadecimal(operand, 2);
                    break;
                    case Instruction.AddressingMode.abs:
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                    break;
                    case Instruction.AddressingMode.absNdxX:
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                        textLine += ',' + 'X';
                    break;
                    case Instruction.AddressingMode.absNdxY:
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 4);
                        textLine += ',' + 'Y';
                    break;
                    case Instruction.AddressingMode.zp:
                        textLine += '<';
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                    break;
                    case Instruction.AddressingMode.zpNdxX:
                        textLine += '<';
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'X';
                    break;
                    case Instruction.AddressingMode.zpNdxY:
                        textLine += '<';
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'Y';
                    break;
                    case Instruction.AddressingMode.zpNdxXInd:
                        textLine += '(';
                        textLine += '<';
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
                        textLine += _formatHexadecimal(operand, 2);
                        textLine += ',' + 'X';
                        textLine += ')';
                    break;
                    case Instruction.AddressingMode.zpIndNdxY:
                        textLine += '(';
                        textLine += '<';
                        textLine += SrMeta.DataAddressTypeNames[SrMeta.getDataAddressTypeOf(inst, operand)];
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
        
        karbonator.forOf(tableMap, function (pair) {
            var tableAddr = pair[0];
            if(tableAddr >= this._baseOff) {
                var tableSize = pair[1];
                var textLines = [];
                
                textLines.push('\t' + '#' + "org" + ' ' + '$' + _formatHexadecimal(tableAddr, 4));
                textLines.push("table" + _formatHexadecimal(tableAddr, 4) + ':');
                
                var textLine = "";
                var startIndex = tableAddr - this._baseOff;
                var endIndex = startIndex + tableSize;
                var bytesPerLineExp = 3;
                var lineCount = tableSize >> bytesPerLineExp;
                var l = 0;
                for(; l < lineCount; ++l) {
                    textLine = '\t';
                    textLine += '#' + "db";
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
                    textLine += '#' + "db";
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
        
        
        
        return [
            "",
            Array.from(textMap).reduce(function (str, pair) {
                return str + pair[1] + "\r\n" + "\r\n";
            }, ""),
            Array.from(failedAddrSet).reduce(function (str, addr) {
                return str + _formatHexadecimal(addr, 4) + "\r\n";
            }, "")
        ];
        
//        this._enqueueGcLabel(this._addGcLabel(this._baseOff));
//        while(!this._cLabelQ.isEmpty()) {
//            var gcLabel = this._cLabelQ.dequeue();
//            
//            var nextAddr = gcLabel.address;
//            var found = false;
//            do {
//                var nearestPair = this._dLabelMap.findNotLessThan(nextAddr);
//                if(!karbonator.isUndefined(nearestPair)) {
//                    var nearestDLabel = nearestPair.value;
//                    var range = new karbonator.math.Interval(
//                        nearestDLabel.address,
//                        nearestDLabel.address + nearestDLabel.byteCount
//                    );
//                    if(range.contains(nextAddr)) {
//                        nextAddr = range.getMaximum();
//                        
//                        if(nextAddr === range.getMinimum()) {
//                            ++nextAddr;
//                        }
//                    }
//                    else {
//                        found = true;
//                    }
//                }
//                else {
//                    found = true;
//                }
//            }
//            while(nextAddr < endOfBytes && !found);
//            if(nextAddr !== gcLabel.address) {
//                if(found) {
//                    this._enqueueGcLabel(this._addGcLabel(nextAddr));
//                }
//                
//                continue;
//            }
//            
//            //TODO : 코드 검증
//            //레이블 주소가 어떤 서브루틴의 지역 레이블인 경우
//            var nearestPair = this._srMap.findNearestLessThan(gcLabel.address);
//            if(!karbonator.isUndefined(nearestPair)) {
//                if(nearestPair.value.getAddressRange().contains(gcLabel.address)) {
//                    continue;
//                }
//            }
//            
//            console.clear();
//            
//            var endAddr = this._bytes.getElementCount();
//            var mapPair = this._dLabelMap.findNotLessThan(gcLabel.address);
//            if(!karbonator.isUndefined(mapPair)) {
//                endAddr = mapPair.key;
//            }
//            var srResult = this._disassembleSubroutine(gcLabel.address, endAddr);
//            if(srResult.succeeded) {
//                karbonator.forOf(srResult.srAddrSet, function (addr) {
//                    this._enqueueGcLabel(this._addGcLabel(addr));
//                }, this);
//                
//                karbonator.forOf(srResult.dataAddrMap, function (pair) {
//                    if(pair[1] === Disassembler.DataLabelType.table) {
//                        this._addGdLabel(pair[0]);
//                    }
//                }, this);
//                
//                console.log(srResult.lineList.toString());
//                
//                //TODO : 코드 검증
//                //방금 처리된 서브루틴이
//                //다른 서브루틴을 지역레이블로서 포함하는 경우
//                var cLabelAddrsToRemove = new karbonator.collection.TreeSet(karbonator.integerComparator);
//                karbonator.forOf(this._cLabelMap, function (pair) {
//                    var addr = pair[0];
//                    
//                    if(
//                        gcLabel.address !== addr
//                        && range.contains(addr)
//                    ) {
//                        cLabelAddrsToRemove.add(addr);
//                    }
//                }, this);
//                karbonator.forOf(cLabelAddrsToRemove, function (addr) {
//                    this._cLabelMap.remove(addr);
//                    this._labelMap.get(addr).parent = gcLabel;
//                }, this);
//                
//                this._srMap.set(gcLabel.address, srResult.lineList);
//            }
//            else {
//                if(srResult.lineList.getCountOf(Disassembler.Line.Type.instruction) > 0) {
//                    this._failedLineListMap.set(gcLabel.address, srResult.lineList);
//                }
//                
//                console.log("Failed to disassemble : 0x" + _formatHexadecimal(gcLabel.address) + "\r\n");
//            }
//            this._cursor = srResult.cursor;
//            
//            if(this._cursor < byteCount) {
//                var nextAddr = this._getCurrentAddress();
//                this._enqueueGcLabel(this._addGcLabel(nextAddr));
//            }
//        }
        
        
//        /**
//         * @function
//         * @param {karbonator.collection.TreeMap} lineListMap
//         */
//        Disassembler.LineList.prototype.addPpSymbols = function (lineListMap) {
//            this.insert(
//                new Disassembler.Line(
//                    Disassembler.Line.Type.label,
//                    this.startAddress
//                ),
//                0
//            );
//
//            this.insert(
//                new Disassembler.Line(
//                    Disassembler.Line.Type.directive,
//                    ["ORG", this.startAddress]
//                ),
//                0
//            );
//
//            karbonator.forOf(this._localJumpAddrSet, function (addr) {
//                if(addr >= this.startAddress) {
//                    this.insert(
//                        new Disassembler.Line(
//                            Disassembler.Line.Type.label,
//                            this._addLcLabel(srLabel, addr)
//                        ),
//                        this.findInstructionIndex(
//                            this.findIndexOfAddress(addr)
//                        )
//                    );
//                }
//                else {
//                    //TODO : 전역 레이블의 자식 레이블 참조 코드 작성
//                    debugger;
//                }
//            }, this);
//        };
//        
//        return this._createResult();
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
            
            karbonator.forOf(options.predefinedDataLabels, function (pair) {
                if(
                    !karbonator.isArray(pair)
                    || pair.length < 2
                    || !karbonator.isNonNegativeSafeInteger(pair[0])
                    || !karbonator.isNonNegativeSafeInteger(pair[1])
                ) {
                    throw new TypeError("[addr, byteCount]");
                }
                
                this._addGdLabel(pair[0], pair[1]);
            }, this);
        }
    };
    
    /**
     * @private
     * @function
     * @param {Number} startAddr
     * @param {Number} endAddr
     * @return {Disassembler._SrDisasmResult}
     */
    Disassembler.prototype._disassembleSubroutine = function (startAddr, endAddr) {
        if(!karbonator.isNonNegativeSafeInteger(startAddr)) {
            throw new TypeError("");
        }
        if(!karbonator.isNonNegativeSafeInteger(endAddr)) {
            throw new TypeError("");
        }
        
        var result = new Disassembler._SrDisasmResult(startAddr);
        result.succeeded = true;
        result.cursor = startAddr - this._baseOff;
        
        var tableAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var longJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        var lcJumpAddrSet = new karbonator.collection.TreeSet(karbonator.integerComparator);
        
        var returnCount = 0;
        for(var working = true; working && result.cursor < endAddr; ) {
            //Inhibit violating data tables.
            var currentAddr = this._baseOff + result.cursor;
            var nearestNextTableAddr = tableAddrSet.findNotLessThan(currentAddr);
            if(
                !karbonator.isUndefined(nearestNextTableAddr)
                && currentAddr >= nearestNextTableAddr
            ) {
                break;
            }
            
            var opCode = this._bytes.get(result.cursor);
            ++result.cursor;
            var decodedOpCode = Instruction.fromOpCode(opCode);
            if(null === decodedOpCode) {
                result.succeeded = false;
                break;
            }
            
            var operandType = decodedOpCode.getOperandType();
            var operandSize = Math.abs(operandType);
            var operand = 0;
            if(operandSize > 0) {
                operand = karbonator.bytesToInteger(
                    this._bytes,
                    operandSize, (operandType < 0), true,
                    result.cursor
                );
                result.cursor += operandSize;
            }
            
            var dataLabelType = 0;
            currentAddr = this._baseOff + result.cursor;
            if((decodedOpCode.actionCode & 0x30) === 0) {
                switch(decodedOpCode.actionCode) {
                case Instruction.ActionCode.rti:
                case Instruction.ActionCode.rts:
                    ++returnCount;
                    
                    if(karbonator.isUndefined(
                        lcJumpAddrSet.findNotLessThan(currentAddr)
                    )) {
                        working = false;
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
                    lcJumpAddrSet.add(currentAddr + operand);
                    
                    if(
                        returnCount > 0
                        && karbonator.isUndefined(
                            lcJumpAddrSet.findNotLessThan(currentAddr)
                        )
                    ) {
                        working = false;
                    }
                break;
                case Instruction.ActionCode.jsr:
                    result.srAddrSet.add(operand);
                break;
                case Instruction.ActionCode.jmp:
                    switch(decodedOpCode.addressingMode) {
                    case Instruction.AddressingMode.abs:
                        if(result.lineList.getAddressRange().contains(operand)) {
                            lcJumpAddrSet.add(operand);
                        }
                        else {
                            longJumpAddrSet.add(operand);
                        }
                        
                        //서브루틴 범위 밖으로 점프해서
                        //제어를 넘기는 서브루틴인 경우.
                        if(
                            operand < result.lineList.startAddress
                            && karbonator.isUndefined(
                                lcJumpAddrSet.findNotLessThan(currentAddr)
                            )
                        ) {
                            working = false;
                        }
                    break;
                    case Instruction.AddressingMode.absInd:
                        dataLabelType = this._getDataLabelTypeOf(decodedOpCode, operand);
                        result.dataAddrMap.set(operand, dataLabelType);
                        if(dataLabelType === Disassembler.DataLabelType.table) {
                            tableAddrSet.add(operand);
                        }
                        
                        //점프 테이블 주소로 간접 점프해서
                        //제어를 넘기는 경우.
                        if(karbonator.isUndefined(
                            lcJumpAddrSet.findNotLessThan(currentAddr)
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
            case Instruction.AddressingMode.absNdxX:
            case Instruction.AddressingMode.absNdxY:
            case Instruction.AddressingMode.absInd:
            case Instruction.AddressingMode.abs:
            case Instruction.AddressingMode.zp:
            case Instruction.AddressingMode.zpNdxX:
            case Instruction.AddressingMode.zpNdxY:
            case Instruction.AddressingMode.zpIndNdxY:
            case Instruction.AddressingMode.zpNdxXInd:
                dataLabelType = this._getDataLabelTypeOf(decodedOpCode, operand);
                result.dataAddrMap.set(operand, dataLabelType);
                if(dataLabelType === Disassembler.DataLabelType.table) {
                    tableAddrSet.add(operand);
                }
            break;
            }
            
            result.lineList.add(new Disassembler.Line(
                Disassembler.Line.Type.instruction,
                [decodedOpCode, operand]
            ));
        }
        
        if(result.succeeded) {
            var range = result.lineList.getAddressRange();
            karbonator.forOf(longJumpAddrSet, function (addr) {
                if(range.contains(addr)) {
                    lcJumpAddrSet.add(addr);
                }
                else {
                    result.srAddrSet.add(addr);
                }
            }, this);
            
            karbonator.forOf(lcJumpAddrSet, function (addr) {
                result.lineList.addLocalJumpAddress(addr);
            });
        }
        
        return result;
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
    Disassembler.prototype._getCurrentAddress = function () {
        return this._baseOff + this._cursor;
    };
    
    /**
     * @private
     * @param {Instruction} decodedOpCode
     * @param {Number} addr
     * @returns {Number}
     */
    Disassembler.prototype._getDataLabelTypeOf = function (decodedOpCode, addr) {
        var dataLabelType = Disassembler.DataLabelType.memory;
        
        if(addr >= 0x8000 && addr < 0x10000) {
            if(!decodedOpCode.doesMemoryWrite()) {
                dataLabelType = Disassembler.DataLabelType.table;
            }
            else {
                dataLabelType = Disassembler.DataLabelType.port;
            }
        }
        else if(addr >= 0x4000 && addr < 0x6000) {
            dataLabelType = Disassembler.DataLabelType.port;
        }
        else {
            dataLabelType = Disassembler.DataLabelType.memory;
        }

        return dataLabelType;
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
            //this._dLabelMap.set(label.address, label);
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
            //this._dLabelMap.set(label.address, label);
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
     * @memberof karbonator.nes
     * @constructor
     */
    var Assembler = function () {        
        this._lexer = lg.generate();
        this._strLines = null;
        
        this._includeSet = new karbonator.collection.TreeSet(karbonator.stringComparator);
        this._moduleMap = new karbonator.collection.TreeMap(karbonator.stringComparator);
        this._labelSetMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._macroMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
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
        var state = 0;
        for(var i = startIndex; ; ) {
            var ch = str.charAt(i);
            
            switch(state) {
            case 0://find a pre-processor command.
                switch(ch) {
                case ' ':
                case '\v':
                case '\f':
                case '\t':
                    ++i;
                break;
                case '\r':
                case '\n':
                    state = 1;
                break;
                case '#':
                    ++i;
                    state = 2;
                break;
                default:
                    //try scan global or local label.
                    //if failed, then go to end of line.
                    //
                }
            break;
            case 1://end of line.
                
            break;
            case 2://determine directive.
                //scan id.
                //switch by id.
            break;
            case 3://data literal
                
            break;
            case 4://include / require
                
            break;
            case 5://define
                
            break;
            case 6://bank
                
            break;
            case 7://org
                
            break;
            }
        }
    };
    
    nes.Assembler = Assembler;
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
