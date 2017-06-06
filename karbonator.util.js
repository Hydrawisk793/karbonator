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
        define(["./karbonator.core"], function (dom) {
            return moduleFactory(g, dom);
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
         */
        var FpsController = function (fps, callback) {
            this._fps = fps;
            this._delay = 1000 / fps;
            this._callback = callback;
            this._handle = 0;
            this._parameters = null;
        };
        
        /**
         * @function
         * @param {Object} parameters
         */
        FpsController.prototype.start = function (parameters) {
            this._loop = FpsController.prototype._loop.bind(this);
            this._handle = karbonator.environment.requestAnimationFrame(this._loop);
            this._parameters = karbonator.selectNonUndefined(parameters, null);
            this._startTick = Date.now();
        };
        
        /**
         * @function
         */
        FpsController.prototype.stop = function () {
            this._parameters = null;
            karbonator.environment.cancelAnimationFrame(this._handle);
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
                    {},
                    this._parameters
                );
                this._startTick = this._currentTick;
            }
            
            this._handle = karbonator.environment.requestAnimationFrame(this._loop);
        };
        
        return FpsController;
    })();
    
    /*////////////////////////////////*/
    
    return karbonator;
})
));
