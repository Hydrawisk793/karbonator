(function () {
    var karbonator = {};
    
    /**
     * @memberof karbonator
     * @function
     * @param {String} [id]
     * @param {Array.<String>} dependencies
     * @param {Function|Object} factory
     * @return {Object}
     */
    karbonator.defineModule = (function () {
        var impl = function (id, dependencies, factory) {
            if(typeof(id) !== "string") {
                throw new TypeError("The parameter 'id' must be a string.");
            }
            if(typeof(dependencies) !== "object" || !(dependencies instanceof global.Array)) {
                throw new TypeError("The parameter 'dependencies' must be an array.");
            }
            
            var modules = [];
            var newModule = null;
            
            switch(typeof(factory)) {
            case "function":
                newModule = factory.apply(global, modules);
            break;
            case "object":
                newModule = factory;
            break;
            default:
                throw new TypeError("The parameter 'factory' must be an object or a function.");
            }
            
            return newModule;
        };
        
        return function () {
            switch(arguments.length) {
            case 0:
                throw new Error("At least 1 argument must be passed.");
            break;
            case 1:
                return impl("", [], arguments[0]);
            break;
            case 2:
                return impl("", arguments[0], arguments[1]);
            //break;
            case 3:
            default:
                return impl(arguments[0], arguments[1], arguments[2]);
            }
        };
    })();
    
    /**
     * @memberof karbonator
     * @function
     * @param {String} path
     * @return {*}
     */
    karbonator.loadAndExecuteScript = (function () {
        switch(karbonator.environment.getType()) {
        case "WebBrowser":
            if(XMLHttpRequestSupported) {
                return function (path) {
                    var result = null;
                    
                    var xhr = new global.XMLHttpRequest();
                    xhr.open("GET", path, false);
                    xhr.setRequestHeader("Content-Type", "text/javascript");
                    xhr.onreadystatechange = function (e) {
                        switch(this.readyState) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        break;
                        case 4:
                            result = global.eval(this.responseText);
                        break;
                        }
                    };
                    xhr.onerror = function (e) {
                        throw new Error("Can't load the script at '" + path + "'.");
                    };
                    xhr.onabort = function (e) {
                        throw new Error("Can't load the script at '" + path + "'.");
                    };
                    xhr.send(null);
                    
                    return result;
                };
            }
            else {
                return function (path) {
                    throw new Error("This web browser does not support XMLHttpRequest.");
                };
            }
        //break;
        case "Node.js":
        default:
            if(typeof(global.require) !== "undefined") {
                //throw new Error("Not implementd yet...");
            }
            else {
                //throw new Error("Cannot load modules on this environment.");
            }
        }
    })();
})();
