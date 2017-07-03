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
        g.define(["./karbonator.core"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("./karbonator.core"));
    }
}(
(typeof(global) !== "undefined" ? global : (typeof(window) !== "undefined" ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    var detail = karbonator.detail;
    
    //var Array = global.Array;
    var Symbol = detail._selectSymbol();
    //var Reflect = detail._selectReflect();
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._colStrBegin = '{';
    
    /**
     * @memberof karbonator.detail
     * @readonly
     */
    detail._colStrEnd = '}';
    
    var _colStrSeparator = ", ";
    
    var _colStrMapTo = " => ";
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {*} o
     */
    detail._assertIsArray = function (o) {
        if(!karbonator.isArray(o)) {
            throw new TypeError("The parameter must be an array.");
        }
    };
    
    /**
     * @memberof karbonator.detail
     * @function
     * @param {*} o
     */
    detail._assertIsEsIterable = function (o) {
        if(!karbonator.isEsIterable(o)) {
            throw new TypeError("The parameter must be an object that has the property 'Symbol.iterator'.");
        }
    };
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var collection = karbonator.collection || {};
    karbonator.collection = collection;
    
//    /**
//     * @memberof karbonator.collection
//     * @function
//     * @param {Array} arr
//     * @param {iterable} iterable
//     * @return {Array}
//     */
//    collection.concatenateAssign = function (arr, iterable) {
//        detail._assertIsArray(arr);
//        detail._assertIsEsIterable(iterable);
//        
//        for(
//            var i = iterable[Symbol.iterator](), iP = i.next();
//            !iP.done;
//            iP = i.next()
//        ) {
//            arr.push(iP.value);
//        }
//        
//        return arr;
//    };
    
    /**
     * @function
     * @param {karbonator.comparator} o
     */
    detail._assertIsComparator = function (o) {
        if(!karbonator.isComparator(o)) {
            throw new TypeError(detail._selectNonUndefined(
                arguments[1],
                "A valid comparator function for key comparision must be specified."
            ));
        }
    };
    
    /**
     * @function
     * @param {Set} setObj
     * @param {iterable} iterable
     * @return {Set}
     */
    var _setConcatenateAssign = function (setObj, iterable) {
        if(!karbonator.isEsIterable(iterable)) {
            throw new TypeError("The second parameter 'iterable' must have a property 'Symbol.iterator'.");
        }
        
        for(
            var i = iterable[Symbol.iterator](), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            setObj.add(iP.value);
        }
        
        return setObj;
    };
    
    /**
     * @function
     * @param {Function} setKlass
     * @param {Set} o
     * @return {Set}
     */
    var _setShallowCopy = function (setKlass, o) {
        var copyOfThis = new setKlass(o._comparator);
        
        for(
            var i = o.keys(), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            copyOfThis.add(iP.value);
        }
        
        return copyOfThis;
    };
    
    /**
     * @function
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setUniteAssign = function (lhs, rhs) {
        for(
            var i = rhs.keys(), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            lhs.add(iP.value);
        }
        
        return lhs;
    };
    
    /**
     * @function
     * @param {Function} setKlass
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setUnite = function (setKlass, lhs, rhs) {
        return _setUniteAssign(_setShallowCopy(setKlass, lhs), rhs);
    };
    
    /**
     * @function
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setSubtractAssign = function (lhs, rhs) {
        for(
            var i = rhs.keys(), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            lhs["delete"](iP.value);
        }
        
        return lhs;
    };
    
    /**
     * @function
     * @param {Function} setKlass
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setSubtract = function (setKlass, lhs, rhs) {
        return _setSubtractAssign(_setShallowCopy(setKlass, lhs), rhs);
    };
    
    /**
     * @function
     * @param {Function} setKlass
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setIntersectAssign = function (setKlass, lhs, rhs) {
        return _setSubtractAssign(lhs, _setSubtract(setKlass, lhs, rhs));
    };
    
    /**
     * @function
     * @param {Function} setKlass
     * @param {Set} lhs
     * @param {Set} rhs
     * @return {Set}
     */
    var _setIntersect = function (setKlass, lhs, rhs) {
        return _setIntersectAssign(setKlass, _setShallowCopy(setKlass, lhs), rhs);
    };
    
    /**
     * @function
     * @return {String}
     */
    var _setToStringMethod = function () {
        var str = detail._colStrBegin;
        
        var iter = this.keys();
        var pair = iter.next();
        if(!pair.done) {
            str += pair.value;
        }
        
        for(pair = iter.next(); !pair.done; pair = iter.next()) {
            str += _colStrSeparator;
            str += pair.value;
        }
        
        str += detail._colStrEnd;
        
        return str;
    };
    
    /**
     * @function
     * @param {Map} mapObj
     * @param {iterable} iterable
     * @return {Map}
     */
    var _mapConcatenateAssign = function (mapObj, iterable) {
        if(!karbonator.isEsIterable(iterable)) {
            throw new TypeError("The second parameter 'iterable' must have a property 'Symbol.iterator'.");
        }
        
        for(
            var i = iterable[Symbol.iterator](), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            mapObj.set(iP.value[0], iP.value[1]);
        }
        
        return mapObj;
    };
    
    /**
     * @function
     * @param {Function} mapklass
     * @param {Map} o
     * @return {Map}
     */
    var _mapShallowCopy = function (mapklass, o) {
        var copyOfThis = new mapklass(o._comparator);
        
        for(
            var i = o.entries(), iP = i.next();
            !iP.done;
            iP = i.next()
        ) {
            copyOfThis.set(iP.value[0], iP.value[1]);
        }
        
        return copyOfThis;
    };
    
    /**
     * @function 
     * @param {Object} key
     * @param {Object} value
     * @return {String}
     */
    var _mapPairToString = function (key, value) {
        var str = key.toString();
        str += _colStrMapTo;
        str += value;
        
        return str;
    };
    
    /**
     * @function
     * @return {String}
     */
    var _mapToStringMethod = function () {
        var str = detail._colStrBegin;
        
        var iter = this.entries();
        var pair = iter.next();
        if(!pair.done) {
            str += _mapPairToString(pair.value[0], pair.value[1]);
        }
        
        for(pair = iter.next(); !pair.done; pair = iter.next()) {
            str += _colStrSeparator;
            str += _mapPairToString(pair.value[0], pair.value[1]);
        }
        
        str += detail._colStrEnd;
        
        return str;
    };
    
    /*////////////////////////////////*/
    //RbTreeSetBase
    
    var RbTreeSetBase = (function () {
        /**
         * @callback keyGetter
         * @param {Object} element
         * @return {Object}
         */
        var _defaultKeyGetter = function (element) {
            return element;
        };
        
        /**
         * @constructor
         * @param {karbonator.comparartor} comparator
         * @param {keyGetter} [keyGetter=_defaultKeyGetter]
         * @param {keyGetter}
         */
        var RbTreeSetBase = function (comparator) {
            detail._assertIsComparator(comparator);
            
            this._comparator = comparator;
            this._keyGetter = (typeof(arguments[1]) === "function" ? arguments[1] : _defaultKeyGetter);
            this._elementCount = 0;
            this._root = null;
            this._garbageNodes = [];
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        RbTreeSetBase.SearchTarget = {
            equal : 0,
            
            greater : 1,
            
            greaterOrEqual : 2
        };
        
        var _Node = (function () {
            /**
             * @constructor
             * @function
             * @param {_Node} [parent=null]
             * @param {_Node} [leftChild=null]
             * @param {_Node} [rightChild=null]
             * @param {Object} [element=null]
             * @param {Boolean} [red=false]
             */
            var _Node = function () {
                this._parent = detail._selectNonUndefined(arguments[0], null);
                this._leftChild = detail._selectNonUndefined(arguments[1], null);
                this._rightChild = detail._selectNonUndefined(arguments[2], null);
                this._element = detail._selectNonUndefined(arguments[3], null);
                this._red = detail._selectNonUndefined(arguments[4], false);
            };
            
            /**
             * @function
             * @param {_Node} node
             * @return {_Node}
             */
            _Node.prototype.leftChild = function (node) {
                if(typeof(node) !== "undefined") {
                    this._leftChild = node;
                    
                    return this;
                }
                else {
                    return this._leftChild;
                }
            };
            
            /**
             * @function
             * @param {_Node} node
             * @return {_Node}
             */
            _Node.prototype.rightChild = function (node) {
                if(typeof(node) !== "undefined") {
                    this._rightChild = node;
                    
                    return this;
                }
                else {
                    return this._rightChild;
                }
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getRoot = function () {
                var pRoot = this;
                for(
                    var pParent = pRoot._parent;
                    pParent !== null;
                    pRoot = pParent, pParent = pRoot._parent
                );
                
                return pRoot;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getGrandParent = function () {
                return (this._parent !== null ? this._parent._parent : null);
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getUncle = function () {
                var pUncle = null;
                
                var pGrandParent = this.getGrandParent();
                if(pGrandParent !== null) {
                    pUncle = (pGrandParent._leftChild === this._parent
                        ? pGrandParent._rightChild
                        : pGrandParent._leftChild
                    );
                }
                
                return pUncle;
            };
            
            /**
             * @function
             * @param {_Node} parent
             * @return {_Node}
             */
            _Node.prototype.getSibling = function (parent) {
                if(typeof(parent) === "undefined") {
                    return (
                        (this._parent !== null)
                        ? (
                            this === this._parent._leftChild
                            ? this._parent._rightChild
                            : this._parent._leftChild
                            )
                        : null
                    );
                }
                else {
                    var pSibling = null;
                    if(this === parent._leftChild) {
                        pSibling = parent._rightChild;
                    }
                    else if(this === parent._rightChild) {
                        pSibling = parent._leftChild;
                    }
                    
                    return pSibling;
                }
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNil = function () {
                return this._element === null;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNonNilRoot = function () {
                return this._parent === null && !this.isNil();
            };
            
            /**
             * @function
             * @param {Number} index
             * @return {_Node}
             */
            _Node.prototype.getChild = function (index) {
                var node = null;
                
                switch(index) {
                case 0:
                    node = this._leftChild;
                break;
                case 1:
                    node = this._rightChild;
                break;
                default:
                    throw new Error("The value of the index must be in [0, 1].");
                }
                
                return node;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getLastChild = function () {
                return (this.hasRightChild() ? this._rightChild : this._leftChild);
            };
            
            /**
             * @function
             * @param {Number} index
             * @param {_Node} pNode
             */
            _Node.prototype.setChild = function (index, pNode) {
                var pDetachedChild = null;
                
                switch(index) {
                case 0:
                    if(this.hasNonNilLeftChild()) {
                        pDetachedChild = this._leftChild;
                        this._leftChild._parent = null;
                    }
                    this._leftChild = pNode;
                break;
                case 1:
                    if(hasNonNilRightChild()) {
                        pDetachedChild = this._rightChild;
                        this._rightChild._parent = null;
                    }
                    this._rightChild = pNode;
                break;
                default:
                    throw new Error("The range of the index must be [0, 1].");
                }
                
                if(pNode) {
                    if(pNode._parent !== null) {
                        pNode.getChildSlot().call(pNode._parent, null);
                    }
                    pNode._parent = this;
                }
                
                return pDetachedChild;
            };
            
            /**
             * @function
             * @return {Number}
             */
            _Node.prototype.getChildCount = function () {
                return (this.hasLeftChild() ? 1 : 0)
                    + (this.hasRightChild() ? 1 : 0)
                ;
            };
            
            /**
             * @function
             * @return {Number}
             */
            _Node.prototype.getNonNilChildCount = function () {
                return (this.hasNonNilLeftChild() ? 1 : 0)
                    + (this.hasNonNilRightChild() ? 1 : 0)
                ;
            };
            
            /**
             * @function
             * @return {Number}
             */
            _Node.prototype.getLevel = function () {
                var level = 0;
                for(
                    var pCurrent = this._parent;
                    pCurrent !== null;
                    pCurrent = pCurrent._parent, ++level
                );
                
                return level;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isLeaf = function () {
                return !this.hasLeftChild() && !this.hasRightChild();
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNonNilLeaf = function () {
                return !this.hasNonNilLeftChild() && !this.hasNonNilRightChild();
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.hasLeftChild = function () {
                return this._leftChild !== null;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.hasRightChild = function () {
                return this._rightChild !== null;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.hasNonNilLeftChild = function () {
                return this.hasLeftChild() && !this._leftChild.isNil();
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.hasNonNilRightChild = function () {
                return this.hasRightChild() && !this._rightChild.isNil();
            };
            
            /**
             * @function
             * @return {Function}
             */
            _Node.prototype.getChildSlot = function () {
                var pChildSlot = null;
                
                if(this._parent !== null) {
                    if(this._parent._leftChild === this) {
                        pChildSlot = this._parent.leftChild;
                    }
                    else {
                        pChildSlot = this._parent.rightChild;
                    }
                }
                
                return pChildSlot;
            };
            
            /**
             * @function
             * @return {Number}
             */
            _Node.prototype.getChildSlotIndex = function () {
                return (
                    (this._parent !== null)
                    ? (this === this._parent._leftChild ? 0 : 1)
                    : 2
                );
            };
            
            /**
             * @function
             */
            _Node.prototype.rotateLeft = function () {
                var pChildSlot = this.getChildSlot();
                
                var pParent = this._parent;
                var pLeftChildOfRightChild = this._rightChild._leftChild;
                
                this._rightChild._leftChild = this;
                this._parent = this._rightChild;
                
                this._rightChild._parent = pParent;
                if(pChildSlot !== null) {
                    pChildSlot.call(pParent, this._rightChild);
                }
                
                this._rightChild = pLeftChildOfRightChild;
                if(pLeftChildOfRightChild !== _Node.nil) {
                    pLeftChildOfRightChild._parent = this;
                }
            };
            
            /**
             * @function
             */
            _Node.prototype.rotateRight = function () {
                var pChildSlot = this.getChildSlot();
                
                var pParent = this._parent;
                var pRightChildOfLeftChild = this._leftChild._rightChild;
                
                this._leftChild._rightChild = this;
                this._parent = this._leftChild;
                
                this._leftChild._parent = pParent;
                if(pChildSlot !== null) {
                    pChildSlot.call(pParent, this._leftChild);
                }
                
                this._leftChild = pRightChildOfLeftChild;
                if(pRightChildOfLeftChild !== _Node.nil) {
                    pRightChildOfLeftChild._parent = this;
                }
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.findLeftMostNode = function () {
                var pCurrent = this;
                for(
                    ;
                    pCurrent !== null && pCurrent.hasNonNilLeftChild();
                    pCurrent = pCurrent._leftChild
                );
                
                return pCurrent;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.findRightMostNode = function () {
                var pCurrent = this;
                for(
                    ;
                    pCurrent !== null && pCurrent.hasNonNilRightChild();
                    pCurrent = pCurrent._rightChild
                );
                
                return pCurrent;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.findLeftSubTreeRootNode = function () {
                var pCurrent = this;
                for(; pCurrent !== null; ) {
                    var pParent = pCurrent._parent;
                    if(pParent === null || pCurrent === pParent._leftChild) {
                        break;
                    }
                    
                    pCurrent = pParent;
                }
                
                return pCurrent;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.findRightSubTreeRootNode = function () {
                var pCurrent = this;
                for(; pCurrent !== null; ) {
                    var pParent = pCurrent._parent;
                    if(pParent === null || pCurrent === pParent._rightChild) {
                        break;
                    }
                    
                    pCurrent = pParent;
                }
                
                return pCurrent;
            };
            
            /**
             * @function
             * @param {Function} handler
             * @param {Object} [thisArg]
             * @return {Boolean}
             */
            _Node.prototype.traverseNonNilNodesByPostorder = function (handler) {
                var thisArg = arguments[1];
                
                var nodeStack = [];
                nodeStack.push(this);
                
                var pLastTraversedNode = null;
                var continueTraversal = true;
                for(; continueTraversal && nodeStack.length > 0; ) {
                    var pCurrentNode = nodeStack[nodeStack.length - 1];
                    if(
                        !pCurrentNode.isLeaf()
                        && pCurrentNode.getLastChild() !== pLastTraversedNode
                    ) {
                        if(pCurrentNode.hasRightChild()) {
                            nodeStack.push(pCurrentNode._rightChild);
                        }
                        
                        if(pCurrentNode.hasLeftChild()) {
                            nodeStack.push(pCurrentNode._leftChild);
                        }
                    }
                    else {
                        if(!pCurrentNode.isNil()) {
                            continueTraversal = !handler.call(thisArg, pCurrentNode);
                        }
                        pLastTraversedNode = pCurrentNode;
                        nodeStack.pop();
                    }
                }
                
                return continueTraversal;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getGreater = function () {
                var pGreater = null;
                
                if(!this._rightChild.isNil()) {
                    pGreater = this._rightChild.findLeftMostNode();
                }
                else {
                    if(this._parent !== null) {
                        if(this === this._parent._leftChild) {
                            pGreater = this._parent;
                        }
                        else {
                            pGreater = this.findLeftSubTreeRootNode()._parent;
                        }
                    }
                }
                
                return pGreater;
            };
            
            /**
             * @function
             * @return {_Node}
             */
            _Node.prototype.getLesser = function () {
                var pLesser = null;
                
                if(this.isNonNilLeaf()) {
                    if(this._parent !== null) {
                        if(this === this._parent._leftChild) {
                            pLesser = this.findRightSubTreeRootNode()._parent;
                        }
                        else {
                            pLesser = this._parent;
                        }
                    }
                }
                else if(!this._leftChild.isNil()) {
                    pLesser = this._leftChild.findRightMostNode();
                }
                else {
                    pLesser = this._parent;
                }
                
                return pLesser;
            };
            
            /**
             * @readonly
             */
            _Node.nil = new _Node();
            
            return _Node;
        })();
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {_Node} parent
         * @param {Object} element
         * @return {_Node}
         */
        var _constructNode = function (oThis, parent, element) {
            var node = null;
            if(oThis._garbageNodes.length < 1) {
                node = new _Node(parent, _Node.nil, _Node.nil, element, true);
            }
            else {
                node = oThis._garbageNodes.pop();
                _Node.call(node, parent, _Node.nil, _Node.nil, element, true);
            }
            
            return node;
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {_Node} node
         * @param {Boolean} [pushToGarbageList=true]
         */
        var _destructNode = function (oThis, node) {
            node._element =
            node._parent =
            node._leftChild =
            node._rightChild =
            node._red = undefined;
            
            if(typeof(arguments[2]) === "undefined" || !!arguments[2]) {
                oThis._garbageNodes.push(node);
            }
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {Object} element
         * @param {Number} searchTarget
         * @return {_Node}
         */
        var _findNode = function (oThis, element, searchTarget) {
            var pElementKey = oThis._keyGetter(element);
            var pCurrent = oThis._root, pPrevious = null;
            for(; pCurrent !== null && !pCurrent.isNil(); ) {
                var pCurrentElementKey = oThis._keyGetter(pCurrent._element);
                var compResult = oThis._comparator(pElementKey, pCurrentElementKey);
                if(compResult < 0) {
                    pPrevious = pCurrent;
                    pCurrent = pCurrent._leftChild;
                }
                else if(compResult > 0) {
                    pPrevious = pCurrent;
                    pCurrent = pCurrent._rightChild;
                }
                else {
                    break;
                }
            }
            
            var pFoundNode = null;
            if(
                searchTarget >= RbTreeSetBase.SearchTarget.greater
                && pPrevious !== null
                && !pPrevious.isNil()
                && oThis._comparator(oThis._keyGetter(pPrevious._element), pElementKey) < 0
            ) {
                pPrevious = pPrevious.getGreater();
            }
            switch(searchTarget) {
            case RbTreeSetBase.SearchTarget.equal:
                pFoundNode = (pCurrent !== null && !pCurrent.isNil() ? pCurrent : null);
            break;
            case RbTreeSetBase.SearchTarget.greater:
                pFoundNode = (pPrevious !== null && !pPrevious.isNil() ? pPrevious : null);
            break;
            case RbTreeSetBase.SearchTarget.greaterOrEqual:
                pFoundNode = (pCurrent !== null && !pCurrent.isNil() ? pCurrent : pPrevious);
            break;
            default:
                throw new Error("An unknown search target has been specified.");
            }
            
            return pFoundNode;
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {Object} element
         * @return {_Node}
         */
        var _insertNodeInBinarySearchTree = function (oThis, element) {
            var newNode = null;
            
            if(oThis._root === null) {
                newNode = _constructNode(oThis, null, element);
                oThis._root = newNode;
            }
            else {
                var pElementKey = oThis._keyGetter(element);
                for(
                    var pCurrent = oThis._root;
                    !pCurrent.isNil();
                ) {
                    var pCurrentElementKey = oThis._keyGetter(pCurrent._element);
                    var compResult = oThis._comparator(pElementKey, pCurrentElementKey);
                    if(compResult < 0) {
                        if(pCurrent._leftChild === _Node.nil) {
                            newNode = _constructNode(oThis, pCurrent, element);
                            pCurrent._leftChild = newNode;
                            
                            pCurrent = _Node.nil;
                        }
                        else {
                            pCurrent = pCurrent._leftChild;
                        }
                    }
                    else if(compResult > 0) {
                        if(pCurrent._rightChild === _Node.nil) {
                            newNode = _constructNode(oThis, pCurrent, element);
                            pCurrent._rightChild = newNode;
                            
                            pCurrent = _Node.nil;
                        }
                        else {
                            pCurrent = pCurrent._rightChild;
                        }
                    }
                    else {
                        pCurrent = _Node.nil;
                    }
                }
            }
            
            return newNode;
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {_Node} target
         * @return {Object}
         */
        var _disconnectNodeFromBinarySearchTree = function (oThis, target) {
            var out = {
                pRemovalTarget : null,
                pReplacement : null,
                pParentOfReplacement : null,
                pReplacementChildSlot : null
            };
            
            out.pRemovalTarget = target;
            var childCount = target.getNonNilChildCount();
            if(childCount >= 2) {
                var pMaximumOfRightSubTree = target._leftChild.findRightMostNode();
                if(pMaximumOfRightSubTree === null) {
                    throw new Error();
                }
                
                out.pRemovalTarget = pMaximumOfRightSubTree;
                
                //oThis._destructElement(target._element);
                target._element = pMaximumOfRightSubTree._element;
                pMaximumOfRightSubTree._element = null;
            }
            
            var pSelectedChildSlot = (
                out.pRemovalTarget.hasNonNilLeftChild()
                ? out.pRemovalTarget.leftChild
                : out.pRemovalTarget.rightChild
            );
            out.pReplacement = pSelectedChildSlot.call(out.pRemovalTarget);
            
            var pTargetParent = out.pRemovalTarget._parent;
            out.pParentOfReplacement = pTargetParent;
            if(pTargetParent !== null) {
                if(pTargetParent._leftChild === out.pRemovalTarget) {
                    pTargetParent._leftChild = pSelectedChildSlot.call(out.pRemovalTarget);
                    out.pReplacementChildSlot = pTargetParent.leftChild;
                }
                else {
                    pTargetParent._rightChild = pSelectedChildSlot.call(out.pRemovalTarget);
                    out.pReplacementChildSlot = pTargetParent.rightChild;
                }
            }
            else {
                out.pReplacementChildSlot = null;
            }
            if(!pSelectedChildSlot.call(out.pRemovalTarget).isNil()) {
                pSelectedChildSlot.call(out.pRemovalTarget)._parent = pTargetParent;
            }
            
            return out;
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {_Node} insertedNode
         */
        var _rebalanceAfterInsertion = function (oThis, insertedNode) {
            if(insertedNode.isNonNilRoot()) {
                insertedNode._red = false;
            }
            else {
                for(
                    var pCurrent = insertedNode;
                    pCurrent !== null;
                ) {
                    var pParent = pCurrent._parent;
                    if(pParent._red) {
                        var pUncle = pParent.getSibling();
                        if(pUncle !== _Node.nil && pUncle._red) {
                            pParent._red = false;
                            pUncle._red = false;

                            var pGrandParent = pParent._parent;
                            if(!pGrandParent.isNonNilRoot()) {
                                pGrandParent._red = true;
                                pCurrent = pGrandParent;
                            }
                            else {
                                pCurrent = null;
                            }
                        }
                        else {
                            var pGrandParent = pParent._parent;
                            var pTarget = pCurrent;
                            if(
                                pTarget === pParent._rightChild
                                && pParent === pGrandParent._leftChild
                            ) {
                                pParent.rotateLeft();
                                pTarget = pTarget._leftChild;
                            }
                            else if(
                                pTarget === pParent._leftChild
                                && pParent === pGrandParent._rightChild
                            ) {
                                pParent.rotateRight();
                                pTarget = pTarget._rightChild;
                            }
                            
                            var pGrandParentOfTarget = pTarget.getGrandParent();
                            pTarget._parent._red = false;
                            pGrandParentOfTarget._red = true;
                            var isGrandParentRoot = pGrandParentOfTarget.isNonNilRoot();
                            if(pTarget === pTarget._parent._leftChild) {
                                pGrandParentOfTarget.rotateRight();
                            }
                            else {
                                pGrandParentOfTarget.rotateLeft();
                            }
                            if(isGrandParentRoot) {
                                oThis._root = pGrandParentOfTarget._parent;
                            }
                            
                            pCurrent = null;
                        }
                    }
                    else {
                        pCurrent = null;
                    }
                }
            }
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {_Node} replacement
         * @param {_Node} pParentOfReplacement
         */
        var _rebalanceAfterRemoval = function (oThis, replacement, pParentOfReplacement) {
            if(replacement._red) {
                replacement._red = false;
            }
            else {
                for(
                    var pCurrent = replacement, pParentOfCurrent = pParentOfReplacement;
                    pCurrent !== null;
                ) {
                    if(pParentOfCurrent === null) {
                        oThis._root = pCurrent;
                        
                        pCurrent = null;
                    }
                    else {
                        var pSiblingOfCurrent = pCurrent.getSibling();
                        if(pSiblingOfCurrent._red) {
                            pParentOfCurrent._red = true;
                            pSiblingOfCurrent._red = false;
                            
                            if(pSiblingOfCurrent === pParentOfCurrent._rightChild) {
                                pParentOfCurrent.rotateLeft();
                            }
                            else {
                                pParentOfCurrent.rotateRight();
                            }
                        }
                        
                        pSiblingOfCurrent = pCurrent.getSibling();
                        if(
                            !pParentOfCurrent._red
                            && !pSiblingOfCurrent._red
                            && !pSiblingOfCurrent._leftChild._red
                            && !pSiblingOfCurrent._rightChild._red
                        ) {
                            pSiblingOfCurrent._red = true;
                            
                            pCurrent = pParentOfCurrent;
                            pParentOfCurrent = pCurrent._parent;
                        }
                        else {
                            if(
                                pParentOfCurrent._red
                                && !pSiblingOfCurrent._red
                                && !pSiblingOfCurrent._leftChild._red
                                && !pSiblingOfCurrent._rightChild._red
                            ) {
                                pParentOfCurrent._red = false;
                                pSiblingOfCurrent._red = true;
                            }
                            else if(!pSiblingOfCurrent._red) {
                                if(
                                    pCurrent === pParentOfCurrent._leftChild
                                    && pSiblingOfCurrent._leftChild._red
                                    && !pSiblingOfCurrent._rightChild._red
                                ) {
                                    pSiblingOfCurrent._red = true;
                                    pSiblingOfCurrent._leftChild._red = false;
                                    
                                    pSiblingOfCurrent.rotateRight();
                                }
                                else if(
                                    pCurrent === pParentOfCurrent._rightChild
                                    && pSiblingOfCurrent._rightChild._red
                                    && !pSiblingOfCurrent._leftChild._red
                                ) {
                                    pSiblingOfCurrent._red = true;
                                    pSiblingOfCurrent._rightChild._red = false;
                                    
                                    pSiblingOfCurrent.rotateLeft();
                                }
                            }
                            
                            pSiblingOfCurrent = pCurrent.getSibling();
                            if(!pSiblingOfCurrent._red) {
                                var isParentRed = pParentOfCurrent._red;
                                pParentOfCurrent._red = pSiblingOfCurrent._red;
                                pSiblingOfCurrent._red = isParentRed;
                                
                                if(
                                    pCurrent === pParentOfCurrent._leftChild
                                    && pSiblingOfCurrent._rightChild._red
                                ) {
                                    pSiblingOfCurrent._rightChild._red = false;
                                    pParentOfCurrent.rotateLeft();
                                }
                                else if(
                                    pCurrent === pParentOfCurrent._rightChild
                                    && pSiblingOfCurrent._leftChild._red
                                ) {
                                    pSiblingOfCurrent._leftChild._red = false;
                                    pParentOfCurrent.rotateRight();
                                }
                            }
                            
                            pCurrent = null;
                        }
                    }
                }
            }
        };
        
        /**
         * @function
         * @param {_Node} node
         */
        var _traversalHandlerOfRemoveAll = function (node) {
            _destructNode(this, node);
        };
        
        RbTreeSetBase.IteratorBase = (function () {
            /**
             * @memberof {RbTreeSetBase}
             * @constructor
             * @function
             * @param {RbTreeSetBase} tree
             * @param {_Node} node
             */
            var IteratorBase = function (tree, node) {
                this._tree = tree;
                this._node = node;
            };
            
            /**
             * @function
             * @param {RbTreeSetBase.IteratorBase} rhs
             * @return {Boolean}
             */
            IteratorBase.prototype[karbonator.equals] = function (rhs) {
                return this._tree === rhs._tree
                    && this._node === rhs._node
                ;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            IteratorBase.prototype.moveToNext = function () {
                var result = this._node !== null;
                if(result) {
                    this._node = this._node.getGreater();
                }
                
                return result;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            IteratorBase.prototype.moveToPrevious = function () {
                var result = true;
                
                if(this._node === null) {
                    this._node = this._tree._root.findRightMostNode();
                }
                else {
                    var lesser = this._node.getLesser();
                    result = lesser !== null;
                    if(result) {
                        this._node = lesser;
                    }
                }
                
                return result;
            };
            
            /**
             * @function
             * @return {Object}
             */
            IteratorBase.prototype.dereference = function () {
                if(this._node === null) {
                    throw new Error("Cannot deference an iterator pointing the end of container.");
                }
                
                return this._node._element;
            };
            
            return IteratorBase;
        })();
        
        /**
         * @function
         * @return {RbTreeSetBase.IteratorBase}
         */
        RbTreeSetBase.prototype.begin = function () {
            return new RbTreeSetBase.IteratorBase(
                this,
                (this._root !== null ? this._root.findLeftMostNode() : null)
            );
        };
        
        /**
         * @function
         * @return {RbTreeSetBase.IteratorBase}
         */
        RbTreeSetBase.prototype.end = function () {
            return new RbTreeSetBase.IteratorBase(this, null);
        };
        
        /**
         * @function
         * @return {Number}
         */
        RbTreeSetBase.prototype.getElementCount = function () {
            return this._elementCount;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        RbTreeSetBase.prototype.isEmpty = function () {
            return this._root === null;
        };
        
        /**
         * @function
         * @param {Object} element
         * @param {Number} searchTarget
         * @return {RbTreeSetBase.IteratorBase}
         */
        RbTreeSetBase.prototype.find = function (element, searchTarget) {
            return new RbTreeSetBase.IteratorBase(this, _findNode(this, element, searchTarget));
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {RbTreeSetBase.IteratorBase}
         */
        RbTreeSetBase.prototype.insert = function (element) {
            var insertedNode = _insertNodeInBinarySearchTree(this, element);
            if(insertedNode !== null) {
                ++this._elementCount;
                _rebalanceAfterInsertion(this, insertedNode);
            }
            
            return new RbTreeSetBase.IteratorBase(this, insertedNode);
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        RbTreeSetBase.prototype.remove = function (element) {
            var pTarget = _findNode(this, element, RbTreeSetBase.SearchTarget.equal);
            var targetFound = pTarget !== null;
            if(targetFound) {
                --this._elementCount;
                
                var info = _disconnectNodeFromBinarySearchTree(this, pTarget);
                
                var pTempNilNode = null;
                if(info.pReplacement === _Node.nil) {
                    pTempNilNode = _constructNode(this, info.pParentOfReplacement, null);
                    pTempNilNode._red = false;
                    if(info.pParentOfReplacement !== null) {
                        info.pReplacementChildSlot.call(info.pParentOfReplacement, pTempNilNode);
                    }
                    info.pReplacement = pTempNilNode;
                }
                
                if(info.pRemovalTarget._red) {
                    info.pRemovalTarget._red = false;
                    info.pReplacement._red = true;
                }
                else {
                    _rebalanceAfterRemoval(this, info.pReplacement, info.pParentOfReplacement);
                    if(this._root === pTempNilNode) {
                        this._root = null;
                    }
                    else if(info.pReplacement.isNonNilRoot()) {
                        this._root = info.pReplacement;
                    }
                    else if(!this._root.isNonNilRoot()) {
                        this._root = this._root.getRoot();
                    }
                }
                
                info.pRemovalTarget._parent = null;
                _destructNode(this, info.pRemovalTarget);
                if(pTempNilNode !== null) {
                    pTempNilNode._parent = null;
                    _destructNode(this, pTempNilNode);
                    if(info.pParentOfReplacement !== null) {
                        info.pReplacementChildSlot.call(info.pParentOfReplacement, _Node.nil);
                    }
                }
            }
            
            return targetFound;
        };
        
        /**
         * @function
         */
        RbTreeSetBase.prototype.removeAll = function () {
            if(!this.isEmpty()) {
                this._root.traverseNonNilNodesByPostorder(
                    _traversalHandlerOfRemoveAll,
                    this
                );
                
                this._root = null;
                this._elementCount = 0;
            }
        };
        
        return RbTreeSetBase;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //TreeSet
    
    collection.TreeSet = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {karbonator.comparator} comparator
         * @param {iterable} [iterable]
         */
        var TreeSet = function (comparator) {
            this._comparator = comparator;
            this._rbTreeSet = new RbTreeSetBase(comparator);
            
            if(!karbonator.isUndefined(arguments[1])) {
                _setConcatenateAssign(this, arguments[1]);
            }
        };
        
        var PairIterator = (function () {
            /**
             * @constructor
             * @param {karbonator.collection.TreeSet} set
             */
            var PairIterator = function (set) {
                this._iter = set._rbTreeSet.begin();
                this._end = set._rbTreeSet.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var done = this._iter[karbonator.equals](this._end);
                var value = (!done ? this._iter.dereference() : undefined);
                var out = {
                    value : (value ? [value, value] : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return PairIterator;
        })();
        
        var ValueIterator = (function () {
            /**
             * @constructor
             * @param {karbonator.collection.TreeSet} set
             */
            var ValueIterator = function (set) {
                this._iter = set._rbTreeSet.begin();
                this._end = set._rbTreeSet.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._iter[karbonator.equals](this._end);
                var out = {
                    value : (!done ? this._iter.dereference() : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return ValueIterator;
        })();
        
        /**
         * @function
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype[karbonator.shallowClone] = function () {
            return _setShallowCopy(TreeSet, this);
        };
        
        /**
         * @function
         * @return {Number}
         */
        TreeSet.prototype.getElementCount = function () {
            return this._rbTreeSet.getElementCount();
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        TreeSet.prototype.has = function (value) {
            return !this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.equal)[karbonator.equals](this._rbTreeSet.end());
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Object|undefined}
         */
        TreeSet.prototype.findNotLessThan = function (value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.greaterOrEqual);
            if(!iter[karbonator.equals](endIter)) {
                return iter.dereference();
            }
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Object|undefined}
         */
        TreeSet.prototype.findGreaterThan = function (value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.greater);
            if(!iter[karbonator.equals](endIter)) {
                return iter.dereference();
            }
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         */
        TreeSet.prototype.forEach = function (callback, thisArg) {
            for(
                var end = this._rbTreeSet.end(), iter = this._rbTreeSet.begin();
                !iter[karbonator.equals](end);
                iter.moveToNext()
            ) {
                var value = iter.dereference();
                callback.call(thisArg, value, value, this);
            }
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        TreeSet.prototype.entries = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        TreeSet.prototype.keys = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        TreeSet.prototype.values = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        TreeSet.prototype[Symbol.iterator] = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @param {Object} value
         */
        TreeSet.prototype.add = function (value) {
            this._rbTreeSet.insert(value);
            
            return this;
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        TreeSet.prototype.tryAdd = function (value) {
            return !this._rbTreeSet.insert(value)[karbonator.equals](this._rbTreeSet.end());
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        TreeSet.prototype.remove = function (value) {
            return this._rbTreeSet.remove(value);
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        TreeSet.prototype["delete"] = function (value) {
            return this._rbTreeSet.remove(value);
        };
        
        /**
         * @function
         */
        TreeSet.prototype.clear = function () {
            this._rbTreeSet.removeAll();
        };
        
        /**
         * lhs = (lhs ∪ rhs).<br>
         * This method tries to add rhs's elements, so it uses <b>lhs</b>'s comparator to check if lhs lacks rhs's elements.<br>
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.uniteAssign = function (rhs) {
            return _setUniteAssign(this, rhs);
        };
        
        /**
         * Creates a new set of (lhs ∪ rhs).<br>
         * This method tries to add rhs's elements, so it uses <b>lhs</b>'s comparator to check if lhs lacks rhs's elements.<br>
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.unite = function (rhs) {
            return _setUnite(TreeSet, this, rhs);
        };
        
        /**
         * lhs = (lhs - rhs).<br>
         * This method uses <b>lhs</b>'s comparator to check if lhs has rhs's elements.<br>
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.subtractAssign = function (rhs) {
            return _setSubtractAssign(this, rhs);
        };
        
        /**
         * Creates a new set of (lhs - rhs).
         * This method uses <b>lhs</b>'s comparator to check if lhs has rhs's elements.<br>
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.subtract = function (rhs) {
            return _setSubtract(TreeSet, this, rhs);
        };
        
        /**
         * lhs = (lhs ∩ rhs).<br>
         * This method will actually calculate <b>(lhs - (lhs - rhs))</b> instead to consistently use <b>lhs</b>'s comparator.
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.intersectAssign = function (rhs) {
            return _setIntersectAssign(TreeSet, this, rhs);
        };
        
        /**
         * Creates a new set of (lhs ∩ rhs).<br>
         * This method will actually calculate <b>(lhs - (lhs - rhs))</b> instead to consistently use <b>lhs</b>'s comparator.
         * @function
         * @param {karbonator.collection.TreeSet} rhs
         * @return {karbonator.collection.TreeSet}
         */
        TreeSet.prototype.intersect = function (rhs) {
            return _setIntersect(TreeSet, this, rhs);
        };
        
        /**
         * @function
         * @return {String}
         */
        TreeSet.prototype.toString = _setToStringMethod;
        
        return TreeSet;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //TreeMap
    
    collection.TreeMap = (function () {
        /**
         * @function
         * @param {Object} pair
         * @return {Object}
         */
        var _treeMapKeyGetter = function (pair) {
            return pair.key;
        };
        
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {karbonator.comparator} comparator
         * @param {iterable} [iterable]
         */
        var TreeMap = function (comparator) {
            this._rbTreeSet = new RbTreeSetBase(comparator, _treeMapKeyGetter);
            this._comparator = comparator;
            
            if(!karbonator.isUndefined(arguments[1])) {
                _mapConcatenateAssign(this, arguments[1]);
            }
        };
        
        var PairIterator = (function () {
            /**
             * @function
             * @param {TreeMap} treeMap
             */
            var PairIterator = function (treeMap) {
                this._iter = treeMap._rbTreeSet.begin();
                this._end = treeMap._rbTreeSet.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var done = this._iter[karbonator.equals](this._end);
                var pair = (!done ? this._iter.dereference() : undefined);
                var out = {
                    value : (pair ? [pair.key, pair.value] : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return PairIterator;
        }());
        
        var KeyIterator = (function () {
            /**
             * @function
             * @param {TreeMap} treeMap
             */
            var KeyIterator = function (treeMap) {
                this._iter = treeMap._rbTreeSet.begin();
                this._end = treeMap._rbTreeSet.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            KeyIterator.prototype.next = function () {
                var done = this._iter[karbonator.equals](this._end);
                var out = {
                    value : (!done ? this._iter.dereference().key : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return KeyIterator;
        }());
        
        var ValueIterator = (function () {
            /**
             * @function
             * @param {TreeMap} treeMap
             */
            var ValueIterator = function (treeMap) {
                this._iter = treeMap._rbTreeSet.begin();
                this._end = treeMap._rbTreeSet.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._iter[karbonator.equals](this._end);
                var out = {
                    value : (!done ? this._iter.dereference().value : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return ValueIterator;
        }());
        
        /**
         * @function
         * @return {TreeMap}
         */
        TreeMap.prototype[karbonator.shallowClone] = function () {
            return _mapShallowCopy(TreeMap, this);
        };
        
        /**
         * @function
         * @return {Number}
         */
        TreeMap.prototype.getElementCount = function () {
            return this._rbTreeSet.getElementCount();
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Object|undefined}
         */
        TreeMap.prototype.get = function (key) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.equal);
            if(!iter[karbonator.equals](endIter)) {
                return iter.dereference().value;
            }
        };
        
        /**
         * @function
         * @param {Object} key
         * @param {Object} value
         * @return {TreeMap}
         */
        TreeMap.prototype.set = function (key, value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.equal);
            if(iter[karbonator.equals](endIter)) {
                this._rbTreeSet.insert({key : key, value : value});
            }
            else {
                iter.dereference().value = value;
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {Object} key
         * @param {Object} value
         * @return {Boolean}
         */
        TreeMap.prototype.tryAdd = function (key, value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.equal);
            var result = iter[karbonator.equals](endIter);
            if(result) {
                this._rbTreeSet.insert({key : key, value : value});
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        TreeMap.prototype.has = function (key) {
            return !this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.equal)[karbonator.equals](this._rbTreeSet.end());
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Object|undefined}
         */
        TreeMap.prototype.findNotLessThan = function (key) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.greaterOrEqual);
            if(!iter[karbonator.equals](endIter)) {
                var pair = iter.dereference();
                return {
                    key : pair.key,
                    value : pair.value
                };
            }
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Object|undefined}
         */
        TreeMap.prototype.findGreaterThan = function (key) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find({key : key}, RbTreeSetBase.SearchTarget.greater);
            if(!iter[karbonator.equals](endIter)) {
                var pair = iter.dereference();
                return {
                    key : pair.key,
                    value : pair.value
                };
            }
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} thisArg
         */
        TreeMap.prototype.forEach = function (callback, thisArg) {
            for(
                var end = this._rbTreeSet.end(), iter = this._rbTreeSet.begin();
                !iter[karbonator.equals](end);
                iter.moveToNext()
            ) {
                var pair = iter.dereference();
                callback.call(thisArg, pair.value, pair.key, this);
            }
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        TreeMap.prototype.entries = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        TreeMap.prototype[Symbol.iterator] = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {KeyIterator}
         */
        TreeMap.prototype.keys = function () {
            return new KeyIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        TreeMap.prototype.values = function () {
            return new ValueIterator(this);
        };
         
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        TreeMap.prototype.remove = function (key) {
            return this._rbTreeSet.remove(key);
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        TreeMap.prototype["delete"] = TreeMap.prototype.remove;
        
        /**
         * @function
         */
        TreeMap.prototype.clear = function () {
            this._rbTreeSet.removeAll();
        };
        
        /**
         * @function
         * @return {String}
         */
        TreeMap.prototype.toString = _mapToStringMethod;
        
        return TreeMap;
    }());
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListSet
    
    collection.ListSet = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {karbonator.comparator} comparator
         * @param {iterable} [iterable]
         */
        var ListSet = function (comparator) {
            detail._assertIsComparator(comparator);
            
            this._comparator = comparator;
            this._elements = [];
            
            if(!karbonator.isUndefined(arguments[1])) {
                _setConcatenateAssign(this, arguments[1]);
            }
        };
        
        var ValueIterator = (function () {
            /**
             * @constructor
             * @param {karbonator.collection.ListSet} listSet
             * @param {Number} [index = 0]
             */
            var ValueIterator = function (listSet) {
                this._listSet = listSet;
                this._index = detail._selectNonUndefined(arguments[1], 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._index >= this._listSet.getElementCount();
                var out = {
                    value : (done ? undefined : this._listSet.getAt(this._index)),
                    done : done
                };
                
                ++this._index;
                
                return out;
            };
            
            return ValueIterator;
        })();
        
        var PairIterator = (function () {
            /**
             * @constructor
             * @param {karbonator.collection.ListSet} listSet
             * @param {Number} [index = 0]
             */
            var PairIterator = function (listSet) {
                this._listSet = listSet;
                this._index = detail._selectNonUndefined(arguments[1], 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var done = this._index >= this._listSet.getElementCount();
                var value = (done ? undefined : this._listSet.getAt(this._index));
                var out = {
                    value : [value, value],
                    done : done
                };
                
                ++this._index;
                
                return out;
            };
            
            return PairIterator;
        })();
        
        /**
         * @function
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype[karbonator.shallowClone] = function () {
            return _setShallowCopy(ListSet, this);
        };
        
        /**
         * @function
         * @return {Number}
         */
        ListSet.prototype.getElementCount = function () {
            return this._elements.length;
        };
        
        /**
         * @function
         * @param {Number} index
         * @return {Object}
         */
        ListSet.prototype.getAt = function (index) {
            return this._elements[index];
        };
        
        /**
         * @function
         * @param {Number} index
         * @param {Object} element
         */
        ListSet.prototype.setAt = function (index, element) {
            this._elements[index] = element;
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} thisArg
         */
        ListSet.prototype.forEach = function (callback, thisArg) {
            for(var i = 0; i < this._elements.length; ++i) {
                callback.call(thisArg, this._elements[i], i, this);
            };
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        ListSet.prototype.entries = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        ListSet.prototype.keys = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        ListSet.prototype.values = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        ListSet.prototype[Symbol.iterator] = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype.has = function (element) {
            return this.findIndex(element) >= 0;
        };
        
        /**
         * @function
         * @param {Object} element
         * @param {karbonator.comparator} [comparator]
         * @return {Number}
         */
        ListSet.prototype.findIndex = function (element) {
            var comparator = detail._selectNonUndefined(arguments[1], this._comparator);
            for(var i = 0; i < this._elements.length; ++i) {
                if(comparator(this._elements[i], element) === 0) {
                    return i;
                }
            };
            
            return -1;
        };
        
        /**
         * @function
         * @param {Object} element
         */
        ListSet.prototype.add = function (element) {
            var result = !this.has(element);
            if(result) {
                this._elements.push(element);
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype.tryAdd = function (element) {
            var result = !this.has(element);
            if(result) {
                this._elements.push(element);
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Number} index
         */
        ListSet.prototype.removeAt = function (index) {
            var result = (index < this._elements.length && index >= 0);
            if(result) {
                this._elements.splice(index, 1);
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype.remove = function (element) {
            return this.removeAt(this.findIndex(element));
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype["delete"] = function (element) {
            return this.removeAt(this.findIndex(element));
        };
        
        /**
         * @function
         */
        ListSet.prototype.clear = function () {
            this._elements.length = 0;
        };
        
        /**
         * lhs = (lhs ∪ rhs).<br>
         * This method tries to add rhs's elements, so it uses <b>lhs</b>'s comparator to check if lhs lacks rhs's elements.<br>
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.uniteAssign = function (rhs) {
            return _setUniteAssign(this, rhs);
        };
        
        /**
         * Creates a new set of (lhs ∪ rhs).<br>
         * This method tries to add rhs's elements, so it uses <b>lhs</b>'s comparator to check if lhs lacks rhs's elements.<br>
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.unite = function (rhs) {
            return _setUnite(ListSet, this, rhs);
        };
        
        /**
         * lhs = (lhs - rhs).<br>
         * This method uses <b>lhs</b>'s comparator to check if lhs has rhs's elements.<br>
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.subtractAssign = function (rhs) {
            return _setSubtractAssign(this, rhs);
        };
        
        /**
         * Creates a new set of (lhs - rhs).
         * This method uses <b>lhs</b>'s comparator to check if lhs has rhs's elements.<br>
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.subtract = function (rhs) {
            return _setSubtract(ListSet, this, rhs);
        };
        
        /**
         * lhs = (lhs ∩ rhs).<br>
         * This method will actually calculate <b>(lhs - (lhs - rhs))</b> instead to consistently use <b>lhs</b>'s comparator.
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.intersectAssign = function (rhs) {
            return _setIntersectAssign(ListSet, this, rhs);
        };
        
        /**
         * Creates a new set of (lhs ∩ rhs).<br>
         * This method will actually calculate <b>(lhs - (lhs - rhs))</b> instead to consistently use <b>lhs</b>'s comparator.
         * @function
         * @param {karbonator.collection.ListSet} rhs
         * @return {karbonator.collection.ListSet}
         */
        ListSet.prototype.intersect = function (rhs) {
            return _setIntersect(ListSet, this, rhs);
        };
        
        /**
         * @function
         * @return {String}
         */
        ListSet.prototype.toString = _setToStringMethod;
        
        return ListSet;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListMap
    
    collection.ListMap = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {karbonator.comparator} comparator
         * @param {iterable} [iterable]
         */
        var ListMap = function (comparator) {
            detail._assertIsComparator(comparator);
            
            this._comparator = comparator;
            this._pairs = [];
            
            if(!karbonator.isUndefined(arguments[1])) {
                _mapConcatenateAssign(this, arguments[1]);
            }
        };
        
        var PairIterator = (function () {
            /**
             * @function
             * @param {ListMap} listMap
             * @param {Number} [index = 0]
             */
            var PairIterator = function (listMap) {
                this._listMap = listMap;
                this._index = detail._selectNonUndefined(arguments[1], 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var out = {
                    done : this._index >= this._listMap._pairs.length,
                    value : undefined
                };
                
                if(!out.done) {
                    var pair = this._listMap._pairs[this._index];
                    out.value = [pair.key, pair.value];
                    ++this._index;
                }
                
                return out;
            };
            
            return PairIterator;
        }());
        
        var KeyIterator = (function () {
            /**
             * @function
             * @param {ListMap} listMap
             * @param {Number} [index = 0]
             */
            var KeyIterator = function (listMap) {
                this._listMap = listMap;
                this._index = detail._selectNonUndefined(arguments[1], 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            KeyIterator.prototype.next = function () {
                var out = {
                    done : this._index >= this._listMap._pairs.length,
                    value : undefined
                };
                
                if(!out.done) {
                    var pair = this._listMap._pairs[this._index];
                    out.value = pair.key;
                    ++this._index;
                }
                
                return out;
            };
            
            return KeyIterator;
        }());
        
        var ValueIterator = (function () {
            /**
             * @function
             * @param {ListMap} listMap
             * @param {Number} [index = 0]
             */
            var ValueIterator = function (listMap) {
                this._listMap = listMap;
                this._index = detail._selectNonUndefined(arguments[1], 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var out = {
                    done : this._index >= this._listMap._pairs.length,
                    value : undefined
                };
                
                if(!out.done) {
                    var pair = this._listMap._pairs[this._index];
                    out.value = pair.value;
                    ++this._index;
                }
                
                return out;
            };
            
            return ValueIterator;
        }());
        
        /**
         * @function
         * @return {TreeMap}
         */
        ListMap.prototype[karbonator.shallowClone] = function () {
            return _mapShallowCopy(ListMap, this);
        };
        
        /**
         * @function
         * @return {Number}
         */
        ListMap.prototype.getElementCount = function () {
            return this._pairs.length;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Object|undefined}
         */
        ListMap.prototype.get = function (key) {
            var index = this.findIndex(key);
            if(index >= 0) {
                return this._pairs[index].value;
            }
        };
        
        /**
         * @function
         * @param {Object} key
         * @param {Object} value
         * @return {ListMap}
         */
        ListMap.prototype.set = function (key, value) {
            var index = this.findIndex(key);
            if(index < 0) {
                this._pairs.push({key : key, value : value});
            }
            else {
                this._pairs[index].value = value;
            }
            
            return this;
        };
        
        /**
         * @function
         * @param {Object} key
         * @param {Object} value
         * @return {Boolean}
         */
        ListMap.prototype.tryAdd = function (key, value) {
            var index = this.findIndex(key);
            var result = index < 0;
            if(result) {
                this._pairs.push({key : key, value : value});
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        ListMap.prototype.has = function (key) {
            return this.findIndex(key) >= 0;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Number}
         */
        ListMap.prototype.findIndex = function (key) {
            for(var i = 0; i < this._pairs.length; ++i) {
                if(this._comparator(this._pairs[i].key, key) === 0) {
                    return i;
                }
            }
            
            return -1;
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} thisArg
         */
        ListMap.prototype.forEach = function (callback, thisArg) {
            for(var i = 0; i < this._pairs.length; ++i) {
                var pair = this._pairs[i];
                callback.call(thisArg, pair.value, pair.key, this);
            }
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        ListMap.prototype.entries = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {PairIterator}
         */
        ListMap.prototype[Symbol.iterator] = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {KeyIterator}
         */
        ListMap.prototype.keys = function () {
            return new KeyIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        ListMap.prototype.values = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        ListMap.prototype.remove = function (key) {
            var index = this.findIndex(key);
            var result = index >= 0;
            if(result) {
                this._pairs.splice(index, 1);
            }

            return result;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Boolean}
         */
        ListMap.prototype["delete"] = ListMap.prototype.remove;
        
        /**
         * @function
         */
        ListMap.prototype.clear = function () {
            this._pairs.length = 0;
        };
        
        /**
         * @function
         * @return {String}
         */
        ListMap.prototype.toString = _mapToStringMethod;
        
        return ListMap;
    })();
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
