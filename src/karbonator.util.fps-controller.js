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
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var util = {};
    karbonator.util = util;
    
    /*////////////////////////////////*/
    //FpsController
    
    util.FpsController = (function () {
        /**
         * @memberof karbonator.util
         * @constructor
         * @param {Number} fps
         * @param {Function} callback
         * @param {Object} [thisArg]
         */
        var FpsController = function (fps, callback) {
            this._fps = fps;
            this._delay = 1000 / fps;
            this._callback = callback.bind(arguments[2]);
            this._handle = 0;
            this._parameters = null;
        };
        
        /**
         * @function
         * @param {Object} parameters
         */
        FpsController.prototype.start = function (parameters) {
            this._loop = FpsController.prototype._loop.bind(this);
            this._handle = detail._requestAnimationFrame(this._loop);
            this._parameters = karbonator.selectNonUndefined(parameters, null);
            this._startTick = Date.now();
        };
        
        /**
         * @function
         */
        FpsController.prototype.stop = function () {
            this._parameters = null;
            detail._cancelAnimationFrame(this._handle);
        };
        
        /**
         * @private
         * @function
         */
        FpsController.prototype._loop = function () {
            this._currentTick = Date.now();
            this._elapsedTick = this._currentTick - this._startTick;
            if(this._elapsedTick >= this._delay) {
                this._callback(
                    this._parameters,
                    {
                        fpsController : this
                    }
                );
                this._startTick = this._currentTick;
            }
            
            this._handle = detail._requestAnimationFrame(this._loop);
        };
        
        return FpsController;
    })();
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
