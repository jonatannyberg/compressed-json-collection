"use strict";
;
;
var CompressedJsonCollection = (function () {
    function CompressedJsonCollection(definition, items) {
        var _this = this;
        if (items === void 0) { items = []; }
        this._items = [];
        this.internalAdd = function (item) {
            _this._state.data.push(CompressedJsonCollection.diffEncode(item, _this._items[_this._items.length - 1], _this._state));
            CompressedJsonCollection.runlengthEncode(item, _this._state);
            _this._items.push(item);
        };
        this.internalOrderedAdd = function (item) {
            var items = _this.items;
            var diffEncode = CompressedJsonCollection.diffEncode;
            var rlEncode = CompressedJsonCollection.runlengthEncode;
            //
            // Add to empty collection
            //
            if (items.length == 0) {
                _this._state.data.push(diffEncode(item, null, _this._state));
                rlEncode(item, _this._state);
                items.push(item);
                //console.log('add to empty: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            var compare = _this._definition.sort;
            //
            // Add to the end of the collection
            // 
            if (compare(item, items[items.length - 1]) > -1) {
                _this._state.data.push(diffEncode(item, items[items.length - 1], _this._state));
                rlEncode(item, _this._state);
                items.push(item);
                //console.log('add to end: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            //
            // Add to the start of the collection
            //
            if (compare(item, items[0]) < 1) {
                _this._state.data.splice(0, 0, diffEncode(item, null, _this._state));
                items.splice(0, 0, item);
                _this._state.data[1] = diffEncode(items[1], item, _this._state);
                // Special treatment for run length in this case
                var state_1 = _this._state;
                for (var _i = 0, _a = state_1.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; }); _i < _a.length; _i++) {
                    var def = _a[_i];
                    var rlItem = state_1.runlengthData[def.dataIndex];
                    var newVal = item[def.parameter];
                    var nextVal = rlItem[0];
                    if (nextVal instanceof Object && nextVal.value === newVal) {
                        nextVal.count++;
                    }
                    else if (nextVal === newVal) {
                        state_1.runlengthData[def.dataIndex][0] = { count: 2, value: newVal };
                    }
                    else {
                        state_1.runlengthData[def.dataIndex].splice(0, 0, newVal);
                    }
                }
                //console.log('add to start: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            //
            // Add somewhere (...) in the collection (NOT empty collection or add to start/end of collection)
            // 
            // Binary search for insert location
            var minIdx = 0;
            var maxIdx = items.length;
            while (minIdx < maxIdx) {
                var mid = (minIdx + maxIdx) >>> 1;
                compare(item, items[mid]) > -1 && (minIdx = mid + 1) || (maxIdx = mid);
            }
            var insertAtIdx = minIdx;
            _this._state.data.splice(insertAtIdx, 0, diffEncode(item, items[insertAtIdx - 1], _this._state));
            items.splice(insertAtIdx, 0, item);
            _this._state.data[insertAtIdx + 1] = diffEncode(items[insertAtIdx + 1], items[insertAtIdx], _this._state);
            // Special treatment for run length in this case
            var state = _this._state;
            for (var _b = 0, _c = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; }); _b < _c.length; _b++) {
                var def = _c[_b];
                var rlItems = state.runlengthData[def.dataIndex];
                var newVal = item[def.parameter];
                // find item affected by run length insert
                var itemStartIdx = 0;
                var currRlItemIdx = 0;
                while (true) {
                    var item_1 = rlItems[currRlItemIdx];
                    var currItemCount = 0;
                    if (item_1 instanceof Object)
                        currItemCount = item_1.count;
                    else
                        currItemCount = 1;
                    if (itemStartIdx + currItemCount > insertAtIdx) {
                        break;
                    }
                    itemStartIdx += currItemCount;
                    currRlItemIdx++;
                }
                var currRlItem = rlItems[currRlItemIdx];
                if (currRlItem instanceof Object && currRlItem.value === newVal)
                    currRlItem.count++;
                else if (currRlItem === newVal)
                    rlItems[currRlItemIdx] = { count: 2, value: newVal };
                else {
                    var item_2 = currRlItem;
                    if (currRlItem instanceof Object) {
                        var itemA = { value: item_2.value, count: insertAtIdx - itemStartIdx };
                        var itemB = newVal;
                        var itemC = { value: item_2.value, count: item_2.count - itemA.count };
                        rlItems[currRlItemIdx] = itemA.count == 1 ? itemA.value : itemA;
                        rlItems.splice(currRlItemIdx + 1, 0, itemB, itemC.count == 1 ? itemC.value : itemC);
                    }
                    else {
                        rlItems.splice(currRlItemIdx, 0, newVal);
                    }
                }
            }
            //console.log('add general: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
            //console.log('state: ', this._state.runlengthData);
            //console.log('Insert idx: ', insertAtIdx);
            //console.log('items: ', items);
        };
        this._definition = definition;
        this._state = CompressedJsonCollection.createEmptyState(this._definition);
        this.add(items);
    }
    Object.defineProperty(CompressedJsonCollection.prototype, "definition", {
        get: function () { return this._definition; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompressedJsonCollection.prototype, "items", {
        get: function () { return this._items; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompressedJsonCollection.prototype, "compressedJson", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    CompressedJsonCollection.prototype.add = function (items) {
        items = (Array.isArray(items) ? items : [items]);
        if (this._definition.sort != null)
            items.sort(this._definition.sort);
        var filter = this._definition.insertionHandler;
        var itemsToAdd;
        if (filter != null && typeof filter === 'object')
            itemsToAdd = filter.insert(items, this);
        else
            itemsToAdd = filter == null ? items : items.filter(filter);
        var add = this._definition.sort != null ? this.internalOrderedAdd : this.internalAdd;
        for (var _i = 0, itemsToAdd_1 = itemsToAdd; _i < itemsToAdd_1.length; _i++) {
            var item = itemsToAdd_1[_i];
            add(item);
        }
    };
    CompressedJsonCollection.prototype.remove = function (items) {
        items = Array.isArray(items) ? items : [items];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var idxToRemove = this.items.indexOf(item);
            if (idxToRemove == -1)
                continue;
            this.items.splice(idxToRemove, 1);
            var state = this._state;
            state.data.splice(idxToRemove, 1);
            // Update runlength encodings
            for (var _a = 0, _b = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; }); _a < _b.length; _a++) {
                var def = _b[_a];
                var rlItems = state.runlengthData[def.dataIndex];
                var newVal = item[def.parameter];
                // find item affected by run length insert
                var itemStartIdx = 0;
                var currRlItemIdx = 0;
                while (true) {
                    var item_3 = rlItems[currRlItemIdx];
                    var currItemCount = item_3 instanceof Object ? item_3.count : 1;
                    if (itemStartIdx + currItemCount > idxToRemove) {
                        break;
                    }
                    itemStartIdx += currItemCount;
                    currRlItemIdx++;
                }
                var currRlItem = rlItems[currRlItemIdx];
                if (currRlItem instanceof Object && currRlItem.value === newVal)
                    currRlItem.count--;
                else if (currRlItem === newVal) {
                    rlItems.splice(currRlItemIdx, 1);
                }
            }
        }
    };
    CompressedJsonCollection.prototype.concat = function (collection) {
        throw new Error('Not implemented exception');
    };
    CompressedJsonCollection.prototype.filter = function (selector) {
        return new CompressedJsonCollection(this._definition, this._items.filter(selector));
    };
    CompressedJsonCollection.prototype.query = function (selector) {
        var items = this._items;
        var prevItem = null;
        var isFiltering = false;
        var newState = CompressedJsonCollection.createEmptyState(this._definition);
        for (var idx = 0; idx < items.length; idx++) {
            var item = items[idx];
            if (false == selector(item, idx, items)) {
                isFiltering = true;
                continue;
            }
            if (isFiltering == false)
                newState.data.push(this._state.data[idx]);
            else {
                var compressedItemState = CompressedJsonCollection.diffEncode(item, prevItem, newState);
                newState.data.push(compressedItemState);
            }
            CompressedJsonCollection.runlengthEncode(item, newState);
            isFiltering = false;
            prevItem = item;
        }
        return newState;
    };
    CompressedJsonCollection.decompress = function (state) {
        var items = [];
        var itemCount = state.data.length;
        for (var idx = 0; idx < itemCount; idx++)
            items[idx] = {};
        for (var defIdx = 0; defIdx < state.definitions.length; defIdx++) {
            var def = state.definitions[defIdx];
            if (def.definition.encoding === 2 /* RAW */) {
                for (var idx = 0; idx < itemCount; idx++) {
                    items[idx][def.parameter] = state.data[idx][def.dataIndex];
                }
            }
            if (def.definition.encoding === 1 /* DIFF */) {
                var d = def.definition;
                var f = (d.factor == null ? 1 : d.factor) * ((d.decimalDigits != null && d.type === 'number') ? Math.pow(10, d.decimalDigits) : 1);
                var prevVal = null;
                for (var idx = 0; idx < itemCount; idx++) {
                    var item = (state.data[idx][def.dataIndex]);
                    var val = 0;
                    if (item != null)
                        val = ((typeof item === "object" ? item.key : (prevVal == null ? 0 : prevVal) + item));
                    prevVal = val;
                    items[idx][def.parameter] = d.type === 'number' ? val / f : new Date(val / f);
                }
            }
            if (def.definition.encoding === 0 /* RUNLENGTH */) {
                var idx = 0;
                for (var _i = 0, _a = state.runlengthData[def.dataIndex]; _i < _a.length; _i++) {
                    var rlItem = _a[_i];
                    if (typeof rlItem === "object") {
                        for (var c = 0; c < rlItem.count; c++) {
                            items[idx++][def.parameter] = rlItem.value;
                        }
                    }
                    else {
                        items[idx++][def.parameter] = rlItem;
                    }
                }
            }
        }
        return items;
    };
    CompressedJsonCollection.diffEncode = function (curr, prev, state) {
        var itemCompressedState = [];
        var definitions = state.definitions.filter(function (d) { return d.definition.encoding === 2 /* RAW */ || d.definition.encoding === 1 /* DIFF */; });
        for (var dIdx = 0; dIdx < definitions.length; dIdx++) {
            var def = definitions[dIdx];
            var diff = def.definition.type === 'number' ? CompressedJsonCollection._numberDiff : CompressedJsonCollection._dateDiff;
            if (def.definition.encoding == 1 /* DIFF */)
                itemCompressedState.push(diff(curr[def.parameter], prev == null ? null : prev[def.parameter], def.definition));
            else
                itemCompressedState.push(curr[def.parameter]);
        }
        return itemCompressedState;
    };
    CompressedJsonCollection.runlengthEncode = function (item, state) {
        for (var _i = 0, _a = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; }); _i < _a.length; _i++) {
            var def = _a[_i];
            var rlItem = state.runlengthData[def.dataIndex];
            var newVal = item[def.parameter];
            var lastVal = rlItem[rlItem.length - 1];
            if (lastVal instanceof Object && lastVal.value === newVal)
                lastVal.count++;
            else if (lastVal === newVal)
                rlItem[rlItem.length - 1] = { count: 2, value: newVal };
            else
                rlItem.push(newVal);
        }
    };
    CompressedJsonCollection.createEmptyState = function (cacheDefinition) {
        var state = {
            definitions: new Array(),
            data: new Array(),
            runlengthData: new Array()
        };
        var propertyNames = Object.getOwnPropertyNames(cacheDefinition.properties).sort();
        var dataIdx = 0;
        for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
            var parameter = propertyNames_1[_i];
            var definition = cacheDefinition.properties[parameter];
            if (definition.encoding === 1 /* DIFF */ && definition.type == null) {
                definition.type = 'number';
            }
            var dataIndex = definition.encoding == 0 /* RUNLENGTH */ ? state.runlengthData.length : dataIdx++;
            state.definitions.push({ parameter: parameter, definition: definition, dataIndex: dataIndex });
            if (definition.encoding === 0 /* RUNLENGTH */)
                state.runlengthData.push([]);
        }
        return state;
    };
    CompressedJsonCollection._dateDiff = function (curr, prev, def) {
        if (curr == null)
            return null;
        var f = def.factor == null ? 1 : def.factor;
        var c = f !== 1 ? Math.round(curr * f) : curr;
        if (prev == null)
            return { key: c };
        var p = f !== 1 ? Math.round(prev * f) : prev;
        return c - p;
    };
    CompressedJsonCollection._numberDiff = function (curr, prev, def) {
        if (curr == null)
            return null;
        var f = (def.factor == null ? 1 : def.factor) * (def.decimalDigits ? Math.pow(10, def.decimalDigits) : 1);
        var c = f !== 1.0 ? Math.round(curr * f) : curr;
        if (prev == null)
            return { key: c };
        var p = f !== 1.0 ? Math.round(prev * f) : prev;
        return c - p;
    };
    return CompressedJsonCollection;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompressedJsonCollection;
