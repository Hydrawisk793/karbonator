/**
 * author : Hydrawisk793
 * e-mail : hyw793@naver.com
 * blog : http://blog.naver.com/hyw793
 * last-modified : 2017-06-07
 * disclaimer : The author is not responsible for any problems that that may arise by using this source code.
 */

(function (g, factory) {
    if(typeof(define) === "function" && define.amd) {
        define(["./karbonator.util", "./karbonator.dom"], function (util, dom) {
            return factory(g, dom);
        });
    }
    else if(typeof(module) !== "undefined" && module.exports) {
        require("./karbonator.util");
        exports = module.exports = factory(g, require("./karbonator.dom"));
    }
}(
(global ? global : (window ? window : this)),
(function (global, karbonator) {
    "use strict";
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var ui = karbonator.ui || {};
    
    karbonator.ui = ui;
    
    var Symbol = global.Symbol;
    var TouchEvent = global.TouchEvent;
    
    /*////////////////////////////////////////////////////////////////*/
    //ResizeObserver
    
    ui.ResizeObserver = (function () {
        /**
         * @memberof karbonator.ui
         * @constructor
         * @param {HTMLElement} element
         */
        var ResizeObserver = function (element) {
            this._element = element;
    
            this._flag = false;
            this._currentSize = {
                width : 0,
                height : 0
            };
            this._previousSize = {
                width : 0,
                height : 0
            };
            
            this._fpsCtrl = new karbonator.util.FpsController(12, this._observe);
            this._fpsCtrl.start({observer : this});
        };
        
        /**
         * @function
         */
        ResizeObserver.prototype.close = function () {
            this._fpsCtrl.stop();
        };
        
        /**
         * @private
         * @function
         */
        ResizeObserver.prototype._observe = function (context, args) {
            var observer = args.observer;
            observer._previousSize.width = observer._currentSize.width;
            observer._previousSize.height = observer._currentSize.height;
            observer._currentSize.width = observer._element.clientWidth;
            observer._currentSize.height = observer._element.clientHeight;
            
            if(
                (observer._previousSize.width - observer._currentSize.width != 0)
                || (observer._previousSize.height - observer._currentSize.height != 0)
            ) {
                karbonator.dom.dispatchEvent(
                    observer._element,
                    new CustomEvent(
                        "resize.karbonator",
                        {
                            detail : {
                                previousSize : observer._previousSize,
                                currentSize : observer._currentSize
                            }
                        }
                    )
                );
            }
        };
        
        return ResizeObserver;
    })();
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //PageBlocker
    
    ui.PageBlocker = (function () {
        /**
         * @memberof karbonator.ui
         * @constructor
         * @param {HTMLElement} element
         */
        var PageBlocker = function (element) {
            this._element = element;
            
            this._blockingCount = 0;
            this._blockingColor = "rgba(0, 0, 0, 0.8)";
            
            var elementStyle = this._element.style;
            var parentStyle = this._element.parentElement.style;
            elementStyle.display = "none";
            elementStyle.position = "absolute";
            elementStyle.left = parentStyle.left;
            elementStyle.top = parentStyle.top;
            elementStyle.zIndex = "900";
            elementStyle.width = parentStyle.width;
            elementStyle.height = parentStyle.height;
            elementStyle.backgroundColor = "rgba(0, 0, 0, 0.8)";
        }
        
        /**
         * @function
         * @param {Boolean} blocked
         */
        PageBlocker.prototype.setPageBlocked = function (blocked) {
            if(blocked) {
                this._element.style.display = "block";
                ++this._blockingCount;
            }
            else {
                if(this._blockingCount > 0) {
                    --this._blockingCount;
                }
                
                if(this._blockingCount < 1) {
                    this._element.style.display = "none";
                }
            }
        };
        
        return PageBlocker;
    })();
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //BoxSlider
    
    ui.BoxSlider = (function () {
        /**
         * @memberof karbonator.ui
         * @constructor
         * @param {HTMLElement} container
         * @param {Object} [options]
         */
        var BoxSlider = function (container, options) {
            options = options || {
                dotList : null,
                dragMode : BoxSlider.DragMode.horizontal,
                slideIndex : 0,
                timeTick : 30
            };
            
            this._animateSliding = BoxSlider.prototype._animateSliding.bind(this);
            
            //this._container = null;
            //this._slideList = null;
            //this._slides = null;
            //this._clientSizePropName = "";
            //this._positionStylePropName = "";
            //this._mouseEventMousePositionPropName = "";
                    
            //this._dragMode = 0;
            this._draggingStatus = BoxSlider._DraggingStatus.none;
            //this._dragStartSlideListPosition = 0;
            //this._dragStartMousePosition = 0;
            
            //this._acceleration = 0;
            //this._maxVelocity = 0;
            //this._destPosition = 0;
            this._timeTick = options.timeTick;
            //this._tick = 0;
            
            this._connectContainer(container);
            this.setDragMode(options.dragMode);
            this.moveTo(options.slideIndex);
            
            if(typeof(dotList) !== "undefined") {
                if(!(dotList instanceof HTMLElement)) {
                    throw new TypeError("The parameter 'slideList' must be an instance of 'HTMLElement'.");
                }
            }
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        BoxSlider.DragMode = {
            none : 0,
            horizontal : 1,
            vertical : 2
        };
        
        /**
         * @readonly
         * @enum {Number}
         */
        BoxSlider._DraggingStatus = {
            none : 0,
            dragging : 1,
            sliding : 2
        };
        
        /**
         * @function
         */
        BoxSlider.prototype.close = function () {
            this.setDraggable(false);
            
            this._disconnectContainer();
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype.getDragMode = function () {
            return this._dragMode;
        };
        
        /**
         * @function
         * @param {Number} dragMode
         */
        BoxSlider.prototype.setDragMode = function (dragMode) {
            this._dragMode = dragMode;
            switch(dragMode) {
            case BoxSlider.DragMode.none:
                this.stopDragging();
            break;
            case BoxSlider.DragMode.horizontal:
                this._clientSizePropName = "clientWidth";
                this._positionStylePropName = "left";
                this._mouseEventMousePositionPropName = "clientX";
            break;
            case BoxSlider.DragMode.vertical:
                this._clientSizePropName = "clientHeight";
                this._positionStylePropName = "top";
                this._mouseEventMousePositionPropName = "clientY";
            //break;
            }
        };
        
        /**
         * @function
         */
        BoxSlider.prototype.stopDragging = function () {
            if(this._draggingStatus === BoxSlider._DraggingStatus.dragging) {
                this._moveToCurrentDestinationIndex();
            }
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype.getCurrentSlideIndex = function () {
            return this._currentSlideIndex;
        };
        
        /**
         * @function
         * @param {Number} slideIndex
         */
        BoxSlider.prototype.moveTo = function (slideIndex) {
            if(this._draggingStatus !== BoxSlider._DraggingStatus.sliding) {
                this._currentSlideIndex = karbonator.math.clamp(
                    slideIndex,
                    0,
                    this._slides.length - 1
                );
                
                this._destPosition = this._getSlideListSize() * -this._currentSlideIndex;
                this._maxVelocity = (this._destPosition - this._getSlideListPosition()) * 2 / this._timeTick;
                this._acceleration = this._maxVelocity / this._timeTick;
                
                this._tick = 0;
                this._draggingStatus = BoxSlider._DraggingStatus.sliding;
                this._animateSliding();
            }
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype.rotateForward = function () {
            var nextIndex = this._currentSlideIndex + 1;
            if(nextIndex >= this._slides.length) {
                nextIndex = 0;
            }
            
            this.moveTo(nextIndex);
            
            return nextIndex;
        }
        
        /**
         * @private
         * @function
         * @param {HTMLElement} container
         */
        BoxSlider.prototype._connectContainer = function (container) {
            this._container = container;
            this._container.style.position = "relative";
            this._container.style.overflow = "hidden";
            
            this._slideList = this._container.querySelector("ul");
            if(!this._slideList) {
                throw new TypeError("The container must have at least one 'UL' element.");
            }
            this._slideList.style.display = "block";
            this._slideList.style.position = "relative";
            this._slideList.style.margin = 
            this._slideList.style.padding = 
            this._slideList.style.left =
            this._slideList.style.top = "0";
            this._slideList.style.width = 
            this._slideList.style.height = "100%";
            this._slideList.style.listStyleType = "none";
            this._slideList.style.whiteSpace = "nowrap";
            
            this._updateAndLoadSlideElements();
            
            this._onMouseDown = BoxSlider.prototype._onMouseDown.bind(this);
            karbonator.dom.addEventListener(
                this._container,
                "mousedown",
                this._onMouseDown,
                false
            );
            karbonator.dom.addEventListener(
                this._container,
                "touchstart",
                this._onMouseDown,
                false
            );
            this._onMouseMove = BoxSlider.prototype._onMouseMove.bind(this);
            var mouseEventTarget = this._getMouseEventTarget();
            karbonator.dom.addEventListener(
                mouseEventTarget,
                "mousemove",
                this._onMouseMove,
                false
            );
            karbonator.dom.addEventListener(
                mouseEventTarget,
                "touchmove",
                this._onMouseMove,
                false
            );
            this._onMouseUp = BoxSlider.prototype._onMouseUp.bind(this);
            karbonator.dom.addEventListener(
                mouseEventTarget,
                "mouseup",
                this._onMouseUp,
                false
            );
            karbonator.dom.addEventListener(
                mouseEventTarget,
                "touchend",
                this._onMouseUp,
                false
            );
            
            this._slideListResizeObserver = new ResizeObserver(this._container);
            
            this._onResize = BoxSlider.prototype._onResize.bind(this);
            karbonator.dom.addEventListener(
                this._container,
                "resize.karbonator",
                this._onResize,
                false
            );
        };
        
        /**
         * @private
         * @function
         */
        BoxSlider.prototype._updateAndLoadSlideElements = function () {
            var slideList = this._slideList;        
            this._slides = [];
            
            for(var i = 0; i < slideList.childNodes.length; ++i) {
                var childNode = slideList.childNodes[i];
                switch(childNode.nodeType) {
                case Node.ELEMENT_NODE:
                    if(childNode.nodeName.toLowerCase() === "li") {
                        childNode.style.display = "inline-block";
                        childNode.style.width = 
                        childNode.style.height = "100%";
                        
                        this._slides.push(childNode);
                    }
                break;
                case Node.TEXT_NODE:
                case Node.COMMENT_NODE:
                    slideList.removeChild(childNode);
                    --i;
                //break;
                }
            }
            
            this._resizeSlides();
        };
        
        /**
         * @private
         * @function
         */
        BoxSlider.prototype._disconnectContainer = function () {
            if(this._container) {
                this._slideListResizeObserver.close();
                this._slideListResizeObserver = null;
                
                this._slides = null;
                
                karbonator.dom.removeEventListener(
                    this._container,
                    "resize.karbonator",
                    this._onResize,
                    false
                );
                
                var mouseEventTarget = this._getMouseEventTarget();
                karbonator.dom.removeEventListener(
                    mouseEventTarget,
                    "mouseup",
                    this._onMouseDown,
                    false
                );
                karbonator.dom.removeEventListener(
                    mouseEventTarget,
                    "touchend",
                    this._onMouseDown,
                    false
                );
                
                karbonator.dom.removeEventListener(
                    mouseEventTarget,
                    "mousemove",
                    this._onMouseMove,
                    false
                );
                karbonator.dom.removeEventListener(
                    mouseEventTarget,
                    "touchmove",
                    this._onMouseMove,
                    false
                );
                
                karbonator.dom.removeEventListener(
                    this._container,
                    "mousedown",
                    this._onMouseDown,
                    false
                );
                karbonator.dom.removeEventListener(
                    this._container,
                    "touchstart",
                    this._onMouseDown,
                    false
                );
                
                this._slideList = null;
                
                this._container = null;
            }
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype._getSlideListPosition = function () {
            return Number.parseInt(this._slideList.style[this._positionStylePropName]);
        };
        
        /**
         * @function
         * @param {Number} position
         */
        BoxSlider.prototype._setSlideListPosotion = function (position) {
            this._slideList.style[this._positionStylePropName] = position + "px";
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype._getSlideListSize = function () {
            return this._slideList[this._clientSizePropName];
        };
    
        /**
         * @private
         * @function
         */
        BoxSlider.prototype._resizeSlides = function () {
            this._slides.forEach(
                function (child, childIndex, parent) {
                    child.style.width = this._slideList.clientWidth;
                    child.style.height = this._slideList.clientHeight;
                },
                this
            );
        };
        
        /**
         * @private
         * @function
         */
        BoxSlider.prototype._moveToCurrentDestinationIndex = function () {
            this.moveTo(this._calculateDestinationSlideIndex());
        };
        
        /**
         * @function
         * @return {Number}
         */
        BoxSlider.prototype._calculateDestinationSlideIndex = function () {
            return -Math.round(this._getSlideListPosition() / this._getSlideListSize());
        };
        
        /**
         * @private
         * @function
         * @param {MouseEvent|TouchEvent} e
         * @return {Number}
         */
        BoxSlider.prototype._getMousePosition = function (e) {
            if(e.touches) {
                return e.touches[0][this._mouseEventMousePositionPropName];
            }
            else {
                return e[this._mouseEventMousePositionPropName];
            }
        };
        
        /**
         * @private
         * @function
         * @param {MouseEvent} e
         */
        BoxSlider.prototype._onMouseDown = function (e) {
            if(
                this._dragMode !== BoxSlider.DragMode.none
                && this._draggingStatus === BoxSlider._DraggingStatus.none
            ) {
                this._dragStartSlideListPosition = this._getSlideListPosition();
                this._dragStartMousePosition = this._getMousePosition(e);
                this._draggingStatus = BoxSlider._DraggingStatus.dragging;
                
                e.preventDefault();
            }
        };
        
        /**
         * @private
         * @function
         * @param {MouseEvent} e
         */
        BoxSlider.prototype._onMouseMove = function (e) {
            if(this._draggingStatus === BoxSlider._DraggingStatus.dragging) {
                this._setSlideListPosotion(this._dragStartSlideListPosition + (this._getMousePosition(e) - this._dragStartMousePosition));
                
                e.preventDefault();
            }
        };
        
        /**
         * @private
         * @function
         * @param {MouseEvent} e
         */
        BoxSlider.prototype._onMouseUp = function (e) {
            if(
                this._draggingStatus === BoxSlider._DraggingStatus.dragging
                || this._dragMode === BoxSlider.DragMode.none
            ) {
                this.stopDragging();
                
                e.preventDefault();
            }
        };
        
        /**
         * @private
         * @function
         * @param {Event} e
         */
        BoxSlider.prototype._onResize = function (e) {
            this._resizeSlides();
            
            this._draggingStatus = BoxSlider._DraggingStatus.none;
            window.cancelAnimationFrame(this._animatorId);
            
            this._moveToCurrentDestinationIndex();
        };
        
        /**
         * @private
         * @function
         */
        BoxSlider.prototype._animateSliding = function () {
            var currentAccel = this._acceleration * this._tick;
            var velocity = this._maxVelocity - currentAccel;
            var pos = this._getSlideListPosition();
            var newPos = Math.round(pos + velocity);
            
            if(
                karbonator.math.numberEquals(velocity, 0, 1e-05)
                || (velocity < 0 && this._destPosition >= newPos)
                || (velocity > 0 && this._destPosition <= newPos)
            ) {
                this._slideList.style[this._positionStylePropName] = this._destPosition + "px";
                this._draggingStatus = BoxSlider._DraggingStatus.none;
            }
            else {
                this._setSlideListPosotion(newPos);
                
                this._animatorId = window.requestAnimationFrame(this._animateSliding);
            }
            
            ++this._tick;
        };
        
        /**
         * @private
         * @function
         * @return {Window | HTMLDocument}
         */
        BoxSlider.prototype._getMouseEventTarget = function () {
            if(typeof(window.onmousemove) !== "undefined") {
                return window;
            }
            else {
                return this._container.ownerDocument.body;
            }
        };
        
        return BoxSlider;
    })();
    
    /*////////////////////////////////////////////////////////////////*/
    
    /*////////////////////////////////////////////////////////////////*/
    //TagList
    
    ui.TagList = (function () {
        /**
         * @memberof karbonator.ui
         * @constructor
         * @param {HTMLElement} container
         * @param {Boolean} [focus = false]
         * @param {Array} [names]
         */
        var TagList = function (container, focus, names) {
            if(typeof(container) === "undefined" || container === null) {
                throw new TypeError("The parameter 'container' must be an instance of 'Element'.");
            }
            this._container = container;
            
            this._duplicateEnabled = false;
            this._tagNameCaseInsensitive = false;
            
            this._tags = [];
            this._addNewEmptyTag();
            
            if(typeof(names) !== "undefined" && names instanceof Array) {
                for(var i = 0; i < names.length; ++i) {
                    this.add(names[i]);
                }
            }
            
            if((typeof(focus) === "undefined" ? false : focus)) {
                this._focusLast();
            }
        };
        
        TagList.Tag = (function () {
            /**
             * @memberof karbonator.ui.TagList
             * @constructor
             * @param {TagList} tagList
             * @param {String} name
             */
            var Tag = function (tagList, name) {
                this._tagList = tagList;
                this._name = name || "";
                
                if(typeof(name) === "undefined") {
                    this._element = this._createInputElement();
                }
                else {
                    this._element = this._createSpanElement(name);
                }
                
                this._tagList._container.appendChild(this._element);
                this._tagList._tags.push(this);
            };
            
            /**
             * @function
             * @return {String}
             */
            Tag.prototype.getName = function () {
                return this._name;
            };
            
            /**
             * @private
             * @function
             * @return {Boolean}
             */
            Tag.prototype.isLast = function () {
                return this._tagList._tags.indexOf(this) == this._tagList._tags.length - 1;
            };
            
            /**
             * @function
             * @param {Number} delay
             */
            Tag.prototype.focus = function (delay) {
                var element = this._element;
                window.setTimeout(function () {element.focus();}, (delay || 0));
            };
            
            /**
             * @function
             */
            Tag.prototype.removeSelf = function () {
                var tags = this._tagList._tags;
                var index = tags.indexOf(this, 0);
                if(index < tags.length) {
                    this._tagList._container.removeChild(this._element);
                    tags.splice(index, 1);
                }
            };
            
            /**
             * @private
             * @function
             * @param {MouseEvent} e
             */
            Tag.prototype._onMouseDown = function (e) {
                switch(e.button) {
                case 0:
                case 1:
                    this._transformToInput();
                    this.focus();
                //break;
                }
            };
            
            /**
             * @private
             * @function
             * @param {KeyboardEvent} e
             */
            Tag.prototype._onKeyDown = function (e) {
                switch(e.key) {
                case "Enter":
                    if(e.defaultPrevented) {
                        return;
                    }
                    
                    this._element.blur();
                    
                    e.preventDefault();
                break;
                case "Backspace":
                    if(e.defaultPrevented) {
                        return;
                    }
                    
                    if(this._moveToPreviousTagByHoldingBackspace()) {
                        e.preventDefault();
                    }
                break;
                }
            }
            
            /**
             * @private
             * @function
             * @param {Event} e
             */
            Tag.prototype._onFocusOut = function (e) {
                if(e.defaultPrevented) {
                    return;
                }
                
                this._terminateInput(true);
                
                e.preventDefault();
            };
            
            /**
             * @private
             * @function
             * @param {Boolean} [focus = true]
             */
            Tag.prototype._terminateInput = function (focus) {
                focus = (typeof(focus) === "undefined" ? false : focus);
                
                if(this._element.tagName === "INPUT") {
                    this._element.value = this._element.value.trim();
                    if(this._element.value.length > 0) {
                        this._name = this._element.value;
                        var notDuplicated = this._tagList.isDuplicateEnabled() || !this._tagList.isDuplicated(this._element.value);
                        if(notDuplicated) {
                            this._transformToSpan();
                            
                            if(this.isLast()) {
                                var newEmptyTag = this._tagList._addNewEmptyTag();
                                if(focus) {
                                    newEmptyTag.focus();
                                }
                            }
                            else if(focus) {
                                this._tagList._focusLast();
                            }
                        }
                        else {
                            if(!this.isLast()) {
                                this.removeSelf();
                            }
                            else {
                                this._element.value = "";
                                if(focus) {
                                    this.focus();
                                }
                            }
                        }
                    }
                    else {
                        if(!this.isLast()) {
                            this.removeSelf();
                        }
                        else {
                            this._element.value = "";
                        }
                    }
                }
            }
            
            /**
             * @private
             * @function
             */
            Tag.prototype._moveToPreviousTagByHoldingBackspace = function () {
                var condition = this._element.tagName === "INPUT"
                    && (this._tagList._tags.length >= 2 && this._element.value.length < 1)
                ;
                
                if(condition) {
                    var tagIndex = this._findTagIndex() - 1;
                    if(tagIndex < 0) {
                        tagIndex = 1;
                    }
                    
                    var target = this._tagList._tags[tagIndex];
                    target._transformToInput();
                    target.focus();
                    
                    var nameStrOffset = target._element.value.length;
                    karbonator.dom.setSelectionRange(target._element, nameStrOffset, nameStrOffset);
                }
                    
                return condition;
            };
            
            /**
             * @private
             * @function
             */
            Tag.prototype._transformToSpan = function () {
                var index = this._findElementIndex();
                var name = this._element.value;
                var newElement = this._createSpanElement(name);
                var container = this._tagList._container;
                container.insertBefore(
                    newElement,
                    container.childNodes[index]
                );
                container.removeChild(this._element);
                this._element = newElement;
                this._name = name;
            };
            
            /**
             * @private
             * @function
             */
            Tag.prototype._transformToInput = function () {
                var index = this._findElementIndex();
                var newElement = this._createInputElement(karbonator.dom.getTextContent(this._element));
                var container = this._tagList._container;
                container.insertBefore(
                    newElement,
                    container.childNodes[index]
                );
                container.removeChild(this._element);
                this._element = newElement;
            };
            
            /**
             * @private
             * @function
             * @return {Number}
             */
            Tag.prototype._findElementIndex = function () {
                var elem = this._element;
                var i = 0;
                for(; (elem = elem.previousSibling); ++i);
                
                return i;
            };
            
            /**
             * @private
             * @function
             * @return {Number}
             */
            Tag.prototype._findTagIndex = function () {
                var i = 0;
                for(
                    var tag = this;
                    tag !== this._tagList._tags[i];
                    ++i
                );
                
                return i;
            };
            
            /**
             * @private
             * @function
             * @param {String} name
             * @return {Element}
             */
            Tag.prototype._createInputElement = function (name) {
                var document = this._tagList._container.ownerDocument;
                var element = document.createElement("INPUT");
                element.setAttribute("type", "text");
                element.setAttribute("placeholder", "태그 이름을 입력하세요.");
                karbonator.dom.addEventListener(
                    element,
                    "keydown",
                    Tag.prototype._onKeyDown.bind(this),
                    false
                );
                karbonator.dom.addEventListener(
                    element,
                    "focusout",
                    Tag.prototype._onFocusOut.bind(this),
                    false
                );
                element.value = name || "";
                
                return element;
            };
            
            /**
             * @private
             * @function
             * @param {String} name
             * @return {Element}
             */
            Tag.prototype._createSpanElement = function (name) {
                var document = this._tagList._container.ownerDocument;
                var element = document.createElement("SPAN");
                karbonator.dom.setTextContent(element, (name || ""));
                karbonator.dom.addEventListener(
                    element,
                    "mousedown",
                    Tag.prototype._onMouseDown.bind(this),
                    false
                );
                
                return element;
            };
            
            return Tag;
        })();
        
        TagList.ValueIterator = (function () {
            /**
             * @memberof karbonator.ui.TagList
             * @constructor
             * @param {TagList} tagList
             */
            var ValueIterator = function (tagList) {
                this._tagList = tagList;
                this._index = 0;
            };
            
            /**
             * @function
             * @return {Object}
             */
            ValueIterator.prototype.next = function () {
                var done = this._index >= this._tagList._tags.length - 1;
                var out = {
                    value : (done ? undefined : this._tagList._tags[this._index].getName()),
                    done : done
                };
                
                if(!done) {
                    ++this._index;
                }
                
                return out;
            };
            
            return ValueIterator;
        })();
        
        /**
         * @function
         * @return {Boolean}
         */
        TagList.prototype.isDuplicateEnabled = function () {
            return this._duplicateEnabled;
        };
        
        /**
         * @function
         * @param {Boolean} enabled
         */
        TagList.prototype.setDuplicateEnabled = function (enabled) {
            this._duplicateEnabled = enabled;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        TagList.prototype.isTagNameCaseInsensitive = function () {
            return this._tagNameCaseInsensitive;
        };
        
        /**
         * @function
         * @return {Boolean}
         */
        TagList.prototype.setTagNameCaseInsensitive = function (insensitive) {
            this._tagNameCaseInsensitive = insensitive;
        };
            
        /**
         * @function
         * @return {TagList.ValueIterator}
         */
        TagList.prototype.values = function () {
            return new TagList.ValueIterator(this);
        };
        
        if(Symbol && Symbol.iterator) {
            /**
             * @function
             * @return {TagList.ValueIterator}
             */
            TagList.prototype[Symbol.iterator] = TagList.prototype.values;
        }
        
        /**
         * @function
         * @return {Number}
         */
        TagList.prototype.getTagCount = function () {
            var count = this._tags.length - 1;
            if(count < 0) {
                count = 0;
            }
            
            return count;
        };
        
        /**
         * @function
         * @param {String} name
         * @return {Boolean}
         */
        TagList.prototype.contains = function (name) {
            return this.findIndex(name) >= 0;
        };
        
        /**
         * @function
         * @param {String} name
         * @param {Number} [startIndex = 0]
         * @return {Number}
         */
        TagList.prototype.findIndex = function (name, startIndex) {
            var i = startIndex || 0;
            for(; i < this._tags.length; ++i) {
                if(this._tagNameEquals(this._tags[i].getName(), name)) {
                    break;
                }
            }
            
            return (i < this._tags.length ? i : -1);
        }
        
        /**
         * @function
         * @param {String} name
         * @param {Number} [startIndex = 0]
         * @return {Number}
         */
        TagList.prototype.findCount = function (name, startIndex) {
            var count = 0;
            for(
                var i = (startIndex || 0);
                i < this._tags.length;
                ++i
            ) {
                if(this._tagNameEquals(this._tags[i].getName(), name)) {
                    ++count;
                }
            }
            
            return count;
        }
        
        /**
         * @function
         * @param {String} name
         * @return {Boolean}
         */
        TagList.prototype.isDuplicated = function (name) {
            var count = 0;
            for(var i = 0; i < this._tags.length; ++i) {
                if(this._tagNameEquals(this._tags[i].getName(), name)) {
                    if(++count >= 2) {
                        break;
                    }
                }
            }
            
            return count >= 2;
        }
        
        /**
         * @function
         * @return {Array}
         */
        TagList.prototype.toArray = function () {
            var result = [];
            
            var iter = this.values();
            var iterOut = null;
            for(; !(iterOut = iter.next()).done; ) {
                result.push(iterOut.value);
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {String} name
         * @param {Boolean} [focus = false]
         */
        TagList.prototype.add = function (name, focus) {
            var lastTag = this._tags[this._tags.length - 1];
            if(lastTag._element.tagName === "INPUT") {
                lastTag._element.value = name;
                lastTag._terminateInput(focus);
            }
        };
        
        /**
         * @function
         * @param {String} name
         * @param {Boolean} [focus = false]
         * @return {Boolean}
         */
        TagList.prototype.remove = function (name, focus) {
            return this.removeAt(this.findIndex(name), focus);
        };
        
        /**
         * @function
         * @param {Number} index
         * @param {Boolean} [focus = false]
         * @return {Boolean}
         */
        TagList.prototype.removeAt = function (index, focus) {
            var result = index >= 0;
            if(result) {
                var tag = this._tags[index];
                tag._transformToInput();
                tag._element.value = "";
                tag._terminateInput();
            }
            
            if(focus) {
                this._focusLast();
            }
            
            return result;
        };
        
        /**
         * @function
         * @param {Boolean} [focus = false]
         */
        TagList.prototype.removeAll = function (focus) {
            for(var i = this._tags.length - 1; i > 0; ) {
                this.removeAt(--i);
            }
            
            if(focus) {
                this._focusLast();
            }
        }
        
        /**
         * @private
         * @function
         * @param {String} lhs
         * @param {String} rhs
         * @return {Boolean}
         */
        TagList.prototype._tagNameEquals = function (lhs, rhs) {
            if(this._tagNameCaseInsensitive) {
                return lhs.toLocaleLowerCase() === rhs.toLocaleLowerCase();
            }
            else {
                return lhs === rhs;
            }
        };
        
        /**
         * @private
         * @function
         * @return {TagList.Tag}
         */
        TagList.prototype._addNewEmptyTag = function () {
            return new TagList.Tag(this);
        };
        
    
        /**
         * @private
         * @function
         */
        TagList.prototype._focusLast = function () {
            this._tags[this._tags.length - 1].focus();
        }
        
        return TagList;
    })();
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
