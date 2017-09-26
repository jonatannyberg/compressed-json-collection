"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventemitter3_1 = require("eventemitter3");
;
;
var CompressedJsonCollection = /** @class */ (function (_super) {
    __extends(CompressedJsonCollection, _super);
    function CompressedJsonCollection(definition, items) {
        if (items === void 0) { items = []; }
        var _this = _super.call(this) || this;
        _this._items = [];
        _this.internalAdd = function (item) {
            _this._state.data.push(CompressedJsonCollection.diffEncode(item, _this._items[_this._items.length - 1], _this._state));
            CompressedJsonCollection.runlengthEncode(item, _this._state);
            _this._items.push(item);
        };
        _this.internalOrderedAdd = function (item) {
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
                return;
            }
            //
            // Add somewhere (...) in the collection (NOT empty collection or start/end of collection)
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
                    if (itemStartIdx + currItemCount > insertAtIdx)
                        break;
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
        };
        _this._definition = definition;
        _this._state = CompressedJsonCollection.createEmptyState(_this._definition);
        _this.add(items);
        return _this;
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
    Object.defineProperty(CompressedJsonCollection.prototype, "cleanCompressedJson", {
        get: function () { return __assign({}, this._state, { definitions: undefined }); },
        enumerable: true,
        configurable: true
    });
    ;
    CompressedJsonCollection.prototype.add = function (items) {
        var _this = this;
        items = (Array.isArray(items) ? items : [items]);
        if (this._definition.sort != null)
            items.sort(this._definition.sort);
        var filter = this._definition.insertionHandler;
        var itemsToAdd = filter != null && typeof filter === 'object'
            ? filter.insert(items, this)
            : (filter == null ? items : items.filter(filter));
        var add = this._definition.sort != null ? this.internalOrderedAdd : this.internalAdd;
        itemsToAdd.forEach(function (item) {
            add(item);
            _this.emit('added', item);
        });
    };
    CompressedJsonCollection.prototype.remove = function (items) {
        var _this = this;
        (Array.isArray(items) ? items : [items])
            .map(function (item) { return _this.items.indexOf(item); })
            .sort(function (a, b) { return a > b ? -1 : a < b ? 1 : 0; })
            .filter(function (idx) { return idx != -1; })
            .forEach(function (item) { return _this.removeByIndex(item); });
    };
    CompressedJsonCollection.prototype.removeByIndex = function (from, to) {
        if (to != null && from > to)
            throw new Error("CompressedJsonCollection.removeByIndex: 'index' can not be greater than 'to'.");
        if (from > this.items.length - 1)
            throw new Error("Index 'index' is out of bounds.");
        if (to != null && to > this.items.length - 1)
            throw new Error("Index 'to' is out of bounds.");
        if (to == null)
            this.internalRemoveByIndex(from);
        else
            this.internalRemoveIndexRange(from, to);
    };
    CompressedJsonCollection.prototype.clear = function () {
        this._state = CompressedJsonCollection.createEmptyState(this._definition);
        this._items = [];
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
    CompressedJsonCollection.decompress = function (state, transform) {
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
        if (transform == null)
            return items;
        else
            return items.map(function (item) { return transform(state, item); });
    };
    CompressedJsonCollection.prototype.internalRemoveByIndex = function (index) {
        var idxToRemove = index;
        var item = this.items[idxToRemove];
        this.items.splice(idxToRemove, 1);
        var state = this._state;
        state.data.splice(idxToRemove, 1);
        if (this.items[idxToRemove] != null)
            state.data[idxToRemove] = CompressedJsonCollection.diffEncode(this.items[idxToRemove], this.items[idxToRemove - 1], this._state);
        // Update runlength encodings
        for (var _i = 0, _a = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; }); _i < _a.length; _i++) {
            var def = _a[_i];
            var rlItems = state.runlengthData[def.dataIndex];
            var removedVal = item[def.parameter];
            // find item affected by removal
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
            if (currRlItem instanceof Object && currRlItem.value === removedVal) {
                currRlItem.count--;
                if (currRlItem.count == 1)
                    rlItems[currRlItemIdx] = currRlItem.value;
            }
            else if (currRlItem === removedVal) {
                rlItems.splice(currRlItemIdx, 1);
            }
        }
        this.emit('removed', item);
    };
    // private internalRemoveIndexRange(from: number, to: number) {
    // 	const idxToRemove = from;
    // 	const state = this._state;
    // 	const removedItems = this.items.splice(idxToRemove, to - idxToRemove + 1);
    // 	state.data.splice(idxToRemove, to - idxToRemove + 1);
    // 	if (this.items[idxToRemove] != null)
    // 		state.data[idxToRemove] = CompressedJsonCollection.diffEncode(this.items[idxToRemove], this.items[idxToRemove - 1], this._state);
    // 	// Update runlength encodings
    // 	for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {
    // 		// find first item to be affected by removal
    // 		const rlItems = state.runlengthData[def.dataIndex];
    // 		let itemStartIdx = 0;
    // 		let currRlItemIdx = 0;
    // 		while (true) {
    // 			const item = rlItems[currRlItemIdx];
    // 			let currItemCount = item instanceof Object ? (<{ value: BaseParameter, count: number }>item).count : 1;
    // 			if (itemStartIdx + currItemCount > idxToRemove) { break; }
    // 			itemStartIdx += currItemCount;
    // 			currRlItemIdx++;
    // 		}
    // 		let itemCountToRemove = removedItems.length;
    // 		const currRlItem = rlItems[currRlItemIdx];
    // 		if (typeof currRlItem === 'object') {
    // 			const item = (<{ value: BaseParameter, count: number }>currRlItem);
    // 			console.log('Info', item.count - (idxToRemove - itemStartIdx), itemCountToRemove);
    // 			if (item.count - (idxToRemove - itemStartIdx) >= itemCountToRemove) {
    // 				console.log('here')
    // 				item.count = item.count + (idxToRemove - itemStartIdx) - itemCountToRemove;
    // 				if (item.count == 1)
    // 					rlItems[currRlItemIdx] = item.value;
    // 				else if (item.count == 0)
    // 					rlItems.splice(currRlItemIdx, 1);
    // 				itemCountToRemove = 0;
    // 			}
    // 			// else if (item.count - (idxToRemove - itemStartIdx) == itemCountToRemove) {
    // 			// 	console.log('Here');
    // 			// 	console.log(rlItems)
    // 			// 	rlItems.splice(currRlItemIdx, 1);
    // 			// 	console.log(rlItems)
    // 			// 	itemCountToRemove = 0;
    // 			// }
    // 			else {
    // 				item.count = item.count - (idxToRemove - itemStartIdx);
    // 				itemCountToRemove -= (idxToRemove - itemStartIdx);
    // 				if (item.count == 1)
    // 					rlItems[currRlItemIdx] = item.value;
    // 				currRlItemIdx++;
    // 			}
    // 		}
    // 		else {
    // 			rlItems.splice(currRlItemIdx, 1);
    // 			itemCountToRemove--;
    // 		}
    // 		while (itemCountToRemove > 0) {
    // 			const currRlItem = rlItems[currRlItemIdx];
    // 			if (typeof currRlItem === 'object') {
    // 				const item = (<{ value: BaseParameter, count: number }>currRlItem);
    // 				if (item.count > itemCountToRemove) {
    // 					item.count -= itemCountToRemove;
    // 					if (item.count == 1)
    // 						rlItems[currRlItemIdx] = item.value;
    // 					itemCountToRemove = 0;
    // 				}
    // 				else if (item.count == itemCountToRemove) {
    // 					rlItems.splice(currRlItemIdx, 1);
    // 					itemCountToRemove = 0;
    // 				}
    // 				else {
    // 					rlItems.splice(currRlItemIdx, 1);
    // 					itemCountToRemove -= item.count;
    // 				}
    // 			}
    // 			else {
    // 				rlItems.splice(currRlItemIdx, 1);
    // 				itemCountToRemove--;
    // 			}
    // 		}
    // 	}
    // 	removedItems.forEach(item => this.emit('removed', item));
    // }
    CompressedJsonCollection.prototype.internalRemoveIndexRange = function (from, to) {
        var _this = this;
        var state = this._state;
        var removedItems = this.items.splice(from, to - from + 1);
        state.data.splice(from, to - from + 1);
        if (this.items[from] != null)
            state.data[from] = CompressedJsonCollection.diffEncode(this.items[from], this.items[from - 1], this._state);
        // Update runlength encodings
        var rlDefs = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; });
        for (var _i = 0, rlDefs_1 = rlDefs; _i < rlDefs_1.length; _i++) {
            var def = rlDefs_1[_i];
            var rlItems = state.runlengthData[def.dataIndex];
            // find first item to be affected by removal
            var accumulatedIndex = 0;
            var firstRLItemIdx = 0;
            var firstItemRemoveCount = 0;
            while (true) {
                var item = rlItems[firstRLItemIdx];
                var currItemCount = item instanceof Object ? item.count : 1;
                if (accumulatedIndex + currItemCount > from) {
                    // if from and to is contained in the same rl item
                    if (accumulatedIndex + currItemCount > to) {
                        firstItemRemoveCount = to - from + 1;
                    }
                    else {
                        firstItemRemoveCount = currItemCount - (from - accumulatedIndex);
                    }
                    break;
                }
                accumulatedIndex += currItemCount;
                firstRLItemIdx++;
            }
            // find last item to be affected by removal
            var lastRLItemIdx = firstRLItemIdx;
            var lastItemRemoveCount = 0;
            while (true) {
                var item = rlItems[lastRLItemIdx];
                var currItemCount = item instanceof Object ? item.count : 1;
                if (accumulatedIndex + currItemCount > to) {
                    lastItemRemoveCount = to - accumulatedIndex + 1;
                    break;
                }
                accumulatedIndex += currItemCount;
                lastRLItemIdx++;
            }
            //console.log(`Affected RL items: ${firstRLItemIdx} (rm: ${firstItemRemoveCount}) to ${lastRLItemIdx} (rm: ${lastItemRemoveCount}) `);
            // Remove accumulated RL items that are completely removed
            if (lastRLItemIdx - firstRLItemIdx > 1) {
                rlItems.splice(firstRLItemIdx + 1, lastRLItemIdx - firstRLItemIdx - 1);
                lastRLItemIdx = firstRLItemIdx + 1;
            }
            var firstItem = rlItems[firstRLItemIdx];
            var lastItem = rlItems[lastRLItemIdx];
            // update first affected item
            if (typeof firstItem === 'object')
                firstItem.count -= firstItemRemoveCount;
            else {
                rlItems.splice(firstRLItemIdx, 1);
                firstRLItemIdx--;
                lastRLItemIdx--;
                firstItem = rlItems[firstRLItemIdx];
                lastItem = rlItems[lastRLItemIdx];
            }
            // update last affected item (if it is not the same item as the first one)
            if (firstRLItemIdx !== lastRLItemIdx) {
                if (typeof lastItem === 'object')
                    lastItem.count -= lastItemRemoveCount;
                else {
                    rlItems.splice(lastRLItemIdx, 1);
                    lastItem = rlItems[lastRLItemIdx];
                }
            }
            // remove first affected item if its count is zero
            if (typeof firstItem === 'object' && firstItem.count == 0) {
                rlItems.splice(firstRLItemIdx, 1);
                firstRLItemIdx--;
                lastRLItemIdx--;
                firstItem = rlItems[firstRLItemIdx];
                lastItem = rlItems[lastRLItemIdx];
            }
            // remove last affected item if its count is zero
            if (typeof lastItem === 'object' && lastItem.count != null && lastItem.count == 0) {
                rlItems.splice(lastRLItemIdx, 1);
            }
            // convert object with count one to value only
            firstItem != null && firstItem.count == 1 && (rlItems[firstRLItemIdx] = firstItem.value);
            lastItem != null && lastItem.count == 1 && (rlItems[lastRLItemIdx] = lastItem.value);
            firstItem = rlItems[firstRLItemIdx];
            lastItem = rlItems[lastRLItemIdx];
            // If we have both firs and last items they are now adjacent and could possibly contain the same type of value. 
            // If they do we combine them to one object
            if (firstItem != null && lastItem != null && lastRLItemIdx !== firstRLItemIdx) {
                if (typeof firstItem === 'object') {
                    if (typeof lastItem === 'object' && firstItem.value === lastItem.value) {
                        firstItem.count += lastItem.count;
                        rlItems.splice(lastRLItemIdx, 1);
                        lastRLItemIdx--;
                        lastItem = rlItems[lastRLItemIdx];
                    }
                    else if (lastItem === firstItem.value) {
                        firstItem.count += 1;
                        rlItems.splice(lastRLItemIdx, 1);
                        lastRLItemIdx--;
                        lastItem = rlItems[lastRLItemIdx];
                    }
                }
                else {
                    if (typeof lastItem === 'object' && firstItem === lastItem.value) {
                        lastItem.count += 1;
                        rlItems.splice(firstRLItemIdx, 1);
                        firstRLItemIdx--;
                        lastRLItemIdx--;
                        firstItem = rlItems[firstRLItemIdx];
                        lastItem = rlItems[lastRLItemIdx];
                    }
                    else if (lastItem === firstItem) {
                        rlItems[firstRLItemIdx] = { count: 2, value: firstItem };
                        rlItems.splice(lastRLItemIdx, 1);
                        lastRLItemIdx--;
                        lastItem = rlItems[lastRLItemIdx];
                    }
                }
            }
        }
        removedItems.forEach(function (item) { return _this.emit('removed', item); });
    };
    CompressedJsonCollection.diffEncode = function (curr, prev, state) {
        var itemCompressedState = [];
        var diffDefinitions = state.definitions.filter(function (d) { return d.definition.encoding === 2 /* RAW */ || d.definition.encoding === 1 /* DIFF */; });
        for (var _i = 0, diffDefinitions_1 = diffDefinitions; _i < diffDefinitions_1.length; _i++) {
            var def = diffDefinitions_1[_i];
            if (def.definition.encoding == 1 /* DIFF */) {
                var diff = def.definition.type === 'number' ? CompressedJsonCollection._numberDiff : CompressedJsonCollection._dateDiff;
                itemCompressedState.push(diff(curr[def.parameter], prev == null ? null : prev[def.parameter], def.definition));
            }
            else {
                itemCompressedState.push(curr[def.parameter]);
            }
        }
        return itemCompressedState;
    };
    CompressedJsonCollection.runlengthEncode = function (item, state) {
        var rlDefinitions = state.definitions.filter(function (d) { return d.definition.encoding === 0 /* RUNLENGTH */; });
        for (var _i = 0, rlDefinitions_1 = rlDefinitions; _i < rlDefinitions_1.length; _i++) {
            var def = rlDefinitions_1[_i];
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
        //return curr == null ? null : prev == null ? { key: def.factor == null ? curr : Math.round(curr * def.factor) } : (def.factor == null ? curr - prev : Math.round(curr * def.factor) - Math.round(prev * def.factor))
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
}(eventemitter3_1.EventEmitter));
exports.default = CompressedJsonCollection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHJlc3NlZEpzb25Db2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbXByZXNzZWRKc29uQ29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUE2QztBQUllLENBQUM7QUFHTixDQUFDO0FBcUN4RDtJQUF5RCw0Q0FBWTtJQVdwRSxrQ0FBWSxVQUFrRCxFQUFFLEtBQWU7UUFBZixzQkFBQSxFQUFBLFVBQWU7UUFBL0UsWUFDQyxpQkFBTyxTQUlQO1FBZE8sWUFBTSxHQUFRLEVBQUUsQ0FBQztRQXliakIsaUJBQVcsR0FBRyxVQUFDLElBQU87WUFFN0IsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuSCx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxLQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUE7UUFFTyx3QkFBa0IsR0FBRyxVQUFDLElBQU87WUFFcEMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQztZQUN6QixJQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUM7WUFDdkQsSUFBTSxRQUFRLEdBQUcsd0JBQXdCLENBQUMsZUFBZSxDQUFDO1lBRTFELEVBQUU7WUFDRiwwQkFBMEI7WUFDMUIsRUFBRTtZQUVGLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsS0FBSSxDQUFD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