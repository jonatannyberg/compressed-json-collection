
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

export interface ICompressedJsonCollectionFilter<T> {
	insert(items: T[], collection: CompressedJsonCollection<T>): T[];
}

export interface ICompressedJsonCollectionDefinition<T> {
	insertionHandler?: ((item: T, index: number, array: T[]) => boolean) | ICompressedJsonCollectionFilter<T>;
	sort?: (itemA: T, itemB: T) => -1 | 0 | 1;
	properties: { [key: string]: EncodingDefinition };
}

export default class CompressedJsonCollection<T> {

	private _items: T[] = [];
	private _state: ICompressedJsonCollectionState;
	private _definition: ICompressedJsonCollectionDefinition<T>;

	public get definition(): ICompressedJsonCollectionDefinition<T> { return this._definition; }
	public get items(): T[] { return this._items; }
	public get compressedJson(): ICompressedJsonCollectionState { return this._state; }

	constructor(definition: ICompressedJsonCollectionDefinition<T>, items: T[] = []) {
		this._definition = definition;
		this._state = CompressedJsonCollection.createEmptyState(this._definition);
		this.add(items);
	}

	public add(items: T | T[]): void {

		items = <T[]>(Array.isArray(items) ? items : [items]);

		if (this._definition.sort != null)
			items.sort(this._definition.sort);

		let filter = this._definition.insertionHandler;
		let itemsToAdd: T[];
		if (filter != null && typeof filter === 'object')
			itemsToAdd = (filter as ICompressedJsonCollectionFilter<T>).insert(items, this);
		else
			itemsToAdd = filter == null ? items : items.filter(filter as (item: T, index: number, array: T[]) => boolean);

		const add = this._definition.sort != null ? this.internalOrderedAdd : this.internalAdd;

		for (const item of itemsToAdd) add(item);
	}

	public remove(items: T | T[]): void {

		items = Array.isArray(items) ? items : [items];

		for (const item of items) {
			const idxToRemove = this.items.indexOf(item);
			if (idxToRemove == -1)
				continue;

			this.items.splice(idxToRemove, 1);

			const state = this._state;

			state.data.splice(idxToRemove, 1);

			// Update runlength encodings
			for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {

				const rlItems = state.runlengthData[def.dataIndex];
				const newVal = item[def.parameter];

				// find item affected by run length insert
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

				if (currRlItem instanceof Object && (<any>currRlItem).value === newVal)
					(<{ value: BaseParameter, count: number }>currRlItem).count--
				else if (currRlItem === newVal) {
					rlItems.splice(currRlItemIdx, 1);
				}
			}
		}
	}

	public concat(collection: CompressedJsonCollection<T>): CompressedJsonCollection<T> {
		throw new Error('Not implemented exception');
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

	public static decompress<T>(state: ICompressedJsonCollectionState): T[] {

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

		return items;
	}

	private internalAdd = (item: T) => {

		this._state.data.push(
			CompressedJsonCollection.diffEncode(item, this._items[this._items.length - 1], this._state));
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
			this._state.data.push(
				diffEncode(item, null, this._state));
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

				if (itemStartIdx + currItemCount > insertAtIdx) {
					break;
				}

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
	}

	private static _dateDiff = (curr: number, prev: number, def: KeyFrameDiffEncodingDefinition): number | { key: number } => {

		if (curr == null)
			return null;

		const f = def.factor == null ? 1 : def.factor;
		const c = f !== 1 ? Math.round(curr * f) : curr;

		if (prev == null)
			return { key: c };

		const p = f !== 1 ? Math.round(prev * f) : prev;

		console.log(def.factor)
		console.log(c - p)
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

		const definitions = state.definitions.filter(d => d.definition.encoding === EncodingType.RAW || d.definition.encoding === EncodingType.DIFF);
		for (var dIdx = 0; dIdx < definitions.length; dIdx++) {
			const def = definitions[dIdx];

			let diff = (def.definition as KeyFrameDiffEncodingDefinition).type === 'number' ? CompressedJsonCollection._numberDiff : CompressedJsonCollection._dateDiff;

			if (def.definition.encoding == EncodingType.DIFF)
				itemCompressedState.push(diff(curr[def.parameter], prev == null ? null : prev[def.parameter], def.definition as KeyFrameDiffEncodingDefinition));
			else
				itemCompressedState.push(curr[def.parameter]);
		}
		return itemCompressedState;
	}

	private static runlengthEncode<T>(this: void, item: T, state: ICompressedJsonCollectionState) {

		for (const def of state.definitions.filter(d => d.definition.encoding === EncodingType.RUNLENGTH)) {
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