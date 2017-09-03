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
    //TODO : Require the fucking jQuery...
    if(typeof(g.define) === "function" && g.define.amd) {
        g.define(["karbonator.util.record-set"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("karbonator.util.record-set"));
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
    
    //var detail = karbonator.detail;
    
    //var Array = global.Array;
    //var Symbol = detail._selectSymbol();
    //var Reflect = detail._selectReflect();
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var util = karbonator.util || {};
    karbonator.util = util;
    
    var RecordSet = karbonator.util.RecordSet;
    
    var jQuery = global.jQuery;
    if(karbonator.isUndefined(jQuery)) {
        throw new Error("'slick.grid.js' requires 'jquery.js'.");
    }
    
    var Slick = global.Slick;
    if(karbonator.isUndefined(Slick)) {
        throw new Error("Load 'slick.grid.js' first.");
    }
    
    /**
     * @memberof karbonator.util.RecordSet
     * @constructor
     * @param {karbonator.util.RecordSet} recordSet
     * @param {Slick.Grid} grid
     */
    var SlickGridBinder = function (recordSet, grid) {
        if(!(recordSet instanceof RecordSet)) {
            throw new TypeError("'recordSet' must be an instance of 'karbonator.util.RecordSet'.");
        }
        this._recordSet = recordSet;
        
        
        if(!(grid instanceof Slick.Grid)) {
            throw new TypeError("'grid' must be an instance of 'Slick.Grid'.");
        }
        this._grid = grid;
        this._gridOnBeforeEditCell = this._gridOnBeforeEditCell.bind(this);
        this._grid.onBeforeEditCell.subscribe(this._gridOnBeforeEditCell);
        this._gridOnCellChange = this._gridOnCellChange.bind(this);
        this._grid.onCellChange.subscribe(this._gridOnCellChange);
        this._gridOnValidationError = this._gridOnValidationError.bind(this);
        this._grid.onValidationError.subscribe(this._gridOnValidationError);
        this._gridOnSort = this._gridOnSort.bind(this);
        this._grid.onSort.subscribe(this._gridOnSort);
        this._modifiedCells = null;
        this._insertedCells = null;
        
        this._gridData = [];
    };
    
    SlickGridBinder.prototype._gridOnBeforeEditCell = function (e, args) {
        var continueEdit = false;
        
        switch(args.column.editability) {
        case RecordSet.Editability.readonly:
            continueEdit = false;
        break;
        case RecordSet.Editability.editable:
            continueEdit = true;
        break;
        case RecordSet.Editability.editableOnCondition:
            continueEdit = args.column.editabilityCondition(
                this._recordSet.getFieldAt(args.cell),
                this._recordSet.getRecordAt(args.row)
            );
        break;
        }
        
        return continueEdit;
    };
    
    SlickGridBinder.prototype._gridOnCellChange = function (e, args) {
        var record = this._recordSet.getRecordAt(args.row);
        if(!record.isInserted() && record.isFieldValueModified(this._recordSet.getFieldAt(args.cell).getName())) {
            if(!this._modifiedCells[args.row]) {
                this._modifiedCells[args.row] = {};
            }
            this._modifiedCells[args.row][this._grid.getColumns()[args.cell].id] = "modified-grid-cell";
            this._grid.setCellCssStyles("modified", this._modifiedCells);
            
            this._grid.invalidate();
        }
        
        return true;
    };
    
    SlickGridBinder.prototype._gridOnValidationError = function (e, args) {
        alert(args.validationResults.msg);
        
        return true;
    };
    
    SlickGridBinder.prototype._gridOnSort = function (e, args) {
        this._recordSet.sortBy(args.sortCol.field, !args.sortAsc);
        this._grid.invalidate();
    };
    
    RecordSet.SlickGridBinder = SlickGridBinder;
    
    return karbonator;
})
));
