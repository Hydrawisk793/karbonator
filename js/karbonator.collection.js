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
        define(["./karbonator.core"], function (core) {
            return moduleFactory(g, core);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {        
        exports = module.exports = moduleFactory(g, require("./karbonator.core"));
    }
}(
(function (global, karbonator) {
    /**
     * @memberof karbonator
     * @namespace
     */
    var collection = karbonator.collection || {};
    karbonator.collection = collection;
    
    var defaultArrayLikeObjectWrapper = {
        get : function (arr, index) {
            return arr[index];
        },
        
        getLength : function (arr) {
            return arr.length;
        },
        
        removeAt : function (arr, index) {
            return Array.prototype.splice.call(arr, index, 1);
        },
        
        equals : function (lhs, rhs) {
            return lhs === rhs;
        }
    };
    
    /**
     * @memberof karbonator.collection
     * @function
     * @param {Array} arr
     * @param {Object} callbacks
     * @return {Array}
     */
    collection.removeDuplicates = function (arr, callbacks) {
        callbacks = karbonator.selectNonUndefined(
            callbacks,
            defaultArrayLikeObjectWrapper
        );
        
        for(var i = 0; i < callbacks.getLength(arr); ++i) {
            var lhs = callbacks.get(arr, i);
            
            for(var j = i + 1; j < getLength(arr); ) {
                var rhs = callbacks.get(arr, j);
                if(callbacks.equals(lhs, rhs)) {
                    callbacks.removeAt(arr, j);
                }
                else {
                    ++j;
                }
            }
        }
        
        return arr;
    };
    
    /*////////////////////////////////*/
    //RbTreeSetBase
    
    var RbTreeSetBase = (function () {
        /**
         * @constructor
         * @param {Function} lessComparator
         */
        var RbTreeSetBase = function (lessComparator) {
            this._elementCount = 0;
            this._root = null;
            
            if(arguments.length >= 0) {
                this._lessComparator = (
                    typeof(lessComparator === "function")
                    ? lessComparator
                    : RbTreeSetBase._lessComparator
                );
            }
            else {
                this._lessComparator = RbTreeSetBase._lessComparator;
            }
        };
        
        /**
         * @private
         * @function
         * @param {Object} lhsKey
         * @param {Object} rhsKey
         * @return {Boolean}
         */
        RbTreeSetBase._lessComparator = function (lhsKey, rhsKey) {
            return lhsKey < rhsKey;
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
        
        RbTreeSetBase._Node = (function () {
            /**
             * @memberof {RbTreeSetBase}
             * @constructor
             * @function
             * @param {RbTreeSetBase._Node} parent
             * @param {RbTreeSetBase._Node} leftChild
             * @param {RbTreeSetBase._Node} rightChild
             * @param {Object} element
             * @param {Boolean} red
             */
            var _Node = function (parent, leftChild, rightChild, element, red) {
                this._parent = parent || null;
                this._leftChild = leftChild || null;
                this._rightChild = rightChild || null;
                this._element = element || null;
                this._red = red || false;
            };
            
            /**
             * @function
             * @param {RbTreeSetBase._Node} node
             * @return {RbTreeSetBase._Node}
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
             * @param {RbTreeSetBase._Node} node
             * @return {RbTreeSetBase._Node}
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
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getRoot = function () {
                var pRoot = this;
                for(
                    var pParent = pRoot._parent;
                    pParent != null;
                    pRoot = pParent, pParent = pRoot._parent
                );
                
                return pRoot;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getGrandParent = function () {
                return (this._parent != null ? this._parent._parent : null);        
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getUncle = function () {
                var pUncle = null;
                
                var pGrandParent = this.getGrandParent();
                if(pGrandParent != null) {
                    pUncle = (pGrandParent._leftChild == this._parent
                        ? pGrandParent._rightChild
                        : pGrandParent._leftChild
                    );
                }
        
                return pUncle;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getSibling = function (parent) {
                if(typeof(parent) === "undefined") {
                    return (
                        (this._parent != null)
                        ? (
                            this == this._parent._leftChild
                            ? this._parent._rightChild
                            : this._parent._leftChild
                            )
                        : null
                    );
                }
                else {
                    var pSibling = null;
                    if(this == parent._leftChild)
                    {
                        pSibling = parent._rightChild;
                    }
                    else if(this == parent._rightChild)
                    {
                        pSibling = parent._leftChild;
                    }
            
                    return pSibling;
                }
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNill = function () {
                return this._element === null;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNonNillRoot = function () {
                return this._parent == null && !this.isNill();
            };
            
            /**
             * @function
             * @param {Number} index
             * @return {RbTreeSetBase._Node}
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
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getLastChild = function () {
                return (this.hasRightChild() ? this._rightChild : this._leftChild);
            };
            
            /**
             * @function
             * @param {Number} index
             * @param {RbTreeSetBase._Node} pNode
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
                    if(pNode._parent != null) {
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
                    pCurrent != null;
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
                return this.hasLeftChild() && !this._leftChild.isNill();
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.hasNonNilRightChild = function () {
                return this.hasRightChild() && !this._rightChild.isNill();
            };
            
            /**
             * @function
             * @return {Function}
             */
            _Node.prototype.getChildSlot = function () {
                var pChildSlot = null;
                
                if(this._parent != null) {
                    if(this._parent._leftChild == this) {
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
                    (this._parent != null)
                    ? (this == this._parent._leftChild ? 0 : 1)
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
                if(pChildSlot != null) {
                    pChildSlot.call(pParent, this._rightChild);
                }
                
                this._rightChild = pLeftChildOfRightChild;
                if(pLeftChildOfRightChild != RbTreeSetBase._nilNode) {
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
                if(pChildSlot != null) {
                    pChildSlot.call(pParent, this._leftChild);
                }
                
                this._leftChild = pRightChildOfLeftChild;
                if(pRightChildOfLeftChild != RbTreeSetBase._nilNode) {
                    pRightChildOfLeftChild._parent = this;
                }
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.findLeftMostNode = function () {
                var pCurrent = this;
                for(
                    ;
                    pCurrent != null && pCurrent.hasNonNilLeftChild();
                    pCurrent = pCurrent._leftChild
                );
        
                return pCurrent;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.findRightMostNode = function () {
                var pCurrent = this;
                for(
                    ;
                    pCurrent != null && pCurrent.hasNonNilRightChild();
                    pCurrent = pCurrent._rightChild
                );
        
                return pCurrent;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.findLeftSubTreeRootNode = function () {
                var pCurrent = this;
                for(; pCurrent != null; ) {
                    var pParent = pCurrent._parent;
                    if(pParent == null || pCurrent == pParent._leftChild) {
                        break;
                    }
                    
                    pCurrent = pParent;
                }
                
                return pCurrent;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.findRightSubTreeRootNode = function () {
                var pCurrent = this;
                for(; pCurrent != null; ) {
                    var pParent = pCurrent._parent;
                    if(pParent == null || pCurrent == pParent._rightChild) {
                        break;
                    }
                    
                    pCurrent = pParent;
                }
                
                return pCurrent;
            };
            
            /**
             * @function
             * @param {Function} handler
             * @return {Boolean}
             */
            _Node.prototype.traverseNonNilNodesByPostorder = function (handler) {
                var nodeStack = [];
                nodeStack.push(this);
                
                var pLastTraversedNode = null;
                var continueTraversal = true;
                for(; continueTraversal && nodeStack.length > 0; ) {
                    var pCurrentNode = nodeStack[nodeStack.length - 1];
                    if(
                        !pCurrentNode.isLeaf()
                        && pCurrentNode.getLastChild() != pLastTraversedNode
                    ) {
                        if(pCurrentNode.hasRightChild()) {
                            nodeStack.push(pCurrentNode._rightChild);
                        }
        
                        if(pCurrentNode.hasLeftChild()) {
                            nodeStack.push(pCurrentNode._leftChild);
                        }
                    }
                    else {
                        if(!pCurrentNode.isNill()) {
                            continueTraversal = !handler(pCurrentNode);
                        }
                        pLastTraversedNode = pCurrentNode;
                        nodeStack.pop();
                    }
                }
                
                return continueTraversal;
            };
            
            /**
             * @function
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getGreater = function () {
                var pGreater = null;
                
                if(!this._rightChild.isNill()) {
                    pGreater = this._rightChild.findLeftMostNode();
                }
                else {
                    if(this._parent != null) {
                        if(this == this._parent._leftChild) {
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
             * @return {RbTreeSetBase._Node}
             */
            _Node.prototype.getLesser = function () {
                var pLesser = null;
                
                if(this.isNonNilLeaf()) {
                    if(this._parent != null) {
                        if(this == this._parent._leftChild) {
                            pLesser = this.findRightSubTreeRootNode()._parent;
                        }
                        else {
                            pLesser = this._parent;
                        }
                    }
                }
                else if(!this._leftChild.isNill()) {
                    pLesser = this._leftChild.findRightMostNode();
                }
                else {
                    pLesser = this._parent;
                }
                
                return pLesser;
            };
            
            return _Node;
        })();
        
        /**
         * @readonly
         */
        RbTreeSetBase._nilNode = new RbTreeSetBase._Node();
        
        RbTreeSetBase.IteratorBase = (function () {
            /**
             * @memberof {RbTreeSetBase}
             * @constructor
             * @function
             * @param {RbTreeSetBase} tree
             * @param {RbTreeSetBase._Node} node
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
            IteratorBase.prototype.equals = function (rhs) {
                return this._tree === rhs._tree && this._node === rhs._node;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            IteratorBase.prototype.moveToNext = function () {
                var result = this._node != null;
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
                
                if(this._node == null) {
                    this._node = this._tree._root.findRightMostNode();
                }
                else {
                    var lesser = this._node.getLesser();
                    result = lesser != null;
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
                if(this._node == null) {
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
        RbTreeSetBase.prototype.
        begin = function () {
            return new RbTreeSetBase.IteratorBase(
                this,
                (this._root != null ? this._root.findLeftMostNode() : null)
            );
        };
        
        /**
         * @function
         * @return {RbTreeSetBase.IteratorBase}
         */
        RbTreeSetBase.prototype.
        end = function () {
            return new RbTreeSetBase.IteratorBase(this, null);
        };
        
        /**
         * @function
         * @return {Number}
         */
        RbTreeSetBase.prototype.
        getElementCount = function () {
            return this._elementCount;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        RbTreeSetBase.prototype.
        isEmpty = function () {
            return this._elementCount < 1;
        };
        
        /**
         * @function
         * @param {Object} element
         * @param {Number} searchTarget
         * @return {RbTreeSetBase._Node}
         */
        RbTreeSetBase.prototype.
        find = function (element, searchTarget) {
            var pElementKey = this.getKeyFromElement(element);
            var pCurrent = this._root, pPrevious = null;
            for(; pCurrent != null && !pCurrent.isNill(); ) {
                var pCurrentElementKey = this.getKeyFromElement(pCurrent._element);
                if(this._lessComparator(pElementKey, pCurrentElementKey)) {
                    pPrevious = pCurrent;
                    pCurrent = pCurrent._leftChild;
                }
                else if(this._lessComparator(pCurrentElementKey, pElementKey)) {
                    pPrevious = pCurrent;
                    pCurrent = pCurrent._rightChild;
                }
                else {
                    break;
                }
            }
            
            var pResult = null;
            if(
                searchTarget >= RbTreeSetBase.SearchTarget.greater
                && pPrevious != null
                && !pPrevious.isNill()
                && this._lessComparator(this.getKeyFromElement(pPrevious._element), pElementKey)
            ) {
                pPrevious = pPrevious.getGreater();
            }
            switch(searchTarget) {
            case RbTreeSetBase.SearchTarget.equal:
                pResult = (pCurrent != null && !pCurrent.isNill() ? pCurrent : null);
            break;
            case RbTreeSetBase.SearchTarget.greater:
                pResult = (pPrevious != null && !pPrevious.isNill() ? pPrevious : null);
            break;
            case RbTreeSetBase.SearchTarget.greaterOrEqual:
                pResult = (pCurrent != null && !pCurrent.isNill() ? pCurrent : pPrevious);
            break;
            default:
                throw new Error("An unknown search target has been specified.");
            }
            
            return pResult;
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {RbTreeSetBase._Node}
         */
        RbTreeSetBase.prototype.
        insert = function (element) {
            var insertedNode = this._insertNodeInBinarySearchTree(element);
            if(insertedNode !== null) {
                ++this._elementCount;
                this._rebalanceAfterInsertion(insertedNode);
            }
            
            return insertedNode;
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        RbTreeSetBase.prototype.
        remove = function (element) {
            var pTarget = this.find(element, RbTreeSetBase.SearchTarget.equal);
            var targetFound = pTarget != null;
            if(targetFound) {
                --this._elementCount;
                
                var info = this._disconnectNodeFromBinarySearchTree(pTarget);
                
                var pTempNilNode = null;
                if(info.pReplacement == RbTreeSetBase._nilNode) {
                    pTempNilNode = this._constructNode(info.pParentOfReplacement, null);
                    pTempNilNode._red = false;
                    if(info.pParentOfReplacement != null) {
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
                    if(this._root == pTempNilNode) {
                        this._root = null;
                    }
                    else if(info.pReplacement.isNonNillRoot()) {
                        this._root = info.pReplacement;
                    }
                    else if(!this._root.isNonNillRoot()) {
                        this._root = this._root.getRoot();
                    }
                }
                
                info.pRemovalTarget._parent = null;
                //this._destructNode(info.pRemovalTarget);
                if(pTempNilNode != null) {
                    pTempNilNode._parent = null;
                    //this.destructNode(pTempNilNode);
                    if(info.pParentOfReplacement != null) {
                        info.pReplacementChildSlot.call(info.pParentOfReplacement, RbTreeSetBase._nilNode);
                    }
                }
            }
            
            return targetFound;
        };
        
        /**
         * @function
         */
        RbTreeSetBase.prototype.
        removeAll = function () {
            if(!this.isEmpty()) {
                this._root = null;
                this._elementCount = 0;
            }
        };
        
        /**
         * @function
         * 
         */
        RbTreeSetBase.prototype.
        getComparator = function () {
            return this._lessComparator;
        };
        
        /**
         * @function
         * @param {Function} comparator
         */
        RbTreeSetBase.prototype.
        setComparator = function (comparator) {
            this._lessComparator = comparator;
        };
        
        /**
         * @protected
         * @function
         * @param {Object} element
         */
        RbTreeSetBase.prototype.
        getKeyFromElement = function (element) {
            return element;
        };
        
        /**
         * @private
         * @function
         * @param {RbTreeSetBase._Node} parent
         * @param {Object} element
         * @return {RbTreeSetBase._Node}
         */
        RbTreeSetBase.prototype.
        _constructNode = function (parent, element) {
            return new RbTreeSetBase._Node(
                parent,
                RbTreeSetBase._nilNode,
                RbTreeSetBase._nilNode,
                element,
                true
            );
        };
        
        /**
         * @private
         * @function
         * @param {Object} element
         * @return {RbTreeSetBase._Node}
         */
        RbTreeSetBase.prototype.
        _insertNodeInBinarySearchTree = function (element) {
            var newNode = null;
            
            if(this._root == null) {
                newNode = this._constructNode(null, element);
                this._root = newNode;
            }
            else {
                var pElementKey = this.getKeyFromElement(element);
                for(
                    var pCurrent = this._root;
                    !pCurrent.isNill();
                ) {
                    var pCurrentElementKey = this.getKeyFromElement(pCurrent._element);
                    if(this._lessComparator(pElementKey, pCurrentElementKey)) {
                        if(pCurrent._leftChild == RbTreeSetBase._nilNode) {
                            newNode = this._constructNode(pCurrent, element);
                            pCurrent._leftChild = newNode;
                            
                            pCurrent = RbTreeSetBase._nilNode;
                        }
                        else {
                            pCurrent = pCurrent._leftChild;
                        }
                    }
                    else if(this._lessComparator(pCurrentElementKey, pElementKey)) {
                        if(pCurrent._rightChild == RbTreeSetBase._nilNode) {
                            newNode = this._constructNode(pCurrent, element);
                            pCurrent._rightChild = newNode;
                            
                            pCurrent = RbTreeSetBase._nilNode;
                        }
                        else {
                            pCurrent = pCurrent._rightChild;
                        }
                    }
                    else {
                        pCurrent = RbTreeSetBase._nilNode;
                    }
                }
            }
            
            return newNode;
        };
        
        /**
         * @private
         * @function
         * @param {RbTreeSetBase._Node} target
         * @return {Object}
         */
        RbTreeSetBase.prototype.
        _disconnectNodeFromBinarySearchTree = function (target) {
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
                if(pMaximumOfRightSubTree == null) {
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
            if(pTargetParent != null) {
                if(pTargetParent._leftChild == out.pRemovalTarget) {
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
            if(!pSelectedChildSlot.call(out.pRemovalTarget).isNill()) {
                pSelectedChildSlot.call(out.pRemovalTarget)._parent = pTargetParent;
            }
            
            return out;
        };
        
        /**
         * @private
         * @function
         * @param {RbTreeSetBase._Node} insertedNode
         */
        RbTreeSetBase.prototype.
        _rebalanceAfterInsertion = function (insertedNode) {
            if(insertedNode.isNonNillRoot()) {
                insertedNode._red = false;
            }
            else {
                for(
                    var pCurrent = insertedNode;
                    pCurrent != null;
                ) {
                    var pParent = pCurrent._parent;
                    if(pParent._red) {
                        var pUncle = pParent.getSibling();
                        if(pUncle != RbTreeSetBase._nilNode && pUncle._red) {
                            pParent._red = false;
                            pUncle._red = false;
                            
                            var pGrandParent = pParent._parent;
                            if(!pGrandParent.isNonNillRoot()) {
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
                                pTarget == pParent._rightChild
                                && pParent == pGrandParent._leftChild
                            ) {
                                pParent.rotateLeft();
                                pTarget = pTarget._leftChild;
                            }
                            else if(
                                pTarget == pParent._leftChild
                                && pParent == pGrandParent._rightChild
                            ) {
                                pParent.rotateRight();
                                pTarget = pTarget._rightChild;
                            }
                            
                            var pGrandParentOfTarget = pTarget.getGrandParent();
                            pTarget._parent._red = false;
                            pGrandParentOfTarget._red = true;
                            var isGrandParentRoot = pGrandParentOfTarget.isNonNillRoot();
                            if(pTarget == pTarget._parent._leftChild) {
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
            }
        };
        
        /**
         * @private
         * @function
         * @param {RbTreeSetBase._Node} replacement
         * @param {RbTreeSetBase._Node} pParentOfReplacement
         */
        RbTreeSetBase.prototype.
        _rebalanceAfterRemoval = function (replacement, pParentOfReplacement) {
            if(replacement._red) {
                replacement._red = false;
            }
            else {
                for(
                    var pCurrent = replacement, pParentOfCurrent = pParentOfReplacement;
                    pCurrent != null;
                ) {
                    if(pParentOfCurrent == null) {
                        this._root = pCurrent;
                        
                        pCurrent = null;
                    }
                    else {
                        var pSiblingOfCurrent = pCurrent.getSibling();
                        if(pSiblingOfCurrent._red) {
                            pParentOfCurrent._red = true;
                            pSiblingOfCurrent._red = false;
    
                            if(pSiblingOfCurrent == pParentOfCurrent._rightChild) {
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
                                    pCurrent == pParentOfCurrent._leftChild
                                    && pSiblingOfCurrent._leftChild._red
                                    && !pSiblingOfCurrent._rightChild._red
                                ) {
                                    pSiblingOfCurrent._red = true;
                                    pSiblingOfCurrent._leftChild._red = false;
    
                                    pSiblingOfCurrent.rotateRight();
                                }
                                else if(
                                    pCurrent == pParentOfCurrent._rightChild
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
                                    pCurrent == pParentOfCurrent._leftChild
                                    && pSiblingOfCurrent._rightChild._red
                                ) {
                                    pSiblingOfCurrent._rightChild._red = false;
                                    pParentOfCurrent.rotateLeft();
                                }
                                else if(
                                    pCurrent == pParentOfCurrent._rightChild
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
        
        return RbTreeSetBase;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //OrderedTreeSet
    
    collection.OrderedTreeSet = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {Function} lessComparator
         */
        var OrderedTreeSet = function (lessComparator) {
            RbTreeSetBase.apply(this, arguments);
            
            this.size = 0;
        };
        OrderedTreeSet.prototype = new RbTreeSetBase();
        OrderedTreeSet.prototype.constructor = OrderedTreeSet;
        
        OrderedTreeSet.ValueIterator = (function () {
            /**
             * @memberof karbonator.collection.OrderedTreeSet
             * @constructor
             * @param {karbonator.collection.OrderedTreeSet} set
             */
            var ValueIterator = function (set) {
                this._iter = set.begin();
                this._end = set.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._iter.equals(this._end);
                var out = {
                    value : (!done ? this._iter.dereference() : undefined),
                    done : done
                };
                
                this._iter.moveToNext();
                
                return out;
            };
            
            return ValueIterator;
        })();
        
        OrderedTreeSet.PairIterator = (function () {
            /**
             * @memberof karbonator.collection.OrderedTreeSet
             * @constructor
             * @param {karbonator.collection.OrderedTreeSet} set
             */
            var PairIterator = function (set) {
                this._iter = set.begin();
                this._end = set.end();
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var done = this._iter.equals(this._end);
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
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype.has = function (value) {
            return this.find(value, RbTreeSetBase.SearchTarget.equal) != null;
        };
        
        /**
         * @function
         * @return {karbonator.collection.OrderedTreeSet.PairIterator}
         */
        OrderedTreeSet.prototype.entries = function () {
            return new this.constructor.PairIterator(this);
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         */
        OrderedTreeSet.prototype.forEach = function (callback, thisArg) {
            for(
                var end = this.end(), iter = this.begin();
                !iter.equals(end);
                iter.moveToNext()
            ) {
                var value = iter.dereference();
                callback.call(thisArg, value, value, this);
            }
        };
            
        /**
         * @function
         * @return {karbonator.collection.OrderedTreeSet.ValueIterator}
         */
        OrderedTreeSet.prototype.keys = function () {
            return new this.constructor.ValueIterator(this);
        };
        
        /**
         * @function
         * @return {karbonator.collection.OrderedTreeSet.ValueIterator}
         */
        OrderedTreeSet.prototype.values = OrderedTreeSet.prototype.keys;
        
        OrderedTreeSet.prototype[global.Symbol.iterator] = OrderedTreeSet.prototype.values;
        
        /**
         * @function
         * @param {Object} value
         */
        OrderedTreeSet.prototype.add = function (value) {
            this.insert(value);
            this.size = this._elementCount;
            
            return this;
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype.remove = function (value) {
            var removed = RbTreeSetBase.prototype.remove.call(this, value);
            this.size = this._elementCount;
            
            return removed;
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype["delete"] = OrderedTreeSet.prototype.remove;
        
        /**
         * @function
         */
        OrderedTreeSet.prototype.clear = function () {
            this.removeAll();
            this.size = this._elementCount;
        };
        
        return OrderedTreeSet;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListSet
    
    collection.ListSet = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {Function} equalComparator
         */
        var ListSet = function (equalComparator) {
            this._elements = [];
            this._equalComparator = karbonator.selectNonUndefined(
                equalComparator,
                ListSet.equalComparator
            );
        };
        
        /**
         * readonly
         * @function
         */
        ListSet.equalComparator = function (lhs, rhs) {
            return lhs === rhs;
        };
        
        ListSet.ValueIterator = (function () {
            /**
             * @memberof karbonator.collection.ListSet
             * @constructor
             * @param {karbonator.collection.ListSet} listSet
             * @param {Number} index
             */
            var ValueIterator = function (listSet, index) {
                if(typeof(listSet) === "undefined" || listSet === null) {
                    throw new TypeError("The parameter 'listSet must not be undefined or null.");
                }
                this._listSet = listSet;
                
                this._index = karbonator.selectNonUndefined(index, 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._index < this._listSet.getElementCount();
                
                return {
                    value : (done ? undefined : this._listSet.get(this._index)),
                    done : done
                };
            };
            
            return ValueIterator;
        })();
        
        ListSet.PairIterator = (function () {
            /**
             * @memberof karbonator.collection.ListSet
             * @constructor
             * @param {karbonator.collection.ListSet} listSet
             * @param {Number} index
             */
            var PairIterator = function (listSet, index) {
                if(typeof(listSet) === "undefined" || listSet === null) {
                    throw new TypeError("The parameter 'listSet must not be undefined or null.");
                }
                this._listSet = listSet;
                
                this._index = karbonator.selectNonUndefined(index, 0);
            };
            
            /**
             * @function
             * @return {Object}
             */
            PairIterator.prototype.next = function () {
                var done = this._index < this._listSet.getElementCount();
                var value = (done ? undefined : this._listSet.get(this._index));
                
                return {
                    value : [value, value],
                    done : done
                };
            };
            
            return ListSet;
        })();
        
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
        ListSet.prototype.get = function (index) {
            return this._elements[index];
        };
        
        /**
         * @function
         * @param {Number} index
         * @param {Object} element
         */
        ListSet.prototype.set = function (index, element) {
            this._elements[index] = element;
        };
        
        /**
         * @function
         * @return {karbonator.collection.ListSet.PairIterator}
         */
        ListSet.prototype.values = function () {
            return new ListSet.PairIterator(this);
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
         * @return {karbonator.collection.ListSet.ValueIterator}
         */
        ListSet.prototype.keys = function () {
            return new ListSet.ValueIterator(this);
        };
        
        /**
         * @function
         * @return {karbonator.collection.ListSet.ValueIterator}
         */
        ListSet.prototype.values = ListSet.prototype.keys;
        
        ListSet.prototype[global.Symbol.iterator] = ListSet.prototype.values;
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype.has = function (element) {
            return (this.findIndex(element) >= 0);
        };
        
        /**
         * @function
         * @param {Object} element
         * @param {Function} equalComparator
         * @return {Number}
         */
        ListSet.prototype.findIndex = function (element, equalComparator) {
            equalComparator = karbonator.selectNonUndefined(equalComparator, this._equalComparator);
            
            for(var i = 0; i < this._elements.length; ++i) {
                if(equalComparator(this._elements[i], element)) {
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
        ListSet.remove = function (element) {
            return this.removeAt(this.findIndex(element));
        };
        
        /**
         * @function
         * @param {Object} element
         * @return {Boolean}
         */
        ListSet.prototype["delete"] = ListSet.prototype.remove;
        
        /**
         * @function
         */
        ListSet.prototype.clear = function () {
            this._elements.splice(0, this._elements.length);
        };
        
        /**
         * @function
         * @return {String}
         */
        ListSet.prototype.toString = function () {
            var str = "[";
            
            var count = this._elements.length;
            if(count > 0) {
                str += this._elements[0].toString();
            }
            for(var i = 1; i < count; ++i) {
                str += ", ";
                str += this._elements[i].toString();
            }
            
            str += "]";
            
            return str;
        };
        
        return ListSet;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListMap
    
    collection.ListMap = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {Function} equalComparator
         */
        var ListMap = function (equalComparator) {
            this._list = [];
            
            if(typeof(equalComparator) === "function") {
                this._equalComparator = equalComparator;
            }
            else {
                this._equalComparator = ListMap.equalComparator;
            }
        };
        
        /**
         * @readonly
         * @function
         */
        ListMap.equalComparator = function (lhs, rhs) {
            return lhs === rhs;
        };
        
        /**
         * @function
         * @return {Number}
         */
        ListMap.prototype.getElementCount = function () {
            return this._list.length;
        };
        
        /**
         * @function
         * @param {Object} key
         * @return {Object|undefined}
         */
        ListMap.prototype.get = function (key) {
            var index = this.findIndex(key);
            if(index >= 0) {
                return this._list[index];
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
                this._list.push({key : key, value : value});
            }
            else {
                this._list[index].value = value;
            }
            
            return this;
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
                this._list.splice(index, 1);
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
            this._list = [];
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
            for(var i = 0; i < this._list.length; ++i) {
                if(this._equalComparator(this._list[i].key, key)) {
                    return i;
                }
            }
            
            return -1;
        };
        
        ListMap.prototype.entries = function () {
            
        };
        
        ListMap.prototype[global.Symbol.iterator] = ListMap.prototype.entries;
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} thisArg
         */
        ListMap.prototype.forEach = function (callback, thisArg) {
            for(var i = 0; i < this._list.length; ++i) {
                var pair = this._list[i];
                callback.call(thisArg, pair.value, pair.key, this);
            }
        };
        
        ListMap.prototype.keys = function () {
            
        };
        
        ListMap.prototype.values = function () {
            
        };
        
        return ListMap;
    })();
    
    /*////////////////////////////////*/      
    
    return karbonator;
})
));
