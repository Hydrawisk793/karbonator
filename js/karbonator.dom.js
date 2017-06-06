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
    var dom = karbonator.dom || {};
    
    karbonator.dom = dom;
    
    if(typeof(global.window) === "undefined") {
        return karbonator;
    }
    
    /*////////////////////////////////*/
    //Namespace private constants.
    
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    
    var ElementExist = typeof(global.Element) !== "undefined";
    var WindowExist = typeof(global.Window) !== "undefined";
    var HTMLDocumentExist = typeof(global.HTMLDocument) !== "undefined";
    var NodeExist = typeof(global.Node) !== "undefined";
    var TextContentPropertySupported = NodeExist || (ElementExist && global.Element.prototype.textContent);
    var EventExist = typeof(window.Event) !== "undefined";
    
    var exclusivePropNamePrefix = "_krbntr";
    var customEventPrefix = exclusivePropNamePrefix + "Evnt_";
    var listenerSetPrefix = exclusivePropNamePrefix + "Lstnrs_";
    var defaultOnLoad = window.onload;
    
    var KeyboardEventExist = typeof(window.KeyboardEvent) !== "undefined";
    var latinCharCaseDiff = 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
    var shiftedNumberKeys = [
        ")", "!", "@", "#", "$", "%", "^", "&", "*", "("
    ];
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Window polyfill.
    
    (function () {
        var polyfillTarget = (WindowExist ? Window.prototype : window);
        
        if(!polyfillTarget.hasOwnProperty) {
            polyfillTarget.hasOwnProperty = hasOwnPropertyFunction;
        }
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //window.onload wrapper.
    
    window.onload = function () {
        if(typeof(defaultOnLoad) === "function") {
            defaultOnLoad.call(window);
        }
        
        if(typeof(karbonator.onload) === "function") {
            karbonator.onload.call(window);
        }
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //EventListenerOptions
    
    /**
     * @constructor
     * @param {Boolean} capture
     * @param {Boolean} once
     * @param {Boolean} passive
     */
    var EventListenerOptions = function (capture, once, passive) {
        switch(arguments.length) {
        case 0:
        break;
        case 1:
            switch(arguments[0]) {
            case "object":
                this.capture = arguments[0].capture;
                this.once = arguments[0].once;
                this.passive = arguments[0].passive;
            break;
            case "boolean":
                this.capture = capture;
            //break;
            }
        break;
        case 2:
            this.capture = !!capture;
            this.once = !!once;
        break;
        default:
            this.capture = !!capture;
            this.once = !!once;
            this.passive = !!passive;
        }
    };
    
    EventListenerOptions.prototype.capture = false;
    
    EventListenerOptions.prototype.once = false;
    
    EventListenerOptions.prototype.passive = false;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //EventListenerList
    
    /**
     * @constructor
     */
    var EventListenerList = function () {
        this._types = {};
    };
    
    EventListenerList._ListenerDescriptor = (function () {
        /**
         * @private
         * @memberof EventListenerList
         * @constructor
         * @param {Function} listener
         * @param {Object|Boolean} options
         */
        var _ListenerDescriptor = function (listener, options) {
            this._listener = listener;
            this._options = new EventListenerOptions(options);
        };
        
        /**
         * @function
         * @param {EventListenerList._ListenerDescriptor} rhs
         * @return {Boolean}
         */
        _ListenerDescriptor.prototype.equals = function (rhs) {
            return this._listener === rhs._listener
                && this._options.capture === rhs._options.capture
            ;
        };
        
        return _ListenerDescriptor;
    })();
    
    /**
     * @function
     * @param {String} type
     * @param {Function} listener
     * @param {Object|Boolean} options
     */
    EventListenerList.addListener = function (type, listener, options) {
        if(this._types[type] === "undefined") {
            this._types[type] = new ListSet(function (lhs, rhs) {return lhs.equals(rhs);});
        }
        
        this._types[type].add(new this.constructor._ListenerDescriptor(listener, options));
    };
    
    /**
     * @function
     * @param {String} type
     * @param {Function} listener
     * @param {Object|Boolean} options
     */
    EventListenerList.removeListener = function (type, listener, options) {
        if(this._types[type] === "undefined") {
            this._types[type] = new ListSet(function (lhs, rhs) {return lhs.equals(rhs);});
        }
        
        this._types[type].remove(new this.constructor._ListenerDescriptor(listener, options));
    };
    
    /**
     * @function
     * @param {String} type
     */
    EventListenerList.prototype.dispatchEvent = function () {
        
    };

    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Namespace private functions.
    
    /**
     * @function
     * @param {Object} target
     * @param {Object} prototype
     * @return {Object}
     */
    var fillProperties = function (target, prototype) {
        karbonator.mergeObjects(
            target,
            prototype,
            {
                copyNonOwnProperties : true,
                
                deepCopy : true,
                
                overwrite : false,
                
                ignoreExceptions : true
            }
        );
        
        return target;
    };
    
    /**
     * @function
     * @param {HTMLElement|HTMLDocument} element
     * @return {HTMLElement|HTMLDocument}
     */
    var fillElementPropertiesToElementTree = function (element) {
        karbonator.dom.traverseNodeByPreorder(
            element,
            function (node) {
                fillProperties(node, Element.prototype);
            }
        );
        
        return element;
    };
    
    /**
     * @function
     * @param {EventTarget} target
     * @param {String} type
     * @return {karbonator.collection.ListSet}
     */
    var getEventListenerSet = function (target, type) {
        var propName = listenerSetPrefix + type;
        if(typeof(target[propName]) === "undefined") {
            target[propName] = new karbonator.collection.ListSet(
                function(lhs, rhs) {
                    return lhs.listener === rhs.listener;
                }
            );
        }
        
        return target[propName];
    };
    
    /**
     * @function
     * @param {Object|Boolean} arg
     */
    var assertNotUsingEventCapturingOrListenerOptions = function (arg) {
        if(typeof(arg) === "boolean") {
            if(arg === true) {
                throw new Error("This browser doesn't support event capturing.");
            }
        }
        else if(typeof(arg) !== "undefined") {
            throw new Error("This browser doesn't support options feature.");
        }
    };
    
    /**
     * @function
     * @param {Event} e
     * @return {Event}
     */
    var wrapEvent = function (e) {
        e.target = (e.target || e.srcElement);
        
        var eProto = null;
        switch(e.type) {
        case "keydown":
        case "keypress":
        case "keyup":
            eProto = (KeyboardEventExist ? KeyboardEvent.prototype : Event.prototype);
            if(!e.key && e.keyCode) {
                e.key = convertKeyCodeToKeyString(e.keyCode, e.shiftKey);
            }
        break;
        case "click":
        case "dblclick":
        case "wheel":
        case "mousedown":
        case "mouseenter":
        case "mouseleave":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "mouseup":
        case "mousewheel":
            eProto = MouseEvent.prototype;
        break;
        default:
            eProto = Event.prototype;
        }
        
        return fillProperties(e, eProto);
    };
    
    /**
     * @function
     * @param {Number} keyCode
     * @param {Boolean} [shiftKey = false]
     * @return {String}
     */
    var convertKeyCodeToKeyString = function (keyCode, shiftKey) {
        var str = "";
        
        ///TODO : 나머지 채우기
        switch(keyCode) {
        case 8:
            str = "Backspace";
        break;
        case 9:
            str = "Tab";
        break;
        case 13:
            str = "Enter";
        break;
        case 16:
            str = "Shift";
        break;
        case 17:
            str = "Control";
        break;
        case 18:
            str = "Alt";
        break;
        case 19:
            str = "Pause";
        break;
        case 20:
            str = "CapsLock";
        break;
        case 21:
            str = "HangulMode";
        break;
        case 25:
            str = "HanjaMode";
        break;
        case 27:
            str = "Escape";
        break;
        case 32:
            str = String.fromCharCode(keyCode);
        break;
        case 37:
            str = "ArrowLeft";
        break;
        case 38:
            str = "ArrowUp";
        break;
        case 39:
            str = "ArrowRight";
        break;
        case 40:
            str = "ArrowDown";
        break;
        case 46:
            str = "Delete";
        break;
        case 48: case 49: case 50: case 51: case 52:
        case 53: case 54: case 55: case 56: case 57:
            str = (shiftKey ? shiftedNumberKeys[keyCode - 48] : String.fromCharCode(keyCode));
        break;
        case 65: case 66: case 67: case 68: case 69:
        case 70: case 71: case 72: case 73: case 74:
        case 75: case 76: case 77: case 78: case 79:
        case 80: case 81: case 82: case 83: case 84:
        case 85: case 86: case 87: case 88: case 89:
        case 90:
            str = String.fromCharCode(keyCode + (shiftKey ? 0 : latinCharCaseDiff));
        break;
        case 91:
            str = "Meta";
        break;
        case 93:
            str = "ContextMenu";
        break;
        case 112: case 113: case 114: case 115: case 116: case 117:
        case 118: case 119: case 120: case 121: case 122: case 123:
            str = "F" + (keyCode - 111);
        break;
        case 144:
            str = "NumLock";
        break;
        case 186:
            str = (shiftKey ? ":" : ";");
        break;
        case 187:
            str = (shiftKey ? "+" : "=");
        break;
        case 188:
            str = (shiftKey ? "<" : ",");
        break;
        case 190:
            str = (shiftKey ? ">" : ".");
        break;
        case 191:
            str = (shiftKey ? "?" : "/");
        break;
        case 192:
            str = (shiftKey ?  "~" : "`");
        break;
        case 219:
            str = (shiftKey ? "{" : "[");
        break;
        case 220:
            str = (shiftKey ? "|" : "\\");
        break;
        case 221:
            str = (shiftKey ? "}" : "]");
        break;
        case 222:
            str = (shiftKey ? "\"" : "'");
        break;
        default:
            str = "Unidentified";
        }
        
        return str;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Element polyfill.
    
    if(ElementExist) {
        if(!Element.prototype.hasOwnProperty) {
            Element.prototype.hasOwnProperty = hasOwnPropertyFunction;
        }
    }
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //document polyfill.
    
    (function () {
        var polyfillTarget = (HTMLDocumentExist ? HTMLDocument.prototype : document);
        
        if(!polyfillTarget.hasOwnProperty) {
            polyfillTarget.hasOwnProperty = hasOwnPropertyFunction;
        }
        
        if(!ElementExist) {
            var originalCreateElementFunction = polyfillTarget.createElement;
            
            polyfillTarget.createElement = function (tagName, options) {
                var element = originalCreateElementFunction.call(this, tagName, options);
                
                //fillProperties(element, Element.prototype);
                if(typeof(element.ownerDocument) === "undefined") {
                    element.ownerDocument = this;
                }
                
                return element;
            };
        }
    })();
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //ElementClassList
    
    /**
     * @constructor
     * @param {HTMLElement} element
     */
    var ElementClassList = function (element) {
        if(typeof(element) === "undefined" || element === null) {
            throw new TypeError("The parameter 'element' must be an instance of 'HTMLElement'.");
        }
        this._element = element;
        
        this._toArray();
        this._tokenListString = null;
        
        this.length = 0;
    };
    
    /**
     * @Function
     * @param {Number} index
     * @return {String}
     */
    ElementClassList.prototype.item = function (index) {
        return (this._toArray())[index];
    };
    
    /**
     * @Function
     * @param {String} token
     * @return {Boolean}
     */
    ElementClassList.prototype.contains = function (token) {
        return (token in (this._toArray()));
    };
    
    /**
     * @function
     * @param {String} token
     */
    ElementClassList.prototype.add = function (token) {
        this._toArray();
        
        if(!this._tokenArray.includes(token)) {
            this._tokenArray.push(token);
            ++this.length;
            
            this._tokenListString = null;
            this._element.className = this.toString();
        }
    };
    
    /**
     * @function
     * @param {String} token
     */
    ElementClassList.prototype.remove = function (token) {
        this._toArray();
        if(this.length < 1) {
            throw new Error("There's no token in the element style class.");
        }
        
        var index = this._tokenArray.indexOf(token);
        if(index >= 0) {
            this._tokenArray.splice(index, 1);
            --this.length;
            
            this._tokenListString = null;
            this._element.className = this.toString();
        }
    };
    
    /**
     * @function
     * @param {String} oldToken
     * @param {String} newToken
     */
    //ElementClassList.prototype.replace = function (oldToken, newToken) {};
    
    /**
     * @function
     * @param {String} token
     * @return {Boolean}
     */
    //ElementClassList.prototype.supports = function (token) {};
    
    /**
     * @function
     * @param {String} token
     * @param {Boolean} [force]
     */
    ElementClassList.prototype.toggle = function (token, force) {
        this._toArray();
        
        if(typeof(force) === "undefined") {
            var index = this._tokenArray.indexOf(token);
            if(index >= 0) {
                this.remove(token);
                return false;
            }
            else {
                this.add(token);
                return true;
            }
        }
        else {
            if(force) {
                this.add(token);
                return true;
            }
            else {
                this.remove(token);
                return false;
            }
        }
    };
    
    //ElementClassList.prototype.entries = function () {};
    
    //ElementClassList.prototype.keys = function () {};
    
    //ElementClassList.prototype.values = function () {};
    
    /**
     * @function
     * @param {Function} callback
     */
    //ElementClassList.prototype.forEach = function (callback) {};
    
    /**
     * @function
     * @return {String}
     */
    ElementClassList.prototype.toString = function () {
        if(!this._tokenListString) {
            this._toArray();
            
            var tokenCount = this._tokenArray.length;
            this._tokenListString = (tokenCount > 0 ? this._tokenArray[0] : "");
            
            for(var i = 1; i < tokenCount; ++i) {
                this._tokenListString += " ";
                this._tokenListString += this._tokenArray[i];
            }
        }
        
        return this._tokenListString;
    };
    
    /**
     * @function
     * @return {Array}
     */
    ElementClassList.prototype._toArray = function () {
        if(!this._tokenArray) {
            this._tokenArray = this._element.className.split(ElementClassList._tokenizeRegEx) || [];
            for(var i = 0; i < this._tokenArray.length; ++i) {
                this._tokenArray[i] = this._tokenArray[i].trim();
            }
            
            if(this._tokenArray.length > 0 && this._tokenArray[0] === "") {
                this._tokenArray = [];
            }
            
            this.length = this._tokenArray.length;
        }
        
        return this._tokenArray;
    };
    
    /**
     * @readonly
     */
    ElementClassList._tokenizeRegEx = /(^|\s{1,1})\w+($|\s{1,1})/;
    
    /**
     * @readonly
     */
    ElementClassList.prototype.length = 0;
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Node, Element polyfill.
    
    if(!NodeExist) {
        window.Node = (function () {
            var Node = function () {};
            
            Node.ELEMENT_NODE = 1;
            
            Node.TEXT_NODE = 3;
            
            Node.PROCESSING_INSTRUCTION_NODE = 7;
            
            Node.COMMENT_NODE = 8;
            
            Node.DOCUMENT_NODE = 9;
            
            Node.DOCUMENT_TYPE_NODE = 10;
            
            Node.DOCUMENT_FRAGMENT_NODE = 11;
            
            return Node;
        })();
    }
    
    if(!ElementExist) {
        window.Element = (function () {
            var Element = function () {};
            
            Element.prototype = (
                !NodeExist
                ? new Node()
                : karbonator.mergeObjects(
                    Element.prototype,
                    Node.prototype,
                    {
                        copyNonOwnProperties : true,
                        
                        deepCopy : true,
                        
                        overwrite : false,
                    
                        ignoreExceptions : true
                    }
                )
            );
            
            return Element;
        })();
    }
    else if(Object.defineProperty) {
        var propDesc = null;
        
        if(
            Object.getOwnPropertyDescriptor
            && (propDesc = Object.getOwnPropertyDescriptor(Element.prototype, "textContent"))
            && !propDesc.get
        ) {
            //var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
            Object.defineProperty(
                Element.prototype,
                "textContent",
                {
                    get : function () {
                        return karbonator.dom.getTextContent.call(this);
                    },
                    set : function (s) {
                        return karbonator.dom.setTextContent.call(this, s);
                    }
                }
            );
        }
        
        if(
            !NodeExist
            && !Object.prototype.hasOwnProperty.call(Element.prototype, "classList")
        ) {
            Object.defineProperty(
                Element.prototype,
                "classList",
                {
                    get : function () {
                        if(typeof(this._classList) === "undefined") {
                            this._classList = new ElementClassList(this);
                        }
                        
                        return this._classList;
                    }
                }
            );
        }
    }
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Event polyfill.
    
    if(!EventExist) {
        window.Event = function (typeArg, eventInit) {
            eventInit = karbonator.selectNonUndefined(
                eventInit,
                {
                    bubbles : false,
                    
                    cancelable : false,
                    
                    composed : false
                }
            );
            
            /*////////////////////////////////*/
            //readonly properties
            
            this.bubbles = false;
            this.cancelable = false;
            this.composed = false;
            this.currentTarget = null;
            this.defaultPrevented = false;
            this.eventPhase = 0;
            this.scoped = false;
            this.target = null;
            this.timeStamp = 0;
            this.type = "";
            this.isTrusted = true;
            
            /*////////////////////////////////*/
            
            this.initEvent(eventInit.type, eventInit.bubbles, eventInit.cancelable);
        };
        
        if(typeof(document.createEventObject) === "function") {
            Event.prototype = karbonator.mergeObjects(
                Event.prototype,
                document.createEventObject(),
                {
                    copyNonOwnProperties : true,
                    
                    deepCopy : true,
                    
                    overwrite : false,
                    
                    ignoreExceptions : true
                }
            );
        }
    }
    
    var eventStatusEnumNames = ["NONE", "CAPTURING_PHASE", "AT_TARGET", "BUBBLING_PHASE"];
    for(var i = 0; i < eventStatusEnumNames.length; ++i) {
        if(typeof(Event[eventStatusEnumNames[i]]) === "undefined") {
            Event[eventStatusEnumNames[i]] = i;
        }
    }
    
    if(!Event.prototype.initEvent) {
        karbonator.mergeObjects(
            Event.prototype,
            {
                initEvent : function (type, bubbles, cancelable) {
                    this.type = type;
                    this.target = this.srcElement;
                    this.cancelable = cancelable;
                },
                
                preventDefault : function () {
                    this.returnValue = false;
                    this.defaultPrevented = true;
                },
                
                stopImmediatePropagation : function () {
                    throw new Error("Not shimed yet...");
                },
                
                stopPropagation : function () {
                    this.cancelBubble = true;
                }
            },
            {
                copyNonOwnProperties : true,
                
                deepCopy : true,
                
                overwrite : false
            }
        );
    }
    
    if(!Event.prototype.hasOwnProperty) {
        Event.prototype.hasOwnProperty = hasOwnPropertyFunction;
    }
    
    var constructEvent = (function () {
        if(typeof(Event) === "object") {
            return function () {
                return document.createEventObject();
            };
        }
        else {
            return function () {
                return new Event();
            };
        }
    })();
    
    if(typeof(window.CustomEvent) === "undefined") {
        window.CustomEvent = (function () {
            var CustomEvent = function (type, customEventInit) {
                Event.prototype.initEvent.call(this, type, customEventInit.bubbles, customEventInit.cancelable);
                this.detail = null;
            };
            CustomEvent.prototype = constructEvent();
            
            CustomEvent.prototype.initCustomEvent = function (type, bubbles, cancelable, detail) {
                this.type = type;
                this.detail = (typeof detail !== "object" ? null : detail.detail);
            };
            
            return CustomEvent;
        })();
    }
    else if(typeof(window.CustomEvent) !== "function") {
        window.CustomEvent = (function () {
            var CustomEvent = function (event, params) {
                params = params || {bubbles: false, cancelable: false, detail: undefined};
                
                var e = document.createEvent("CustomEvent");
                e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                
                return e;
            };
            CustomEvent.prototype = window.Event.prototype;
            
            return CustomEvent;
        })();
    }
    
    if(!window.UIEvent) {
        window.UIEvent = (function () {
            var UIEvent = function (typeArg, UIEventInit) {
                UIEventInit = UIEventInit || {bubbles : false, cancelable : false, composed : false};
                Event.prototype.initEvent.call(this, typeArg, UIEventInit.bubbles, UIEventInit.cancelable);
            }
            UIEvent.prototype = constructEvent();
            
            UIEvent.prototype.initUIEvent = function (
                type, canBubble, cancelable,
                view, detail
            ) {
                throw new Error("Not shimed yet...");
            };
            
            return UIEvent;
        })();
    }
    
    if(!window.MouseEvent) {
        window.MouseEvent = (function () {            
            var MouseEvent = function (
                type, canBubble, cancelable,
                view, detail,
                screenX, screenY, clientX, clientY,
                ctrlKey, altKey, shiftKey, metaKey,
                button, relatedTarget
            ) {
                window.UIEvent.call(this, typeArg);
                this.initMouseEvent.apply(this, arguments);
            };
            MouseEvent.prototype = new window.UIEvent();
            
            MouseEvent.prototype.initMouseEvent = function (
                type, canBubble, cancelable,
                view, detail,
                screenX, screenY, clientX, clientY,
                ctrlKey, altKey, shiftKey, metaKey,
                button, relatedTarget
            ) {
                throw new Error("Not shimed yet...");
            };
            
            return MouseEvent;
        })();
    }
    
    if(!window.KeyboardEvent) {
        //TODO : 코드 작성
    }
    
    if(!document.createEvent) {
        document.createEvent = function (eventObjectType) {
            var event = null;
            
            switch(eventObjectType) {
            case "Event":
            case "HTMLEvents":
                event = constructEvent();
            break;
            case "CustomEvent":
                event = new CustomEvent();
            break;
            case "UIEvent":
            case "UIEvents":
                event = new UIEvent();
            break;
            case "KeyboardEvent":
                throw new Error("Not shimed yet...");
            break;
            case "MouseEvent":
            case "MouseEvents":
                event = new MouseEvent();
            break;
            case "TextEvent":
                throw new Error("Not shimed yet...");
            break;
            default:
                throw new Error("Unsupported yet...");
            }
            
            return event;
        };
    }
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //Namespace functions.
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {HTMLDocument} document
     * @param {String} str
     * @param {String} fontCssString
     * @return {Array}
     */
    dom.calculateRenderedStringSize = function (document, str, fontCssString) {
        var temp = document.createElement("div");
        temp.style.visibility = "hidden";
        temp.style.position = "fixed";
        temp.style.borderStyle = "none";
        temp.style.top = 
        temp.style.left = 
        temp.style.margin = 
        temp.style.padding = "0";
        temp.style.width = 
        temp.style.height = "auto";
        temp.style.whiteSpace = "nowrap";
        
        temp.style.font = fontCssString;
        this.setTextContent(temp, str);
        document.body.appendChild(temp);
        
        var size = [temp.clientWidth, temp.clientHeight];
        document.body.removeChild(temp);
        
        return size;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} root
     * @param {Function} handler
     * @param {Object} thisArg
     * @return {Boolean}
     */
    dom.traverseNodeByPreorder = function (root, handler, thisArg) {
        var nodeStack = [root];
        
        var continueTraversal = true;
        for(; continueTraversal && nodeStack.length > 0; ) {
            var current = nodeStack.pop();
            continueTraversal = !handler.call(thisArg, current, root);
            
            if(continueTraversal) {
                for(var i = current.childNodes.length; i > 0; ) {
                    nodeStack.push(current.childNodes[--i]);
                }
            }
        }
        
        return continueTraversal;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     * @return {Node}
     */
    dom.getRootNode = function (node) {
        //TODO : 구현
        return null;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     * @param {Node} otherNode
     */
    dom.isEqualNode = (function () {
        if(Node && Node.prototype.isEqualNode) {
            return function (node, otherNode) {
                return node.isEqualNode(otherNode);
            };
        }
        else {
            //TODO : prefix, namespaceURI, localName 처리
            //TODO : NamedNodeMaps 처리
            //TODO : DOCUMENT_TYPE_NODE 처리
            var isEqualNode = function (node, otherNode) {
                if(node.nodeType !== otherNode.nodeType) {
                    return false;
                }
                
                if(
                    (!karbonator.areBothNull(node.nodeName, otherNode.nodeName) || node.nodeName !== otherNode.nodeName)
                    || (!karbonator.areBothNull(node.nodeName, otherNode.nodeName) || node.nodeValue !== otherNode.nodeValue)
                ) {
                    return false;
                }
                
                if(
                    !karbonator.areBothNull(node.childNodes, otherNode.childNodes)
                    || (node.childNodes.length != otherNode.childNodes.length)
                ) {
                    return false;
                }
                for(var i = 0; i < node.childNodes.length; ++i) {
                    if(!isEqualNode(node.childNodes[i], otherNode.childNodes[i])) {
                        return false;
                    }
                }
                
                //DOCUMENT_TYPE_NODE
                if(node.nodeType == 10) {
                    //TODO : 코드 작성
                }
                
                return true;
            };
            
            return isEqualNode;
        }
    })();
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     * @param {Node} otherNode
     */
    dom.isSameNode = function (node, otherNode) {
        //TODO : 작동 확인
        return node === otherNode;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     */
    dom.removeAllChildren = function (node) {
        for(var child = node.lastChild; child ; ) {
            var target = child;
            child = child.previousSibling;
            
            node.removeChild(target);
        }
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     * @return {String}
     */
    dom.getTextContent = (function () {
        if(TextContentPropertySupported) {
            return function (node) {
                return node.textContent;
            };
        }
        else {
            return function (node) {
                var text = "";
                
                this.traverseNodeByPreorder(node, function (node, root) {
                    if(node.nodeType == 3) {
                        text += node.nodeValue;
                    }
                });
                
                return text;
            };
        }
    })();
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Node} node
     * @param {String} text
     * @return {String}
     */
    dom.setTextContent = (function () {
        if(TextContentPropertySupported) {
            return function (node, text) {
                return (node.textContent = text);
            };
        }
        else {
            return function (node, text) {
                this.removeAllChildren(node);
                node.appendChild(node.ownerDocument.createTextNode(text));
                
                return text;
            };
        }
    })();
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @param {String} name
     */
    dom.removeAttribute = function (element, name) {
        var index = Array.prototype.indexOf.call(element.attributes, name);
        if(index >= 0) {
            Array.prototype.splice.call(element.attributes, index, 1);
        }
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @param {String} name
     * @return {Boolean}
     */
    dom.hasAttribute = function (element, name) {
        var attr = element.attributes[name];
        
        return !!(attr && attr.specified);
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @return {Boolean}
     */
    dom.hasAttributes = function (element) {
        return element.attributes.length > 0;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @return {ElementClassList}
     */
    dom.getClassList = (function () {
        if(ElementExist && hasOwnPropertyFunction.call(Element.prototype, "classList")) {
            return function (element) {
                return element.classList;
            };
        }
        else {
            return function (element) {
                if(typeof(element.classList) === "undefined") {
                    element.classList = new ElementClassList(element);
                }
                
                return element.classList;
            };
        }
    })();
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @return {DOMRect}
     */
    dom.getBoundingClientRect = function (element) {
        //TODO : 구현
        return {
            left : 0,
            top : 0,
            right : 0,
            bottom : 0,
            x : 0,
            y : 0,
            width : 0,
            height : 0
        };
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @return {Array}
     */
    dom.getClientRects = function (element) {
        //TODO : 구현
        return [];
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element} element
     * @param {String} selectorString
     * @return {Boolean}
     */
    dom.matchesSelector = function (element, selectorString) {
        //TODO : 구현
        return false;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element|Document} element
     * @param {String} selectors
     * @return {Element}
     */
    dom.querySelector = function (element, selectors) {
        //TODO : 구현
        return null;
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {Element|Document} element
     * @param {String} selectors
     * @return {Array}
     */
    dom.querySelectorAll = function (element, selectors) {
        //TODO : 구현
        return [];
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {HTMLInputElement} element
     * @param {Number} selectionStart
     * @param {Number} selectionEnd
     */
    dom.setSelectionRange = function (inputElement, selectionStart, selectionEnd) {
        if(inputElement.setSelectionRange) {
            inputElement.focus();
            inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
        else if(inputElement.createTextRange) {
            var range = inputElement.createTextRange();
            range.collapse(true);
            range.moveEnd("character", selectionEnd);
            range.moveStart("character", selectionStart);
            range.select();
        }
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {String} eventType
     */
    dom.isBuiltInEventType = (function () {
        var builtInEventTypes = [
            "beforeunload",
            "blur",
            "change",
            "click",
            "contextmenu",
            "copy",
            "cut",
            "dblclick",
            "error",
            "focus",
            "focusin",
            "focusout",
            "hashchange",
            "keydown",
            "keypress",
            "keyup",
            "load",
            "mousedown",
            "mouseenter",
            "mouseleave",
            "mousemove",
            "mouseout",
            "mouseover",
            "mouseup",
            "mousewheel",
            "paste",
            "propertychange", //IE-exclusive
            "readystatechange",
            "reset",
            "resize",
            "scroll",
            "select",
            "submit",
            "textinput",
            "touchend",
            "touchmove",
            "touchstart",
            "unload",
            "wheel"
        ];
        
        return function (eventType) {
            return builtInEventTypes.includes(eventType);
        };
    })();
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {EventTarget} target
     * @param {Event} e
     */
    dom.dispatchEvent = function (target, e) {
        if(target.dispatchEvent) {
            target.dispatchEvent(e);
        }
        else {
            e.isTrusted = false;
            
            if(this.isBuiltInEventType(e.type)) {
                target.fireEvent("on" + e.type, e);
            }
            else {
                ++target[customEventPrefix + e.type];
            }
        }
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {EventTarget} target
     * @param {String} type
     * @param {Function} listener
     * @param {Object|Boolean} options
     */
    dom.addEventListener = function (target, type, listener, options) {
        if(target.addEventListener) {
            target.addEventListener(type, listener, options);
        }
        else if(target.attachEvent) {
            assertNotUsingEventCapturingOrListenerOptions(options);
            
            var wrapper = null;
            if(this.isBuiltInEventType(type)) {
                wrapper = function (e) {
                    listener(wrapEvent(e));
                };
                wrapper.originalHandler = listener;
                
                target.attachEvent("on" + type, wrapper);
            }
            else {
                wrapper = function (e) {
                    if(e.propertyName === customEventPrefix + type) {
                        listener(wrapEvent(e));
                    }
                };
                wrapper.originalHandler = listener;
                
                target.attachEvent("onpropertychange", wrapper);
            }
            
            getEventListenerSet(target, type).add({listener : listener, wrapper : wrapper});
        }
        else {
            throw new Error("This browser doesn't support DOM Level 2 event system.");
        }
    };
    
    /**
     * @memberof karbonator.dom
     * @function
     * @param {EventTarget} target
     * @param {String} type
     * @param {Function} listener
     * @param {Object|Boolean} options
     */
    dom.removeEventListener = function (target, type, listener, options) {
        if(target.removeEventListener) {
            target.removeEventListener(type, listener, options);
        }
        else if(target.detachEvent) {
            assertNotUsingEventCapturingOrListenerOptions(options);
            
            var listenerSet = getEventListenerSet(target, type);
            var index = listenerSet.findIndex({listener : listener});
            if(index >= 0) {
                target.detachEvent(
                    "on" + (this.isBuiltInEventType(type) ? type : "propertychange"),
                    listenerSet.get(index).wrapper
                );
            }
        }
        else {
            throw new Error("This browser doesn't support DOM Level 2 event system.");
        }
    };
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
