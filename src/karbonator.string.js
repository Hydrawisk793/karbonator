/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-17
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
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var string = karbonator.string || {};
    karbonator.string = string;
    
    var Interval = karbonator.math.Interval;
    var Set = karbonator.collection.ListSet;
    var Map = karbonator.collection.ListMap;
    
    var _minInt = Number.MIN_SAFE_INTEGER;
    
    var _maxInt = Number.MAX_SAFE_INTEGER;
    
    var _charCodeMin = 0x000000;
    
    var _charCodeMax = 0x10FFFF;
    
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
        epsilon : new Interval(_minInt, _maxInt),
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
     * @param {*} o
     * @return {Boolean}
     */
    var _isUndefined = function (o) {
        return "undefined" === typeof(o);
    };
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isNullOrUndefined = function (o) {
        return null === o || "undefined" === typeof(o);
    };
    
    /**
     * @function
     * @param {*} o
     * @return {Boolean}
     */
    var _isObject = function (o) {
        return "object" === typeof(o) && null !== o;
    };
    
    var _selectNonUndefined = karbonator.selectNonUndefined;
    
    /**
     * @function
     * @param {*} o
     * @param {String} [message]
     */
    var _assertIsNotNullAndUndefined = function (o) {
        if(_isNullOrUndefined(o)) {
            throw new TypeError(_selectNonUndefined(arguments[1], "The parameter must not be undefined and null."));
        }
    };

    /**
     * @function
     * @param {karbonator.comparator} o
     */
    var _assertIsComparator = function (o) {
        if(typeof(o) !== "function" || o.length < 2) {
            throw new TypeError(_selectNonUndefined(
                arguments[1],
                "A valid comparator function for key comparision must be specified."
            ));
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
     * @param {o}
     * @param {String} [message]
     */
    var _assertIsKeyGenerator = function (o) {
        if(!_isObject(o) || (typeof(o.generateKey) !== "function")) {
            throw new TypeError(_selectNonUndefined(
                arguments[1],
                "The argument must be a key generator."
            ));
        }
    };
    
    /**
     * @function
     * @param {Array.<Interval>} o
     */
    var _assertIsArrayOfIntervals = function (o) {
        if(!Array.isArray(o)) {
            throw new TypeError("An array of 'Interval's must be passed.");
        }
        
        for(var i = 0; i < o.length; ++i) {
            var elem = o[i];
            if(typeof(elem) !== "object" || !(elem instanceof Interval)) {
                throw new TypeError("An array of 'Interval's must be passed.");
            }
        }
    };
    
    /**
     * @function
     * @param {*} o
     */
    var _assertIsIterable = function (o) {
        if(_isNullOrUndefined(o) || _isNullOrUndefined(o[global.Symbol.iterator])) {
            throw new TypeError("The parameter must be an object that has the property 'Symbol.iterator'.");
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
    
    /**
     * @function
     * @param {Object} o
     * @return {Object}
     */
    var _defaultCloner = function (o) {
        return o;
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
     * @param {Map} lhs
     * @param {Map} rhs
     * @param {Boolean} [overwrite=true]
     * @return {Number}
     */
    var _mapUnionAssign = function (lhs, rhs) {
        if(_isUndefined(arguments[2]) || !!arguments[2]) {
            rhs.forEach(
                function (value, key) {
                    this.set(key, value);
                },
                lhs
            );
        }
        else {
            rhs.forEach(
                function (value, key) {
                    if(!this.has(key)) {
                        this.set(key, value);
                    }
                },
                lhs
            );
        }
        
        return lhs;
    };
    
    var NfaAndDfa = (function () {
        var DfaState = null;
        
        var Dfa = (function () {
            var State = (function () {
                var State = function () {
                    this._finalState = false;
                    this._transitionMap = null;
                };
                
                State.prototype.toString = function () {
                    var str = '{';
                    
                    str += "isFinal";
                    str += " : ";
                    str += this._finalState;
                    
                    str += ", ";
                    str += "transitionMap";
                    str += " : ";
                    str += this._transitionMap;
                    
                    str += '}';
                    
                    return str;
                };
                
                return State;
            }());
            DfaState = State;
            
            var Dfa = function () {
                this._states = null;
            };
            
            Dfa.prototype.toString = function () {
                var str = '[';
                
                var count = this._states.length;
                if(count > 0) {
                    str += "0";
                    str += " => ";
                    str += this._states[0];
                }
                
                for(var i = 1; i < count; ++i) {
                    str += ", ";
                    str += i;
                    str += " => ";
                    str += this._states[i];
                }
                
                str += ']';
                
                return str;
            };
            
            return Dfa;
        }());
        
        var State = (function () {
            /**
             * @constructor
             * @param {karbonator.comparator} edgeComparator
             * @param {karbonator.comparator} transitionComparator
             * @param {Boolean} [isFinal]
             */
            var State = function (edgeComparator, transitionComparator) {
                _assertIsComparator(
                    edgeComparator,
                    "The parameter 'edgeComparator' must be a comparator function."
                );
                _assertIsComparator(
                    transitionComparator,
                    "The parameter 'transitionComparator' must be a comparator function."
                );
                
                this._edgeComparator = edgeComparator;
                this._transitionComparator = transitionComparator;
                
                this._transitionMap = new Map(edgeComparator);
                this._finalState = ("undefined" !== typeof(arguments[2]) ? !!arguments[2] : false);
            };
            
            /**
             * @function
             * @return {karbonator.comparator}
             */
            State.prototype.getEdgeComparator = function () {
                return this._edgeComparator;
            };
            
            /**
             * @function
             * @return {karbonator.comparator}
             */
            State.prototype.getTransitionComparator = function () {
                return this._transitionComparator;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            State.prototype.isFinal = function () {
                return this._finalState;
            };
            
            /**
             * @function
             * @param {Boolean} isFinal
             */
            State.prototype.setFinal = function (isFinal) {
                this._finalState = !!isFinal;
            };
            
            /**
             * @function
             * @param {Object} edge
             */
            State.prototype.getTransitionSet = function (edge) {
                var transitionSet = this._transitionMap.get(edge);
                if(_isUndefined(transitionSet)) {
                    transitionSet = new Set(this._transitionComparator);
                    this._transitionMap.set(edge, transitionSet);
                }
                
                return transitionSet;
            };
            
            return State;
        }());
        
        /**
         * @constructor
         * @param {Object} stateKeyGenerator
         * @param {karbonator.comparator} stateKeyComparator
         * @param {Object} epsilonEdge
         * @param {karbonator.comparator} edgeComparator
         */
        var Nfa = function (stateKeyGenerator, stateKeyComparator, epsilonEdge, edgeComparator) {
            _assertIsKeyGenerator(
                stateKeyGenerator,
                "The parameter 'stateKeyGenerator' must be a key generator object."
            );
            _assertIsNotNullAndUndefined(
                epsilonEdge,
                "The parameter 'epsilonEdge' must not be undefined and null."
            );
            _assertIsComparator(
                stateKeyComparator,
                "The parameter 'stateKeyComparator' must be a comparator function."
            );
            _assertIsComparator(
                edgeComparator,
                "The parameter 'edgeComparator' must be a comparator function."
            );
            
            this._stateKeyGenerator = stateKeyGenerator;
            this._stateKeyComparator = stateKeyComparator;
            this._epsilonEdge = epsilonEdge;
            this._edgeComparator = edgeComparator;
            
            this._stateMap = new Map(stateKeyComparator);
            this._startStateKey = null;
        };
        
        /**
         * @function
         * @return {karbonator.comparator}
         */
        Nfa.prototype.getStateKeyComparator = function () {
            return this._stateKeyComparator;
        };
        
        /**
         * @function
         * @return {karbonator.comparator}
         */
        Nfa.prototype.getEdgeComparator = function () {
            return this._edgeComparator;
        };
        
        /**
         * @function
         * @return {Object}
         */
        Nfa.prototype.getEpsilonEdge = function () {
            return this._epsilonEdge;
        };
        
        /**
         * @function
         * @return {Number}
         */
        Nfa.prototype.getStateCount = function () {
            return this._stateMap.getElementCount();
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @return {Boolean}
         */
        Nfa.prototype.hasState = function (stateKey) {
            _assertIsNotNullAndUndefined(stateKey);
            
            return this._stateMap.has(stateKey);
        };
        
        /**
         * @function
         * @param {Object} [stateKey]
         * @param {Boolean} [finalState=false]
         * @return {Object|null}
         */
        Nfa.prototype.addState = function (stateKey) {
            stateKey = (
                (!_isNullOrUndefined(stateKey))
                ? stateKey
                : (
                    this._stateKeyGenerator !== null
                    ? this._stateKeyGenerator.generateKey()
                    : null
                )
            );
            
            if(stateKey !== null) {
                var state = this._stateMap.get(stateKey);
                if(_isUndefined(state)) {
                    state = new State(
                        this._edgeComparator,
                        this._stateKeyComparator,
                        arguments[1]
                    );
                    this._stateMap.set(stateKey, state);
                }
            }
            
            return stateKey;
        };
        
        /**
         * @function
         * @return {Object}
         */
        Nfa.prototype.getStartStateKey = function () {
            return this._startStateKey;
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @return {Boolean}
         */
        Nfa.prototype.setStartState = function (stateKey) {
            _assertIsNotNullAndUndefined(stateKey);
            
            var result = this.hasState(stateKey);
            if(result) {
                this._startStateKey = stateKey;
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @return {Boolean}
         */
        Nfa.prototype.isStateFinal = function (stateKey) {
            _assertIsNotNullAndUndefined(stateKey);
            
            var state = this._stateMap.get(stateKey);
            
            return !_isUndefined(state) && state.isFinal();
        };
        
        /**
         * @function
         * @return {Number}
         */
        Nfa.prototype.getFinalStateCount = function () {
            var count = 0;
            for(
                var i = this._stateMap.values(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                if(iP.value.isFinal()) {
                    ++count;
                }
            }
            
            return count;
        };
        
        /**
         * @function
         * @return {Array.<Object>}
         */
        Nfa.prototype.getFinalStateKeys = function () {
            var finalStateKeys = [];
            for(
                var i = this._stateMap.entries(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                if(iP.value[1].isFinal()) {
                    finalStateKeys.push(iP.value[0]);
                }
            }
            
            return finalStateKeys;
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @param {Boolean} isFinal
         * @return {Boolean}
         */
        Nfa.prototype.setStateAsFinal = function (stateKey, isFinal) {
            _assertIsNotNullAndUndefined(stateKey);
            
            var state = this._stateMap.get(stateKey);
            var result = !_isUndefined(state);
            if(result) {
                state.setFinal(isFinal);
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @param {Object} edge
         * @param {Object} nextStateKey
         * @return {Boolean}
         */
        Nfa.prototype.addTransition = function (stateKey, edge, nextStateKey) {
            _assertIsNotNullAndUndefined(stateKey);
            _assertIsNotNullAndUndefined(edge);
            _assertIsNotNullAndUndefined(nextStateKey);
            
            var result = false;
            if(this.hasState(nextStateKey)) {
                var state = this._stateMap.get(stateKey);
                if(!_isUndefined(state)) {
                    state.getTransitionSet(edge).add(nextStateKey);
                }
            }
            
            return result;
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
            result.newFinalStateKey = nfa.addState();
            
            nfa.addTransition(newStartStateKey, nfa._epsilonEdge, result.prevStartStateKey);
            nfa.setStartState(newStartStateKey);
            
            for(var i = 0; i < result.prevFinalStateKeys.length; ++i) {
                var prevFinalStateKey = result.prevFinalStateKeys[i];
                nfa._stateMap.get(prevFinalStateKey).setFinal(false);
                nfa.addTransition(prevFinalStateKey, nfa._epsilonEdge, result.newFinalStateKey);
            }
            nfa.setStateAsFinal(result.newFinalStateKey, true);
            
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
                this.addTransition(prevFinalStateKey, this._epsilonEdge, result.prevStartStateKey);
            }
            this.addTransition(this._startStateKey, this._epsilonEdge, result.newFinalStateKey);
            
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
                this.addTransition(prevFinalStateKey, this._epsilonEdge, result.prevStartStateKey);
            }
            
            return this;
        };
        
        /**
         * @function
         * @return {Nfa}
         */
        Nfa.prototype.wrapWithZeroOrOne = function () {
            var result = _wrapWithNewStartAndEnd(this);
            this.addTransition(this._startStateKey, this._epsilonEdge, result.newFinalStateKey);
            
            return this;
        };
        
        /**
         * @function
         * @param {Nfa} rhs
         * @return {Nfa}
         */
        Nfa.prototype.concatenate = function (rhs) {
            _assertIsNotNullAndUndefined(rhs);
            
            var lhsEndStateKeys = this.getFinalStateKeys();
            var rhsStartStateKey = rhs._startStateKey;
            
            _mapUnionAssign(this._stateMap, rhs._stateMap);
            
            for(var i = 0; i < lhsEndStateKeys.length; ++i) {
                var lhsEndStateKey = lhsEndStateKeys[i];
                this.setStateAsFinal(lhsEndStateKey, false);
                this.addTransition(lhsEndStateKey, this._epsilonEdge, rhsStartStateKey);
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {Nfa} rhs
         * @return {Nfa}
         */
        Nfa.prototype.alternate = function (rhs) {
            _assertIsNotNullAndUndefined(rhs);
            
            var rhsFinalStateKeys = rhs.getFinalStateKeys();
            var info = _wrapWithNewStartAndEnd(this);
            
            _mapUnionAssign(this._stateMap, rhs._stateMap);
            
            this.addTransition(this._startStateKey, this._epsilonEdge, rhs._startStateKey);
            for(var r = 0; r < rhsFinalStateKeys.length; ++r) {
                var rhsFinalStateKey = rhsFinalStateKeys[r];
                this.setStateAsFinal(rhsFinalStateKey, false);
                this.addTransition(rhsFinalStateKey, this._epsilonEdge, info.newFinalStateKey);
            }
            
            return this;
        };
        
        /**
         * 같은 상태 수와 같은 전이를 가지는 새로운 nfa 객체를 생성.<br/>
         * 상태 키는 키 제네레이터로부터 새로 발급 받으며, 상태 전이에 사용되는 edge는 제공되는 edgeCloner 콜백에 의해 결정.
         * 만약, edgeCloner가 제공되지 않으면 edge의 레퍼런스를 대입하는 얕은 복사를 수행.
         * @function
         * @param {karbonator.cloner} [edgeCloner]
         * @param {Object} [stateKeyGenerator]
         * @return {Nfa}
         */
        Nfa.prototype.clone = function () {
            var edgeCloner = (typeof(arguments[0]) === "function" ? arguments[0] : _defaultCloner);
            var stateKeyGenerator = (typeof(arguments[1]) === "function" ? arguments[1] : this._stateKeyGenerator);
            
            var stateKeyMap = new Map(this._stateKeyComparator);
            var cloneOfThis = new Nfa(
                stateKeyGenerator,
                this._stateKeyComparator,
                edgeCloner(this._epsilonEdge),
                this._edgeComparator
            );
            
            for(
                var i = this._stateMap.entries(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                stateKeyMap.set(iP.value[0], cloneOfThis.addState(null, iP.value[1].isFinal()));
            }
            
            cloneOfThis.setStartState(stateKeyMap.get(this._startStateKey));
            
            for(
                var i = this._stateMap.entries(), iP = i.next(),
                srcState = null, srcStateKey = null,
                clonedEdge = null, srcTransitionSet = null,
                srcTransitionDestStateKey = null;
                !iP.done;
                iP = i.next()
            ) {
                srcStateKey = iP.value[0];
                
                for(
                    var j = iP.value[1]._transitionMap.entries(), jP = j.next();
                    !jP.done;
                    jP = j.next()
                ) {
                    clonedEdge = edgeCloner(jP.value[0]);
                    srcTransitionSet = jP.value[1];
                    
                    for(
                        var k = srcTransitionSet.keys(), kP = k.next();
                        !kP.done;
                        kP = k.next()
                    ) {
                        srcTransitionDestStateKey = kP.value;
                        
                        cloneOfThis.addTransition(
                            stateKeyMap.get(srcStateKey),
                            clonedEdge,
                            stateKeyMap.get(srcTransitionDestStateKey)
                        );
                    }
                }
            }
            
            return cloneOfThis;
        };
        
        var _createContext = function (stateKey) {
            var context = {
                stateKey : stateKey,
                transitionMapIter : null,
                transitionSetIter : null
            };
            
            return context;
        };
        
        var _createEpsilonClosure = function (stateKey) {
            var obj = {
                complete : false,
                stateSet : new Set(this._stateKeyComparator),
                transitionMap : new Map(this._edgeComparator)
            }
            
            obj.stateSet.add(stateKey);
            
            return obj;
        };
        
        /**
         * @function
         * @param {Nfa} nfa
         * @param {Array.<StateKey>} stateKeyStack
         * @return {Object}
         */
        var _findEpsilonClosure = function (nfa, stateKeyStack) {
            var stateSet = new Set(nfa._stateKeyComparator);
            var hasFinalState = false;
            var transitionMap = new Map(nfa._edgeComparator);
            
            for(; stateKeyStack.length > 0; ) {
                var stateKey = stateKeyStack.pop();
                if(stateSet.tryAdd(stateKey)) {
                    var state = nfa._stateMap.get(stateKey);
                    hasFinalState = (hasFinalState || state.isFinal());
                    
                    for(
                        var i = state._transitionMap.entries(), iP = i.next();
                        !iP.done;
                        iP = i.next()
                    ) {
                        var edge = iP.value[0];
                        var nextStateSet = iP.value[1];
                        if(nfa._edgeComparator(edge, nfa._epsilonEdge) === 0) {
                            _arrayConcatenateAssign(stateKeyStack, Array.from(nextStateSet));
                        }
                        else {
                            var transitionSet = transitionMap.get(edge);
                            if(_isUndefined(transitionSet)) {
                                transitionSet = new Set(nfa._stateKeyComparator);
                                transitionMap.set(edge, transitionSet);
                            }
                            
                            transitionSet.uniteAssign(nextStateSet);
                        }
                    }
                }
            }
            
            return ({
                stateSet : stateSet,
                hasFinalState : hasFinalState,
                transitionMap : transitionMap,
                toString : function () {
                    var str = '{';
                    
                    str += "stateSet";
                    str += " : ";
                    str += this.stateSet;
                    
                    str += ", ";
                    str += "hasFinalState";
                    str += " : ";
                    str += this.hasFinalState;
                    
                    str += ", ";
                    str += "transitionMap";
                    str += " : ";
                    str += this.transitionMap;
                    
                    str += '}';
                    
                    return str;
                }
            });
        };
        
        /**
         * @function
         * @param {Object} stateKey
         * @return {Object}
         */
        Nfa.prototype.findEpsilonClosureOfState = function (stateKey) {
            _assertIsNotNullAndUndefined(stateKey);
            
            var stateKeyStack = [stateKey];
            
            return _findEpsilonClosure(this, stateKeyStack);
        };
        
        /**
         * @function
         * @param {iterable} iterable
         * @return {Object}
         */
        Nfa.prototype.findEpsilonClosureOfStateSet = function (iterable) {
            _assertIsIterable(iterable);
            
            var stateKeyStack = [];
            _arrayConcatenateAssign(stateKeyStack, Array.from(iterable));
            
            return _findEpsilonClosure(this, stateKeyStack);
        };
        
        /**
         * Set l and Set r must have exactly same comparator.<br>
         * @function
         * @param {Set.<Object>} l
         * @param {Set.<Object>} r
         * @return {Number}
         */
        var _stateKeySetComparator = function (l, r) {
            var lCount = l.getElementCount();
            var countDiff = lCount - r.getElementCount();
            if(countDiff === 0) {
                var intersectionCount = 0;
                for(
                    var rIter = r.keys(), rIterPair = rIter.next();
                    !rIterPair.done;
                    rIterPair = rIter.next()
                ) {
                    if(l.has(rIterPair.value)) {
                        ++intersectionCount;
                    }
                }
                
                return lCount - intersectionCount;
            }
            
            return countDiff;
        };
        
        /**
         * @function
         * @param {Nfa} nfa
         * @param {Set}
         * @return {Boolean}
         */
        var _stateSetContainsFinalState = function (nfa, s) {
            for(
                var i = s.keys(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                if(nfa.isStateFinal(iP.value)) {
                    return true;
                }
            }
            
            return false;
        };
        
        /**
         * @function
         * @param {Nfa} nfa
         * @param {Map} map
         * @param {Set} dfaStateKey
         * @param {Boolean} isFinal
         * @param {Number} counter
         * @return {Number}
         */
        var _labelDfaState = function (nfa, map, dfaStateKey, isFinal, counter) {
            map.set(
                dfaStateKey,
                {
                    stateNumber : counter,
                    isFinal : isFinal,
                    toString : function () {
                        var str = '{';
                        
                        str += "stateNumber";
                        str += " : ";
                        str += this.stateNumber;
                        
                        str += ", ";
                        str += "isFinal";
                        str += " : ";
                        str += this.isFinal;
                        
                        str += '}';
                        
                        return str;
                    }
                }
            );
            
            return ++counter;
        };
        
        /**
         * @function
         * @return {Dfa}
         */
        Nfa.prototype.toDfa = function () {
            var tempDfa = new Map(_stateKeySetComparator);
            
            var eClosureOfStartState = this.findEpsilonClosureOfState(this._startStateKey);
            var dfaStartStateKey = new Set(this._stateKeyComparator);
            dfaStartStateKey.add(this._startStateKey);
            tempDfa.set(dfaStartStateKey, eClosureOfStartState.transitionMap);
            
            var dfaStateKeyStack = [];
            for(
                var i = eClosureOfStartState.transitionMap.values(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                dfaStateKeyStack.push(iP.value);
            }
            
            var dfaStateNumber = 0;
            var labeledDfaStateMap = new Map(_stateKeySetComparator);
            dfaStateNumber = _labelDfaState(
                this,
                labeledDfaStateMap, dfaStartStateKey,
                this.isStateFinal(this._startStateKey), dfaStateNumber
            );
            
            for(; dfaStateKeyStack.length > 0; ) {
                var dfaStateKey = dfaStateKeyStack.pop();
                
                var dfaStateTransitionMap = tempDfa.get(dfaStateKey);
                if(_isUndefined(dfaStateTransitionMap)) {
                    //TODO : eClosureOfStartState를 재활용 하도록 수정
                    var eClosureOfCompoundNfaStates = this.findEpsilonClosureOfStateSet(dfaStateKey);
                    dfaStateTransitionMap = eClosureOfCompoundNfaStates.transitionMap;
                    tempDfa.set(dfaStateKey, eClosureOfCompoundNfaStates.transitionMap);
                    
                    dfaStateNumber = _labelDfaState(
                        this,
                        labeledDfaStateMap, dfaStateKey,
                        eClosureOfCompoundNfaStates.hasFinalState, dfaStateNumber
                    );
                    
                    for(
                        var i = dfaStateTransitionMap.values(), iP = i.next();
                        !iP.done;
                        iP = i.next()
                    ) {
                        dfaStateKeyStack.push(iP.value);
                    }
                }
            }
            
            var dfa = new Dfa();
            dfa._states = new Array(tempDfa.getElementCount());
            for(
                var i = tempDfa.entries(), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                var compoundStateKey = iP.value[0];
                var label = labeledDfaStateMap.get(compoundStateKey);
                var dfaState = new DfaState();
                dfaState._finalState = label.isFinal;
                dfaState._transitionMap = new Map(this._edgeComparator);
                
                var transitionMap = iP.value[1];
                for(
                    var j = transitionMap.entries(), jP = j.next();
                    !jP.done;
                    jP = j.next()
                ) {
                    dfaState._transitionMap.set(
                        jP.value[0],
                        labeledDfaStateMap.get(jP.value[1]).stateNumber
                    );
                }
                
                dfa._states[label.stateNumber] = dfaState;
            }
            
            //TODO : Do i really need these lines...?
            tempDfa.clear();
            labeledDfaStateMap.clear();
            
            return dfa;
        };
        
        /**
         * @function
         * @return {String}
         */
        Nfa.prototype.toString = function () {
            var str = '{';
            
            str += "start : ";
            str += this._startStateKey;
            str += ", ";
            
            this._stateMap.forEach(
                function (state, stateKey) {
                    str += '{';
                    str += stateKey;
                    str += ", ";
                    
                    if(state.isFinal()) {
                        str += "final";
                        str += ", ";
                    }
                    
                    str += state._transitionMap;
                    
                    str += '}';
                    str += ' ';
                },
                this
            );
            
            str += '}';
            
            return str;
        };
        
        return ({
            Nfa : Nfa,
            Dfa : Dfa
        });
    }());
    
    var Nfa = NfaAndDfa.Nfa;
    
    var Dfa = NfaAndDfa.Dfa;
    
    var ScannerResult = (function () {
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
        
        return ScannerResult;
    }());
    
    var RegexParser = (function () {
        var PrimitiveScanner = (function () {
            /**
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
                var startPos = _selectNonUndefined(arguments[1], 0);
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
                var startPos = _selectNonUndefined(arguments[1], 0);
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
                var pos = _selectNonUndefined(arguments[1], 0);
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
                        case '\\':
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
                var pos = _selectNonUndefined(arguments[1], 0);
                var errorCode = 0;
                var errorMessage = "";
                var min = _minInt;
                var max = _selectNonUndefined(arguments[2], _maxInt);
                
                var len = str.length;
                var state = 0;
                
                var scanning = true;
                while(scanning && pos < len) {
                    switch(state) {
                    case 0:
                        if(str.charAt(pos) === '{') {
                            ++pos;
                            ++state;
                        }
                        else {
                            errorCode = 1;
                            errorMessage = "A repetition operator must start with '{'.";
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
                            scanning = false;
                        }
                        else {
                            errorCode = 5;
                            errorMessage = "A repetition operator must end with '}'.";
                            scanning = false;
                        }
                    break;
                    default:
                        errorCode = 7;
                        errorMessage = "A fatal error occured when scanning a repetition operator.";
                        scanning = false;
                    }
                }
                
                if(scanning) {
                    errorCode = 6;
                    errorMessage = "Not enough characters for parsing a repetition operator.";
                }
                
                this._result.set(
                    errorCode,
                    errorMessage,
                    pos,
                    (
                        errorCode === 0
                        ? new Interval(min, max)
                        : null
                    )
                );
                
                return this._result;
            };
            
            return PrimitiveScanner;
        }());
        
        var CharacterSetParser = (function () {
            var ItemType = {
                character : 0,
                characterRange : 1,
                characterSet : 2
            };
            
            var Item = {
                type : ItemType.character,
                intervals : []
            };
            
            /**
             * @constructor
             */
            var CharacterSetParser = function () {
                
            };
            
            /**
             * @param {String} str
             * @param {Number} [start=0]
             * @return {ScannerResult}
             */
            CharacterSetParser.prototype.parse = function (str) {                
                
            };
            
            return CharacterSetParser;
        }());
        
        var Token = (function () {
            /**
             * @constructor
             * @param {Number} type
             * @param {Object} value
             */
            var Token = function (type, value) {
                /**@type {Number}*/ this.type = type;
                /**@type {Object}*/ this.value = value;
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
         * @param {Object} stateKeyGenerator
         */
        var RegexParser = function (stateKeyGenerator) {
            this._stateKeyGenerator = stateKeyGenerator;
            
            /**@type {Array.<String>}*/ this._opStack = [];
            /**@type {Array.<Token>}*/ this._tokenStack = [];
            this._lastTokenType = -1;
            this._primitiveScanner = new PrimitiveScanner();
            
            this._pos = 0;
            this._parsing = true;
            
            this._error = {
                occured : false,
                message : "",
                position : 0
            };
            
            this._regexStr = "";
            this._regexLen = 0;
        };
        
        /**
         * @function
         * @param {String} regexStr
         */
        RegexParser.prototype.inputString = function (regexStr) {
            this._regexStr += regexStr;
            this._regexLen += regexStr.length;
            
            this._opStack.length = 0;
            this._tokenStack.length = 0;
            this._lastTokenType = -1;
            this._parsing = true;
            this._error.occured = false;
        };
        
        /**
         * @function
         * @returns {Boolean}
         */
        RegexParser.prototype.isParsingNotComplete = function () {
            return this._parsing && this._pos < this._regexLen;
        };
        
        var _zeroOrMoreInterval = new Interval(0, Number.MAX_SAFE_INTEGER);
        var _oneOrMoreInterval = new Interval(1, Number.MAX_SAFE_INTEGER);
        var _zeroOrOneInterval = new Interval(0, 1);
        
        /**
         * @function
         * @return {Nfa}
         */
        RegexParser.prototype.createNfa = function () {
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
            
            /**@type {ScannerResult}*/var scannerResult = null;
            /**@type {Interval}*/var repRange = null;
            var intervals = [];
            for(; this.isParsingNotComplete(); ) {
                var ch = this._regexStr.charAt(this._pos);
                var chCode = this._regexStr.charCodeAt(this._pos);
                switch(ch) {
                case '^':
                    this._updateErrorAndStopParsing("Start of string meta character is not implemented yet...");
                break;
                case '$':
                    this._updateErrorAndStopParsing("End of string meta character is not implemented yet...");
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
                    this._moveToNextCharacter();
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
                            this._moveToNextCharacter();
                        break;
                        case '+':
                            lastToken.value.wrapWithOneOrMore();
                            this._moveToNextCharacter();
                        break;
                        case '?':
                            lastToken.value.wrapWithZeroOrOne();
                            this._moveToNextCharacter();
                        break;
                        case '{':
                            scannerResult = this._primitiveScanner.scanRepetitionOperator(this._regexStr, this._pos);
                            if(scannerResult.error.code === 0) {
                                repRange = scannerResult.value;
                                if(repRange.getMaximum() < 1) {
                                    this._updateErrorAndStopParsing("The maximum value argument of a repetition operator must be greater than or equal to one.");
                                }
                                else {
                                    //TODO : Refactor this ugly and sutpid code...
                                    if(repRange.equals(_zeroOrMoreInterval)) {
                                        lastToken.value.wrapWithZeroOrMore();
                                    }
                                    else if(repRange.equals(_oneOrMoreInterval)) {
                                        lastToken.value.wrapWithOneOrMore();
                                    }
                                    else if(repRange.equals(_zeroOrOneInterval)) {
                                        lastToken.value.wrapWithZeroOrOne();
                                    }
                                    else {
                                        var repeatedNfa = lastToken.value.clone();
                                        
                                        for(var j = 2; j < repRange.getMinimum(); ++j) {
                                            repeatedNfa.concatenate(lastToken.value.clone());
                                        }
                                        
                                        if(repRange.getMaximum() >= _maxInt) {
                                            repeatedNfa.concatenate(lastToken.value.clone().wrapWithZeroOrMore());
                                        }
                                        else {
                                            for(
                                                var j = 0, repCount = repRange.getMaximum() - repRange.getMinimum();
                                                j < repCount;
                                                ++j
                                            ) {
                                                repeatedNfa.concatenate(lastToken.value.clone().wrapWithZeroOrOne());
                                            }
                                        }
                                        
                                        lastToken.value.concatenate(repeatedNfa);
                                    }
                                    
                                    this._pos = scannerResult.position;
                                }
                            }
                            else {
                                this._updateErrorAndStopParsing(scannerResult.error.message);
                            }
                        break;
                        default:
                            this._updateErrorAndStopParsing("An unknown repetition operator has been found.");
                        }
                    }
                    else {
                        this._updateErrorAndStopParsing("The repetition opeartor requires a character-like argument.");
                    }
                break;
                case '}':
                    this._updateErrorAndStopParsing("An invalid token that specifies end of constrained repetition has been found.");
                break;
                case '|':
                    this._pushOperator('|');
                    this._moveToNextCharacter();
                break;
                case '[':
                    this._updateErrorAndStopParsing("Character set is not implemented yet...");
//                        intervals = this._parseCharacterSet();
//                        if(!this._error.occured) {
//                            this._pushCharacterRanges(intervals);
//                            this._moveToNextCharacter();
//                        }
                break;
                case ']':
                    this._updateErrorAndStopParsing("An invalid token that specifies end of a character set has been found.");
                break;
                case '\\':
                    scannerResult = this._primitiveScanner.scanEscapedCharacter(
                        this._regexStr, this._pos
                    );
                    if(scannerResult.error.code === 0) {
                        this._pushCharacterRanges(scannerResult.value);
                        this._pos = scannerResult.position;
                    }
                    else {
                        this._updateErrorAndStopParsing(scannerResult.error.message);
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
            
            var finalNfa = null;
            if(this._parsing) {
                this._parsing = false;
                this._evaluateGroupedTokens();
                
                if(this._tokenStack.length === 1) {
                    finalNfa = this._tokenStack[0].value;
                }
                else {
                    this._updateErrorAndStopParsing("An unknown parsing token error has been occured.");
                }
            }
            
            return finalNfa;
        };
        
        /**
         * @function
         * @param {RegexParser} oThis
         * @param {String} op
         */
        var _hasLowerPriorityThanLast = function (oThis, op) {
            if(oThis._opStack.length < 1) {
                return false;
            }
            
            var lastOp = oThis._opStack[oThis._opStack.length - 1];
            
            return op === '|' && lastOp === '.';
        };
        
        /**
         * @private
         * @function
         * @param {String} op
         */
        RegexParser.prototype._pushOperator = function (op) {
            for(; !this._error.occured && this._opStack.length > 0 && _hasLowerPriorityThanLast(this, op); ) {
                var lastOp = this._opStack[this._opStack.length - 1];
                if(lastOp !== '(') {
                    this._opStack.pop();
                    this._evaluateOperator(lastOp);
                }
            }
            
            if(!this._error.occured) {
                this._opStack.push(op);
                this._lastTokenType = Token.Type.operator;
            }
        };
        
        /**
         * @function
         * @param {RegexParser} oThis
         * @param {Interval} edge
         * @reutrn {Nfa}
         */
        var _createNfaFromInterval = function (oThis, edge) {
            _assertIsInterval(edge);
            
            var nfa = new Nfa(
                oThis._stateKeyGenerator, _numberComparator,
                _constInterval.epsilon, _edgeComparator
            );
            var startKey = nfa.addState();
            var endKey = nfa.addState();
            nfa.addTransition(startKey, edge, endKey);
            nfa.setStartState(startKey);
            nfa.setStateAsFinal(endKey, true);
            
            return nfa;
        };
        
        /**
         * @function
         * @param {RegexParser} oThis
         * @param {Array.<Interval>} edges
         * @reutrn {Nfa}
         */
        var _createNfaFromIntervals = function (oThis, edges) {
            _assertIsArrayOfIntervals(edges);
            
            var nfa = new Nfa(
                oThis._stateKeyGenerator, _numberComparator,
                _constInterval.epsilon, _edgeComparator
            );
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
        
        /**
         * @private
         * @function
         * @param {Interval} interval
         */
        RegexParser.prototype._pushCharacterRange = function (interval) {
            this._pushCharacterToken(_createNfaFromInterval(this, interval));
        };
        
        /**
         * @private
         * @function
         * @param {Array.<Interval>} intervals
         */
        RegexParser.prototype._pushCharacterRanges = function (intervals) {
            this._pushCharacterToken(_createNfaFromIntervals(this, intervals));
        };
        
        /**
         * @private
         * @function
         * @param {Nfa} nfa
         */
        RegexParser.prototype._pushCharacterToken = function (nfa) {
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
        RegexParser.prototype._getLastToken = function () {
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
        RegexParser.prototype._isLastTokenTypeCharacter = function () {
            return this._lastTokenType === Token.Type.character;
        };
        
        /**
         * @private
         * @function
         */
        RegexParser.prototype._evaluateGroupedTokens = function () {
            var complete = false, op;
            for(; !complete && !this._error.occured && this._opStack.length > 0; ) {
                op = this._opStack.pop();
                switch(op) {
                case '(':
                    complete = true;
                break;
                default:
                    this._evaluateOperator(op);
                }
            }
            
            if(!complete && this._parsing) {
                this._updateErrorAndStopParsing("A sub expression must start with '('.");
            }
        };
        
        /**
         * @private
         * @function
         * @param {String} op
         */
        RegexParser.prototype._evaluateOperator = function (op) {
            switch(op) {
            case '.':
                if(this._tokenStack.length >= 2) {
                    var rhs = this._tokenStack.pop();
                    if(rhs.type !== Token.Type.character) {
                        this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                    }
                    
                    var lhs = this._tokenStack[this._tokenStack.length - 1];
                    if(lhs.type !== Token.Type.character) {
                        this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                    }
                    
                    lhs.value.concatenate(rhs.value);
                }
                else {
                    this._updateErrorAndStopParsing("The concatenation opeartor requires 2 character-like arguments.");
                }
            break;
            case '|':
                if(this._tokenStack.length >= 2) {
                    var rhs = this._tokenStack.pop();
                    if(rhs.type !== Token.Type.character) {
                        this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                    }
                    
                    var lhs = this._tokenStack[this._tokenStack.length - 1];
                    if(lhs.type !== Token.Type.character) {
                        this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                    }
                    
                    lhs.value.alternate(rhs.value);
                }
                else {
                    this._updateErrorAndStopParsing("The alternation opeartor requires 2 character-like arguments.");
                }
            break;
            default:
                this._updateErrorAndStopParsing("An unknown operator has been found.");
            }
        };
        
        /**
         * @function
         * @param {String} [message]
         * @param {Number} [position]
         */
        RegexParser.prototype._updateErrorAndStopParsing = function () {
            this._error = {
                occured : true,
                message : _selectNonUndefined(arguments[1], "An error occured."),
                position : _selectNonUndefined(arguments[2], this._pos)
            };
            
            this._parsing = false;
        };
        
        /**
         * @function
         * @param {Boolean}
         */
        RegexParser.prototype._moveToNextCharacter = function () {
            var hasNext = this._pos < this._regexLen;
            if(hasNext) {
                ++this._pos;
            }
            
            return hasNext;
        };
        
        return RegexParser;
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
            this._tokenMap = new Map(_stringComparator);
            this._inStr = "";
            this._pos = 0;
        };
        
        /**
         * @function
         * @param {String} str
         */
        Lexer.prototype.inputString = function (str) {
            this._inStr += str;
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
            this._pos = 0;
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
        var Token = (function () {
            /**
             * @constructor
             * @param {String} name
             * @param {String} regexStr
             */
            var Token = function (name, regexStr) {
                this._name = name;
                this._regexStr = regexStr;
                /**@type {Nfa}*/this._nfa = null;
            };
            
            /**
             * @function
             * @param {Token} rhs
             * @return {Boolean}
             */
            Token.prototype.equals = function (rhs) {
                return this._name === rhs._name
                    && this._regexStr === rhs._regexStr
                ;
            };
            
            return Token;
        }());
        
        /**
         * @memberof karbonator.string
         * @constructor
         */
        var LexerGenerator = function () {
            this._tokenMap = new Map(_stringComparator);
            this._nfaStateKeyGenerator = {
                generateKey : function () {
                    var currentKey = this._count;
                    var nextKey = currentKey + 1;
                    if(nextKey !== 0) {
                        this._count = nextKey;
                        
                        return currentKey;
                    }
                    
                    return null;
                },
                
                _count : 0
            };
            this._regexParser = new RegexParser(this._nfaStateKeyGenerator);
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
            this._tokenMap.set(name, new Token(name, regexStr));
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
            var lexer = new string.Lexer();
            
            //TODO : 함수 작성
            //[V] 1. 각 토큰에 대한 NFA 생성
            //[V] 1-1. Regex 분석 및 NFA 생성
            //[V] 1-2. 오류 발생 시 내용을 기록하고 종료
            //[ ] 2. 별도의 시작 상태를 만들고 각 NFA의 시작 상태를 새로운 시작상태를 오메가로 연결
            //[V] 3. NFA -> DFA
            for(
                var iter = this._tokenMap.values(), iterPair = iter.next();
                !iterPair.done;
                iterPair = iter.next()
            ) {
                var token = iterPair.value;
                this._regexParser.inputString(token._regexStr);
                token._nfa = this._regexParser.createNfa();
                if(this._regexParser._error.occured) {
                    break;
                }
                
                lexer._addToken(token._name, token._nfa, token._regexStr);
            }
            
            return (!this._regexParser._error.occured ? lexer : null);
        };
        
        return LexerGenerator;
    }());
    
    return karbonator;
})
));
