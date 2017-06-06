/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (moduleFactory) {
    var g = this;
    
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.collection"], function (collection) {
            return moduleFactory(g, collection);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = moduleFactory(g, require("./karbonator.collection"));
    }
}(
(function (global, karbonator) {
    "use strict";
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    
    karbonator.string = string;
    
    var ns = karbonator;
    
    ////////////////////////////////
    //Namespace functions.
    
    /**
     * @memberof karbonator.string
     * @function
     * @param {String} lhs
     * @param {String} rhs
     * @return {Number}
     */
    string.compareTo = function (lhs, rhs) {
        var lhsLen = lhs.length, rhsLen = rhs.length;
        var minLen = (lhsLen < rhsLen ? lhsLen : rhsLen);
        var diff = 0;
        for(var i = 0; i < lhsLen; ++i) {
            diff = lhs.charAt(i).charCodeAt(0) - rhs.charAt(i).charCodeAt(0);
            if(diff != 0) {
                break;
            }
        }
        
        return diff;
    };
    
    ////////////////////////////////
    
    /**
     * @constructor
     */
    var Scanner = function () {
        this._types = [];
        this._states = [];
    };
    
    /**
     * @function
     * @param {String} inStr
     * @return {Array}
     */
    Scanner.prototype.scan = function (inStr) {
        return [{type : 0, value : ""}];
    };
    
    /**
     * @constructor
     */
    var ScannerGenerator = function () {
        this._rules = new karbonator.collection.ListMap();
    };
    
    /**
     * @function
     * @param {String} name
     * @param {String} regExStr
     * @return {Number}
     */
    ScannerGenerator.prototype.addRule = function (name, regExStr) {
        if(!this._rules.has(name)) {
            this._rules.set(name, {name : name, expression : regExStr});
            
            return this._rules.findIndex(name);
        }
        
        return -1;
    };
    
    /**
     * @function
     * @param {String}
     * @return {Scanner}
     */
    ScannerGenerator.prototype.generateScanner = function () {
        return null;
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * @constructor
     * @param {Number} type
     * @param {Number} valueIndex
     */
    var ParserToken = function (type, valueIndex) {
        this._type = ns.selectNonUndefined(type, this.constructor.Type.terminalRegEx);
        this._valueIndex = valueIndex;
    };
    
    /*
     * @readonly
     * @enum {Number}
     */
    ParserToken.Type = {
        terminalRegEx : 0,
        
        nonTerminalName : 1
    };
    
    /**
     * @function
     * @return {Number}
     */
    ParserToken.prototype.getType = function () {
        return this._type;
    };
    
    /**
     * @function
     * @return {Number}
     */
    ParserToken.prototype.getValueIndex = function () {
        return this._valueIndex;
    };
    
    /**
     * @constructor
     */
    var ParserSyntax = function () {
        this._tokens = [];
    };
    
    /**
     * @function
     * @return {Number}
     */
    ParserSyntax.prototype.getTokenCount = function () {
        return this._tokens.length;
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {ParserToken}
     */
    ParserSyntax.prototype.getToken = function (index) {
        return this._tokens[index];
    }
    
    /**
     * @constructor
     * @param {String} name
     */
    var ParserRule = function (name) {
        this._name = name;
        this._syntaxes = [];
    };
    
    /**
     * @function
     * @return {Number}
     */
    ParserRule.prototype.getSyntaxCount = function () {
        return this._syntaxes.length;
    };
    
    /**
     * @function
     * @param {Number} index
     * @return {ParserSyntax}
     */
    ParserRule.prototype.getSyntax = function (index) {
        return this._syntaxes[index];
    }
    
    string.BnfParser = (function () {
        /**
         * @memberof karbonator.string
         * @constructor
         * @param {String} bnfString
         */
        var BnfParser = function (bnfString) {
            this._parsing = false;
            this._prevRuleState = this._ruleState = BnfParser._State.RULE_NAME;
            
            this._terminals = new karbonator.collection.ListMap();
            this._rules = new karbonator.collection.ListMap();
            this._firstSets = new karbonator.collection.ListMap();
            this._error = {
                position : [0, 0],
                message : ""
            };
        };
        
        /**
         * @readonly
         */
        BnfParser._EndOfStringCharacter = '\0';
        
        /**
         * @readonly
         * @enum {Number}
         */
        BnfParser._State = {
            RULE_NAME : 0,
            
            RULE_ASSIGN : 1,
            
            TOKEN : 2,
            
            TOKEN_LIST : 3,
            
            TOKEN_LIST_END : 4
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        BnfParser.TokenType = {
            identifier : 0,
            
            stringLiteral : 1,
            
            regexLiteral : 2,
            
            assignment : 3,
            
            alternation : 4,
            
            termination : 5
        };
        
        BnfParser.Scanner = !function () {
            /**
             * @memberof karbonator.string.BnfParser
             * @constructor
             */
            var Scanner = function () {
                this._stateStack = [];
                this._scanning = false;
                
                this._inStr = "";
                this._inStrLen = 0;
                this._position = [0, 0, 0];
                this._ch = "";
                this._chCode = 0;
                
                this._tokenStart = 0;
                this._tokenEnd = 0;
                this._tokenType = 0;
                this._tokenValue = "";
                this._tokenLength = 0;
                
                this._error = {
                    occured : false,
                    
                    position : 0,
                    
                    message : ""
                };
            };
            
            /**
             * @readonly
             * @enum {Number}
             */
            Scanner.State = {
                NONE : 0,
                
                IDENTIFIER : 1,
                
                STRING_LITERAL : 2,
                
                REG_EX_LITERAL : 3,
                
                ESCAPE_SEQUENCE : 4
            };
            
            /**
             * @function
             * @param {String} inStr
             */
            Scanner.prototype.initialize = function (inStr) {
                this._inStr = inStr;
                this._inStr += BnfParser._EndOfStringCharacter;
                this._inStrLen = inStr.length;
                this._position = [0, 0, 0];
                
                this._scanning = true;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            Scanner.prototype.scanNextToken = function () {
                var hasNextToken = true;
                
                if(this._stateStack.length < 1) {
                    this._enterState(this.constructor.State.NONE);
                    this._scanning = true, this._tokenValue = "";
                }
                
                for(; this._scanning; ) {
                    this._scanCharacter();
                    
                    switch(this._getCurrentState()) {
                    case this.constructor.State.NONE:
                        switch(this._ch) {
                        case BnfParser._EndOfStringCharacter:
                            hasNextToken = false;
                            this._scanning = false;
                        break;
                        case ' ': case '\t':
                        case '\r': case '\n':
                            this._moveToNextCharacter();
                        break;
                        case '=':
                            this._appendCharacter(this._ch);
                            this._moveToNextCharacter();
                            this._acceptToken(BnfParser.TokenType.assignment);
                        break;
                        case '|':
                            this._appendCharacter(this._ch);
                            this._moveToNextCharacter();
                            this._acceptToken(BnfParser.TokenType.alternation);
                        break;
                        case ';':
                            this._appendCharacter(this._ch);
                            this._moveToNextCharacter();
                            this._acceptToken(BnfParser.TokenType.termination);
                        break;
                        case '\"':
                            this._moveToNextCharacter();
                            this._enterState(this.constructor.State.STRING_LITERAL);
                        break;
                        default:
                            if(
                                this._ch >= 'A' && this._ch <= 'z'
                                || this._ch == '_' || this._ch == '$'
                            ) {
                                this._appendCharacter(this._ch);
                                
                                this._enterState(this.constructor.State.IDENTIFIER);
                                this._moveToNextCharacter();
                            }
                            else {
                                this._stopScanningAndUpdateError("An invalid character '" + this._ch + "' has been found.");
                            }
                        }
                    break;
                    case this.constructor.State.IDENTIFIER:
                        if(
                            this._ch >= '0' && this._ch <= '9'
                            || this._ch >= 'A' && this._ch <= 'z'
                            || this._ch == '_' || this._ch == '$'
                            || this._ch == '-'
                        ) {
                            this._appendCharacter(this._ch);
                            
                            this._moveToNextCharacter();
                        }
                        else {
                            this._acceptToken(BnfParser.TokenType.identifier);
                            this._exitState();
                        }
                    break;
                    case this.constructor.State.STRING_LITERAL:
                        switch(this._ch) {
                        case '\\':
                            this._enterState(this.constructor.State.ESCAPE_SEQUENCE);
                            this._moveToNextCharacter();
                        break;
                        case '\"':
                            this._acceptToken(BnfParser.TokenType.stringLiteral);
                            this._moveToNextCharacter();
                            this._exitState();
                        break;
                        default:
                            this._appendCharacter(this._ch);
                            this._moveToNextCharacter();
                        }
                    break;
                    case this.constructor.State.REG_EX_LITERAL:
                        
                    break;
                    case this.constructor.State.ESCAPE_SEQUENCE:
                        switch(this._ch) {
                        case 't':
                        case 'r':
                        case 'n':
                        case '\"':
                            this._appendCharacter('\\' + this.ch, true);
                            this._moveToNextCharacter();
                            this._exitState();
                        break;
                        default:
                            this._stopScanningAndUpdateError("The character '" + this._ch + "' is not escapable.");
                        }
                    break;
                    default:
                        this._stopScanningAndUpdateError("Unknown token scanner state.");
                    }
                }
                
                return hasNextToken;
            };
            
            /**
             * @private
             * @function
             */
            Scanner.prototype._scanCharacter = function () {
                this._ch = this._inStr.charAt(this._position[0]);
                this._chCode = this._ch.charCodeAt(0);
            };
            
            /**
             * @private
             * @function
             * @param {String} ch
             * @param {Boolean} ignoreLengthIncrement
             */
            Scanner.prototype._appendCharacter = function (ch, ignoreLengthIncrement) {
                this._tokenValue += ch;
                this._tokenLength = (ignoreLengthIncrement ? this._tokenLength + 1 : this._tokenLength);
            };
            
            /**
             * @private
             * @function
             */
            Scanner.prototype._moveToNextCharacter = function () {
                ++this._position[0];
            };
            
            /**
             * @private
             * @function
             * @return {Number}
             */
            Scanner.prototype._getCurrentState = function () {
                return this._stateStack[this._stateStack.length - 1];
            };
            
            /**
             * @private
             * @function
             * @param {Number} state
             */
            Scanner.prototype._enterState = function (state) {
                this._stateStack.push(state);
                //this._tokenStart = this._tokenEnd = this._position[0];
            };
            
            /**
             * @private
             * @function
             */
            Scanner.prototype._exitState = function () {
                this._stateStack.pop();
            };
            
            /**
             * @private
             * @function
             * @param {Number} tokenType
             */
            Scanner.prototype._acceptToken = function (tokenType) {
                this._tokenType = tokenType;
                this._tokenState = this.constructor.State.NONE;
                this._error.occured = false;
                this._stateStack = [];
                this._scanning = false;
            };
            
            /**
             * @private
             * @function
             * @param {String} message
             */
            Scanner.prototype._stopScanningAndUpdateError = function (message) {
                this._error.occured = true;
                this._error.message = message;
                this._error.position[0] = this._position[1];
                this._error.position[1] = this._position[2];
                
                this._scanning = false;
            };
            
            return Scanner;
        }();
        
        /**
         * @function
         * @return {Boolean}
         */
        BnfParser.prototype.parseNextRule = function () {
            this._parsing = true;
            
            var newRule = null;
            
            for(; ; ) {
                switch(this._ruleState) {
                case BnfParser._State.RULE_NAME:
                    this._scanToken();
                    if(this._tokenType === BnfParser._TokenState.IDENTIFIER) {
                        newRule = new GrammarRule();
                        
                        this._ruleState = BnfParser._State.RULE_ASSIGN;
                    }
                    else {
                        this._stopParsingAndUpdateError("The name of new rule must be specified.");
                    }
                break;
                case BnfParser._State.RULE_ASSIGN:
                    this._scanToken();
                    if(this._tokenType === BnfParser._TokenState.ASSIGNMENT) {
                        this._ruleState = BnfParser._State.TOKEN;
                    }
                    else {
                        this._stopParsingAndUpdateError("An assignment operator of the new rule must be specified.");
                    }
                break;
                case BnfParser._State.TOKEN:
                    this._scanToken();
                    switch(this._tokenType) {
                    case BnfParser._TokenState.IDENTIFIER:
                        
                    break;
                    case BnfParser._TokenState.STRING_LITERAL:
                        
                    break;
                    default:
                        //Error;
                    }
                break;
                case BnfParser._State.TOKEN_LIST:
                    this._scanToken();
                    
                break;
                case BnfParser._State.TOKEN_LIST_END:
                    
                //break;
                }
            }
            
            return this.hasNextRule();
        };
        
        /**
         * @function
         * @return {Object}
         */
        BnfParser.prototype.getError = function () {
            return this._error;
        };
        
        /**
         * @private
         * @function
         * @param {Number} state
         */
        BnfParser.prototype._changeRuleState = function (state) {
            this._prevRuleState = this._ruleState;
            this._ruleState = state;
        };
        
        /**
         * @private
         * @function
         */
        BnfParser.prototype._stopParsingAndUpdateError = function (message) {
            this._error.message = message;
            this._error.position[0] = this._position[1];
            this._error.position[1] = this._position[2];
            
            this._parsing = false;
        };
        
        /**
         * @private
         * @function
         * @return {String}
         */
        BnfParser.prototype._scanToken = function () {
            
        };
        
        /**
         * @private
         * @function
         * @param {ParserRule} rule
         * @return {karbonator.collection.ListSet}
         */
        BnfParser.prototype._findFirstSets = function () {
            var firstSet = new karbonator.collection.ListSet();
            
            var visitedNonTerminalSet = new karbonator.collection.ListSet();
            var stack = [rule];
            for(; stack.length > 0; ) {
                var currentRule = stack.pop();
                if(!visitedNonTerminalSet.has(currentRule)) {
                    visitedNonTerminalSet.add(currentRule);
                    
                    for(var i = 0; i < currentRule._syntaxes.length; ++i) {
                        var currentSyntax = currentRule._syntaxes[i];
                        
                        
                    }
                }
            }
            
            var token = stack.pop();
            switch(token._type) {
            case ParserToken.Type.terminalRegEx:
    
            break;
            case ParserToken.Type.nonTerminalName:
    
            break;
            default:
                throw new Error("An unknown token type has been found.");
            }
            
            return firstSet;
        };
        
        return BnfParser;
    })();
    
    return karbonator;
})
));
