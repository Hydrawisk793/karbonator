!function (global) {
    /**
     * @constructor
     * @function
     */
    var LetterCaseConverter = function () {
        this._smallBigDiff = ('a'.charCodeAt(0) - 'A'.charCodeAt(0));
    };
    
    /**
     * @function
     */
    LetterCaseConverter.prototype.insertDelimiter = function (targetString, delimiter, delimCharToLowerCase, initialToUpperCase) {
        var strArr = targetString.split("");
        
        for(var index = 0; index < strArr.length; ++index) {
            var c = strArr[index];
            if(c >= 'A' && c <= 'Z') {
                if(delimCharToLowerCase == true) {
                    strArr[index] = String.fromCharCode(c.charCodeAt(0) + this._smallBigDiff);
                }
                strArr.splice(index, 0, delimiter);
                ++index;
            }
        }
        
        if(initialToUpperCase == true) {
            this._setInitialToUpperCase(strArr);
        }
        
        return strArr.join("");
    };
    
    /**
     * @function
     */
    LetterCaseConverter.prototype.removeAllDelimiters = function (targetString, delimiter, initialToUpperCase) {
        var strArr = targetString.split("");
        
        for(var index = 0; index < strArr.length; ++index) {
            if(strArr[index] == delimiter) {
                strArr.splice(index, 1);
                
                var nextChar = strArr[index];
                if(nextChar >= 'a' && nextChar <= 'z') {
                    strArr[index] = String.fromCharCode(nextChar.charCodeAt(0) - this._smallBigDiff);
                }
            }
        }
        
        if(initialToUpperCase == true) {
            this._setInitialToUpperCase(strArr);
        }
        
        return strArr.join("");
    };
    
    /**
     * @private
     * @function
     */
    LetterCaseConverter.prototype._setInitialToUpperCase = function (strArr) {
        if(strArr[0] >= 'a' && strArr[0] <= 'z') {
            strArr[0] = String.fromCharCode(strArr[0].charCodeAt(0) - this._smallBigDiff);
        }
    };
    
    /**
     * @constructor
     * @function
     */
    var CamelCaseConverter = function (camelCaseString) {
        if(!constructor.isValid(camelCaseString)) {
            throw new Error("The parameter is not a camel case string.");
        }
        
        this._targetString = camelCaseString;
        this._smallBigDiff = ('a'.charCodeAt(0) - 'A'.charCodeAt(0));
    };
    
    /**
     * @function
     */
    CamelCaseConverter.isValid = function (targetString) {
        return /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(targetString);
    };
    
    /**
     * @function
     */
    CamelCaseConverter.prototype.toPascalCase = function () {
        var strArr = this._targetString.split("");
        
        if(strArr[0] >= 'a' && strArr[0] <= 'z') {
            strArr[0] = String.fromCharCode(strArr[0].charCodeAt(0) - this._smallBigDiff);
        }
        
        return strArr.join("");
    };
    
    /**
     * @function
     */
    CamelCaseConverter.prototype.toSnakeCase = function () {
        return this._insertDelimiter('_', true, false);
    };
    
    /**
     * @function
     */
    CamelCaseConverter.prototype.toScreamingSnakeCase = function () {
        return this._insertDelimiter('_', false, false).toUpperCase();
    };
    
    /**
     * @function
     */
    CamelCaseConverter.prototype.toKebabCase = function () {
        return this._insertDelimiter('-', true, false);
    };
    
    /**
     * @function
     */
    CamelCaseConverter.prototype.toTrainCase = function () {
        return this._insertDelimiter('-', false, true);
    };
    
    /**
     * @private
     * @function
     */
    CamelCaseConverter.prototype._insertDelimiter = function (delimiter, delimCharToLowerCase, initialToUpperCase) {
        var strArr = this._targetString.split("");
        
        for(var index = 0; index < strArr.length; ++index) {
            var c = strArr[index];
            if(c >= 'A' && c <= 'Z') {
                if(delimCharToLowerCase == true) {
                    strArr[index] = String.fromCharCode(c.charCodeAt(0) + this._smallBigDiff);
                }
                strArr.splice(index, 0, delimiter);
                ++index;
            }
        }
        
        if(initialToUpperCase == true) {
            if(strArr[0] >= 'a' && strArr[0] <= 'z') {
                strArr[0] = String.fromCharCode(strArr[0].charCodeAt(0) - this._smallBigDiff);
            }
        }
        
        return strArr.join("");
    };
    
    /**
     * @constructor
     * @function
     */
    var KebabCaseConverter = function (kebabCaseString) {
        if(!constructor.isValid(kebabCaseString)) {
            throw new Error("The parameter is not a kebab case string.");
        }

        this._targetString = kebabCaseString;        
        this._smallBigDiff = ('a'.charCodeAt(0) - 'A'.charCodeAt(0));
    };
    
    /**
     * @function
     */
    KebabCaseConverter.isValid = function (targetString) {
        return /^[a-z][a-z0-9]*(-[a-z0-9]*)*$/.test(targetString);
    };
    
    /**
     * @function
     */
    KebabCaseConverter.prototype.toPascalCase = function () {
        return this._removeAllDelimiters('-', true);
    };
    
    /**
     * @function
     */
    KebabCaseConverter.prototype.toCamelCase = function () {
        return this._removeAllDelimiters('-', false);
    };
    
    /**
     * @function
     */
    KebabCaseConverter.prototype.toSnakeCase = function () {
        return this._targetString.replace(/-/g, '_');
    };
    
    /**
     * @function
     */
    KebabCaseConverter.prototype.toScreamingSnakeCase = function () {
        return this.toSnakeCase().toUpperCase();
    };
    
    /**
     * @function
     */
    KebabCaseConverter.prototype.toTrainCase = function () {
        var strArr = this._targetString.split("");
        
        for(var index = 0; index < strArr.length; ++index) {
            if(strArr[index] == '-') {
                ++index;
                
                var nextChar = strArr[index];
                if(nextChar >= 'a' && nextChar <= 'z') {
                    strArr[index] = String.fromCharCode(nextChar.charCodeAt(0) - this._smallBigDiff);
                }
            }
        }
        
        if(strArr[0] >= 'a' && strArr[0] <= 'z') {
            strArr[0] = String.fromCharCode(strArr[0].charCodeAt(0) - this._smallBigDiff);
        }
        
        return strArr.join("");
    };
        
    /**
     * @private
     * @function
     */
    KebabCaseConverter.prototype._removeAllDelimiters = function (delimiter, initialToUpperCase) {
        var strArr = this._targetString.split("");
        
        for(var index = 0; index < strArr.length; ++index) {
            if(strArr[index] == delimiter) {
                strArr.splice(index, 1);
                
                var nextChar = strArr[index];
                if(nextChar >= 'a' && nextChar <= 'z') {
                    strArr[index] = String.fromCharCode(nextChar.charCodeAt(0) - this._smallBigDiff);
                }
            }
        }
        
        if(initialToUpperCase == true) {
            if(strArr[0] >= 'a' && strArr[0] <= 'z') {
                strArr[0] = String.fromCharCode(strArr[0].charCodeAt(0) - this._smallBigDiff);
            }
        }
        
        return strArr.join("");
    };
}(this);
