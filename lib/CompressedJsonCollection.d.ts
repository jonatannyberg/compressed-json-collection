import { EventEmitter } from 'eventemitter3';
export declare type BaseParameter = string | number | boolean | Date;
export declare type JsonParameter = BaseParameter | IJsonObject | IJsonArray;
export interface IJsonArray extends Array<JsonParameter> {
}
export interface IJsonObject {
    [x: string]: JsonParameter;
}
export declare const enum EncodingType {
    RUNLENGTH = 0,
    DIFF = 1,
    RAW = 2,
}
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
    type?: 'number' | 'date';
}
export interface RawEncodingDefinition extends EncodingDefinition {
    encoding: EncodingType.RAW;
}
export interface ICompressedJsonCollectionState {
    definitions: {
        parameter: string;
        dataIndex: number;
        definition: EncodingDefinition;
    }[];
    data: JsonParameter[][];
    runlengthData: ({
        count: number;
        value: BaseParameter;
    } | BaseParameter)[][];
}
export interface ICompressedJsonCollectionHandler<T> {
    insert(items: T[], collection: CompressedJsonCollection<T>): T[];
}
export interface ICompressedJsonCollectionDefinition<T> {
    insertionHandler?: ((item: T) => boolean) | ICompressedJsonCollectionHandler<T>;
    sort?: (itemA: T, itemB: T) => -1 | 0 | 1;
    properties: {
        [key: string]: EncodingDefinition;
    };
}
export default class CompressedJsonCollection<T> extends EventEmitter {
    private _items;
    private _state;
    private _definition;
    readonly definition: ICompressedJsonCollectionDefinition<T>;
    readonly items: T[];
    readonly compressedJson: ICompressedJsonCollectionState;
    constructor(definition: ICompressedJsonCollectionDefinition<T>, items?: T[]);
    add(items: T | T[]): void;
    remove(items: T | T[]): void;
    removeByIndex(index: number, to?: number): void;
    clear(): void;
    filter(selector: (item: T, index: number, array: T[]) => boolean): CompressedJsonCollection<T>;
    query(selector: (item: T, index: number, array: T[]) => boolean): ICompressedJsonCollectionState;
    static decompress<T>(state: ICompressedJsonCollectionState, transform?: (state: ICompressedJsonCollectionState, item: T) => T): T[];
    private internalAdd;
    private internalOrderedAdd;
    private static _dateDiff;
    private static _numberDiff;
    private static diffEncode<T>(this, curr, prev, state);
    private static runlengthEncode<T>(this, item, state);
    private static createEmptyState<T>(cacheDefinition);
}
