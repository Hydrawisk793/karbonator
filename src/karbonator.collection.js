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
        g.define(["./karbonator.core"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("./karbonator.core"));
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
    
    var detail = karbonator.detail;
    
    //var Array = global.Array;
    var Symbol = karbonator.getEsSymbol();
    
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
     * @memberof karbonator
     * @namespace
     */
    var collection = karbonator.collection || {};
    karbonator.collection = collection;
    
    /*////////////////////////////////*/
    //ListQueue
    
    /**
     * @memberof karbonator.collection
     * @constructor
     */
    var ListQueue = function () {
        this._head = null;
        this._tail = null;
        this._elemCount = 0;
    };
    
    /**
     * @memberof karbonator.collection.ListQueue
     * @private
     * @constructor
     * @param {Object} element
     * @param {ListQueue._Node} next
     */
    ListQueue._Node = function (element, next) {
        this.element = element;
        this.next = next;
    };
    
    /**
     * @memberof karbonator.collection.ListQueue
     * @param {Object} iterable
     * @param {Function} [mapFunc]
     * @param {Object} [thisArg]
     * @return {karbonator.collection.ListQueue}
     */
    ListQueue.from = function (iterable) {
        if(!karbonator.isEsIterable(iterable)) {
            throw new TypeError("'iterable' must have the property 'Symbol.iterator'.");
        }
        
        var queue = new ListQueue();
        
        var mapFunc = arguments[1];
        if(karbonator.isUndefined(mapFunc)) {
            for(
                var i = iterable[Symbol.iterator](), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                queue.enqueue(iP.value);
            }
        }
        else {
            if(!karbonator.isFunction(mapFunc)) {
                throw new TypeError("'mapFunc' must be a function.");
            }
            var thisArg = arguments[2];
            
            for(
                var i = iterable[Symbol.iterator](), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                queue.enqueue(mapFunc.call(thisArg, iP.value));
            }
        }
        
        return queue;
    };
    
    /**
     * @function
     * @return {Number}
     */
    ListQueue.prototype.getElementCount = function () {
        return this._elemCount;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    ListQueue.prototype.isEmpty = function () {
        return null === this._head;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    ListQueue.prototype.isFull = function () {
        return this._elemCount >= Number.MAX_SAFE_INTEGER;
    };
    
    /**
     * @function
     * @return {iterator}
     */
    ListQueue.prototype[Symbol.iterator] = function () {
        return ({
            next : function () {
                var out = {
                    done : null === this._current
                };
                
                if(!out.done) {
                    out.value = this._current.element;
                    this._current = this._current.next;
                }
                
                return out;
            },
            _current : this._head
        });
    };
    
    /**
     * @function
     * @return {Object}
     */
    ListQueue.prototype.peek = function () {
        if(this.isEmpty()) {
            throw new Error("The queue has no element.");
        }
        
        return this._head.element;
    };
    
    /**
     * @function
     * @param {Object} e
     * @return {karbonator.collection.ListQueue}
     */
    ListQueue.prototype.enqueue = function (e) {
        if(this.isFull()) {
            throw new Error("Cannot enqueue elements any more.");
        }
        
        var newNode = new ListQueue._Node(e, null);
        
        if(!this.isEmpty()) {
            this._tail.next = newNode;
        }
        else {
            this._head = newNode;
        }
        this._tail = newNode;
        
        ++this._elemCount;
        
        return this;
    };
    
    /**
     * @function
     * @return {Object}
     */
    ListQueue.prototype.dequeue = function () {
        if(this.isEmpty()) {
            throw new Error("The queue has no element.");
        }
        
        var element = null;
        if(this._head !== this._tail) {
            element = this._head.element;
            
            this._head = this._head.next;
        }
        else {
            element = this._tail.element;
            
            this._head = null;
            this._tail = null;
        }
        
        --this._elemCount;
        
        return element;
    };
    
    /**
     * @function
     */
    ListQueue.prototype.clear = function () {
        this._head = null;
        this._tail = null;
        this._elemCount = 0;
    };
    
    /**
     * @function
     * @return {String}
     */
    ListQueue.prototype.toString = function () {
        var str = '[';
        
        var iter = this[Symbol.iterator]();
        var pair = iter.next();
        if(!pair.done) {
            str += pair.value;
        }
        
        for(pair = iter.next(); !pair.done; pair = iter.next()) {
            str += ", ";
            str += pair.value;
        }
        
        str += ']';
        
        return str;
    };
    
    collection.ListQueue = ListQueue;
    
    /*////////////////////////////////*/
    
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
    
    /*////////////////////////////////////////////////////////////////*/
    //RbTreeSet
    
    /**
     * @memberof karbonator.collection
     * @constructor
     * @param {karbonator.comparartor} comparator
     * @param {keyGetter} [keyGetter]
     */
    var RbTreeSet = function (comparator) {
        detail._assertIsComparator(comparator);
        this._comparator = comparator;
        
        this._keyGetter = arguments[1];
        if(karbonator.isUndefined(this._keyGetter)) {
            this._keyGetter = RbTreeSet._defaultKeyGetter;
        }
        else if(!karbonator.isFunction(this._keyGetter)) {
            throw new TypeError("");
        }
        
        this._elementCount = 0;
        this._root = null;
        this._garbageNodes = [];
    };
    
    /**
     * @callback keyGetter
     * @param {Object} element
     * @return {Object}
     */
    RbTreeSet._defaultKeyGetter = function (element) {
        return element;
    };
    
    /*////////////////////////////////*/
    //RbTreeSet.Node
    
    /**
     * @memberof karbonator.collection.RbTreeSet
     * @private
     * @constructor
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} [parent=null]
     * @param {karbonator.collection.RbTreeSet.Node} [leftChild=null]
     * @param {karbonator.collection.RbTreeSet.Node} [rightChild=null]
     * @param {Object} [element=null]
     * @param {Boolean} [red=false]
     */
    RbTreeSet.Node = function () {
        this._parent = detail._selectNonUndefined(arguments[0], null);
        this._leftChild = detail._selectNonUndefined(arguments[1], null);
        this._rightChild = detail._selectNonUndefined(arguments[2], null);
        this._element = detail._selectNonUndefined(arguments[3], null);
        this._red = detail._selectNonUndefined(arguments[4], false);
    };

    /**
     * @memberof RbTreeSet.Node
     * @readonly
     */
    RbTreeSet.Node.nil = new RbTreeSet.Node();

    /**
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} node
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.leftChild = function (node) {
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
     * @param {karbonator.collection.RbTreeSet.Node} node
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.rightChild = function (node) {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getRoot = function () {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getGrandParent = function () {
        return (this._parent !== null ? this._parent._parent : null);
    };

    /**
     * @function
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getUncle = function () {
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
     * @param {karbonator.collection.RbTreeSet.Node} parent
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getSibling = function (parent) {
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
    RbTreeSet.Node.prototype.isNil = function () {
        return this._element === null;
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.isNonNilRoot = function () {
        return this._parent === null && !this.isNil();
    };

    /**
     * @function
     * @param {Number} index
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getChild = function (index) {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getLastChild = function () {
        return (this.hasRightChild() ? this._rightChild : this._leftChild);
    };

    /**
     * @function
     * @param {Number} index
     * @param {karbonator.collection.RbTreeSet.Node} pNode
     */
    RbTreeSet.Node.prototype.setChild = function (index, pNode) {
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
    RbTreeSet.Node.prototype.getChildCount = function () {
        return (this.hasLeftChild() ? 1 : 0)
            + (this.hasRightChild() ? 1 : 0)
        ;
    };

    /**
     * @function
     * @return {Number}
     */
    RbTreeSet.Node.prototype.getNonNilChildCount = function () {
        return (this.hasNonNilLeftChild() ? 1 : 0)
            + (this.hasNonNilRightChild() ? 1 : 0)
        ;
    };

    /**
     * @function
     * @return {Number}
     */
    RbTreeSet.Node.prototype.getLevel = function () {
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
    RbTreeSet.Node.prototype.isLeaf = function () {
        return !this.hasLeftChild() && !this.hasRightChild();
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.isNonNilLeaf = function () {
        return !this.hasNonNilLeftChild()
            && !this.hasNonNilRightChild()
        ;
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.hasLeftChild = function () {
        return this._leftChild !== null;
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.hasRightChild = function () {
        return this._rightChild !== null;
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.hasNonNilLeftChild = function () {
        return this.hasLeftChild() && !this._leftChild.isNil();
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Node.prototype.hasNonNilRightChild = function () {
        return this.hasRightChild() && !this._rightChild.isNil();
    };

    /**
     * @function
     * @return {Function}
     */
    RbTreeSet.Node.prototype.getChildSlot = function () {
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
    RbTreeSet.Node.prototype.getChildSlotIndex = function () {
        return (
            (this._parent !== null)
            ? (this === this._parent._leftChild ? 0 : 1)
            : 2
        );
    };

    /**
     * @function
     */
    RbTreeSet.Node.prototype.rotateLeft = function () {
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
        if(pLeftChildOfRightChild !== RbTreeSet.Node.nil) {
            pLeftChildOfRightChild._parent = this;
        }
    };

    /**
     * @function
     */
    RbTreeSet.Node.prototype.rotateRight = function () {
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
        if(pRightChildOfLeftChild !== RbTreeSet.Node.nil) {
            pRightChildOfLeftChild._parent = this;
        }
    };

    /**
     * @function
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.findLeftMostNode = function () {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.findRightMostNode = function () {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.findLeftSubTreeRootNode = function () {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.findRightSubTreeRootNode = function () {
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
    RbTreeSet.Node.prototype.traverseNonNilNodesByPostorder = function (handler) {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getGreater = function () {
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
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.Node.prototype.getLess = function () {
        var less = null;

        if(this.hasNonNilLeftChild()) {
            less = this._leftChild.findRightMostNode();
        }
        else {
            var rstRoot = this.findRightSubTreeRootNode();
            if(rstRoot !== null) {
                less = rstRoot._parent;
            }
        }

        return less;
    };
    
    /*////////////////////////////////*/
    
    /**
     * @memberof karbonator.collection.RbTreeSet
     * @readonly
     * @enum {Number}
     */
    RbTreeSet.SearchTarget = {
        less : 0,
        lessOrEqual : 1,
        greater : 2,
        greaterOrEqual : 3,
        equal : 4
    };
    
    /**
     * @memberof karbonator.collection.RbTreeSet
     * @constructor
     * @function
     * @param {karbonator.collection.RbTreeSet} tree
     * @param {karbonator.collection.RbTreeSet.Node} node
     */
    RbTreeSet.Iterator = function (tree, node) {
        this._tree = tree;
        this._node = node;
    };
    
    /**
     * @function
     * @param {karbonator.collection.RbTreeSet.Iterator} rhs
     * @return {Boolean}
     */
    RbTreeSet.Iterator.prototype[karbonator.equals] = function (rhs) {
        return this._tree === rhs._tree
            && this._node === rhs._node
        ;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.Iterator.prototype.moveToNext = function () {
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
    RbTreeSet.Iterator.prototype.moveToPrevious = function () {
        var result = true;

        if(this._node === null) {
            this._node = this._tree._root.findRightMostNode();
        }
        else {
            var lesser = this._node.getLess();
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
    RbTreeSet.Iterator.prototype.dereference = function () {
        if(this._node === null) {
            throw new Error("Cannot deference an iterator pointing the end of container.");
        }

        return this._node._element;
    };

    /**
     * @function
     * @return {karbonator.collection.RbTreeSet.Iterator}
     */
    RbTreeSet.prototype.begin = function () {
        return new RbTreeSet.Iterator(
            this,
            (this._root !== null ? this._root.findLeftMostNode() : null)
        );
    };

    /**
     * @function
     * @return {karbonator.collection.RbTreeSet.Iterator}
     */
    RbTreeSet.prototype.end = function () {
        return new RbTreeSet.Iterator(this, null);
    };

    /**
     * @function
     * @return {Number}
     */
    RbTreeSet.prototype.getElementCount = function () {
        return this._elementCount;
    };

    /**
     * @function
     * @return {Boolean}
     */
    RbTreeSet.prototype.isEmpty = function () {
        return this._root === null;
    };

    /**
     * @function
     * @param {Object} element
     * @param {Number} searchTarget
     * @return {karbonator.collection.RbTreeSet.Iterator}
     */
    RbTreeSet.prototype.find = function (element, searchTarget) {
        return new RbTreeSet.Iterator(this, this._findNode(element, searchTarget));
    };

    /**
     * @function
     * @param {Object} element
     * @return {karbonator.collection.RbTreeSet.Iterator}
     */
    RbTreeSet.prototype.insert = function (element) {
        var insertedNode = this._insertNodeInBst(element);
        if(insertedNode !== null) {
            ++this._elementCount;
            this._rebalanceAfterInsertion(insertedNode);
        }

        return new RbTreeSet.Iterator(this, insertedNode);
    };

    /**
     * @function
     * @param {Object} element
     * @return {Boolean}
     */
    RbTreeSet.prototype.remove = function (element) {
        var pTarget = this._findNode(element, RbTreeSet.SearchTarget.equal);
        var targetFound = pTarget !== null;
        if(targetFound) {
            --this._elementCount;

            var info = this._disconnectNodeFromBst(pTarget);

            var pTempNilNode = null;
            if(info.pReplacement === RbTreeSet.Node.nil) {
                pTempNilNode = this._constructNode(info.pParentOfReplacement, null);
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
                this._rebalanceAfterRemoval(info.pReplacement, info.pParentOfReplacement);
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
            this._destructNode(info.pRemovalTarget);
            if(pTempNilNode !== null) {
                pTempNilNode._parent = null;
                this._destructNode(pTempNilNode);
                if(info.pParentOfReplacement !== null) {
                    info.pReplacementChildSlot.call(info.pParentOfReplacement, RbTreeSet.Node.nil);
                }
            }
        }

        return targetFound;
    };
    
    /**
     * @function
     */
    RbTreeSet.prototype.removeAll = function () {
        if(!this.isEmpty()) {
            this._root.traverseNonNilNodesByPostorder(
                RbTreeSet._traversalHandlerOfRemoveAll,
                this
            );

            this._root = null;
            this._elementCount = 0;
        }
    };
    
    /**
     * @function
     * @return {String}
     */
    RbTreeSet.prototype.toString = function () {
        var str = detail._colStrBegin;
        
        var iter = this.begin();
        var endIter = this.end();
        if(!iter[karbonator.equals](endIter)) {
            str += iter.dereference();
            iter.moveToNext();
        }
        
        for(; !iter[karbonator.equals](endIter); iter.moveToNext()) {
            str += _colStrSeparator;
            str += iter.dereference();
        }
        
        str += detail._colStrEnd;
        
        return str;
    };
    
    /**
     * @memberof karbonator.collection.RbTreeSet
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} node
     */
    RbTreeSet._traversalHandlerOfRemoveAll = function (node) {
        this._destructNode(node);
    };
    
    /**
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} parent
     * @param {Object} element
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.prototype._constructNode = function (parent, element) {
        var node = null;
        if(this._garbageNodes.length < 1) {
            node = new RbTreeSet.Node(parent, RbTreeSet.Node.nil, RbTreeSet.Node.nil, element, true);
        }
        else {
            node = this._garbageNodes.pop();
            RbTreeSet.Node.call(node, parent, RbTreeSet.Node.nil, RbTreeSet.Node.nil, element, true);
        }

        return node;
    };

    /**
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} node
     * @param {Boolean} [pushToGarbageList=true]
     */
    RbTreeSet.prototype._destructNode = function (node) {
        node._element =
        node._parent =
        node._leftChild =
        node._rightChild =
        node._red = undefined;

        if(typeof(arguments[2]) === "undefined" || !!arguments[2]) {
            this._garbageNodes.push(node);
        }
    };

    /**
     * @private
     * @function
     * @param {Object} element
     * @param {Number} searchTarget
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.prototype._findNode = function (element, searchTarget) {
        var pElementKey = this._keyGetter(element);
        var pCurrent = this._root, pPrevious = null;
        for(; pCurrent !== null && !pCurrent.isNil(); ) {
            var pCurrentElementKey = this._keyGetter(pCurrent._element);
            var compResult = this._comparator(pElementKey, pCurrentElementKey);
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

        switch(searchTarget) {
        case RbTreeSet.SearchTarget.less:
            if(null === pCurrent || pCurrent.isNil()) {
                pCurrent = pPrevious;
            }

            while(
                null !== pCurrent && !pCurrent.isNil()
                && this._comparator(this._keyGetter(pCurrent._element), pElementKey) >= 0
            ) {
                pCurrent = pCurrent.getLess();
            }
        break;
        case RbTreeSet.SearchTarget.lessOrEqual:
            if(null !== pCurrent && !pCurrent.isNil()) {
                return pCurrent;
            }
            else {
                if(null === pCurrent || pCurrent.isNil()) {
                    pCurrent = pPrevious;
                }

                while(
                    null !== pCurrent && !pCurrent.isNil()
                    && this._comparator(this._keyGetter(pCurrent._element), pElementKey) >= 0
                ) {
                    pCurrent = pCurrent.getLess();
                }
            }
        break;
        case RbTreeSet.SearchTarget.greater:
            if(null === pCurrent || pCurrent.isNil()) {
                pCurrent = pPrevious;
            }

            while(
                null !== pCurrent && !pCurrent.isNil()
                && this._comparator(pElementKey, this._keyGetter(pCurrent._element)) >= 0
            ) {
                pCurrent = pCurrent.getGreater();
            }
        break;
        case RbTreeSet.SearchTarget.greaterOrEqual:
            if(null !== pCurrent && !pCurrent.isNil()) {
                return pCurrent;
            }
            else {
                if(null === pCurrent || pCurrent.isNil()) {
                    pCurrent = pPrevious;
                }

                while(
                    null !== pCurrent && !pCurrent.isNil()
                    && this._comparator(pElementKey, this._keyGetter(pCurrent._element)) >= 0
                ) {
                    pCurrent = pCurrent.getGreater();
                }
            }
        break;
        case RbTreeSet.SearchTarget.equal:
        break;
        default:
            throw new Error("An unknown search target has been detected.");
        }

        return (pCurrent !== null && !pCurrent.isNil() ? pCurrent : null);

//        var pFoundNode = null;
//        if(
//            searchTarget >= RbTreeSet.SearchTarget.greater
//            && pPrevious !== null
//            && !pPrevious.isNil()
//            && this._comparator(this._keyGetter(pPrevious._element), pElementKey) < 0
//        ) {
//            pPrevious = pPrevious.getGreater();
//        }
//        switch(searchTarget) {
//        case RbTreeSet.SearchTarget.equal:
//            pFoundNode = (pCurrent !== null && !pCurrent.isNil() ? pCurrent : null);
//        break;
//        case RbTreeSet.SearchTarget.greater:
//            pFoundNode = (pPrevious !== null && !pPrevious.isNil() ? pPrevious : null);
//        break;
//        case RbTreeSet.SearchTarget.greaterOrEqual:
//            pFoundNode = (pCurrent !== null && !pCurrent.isNil() ? pCurrent : pPrevious);
//        break;
//        default:
//            throw new Error("An unknown search target has been detected.");
//        }
//
//        return pFoundNode;
    };

    /**
     * @private
     * @function
     * @param {Object} element
     * @return {karbonator.collection.RbTreeSet.Node}
     */
    RbTreeSet.prototype._insertNodeInBst = function (element) {
        var newNode = null;

        if(this._root === null) {
            newNode = this._constructNode(null, element);
            this._root = newNode;
        }
        else {
            var pElementKey = this._keyGetter(element);
            for(
                var pCurrent = this._root;
                !pCurrent.isNil();
            ) {
                var pCurrentElementKey = this._keyGetter(pCurrent._element);
                var compResult = this._comparator(pElementKey, pCurrentElementKey);
                if(compResult < 0) {
                    if(pCurrent._leftChild === RbTreeSet.Node.nil) {
                        newNode = this._constructNode(pCurrent, element);
                        pCurrent._leftChild = newNode;

                        pCurrent = RbTreeSet.Node.nil;
                    }
                    else {
                        pCurrent = pCurrent._leftChild;
                    }
                }
                else if(compResult > 0) {
                    if(pCurrent._rightChild === RbTreeSet.Node.nil) {
                        newNode = this._constructNode(pCurrent, element);
                        pCurrent._rightChild = newNode;

                        pCurrent = RbTreeSet.Node.nil;
                    }
                    else {
                        pCurrent = pCurrent._rightChild;
                    }
                }
                else {
                    pCurrent = RbTreeSet.Node.nil;
                }
            }
        }

        return newNode;
    };

    /**
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} target
     * @return {Object}
     */
    RbTreeSet.prototype._disconnectNodeFromBst = function (target) {
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

            //this._destructElement(target._element);
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
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} insertedNode
     */
    RbTreeSet.prototype._rebalanceAfterInsertion = function (insertedNode) {
        if(insertedNode.isNonNilRoot()) {
            insertedNode._red = false;
        }
        else for(
            var pCurrent = insertedNode;
            pCurrent !== null;
        ) {
            var pParent = pCurrent._parent;
            if(pParent._red) {
                var pUncle = pParent.getSibling();
                if(pUncle !== RbTreeSet.Node.nil && pUncle._red) {
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
                        this._root = pGrandParentOfTarget._parent;
                    }

                    pCurrent = null;
                }
            }
            else {
                pCurrent = null;
            }
        }
    };
    
    /**
     * @private
     * @function
     * @param {karbonator.collection.RbTreeSet.Node} replacement
     * @param {karbonator.collection.RbTreeSet.Node} pParentOfReplacement
     */
    RbTreeSet.prototype._rebalanceAfterRemoval = function (replacement, pParentOfReplacement) {
        if(replacement._red) {
            replacement._red = false;
        }
        else for(
            var pCurrent = replacement, pParentOfCurrent = pParentOfReplacement;
            pCurrent !== null;
        ) {
            if(pParentOfCurrent === null) {
                this._root = pCurrent;

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
    };
    
    collection.RbTreeSet = RbTreeSet;
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////*/
    //TreeSet
    
    /**
     * @memberof karbonator.collection
     * @constructor
     * @param {karbonator.comparator} comparator
     * @param {iterable} [iterable]
     */
    var TreeSet = function (comparator) {
        this._comparator = comparator;
        this._rbTreeSet = new RbTreeSet(comparator);
        
        if(!karbonator.isUndefined(arguments[1])) {
            _setConcatenateAssign(this, arguments[1]);
        }
    };
    
    /**
     * @memberof karbonator.collection.TreeSet
     * @constructor
     * @param {karbonator.collection.TreeSet} set
     */
    TreeSet.PairIterator = function (set) {
        this._iter = set._rbTreeSet.begin();
        this._end = set._rbTreeSet.end();
    };
    
    /**
     * @function
     * @return {Object}
     */
    TreeSet.PairIterator.prototype.next = function () {
        var done = this._iter[karbonator.equals](this._end);
        var value = (!done ? this._iter.dereference() : undefined);
        var out = {
            value : (value ? [value, value] : undefined),
            done : done
        };

        this._iter.moveToNext();

        return out;
    };
    
    /**
     * @memberof karbonator.collection.TreeSet
     * @constructor
     * @param {karbonator.collection.TreeSet} set
     */
    TreeSet.ValueIterator = function (set) {
        this._iter = set._rbTreeSet.begin();
        this._end = set._rbTreeSet.end();
    };
    
    /**
     * @function
     * @return {Object}
     */
    TreeSet.ValueIterator.prototype.next = function () {
        var done = this._iter[karbonator.equals](this._end);
        var out = {
            value : (!done ? this._iter.dereference() : undefined),
            done : done
        };

        this._iter.moveToNext();

        return out;
    };
    
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
        return !this._rbTreeSet.find(value, RbTreeSet.SearchTarget.equal)[karbonator.equals](this._rbTreeSet.end());
    };
    
    /**
     * TODO : 코드 검증
     * @function
     * @param {Object} value
     * @return {Object|undefined}
     */
    TreeSet.prototype.findLessThan = function (value) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(value, RbTreeSet.SearchTarget.less);
        if(!iter[karbonator.equals](endIter)) {
            return iter.dereference();
        }
    };
    
    /**
     * TODO : 코드 검증
     * @function
     * @param {Object} value
     * @return {Object|undefined}
     */
    TreeSet.prototype.findNotGreaterThan = function (value) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(value, RbTreeSet.SearchTarget.lessOrEqual);
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
        var iter = this._rbTreeSet.find(value, RbTreeSet.SearchTarget.greater);
        if(!iter[karbonator.equals](endIter)) {
            return iter.dereference();
        }
    };
    
    /**
     * @function
     * @param {Object} value
     * @return {Object|undefined}
     */
    TreeSet.prototype.findNotLessThan = function (value) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(value, RbTreeSet.SearchTarget.greaterOrEqual);
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
     * @return {karbonator.collection.TreeSet.PairIterator}
     */
    TreeSet.prototype.entries = function () {
        return new TreeSet.PairIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeSet.ValueIterator}
     */
    TreeSet.prototype.keys = function () {
        return new TreeSet.ValueIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeSet.ValueIterator}
     */
    TreeSet.prototype.values = function () {
        return new TreeSet.ValueIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeSet.ValueIterator}
     */
    TreeSet.prototype[Symbol.iterator] = function () {
        return new TreeSet.ValueIterator(this);
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
    TreeSet.prototype.toString = function () {
        return this._rbTreeSet.toString();
    };
    
    collection.TreeSet = TreeSet;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //TreeMap
    
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
        this._rbTreeSet = new RbTreeSet(comparator, _treeMapKeyGetter);
        this._comparator = comparator;
        
        if(!karbonator.isUndefined(arguments[1])) {
            _mapConcatenateAssign(this, arguments[1]);
        }
    };
    
    /**
     * @memberof karbonator.collection.TreeMap
     * @constructor
     * @param {TreeMap} treeMap
     */
    TreeMap.PairIterator = function (treeMap) {
        this._iter = treeMap._rbTreeSet.begin();
        this._end = treeMap._rbTreeSet.end();
    };
    
    /**
     * @function
     * @return {Object}
     */
    TreeMap.PairIterator.prototype.next = function () {
        var out = {
            done : this._iter[karbonator.equals](this._end)
        };
        
        if(!out.done) {
            var pair = this._iter.dereference();
            out.value = [pair.key, pair.value];
            
            this._iter.moveToNext();
        }
        
        return out;
    };
    
    /**
     * @memberof karbonator.collection.TreeMap
     * @constructor
     * @param {TreeMap} treeMap
     */
    TreeMap.KeyIterator = function (treeMap) {
        this._iter = treeMap._rbTreeSet.begin();
        this._end = treeMap._rbTreeSet.end();
    };
    
    /**
     * @function
     * @return {Object}
     */
    TreeMap.KeyIterator.prototype.next = function () {
        var done = this._iter[karbonator.equals](this._end);
        var out = {
            value : (!done ? this._iter.dereference().key : undefined),
            done : done
        };
        
        this._iter.moveToNext();
        
        return out;
    };
    
    /**
     * @memberof karbonator.collection.TreeMap
     * @constructor
     * @param {TreeMap} treeMap
     */
    TreeMap.ValueIterator = function (treeMap) {
        this._iter = treeMap._rbTreeSet.begin();
        this._end = treeMap._rbTreeSet.end();
    };
    
    /**
     * @function
     * @return {Object}
     */
    TreeMap.ValueIterator.prototype.next = function () {
        var out = {
            done : this._iter[karbonator.equals](this._end)
        };
        
        if(!out.done) {
            out.value = this._iter.dereference().value;
            
            this._iter.moveToNext();
        }
        
        return out;
    };
    
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
     * @param {Object} [defaultValue]
     * @return {Object|undefined}
     */
    TreeMap.prototype.get = function (key) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.equal
        );
        var found = !iter[karbonator.equals](endIter);
        if(found) {
            return iter.dereference().value;
        }
        else if(arguments.length >= 2) {
            this.set(key, arguments[1]);
            
            return arguments[1];
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
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.equal
        );
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
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.equal
        );
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
        return !this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.equal
        )[karbonator.equals](this._rbTreeSet.end());
    };
    
    /**
     * TODO : 코드 검증
     * @function
     * @param {Object} key
     * @return {Object|undefined}
     */
    TreeMap.prototype.findLessThan = function (key) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.less
        );
        if(!iter[karbonator.equals](endIter)) {
            var pair = iter.dereference();
            return {
                key : pair.key,
                value : pair.value
            };
        }
    };
    
    /**
     * TODO : 코드 검증
     * @function
     * @param {Object} key
     * @return {Object|undefined}
     */
    TreeMap.prototype.findNotGreaterThan = function (key) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.lessOrEqual
        );
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
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.greater
        );
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
    TreeMap.prototype.findNotLessThan = function (key) {
        var endIter = this._rbTreeSet.end();
        var iter = this._rbTreeSet.find(
            {key : key},
            RbTreeSet.SearchTarget.greaterOrEqual
        );
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
     * @return {Object|undefined}
     */
    TreeMap.prototype.getLast = function () {
        if(this.getElementCount() > 0) {
            var endIter = this._rbTreeSet.end();
            var lastElemIter = this._rbTreeSet.end();
            lastElemIter.moveToPrevious();
            
            if(!lastElemIter[karbonator.equals](endIter)) {
                var pair = lastElemIter.dereference();
                return {
                    key : pair.key,
                    value : pair.value
                };
            }
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
     * @return {karbonator.collection.TreeMap.PairIterator}
     */
    TreeMap.prototype.entries = function () {
        return new TreeMap.PairIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeMap.PairIterator}
     */
    TreeMap.prototype[Symbol.iterator] = function () {
        return new TreeMap.PairIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeMap.KeyIterator}
     */
    TreeMap.prototype.keys = function () {
        return new TreeMap.KeyIterator(this);
    };
    
    /**
     * @function
     * @return {karbonator.collection.TreeMap.ValueIterator}
     */
    TreeMap.prototype.values = function () {
        return new TreeMap.ValueIterator(this);
    };
    
    /**
     * @function
     * @param {Object} key
     * @return {Boolean}
     */
    TreeMap.prototype.remove = function (key) {
        return this._rbTreeSet.remove({key : key});
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
    
    karbonator.collection.TreeMap = TreeMap;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListSet
    
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
    
    /**
     * @memberof karbonator.collection.ListSet
     * @constructor
     * @param {karbonator.collection.ListSet} listSet
     * @param {Number} [index = 0]
     */
    ListSet.ValueIterator = function (listSet) {
        this._listSet = listSet;
        this._index = detail._selectNonUndefined(arguments[1], 0);
    };

    /**
     * @function
     * @return {Object}
     */
    ListSet.ValueIterator.prototype.next = function () {
        var out = {
            done : this._index >= this._listSet.getElementCount()
        };

        if(!out.done) {
            out.value = this._listSet.getAt(this._index);

            ++this._index;
        }

        return out;
    };
    
    /**
     * @memberof karbonator.collection.ListSet
     * @constructor
     * @param {karbonator.collection.ListSet} listSet
     * @param {Number} [index = 0]
     */
    ListSet.PairIterator = function (listSet) {
        this._listSet = listSet;
        this._index = detail._selectNonUndefined(arguments[1], 0);
    };
    
    /**
     * @function
     * @return {Object}
     */
    ListSet.PairIterator.prototype.next = function () {
        var out = {
            done : this._index >= this._listSet.getElementCount()
        };
        
        if(!out.done) {
            var value = this._listSet.getAt(this._index);
            out.value = [value, value],
            
            ++this._index;
        }
        
        return out;
    };
    
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
     * @return {karbonator.collection.ListSet.PairIterator}
     */
    ListSet.prototype.entries = function () {
        return new ListSet.PairIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListSet.ValueIterator}
     */
    ListSet.prototype.keys = function () {
        return new ListSet.ValueIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListSet.ValueIterator}
     */
    ListSet.prototype.values = function () {
        return new ListSet.ValueIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListSet.ValueIterator}
     */
    ListSet.prototype[Symbol.iterator] = function () {
        return new ListSet.ValueIterator(this);
    };

    /**
     * @function
     * @param {Object} element
     * @return {Boolean}
     */
    ListSet.prototype.has = function (element) {
        return this.indexOf(element) >= 0;
    };
    
    /**
     * @function
     * @param {Function} callback
     * @param {Object} [thisArg]
     * @return {Number}
     */
    ListSet.prototype.findIndex = function (callback) {
        return this._elements.findIndex(callback, arguments[1]);
    };
    
    /**
     * @function
     * @param {Object} element
     * @param {karbonator.comparator} [comparator]
     * @return {Number}
     */
    ListSet.prototype.indexOf = function (element) {
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
        return this.removeAt(this.indexOf(element));
    };
    
    /**
     * @function
     * @param {Object} element
     * @return {Boolean}
     */
    ListSet.prototype["delete"] = function (element) {
        return this.removeAt(this.indexOf(element));
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
    ListSet.prototype.toString = function () {
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
    
    collection.ListSet = ListSet;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListMap
    
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
    
    /**
     * @memberof karbonator.collection.ListMap
     * @function
     * @param {ListMap} listMap
     * @param {Number} [index = 0]
     */
    ListMap.PairIterator = function (listMap) {
        this._listMap = listMap;
        this._index = detail._selectNonUndefined(arguments[1], 0);
    };
    
    /**
     * @function
     * @return {Object}
     */
    ListMap.PairIterator.prototype.next = function () {
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

    /**
     * @memberof karbonator.collection.ListMap
     * @function
     * @param {ListMap} listMap
     * @param {Number} [index = 0]
     */
    ListMap.KeyIterator = function (listMap) {
        this._listMap = listMap;
        this._index = detail._selectNonUndefined(arguments[1], 0);
    };

    /**
     * @function
     * @return {Object}
     */
    ListMap.KeyIterator.prototype.next = function () {
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

    /**
     * @memberof karbonator.collection.ListMap
     * @function
     * @param {ListMap} listMap
     * @param {Number} [index = 0]
     */
    ListMap.ValueIterator = function (listMap) {
        this._listMap = listMap;
        this._index = detail._selectNonUndefined(arguments[1], 0);
    };

    /**
     * @function
     * @return {Object}
     */
    ListMap.ValueIterator.prototype.next = function () {
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
     * @param {Number} index
     * @return {Object}
     */
    ListMap.prototype.getAt = function (index) {
        if(!karbonator.isNonNegativeSafeInteger(index)) {
            throw new TypeError("'index' must be a non-negative safe integer.");
        }
        else if(index >= this._pairs.length) {
            throw new RangeError("'index' must be in range [0, " + this._pairs.length + ")");
        }
        var pair = this._pairs[index];
        
        return ({
            key : pair.key,
            value : pair.value
        });
    };

    /**
     * @function
     * @param {Object} key
     * @param {Object} [defaultValue]
     * @return {Object|undefined}
     */
    ListMap.prototype.get = function (key) {
        var index = this.indexOf(key);
        if(index >= 0) {
            return this._pairs[index].value;
        }
        else if(arguments.length >= 2) {
            this.set(key, arguments[1]);

            return arguments[1];
        }
    };

    /**
     * @function
     * @param {Object} key
     * @param {Object} value
     * @return {ListMap}
     */
    ListMap.prototype.set = function (key, value) {
        var index = this.indexOf(key);
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
        var index = this.indexOf(key);
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
        return this.indexOf(key) >= 0;
    };

    /**
     * @function
     * @param {Function} callback
     * @param {Object} [thisArg]
     * @return {Number}
     */
    ListMap.prototype.findIndex = function (callback) {
        return this._elements.findIndex(callback, arguments[1]);
    };

    /**
     * @function
     * @param {Object} key
     * @return {Number}
     */
    ListMap.prototype.indexOf = function (key) {
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
     * @return {karbonator.collection.ListMap.PairIterator}
     */
    ListMap.prototype.entries = function () {
        return new ListMap.PairIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListMap.PairIterator}
     */
    ListMap.prototype[Symbol.iterator] = function () {
        return new ListMap.PairIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListMap.KeyIterator}
     */
    ListMap.prototype.keys = function () {
        return new ListMap.KeyIterator(this);
    };

    /**
     * @function
     * @return {karbonator.collection.ListMap.ValueIterator}
     */
    ListMap.prototype.values = function () {
        return new ListMap.ValueIterator(this);
    };

    /**
     * @function
     * @param {Object} key
     * @return {Boolean}
     */
    ListMap.prototype.remove = function (key) {
        var index = this.indexOf(key);
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

    collection.ListMap = ListMap;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //PriorityQueue
    
    /**
     * @memberof karbonator.collection
     * @constructor
     * @param {karbonator.comparator} comparator
     * @param {Boolean} [allowDuplicate=false]
     */
    var PriorityQueue = function (comparator) {
        if(!karbonator.isComparator(comparator)) {
            throw new TypeError("'comparator' must satisfy 'karbonator.comparator'.");
        }
        
        this._comp = comparator;
        this._allowDuplicate = !!arguments[1];
        this._elemCount = 0;
        this._nodes = [null];
    };
    
    /**
     * @memberof karbonator.collection.PriorityQueue
     * @readonly
     */
    PriorityQueue._rootIndex = 1;
    
    /**
     * 
     * @param {Object} iterable
     * @param {Function} [mapFunc]
     * @param {Object} [thisArg]
     * @returns {karbonator.collection.PriorityQueue}
     */
    PriorityQueue.from = function (iterable) {
        if(!karbonator.isEsIterable(iterable)) {
            throw new TypeError("'iterable' must have the property 'Symbol.iterator'.");
        }
        
        var queue = new ListQueue();
        
        var mapFunc = arguments[1];
        if(karbonator.isUndefined(mapFunc)) {
            for(
                var i = iterable[Symbol.iterator](), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                queue.enqueue(iP.value);
            }
        }
        else {
            if(!karbonator.isFunction(mapFunc)) {
                throw new TypeError("'mapFunc' must be a function.");
            }
            var thisArg = arguments[2];
            
            for(
                var i = iterable[Symbol.iterator](), iP = i.next();
                !iP.done;
                iP = i.next()
            ) {
                queue.enqueue(mapFunc.call(thisArg, iP.value));
            }
        }
        
        return queue;
    };
    
    /**
     * @function
     * @return {Number}
     */
    PriorityQueue.prototype.getElementCount = function () {
        return this._elemCount;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    PriorityQueue.prototype.isEmpty = function () {
        return this._elemCount < 1;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    PriorityQueue.prototype.isFull = function () {
        return this._elemCount >= Number.MAX_SAFE_INTEGER;
    };
    
    /**
     * @function
     * @return {iterator}
     */
//    PriorityQueue.prototype[Symbol.iterator] = function () {
//        
//    };
    
    /**
     * @function
     * @return {Object}
     */
    PriorityQueue.prototype.peek = function () {
        if(this.isEmpty()) {
            throw new Error("The queue has no element.");
        }
        
        return this._nodes[PriorityQueue._rootIndex];
    };
    
    /**
     * @function
     * @param {Object} e
     * @return {karbonator.collection.ListQueue}
     */
    PriorityQueue.prototype.enqueue = function (e) {
        if(this.isFull()) {
            throw new Error("The queue is full.");
        }
        
        if(
            this._allowDuplicate
            || this._nodes.findIndex(
                function (elem) {
                    return null !== elem && this._comp(elem, e) === 0;
                },
                this
            ) < 0
        ) {
            this._nodes.push(e);
            ++this._elemCount;
            
            this._constructHeapBottomUp(this._elemCount);
        }
        
        return this;
    };
    
    /**
     * @function
     * @return {Object}
     */
    PriorityQueue.prototype.dequeue = function () {
        if(this.isEmpty()) {
            throw new Error("The queue has no element.");
        }
        
        var rootNdx = PriorityQueue._rootIndex;
	    var elem = this._nodes[rootNdx];
        this._nodes[rootNdx] = this._nodes[this._elemCount];
        --this._elemCount;
        
        this._constructHeapTopDown(rootNdx);
        
        this._nodes.pop();
        
        return elem;
    };
    
    /**
     * @function
     */
    PriorityQueue.prototype.clear = function () {
        this._nodes = [null];
        this._elemCount = 0;
    };
    
    /**
     * @function
     * @return {String}
     */
    PriorityQueue.prototype.toString = function () {
        var str = '[';
        
        var iter = this[Symbol.iterator]();
        var pair = iter.next();
        if(!pair.done) {
            str += pair.value;
        }
        
        for(pair = iter.next(); !pair.done; pair = iter.next()) {
            str += ", ";
            str += pair.value;
        }
        
        str += ']';
        
        return str;
    };
    
    /**
     * @private
     * @function
     * @param {Number} targetIndex
     */
    PriorityQueue.prototype._constructHeapBottomUp = function (targetIndex) {
        var parentNdx = 0;
        var target = this._nodes[targetIndex];
        
        while(targetIndex > 0) {
            parentNdx = targetIndex >> 1;
            if(parentNdx === 0) {
                break;
            }
            
            if(this._comp(this._nodes[parentNdx], target) > 0) {
                this._nodes[targetIndex] = this._nodes[parentNdx];
                
                targetIndex = parentNdx;
            }
            else {
                break;
            }
        }
        
        this._nodes[targetIndex] = target;
    };
    
    /**
     * @private
     * @function
     * @param {Number} targetIndex
     */
    PriorityQueue.prototype._constructHeapTopDown = function (targetIndex) {
        var childNdx = 0;
        var target = this._nodes[targetIndex];
        
        for(; ; ) {
            childNdx = targetIndex << 1;
            if(childNdx > this._elemCount) {
                break;
            }
            
            if(
                childNdx + 1 <= this._elemCount
                && this._comp(this._nodes[childNdx], this._nodes[childNdx + 1]) > 0
            ) {
                ++childNdx;
            }
            
            if(this._comp(target, this._nodes[childNdx]) > 0) {
                this._nodes[targetIndex] = this._nodes[childNdx];
                
                targetIndex = childNdx;
            }
            else {
                break;
            }
        }
        
        //타겟의 위치 확정
        this._nodes[targetIndex] = target;
    };
    
    collection.PriorityQueue = PriorityQueue;
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
