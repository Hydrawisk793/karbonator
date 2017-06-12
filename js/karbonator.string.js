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
    var $foo = "";
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var Interval = karbonator.math.Interval;
    var ListSet = karbonator.collection.ListSet;
    var ListMap = karbonator.collection.ListMap;
    
    string.Lexer = (function () {
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var Lexer = function () {
            this._edgeMap = {};
            this._states = [];
        };
        
        /**
         * @function
         * @param {String} str
         */
        Lexer.prototype.initialize = function (str) {
            
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
        /**
         * @constructor
         * @param {String} name
         * @param {String} regExStr
         */
        var Token = function (name, regExStr) {
            this._name = name;
            this._regExStr = regExStr;
        };
        
        /**
         * @function
         * @param {Token} rhs
         * @return {Boolean}
         */
        Token.prototype.equals = function (rhs) {
            return this._name === rhs._name
                && this._regExStr === rhs._regExStr
            ;
        };
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var LexerGenerator = function () {
            this._tokenMap = new ListMap();
            
            this._edgeMap = new ListMap(function (l, r) {return l === r;});
            this._states = [];
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
         * @return {Token}
         */
        LexerGenerator.prototype.getToken = function (name) {
            
        };
        
        /**
         * @function
         * @param {String} name
         * @param {String} regExStr
         */
        LexerGenerator.prototype.defineToken = function (name, regExStr) {
            this._tokenMap.set(name, new Token(name, regExStr));
        };
        
        /**
         * @function
         * @param {String} name
         */
        LexerGenerator.prototype.undefineToken = function (name) {
            this._tokenMap.remove(name);
        };
        
        var pushState = function (stack, position, value) {
            stack.push({position : position, value : value});
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        var TokenType = {
            error : 0,
            characterTerm : 1,
            repetition : 2,
            alternation : 3,
            subExpressionStart : 4,
            subExpressionEnd : 5,
            startOfString : 6,
            endOfString : 7
        };
        
        var scanDecimalInteger = function (regEx, pos) {
            var result = {
                errorOccured : false,
                errorMessage : "",
                position : pos,
                value : ""
            };
            
            var ch = "";
            var i = pos, loop = true;
            for(; loop && i < regEx.length; ) {
                ch = regEx.charAt(i);
                switch(ch) {
                case '0':
                    if(regEx.charAt(pos) !== '0') {
                        result.value += ch;
                        ++i;
                    }
                    else {
                        loop = false;
                        result.errorOccured = true;
                        result.errorMessage = "A decimal integer doesn't start with a sequence of '0'."
                    }
                break;
                case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    if(regEx.charAt(pos) !== '0') {
                        result.value += ch;
                        ++i;
                    }
                    else {
                        loop = false;
                        result.errorOccured = true;
                        result.errorMessage = "A decimal integer doesn't start with '0'."
                    }
                break;
                default:
                    loop = false;
                }
            }
            
            result.position = i;
            
            return result;
        };
        
        var scanHexadecimalInteger = function (regEx, pos) {
            var result = {
                errorOccured : false,
                errorMessage : "",
                position : pos,
                value : ""
            };
            
            var ch = "";
            var i = pos, loop = true;
            for(; loop && i < regEx.length; ) {
                ch = regEx.charAt(i);
                switch(ch) {
                case '0':
                    result.value += ch;
                    ++i;
                break;
                case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                    result.value += ch;
                    ++i;
                break;
                default:
                    loop = false;
                }
            }
            
            result.position = i;
            
            return result;
        };
        
        var escapeNextCharacter = function (regEx, pos) {
            var result = {
                errorOccured : false,
                errorMessage : "",
                position : pos,
                value : ""
            };
            
            var i = pos;
            for(; i < regEx.length; ) {
                switch(ch) {
                case '^': case '$':
                case '[': case ']': case '-':
                case '(': case ')':
                case '*': case '+': case '?':
                case '{': case '}': 
                case '|':
                case '.':
                case '\\':
                case '"': case '\'':
                    ch = String.fromCharCode(chCode);
                    ++pos;
                    stateStack.pop();
                break;
                case 't':
                    ch = String.fromCharCode(0x09);
                    ++pos;
                    stateStack.pop();
                break;
                case 'r':
                    ch = String.fromCharCode(0x0A);
                    ++pos;
                    stateStack.pop();
                break;
                case 'n':
                    ch = String.fromCharCode(0x0B);
                    ++pos;
                    stateStack.pop();
                break;
                case 'v':
                    ch = String.fromCharCode(0x0C);
                    ++pos;
                    stateStack.pop();
                break;
                case 'f':
                    ch = String.fromCharCode(0x0D);
                    ++pos;
                    stateStack.pop();
                break;
                case 'd':
                (function () {
                    var result = scanDecimalInteger(regEx, pos);
                    if(result.errorOccured) {
                        //Error - 
                    }
                    else {
                        ch = String.fromCharCode(Number.parseInt(result.value));
                        stateStack.pop();
                    }
                }());
                break;
                case 'x':
                (function () {
                    var result = scanHexadecimalInteger(regEx, pos);
                    if(result.errorOccured) {
                        //Error - 
                    }
                    else {
                        ch = String.fromCharCode(Number.parseInt(result.value, 16));
                        stateStack.pop();
                    }
                }());
                break;
                case 's': case 'S':
                case 'w': case 'W':
                    //Outputs pre-defined character set.
                    stateStack.pop();
                break;
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    //ERROR - Backreferencing is not supported.
                break;
                default:
                    //ERROR - The character 'ch' cannot be escaped.
                }
            }
            
            result.position = i;
            
            return result;
        };
        
        var scanCharacterSet = function (regEx, pos) {
            var result = {
                errorOccured : false,
                errorMessage : "",
                position : pos,
                value : ""
            };
            
            var edge = {
                interval : new Interval(),
                negative : false
            };
            var stack = [];
            var i = pos;
            for(; i < regEx.length; ) {
                var ch = regEx.charAt(i);
                
                switch(ch) {
                case '\\'://escape sequence
                (function () {
                    var escResult = escape()
                }());
                break;
                case '^'://negative set notifier
                    if(i == position) {
                        edge.negative = true;
                        ++i;
                    }
                    else {
                        //ERROR
                    }
                break;
                case '-'://range
                    
                break;
                case ']':
                    
                break;
                default:
                    
                }
            }
            
            result.position = i;
            
            return result;
        };
        
        var scanNextToken = function (regEx, position) {
            var len = regEx.length;
            var token = {
                type : TokenType.error,
                value : "",
                start : position,
                end : position + 1
            };
            
            for(var i = position; i < len; ) {
                var ch = regEx.charAt(i);
                var chCode = regEx.charCodeAt(i);
                switch(ch) {
                case '(':
                    token.type = TokenType.subExpressionStart;
                    token.value = ch;
                break;
                case ')':
                    token.type = TokenType.subExpressionEnd;
                    token.value = ch;
                break;
                case '[':
                    ++i;
                    scanCharacterSet(token, regEx, i);
                break;
                case '\\':
                    ++i;
                break;
                case '.':
                    token.type = TokenType.anyCharacter;
                    token.value = ch;
                break;
                case '*':
                    token.type = TokenType.zeroOrMore;
                    token.value = ch;
                break;
                case '?':
                    token.type = TokenType.oneOrMore;
                    token.value = ch;
                break;
                case '+':
                    token.type = TokenType.zeroOrOne;
                    token.value = ch;
                break;
                case '{':
                    token.type = TokenType.repetitionStart;
                    token.value = ch;
                break;
                case '}':
                    token.type = TokenType.repetitionEnd;
                    token.value = ch;
                break;
                case '|':
                    token.type = TokenType.alternation;
                    token.value = ch;
                break;
                case '^':
                    token.type = TokenType.stringStartsWith;
                    token.value = ch;
                break;
                case '$':
                    token.type = TokenType.stringEndsWith;
                    token.value = ch;
                break;
                case ']':
                    token.type = TokenType.error;
                    token.value = ch;
                break;
                default:
                    token.type = TokenType.character;
                    token.value = ch;
                };
            }
            
            return token;
        };
        
        var State = {
            charTerm : 0,
            alternation : 1,
            escapeSequence : 2,
            hexLiteral : 3,
            
            scanNextToken : 10,
            scanCharacterTerm : 11,
            escapeNextCharacter : 12,            
            scanCharacterSet : 13,
            scanRepetition : 14
        };
        
//        /**
//         * @function
//         * @param {LexerGenerator} o
//         * @param {Token} token
//         */
//        var createNfa = function (o, token) {
//            var edgeMap = o._edgeMap;
//            var scannedValueStack = [];
//            var stateStack = [State.scanNextToken];
//            var subExprStack = [];
//            var altTermNfas = [];
//            var token = {type : 0, value : ""};
//            var regEx = token._regEx;
//            var regExLen = regEx.length;
//            
//            for(var pos = 0; true; ) {
//                var prevState = (stateStack.length >= 2 ? stateStack[stateStack.length - 2] : -1);
//                var state = stateStack[stateStack.length - 1];
//                var ch = regEx.charAt(pos);
//                var chCode = regEx.charCodeAt(pos);
//                
//                switch(state) {
//                case 0:
//                    
//                break;
//                case 1:
//                    switch(token.type) {
//                    case TokenType.characterTerm:
//                        
//                    break;
//                    }
//                break;
//                case State.scanNextToken:
//                    switch(ch) {
//                    case '^':
//                        if(pos == 0) {
//                            ++pos;
//                        }
//                        else {
//                            //ERROR - 
//                        }
//                    break;
//                    case '$':
//                        if(pos == regExLen) {
//                            ++pos;
//                        }
//                        else {
//                            //ERROR - 
//                        }
//                    break;
//                    case '(':
//                        //enterSubExpression
//                    break;
//                    case ')':
//                        //exitSubExpression
//                    break;
//                    case '*':
//                    break;
//                    case '+':
//                    break;
//                    case '?':
//                        if(subExprStack.length > 0) {
//                            //ERROR - Lookaheads or conditions in sub expressions are not supported.
//                        }
//                        else {
//                            //
//                        }
//                    break;
//                    case '{':
//                        ++pos;
//                        stateStack.push(State.scanRepetition);
//                    break;
//                    case '|':
//                        
//                    break;
//                    default:
//                        stateStack.push(State.scanCharacterTerm);
//                    }
//                break;
//                case State.scanCharacterTerm:
//                    switch(ch) {
//                    case '\\':
//                        ++pos;
//                        escapeNextCharacter(regEx, pos);
//                    break;
//                    case '.':
//                        scannedValueStack.push(new Interval(0, 0xFFFF));
//                        ++pos;
//                        stateStack.pop();
//                    break;
//                    case '[':
//                        ++pos;
//                        scanCharacterSet(regEx, pos);
//                    break;
//                    default:
//                        
//                    }
//                break;
//                }
//            }
//        };
        
        var epsilonInterval = new Interval(Number.MIN_VALUE, Number.MAX_VALUE);
        
        var anyCharacterInterval = new Interval(0, 0x10FFFF);
        
        var Nfa = (function () {
            /**
             * @constructor
             */
            var State = function () {
                this._transitionMap = new ListMap();
                this._finalFlag = false;
                this._action = {
                    code : 0,
                    argument1 : 0,
                    argument2 : 0
                };
            };
            
            /**
             * @constructor
             * @param {Object} epsilon
             * @param {Function} edgeComparator
             */
            var Nfa = function (epsilon, edgeComparator) {
                this._startStateKey = -1;
                this._states = [];
                this._epsilon = epsilon;
                this._edgeComparator = edgeComparator;
            };
            
            /**
             * @function
             * @param {Nfa} nfa
             * @param {Number} stateKey
             * @return {Boolean}
             */
            var _hasState = function (nfa, stateKey) {
                return stateKey >= 0 && stateKey < nfa._states.length;
            };
            
            /**
             * @function
             * @param {Nfa} nfa
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Function} callback
             */
            var _doActionIfTransitionSetExists = function (nfa, stateKey, edge, callback) {
                if(_hasState(this, stateKey)) {
                    var state = this._states[stateKey];
                    var transitionSet = state._transitionMap.get(edge);
                    if(typeof(transitionSet) !== "undefined") {
                        callback.call(nfa, transitionSet);
                    }
                }
            };
            
            /**
             * @function
             * @param {Nfa} nfa
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Function} callback
             */
            var _getOrAddTransitionSetAndDoAction = function (nfa, stateKey, edge, callback) {
                if(_hasState(this, stateKey)) {
                    var state = this._states[stateKey];
                    var transitionSet = state._transitionMap.get(edge);
                    if(typeof(transitionSet) !== "undefined") {
                        transitionSet = new ListSet();
                        state._transitionMap.set(edge, transitionSet);
                    }
                    
                    callback.call(nfa, transitionSet);
                }
            };
            
            /**
             * @function
             * @param {Array} lhs
             * @param {Array} rhs
             */
            var _arrayConcatenateAssign = function (lhs, rhs) {
                for(var i = 0; i < rhs.length; ++i) {
                    lhs.push(rhs[i]);
                }
                
                return lhs;
            };
            
            /**
             * @function
             * @return {Number}
             */
            Nfa.prototype.getStateCount = function () {
                return this._states.length;
            };
            
            /**
             * @function
             * @return {Number}
             */
            Nfa.prototype.addState = function () {
                if(this._states.length - 1 < Number.MAX_VALUE) {
                    this._states.push(new State());
                    
                    return this._states.length;
                }
                else {
                    return -1;
                }
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Number} [newStartStatekey = 0]
             */
            Nfa.prototype.removeState = function (stateKey) {
                if(_hasState(this, stateKey)) {
                    for(var i = 0; i < this._states.length; ++i) {
                        var state = this._states[i];
                        for(
                            var iter = state._transitionMap.entries(), pair = iter.next();
                            !pair.done;
                            pair = iter.next()
                        ) {
                            var transitionSet = pair.value;
                            transitionSet.remove(stateKey);
                        }
                    }
                    
                    this._states.splice(stateKey, 1);
                    
                    if(this._startStateKey == stateKey) {
                        this._startStateKey = (typeof(arguments[1]) !== "undefined" ? arguments[1] : 0);
                    }
                }
            };
            
            /**
             * @function
             * @return {Number}
             */
            Nfa.prototype.getStartStateKey = function () {
                return this._startStateKey;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @return {Boolean}
             */
            Nfa.prototype.setStartState = function (stateKey) {
                var result = _hasState(this, stateKey);
                if(result) {
                    this._startStateKey = stateKey;
                }
                
                return result;
            };
            
            /**
             * @function
             * @return {Number}
             */
            Nfa.prototype.getFinalStateCount = function () {
                var count = 0;
                for(var i = 0; i < this._states.length; ++i) {
                    if(this._states[i]._finalFlag) {
                        ++count;
                    }
                }
                
                return count;
            };
            
            /**
             * @function
             * @return {Array.<Number>}
             */
            Nfa.prototype.getFinalStateKeys = function () {
                var results = [];
                for(var i = 0; i < this._states.length; ++i) {
                    if(this._states[i]._finalFlag) {
                        results.push(i);
                    }
                }
                
                return results;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Boolean} isFinal
             * @return {Boolean}
             */
            Nfa.prototype.setStateAsFinal = function (stateKey, isFinal) {
                var result = _hasState(this, stateKey);
                if(result) {
                    this._states[stateKey]._finalFlag = isFinal;
                }
                
                return result;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @return {Number}
             */
            Nfa.prototype.getTransitionCountOfEdge = function (stateKey, edge) {
                var count = 0;
                _doActionIfTransitionSetExists(
                    this, stateKey, edge,
                    function (transitionSet) {
                        count = transitionSet.getElementCount();
                    }
                );
                
                return count;
            };
            
            /**
             * Returns a non-live list of transitions of {state, edge} pair.
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @return {Array.<Number>}
             */
            Nfa.prototype.getTransitionsOfEdge = function (stateKey, edge) {
                var transitions = [];
                _doActionIfTransitionSetExists(
                    this, stateKey, edge,
                    function (transitionSet) {
                        for(
                            var iter = transitionSet.keys(), iterPair = iter.next();
                            !iterPair.done;
                            iterPair = iter.next()
                        ) {
                            transitions.push(iterPair.value);
                        }
                    }
                );
                
                return transitions;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Number} nextStateKey
             * @return {Boolean}
             */
            Nfa.prototype.addTransition = function (stateKey, edge, nextStateKey) {
                var result = false;
                if(_hasState(this, nextStateKey)) {
                    _getOrAddTransitionSetAndDoAction(
                        this, stateKey, edge,
                        function (transitionSet) {
                            if(
                                _hasState(this, nextStateKey)
                                && !transitionSet.has(nextStateKey)
                            ) {
                                transitionSet.add(nextStateKey);
                                result = true;
                            }
                        }
                    );
                }
                
                return result;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Array.<Number>} nextStateKeys
             * @return {Number}
             */
            Nfa.prototype.addTransitions = function (stateKey, edge, nextStateKeys) {
                var count = 0;
                _getOrAddTransitionSetAndDoAction(
                    this, stateKey, edge,
                    function (transitionSet) {
                        for(var i = 0; i < nextStateKeys.length; ++i) {
                            var nextStateKey = nextStateKeys[i];
                            if(
                                _hasState(this, nextStateKey)
                                && !transitionSet.has(nextStateKey)
                            ) {
                                transitionSet.add(nextStateKey);
                                ++count;
                            }
                        }
                    }
                );
                
                return count;
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Number} nextStateKey
             */
            Nfa.prototype.removeTransition = function (stateKey, edge, nextStateKey) {
                _doActionIfTransitionSetExists(
                    this, stateKey, edge,
                    function (transitionSet) {
                        transitionSet.remove(nextStateKey);
                    }
                );
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             * @param {Array.<Number>} nextStateKeys
             */
            Nfa.prototype.removeTransitions = function (stateKey, edge, nextStateKeys) {
                _doActionIfTransitionSetExists(
                    this, stateKey, edge,
                    function (transitionSet) {
                        for(var i = 0; i < nextStateKeys.length; ++i) {
                            transitionSet.remove(nextStateKeys[i]);
                        }
                    }
                );
            };
            
            /**
             * @function
             * @param {Number} stateKey
             * @param {Object} edge
             */
            Nfa.prototype.removeAllTransitions = function (stateKey, edge) {
                _doActionIfTransitionSetExists(
                    this, stateKey, edge,
                    function (transitionSet) {
                        transitionSet.clear();
                    }
                );
            };
            
            /**
             * @function
             * @param {Nfa} nfa
             * @return {Object}
             */
            var _wrapWithNewStartAndEnd = function (nfa) {
                var result = {
                    prevStartStateKey : nfa._startStateKey,
                    prevFinalStateKeys : nfa.getFinalStateKeys(),
                    newFinalStateKey : -1
                };
                var newStartStateKey = nfa.addState();
                nfa.addTransition(newStartStateKey, nfa._epsilon, result.prevStartStateKey);
                nfa._start = newStartStateKey;
                result.newFinalStateKey = nfa.addState();
                for(var i = 0; i < result.prevFinalStateKeys.length; ++i) {
                    var prevFinalStateKey = result.prevFinalStateKeys[i];
                    var prevFinalState = this._states[prevFinalStateKey];
                    prevFinalState._finalFlag = false;
                    nfa.addTransition(prevFinalStateKey, nfa._epsilon, newFinalStateKey);
                }
                
                return prev;
            };
            
            /**
             * @function
             * @return {Nfa}
             */
            Nfa.prototype.wrapWithZeroOrMore = function () {
                var result = _wrapWithNewStartAndEnd(this);
                for(var i = 0; i < result.prevFinalStateKeys.length; ++i) {
                    var prevFinalStateKey = result.prevFinalStateKeys[i];
                    this.addTransition(prevFinalStateKey, this._epsilon, result.startStateKey);
                }
                this.addTransition(this._startStateKey, this._epsilon, result.newFinalStateKey);
                
                return this;
            };
            
            /**
             * @function
             * @return {Nfa}
             */
            Nfa.prototype.wrapWithOneOrMore = function () {
                var result = _wrapWithNewStartAndEnd(this);
                for(var i = 0; i < result.prevFinalStateKeys.length; ++i) {
                    var prevFinalStateKey = result.prevFinalStateKeys[i];
                    this.addTransition(prevFinalStateKey, this._epsilon, result.startStateKey);
                }
                
                return this;
            };
            
            /**
             * @function
             * @return {Nfa}
             */
            Nfa.prototype.wrapWithZeroOrOne = function () {
                var result = _wrapWithNewStartAndEnd(this);
                this.addTransition(this._startStateKey, this._epsilon, result.newFinalStateKey);
                
                return this;
            };
            
            /**
             * @function
             * @param {Nfa} rhs
             * @return {Nfa}
             */
            Nfa.prototype.concatenate = function (rhs) {
                var lhsEndStateKey = this._end
                var rhsStartStateKey = this._states.length;
                _arrayConcatenateAssign(this._states, rhs._states);
                this.addTransition(lhsEndStateKey, this._epsilon, rhsStartStateKey);
                this._end = this._states.length - 1;
            };
            
            /**
             * @function
             * @param {Nfa} rhs
             * @return {Nfa}
             */
            Nfa.prototype.alternate = function (rhs) {
                _wrapWithNewStartAndEnd(this);
                var rhsStartStateKey = this._states.length;
                var rhsEndStateKey = this._end = rhs._states.length;
                _arrayConcatenateAssign(this._states, rhs._states);
                this.addTransition(this._startStateKey, this._epsilon, rhsStartStateKey);
                this.addTransition(rhsEndStateKey, this._epsilon, this._end);
            };
            
            return Nfa;
        }());
        
        /**
         * @function
         * @param {Interval} edge
         * @reutrn {Nfa}
         */
        var _createNfa = function (edge) {
            var nfa = new Nfa();
            var startKey = nfa.addState();
            var endKey = nfa.addState();
            nfa.addTransition(startKey, edge, endKey);
            nfa.setStartState(startKey);
            nfa.setEndState(endKey);
            
            return nfa;
        };
        
        /**
         * @function
         * @param {LexerGenerator} o
         * @param {String} regEx
         */
        LexerGenerator.prototype.convertToNfa = function (o, regEx) {
            /////////
            ///1. infix to postfix 및 postfix 계산기 기법 활용
            ///2. 반복 연산자는 연산자 스택에 넣지 말고
            ///   가장 마지막으로 입력된 character-term에 대해 바로 연산을 수행 해서
            ///   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
            ///3. ')'가 입력되는 순간 '('까지의 모든 연산자들을 즉시 계산하고
            ///   토큰 스택에는 반복 연산자가 없는 것처럼 처리.
            ///4. '('가 입력되면 concat 연산자를 먼저 push하고 '('를 스택에 push.
            ///5. character-term이 입력되면 concat 연산자를 먼저 연산자 스택에 push하고
            ///   입력된 character-term을 토큰 스택에 push.
            
            var edgeMap = o._edgeMap;
            var pos = 0;
            var len = regEx.length;
            var CalcTokenType = {
                operator : 0,
                character : 1
            };
            var calcToken = {
                type : -1,
                value : null
            };
            
            var opStack = [];
            var tokenStack = [];
            var _pushOperator = function (opCh) {
                opStack.push(op);
            };
            var _isLastTokenTypeCharacter = function () {
                if(tokenStack.length > 0) {
                    var lastToken = tokenStack[tokenStack.length - 1];
                    if(lastToken.type === CalcTokenType.character) {
                        return true;
                    }
                }
                
                return false;
            };
            
            var scanComplete = 0;
            for(; !scanComplete && pos > len; ) {
                var ch = regEx.charAt(pos);
                var chCode = regEx.charCodeAt(pos);
                switch(ch) {
                case '^':
                    
                break;
                case '$':
                    
                break;
                case '(':
                    if(_isLastTokenTypeCharacter()) {
                        opStack.push('.');
                    }
                    opStack.push('(');
                    lastTokenType = CalcTokenType.operator;
                    
                    ++pos;
                break;
                case ')':
                    
                break;
                case '[':
                (function () {
                    //1. Get edges from character set.
                    //2. Create a new nfa from that.
                    //3. Push it to catTermList.
                    
                    ++pos;
                }());
                break;
                case ']':
                    
                break;
                case '*':
                case '+':
                case '?':
                case '{':
                    if(_isLastTokenTypeCharacter()) {
                        switch(ch) {
                        case '*':
                            lastToken.value.wrapWithZeroOrMore();
                        break;
                        case '+':
                            lastToken.value.wrapWithOneOrMore();
                        break;
                        case '?':
                            lastToken.value.wrapWithZeroOrOne();
                        break;
                        case '{':
                            //Error - Not implemented yet.
                        break;
                        default:
                            //Error - An unknown quantifier operator error.
                        }
                        lastTokenType = CalcTokenType.character;
                        
                        ++pos;
                    }
                    else {
                        //Error - Quantifier operators must be used to a 'character term'.
                    }
                break;
                case '}':
                    //Error - 
                break;
                case '|':
                    opStack.push('|');
                    lastTokenType = CalcTokenType.operator;
                    
                    ++pos;
                break;
                case '\\':
                (function () {
                    //1. Get content from escaped character.
                    //2. Create a new nfa from that.
                    //3. Push it to catTermList.
                    
                    ++pos;
                }());
                break;
                case '.':
                    if(_isLastTokenTypeCharacter()) {
                        opStack.push('.');
                    }
                    
                    tokenStack.push({
                        type : CalcTokenType.character,
                        value : _createNewNfa(new Interval(0x000000, 0x10FFFF))
                    });
                    lastTokenType = CalcTokenType.character;
                    ++pos;
                break;
                default:
                    if(_isLastTokenTypeCharacter()) {
                        opStack.push('.');
                    }
                    
                    tokenStack.push({
                        type : CalcTokenType.character,
                        value : _createNewNfa(new Interval(chCode, chCode))
                    });
                    lastTokenType = CalcTokenType.character;
                    ++pos;
                }
            }
        };
        
        /**
         * @function
         * @return {Object}
         */
        LexerGenerator.prototype.generateLexer = function () {
            this._tokenMap.forEach(
                function (pair, index, list) {
                    var nfaOfRegEx = convertToNfa(this, token._regExStr);
                },
                this
            );
            
            //TODO : 함수 작성
            //1. 각 토큰에 대한 NFA 생성
            //1-1. RegEx 분석 및 NFA 생성
            //1-2. 오류 발생 시 내용을 기록하고 종료
            //2. 별도의 시작 상태를 만들고 각 NFA의 시작 상태를 새로운 시작상태에 오메가로 연결
            //3. NFA -> DFA
            //4. 상태 최적화
        };
        
        return LexerGenerator;
    }());
    
    return karbonator;
})
));
