"use strict";
;
;
class CompressedJsonCollection {
    constructor(definition, items = []) {
        this._items = [];
        this.internalAdd = (item) => {
            this._state.data.push(CompressedJsonCollection.diffEncode(item, this._items[this._items.length - 1], this._state));
            CompressedJsonCollection.runlengthEncode(item, this._state);
            this._items.push(item);
        };
        this.internalOrderedAdd = (item) => {
            const items = this.items;
            const diffEncode = CompressedJsonCollection.diffEncode;
            const rlEncode = CompressedJsonCollection.runlengthEncode;
            //
            // Add to empty collection
            //
            if (items.length == 0) {
                this._state.data.push(diffEncode(item, null, this._state));
                rlEncode(item, this._state);
                items.push(item);
                //console.log('add to empty: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            const compare = this._definition.sort;
            //
            // Add to the end of the collection
            // 
            if (compare(item, items[items.length - 1]) > -1) {
                this._state.data.push(diffEncode(item, items[items.length - 1], this._state));
                rlEncode(item, this._state);
                items.push(item);
                //console.log('add to end: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            //
            // Add to the start of the collection
            //
            if (compare(item, items[0]) < 1) {
                this._state.data.splice(0, 0, diffEncode(item, null, this._state));
                items.splice(0, 0, item);
                this._state.data[1] = diffEncode(items[1], item, this._state);
                // Special treatment for run length in this case
                const state = this._state;
                for (const def of state.definitions.filter(d => d.definition.encoding === 0 /* RUNLENGTH */)) {
                    const rlItem = state.runlengthData[def.dataIndex];
                    const newVal = item[def.parameter];
                    const nextVal = rlItem[0];
                    if (nextVal instanceof Object && nextVal.value === newVal) {
                        nextVal.count++;
                    }
                    else if (nextVal === newVal) {
                        state.runlengthData[def.dataIndex][0] = { count: 2, value: newVal };
                    }
                    else {
                        state.runlengthData[def.dataIndex].splice(0, 0, newVal);
                    }
                }
                //console.log('add to start: ', CompressedJsonCollection.decompress<T>(this._state), this._state.runlengthData);
                return;
            }
            //
            // Add somewhere (...) in the collection (NOT empty collection or add to start/end of collection)
            // 
            // Binary search for insert location
            let minIdx = 0;
            let maxIdx = items.length;
            while (minIdx < maxIdx) {
                const mid = (minIdx + maxIdx) >>> 1;
                compare(item, items[mid]) > -1 && (minIdx = mid + 1) || (maxIdx = mid);
            }
            const insertAtIdx = minIdx;
            this._state.data.splice(insertAtIdx, 0, diffEncode(item, items[insertAtIdx - 1], this._state));
            items.splice(insertAtIdx, 0, item);
            this._state.data[insertAtIdx + 1] = diffEncode(items[insertAtIdx + 1], items[insertAtIdx], this._state);
            // Special treatment for run length in this case
            const state = this._state;
            for (const def of state.definitions.filter(d => d.definition.encoding === 0 /* RUNLENGTH */)) {
                const rlItems = state.runlengthData[def.dataIndex];
                const newVal = item[def.parameter];
                // find item affected by run length insert
                let itemStartIdx = 0;
                let currRlItemIdx = 0;
                while (true) {
                    const item = rlItems[currRlItemIdx];
                    let currItemCount = 0;
                    if (item instanceof Object)
                        currItemCount = item.count;
                    else
                        currItemCount = 1;
                    if (itemStartIdx + currItemCount > insertAtIdx) {
                        break;
                    }
                    itemStartIdx += currItemCount;
                    currRlItemIdx++;
                }
                const currRlItem = rlItems[currRlItemIdx];
                if (currRlItem instanceof Object && currRlItem.value === newVal)
                    currRlItem.count++;
                else if (currRlItem === newVal)
                    rlItems[currRlItemIdx] = { count: 2, value: newVal };
                else {
                    const item = currRlItem;
                    if (currRlItem instanceof Object) {
                        let itemA = { value: item.value, count: insertAtIdx - itemStartIdx };
                        let itemB = newVal;
                        let itemC = { value: item.value, count: item.count - itemA.count };
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
    get definition() { return this._definition; }
    get items() { return this._items; }
    get compressedJson() { return this._state; }
    add(items) {
        items = (Array.isArray(items) ? items : [items]);
        if (this._definition.sort != null)
            items.sort(this._definition.sort);
        let filter = this._definition.insertionHandler;
        let itemsToAdd;
        if (filter != null && typeof filter === 'object')
            itemsToAdd = filter.insert(items, this);
        else
            itemsToAdd = filter == null ? items : items.filter(filter);
        const add = this._definition.sort != null ? this.internalOrderedAdd : this.internalAdd;
        for (const item of itemsToAdd)
            add(item);
    }
    remove(items) {
        items = Array.isArray(items) ? items : [items];
        for (const item of items) {
            const idxToRemove = this.items.indexOf(item);
            if (idxToRemove == -1)
                continue;
            this.items.splice(idxToRemove, 1);
            const state = this._state;
            state.data.splice(idxToRemove, 1);
            // Update runlength encodings
            for (const def of state.definitions.filter(d => d.definition.encoding === 0 /* RUNLENGTH */)) {
                const rlItems = state.runlengthData[def.dataIndex];
                const newVal = item[def.parameter];
                // find item affected by run length insert
                let itemStartIdx = 0;
                let currRlItemIdx = 0;
                while (true) {
                    const item = rlItems[currRlItemIdx];
                    let currItemCount = item instanceof Object ? item.count : 1;
                    if (itemStartIdx + currItemCount > idxToRemove) {
                        break;
                    }
                    itemStartIdx += currItemCount;
                    currRlItemIdx++;
                }
                const currRlItem = rlItems[currRlItemIdx];
                if (currRlItem instanceof Object && currRlItem.value === newVal)
                    currRlItem.count--;
                else if (currRlItem === newVal) {
                    rlItems.splice(currRlItemIdx, 1);
                }
            }
        }
    }
    concat(collection) {
        throw new Error('Not implemented exception');
    }
    filter(selector) {
        return new CompressedJsonCollection(this._definition, this._items.filter(selector));
    }
    query(selector) {
        const items = this._items;
        let prevItem = null;
        let isFiltering = false;
        const newState = CompressedJsonCollection.createEmptyState(this._definition);
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            if (false == selector(item, idx, items)) {
                isFiltering = true;
                continue;
            }
            if (isFiltering == false)
                newState.data.push(this._state.data[idx]);
            else {
                const compressedItemState = CompressedJsonCollection.diffEncode(item, prevItem, newState);
                newState.data.push(compressedItemState);
            }
            CompressedJsonCollection.runlengthEncode(item, newState);
            isFiltering = false;
            prevItem = item;
        }
        return newState;
    }
    static decompress(state) {
        const items = [];
        const itemCount = state.data.length;
        for (let idx = 0; idx < itemCount; idx++)
            items[idx] = {};
        for (let defIdx = 0; defIdx < state.definitions.length; defIdx++) {
            const def = state.definitions[defIdx];
            if (def.definition.encoding === 2 /* RAW */) {
                for (let idx = 0; idx < itemCount; idx++) {
                    items[idx][def.parameter] = state.data[idx][def.dataIndex];
                }
            }
            if (def.definition.encoding === 1 /* DIFF */) {
                let d = def.definition;
                const f = (d.factor == null ? 1 : d.factor) * ((d.decimalDigits != null && d.type === 'number') ? Math.pow(10, d.decimalDigits) : 1);
                let prevVal = null;
                for (let idx = 0; idx < itemCount; idx++) {
                    const item = (state.data[idx][def.dataIndex]);
                    let val = 0;
                    if (item != null)
                        val = ((typeof item === "object" ? item.key : (prevVal == null ? 0 : prevVal) + item));
                    prevVal = val;
                    items[idx][def.parameter] = d.type === 'number' ? val / f : new Date(val / f);
                }
            }
            if (def.definition.encoding === 0 /* RUNLENGTH */) {
                let idx = 0;
                for (const rlItem of state.runlengthData[def.dataIndex]) {
                    if (typeof rlItem === "object") {
                        for (let c = 0; c < rlItem.count; c++) {
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
    }
    static diffEncode(curr, prev, state) {
        const itemCompressedState = [];
        const definitions = state.definitions.filter(d => d.definition.encoding === 2 /* RAW */ || d.definition.encoding === 1 /* DIFF */);
        for (var dIdx = 0; dIdx < definitions.length; dIdx++) {
            const def = definitions[dIdx];
            let diff = def.definition.type === 'number' ? CompressedJsonCollection._numberDiff : CompressedJsonCollection._dateDiff;
            if (def.definition.encoding == 1 /* DIFF */)
                itemCompressedState.push(diff(curr[def.parameter], prev == null ? null : prev[def.parameter], def.definition));
            else
                itemCompressedState.push(curr[def.parameter]);
        }
        return itemCompressedState;
    }
    static runlengthEncode(item, state) {
        for (const def of state.definitions.filter(d => d.definition.encoding === 0 /* RUNLENGTH */)) {
            const rlItem = state.runlengthData[def.dataIndex];
            const newVal = item[def.parameter];
            const lastVal = rlItem[rlItem.length - 1];
            if (lastVal instanceof Object && lastVal.value === newVal)
                lastVal.count++;
            else if (lastVal === newVal)
                rlItem[rlItem.length - 1] = { count: 2, value: newVal };
            else
                rlItem.push(newVal);
        }
    }
    static createEmptyState(cacheDefinition) {
        const state = {
            definitions: new Array(),
            data: new Array(),
            runlengthData: new Array()
        };
        const propertyNames = Object.getOwnPropertyNames(cacheDefinition.properties).sort();
        let dataIdx = 0;
        for (let parameter of propertyNames) {
            const definition = cacheDefinition.properties[parameter];
            if (definition.encoding === 1 /* DIFF */ && definition.type == null) {
                definition.type = 'number';
            }
            const dataIndex = definition.encoding == 0 /* RUNLENGTH */ ? state.runlengthData.length : dataIdx++;
            state.definitions.push({ parameter, definition, dataIndex });
            if (definition.encoding === 0 /* RUNLENGTH */)
                state.runlengthData.push([]);
        }
        return state;
    }
}
CompressedJsonCollection._dateDiff = (curr, prev, def) => {
    if (curr == null)
        return null;
    const f = def.factor == null ? 1 : def.factor;
    const c = f !== 1 ? Math.round(curr * f) : curr;
    if (prev == null)
        return { key: c };
    const p = f !== 1 ? Math.round(prev * f) : prev;
    console.log(def.factor);
    console.log(c - p);
    return c - p;
};
CompressedJsonCollection._numberDiff = (curr, prev, def) => {
    if (curr == null)
        return null;
    const f = (def.factor == null ? 1 : def.factor) * (def.decimalDigits ? Math.pow(10, def.decimalDigits) : 1);
    const c = f !== 1.0 ? Math.round(curr * f) : curr;
    if (prev == null)
        return { key: c };
    const p = f !== 1.0 ? Math.round(prev * f) : prev;
    return c - p;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompressedJsonCollection;