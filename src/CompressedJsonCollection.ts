import { EventEmitter } from 'eventemitter3';

export type BaseParameter = string | number | boolean | Date;
export type JsonParameter = BaseParameter | IJsonObject | IJsonArray;
export interface IJsonArray extends Array<JsonParameter> { };
export interface IJsonObject { [x: string]: JsonParameter; }

export const enum EncodingType { RUNLENGTH, DIFF, RAW };
export interface EncodingDefinition {
	encoding: EncodingType;
}

export interface RunLengthEncodingDefinition extends EncodingDefinition {
	encoding: EncodingType.RUNLENGTH;
	values?: string[];
}

export interface KeyFrameDiffEncodingDefinition extends EncodingDefinition {
	encoding: EncodingType.DIFF;
	decimalDigits?: number;
	factor?: number;
	type?: 'number' | 'date' // defaults to number if not set
}

export interface RawEncodingDefinition extends EncodingDefinition {
	encoding: EncodingType.RAW;
}

export interface ICompressedJsonCollectionState {
	definitions: { parameter: string, dataIndex: number, definition: EncodingDefinition }[];
	data: JsonParameter[][];
	runlengthData: ({ count: number, value: BaseParameter } | BaseParameter)[][];
}

export interface ICompressedJsonCollectionHandler<T> {
	insert(items: T[], collection: CompressedJsonCollection<T>): T[];
}

export interface ICompressedJsonCollectionDefinition<T> {
	insertionHandler?: ((item: T) => boolean) | ICompressedJsonCollectionHandler<T>;
	sort?: (itemA: T, itemB: T) => -1 | 0 | 1;
	properties: { [key: string]: EncodingDefinition };
}

export default class CompressedJsonCollection<T> extends EventEmitter {

	private _items: T[] = [];
	private _state: ICompressedJsonCollectionState;
	private _definition: ICompressedJsonCollectionDefinition<T>;

	public get definition(): ICompressedJsonCollectionDefinition<T> { return this._definition; }
	public get items(): T[] { return this._items; }
	public get compressedJson(): ICompressedJsonCollectionState { return this._state; }
	public get cleanCompressedJson(): ICompressedJsonCollectionState { return { ...this._state, definitions: undefined }; };

	constructor(definition: ICompressedJsonCollectionDefinition<T>, items: T[] = []) {
		super();
		this._definition = definition;
		this._state = CompressedJsonCollection.createEmptyState(this._definition);
		this.add(items);
	}

	public add(items: T | T[]): void {

		items = <T[]>(Array.isArray(items) ? items : [items]);

		if (this._definition.sort != null)
			items.sort(this._definition.sort);

		const filter = this._definition.insertionHandler;
		const itemsToAdd = filter != null && typeof filter === 'object'
			? (filter as ICompressedJsonCollectionHandler<T>).insert(items, this)
			: (filter == null ? items : items.filter(filter as (item: T) => boolean));

		const add = this._definition.sort != null ? this.internalOrderedAdd : this.internalAdd;
		itemsToAdd.forEach(item => {
			add(item);
			this.emit('added', item);
		});
	}

	public remove(items: T | T[]): void {
		(Array.isArray(items) ? items : [items])
			.map(item => this.items.indexOf(item))
			.sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
			.filter(idx => idx != -1)
			.forEach(item => this.removeByIndex(item));
	}

	public removeByIndex(index: number): void;
	public removeByIndex(from: number, to: number): void;
	public removeByIndex(from: number, to?: number): void {
		if (to != null && from > to) throw new Error(`CompressedJsonCollection.removeByIndex: 'index' can not be greater than 'to'.`);
		if (from > this.items.length - 1) throw new Error(`Index 'index' is out of bounds.`);
		if (to != null && to > this.items.length - 1) throw new Error(`Index 'to' is out of bounds.`)

		if (to == null)
			this.internalRemoveByIndex(from);
		else
			this.internalRemoveIndexRange(from, to);
	}

	public clear(): void {
		this._state = CompressedJsonCollection.createEmptyState(this._definition);
		this._items = [];
	}

	public filter(selector: (item: T, index: number, array: T[]) => boolean): CompressedJsonCollection<T> {
		return new CompressedJsonCollection<T>(this._definition, this._items.filter(selector));
	}

	public query(selector: (item: T, index: number, array: T[]) => boolean): ICompressedJsonCollectionState {

		const items = this._items;
		let prevItem: T = null;
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

	public static decompress<T>(state: ICompressedJsonCollectionState, transform?: (state: ICompressedJsonCollectionState, item: T) => T): T[] {

		const items: T[] = [];
		const itemCount = state.data.length;

		for (let idx = 0; idx < itemCount; idx++) items[idx] = <T>{};

		for (let defIdx = 0; defIdx < state.definitions.length; defIdx++) {
			const def = state.definitions[defIdx];

			if (def.definition.encoding === EncodingType.RAW) {
				for (let idx = 0; idx < itemCount; idx++) {
					items[idx][def.parameter] = state.data[idx][def.dataIndex];
				}
			}

			if (def.definition.encoding === EncodingType.DIFF) {
				let d = def.definition as KeyFrameDiffEncodingDefinition;
				const f = (d.factor == null ? 1 : d.factor) * ((d.decimalDigits != null && d.type === 'number') ? Math.pow(10, d.decimalDigits) : 1);

				let prevVal = null;
				for (let idx = 0; idx < itemCount; idx++) {

					const item = <number | { key: number }>(state.data[idx][def.dataIndex]);
					let val = 0;
					if (item != null)
						val = ((typeof item === "object" ? item.key : (prevVal == null ? 0 : prevVal) + item));

					prevVal = val;
					items[idx][def.parameter] = d.type === 'number' ? val / f : new Date(val / f);
				}
			}

			if (def.definition.encoding === EncodingType.RUNLENGTH) {
				let idx = 0;
				for (const rlItem of state.runlengthData[def.dataIndex]) {
					if (typeof rlItem === "object") {
						for (let c = 0; c < (<any>rlItem).count; c++) {
							items[idx++][def.parameter] = (<any>rlItem).value;
						}
					} else {
						items[idx++][def.parameter] = rlItem;
					}
				}
			}
		}

		if (transform == null)
			return items;
		else
			return items.map(item => transform(state, item));
	}

	private internalRemoveByIndex(index: number) {
		const idxToRemove = index;
		const item = this.items[idxToRemove];

		this.items.splice(idxToRemove, 1);

		const state = this._state;

		state.data.splice(idxToRemove, 1);
		if (this.items[idxToRemove] != null)
			state.data[idxToRemove] = CompressedJsonCollection.diffEncode(this.items[idxToRemove], this.items[idxToRemove - 1], this._state);

		// Update runlength encodings
		for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {

			const rlItems = state.runlengthData[def.dataIndex];
			const removedVal = item[def.parameter];

			// find item affected by removal
			let itemStartIdx = 0;
			let currRlItemIdx = 0;
			while (true) {

				const item = rlItems[currRlItemIdx];
				let currItemCount = item instanceof Object ? (<{ value: BaseParameter, count: number }>item).count : 1;

				if (itemStartIdx + currItemCount > idxToRemove) {
					break;
				}

				itemStartIdx += currItemCount;
				currRlItemIdx++;
			}

			const currRlItem = rlItems[currRlItemIdx];

			if (currRlItem instanceof Object && (<any>currRlItem).value === removedVal) {
				(<{ value: BaseParameter, count: number }>currRlItem).count--;
				if ((<{ value: BaseParameter, count: number }>currRlItem).count == 1)
					rlItems[currRlItemIdx] = (<{ value: BaseParameter, count: number }>currRlItem).value;
			}
			else if (currRlItem === removedVal) {
				rlItems.splice(currRlItemIdx, 1);
			}
		}

		this.emit('removed', item);
	}

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

	private internalRemoveIndexRange(from: number, to: number) {

		const state = this._state;

		const removedItems = this.items.splice(from, to - from + 1);

		state.data.splice(from, to - from + 1);
		if (this.items[from] != null)
			state.data[from] = CompressedJsonCollection.diffEncode(this.items[from], this.items[from - 1], this._state);

		// Update runlength encodings
		const rlDefs = state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH);
		for (const def of rlDefs) {

			const rlItems = state.runlengthData[def.dataIndex];

			// find first item to be affected by removal
			let accumulatedIndex = 0;
			let firstRLItemIdx = 0;
			let firstItemRemoveCount = 0;
			while (true) {
				const item = rlItems[firstRLItemIdx] as { count: number };
				const currItemCount = item instanceof Object ? item.count : 1;
				if (accumulatedIndex + currItemCount > from) {

					// if from and to is contained in the same rl item
					if (accumulatedIndex + currItemCount > to) {
						firstItemRemoveCount = to - from + 1;
					} else {
						firstItemRemoveCount = currItemCount - (from - accumulatedIndex);
					}

					break;
				}
				accumulatedIndex += currItemCount;
				firstRLItemIdx++;
			}

			// find last item to be affected by removal
			let lastRLItemIdx = firstRLItemIdx;
			let lastItemRemoveCount = 0;
			while (true) {
				const item = rlItems[lastRLItemIdx] as { count: number };
				const currItemCount = item instanceof Object ? item.count : 1;
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

			let firstItem = rlItems[firstRLItemIdx] as { count: number, value: string };
			let lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };

			// update first affected item
			if (typeof firstItem === 'object')
				firstItem.count -= firstItemRemoveCount;
			else {
				rlItems.splice(firstRLItemIdx, 1);
				firstRLItemIdx--;
				lastRLItemIdx--;
				firstItem = rlItems[firstRLItemIdx] as { count: number, value: string };
				lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
			}
			// update last affected item (if it is not the same item as the first one)
			if (firstRLItemIdx !== lastRLItemIdx) {
				if (typeof lastItem === 'object')
					lastItem.count -= lastItemRemoveCount;
				else {
					rlItems.splice(lastRLItemIdx, 1);
					lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
				}
			}

			// remove first affected item if its count is zero
			if (typeof firstItem === 'object' && firstItem.count == 0) {
				rlItems.splice(firstRLItemIdx, 1);
				firstRLItemIdx--;
				lastRLItemIdx--;
				firstItem = rlItems[firstRLItemIdx] as { count: number, value: string };
				lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
			}

			// remove last affected item if its count is zero
			if (typeof lastItem === 'object' && lastItem.count != null && lastItem.count == 0) {
				rlItems.splice(lastRLItemIdx, 1);
			}

			// convert object with count one to value only
			firstItem != null && firstItem.count == 1 && (rlItems[firstRLItemIdx] = firstItem.value);
			lastItem != null && lastItem.count == 1 && (rlItems[lastRLItemIdx] = lastItem.value);
			firstItem = rlItems[firstRLItemIdx] as { count: number, value: string };
			lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };

			// If we have both firs and last items they are now adjacent and could possibly contain the same type of value. 
			// If they do we combine them to one object
			if (firstItem != null && lastItem != null && lastRLItemIdx !== firstRLItemIdx) {
				if (typeof firstItem === 'object') {

					if (typeof lastItem === 'object' && firstItem.value === lastItem.value) {
						firstItem.count += lastItem.count;
						rlItems.splice(lastRLItemIdx, 1);
						lastRLItemIdx--;
						lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
					}
					else if (<any>lastItem === firstItem.value) {
						firstItem.count += 1;
						rlItems.splice(lastRLItemIdx, 1);
						lastRLItemIdx--;
						lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
					}

				} else {
					if (typeof lastItem === 'object' && <any>firstItem === lastItem.value) {
						lastItem.count += 1;
						rlItems.splice(firstRLItemIdx, 1);
						firstRLItemIdx--;
						lastRLItemIdx--;
						firstItem = rlItems[firstRLItemIdx] as { count: number, value: string };
						lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
					}
					else if (<any>lastItem === <any>firstItem) {
						rlItems[firstRLItemIdx] = { count: 2, value: firstItem };
						rlItems.splice(lastRLItemIdx, 1);
						lastRLItemIdx--;
						lastItem = rlItems[lastRLItemIdx] as { count: number, value: string };
					}
				}
			}
		}

		removedItems.forEach(item => this.emit('removed', item));
	}


	private internalAdd = (item: T) => {

		this._state.data.push(CompressedJsonCollection.diffEncode(item, this._items[this._items.length - 1], this._state));
		CompressedJsonCollection.runlengthEncode(item, this._state);
		this._items.push(item);
	}

	private internalOrderedAdd = (item: T) => {

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
			for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {

				const rlItem = state.runlengthData[def.dataIndex];
				const newVal = item[def.parameter];
				const nextVal = rlItem[0];

				if (nextVal instanceof Object && (<any>nextVal).value === newVal) {
					(<any>nextVal).count++;
				} else if (nextVal === newVal) {
					state.runlengthData[def.dataIndex][0] = { count: 2, value: newVal };
				}
				else {
					(<any>state.runlengthData[def.dataIndex]).splice(0, 0, newVal);
				}
			}
			return;
		}

		//
		// Add somewhere (...) in the collection (NOT empty collection or start/end of collection)
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
		for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {

			const rlItems = state.runlengthData[def.dataIndex];
			const newVal = item[def.parameter];

			// find item affected by run length insert
			let itemStartIdx = 0;
			let currRlItemIdx = 0;
			while (true) {

				const item = rlItems[currRlItemIdx];
				let currItemCount = 0

				if (item instanceof Object)
					currItemCount = (<{ value: BaseParameter, count: number }>item).count;
				else
					currItemCount = 1;

				if (itemStartIdx + currItemCount > insertAtIdx)
					break;

				itemStartIdx += currItemCount;
				currRlItemIdx++;
			}

			const currRlItem = rlItems[currRlItemIdx];

			if (currRlItem instanceof Object && (<any>currRlItem).value === newVal)
				(<{ value: BaseParameter, count: number }>currRlItem).count++
			else if (currRlItem === newVal)
				rlItems[currRlItemIdx] = { count: 2, value: newVal };
			else {
				const item = <{ value: BaseParameter, count: number }>currRlItem;
				if (currRlItem instanceof Object) {
					const itemA = { value: item.value, count: insertAtIdx - itemStartIdx };
					const itemB = newVal;
					const itemC = { value: item.value, count: item.count - itemA.count };

					rlItems[currRlItemIdx] = itemA.count == 1 ? itemA.value : itemA;
					rlItems.splice(currRlItemIdx + 1, 0, itemB, itemC.count == 1 ? itemC.value : itemC);
				}
				else {
					rlItems.splice(currRlItemIdx, 0, newVal);
				}
			}
		}
	}

	private static _dateDiff = (curr: number, prev: number, def: KeyFrameDiffEncodingDefinition): number | { key: number } => {

		//return curr == null ? null : prev == null ? { key: def.factor == null ? curr : Math.round(curr * def.factor) } : (def.factor == null ? curr - prev : Math.round(curr * def.factor) - Math.round(prev * def.factor))

		if (curr == null)
			return null;

		const f = def.factor == null ? 1 : def.factor;
		const c = f !== 1 ? Math.round(curr * f) : curr;

		if (prev == null)
			return { key: c };

		const p = f !== 1 ? Math.round(prev * f) : prev;

		return c - p;
	};

	private static _numberDiff = (curr: number, prev: number, def: KeyFrameDiffEncodingDefinition): number | { key: number } => {

		if (curr == null)
			return null;

		const f = (def.factor == null ? 1 : def.factor) * (def.decimalDigits ? Math.pow(10, def.decimalDigits) : 1);
		const c = f !== 1.0 ? Math.round(curr * f) : curr;

		if (prev == null)
			return { key: c };

		const p = f !== 1.0 ? Math.round(prev * f) : prev;

		return c - p;
	};

	private static diffEncode<T>(this: void, curr: T, prev: T, state: ICompressedJsonCollectionState) {

		const itemCompressedState: JsonParameter[] = [];

		const diffDefinitions = state.definitions.filter(d => d.definition.encoding === EncodingType.RAW || d.definition.encoding === EncodingType.DIFF);
		for (const def of diffDefinitions) {

			if (def.definition.encoding == EncodingType.DIFF) {
				const diff = (def.definition as KeyFrameDiffEncodingDefinition).type === 'number' ? CompressedJsonCollection._numberDiff : CompressedJsonCollection._dateDiff;
				itemCompressedState.push(diff(curr[def.parameter], prev == null ? null : prev[def.parameter], def.definition as KeyFrameDiffEncodingDefinition));
			}
			else {
				itemCompressedState.push(curr[def.parameter]);
			}
		}
		return itemCompressedState;
	}

	private static runlengthEncode<T>(this: void, item: T, state: ICompressedJsonCollectionState) {

		const rlDefinitions = state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH);
		for (const def of rlDefinitions) {
			const rlItem = state.runlengthData[def.dataIndex];
			const newVal = item[def.parameter];
			const lastVal = rlItem[rlItem.length - 1];
			if (lastVal instanceof Object && (<any>lastVal).value === newVal)
				(<any>lastVal).count++
			else if (lastVal === newVal)
				rlItem[rlItem.length - 1] = { count: 2, value: newVal };
			else
				rlItem.push(newVal);
		}
	}

	private static createEmptyState<T>(cacheDefinition: ICompressedJsonCollectionDefinition<T>): ICompressedJsonCollectionState {

		const state: ICompressedJsonCollectionState = {
			definitions: new Array<{ parameter: string, dataIndex: number, definition: EncodingDefinition }>(),
			data: new Array<JsonParameter[]>(),
			runlengthData: new Array<({ count: number, value: BaseParameter } | BaseParameter)[]>()
		};

		const propertyNames = Object.getOwnPropertyNames(cacheDefinition.properties).sort();

		let dataIdx = 0;
		for (let parameter of propertyNames) {
			const definition = cacheDefinition.properties[parameter];

			if (definition.encoding === EncodingType.DIFF && (definition as KeyFrameDiffEncodingDefinition).type == null) {
				(definition as KeyFrameDiffEncodingDefinition).type = 'number';
			}

			const dataIndex = definition.encoding == EncodingType.RUNLENGTH ? state.runlengthData.length : dataIdx++;
			state.definitions.push({ parameter, definition, dataIndex });
			if (definition.encoding === EncodingType.RUNLENGTH)
				state.runlengthData.push([]);
		}

		return state;
	}

}