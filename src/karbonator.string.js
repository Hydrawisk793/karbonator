/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.collection"], function (collection) {
            return factory(g, collection);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = factory(g, require("./karbonator.collection"));
    }
}(
(global ? global : (window ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var Interval = karbonator.math.Interval;
    var ListSet = karbonator.collection.ListSet;
    var ListMap = karbonator.collection.ListMap;
    
    /**
     * @function
     * @param {Number} chCode
     * @return {Interval}
     */
    var _createIntervalFromCharCode = function (chCode) {
        return new Interval(chCode, chCode);
    };
    
    var _charCodeMin = 0x000000;
    var _charCodeMax = 0x10FFFF;
    
    /**
     * @readonly
     * @enum {Interval}
     */
    var _constInterval = {
        epsilon : new Interval(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
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
    var _constIntervalSet = {
        posixPrint : [
            _constInterval.space,
            _constInterval.posixGraph        
        ],
        posixAlnum : [
            _constInterval.posixLower,
            _constInterval.posixUpper,
            _constInterval.posixDigit
        ],
        posixAlpha : [
            _constInterval.posixLower,
            _constInterval.posixUpper
        ],
        posixBlank : [
            _constInterval.space,
            _constInterval.horizontalTab
        ],
        posixSpace : [
            _constInterval.space,
            _constInterval.whiteSpaces
        ],
        posixXdigit : [
            new Interval(0x41, 0x46),
            new Interval(0x61, 0x66),
            _constInterval.posixDigit
        ],
        posixCntrl : [
            new Interval(0x00, 0x1F),
            _constInterval.del
        ],
        nonWhiteSpaces : Interval.negate(_constIntervalSet.posixSpace),
        word : [
            _constIntervalSet.posixAlnum,
            _constInterval.underscore
        ],
        nonWord : Interval.negate(_constIntervalSet.word)
    };
    
    /**
     * @function
     * @param {Interval} o
     */
    var _assertIsInterval = function (o) {
        if(typeof(o) !== "object" || !(o instanceof Interval)) {
            throw new TypeError("A instance of 'Interval' must be passed.");
        }
    };
    
    /**
     * @function
     * @param {Array.<Interval>} o
     */
    var _assertIsArrayOfIntervals = function (o) {
        if(typeof(o) !== "object" || !(o instanceof Array)) {
            throw new TypeError("An array of 'Interval's must be passed.");
        }
        
        for(var i = 0; i < o.length; ++i) {
            if(typof(o) !== "object" || !(o instanceof Interval)) {
                throw new TypeError("An array of 'Interval's must be passed.");
            }
        }
    };
    
    /**
     * @function
     * @param {Number} l
     * @param {Number} r
     * @return {Number}
     */
    var _numberComparator = function (l, r) {
        return l - r;
    };
    
    /**
     * @function
     * @param {String} l
     * @param {String} r
     */
    var _stringComparator = function (l, r) {
        var diff = 0;
        var minLen = (l.length < r.length ? l.length : r.length);
        for(var i = 0; i < minLen; ++i) {
            diff = l.charCodeAt(i) - r.charCodeAt(i);
            if(diff !== 0) {
                break;
            }
        }
        
        return diff;
    };
    
    /**
     * @function
     * @param {Object} l
     * @param {Object} r
     * @return {Number}
     */
    var _objectComparator = function (l, r) {
        return (
            l === r
            ? 0
            : _stringComparator(l.toString(), r.toString())
        );
    };
    
    /**
     * @function
     * @param {Interval} l
     * @param {Interval} r
     * @return {Number}
     */
    var _edgeComparator = function (l, r) {
        if(l.equals(r)) {
            return 0;
        }

        return l._min - r._min;
    };
    
    string.Lexer = (function () {
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var Lexer = function () {
            
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
        var Nfa = (function () {
            /**
             * @constructor
             * @param {karbonator.comparator} edgeComparator
             */
            var State = function (edgeComparator) {
                this._transitionMap = new ListMap(edgeComparator);
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
                        transitionSet = new ListSet(_numberComparator);
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
                    this._states.push(new State(this._edgeComparator));
                    
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
                    
                    if(this._startStateKey === stateKey) {
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
                    nfa.addTransition(prevFinalStateKey, nfa._epsilon, result.newFinalStateKey);
                }
                
                return result;
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
                var lhsEndStateKeys = this.getFinalStateKeys();
                var rhsStartStateKey = this._states.length;
                _arrayConcatenateAssign(this._states, rhs._states);
                for(var i = 0; i < lhsEndStateKeys.length; ++i) {
                    this.addTransition(lhsEndStateKeys[i], this._epsilon, rhsStartStateKey);
                }
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
        
        var RegExParser = (function () {
            /**
             * @function
             * @param {Interval} edge
             * @reutrn {Nfa}
             */
            var _createNfaFromInterval = function (edge) {
                _assertIsInterval(edge);
                
                var nfa = new Nfa(_constInterval.epsilon, _edgeComparator);
                var startKey = nfa.addState();
                var endKey = nfa.addState();
                nfa.addTransition(startKey, edge, endKey);
                nfa.setStartState(startKey);
                nfa.setStateAsFinal(endKey, true);
                
                return nfa;
            };
            
            /**
             * @function
             * @param {Array.<Interval>} edges
             * @reutrn {Nfa}
             */
            var _createNfaFromIntervals = function (edges) {
                _assertIsArrayOfIntervals(edges);
                
                var nfa = new Nfa(_constInterval.epsilon, _edgeComparator);
                var startKey = nfa.addState();
                var endKey = nfa.addState();
                var disjoinedEdges = Interval.disjoin(edges);
                for(var i = 0; i < disjoinedEdges.length; ++i) {
                    nfa.addTransition(startKey, disjoinedEdges[i], endKey);
                }
                nfa.setStartState(startKey);
                nfa.setStateAsFinal(endKey, true);
                
                return nfa;
            };
            
            var Token = (function () {
                /**
                 * @constructor
                 */
                var Token = function () {
                    /**@type {Number}*/ this.type = Token.Type.operator;
                    /**@type {Object}*/ this.value = null;
                };
                
                /**
                 * @readonly
                 * @enum {Number}
                 */
                Token.Type = {
                    operator : 0,
                    character : 1
                };
                
                return Token;
            }());
            
            /**
             * @constructor
             * @param {String} [regExStr=""]
             */
            var RegExParser = function (regExStr) {
                /**@type {Array.<String>}*/ this._opStack = [];
                /**@type {Array.<Token>}*/ this._tokenStack = [];
                this._error = {
                    occured : false,
                    message : "",
                    position : 0
                };
                this.initialize(regExStr);
            };
            
            /**
             * @function
             * @param {String} [regExStr=""]
             */
            RegExParser.prototype.initialize = function (regExStr) {
                regExStr = karbonator.selectNonUndefined(regExStr, "");
                
                /**@type {String}*/ this._regExStr = regExStr;
                /**@type {Number}*/ this._regExLen = regExStr.length;
                this._opStack.length = 0;
                this._tokenStack.length = 0;
                this._lastTokenType = -1;
                this._pos = 0;
                this._complete = false;
                this._parsing = true;
                this._error.occured = false;
            };
            
            /**
             * @function
             * @returns {Boolean
             */
            RegExParser.prototype.isParsingNotComplete = function () {
                return !this._complete && this._parsing && this._pos < this._regExLen;
            };
            
            /**
             * @function
             * @return {Nfa}
             */
            RegExParser.prototype.createNfa = function () {
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
                
                var intervals = [];
                for(; this.isParsingNotComplete(); ) {
                    var ch = this._regExStr.charAt(this._pos);
                    var chCode = this._regExStr.charCodeAt(this._pos);
                    switch(ch) {
                    case '^':
                        throw new Error("Not implemented yet...");
                    break;
                    case '$':
                        throw new Error("Not implemented yet...");
                    break;
                    case '(':
                        if(this._isLastTokenTypeCharacter()) {
                            this._pushOperator('.');
                        }
                        this._pushOperator('(');
                        this._moveToNextCharacter();
                    break;
                    case ')':
                        this._evaluateGroupedTokens();
                    break;
                    case '[':
                        //TODO : _parseCharacterSet 메소드 구현.
//                        intervals = this._parseCharacterSet();
//                        if(this.isParsingNotComplete()) {
//                            this._pushCharacterRanges(intervals);
//                            this._moveToNextCharacter();
//                        }
                        throw new Error("Not implemented yet...");
                    break;
                    case ']':
                        this._updateErrorAndStopParsing("An invalid token that specifies end of a character set has been found.");
                    break;
                    case '*':
                    case '+':
                    case '?':
                    case '{':
                        if(this._isLastTokenTypeCharacter()) {
                            var lastToken = this._getLastToken();
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
                                //1. parse constrained repetition.
                                //2. convert the nfa of the character token.
                                throw new Error("Not implemented yet...");
                            break;
                            default:
                                this._updateErrorAndStopParsing("An unknown repetition operator has been found.");
                            }
                            
                            this._pushOperator('.');
                            this._moveToNextCharacter();
                        }
                        else {
                            this._updateErrorAndStopParsing("The repetition opeartor requires 2 character-like arguments.");
                        }
                    break;
                    case '}':
                        this._updateErrorAndStopParsing("An invalid token that specifies end of constrained repetition has been found.");
                    break;
                    case '|':
                        this._pushOperator('|');
                        this._moveToNextCharacter();
                    break;
                    case '\\':
                        intervals = this._escapeNextCharacter();
                        if(this.isParsingNotComplete()) {
                            this._pushCharacterRanges(intervals);
                            this._moveToNextCharacter();
                        }
                    break;
                    case '.':
                        this._pushCharacterRange(_constInterval.anyCharacters);
                        this._moveToNextCharacter();
                    break;
                    default:
                        this._pushCharacterRange(_createIntervalFromCharCode(chCode));
                        this._moveToNextCharacter();
                    }
                }
                
                if(!this._complete) {
                    
                }
                
                return null;
            };
            
            /**
             * @private
             * @function
             * @param {String} op
             */
            RegExParser.prototype._pushOperator = function (op) {
                this._opStack.push(op);
                this._lastTokenType = Token.Type.operator;
            };
            
            /**
             * @private
             * @function
             * @param {Interval} interval
             */
            RegExParser.prototype._pushCharacterRange = function (interval) {
                this._pushCharacterToken(_createNfaFromInterval(interval));
            };
            
            /**
             * @private
             * @function
             * @param {Array.<Interval>} intervals
             */
            RegExParser.prototype._pushCharacterRanges = function (intervals) {
                this._pushCharacterToken(_createNfaFromIntervals(intervals));
            };
            
            /**
             * @private
             * @function
             * @param {Nfa} nfa
             */
            RegExParser.prototype._pushCharacterToken = function (nfa) {
                if(this._isLastTokenTypeCharacter()) {
                    this._pushOperator('.');
                }
                
                this._tokenStack.push(new Token(
                    Token.Type.character,
                    nfa
                ));
                this._lastTokenType = Token.Type.character;
            };
            
            /**
             * @private
             * @function
             * @return {Token|null}
             */
            RegExParser.prototype._getLastToken = function () {
                return (
                    this._tokenStack.length > 0
                    ? this._tokenStack[this._tokenStack.length - 1]
                    : null
                );
            };
            
            /**
             * @private
             * @function
             * @return {Boolean}
             */
            RegExParser.prototype._isLastTokenTypeCharacter = function () {
                return this._lastTokenType === Token.Type.character;
            };
            
            /**
             * @private
             * @function
             */
            RegExParser.prototype._evaluateGroupedTokens = function () {
                var loop = true;
                var complete = false;
                
                for(; !complete && loop && this._opStack.length > 0; ) {
                    var op = this._tokenStack.pop();
                    
                    switch(op) {
                    case '(':
                        loop = false;
                        complete = true;
                    break;
                    case '.':
                        if(this._tokenStack.length >= 2) {
                            var rhs = this._tokenStack.pop();
                            if(rhs.type !== Token.Type.character) {
                                this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                                loop = false;
                            }
                            
                            var lhs = this._tokenStack[this._tokenStack.length - 1];
                            if(lhs.type !== Token.Type.character) {
                                this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                                loop = false;
                            }
                            
                            lhs.value.concatenate(rhs);
                        }
                        else {
                            this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                            loop = false;
                        }
                    break;
                    case '|':
                        if(this._tokenStack.length >= 2) {
                            var rhs = this._tokenStack.pop();
                            if(rhs.type !== Token.Type.character) {
                                this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                                loop = false;
                            }
                            
                            var lhs = this._tokenStack[this._tokenStack.length - 1];
                            if(lhs.type !== Token.Type.character) {
                                this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                                loop = false;
                            }
                            
                            lhs.value.alternate(rhs);
                        }
                        else {
                            this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                            loop = false;
                        }
                    break;
                    default:
                        this._updateErrorAndStopParsing("An unknown operator has been found.");
                        loop = false;
                    }
                }
                
                if(!complete && loop) {
                    this._updateErrorAndStopParsing("A sub expression must start with '('.");
                }
            };
            
            /**
             * @private
             * @function
             * @return {Array.<Interval>}
             */
            RegExParser.prototype._escapeNextCharacter = function () {
                var intervals = [];
                var chCode = 0;
                var parsedStr = "";
                
                if(this._moveToNextCharacter()) {
                    switch(this._regExStr[this._pos]) {
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
                        parsedStr = this._scanDecimalInteger();
                        if(!this._error.occured) {
                            chCode = Number.parseInt(parsedStr, 10);
                            intervals.push(_createIntervalFromCharCode(chCode));
                        }
                    break;
                    case 'x':
                        parsedStr = this._scanHexadecimalInteger();
                        if(!this._error.occured) {
                            chCode = Number.parseInt(parsedStr, 16);
                            intervals.push(_createIntervalFromCharCode(chCode));
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
                        this._updateErrorAndStopParsing("Backreferencing is not supported");
                    break;
                    case '^': case '$':
                    case '[': case ']': case '-':
                    case '(': case ')':
                    case '*': case '+': case '?':
                    case '{': case '}': 
                    case '|':
                    case '.':
                    case '\\':
                    case '"': case '\'':
                    default:
                        chCode = ch.charCodeAt(0);
                        intervals.push(_createIntervalFromCharCode(chCode));
                    }
                }
                
                return intervals;
            };
            
            /**
             * @private
             * @returns {String}
             */
            RegExParser.prototype._scanDecimalInteger = function () {
                var result = "";
                var startPos = this._pos;
                for(
                    var ch = "", loop = true;
                    loop && this.isParsingNotComplete();
                ) {
                    ch = this._regExStr.charAt(this._pos);
                    switch(ch) {
                    case '0': case '1': case '2': case '3': case '4':
                    case '5': case '6': case '7': case '8': case '9':
                        if(this._regExStr.charAt(startPos) !== '0') {
                            result += ch;
                            this._moveToNextCharacter();
                        }
                        else {
                            this._updateErrorAndStopParsing((
                               ch === '0'
                               ? "A decimal integer doesn't start with a sequence of '0'."
                               : "A decimal integer doesn't start with '0'."
                            ));
                        }
                    break;
                    default:
                        loop = false;
                    }
                }
                
                return result;
            };
            
            /**
             * @private
             * @returns {String}
             */
            RegExParser.prototype._scanHexadecimalInteger = function () {
                var result = "";
                for(
                    var ch = "", loop = true;
                    loop && this.isParsingNotComplete();
                ) {
                    ch = this._regExStr.charAt(this._pos);
                    switch(ch) {
                    case '0':
                        result += ch;
                        this._moveToNextCharacter();
                    break;
                    case '1': case '2': case '3': case '4':
                    case '5': case '6': case '7': case '8': case '9':
                    case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                    case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                        result += ch;
                        this._moveToNextCharacter();
                    break;
                    default:
                        loop = false;
                    }
                }
                
                return result;
            };
            
            /**
             * @function
             * @param {String} [message]
             * @param {Number} [position]
             */
            RegExParser.prototype._updateErrorAndStopParsing = function () {
                this._error = {
                    occured : true,
                    message : karbonator.selectNonUndefined(argugments[1], "An error occured."),
                    position : karbonator.selectNonUndefined(arguments[2], this._pos)
                };
                
                this._parsing = false;
            };
            
            /**
             * @function
             * @param {Boolean}
             */
            RegExParser.prototype._moveToNextCharacter = function () {
                var hasNext = this._pos < this._regExLen;
                if(hasNext) {
                    ++this._pos;
                }
                else {
                    this._complete = true;
                }
                
                return hasNext;
            };
            
            return RegExParser;
        }());
        
        var Token = (function () {
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
            
            return Token;
        }());
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var LexerGenerator = function () {
            this._tokenMap = new ListMap(_stringComparator);
            this._regExParser = new RegExParser();
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
        
        /**
         * @function
         * @return {Object}
         */
        LexerGenerator.prototype.generateLexer = function () {
            this._tokenMap.forEach(
                function (token) {
                    this._regExParser.initialize(token._regExStr);
                    var nfa = this._regExParser.createNfa();
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
