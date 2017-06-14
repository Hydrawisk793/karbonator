
//TODO : jQuery 의존성 제거
karbonator.ui.DatePicker = (function () {
    /**
     * @constructor
     * @function
     */
    var DatePicker = function (divId, yearElemName, monthElemName, dayElemName, valueElemName) {
        this._$div = $("#" + divId);
        this._$div.empty();
        
        this._$year = $("<input type=\"text\" name=\"" + yearElemName + "\" size=\"4\" />").appendTo(this._$div);
        this._$year.after("&nbsp;");
        this._$month = $("<select name=\"" + monthElemName + "\"></select>").appendTo(this._$div);
        for(var r1=1; r1<=12; ++r1) {
            var text = (r1 < 10 ? "0" + r1 : "" + r1);
            this._$month.append("<option value=\"" + text + "\">" + text + "</option>");
        }
        this._$month.after("&nbsp;");
        this._$day = $("<select name=\"" + dayElemName + "\"></select>").appendTo(this._$div);
        this._$value = $("<input style=\"display:none;\" type=\"text\" name=\"" + valueElemName + "\" />").appendTo(this._$div);
        
        var _this = this;
        this._$year.on("change focusout keydown", function (e) {
            _this._setDayPickerValues();
            _this._setDateValue();
        });
        this._$month.on("change focusout keydown", function (e) {
            _this._setDayPickerValues();
            _this._setDateValue();
        });
        this._$day.on("change focusout keydown", function (e) {
            _this._setDateValue();
        });
    };
    
    DatePicker.isLeapYear = function (year) {
        return ((year%400 == 0) || (year%4 == 0 && year%100 != 0));
    };
    
    var prototype = DatePicker.prototype;
    
    /**
     * @function
     */
    prototype.setDate = function (year, month, day) {
        this._$year.val(+year);
        this._$month.val(this._pastePrefix(+month));
        this._setDayPickerValues();
        this._$day.val(this._pastePrefix(+day));
        this._setDateValue();
    };
        
    /**
     * @private
     * @function
     */
    prototype._setDayPickerValues = function () {
        this._$day.empty();
        
        var dayCount = this._getDayCount(this._$year.val(), (+this._$month.val())-1);
        for(var r1=1; r1<=dayCount; ++r1) {
            var text = (r1 < 10 ? "0" + r1 : "" + r1);
            var $child = $("<option value=\"" + text + "\">" + text + "</option>");
            $child.appendTo(this._$day);
        }
    };
    
    /**
     * @private
     * @function
     */
    prototype._setDateValue = function () {
        var localDate = new Date("" + this._$year.val() + "-" + this._$month.val() + "-" + this._$day.val());
        var utcTimestamp = localDate.getTime() + (localDate.getTimezoneOffset() * 60000);
        this._$value.val(utcTimestamp);
        this._$value.attr("value", utcTimestamp);
    };
    
    /**
     * @private
     * @function
     * @param {Number} year
     * @param {Number} month
     * @return {Number}
     */
    prototype._getDayCount = function (year, month) {
        return ([31, (karbonator.ui.DatePicker.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])[month];
    };
    
    /**
     * @private
     * @function
     */
    prototype._pastePrefix = function (value) {
        value = "" + value;
        if(value >= 1 && value < 10) {
            value = "0" + value;
        }
        
        return value;
    };
    
    return DatePicker;
})(this);

//TODO : jQuery 의존성 제거
(function () {
    /**
     * @constructor
     * @function
     */
    karbonator.Tree = function () {
        this._construct.apply(this, arguments);
    };
    
    karbonator.Tree.prototype = {
        /**@function*/
        getNode : function (id) {
            var node = this._nodes[id];
    
            return (typeof(node) == "undefined" ? null : node);
        },
        /**@function*/
        setNode : function (id, node) {
            this._nodes[id] = node;
        },
        /**@function*/
        addNode : function (node, parentId) {
            parentId = (typeof(parentId) == "undefined" ? 0 : parentId);
            
            if(parentId == 0) {
                if(this.hasNode(1) == true) {
                    throw new Error("A root node already exists.");
                }
                
                this._nodes[1] = node;
                
                return 1;
            }
            else {
                var theParent = this.getNode(parentId);
                this._assertNodeExists(theParent, parentId);
                
                theParent.addChild(node);
                
                var newId = this._nodes.length;
                this._nodes.push(node);
                
                return newId;
            }
        },
        /**@function*/
        removeNode : function (id) {
            var theNode = this.getNode(id);
            this._assertNodeExists(theNode, id);
            
            var theParent = this.getParentNodeOf(theNode);
            if(theParent != null) {
                theParent.removeChild(theParent.getChildIndexOf(theNode));
            }
            
            this._removeSubTree(theNode);
            
            this._nodes[id] = null;
        },
        
        /**@function*/
        attachSubTree : function (parentId, tree) {
            var theParent = this.getNode(parentId);
            this._assertNodeExists(theParent, parentId);
            
            var rootOfTree = tree.getNode(1);
            var newIdOfRootOfTree = this.addNode(rootOfTree, parentId);
            
            var nodeId = newIdOfRootOfTree;
            var _this = this;
            tree.traverseByPrefix(function (treeParam, node) {
                _this._nodes[nodeId++] = node;
                
                return true;
            });
            
            tree._nodes = [null];
            
            return newIdOfRootOfTree;
        },
        /**@function*/
        detachSubTree : function (rootId) {
            var theRoot = this.getNode(rootId);
            this._assertNodeExists(theRoot, rootId);
            
            var theParent = this.getParentNodeOf(theRoot);
            if(theParent != null) {
                theParent.removeChild(theParent.getChildIndexOf(theRoot));
            }
            
            var _this = this;
            this._traverseByPrefix(theRoot, function (tree, node) {
                _this._nodes[_this.getIdOf(node)] = null;
                
                return true;
            });
            
            return new karbonator.Tree(theRoot);
        },
        
        /**@function*/
        getIdOf : function (node) {
            for(var r1=0; r1<this._nodes.length; ++r1) {
                if(this._nodes[r1] == node) {
                    return r1;
                }
            }
            
            return -1;
        },
        /**@function*/
        hasNode : function (id) {
            return this.getNode(id) != null;
        },
        
        /**@function*/
        getParentNodeOf : function (theNode) {
            var theParent = null;
            this.traverseByPrefix(function (tree, currentNode) {
                if(currentNode.getChildIndexOf(theNode) >= 0) {
                    theParent = currentNode;
                    return false;
                }
                
                return true;
            });
            
            return theParent;
        },
        /**@function*/
        getHeightOf : function (node) {
            var height = 0;
            
            for(
                var parent = this.getParentNodeOf(node);
                parent != null;
                parent = this.getParentNodeOf(parent)
            ) {
                ++height;
            }
            
            return height;
        },
        /**@function*/
        isAncestor : function (ancestor, descendant) {
            for(
                var parent = this.getParentNodeOf(descendant);
                parent != null;
                parent = this.getParentNodeOf(parent)
            ) {
                if(parent == ancestor) {
                    return true;
                }
            }
            
            return false;
        },
        /**@function*/
        areSiblings : function (lhsNode, rhsNode) {
            var lhsParent = this.getParentNodeOf(lhsNode);
            if(lhsParent == null) {
                return false;
            }
            
            var rhsParent = this.getParentNodeOf(rhsNode);
            if(rhsParent == null) {
                return false;
            }
            
            return lhsParent == rhsParent;
        },
        
        /**@function*/
        traverseByPrefix : function (handler, startNodeId) {
            startNodeId = (typeof(startNodeId) == "undefined" ? 1 : startNodeId);
            
            var startNode = this.getNode(startNodeId);
            if(startNode != null) {
                this._traverseByPrefix(startNode, handler);
            }
        },
        /**@function*/
        traverseByPostfix : function (handler, startNodeId) {
            startNodeId = (typeof(startNodeId) == "undefined" ? 1 : startNodeId);
            
            var startNode = this.getNode(startNodeId);
            if(startNode != null) {
                this._traverseByPostfix(startNode, handler);
            }
        },
        
        /**@private*/ _construct : function (param1) {
            this._nodes = [null];
            
            if(typeof(param1) == "undefined") {
                return;
            }
            
            this._nodes[1] = param1;
            
            var idSequence = 1;
            var _this = this;
            this._traverseByPrefix(this._nodes[1], function (tree, node) {
                _this._nodes[idSequence++] = node;                
                return true;
            });
        },
    
        /**@private*/ _traverseByPrefix : function (node, handler) {
            if(!handler(this, node)) {
                return false;
            }
            
            var childCount = node.getChildCount();
            for(var r1=0; r1<childCount; ++r1) {
                if(!this._traverseByPrefix(node.getChild(r1), handler)) {
                    return false;
                }
            }
            
            return true;
        },
        /**@private*/ _traverseByPostfix : function (node, handler) {
            var childCount = node.getChildCount();
            for(var r1=0; r1<childCount; ++r1) {
                if(!this._traverseByPostfix(node.getChild(r1), handler)) {
                    return false;
                }
            }
            
            if(!handler(this, node)) {
                return false;
            }
            
            return true;
        },
        
        /**@private*/ _removeSubTree : function (node) {
            var childCount = node.getChildCount();
            for(var r1=0; r1<childCount; ++r1) {
                this._removeSubTree(node.getChild(r1));
            }
            
            this._nodes[this.getIdOf(node)] = null;
            //TODO : 동작 확인
            //delete node;
            node = undefined;
        },
    
        /**@private*/ _assertNodeExists : function (node, nodeId) {
            if(node == null) {
                throw new Error("The node(" + nodeId + ") doesn't exist.");
            }
        }
    };
    
    /**
     * @constructor
     * @function
     */
    karbonator.Tree.Node = function (childrenPropertyName) {
        this._construct.apply(this, arguments);
    };
    karbonator.Tree.Node.prototype = {
        /**@function*/
        getFirstChild : function () {
            return this.getChild(0);
        },
        /**@function*/
        getLastChild : function () {
            return this.getChild(this.getChildCount()-1);
        },
        /**@function*/
        getChild : function (index) {
            var child = this._children[index];
            
            return (typeof(child) == "undefined" ? null : child);
        },
        /**@function*/
        getChildCount : function () {
            return this._children.length;
        },
        /**@function*/
        getChildIndexOf : function (node) {
            for(var r1=0; r1<this._children.length; ++r1) {
                if(this._children[r1] == node) {
                    return r1;
                }
            }
            
            return -1;
        },
        /**@function*/
        setChild : function (index, node) {
            this._children[index] = node;
        },
        /**@function*/
        addChild : function (node, index) {
            this._children.splice(
                (typeof(index) == "undefined" ? this._children.length : index),
                0,
                node
            );
        },
        /**@function*/
        removeChild : function (index) {
            this._children.splice(index, 1);
        },
        /**@function*/
        swapChildren : function (lhsIndex, rhsIndex) {
            var lhsChild = this.getChild(lhsIndex);
            this.setChild(lhsIndex, this.getChild(rhsIndex));
            this.setChild(rhsIndex, lhsChild);
        },
        /**@function*/
        moveChild : function (destIndex, srcIndex) {
            var srcChild = this.getChild(srcIndex);
            this.removeChild(srcIndex);
            this.addChild(srcChild, destIndex);
        },
    
        /**@function*/
        isLeaf : function () {
            return this.getChildCount() < 1;
        },
        
        /**@private*/ _construct : function (childrenPropertyName) {
            if(typeof(childrenPropertyName) == "undefined") {
                this._children = [];
            }
            else {
                if(typeof(this[childrenPropertyName]) == "undefined") {
                    throw new Error("The specified property is not defined.");
                }
                
                this._children = this[childrenPropertyName];
            }
        }
    };
    karbonator.Tree.Node.extend = function (object, childrenPropertyNames, depth) {
        if("undefined" == typeof(depth)) {
            depth = 0;
        }
        
        for(var property in karbonator.Tree.Node.prototype) {
            object[property] = karbonator.Tree.Node.prototype[property];
        }
        
        if( "undefined" != typeof(childrenPropertyNames)
            && "undefined" != typeof(childrenPropertyNames[depth])
        ) {
            object._children = object[childrenPropertyNames[depth]];
            
            for(var r1=0; r1<object._children.length; ++r1) {
                karbonator.Tree.Node.extend(object._children[r1], childrenPropertyNames, depth+1);
            }
        }
        else {
            object._children = [];
        }
        
        return object;
    };
    karbonator.Tree.Node.unextend = function (nodeObject) {
        if(nodeObject.hasOwnProperty("_children")) {
            for(var r1 = 0; r1 < nodeObject._children.length; ++r1) {
                karbonator.Tree.Node.decapculate(nodeObject._children[r1]);
            }
            
            for(var property in karbonator.Tree.Node.prototype) {
                if(nodeObject.hasOwnProperty(property)) {
                    nodeObject[property] = undefined;
                }
            }
        }
        
        return nodeObject;
    }
    
    /**@class*/
    karbonator.TreeExplorer = function () {
        this._construct.apply(this, arguments);
    };
    karbonator.TreeExplorer.prototype = {
        getTree : function () {
            return this._tree;
        },
        setTree : function (tree) {
            this._tree = tree;
        },
        
        getTreeDivId : function () {
            return this._treeDivId;
        },
        setTreeDivId : function (treeDivId) {
            this._treeDivId = treeDivId;
            this._$treeDiv = $("#" + treeDivId);
        },
        
        isDragEnabled : function () {
            return this._dragEnabled;
        },
        setDragEnabled : function (enabled) {
            this._dragEnabled = enabled;
        },
        
        getSelectedNodeId : function () {
            return this._selectedNodeId;
        },
        
        setEventListener : function (eventListener) {
            this._eventListener = eventListener;
        },
        
        getMaximumTreeLevel : function () {
            return this._maxTreeLevel;
        },
        setMaximumTreeLevel : function (maxTreeLevel) {
            this._maxTreeLevel = maxTreeLevel;
        },
        
        printTree : function (foldParam) {
            this._$treeDiv.empty().append("<div name=\"dummy\"></div>");
            
            this._$dummyNodeDiv = this._$treeDiv.find("div[name=\"dummy\"]");
            this._$dummyNodeDiv.css("position", "absolute").css("display", "none");
            
            var _this = this;
            this._tree.traverseByPrefix(function (tree, node) {
                if(_this._isOutOfRangeNode(node)) {
                    return true;
                }
    
                _this.printNode(tree.getIdOf(node), foldParam);
                
                return true;
            });
        },
        printFoldButton : function (nodeId, fold) {
            var $nodeDiv = this._findNodeDiv(nodeId);
            var $foldButton = $nodeDiv.find("img[name=\"foldButton\"]");
            var _this = this;
            
            var node = this._tree.getNode(nodeId);
            if( node.getChildCount() < 1
                || this._isMaximumLevelNode(node)
            ) {
                $foldButton.off("click");
                $foldButton.attr("src", "images/leaf.png");
            }
            else {
                if(fold) {
                    $foldButton.off("click").on("click", function (e) {
                        _this.unfoldTreeNode(nodeId);
                    });
                    $foldButton.attr("src", "images/folded.png");
                }
                else {
                    $foldButton.off("click").on("click", function (e) {
                        _this.foldTreeNode(nodeId);
                    });
                    $foldButton.attr("src", "images/unfolded.png");
                }
            }
        },
        printNode : function (nodeId, foldParam) {
            var node = this._tree.getNode(nodeId);
            
            var indent = "";
            var nodeHeight = this._tree.getHeightOf(node);
            for(var r1=0; r1<nodeHeight; ++r1) {
                indent += "&nbsp;&nbsp;&nbsp;&nbsp;";
            }
            
            var tempStr = "<div class=\"node";
            tempStr += ((nodeId == this._selectedNodeId) ? " selected-node" : "");
            tempStr += "\" data-node-id=\"" + nodeId + "\">";
            tempStr += indent;
            tempStr += "<img name=\"foldButton\" src=\"\" />&nbsp;</div>";
    
            var $nodeDiv = this._findNodeDiv(nodeId);
            if($nodeDiv == null) {
                $nodeDiv = $(tempStr).appendTo(this._$treeDiv);
            }
            else {
                $nodeDiv.replaceWith(tempStr);
                $nodeDiv = this._findNodeDiv(nodeId);
            }
            
            if(typeof(this._nodeAttributes[nodeId]) == "undefined") {
                this._nodeAttributes[nodeId] = {
                    folded : false,
                    type : 0,
                    childTypes : [0]
                };
            }
            
            if(nodeId != 1) {
                var visible = true;
                for(
                    var ancestor = this._tree.getParentNodeOf(node);
                    ancestor != null; 
                    ancestor = this._tree.getParentNodeOf(ancestor)
                ) {
                    if(this._nodeAttributes[this._tree.getIdOf(ancestor)].folded == true) {
                        visible = false;
                        break;
                    }
                }
                
                $nodeDiv.css("display", (visible ? "block" : "none"));
            }
            
            var fold = foldParam;
            if(typeof(fold) == "undefined") {
                fold = this._nodeAttributes[nodeId].folded;
            }
            else {
                this._nodeAttributes[nodeId].folded = fold;
            }            
            this.printFoldButton(nodeId, fold);
            
            /*
            var $nodeName = $nodeDiv.find("a[name=\"nodeName\"]");
            $nodeName.off("click").on("click", function (e) {
                _this._fireOnNodeLabelClicked(nodeId);
            });
            */
            $nodeDiv.append(this._fireOnNodeDisplaying(nodeId));
        },
        
        foldTreeNode : function (nodeId) {
            this._nodeAttributes[nodeId].folded = true;
            this.printFoldButton(nodeId, true);
    
            var _this = this;
            this._tree.traverseByPrefix(
                function (tree, node) {
                    if(_this._isOutOfRangeNode(node)) {
                        return true;
                    }
                    
                    var paramNodeId = tree.getIdOf(node);
                    if(paramNodeId != nodeId) {
                        var $nodeDiv = _this._findNodeDiv(paramNodeId);
                        $nodeDiv.css("display", "none");
                    }
                    
                    return true;
                }, 
                nodeId
            );
        },
        unfoldTreeNode : function (nodeId) {
            this._nodeAttributes[nodeId].folded = false;
            this.printFoldButton(nodeId, false);
            
            var _this = this;
            this._tree.traverseByPrefix(
                function (tree, node) {
                    if(_this._isOutOfRangeNode(node)) {
                        return true;
                    }
                    
                    var paramNodeId = tree.getIdOf(node);
                    if(paramNodeId != nodeId) {
                        var visible = true;
                        for(
                            var ancestor = tree.getParentNodeOf(node);
                            ancestor != null; 
                            ancestor = tree.getParentNodeOf(ancestor)
                        ) {
                            if(_this._nodeAttributes[tree.getIdOf(ancestor)].folded == true) {
                                visible = false;
                                break;
                            }
                        }
                        
                        var $nodeDiv = _this._findNodeDiv(paramNodeId);
                        $nodeDiv.css("display", (visible ? "block" : "none"));
                    }
                    
                    return true;
                }, 
                nodeId
            );
        },
        clickTreeNodeLabel : function (nodeId) {
            var changeSelectedNode = this._fireOnNodeLabelClicked(this._selectedNodeId, nodeId);
            
            if(changeSelectedNode) {
                this._findSelectedNodeDiv().removeClass("selected-node");
                
                this._selectedNodeId = nodeId;
                this._findSelectedNodeDiv().addClass("selected-node");
            }
            
            return changeSelectedNode;
        },
        addChildTreeNode : function (parentNodeId) {
            if(this._eventListener == null) {
                return;
            }
            var node = this._eventListener.onNodeAdded(this, parentNodeId);
            if(node == null) {
                return;
            }
            
            this._tree.addNode(node, parentNodeId);
            this._nodeAttributes[parentNodeId].folded = false;
            
            this.printTree();
        },
        removeTreeNode : function (nodeId) {
            var removeDecided = true;
            if(this._eventListener != null) {
                removeDecided = this._eventListener.onNodeRemoving(this, nodeId);
            }
            
            if(removeDecided == true) {
                this._tree.removeNode(nodeId);
                this.printTree();
            }
        },
        moveAndAddNodeAsChildOf : function (targetNodeId, parentNodeId) {
            var selectedSubTree = this._tree.detachSubTree(targetNodeId);
            var newIdOfSubTreeRoot = this._tree.attachSubTree(parentNodeId, selectedSubTree);
            var subTreeRoot = this._tree.getNode(newIdOfSubTreeRoot);
            
            var newParentOfSubTreeRootNode = this._tree.getParentNodeOf(subTreeRoot);
            if(newParentOfSubTreeRootNode != null) {
                this._nodeAttributes[this._tree.getIdOf(newParentOfSubTreeRootNode)].folded = false;
            }
            this.printTree();
        },
        
        triggerMouseDown : function (target, button, posX, posY) {
            var $targetDiv = $(target);
            if(typeof($targetDiv.attr("data-node-id")) == "undefined") {
                return;
            }
            
            var selectedNodeId = +$targetDiv.attr("data-node-id");
            if(!this._tree.hasNode(selectedNodeId)) {
                return;
            }        
            this.clickTreeNodeLabel(selectedNodeId);
            
            if(button == 1) {
                this._drageButtonPressing = true;
            }
        },
        triggerMouseMove : function (posX, posY) {
            if( this._dragStatus == false 
                && this._dragEnabled == true 
                && this._drageButtonPressing == true
            ) {
                this._dragStatus = true;
                
                this._findSelectedNodeDiv().css("visibility", "hidden");
                
                this._$dummyNodeDiv.css("display", "block");
                this._$dummyNodeDiv.text(this._fireOnNodeDisplaying(this._selectedNodeId));
            }
            
            if(this._dragStatus == true) {
                this._$dummyNodeDiv.css("left", posX+8);
                this._$dummyNodeDiv.css("top", posY);
            }
        },
        triggerMouseUp : function (target, button, posX, posY) {
            this._drageButtonPressing = false;
            
            if(this._dragStatus == false) {
                return;
            }
                    
            this._dragStatus = false;
            this._findSelectedNodeDiv().css("visibility", "visible");            
            this._$dummyNodeDiv.css("display", "none");
            
            var $targetDiv = $(target);
            if(typeof($targetDiv.attr("data-node-id")) == "undefined") {
                return;
            }
            
            var targetNodeId = +$targetDiv.attr("data-node-id");
            var targetNode = this._tree.getNode(targetNodeId);
            var dragSelectedNode = this._tree.getNode(this._selectedNodeId);
            if(this._tree.isAncestor(dragSelectedNode, targetNode)) {
                return;
            }
            
            var canDropOntoTargetNode = this._fireOnNodeDropped(targetNodeId, this._selectedNodeId);
            var areSiblings = this._tree.areSiblings(targetNode, dragSelectedNode);
            var actionCode = (canDropOntoTargetNode == true ? 0x01 : 0x00) | (areSiblings == true ? 0x02 : 0x00);
            if(actionCode == 3) {
                actionCode = this._fireOnNodeDropActionSelecting(targetNodeId, this._selectedNodeId);
            }
            
            switch(actionCode) {
            case 0:
            break;
            case 1:
                this.moveAndAddNodeAsChildOf(this._selectedNodeId, targetNodeId);
                this.printTree();
            break;
            case 2:{
                var parentOfTargetNode = this._tree.getParentNodeOf(targetNode);
                var parentOfDragSelectedNode = this._tree.getParentNodeOf(dragSelectedNode);
            
                parentOfTargetNode.moveChild(
                    parentOfTargetNode.getChildIndexOf(targetNode), 
                    parentOfDragSelectedNode.getChildIndexOf(dragSelectedNode)
                );
                this.printTree();
            }break;
            default:
                throw new Error("Unknown drop action code.");
            }
        },
        
        /**@private*/ _construct : function (tree, treeDivId, eventListener) {
            this._tree = null;
            this._treeDivId = null;
            this._$treeDiv = null;
    
            this._eventListener = null;
            this._maxTreeLevel = 0;
            
            this._nodeAttributes = [];
            
            this._selectedNodeId = 0;
            
            this._dragEnabled = false;
            this._drageButtonPressing = false;
            this._dragStatus = false;
            this._$dummyNodeDiv = null;
            
            this.setTree(tree);
            this.setTreeDivId(treeDivId);
            this.setEventListener((typeof(eventListener) == "undefined" ? null : eventListener));
            
            if(this._tree != null && this._$treeDiv != null) {
                this.printTree(true);
            }
        },
        
        /**@private*/ _findNodeDiv : function (id) {
            var $div = this._$treeDiv.find("div[data-node-id=\"" + id + "\"]");
            
            return ($div.length > 0 ? $div : null);
        },
        /**@private*/ _findSelectedNodeDiv : function () {
            return this._$treeDiv.find("div[data-node-id=\"" + this._selectedNodeId + "\"]");
        },
        
        /**@private*/ _isMaximumLevelNode : function(node) {
            return this._tree.getHeightOf(node) == this._maxTreeLevel;
        },
        /**@private*/ _isOutOfRangeNode : function(node) {
            return this._tree.getHeightOf(node) > this._maxTreeLevel;
        },
        
        /**@private*/ _fireOnNodeDisplaying : function (nodeId) {
            var label = "";
            
            if(this._eventListener != null) {
                label = this._eventListener.onNodeDisplaying(this, nodeId);
            }
            
            return label;
        },
        /**@private*/ _fireOnNodeLabelClicked : function (previousNodeId, nodeId) {
            var changeSelectedNodeId = true;
            
            if(this._eventListener != null) {
                changeSelectedNodeId = this._eventListener.onNodeLabelClicked(this, previousNodeId, nodeId);
            }
            
            return changeSelectedNodeId;
        },
        /**@private*/ _fireOnNodeDropped : function (destNodeId, srcNodeId) {
            return (this._eventListener == null)
                ? 0 
                : this._eventListener.onNodeDropped(this, destNodeId, srcNodeId)
            ;
        },
        /**@private*/ _fireOnNodeDropActionSelecting : function (destNodeId, srcNodeId) {
            return (this._eventListener == null)
                ? 0 
                : this._eventListener.onNodeDropActionSelecting(this, destNodeId, srcNodeId)
            ;
        }
    };
    
    /**@function*/
    karbonator.submitForm = function (formName) {
        var $form = $("form[name=\"" + formName + "\"]");
        
        $form.submit();
    };
    
    /**@function*/
    karbonator.submitFormAfterConfirm = function (formName, message) {
        var $form = $("form[name=\"" + formName + "\"]");
        
        if(confirm(message) == true) {
            $form.submit();
        }
    }
    
    /**@class*/
    karbonator.ArticleListViewer = function (boardArticleListDivId) {
        this._construct.apply(this, arguments);
    };
    karbonator.ArticleListViewer.prototype = {
        setOnColumnValueDisplayingListener : function (columnIndex, listener) {
            if(typeof(columnIndex) == "undefined" || columnIndex < 0) {
                throw new Error("Parameter 'columnIndex' must be zero or positive integer.");
            }
            if(typeof(listener) != "function" || listener == null) {
                throw new Error("Parameter 'listener' must be a function.");
            }
            
            this._columnValueDisplayingListener[columnIndex] = listener;
        },
        setOnCommandExecutingListener : function (commandName, listener) {
            if(typeof(commandName) != "string") {
                throw new Error("Parameter 'commandName' must be a string.");
            }
            if(typeof(listener) != "function" || listener == null) {
                throw new Error("Parameter 'listener' must be a function.");
            }
            
            this._columnValueDisplayingListener[commandName] = listener;
        },
        
        /**@private*/ _construct : function (boardArticleListDivId, searchCriteria, expressionOperators) {
            this._columnValueDisplayingListener = [];
            this._commandExecutingListener = [];
            
            this._boardArticleListDivId = boardArticleListDivId;
            var $articleListDiv = $('#' + this._boardArticleListDivId);
            
            var $itemListForm = $articleListDiv.find("form[name=\"item-list-form\"]");
            var $itemsPerPageSelector = $articleListDiv.find("select[name=\"items-per-page-selector\"]");
            var $itemsPerPage = $articleListDiv.find("input[name=\"itemsPerPage\"]");
            $itemsPerPageSelector.on("change", function (e) {
                if($.isNumeric($itemsPerPageSelector.val())) {
                    $itemsPerPage.val($itemsPerPageSelector.val());
                    $itemListForm.submit();
                }
            });
            
            this._valueControllers = [];
            this._searchCriteria = searchCriteria;
            this._expressionOperators = expressionOperators;
            var $searchBar = $articleListDiv.find("div.search-bar");
            var $searchColumnName = $searchBar.find("select[name=\"search-criterion-name\"]");
            var _this = this;
            $searchColumnName.off("change").on("change", function (e) {
                var evt = _this._searchCriteria[e.target.selectedIndex].expressionValueType;
                var eos = evt.expressionOperators;
                
                var $searchOperator = $searchBar.find("select[name=\"search-operator-name\"]");
                $searchOperator.empty();
                for(var r1 = 0; r1 < eos.length; ++r1) {
                    var tempStr = "<option";
                    tempStr += " value=\"" + eos[r1].operatorName + "\"";
                    tempStr += ">";
                    tempStr += eos[r1].label;
                    tempStr += "</option>";
                    $searchOperator.append(tempStr);
                }
                
                var $searchInputContainer = $searchBar.find("div.search-input-container");
                var $searchSubmitButton = $searchBar.find("input[type=\"submit\"]");
                
                var __this = _this;
                $searchInputContainer.empty();
                $searchSubmitButton.css("display", "none");
                $searchOperator.css("display", "inline-block");
                $searchOperator.off("change").on("change", function (e) {
                    var evtn = evt.typeName;
                    var eo = eos[e.target.selectedIndex];
                    
                    $searchInputContainer.empty();
                    switch(eo.parameterCount) {
                    case -1:
                    case 2:
                        __this._appendInputElement($searchInputContainer[0], evtn, 0);
                    break;
                    case 3:
                        __this._appendInputElement($searchInputContainer[0], evtn, 0);
                        $searchInputContainer.append("<span>&nbsp;~&nbsp;</span>");
                        __this._appendInputElement($searchInputContainer[0], evtn, 1);
                    break;
                    default:
                        throw new Error("The parameter count of the selected operator should be -1, 2, or 3.");
                    }
                    $searchInputContainer.css("display", "inline-block");
                    
                    $searchSubmitButton.css("display", "inline-block");
                })
                $searchOperator.val("");
            });
            $searchColumnName.val("");
            
            var $listItemsForm = $articleListDiv.find("form[name=\"list-items\"]");
            var $commandForm = $articleListDiv.find("form[name=\"command\"]");
            var $executeCommandButton = $commandForm.find("input[type=\"button\"][name=\"executeCommand\"]");
            $executeCommandButton.off("click").on("click", function (e) {
                var command = $commandForm.find("*[name=\"command\"]").val();
                $listItemsForm.find("*[name=\"command\"]").val(command);
                var $selectedKeyIds = $listItemsForm.find("input[name=\"keyIds\"]:checked");
                if($selectedKeyIds.length < 1) {
                    if(!confirm("현재 필터링 된 모든 항목들을 대상으로 작업합니다.\r\n삭제 작업인 경우 삭제할 대상들을 다시 한 번 확인하시기 바랍니다.\r\n계속 하시겠습니까?")) {
                        return;
                    }
                }
                
                var executeCommand = _this._fireOnCommandExecuting(command);
                if(executeCommand) {
                    $listItemsForm.submit();
                }
            });
        },
        
        /**@private*/ _appendInputElement : function (parentElement, valueTypeName, paramIndex) {
            var $parentElement = $(parentElement);
            var $elem = null;
            var nameAttributeValue = "searchInput" + paramIndex;
            
            switch(valueTypeName) {
            case "Date":
                $("<div id=\"" + nameAttributeValue + "DatePicker" + "\"></div>")
                    .appendTo($parentElement)
                    .css("display", "inline-block")
                ;
                this._valueControllers[paramIndex] = new karbonator.DatePicker(
                    nameAttributeValue + "DatePicker", "year", "month", "day", nameAttributeValue
                );
            break;
            case "Number":
                $("<input type=\"number\" name=\"" + nameAttributeValue + "\" />").appendTo($parentElement);
            break;
            case "String":
            case "EntityCollection":
            case "Entity":
                $("<input type=\"text\" name=\"" + nameAttributeValue + "\" />").appendTo($parentElement);
            break;
            default:
                throw new Error("An unknown value type has been detected.");
            }
        },
        
        /**@private*/ _fireOnColumnValueDisplaying : function (columnIndex, value) {
            var listener = this._columnValueDisplayingListener[columnIndex];
            if(listener != null && typeof(listener) == "function") {
                value = listener(columnIndex, value);
            }
            
            return value;
        },
        /**@private*/ _fireOnCommandExecuting : function (commandName) {
            var executeCommand = true;
            var listener = this._columnValueDisplayingListener[commandName]
            if(listener != null && typeof(listener) == "function") {
                executeCommand = listener(commandName);
            }
            
            return executeCommand;
        }
    };
})(this);
