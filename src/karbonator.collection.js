/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.core"], function (core) {
            return factory(g, core);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        exports = module.exports = factory(g, require("./karbonator.core"));
    }
}(
(global ? global : (window ? window : this)),
(function (global, karbonator) {
    /**
     * @memberof karbonator
     * @namespace
     */
    var collection = karbonator.collection || {};
    karbonator.collection = collection;
    
    /**
     * @function
     * @param {karbonator.comparator} comparator
     * @return {karbonator.comparator}
     */
    var _assertComparatorIsPassed = function (comparator) {
        if(typeof(comparator) !== "function" || comparator.length < 2) {
            throw new TypeError("A valid comparator function for keys must be specified.");
        }
        
        return comparator;
    };
    
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
         * @param {karbonator.comparartor} comparator
         */
        var RbTreeSetBase = function (comparator) {
            this._comparator = _assertComparatorIsPassed(comparator);
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
             * @param {_Node} parent
             * @param {_Node} leftChild
             * @param {_Node} rightChild
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
            _Node.prototype.isNill = function () {
                return this._element === null;
            };
            
            /**
             * @function
             * @return {Boolean}
             */
            _Node.prototype.isNonNillRoot = function () {
                return this._parent === null && !this.isNill();
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
                        if(!pCurrentNode.isNill()) {
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
                
                if(!this._rightChild.isNill()) {
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
                else if(!this._leftChild.isNill()) {
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
         */
        var _destructNode = function (oThis, node) {
            node._element =
            node._parent =
            node._leftChild =
            node._rightChild =
            node._red = undefined;
            
            oThis._garbageNodes.push(node);
        };
        
        /**
         * @function
         * @param {RbTreeSetBase} oThis
         * @param {Object} element
         * @param {Number} searchTarget
         * @return {_Node}
         */
        var _findNode = function (oThis, element, searchTarget) {
            var pElementKey = oThis.getKeyFromElement(element);
            var pCurrent = oThis._root, pPrevious = null;
            for(; pCurrent !== null && !pCurrent.isNill(); ) {
                var pCurrentElementKey = oThis.getKeyFromElement(pCurrent._element);
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
                && !pPrevious.isNill()
                && oThis._comparator(oThis.getKeyFromElement(pPrevious._element), pElementKey) < 0
            ) {
                pPrevious = pPrevious.getGreater();
            }
            switch(searchTarget) {
            case RbTreeSetBase.SearchTarget.equal:
                pFoundNode = (pCurrent !== null && !pCurrent.isNill() ? pCurrent : null);
            break;
            case RbTreeSetBase.SearchTarget.greater:
                pFoundNode = (pPrevious !== null && !pPrevious.isNill() ? pPrevious : null);
            break;
            case RbTreeSetBase.SearchTarget.greaterOrEqual:
                pFoundNode = (pCurrent !== null && !pCurrent.isNill() ? pCurrent : pPrevious);
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
                var pElementKey = oThis.getKeyFromElement(element);
                for(
                    var pCurrent = oThis._root;
                    !pCurrent.isNill();
                ) {
                    var pCurrentElementKey = oThis.getKeyFromElement(pCurrent._element);
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
            if(!pSelectedChildSlot.call(out.pRemovalTarget).isNill()) {
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
            if(insertedNode.isNonNillRoot()) {
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
                            var isGrandParentRoot = pGrandParentOfTarget.isNonNillRoot();
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
            IteratorBase.prototype.equals = function (rhs) {
                return this._tree === rhs._tree && this._node === rhs._node;
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
            var pTarget = _findNode(this, element, RbTreeSetBase.SearchTarget.equal)._node;
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
                    else if(info.pReplacement.isNonNillRoot()) {
                        this._root = info.pReplacement;
                    }
                    else if(!this._root.isNonNillRoot()) {
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
        
        /**
         * @protected
         * @function
         * @param {Object} element
         */
        RbTreeSetBase.prototype.getKeyFromElement = function (element) {
            return element;
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
         * @param {karbonator.comparator} comparator
         */
        var OrderedTreeSet = function (comparator) {
            this._rbTreeSet = new RbTreeSetBase(comparator);
        };
        
        var ValueIterator = (function () {
            /**
             * @constructor
             * @param {OrderedTreeSet} set
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
        
        var PairIterator = (function () {
            /**
             * @constructor
             * @param {OrderedTreeSet} set
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
         * @return {Number}
         */
        OrderedTreeSet.prototype.getElementCount = function () {
            return this._rbTreeSet.getElementCount();
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype.has = function (value) {
            return this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.equal).equals(this._rbTreeSet.end());
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Object|undefined}
         */
        OrderedTreeSet.prototype.findNotLessThan = function (value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.greaterOrEqual);
            if(!iter.equals(endIter)) {
                return iter.dereference();
            }
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Object|undefined}
         */
        OrderedTreeSet.prototype.findGreaterThan = function (value) {
            var endIter = this._rbTreeSet.end();
            var iter = this._rbTreeSet.find(value, RbTreeSetBase.SearchTarget.greater);
            if(!iter.equals(endIter)) {
                return iter.dereference();
            }
        };
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         */
        
        /**
         * @function
         * @param {Function} callback
         * @param {Object} [thisArg]
         */
        OrderedTreeSet.prototype.forEach = function (callback, thisArg) {
            for(
                var end = this._rbTreeSet.end(), iter = this._rbTreeSet.begin();
                !iter.equals(end);
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
        OrderedTreeSet.prototype.entries = function () {
            return new PairIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        OrderedTreeSet.prototype.keys = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        OrderedTreeSet.prototype.values = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @return {ValueIterator}
         */
        OrderedTreeSet.prototype[global.Symbol.iterator] = function () {
            return new ValueIterator(this);
        };
        
        /**
         * @function
         * @param {Object} value
         */
        OrderedTreeSet.prototype.add = function (value) {
            this._rbTreeSet.insert(value);

            return this;
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype.remove = function (value) {
            return this._rbTreeSet.remove(value);
        };
        
        /**
         * @function
         * @param {Object} value
         * @return {Boolean}
         */
        OrderedTreeSet.prototype["delete"] = function (value) {
            return this._rbTreeSet.remove(value);
        };
        
        /**
         * @function
         */
        OrderedTreeSet.prototype.clear = function () {
            this._rbTreeSet.removeAll();
        };
        
        /**
         * @function
         * @return {Array.<Object>}
         */
        OrderedTreeSet.prototype.toArray = function () {
            var arr = [];
            this.forEach(
                function (key) {
                    arr.push(key);
                }
            );
            
            return arr;
        };
        
        /**
         * @function
         * @return {String}
         */
        OrderedTreeSet.prototype.toString = function () {
            var str = '[';
            
            var iter = this.keys();
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
        
        return OrderedTreeSet;
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ListSet
    
    collection.ListSet = (function () {
        /**
         * @memberof karbonator.collection
         * @constructor
         * @param {karbonator.comparator} comparator
         */
        var ListSet = function (comparator) {
            this._comparator = _assertComparatorIsPassed(comparator);
            this._elements = [];
        };
        
        var ValueIterator = (function () {
            /**
             * @constructor
             * @param {ListSet} listSet
             * @param {Number} [index = 0]
             */
            var ValueIterator = function (listSet) {
                this._listSet = listSet;
                this._index = karbonator.selectNonUndefined(arguments[1], 0);
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
             * @param {ListSet} listSet
             * @param {Number} [index = 0]
             */
            var PairIterator = function (listSet) {
                this._listSet = listSet;
                this._index = karbonator.selectNonUndefined(arguments[1], 0);
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
        ListSet.prototype[global.Symbol.iterator] = function () {
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
         * @param {karbonator.comparator} comparator
         * @return {Number}
         */
        ListSet.prototype.findIndex = function (element, comparator) {
            comparator = karbonator.selectNonUndefined(comparator, this._comparator);
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
         * @function
         * @return {Array.<Object>}
         */
        ListSet.prototype.toArray = function () {
            return this._elements.slice();
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
         * @param {karbonator.comparator} comparator
         */
        var ListMap = function (comparator) {
            this._comparator = _assertComparatorIsPassed(comparator);
            this._pairs = [];
        };
        
        var PairIterator = (function () {
            /**
             * @function
             * @param {ListMap} listMap
             * @param {Number} [index = 0]
             */
            var PairIterator = function (listMap) {
                this._listMap = listMap;
                this._index = karbonator.selectNonUndefined(arguments[1], 0);
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
                this._index = karbonator.selectNonUndefined(arguments[1], 0);
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
                this._index = karbonator.selectNonUndefined(arguments[1], 0);
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
                return this._pairs[index];
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
        ListMap.prototype[global.Symbol.iterator] = function () {
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
         * @return {Array.<Object>}
         */
        ListMap.prototype.toArray = function () {
            var arr = [];
            for(
                var iter = this.entries(), iterPair = iter.next();
                !iterPair.done;
                iterPair = iter.next()
            ) {
                arr.push(iterPair.value);
            }
            
            return arr;
        };
        
        /**
         * @function
         * @return {String}
         */
        ListMap.prototype.toString = function () {
            var str = "{";
            
            var count = this._pairs.length;
            if(count > 0) {
                var pair = this._pairs[0];
                str += pair.key;
                str += " <= ";
                str += pair.value;
            }
            for(var i = 1; i < count; ++i) {
                var pair = this._pairs[i];
                str += ", ";
                str += pair.key;
                str += " <= ";
                str += pair.value;
            }
            
            str += "}";
            
            return str;
        };
        
        return ListMap;
    })();

    /*////////////////////////////////*/

    return karbonator;
})
));
