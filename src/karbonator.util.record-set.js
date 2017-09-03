/**
 * author : Hydrawisk793
 * e-mail : hyw793&#x40;naver.com
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
        g.define(["karbonator.collection"], function (karbonator) {
            return factory(g, karbonator);
        });
    }
    else if(typeof(g.module) !== "undefined" && g.module.exports) {
        g.exports = g.module.exports = factory(g, require("karbonator.collection"));
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
    
    /**
     * @memberof karbonator
     * @namespace
     */
    var util = karbonator.util || {};
    karbonator.util = util;
    
    var Symbol = karbonator.getEsSymbol();
    
    /*////////////////////////////////////////////////////////////////*/
    //RecordSet
    
    /**
     * A UNORDERED set of records which are PROXY of data objects.
     * <br/>It manages insertion, update and removal of records, 
     * keeps track of the original values of data objects so that data objects can be rollbacked 
     * and can filter records which one is inserted, updated, removed and no changed.
     * <br/>Keep in mind that the order of records is NOT treated as a modification of a record set.
     * <br/>If you want to deal with the order of records, you could add an extra field called 'sortOrder' to records 
     * <br/>and use it to display records in viewports.
     * 
     * @memberof karbonator.util
     * @constructor
     * @param {iterable.<Object>} fieldDescs
     * @param {iterable.<Object>} [objs]
     */
    var RecordSet = function (fieldDescs) {
        this._fieldMap = new karbonator.collection.ListMap(karbonator.stringComparator);
        karbonator.forOf(
            fieldDescs,
            function (fieldDesc) {
                var field = new RecordSet.Field(fieldDesc);
                this._fieldMap.set(fieldDesc.name, field);
            },
            this
        );
        
        this._eventListeners = new karbonator.collection.ListSet(
            function (l, r) {
                return (l === r ? 0 : -1);
            }
        );
        
        this.options = {
            updateCurrentObjectArray : true
        };
        
        this._currentRecordMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        this._removedRecordMap = new karbonator.collection.TreeMap(karbonator.integerComparator);
        
        this._liveCurrentObjs = [];
        
        this._recordIdSeq = 0;
        this._records = [];
        var objs = arguments[1];
        if(!karbonator.isUndefinedOrNull(objs) && objs.isEsIterable()) {
            this.initialize(objs);
        }
    };
    
    /*////////////////////////////////*/
    //RecordSet.EditabilityCondition
    
    /**
     * A callback function to determine whether a record field is editable.
     * 
     * @callback karbonator.util.RecordSet.EditabilityCondition
     * @param {karbonator.util.RecordSet.Field} field
     * @param {karbonator.util.RecordSet.Record} record
     * @return {Boolean} true if editable, false otherwise.
     */
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RecordSet.Editability
    
    /**
     * Represents a field of a record is readonly or editable.
     * 
     * @memberof karbonator.util.RecordSet
     * @readonly
     * @enum {Number}
     */
    RecordSet.Editability = {
        readonly : 0,
        editable : 1,
        editableOnCondition : 2
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RecordSet.Field
    
    /**
     * @memberof karbonator.util.RecordSet
     * @constructor
     * @param {Object} desc
     */
    RecordSet.Field = function (desc) {
        if(karbonator.isUndefinedOrNull(desc)) {
            throw new TypeError("'desc' cannot be undefined or null.");
        }
        
        this._name = desc.name;
        if(!karbonator.isString(this._name)) {
            throw new TypeError("The name of a field must be a string.");
        }
        
        this._editability = desc.editability;
        if(karbonator.isUndefined(this._editability)) {
            this._editability = RecordSet.Field.Editability.editable;
        }
        else if(!karbonator.isNonNegativeSafeInteger(this._editability)) {
            throw new TypeError("editability must be a non-negative integer value of 'karbonator.util.RecordSet.Editability'.");
        }
        
        this._editabilityCondition = desc.editabilityCondition;
        if(karbonator.isUndefined(this._editabilityCondition)) {
            this._editabilityCondition = function (field, record) {
                record;
                
                return field.getEditability() !== RecordSet.Editability.readonly;
            };
        }
        else if(!karbonator.isFunction(this._editabilityCondition)) {
            throw new TypeError("'editabilityCondition' must be a function that satisfies 'karbonator.util.RecordSet.EditabilityCondition'.");
        }
        
        this._defaultValueGenerator = desc.defaultValueGenerator;
        if(karbonator.isUndefined(this._defaultValueGenerator)) {
            this._defaultValueGenerator = function () {
                return null;
            };
        }
        else if(!karbonator.isFunction(this._defaultValueGenerator)) {
            throw new TypeError("'defaultValueGenerator' must be a function.");
        }
        
        this._validator = desc.validator;
        if(karbonator.isUndefined(this._validator)) {
            this._validator = RecordSet.defaultValidator;
        }
        else if(!karbonator.isFunction(this._validator)) {
            throw new TypeError("'validator' must be a function.");
        }
        
        this._comparator = desc.comparator;
        if(karbonator.isUndefined(this._comparator)) {
            this._comparator = function (lhs, rhs) {
                return karbonator.stringComparator(
                    (karbonator.isUndefined(lhs) ? "" : lhs.toString()),
                    (karbonator.isUndefined(rhs) ? "" : rhs.toString())
                );
            };
        }
        else if(!karbonator.isFunction(this._comparator)) {
            throw new TypeError("'comparator' must be a function that satisfies 'karbonator.comparator'.");
        }
    };
    
    /**
     * @memberof karbonator.util.RecordSet.Field
     * @readonly
     * @param {karbonator.util.RecordSet.Field} lhs
     * @param {karbonator.util.RecordSet.Field} rhs
     * @return {Number}
     */
    RecordSet.Field.comparator = function (lhs, rhs) {
        return karbonator.stringComparator(lhs.getName(), rhs.getName());
    };
    
    /**
     * @function
     * @return {String}
     */
    RecordSet.Field.prototype.getName = function () {
        return this._name;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RecordSet.Field.prototype.getEditability = function () {
        return this._editability;
    };
    
    /**
     * @function
     * @param {karbonator.util.RecordSet.Record} record
     * @return {Boolean}
     */
    RecordSet.Field.prototype.testEditability = function (record) {
        return this._editabilityCondition(this, record);
    };
    
    /**
     * @function
     * @return {*}
     */
    RecordSet.Field.prototype.getDefaultValue = function () {
        return this._defaultValueGenerator();
    };
    
    /**
     * @function
     * @param {Object} value
     * @return {karbonator.util.RecordSet.ValidationResult}
     */
    RecordSet.Field.prototype.validate = function (value) {
        return this._validator(value);
    };
    
    /**
     * @function
     * @return {karbonator.comparator}
     */
    RecordSet.Field.prototype.getComparator = function () {
        return this._comparator;
    };
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RecordSet.Validator

    /**
     * @callback karbonator.util.RecordSet.Validator
     * @param {Object} value
     * @return {karbonator.util.RecordSet.ValidationResult}
     */
    
    /**
     * @memberof karbonator.util.RecordSet
     * @readonly
     * @param {*} value
     * @return {Object}
     */
    RecordSet.defaultValidator = function (value) {
        value;
        
        return ({
            valid : true,
            reason : ""
        });
    };

    /*////////////////////////////////*/

    /*////////////////////////////////*/
    //RecordSet.ValidationResult
    
    /**
     * @memberof karbonator.util.RecordSet
     * @constructor
     * @param {Boolean} valid
     * @param {String} reason
     */
    RecordSet.ValidationResult = function (valid, reason) {
        this.valid = valid;
        this.reason = reason;
    };
    
    /**
     * @type {Boolean}
     */
    RecordSet.ValidationResult.prototype.valid = true;
    
    /**
     * @type {String}
     */
    RecordSet.ValidationResult.prototype.reason = "";
    
    /*////////////////////////////////*/
    
    /*////////////////////////////////*/
    //RecordSet.Record
    
    /**
     * A proxy of an object.
     * <br/>When a field value changes, the record holds the original value of the field
     * <br/>, validates the new value and rejects it if invalid.
     * 
     * @memberof karbonator.util.RecordSet
     * @constructor
     * @param {karbonator.util.RecordSet} owner
     * @param {Number} id
     * @param {Number} originalIndex
     * @param {Object} obj
     */
    RecordSet.Record = function (owner, id, originalIndex, obj) {
        this._owner = owner;
        this._id = id;
        this._inserted = true;
        this._originalIndex = originalIndex;
        this._indexBeforeRemoved = originalIndex;
        this._obj = obj;
        this._cloneOfObj = karbonator.mergeObjects({}, obj);
    };
    
    /**
     * @function
     * @return {karbonator.util.RecordSet}
     */
    RecordSet.Record.prototype.getOwner = function () {
        return this._owner;
    };
    
    /**
     * @function
     * @return {Number}
     */
    RecordSet.Record.prototype.getId = function () {
        return this._id;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    RecordSet.Record.prototype.isInserted = function () {
        return this._inserted;
    };
    
    /**
     * @function
     * @return {Boolean}
     */
    RecordSet.Record.prototype.isModified = function () {
        var modified = false;
        karbonator.forOf(
            this.getOwner().getFieldNames(),
            function (fieldName) {
                return (modified = this.isFieldValueModified(fieldName));
            },
            this
        );
        
        return modified;
    };
    
    /**
     * @function
     * @return {Object}
     */
    RecordSet.Record.prototype.getObject = function () {
        return this._obj;
    };
    
    /**
     * @function
     * @param {String} name
     * @return {Object}
     */
    RecordSet.Record.prototype.getFieldValue = function (name) {
        return this._obj[this.getOwner()._assertFieldExists(name)];
    };
    
    /**
     * @function
     * @param {String} name
     * @param {Object} value
     */
    RecordSet.Record.prototype.setFieldValue = function (name, value) {
        var owner = this.getOwner();
        var field = owner.getFieldByName(name);
        var validationResult = field.validate(value);
        if(!validationResult.valid) {
            throw new Error("Validation failed" + " : " + validationResult.reason);
        }
        
        var oldValue = this._obj[name];
        this._obj[name] = value;
        
        owner._fireEvent(
            "fieldValueModified",
            {
                recordSet : owner,
                record : this,
                field : field,
                oldValue : oldValue,
                newValue : value
            }
        );
    };
    
    /**
     * @function
     * @param {String} name
     * @return {Object}
     */
    RecordSet.Record.prototype.getOriginalFieldValue = function (name) {
        return this._cloneOfObj[name];
    };
    
    /**
     * @function
     * @param {String} name
     * @return {Boolean}
     */
    RecordSet.Record.prototype.isFieldValueModified = function (name) {
        return this._obj[name] !== this._cloneOfObj[name];
    };
    
    /**
     * @function
     * @param {String} name
     */
    RecordSet.Record.prototype.rollbackFieldValue = function (name) {
        this._obj[name] = this._cloneOfObj[name];
    };
    
    /**
     * @function
     */
    RecordSet.Record.prototype.rollback = function () {
        karbonator.forOf(
            this.getOwner().getFieldNames(),
            function (fieldName) {
                this.rollbackFieldValue(fieldName);
            },
            this
        );
    };
    
    RecordSet.Record.prototype._commit = function (index) {
        this._inserted = false;
        this._originalIndex = index;
        this._indexBeforeRemoved = this._originalIndex;
        this._cloneOfObj = karbonator.mergeObjects({}, this._obj);
    };
    
    /**
     * @memberof karbonator.util.RecordSet.Record
     * @private
     * @function
     * @param {Number} id
     * @return {Number}
     */
    RecordSet.Record._assertRecordIdIsValid = function (id) {
        if(!karbonator.isNonNegativeSafeInteger(id)) {
            throw new TypeError("A record id must be a non-negative safe integer.");
        }
        
        if(id < 1) {
            throw new RangeError("A record id must be greater than zero.");
        }
        
        return id;
    };
    
    /*////////////////////////////////*/
    
    /**
     * @function
     * @param {iterable.<Object>} iterable
     */
    RecordSet.prototype.initialize = function (iterable) {
        if(!karbonator.isEsIterable(iterable)) {
            throw new TypeError("'iterable' must have a property 'Symbol.iterator'.");
        }
        
        this._recordIdSeq = 0;
        this._records = [];
        this._currentRecordMap.clear();
        this.insertRange(iterable);
        this.commit();
        
        if(!!this.options.updateCurrentObjectArray) {
            this._updateCurrentObjectArray();
        }
    };
    
    /**
     * 
     * 
     * @function
     * @return {Number}
     */
    RecordSet.prototype.getFieldCount = function () {
        return this._fieldMap.getElementCount();
    };
    
    /**
     * 
     * 
     * @function
     * @param {String} name
     * @return {Boolean}
     */
    RecordSet.prototype.hasField = function (name) {
        return this._fieldMap.has(name);
    };
    
    /**
     * 
     * 
     * @return {Array.<String>}
     */
    RecordSet.prototype.getFieldNames = function () {
        var fieldNames = [];
        karbonator.forOf(
            this._fieldMap,
            function (pair) {
                fieldNames.push(pair[1].getName());
            }
        );
        
        return fieldNames;
    };
    
    /**
     * 
     * 
     * @function
     * @param {Number} index
     * @return {karbonator.util.RecordSet.Field}
     */
    RecordSet.prototype.getFieldAt = function (index) {
        return this._fieldMap.getAt(index).value;
    };
    
    /**
     * 
     * 
     * @function
     * @param {String} name
     * @return {karbonator.util.RecordSet.Field}
     */
    RecordSet.prototype.getFieldByName = function (name) {
        var field = this._fieldMap.get(name);
        if(karbonator.isUndefined(field)) {
            throw new Error("No such field named '" + name + "' exists.");
        }
        
        return field;
    };
    
    /**
     * Retrieves the number of record count in the record set.
     * <br/>It does not count removed records.
     * 
     * @function
     * @return {Number}
     */
    RecordSet.prototype.getRecordCount = function () {
        return this._records.length;
    };
    
    /**
     * Retrieves a record at the specified index.
     * 
     * @function
     * @param {Number} index
     * @return {karbonator.util.RecordSet.Record}
     */
    RecordSet.prototype.getRecordAt = function (index) {
        return this._records[this._assertRecordIndexIsValid(index)];
    };
    
    /**
     * 
     * 
     * @function
     * @param {Number} id
     * @return {null|karbonator.util.RecordSet.Record}
     */
    RecordSet.prototype.getRecordById = function (id) {
        id = RecordSet.Record._assertRecordIdIsValid(id);
        var record = this._currentRecordMap.get(id);
        if(karbonator.isUndefined(record)) {
            record = this._removedRecordMap.get(id);
            record = (karbonator.isUndefined(record) ? null : record);
        }
        
        return record;
    };
    
    /**
     * Categorizes all records in the record set and returns them as a set of arrays.
     * - initial : Records that exists or had existed since the last commit.
     * - inserted : Records that has been inserted since the last commit.
     * - updated : Modified records that exists since the last commit.
     * - removed : Removed records that had existed since the last commit.
     * - current : Records that currently exists in the record set. the targets of committing.
     * 
     * @function
     * @return {Object}
     */
    RecordSet.prototype.listRecords = function () {
        var result = ({
            initial : [],
            inserted : [],
            updated : [],
            removed : [],
            current : []
        });
        
        karbonator.forOf(
            this._records,
            function (record) {
                result.current.push(record);
                
                if(record.isInserted()) {
                    result.inserted.push(record);
                }
                else {
                    if(record.isModified()) {
                        result.initial.push(record);
                        result.updated.push(record);
                    }
                    else {
                        result.initial.push(record);
                    }
                }
            },
            this
        );
        
        karbonator.forOf(
            this._removedRecordMap,
            function (pair) {
                var record = pair[1];
                if(!record.isInserted()) {
                    result.initial.push(record);
                    result.removed.push(record);
                }
            },
            this
        );
        
        result.initial.sort(
            function (lhs, rhs) {
                return lhs._originalIndex - rhs._originalIndex;
            }
        );
        
        return result;
    };
    
    /**
     * Retrieves an iterator that satisfies the ECMAScript standard.
     * 
     * @return {iterator}
     */
    RecordSet.prototype[Symbol.iterator] = function () {
        return Array.from(this.getCurrentObjectArray())[Symbol.iterator];
    };
    
    /**
     * Retrieves a live array of object in the record set.
     * 
     * @function
     * @return {Array.<Object>}
     */
    RecordSet.prototype.getCurrentObjectArray = function () {
        if(!this.options.updateCurrentObjectArray) {
            this._updateCurrentObjectArray();
        }
        
        return this._liveCurrentObjs;
    };
    
    /**
     * Tests if any insertion, update or removal of records has occured.
     * 
     * @function
     * @return {Boolean}
     */
    RecordSet.prototype.isModified = function () {
        var records = this.listRecords();
        
        return records.inserted.length > 0
            || records.updated.length > 0
            || records.removed.length > 0
        ;
    };
    
    /**
     * Creates a new record, wraps the specified object, and insert it into the record set.
     * <br/> If no object is specified, tries to insert an object which is created by default values of fields.
     * 
     * @function
     * @param {Object} [obj]
     * @param {Number} [index]
     * @return {karbonator.util.RecordSet.Record}
     */
    RecordSet.prototype.insert = function (obj) {
        if(karbonator.isUndefinedOrNull(obj)) {
            obj = this._createObjectWithDefaultValues();
        }
        
        var index = arguments[1];
        if(karbonator.isUndefined(index)) {
            index = this._records.length;
        }
        
        var record = this._createAndInsertRecordIntoRecordArrayAt(obj, index);
        
        this._fireEvent(
            "recordInserted",
            {
                recordSet : this,
                records : [record]
            }
        );
        
        return record;
    };
    
    /**
     * Creates new records, wraps the objects iterated by specified itrator, and insert them into the record set.
     * 
     * @function
     * @param {iterable} iterable
     * @param {Number} [index]
     * @return {Array.<karbonator.util.RecordSet.Record>}
     */
    RecordSet.prototype.insertRange = function (iterable) {
        var index = arguments[1];
        if(karbonator.isUndefined(index)) {
            index = this._records.length;
        }
        
        var records = [];
        karbonator.forOf(
            iterable,
            function (obj) {
                records.push(this._createAndInsertRecordIntoRecordArrayAt(obj, index));
                ++index;
            },
            this
        );

        this._fireEvent(
            "recordInserted",
            {
                recordSet : this,
                records : Array.from(records)
            }
        );
        
        return records;
    };
    
    /**
     * Removes records in the specified range.
     * <br/>Actually, they will NOT be destructed but MOVED to some kind of 'recycle bin' 
     * so that they will be recovered later unless the record set is committed.
     * 
     * @param {Number} index
     * @param {Number} [count=1]
     * @return {Array.<karbonator.util.RecordSet.Record>}
     */
    RecordSet.prototype.removeRange = function (index) {
        index = this._assertRecordIndexIsValid(index);
        
        var count = arguments[1];
        if(karbonator.isUndefined(count)) {
            count = 1;
        }
        else if(!karbonator.isNonNegativeSafeInteger(count)) {
            throw new TypeError("'count' must be a non-negative safe integer.");
        }
        else if(count < 1) {
            throw new RangeError("'count' must be greater than zero.");
        }
        
        var removedRecords = this._records.splice(index, count);
        var currentIndex = index;
        karbonator.forOf(
            removedRecords,
            function (removedRecord) {
                removedRecord._indexBeforeRemoved = currentIndex;
                ++currentIndex;
                
                var id = removedRecord.getId();
                this._removedRecordMap.set(id, removedRecord);
                this._currentRecordMap.remove(removedRecord.getId());
            },
            this
        );
        
        if(!!this.options.updateCurrentObjectArray) {
            this._liveCurrentObjs.splice(index, count);
        }
        
        this._fireEvent(
            "recordRemoved",
            {
                recordSet : this,
                records : Array.from(removedRecords)
            }
        );
        
        return removedRecords;
    };
        
//    RecordSet.prototype.moveRecord = function (srcIndex, destIndex) {
//        
//    };
//    
//    RecordSet.prototype.swapRecords = function (lhsIndex, rhsIndex) {
//        
//    };
    
    /**
     * Sorts records by the value of the specified field.
     * 
     * @function
     * @param {String} fieldName
     * @param {Boolean} [desc=false]
     */
    RecordSet.prototype.sortBy = function (fieldName) {
        var desc = !!arguments[1];
        var field = this.getFieldByName(fieldName);
        this._records.sort(
            function (lhs, rhs) {
                return (
                    desc
                    ? field.getComparator()(rhs.getFieldValue(fieldName), lhs.getFieldValue(fieldName))
                    : field.getComparator()(lhs.getFieldValue(fieldName), rhs.getFieldValue(fieldName))
                );
            }
        );
        
        if(!!this.options.updateCurrentObjectArray) {
            this._updateCurrentObjectArray();
        }
        
        this._fireEvent(
            "recordSorted",
            {
                recordSet : this,
                field : field,
                descendingOrder : desc
            }
        );
    };
    
    /**
     * 
     * 
     * @returns {Array.<karbonator.util.RecordSet.Record>}
     */
    RecordSet.prototype.getRemovedRecords = function () {
        var records = [];
        karbonator.forOf(
            this._removedRecordMap,
            function (pair) {
                records.push(pair[1]);
            }
        );
        
        return records;
    };
    
    /**
     * TODO : Redesign this method.
     * 
     * @param {iterable.<Number>} iterableIds
     * @return {Array.<karbonator.util.RecordSet.Record>}
     */
    RecordSet.prototype.recoverRemoved = function (iterableIds) {
        var recoveredRecords = [];
        karbonator.forOf(
            iterableIds,
            function (id) {
                var record = this._removedRecordMap.get(id);
                if(!karbonator.isUndefined(record)) {
                    this._removedRecordMap.remove(id);
                    
                    this._insertRecordIntoRecordArrayAt(record, record._indexBeforeRemoved);
                    
                    if(!!this.options.updateCurrentObjectArray) {
                        this._liveCurrentObjs.splice(
                            record._indexBeforeRemoved,
                            0,
                            record.getObject()
                        );
                    }
                    
                    recoveredRecords.push(record);
                }
            },
            this
        );

        this._fireEvent(
            "recordRecovered",
            {
                recordSet : this,
                records : Array.from(recoveredRecords)
            }
        );
        
        return recoveredRecords;
    };
    
    /**
     * Discards all changes occured after the last commit.
     * <br/>All inserted records will be removed permanantly.
     * <br/>Removed records that had existed since the last commit will be recovered.
     * <br/>All modified records will be restored to the original ones.
     * <br/>The order of records will be same as the initial one.
     * 
     * @function
     */
    RecordSet.prototype.rollback = function () {
        for(var i = this._records.length; i > 0; ) {
            --i;
            if(this._records[i].isInserted()) {
                this._records.splice(i, 1);
            }
        }
        
        karbonator.forOf(
            this._removedRecordMap,
            function (pair) {
                var record = pair[1];
                if(!record.isInserted()) {
                    this._insertRecordIntoRecordArrayAt(record, this._records.length);
                }
            },
            this
        );
        this._removedRecordMap.clear();
        
        for(var i = this._records.length; i > 0; ) {
            --i;
            this._records[i].rollback();
        }
        
        this._records.sort(function (lhs, rhs) {
            return lhs._originalIndex - rhs._originalIndex;
        });
        
        if(!!this.options.updateCurrentObjectArray) {
            this._updateCurrentObjectArray();
        }
    };
    
    /**
     * 
     * 
     * @function
     */
    RecordSet.prototype.commit = function () {
        this._removedRecordMap.clear();
        for(var j = this._records.length, i = 0; j > 0; ++i) {
            --j;
            this._records[i]._commit(i);
        }
        
        this._fireEvent(
            "recordSetCommitted",
            {
                recordSet : this
            }
        );
    };
    
    /**
     * @function
     * @param {Object} listener
     */
    RecordSet.prototype.addEventListener = function (listener) {
        this._eventListeners.add(listener);
    };
    
    /**
     * @function
     * @param {Object} listener
     */
    RecordSet.prototype.removeEventListener = function (listener) {
        this._eventListeners.remove(listener);
    };
    
    /**
     * @function
     */
    RecordSet.prototype.removeAllEventListeners = function () {
        this._eventListeners = [];
    };
    
    /**
     * @private
     * @function
     * @param {String} name
     * @param {Object} argObj
     */
    RecordSet.prototype._fireEvent = function (name, argObj) {
        karbonator.forOf(
            this._eventListeners,
            function (listener) {
                if(karbonator.isFunction(listener[name])) {
                    listener[name](argObj);
                }
            },
            this
        );
    };
    
    /**
     * @private
     * @function
     * @param {Object} obj
     * @param {Number} index
     * @return {karbonator.util.RecordSet.Record}
     */
    RecordSet.prototype._createAndInsertRecordIntoRecordArrayAt = function (obj, index) {
        index = this._assertRecordIndexIsValid(index);
        
        var validationResult = this._validateObject(obj);
        if(!validationResult.valid) {
            throw new Error("Validation failed : " + validationResult.reason);
        }
        
        var id = this._issueId();
        var record = new RecordSet.Record(this, id, index, obj);
        this._insertRecordIntoRecordArrayAt(record, index);
        
        if(!!this.options.updateCurrentObjectArray) {
            this._liveCurrentObjs.splice(index, 0, record.getObject());
        }
        
        return record;
    };
    
    /**
     * @private
     * @function
     * @param {karbonator.util.RecordSet.Record} record
     * @param {Number} index
     */
    RecordSet.prototype._insertRecordIntoRecordArrayAt = function (record, index) {
        this._records.splice(index, 0, record);
        this._currentRecordMap.set(record.getId(), record);
    };
    
    /**
     * @private
     * @function
     * @param {Object} obj
     * @return {karbonator.util.RecordSet.ValidationResult}
     */
    RecordSet.prototype._validateObject = function (obj) {
        if(karbonator.isUndefinedOrNull(obj)) {
            throw new TypeError("'obj' cannot be undefined or null.");
        }
        var validationResult = new RecordSet.ValidationResult();
        karbonator.forOf(
            this._fieldMap,
            function (pair) {
                var field = pair[1];
                validationResult = field.validate(obj[field.getName()]);
                if(!validationResult.valid) {
                    return true;
                }
            },
            this
        );
        
        return validationResult;
    };
    
    /**
     * @private
     * @function
     * @return {Number}
     */
    RecordSet.prototype._issueId = function () {
        return ++this._recordIdSeq;
    };
    
    /**
     * @private
     * @function
     */
    RecordSet.prototype._updateCurrentObjectArray = function () {
        this._liveCurrentObjs.length = 0;
        for(var i = 0; i < this._records.length; ++i) {
            this._liveCurrentObjs.push(this._records[i].getObject());
        }
    };
    
    /**
     * @function
     * @param {String} name
     * @return {String}
     */
    RecordSet.prototype._assertFieldExists = function (name) {
        if(!this.hasField(name)) {
            throw new Error("A field named '" + name + "' does not exist.");
        }
        
        return name;
    };
    
    /**
     * @private
     * @function
     * @param {Number} index
     * @return {Number}
     */
    RecordSet.prototype._assertRecordIndexIsValid = function (index) {
        if(!karbonator.isNonNegativeSafeInteger(index)) {
            throw new TypeError("'index' must be a non-negative safe integer.");
        }
        else if(index >= Number.MAX_SAFE_INTEGER) {
            throw new RangeError("'index' must be in the range [0, " + this._records.length + ").");
        }
        
        return index;
    };
    
    /**
     * @private
     * @function
     * @return {Object}
     */
    RecordSet.prototype._createObjectWithDefaultValues = function () {
        var obj = {};
        
        karbonator.forOf(
            this._fieldMap,
            function (pair) {
                var field = pair[1];
                obj[field.getName()] = field.getDefaultValue();
            },
            this
        );
        
        return obj;
    };
    
    util.RecordSet = RecordSet;
    
    /*////////////////////////////////////////////////////////////////*/
    
    return karbonator;
})
));
