
import 'mocha';
import * as Should from 'should';
import CompressedCollection from '../CompressedJsonCollection';
import { EncodingType, ICompressedJsonCollectionHandler } from '../CompressedJsonCollection';

describe('CompressedCollection basics', () => {

	describe('diff encoding with single parameter', () => {

		it('single item', done => {
			const data = [{ id: 0 }];
			const definition = { properties: { id: { encoding: EncodingType.DIFF } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('two items', done => {
			const data = [{ id: 0 }, { id: 1 }];
			const definition = { properties: { id: { encoding: EncodingType.DIFF } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('three items', done => {
			const data = [{ id: 0 }, { id: 1 }, { id: 2 }];
			const definition = { properties: { id: { encoding: EncodingType.DIFF } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');
			done();
		});

		it('decreasing item values', done => {
			const data = [{ id: 3 }, { id: 2 }, { id: 1 }, { id: 0 }];
			const definition = { properties: { id: { encoding: EncodingType.DIFF } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

	});

	describe('basic diff encoding with multiple parameters', () => {

		it('basic diff encoding with two parameters', done => {

			const data = [
				{ id: 0, parameterOne: 100.2345 },
				{ id: 1, parameterOne: 101.1234 },
				{ id: 2, parameterOne: 102.5342 },
				{ id: 3, parameterOne: 103.3434 },
				{ id: 4, parameterOne: 104.5467 },
				{ id: 5, parameterOne: 105.5645 },
				{ id: 6, parameterOne: 106.7278 },
				{ id: 7, parameterOne: 107.2863 },
				{ id: 8, parameterOne: 108.2682 },
				{ id: 9, parameterOne: 109.3715 }
			];

			const definition = {
				properties: {
					id: { encoding: EncodingType.DIFF },
					parameterOne: { encoding: EncodingType.DIFF, decimalDigits: 4 }
				}
			}

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('basic diff encoding with two parameters, one using the decimalDigits', done => {

			const data = [
				{ id: 0, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 2, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 3, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 4, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 5, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 6, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 7, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 8, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 9, parameterOne: Math.round(Math.random() * 1000000) / 10000 }
			];

			const definition = {
				properties: {
					id: { encoding: EncodingType.DIFF },
					parameterOne: { encoding: EncodingType.DIFF, decimalDigits: 4 }
				}
			}

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('basic diff encoding with two parameters, one using the decimalDigits and factor', done => {

			const data = [
				{ id: 1000, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1100, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1200, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1300, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1400, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1500, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1600, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1700, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1800, parameterOne: Math.round(Math.random() * 1000000) / 10000 },
				{ id: 1900, parameterOne: Math.round(Math.random() * 1000000) / 10000 }
			];

			const definition = {
				properties: {
					id: { encoding: EncodingType.DIFF, factor: 100 },
					parameterOne: { encoding: EncodingType.DIFF, decimalDigits: 4 }
				}
			}

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('diff encoding more data', done => {

			const data = [];

			for (let i = 0; i < 10000; i++)
				data.push({ id: 1000 + i * 100, parameterOne: Math.round(Math.random() * 1000000) / 10000 });

			const definition = {
				properties: {
					id: { encoding: EncodingType.DIFF, factor: 100 },
					parameterOne: { encoding: EncodingType.DIFF, decimalDigits: 4 }
				}
			}

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});
	});

	describe('runlength encoding', () => {

		it('single item', done => {
			const data = [{ state: 'OK' }];
			const definition = { properties: { state: { encoding: EncodingType.RUNLENGTH } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('multiple items', done => {
			const data = [
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'OK' },
			];
			const definition = { properties: { state: { encoding: EncodingType.RUNLENGTH } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('multiple varying items', done => {
			const data = [
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'ARCHIVED' },
				{ state: 'OK' },
				{ state: 'OK' },
				{ state: 'OK' },
			];
			const definition = { properties: { state: { encoding: EncodingType.RUNLENGTH } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('run length encoding more data', done => {

			const data = [];

			for (let i = 0; i < 10000; i++)
				data.push({
					state: (Math.random() > 0.9 ? 'ARCHIVED' : 'OK'),
					safe: (Math.random() > 0.95 ? false : true),
					count: (Math.random() > 0.5 ? 1 : 2)
				});

			const definition = {
				properties: {
					state: { encoding: EncodingType.RUNLENGTH },
					safe: { encoding: EncodingType.RUNLENGTH },
					count: { encoding: EncodingType.RUNLENGTH },
				}
			}

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ id: number }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

	});

	describe('raw encoding', () => {

		it('single item', done => {
			const data = [{ something: { name: 'John', id: 1234 } }];
			const definition = { properties: { something: { encoding: EncodingType.RAW } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('multiple items', done => {
			const data = [
				{ something: { name: 'John', id: 1234 } },
				{ something: { name: 'Jane', id: 4321 } },
				{ something: { name: 'John', id: 2343 } },
				{ something: { name: 'Jane', id: 3212 } }
			];
			const definition = { properties: { something: { encoding: EncodingType.RAW } } }

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});
	});

	describe('encoding with combined encodings', () => {

		it('single item, raw, run length and diff', done => {
			const data = [{ something: { name: 'John', id: 1234 }, state: 'OK', balance: 2000.01 }];
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('multiple items, raw, run length and diff', done => {
			const data = [
				{ something: { name: 'John', id: 1234 }, state: 'OK', balance: 2000.01 },
				{ something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 20000 },
				{ something: { name: 'Jim', id: 3214 }, state: 'ARCHIVED', balance: 2000.34 }];
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('many items, raw, run length and diff', done => {
			const data = [];

			for (let idx = 0; idx < 100000; idx++)
				data.push({ something: { name: 'John', id: 1234 }, state: (Math.random() > 0.9 ? 'ARCHIVED' : 'OK'), balance: Math.round(Math.random() * 1000000) / 10000 });

			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 4 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});
	});

	describe('encoding with combined encodings, add items', () => {

		it('empty collection, add one item.', done => {
			const data = [];
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 2000.02 };
			collection.add(item);
			data.push(item);

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('single item, add one item. Raw, run length and diff.', done => {
			const data = [{ something: { name: 'John', id: 1234 }, state: 'OK', balance: 2000.01 }];
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 2000.02 };
			collection.add(item);
			data.push(item);

			const decompressedItems = CompressedCollection.decompress<{ state: string }>(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('single item, add multiple items. Raw, run length and diff.', done => {
			const data = [{ something: { name: 'John', id: 1234 }, state: 'OK', balance: 2000.01 }];
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 2000.02 };
			collection.add(item);
			data.push(item);
			item = { something: { name: 'Eve', id: 2344 }, state: 'ARCHIVED', balance: 2000.03 };
			collection.add(item);
			data.push(item);
			item = { something: { name: 'Adam', id: 4435 }, state: 'OK', balance: 2000.04 };
			collection.add(item);
			data.push(item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

	});

	describe('encoding with combined encodings, remove items', () => {

		it('empty collection, add one item, remove one item by reference', done => {
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition);

			var item = { something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 2000.02 };
			collection.add(item);
			collection.remove(item);

			Should.equal(collection.items.length, 0, 'Item was not removed correctly');

			done();
		});

		it('empty collection, add one item, remove one item by index', done => {
			const definition = {
				properties: {
					something: { encoding: EncodingType.RAW },
					state: { encoding: EncodingType.RUNLENGTH },
					balance: { encoding: EncodingType.DIFF, decimalDigits: 2 }
				}
			};

			const collection = new CompressedCollection(definition);

			var item = { something: { name: 'Jane', id: 4321 }, state: 'OK', balance: 2000.02 };
			collection.add(item);

			collection.removeByIndex(0);

			Should.equal(collection.items.length, 0, 'Item was not removed correctly');

			done();
		});


		it('sorted collection with initial items, add one item, remove one item by reference', done => {
			const item = { val: 3, rl: 'OK' };
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			collection.add(item);
			collection.remove(item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, add one item, remove one item by index', done => {
			const item = { val: 3, rl: 'OK' };
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			collection.add(item);
			collection.removeByIndex(collection.items.indexOf(item));

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (not in sequence)', done => {
			const item1 = { val: 1, rl: 'OK' };
			const item2 = { val: 3, rl: 'OK' };
			const data = [{ val: 0, rl: 'OK' }, item1, { val: 2, rl: 'OK' }, item2, { val: 4, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			collection.remove([item1, item2]);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2), 'Decompressed data does not match source data.');

			done();
		});


		it('sorted collection with initial items, remove two items (in sequence)', done => {
			const item1 = { val: 1, rl: 'OK' };
			const item2 = { val: 2, rl: 'OK' };
			const data = [{ val: 0, rl: 'OK' }, item1, item2, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			collection.remove([item1, item2]);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove one item by index with decres object count (to 1) in object rl case', done => {
			const item1 = { val: 1, rl: 'OK' };
			const data = [{ val: 0, rl: 'OK' }, item1, { val: 6, rl: 'BAD' }, { val: 7, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(collection.items.indexOf(item1));
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (in sequence) by start and end index,  decres object count (to 0) in object rl case', done => {
			const item0 = { val: 0, rl: 'OK' };
			const item1 = { val: 1, rl: 'OK' };
			const data = [item0, item1, { val: 6, rl: 'BAD' }, { val: 7, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(0, 1);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item0), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (in sequence) by start and end index, removes one item (none object) and decres object count (to 2) in object rl case', done => {
			const item0 = { val: 0, rl: 'BAD' };
			const item1 = { val: 1, rl: 'OK' };
			const item2 = { val: 2, rl: 'OK' };
			const data = [item0, item1, item2, { val: 3, rl: 'OK' }, { val: 6, rl: 'BAD' }, { val: 7, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(0, 1);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item0 && item != item1), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (in sequence) by start and end index, removes one item (none object) and decrese object count (to 1) in object rl case', done => {
			const item0 = { val: 0, rl: 'BAD' };
			const item1 = { val: 1, rl: 'OK' };
			const item2 = { val: 2, rl: 'OK' };
			const data = [item0, item1, item2, { val: 6, rl: 'BAD' }, { val: 7, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(0, 1);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item0 && item != item1), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (in sequence) by start and end index, decreses two object counts to 1', done => {
			const item1 = { val: 1, rl: 'BAD' };
			const item2 = { val: 2, rl: 'OK' };
			const data = [{ val: 0, rl: 'BAD' }, item1, item2, { val: 3, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(1, 2);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove two items (in sequence) by start and end index, decreses one object count to 1 and removes one item', done => {
			const item1 = { val: 1, rl: 'BAD' };
			const item2 = { val: 2, rl: 'OK' };
			const data = [{ val: 0, rl: 'BAD' }, item1, item2];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(1, 2);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove three items (in sequence) by start and end index, decreses two object counts to 1 and removes one item', done => {
			const item1 = { val: 1, rl: 'BAD' };
			const item2 = { val: 2, rl: 'OK' };
			const item3 = { val: 3, rl: 'NOT OK' };;
			const data = [{ val: 0, rl: 'BAD' }, item1, item2, item3, { val: 4, rl: 'NOT OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(1, 3);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2 && item != item3), 'Decompressed data does not match source data.');

			done();
		});

		it('sorted collection with initial items, remove items (in sequence) by index with varying cases in rl encoding', done => {
			const item1 = { val: 1, rl: 'OK' };
			const item2 = { val: 2, rl: 'NOT OK' };
			const item3 = { val: 3, rl: 'NOT OK' };
			const item4 = { val: 4, rl: 'OK' };
			const item5 = { val: 5, rl: 'BAD' };
			const data = [{ val: 0, rl: 'OK' }, item1, item2, item3, item4, item5, { val: 6, rl: 'BAD' }, { val: 7, rl: 'OK' }];
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH },
				}
			};

			const collection = new CompressedCollection(definition, data);

			//console.log('rl compression: ', collection.compressedJson.runlengthData);
			collection.removeByIndex(collection.items.indexOf(item1), collection.items.indexOf(item1) + 4);
			//console.log('items: ', collection.items);
			//console.log('rl compression: ', collection.compressedJson.runlengthData);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson);
			Should.deepEqual(decompressedItems, data.filter(item => item != item1 && item != item2 && item != item3 && item != item4 && item != item5), 'Decompressed data does not match source data.');

			done();
		});
	});
});

describe('CompressedCollection inserts with sort', () => {

	describe('encoding with sorting, basics', () => {

		it('empty collection, add one item.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 0, rl: 'OK' };
			collection.add(item);
			data.push(item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('one items in collection, add one (greater) item.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 1, rl: 'OK' };
			collection.add(item);
			data.push(item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('one items in collection, add one (lesser) item.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 1, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 0, rl: 'OK' };
			collection.add(item);
			data.splice(0, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the "center" of the collection.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'OK' };
			collection.add(item);
			data.splice(2, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the second position of the collection.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 1, rl: 'OK' };
			collection.add(item);
			data.splice(1, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the second to last position of the collection.', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 3, rl: 'OK' };
			collection.add(item);
			data.splice(3, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});
	});

	describe('encoding with sorting, runlength testing', () => {
		it('four items in collection, add one item to the "center" of the collection (with unmatching RL item for that location).', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'ARCHIVED' };
			collection.add(item);
			data.splice(2, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the "center" of the collection (with distinct rl items, match is NOT object).', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK1' }, { val: 1, rl: 'OK2' }, { val: 3, rl: 'OK3' }, { val: 4, rl: 'OK4' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'ARCHIVED' };
			collection.add(item);
			data.splice(2, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the "center" of the collection (matcing rl item IS object).', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 3, rl: 'OK3' }, { val: 4, rl: 'OK4' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'ARCHIVED' };
			collection.add(item);
			data.splice(2, 0, item);

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the "center" of the collection (matcing rl item IS object splite in to object and string).', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK4' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'ARCHIVED' };
			collection.add(item);
			data.splice(2, 0, item);

			Should.equal(collection.compressedJson.runlengthData[0][2], 'OK', 'Runlength item did not get split correctly.');

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

		it('four items in collection, add one item to the "center" of the collection (matcing rl item IS object splite in to string and object).', done => {
			const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
			const data = [{ val: 0, rl: 'OK1' }, { val: 1, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
			const definition = {
				sort: sort,
				properties: {
					val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
					rl: { encoding: EncodingType.RUNLENGTH }
				}
			};

			const collection = new CompressedCollection(definition, data);

			Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

			var item = { val: 2, rl: 'ARCHIVED' };
			collection.add(item);
			data.splice(2, 0, item);

			Should.equal(collection.compressedJson.runlengthData[0][1], 'OK', 'Runlength item did not get split correctly.');

			const decompressedItems = CompressedCollection.decompress(collection.compressedJson)

			Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

			done();
		});

	});

});

describe('CompressedCollection querying', () => {

	it('querying collection, test one', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.rl === 'OK');

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.rl === 'OK'), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test two', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val > 0 && item.val < 4);

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val > 0 && d.val < 4), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test three', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val < 1 && item.val > 3);

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val < 1 && d.val > 3), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test four', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val % 2 == 0);

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val % 2 == 0), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test five', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val % 2 == 1);

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val % 2 == 1), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test six', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val % 2 == 1 || item.rl == 'ARCHIVED');

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val % 2 == 1 || d.rl == 'ARCHIVED'), 'Decompressed data does not match source data.');

		done();
	});

	it('querying collection, test six', done => {
		const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
		const data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'ARCHIVED' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
		const definition = {
			sort: sort,
			properties: {
				val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
				rl: { encoding: EncodingType.RUNLENGTH }
			}
		};

		const collection = new CompressedCollection<{ val: number, rl: string }>(definition, data);

		Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

		let result = collection.query(item => item.val % 2 == 1 && item.rl == 'ARCHIVED');

		const decompressedItems = CompressedCollection.decompress(result)

		Should.deepEqual(decompressedItems, data.filter(d => d.val % 2 == 1 && d.rl == 'ARCHIVED'), 'Decompressed data does not match source data.');

		done();
	});

});

describe('CompressedCollection inserts with insertionHandler', () => {

	describe('basic filter', () => {
		describe('unsorted inserting', () => {

			it('empty collection with basic filtertype, add one item that should not be filtered', done => {
				const data = [];
				const definition = {
					insertionHandler: (item: { val: number, rl: string }) => item.val < 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);
				data.push(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});


			it('empty collection with basic filtertype, add one item that should be filtered', done => {
				const data = [];
				const definition = {
					insertionHandler: (item: { val: number, rl: string }) => item.val > 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, one items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					insertionHandler: (item: { val: number, rl: string }) => item.val < 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val < 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, all items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					insertionHandler: (item: { val: number, rl: string }) => item.val > 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, some items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					insertionHandler: (item: { val: number, rl: string }) => item.val > 1,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 1);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});
		});

		describe('sorted inserting', () => {

			it('empty collection with basic filtertype, add one item that should not be filtered', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data = [];
				const definition = {
					sort: sort,
					insertionHandler: (item: { val: number, rl: string }) => item.val < 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);
				data.push(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('empty collection with basic filtertype, add one item that should be filtered', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data = [];
				const definition = {
					sort: sort,
					insertionHandler: (item: { val: number, rl: string }) => item.val > 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, one items should be filtered away', done => {

				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;

				let data = [{ val: 1, rl: 'OK' }, { val: 0, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					sort: sort,
					insertionHandler: (item: { val: number, rl: string }) => item.val < 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.sort(sort).filter(item => item.val < 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, all items should be filtered away', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					sort: sort,
					insertionHandler: (item: { val: number, rl: string }) => item.val > 4,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, some items should be filtered away', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				const definition = {
					sort: sort,
					insertionHandler: (item: { val: number, rl: string }) => item.val > 1,
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 1);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});
		});
	});

	describe('advanced filter', () => {

		describe('unsorted inserting', () => {

			it('empty collection with basic filtertype, add one item that should not be filtered', done => {

				type ItemType = { val: number, rl: string };
				const data = [];
				const definition = {
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val < 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection<ItemType>(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);
				data.push(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});


			it('empty collection with basic filtertype, add one item that should be filtered', done => {
				type ItemType = { val: number, rl: string };
				const data = [];
				const definition = {
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection<ItemType>(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, one items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val < 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val < 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, all items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, some items should be filtered away', done => {
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 1);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 1);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});
		});

		describe('sorted inserting', () => {

			it('empty collection with basic filtertype, add one item that should not be filtered', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data = [];
				type ItemType = { val: number, rl: string };
				const definition = {
					sort: sort,
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val < 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);
				data.push(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('empty collection with basic filtertype, add one item that should be filtered', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data = [];
				type ItemType = { val: number, rl: string };
				const definition = {
					sort: sort,
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				var item = { val: 0, rl: 'OK' };
				collection.add(item);

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, one items should be filtered away', done => {

				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;

				let data = [{ val: 1, rl: 'OK' }, { val: 0, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					sort: sort,
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val < 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};
				const collection = new CompressedCollection(definition, data);

				data = data.sort(sort).filter(item => item.val < 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, all items should be filtered away', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					sort: sort,
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 4);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 4);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

			it('initiating collection filtered with basic filtertype with data, some items should be filtered away', done => {
				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				let data = [{ val: 0, rl: 'OK' }, { val: 1, rl: 'OK' }, { val: 2, rl: 'OK' }, { val: 3, rl: 'OK' }, { val: 4, rl: 'OK' }];
				type ItemType = { val: number, rl: string };
				const definition = {
					sort: sort,
					insertionHandler: new (class implements ICompressedJsonCollectionHandler<ItemType> {
						insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {
							return items.filter(item => item.val > 1);
						};
					})(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH }
					}
				};

				const collection = new CompressedCollection(definition, data);

				data = data.filter(item => item.val > 1);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const decompressedItems = CompressedCollection.decompress(collection.compressedJson);

				Should.deepEqual(decompressedItems, data, 'Decompressed data does not match source data.');

				done();
			});

		});

		describe('advanced usage tests', () => {

			it('buffered insertion handler', done => {

				type ItemType = { val: number, rl: string, insertIdx: number };
				const ItemBuffer = class implements ICompressedJsonCollectionHandler<ItemType> {

					public buffer: ItemType[] = [];

					insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {

						if (this.buffer.length > 4)
							this.buffer = [];

						items.forEach(item => this.buffer.push(item));

						if (this.buffer.length > 4)
							return this.buffer;
						else
							return [];
					};
				};

				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data: ItemType[] = [];

				const definition = {
					sort: sort,
					insertionHandler: new ItemBuffer(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH },
						insertIdx: { encoding: EncodingType.RAW }
					}
				};

				const collection = new CompressedCollection(definition, data);

				Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				const vals = [34, 6, 12, 3, 12, 6, 32, 1, 8, 12];
				for (let idx = 0; idx < 100; idx++) {

					const item = { val: vals[idx % 10], rl: idx % 3 == 0 ? 'OK' : 'NOT OK', insertIdx: idx };
					collection.add(item);
					data.push(item);

					if ((idx + 1) % 5 == 0) {
						data.sort(sort);

						Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');
						const decompressedItems = CompressedCollection.decompress<ItemType>(collection.compressedJson);

						Should.deepEqual(decompressedItems.map(i => i.val), data.map(i => i.val), 'Decompressed data does not match source data.');
						data.map(i => ({ src: i, res: decompressedItems.filter(di => di.insertIdx === i.insertIdx)[0] }))
							.forEach(pair => {
								Should.deepEqual(pair.res, pair.src, 'Decompressed data does not match source data.');
							});

					} else {
						Should.notEqual(collection.items.length, data.length, 'Collection contains wrong number of items.');
					}
				}

				done();
			});

			it('handler that alters collection', done => {

				type ItemType = { val: number, rl: string, insertIdx: number };
				const InsertionHandler = class implements ICompressedJsonCollectionHandler<ItemType> {

					public buffer: ItemType[] = [];
					private isAlteringInternal = false;

					insert(items: ItemType[], collection: CompressedCollection<ItemType>): ItemType[] {

						if (this.isAlteringInternal)
							return items;

						if (this.buffer.length + items.length > 4) {

							collection.remove(this.buffer);
							const lastItemExceptBufferToBeAdded = collection.items[collection.items.length - 1];
							collection.remove(lastItemExceptBufferToBeAdded);

							let allItems = (lastItemExceptBufferToBeAdded != null ? [lastItemExceptBufferToBeAdded] : []).concat(this.buffer.concat(items).sort(collection.definition.sort));

							const itemsToAdd = allItems.filter((item, idx) => idx == 0 || (idx + 1) % 5 == 0);

							var remainingItems = allItems.slice(allItems.indexOf(itemsToAdd[itemsToAdd.length - 1]) + 1);

							this.isAlteringInternal = true;
							collection.add(itemsToAdd);
							this.isAlteringInternal = false;

							this.buffer = remainingItems;

							return this.buffer;
						}
						else {
							items.forEach(item => this.buffer.push(item));
							return items;
						}
					};
				};

				const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val ? 1 : 0;
				const data: ItemType[] = [
					{ val: 2, rl: 'OK', insertIdx: 0 },
					{ val: 4, rl: 'OK', insertIdx: 1 },
					{ val: 6, rl: 'OK', insertIdx: 2 },
					{ val: 8, rl: 'OK', insertIdx: 3 },
					{ val: 10, rl: 'OK', insertIdx: 4 },
					{ val: 12, rl: 'OK', insertIdx: 5 },
					{ val: 14, rl: 'OK', insertIdx: 6 }
				];

				const definition = {
					sort: sort,
					insertionHandler: new InsertionHandler(),
					properties: {
						val: { encoding: EncodingType.DIFF, decimalDigits: 0 },
						rl: { encoding: EncodingType.RUNLENGTH },
						insertIdx: { encoding: EncodingType.RAW }
					}
				};

				const collection = new CompressedCollection(definition, data);

				const moreData: ItemType[] = [
					{ val: 16, rl: 'OK', insertIdx: 7 },
					{ val: 18, rl: 'OK', insertIdx: 8 },
					{ val: 20, rl: 'OK', insertIdx: 9 },
					{ val: 22, rl: 'OK', insertIdx: 10 },
					{ val: 24, rl: 'OK', insertIdx: 11 },
					{ val: 26, rl: 'OK', insertIdx: 12 },
					{ val: 28, rl: 'OK', insertIdx: 13 },
					{ val: 30, rl: 'OK', insertIdx: 14 }
				];

				for (const item of moreData)
					collection.add(item);

				Should.deepEqual(CompressedCollection.decompress(collection.compressedJson), [{ val: 2, rl: 'OK', insertIdx: 0 }, { val: 10, rl: 'OK', insertIdx: 4 }, { val: 18, rl: 'OK', insertIdx: 8 }, { val: 26, rl: 'OK', insertIdx: 12 }, { val: 28, rl: 'OK', insertIdx: 13 }, { val: 30, rl: 'OK', insertIdx: 14 }], 'Decompressed result does not match expectation.')

				done();
			});

			const gpsTestData = [{ lat: 37.0005, lon: -176.7644, time: new Date("2015-07-20T22:00:05.000Z") }, { lat: 37.0011, lon: -176.6394, time: new Date("2015-07-20T22:22:00.000Z") }, { lat: 37.0018, lon: -176.4245, time: new Date("2015-07-20T22:59:48.000Z") }, { lat: 37.0016, lon: -176.3927, time: new Date("2015-07-20T23:05:24.000Z") }, { lat: 37.0014, lon: -176.3254, time: new Date("2015-07-20T23:17:37.000Z") }, { lat: 36.9998, lon: -175.9286, time: new Date("2015-07-21T00:27:49.000Z") }, { lat: 36.9991, lon: -175.8838, time: new Date("2015-07-21T00:35:48.000Z") }, { lat: 37.0002, lon: -175.6203, time: new Date("2015-07-21T01:22:47.000Z") }, { lat: 37.0006, lon: -175.0989, time: new Date("2015-07-21T02:57:17.000Z") }, { lat: 36.9991, lon: -174.267, time: new Date("2015-07-21T05:31:47.000Z") }, { lat: 36.9988, lon: -173.7875, time: new Date("2015-07-21T06:56:12.000Z") }, { lat: 36.9991, lon: -173.6327, time: new Date("2015-07-21T07:23:24.000Z") }, { lat: 36.9983, lon: -173.1979, time: new Date("2015-07-21T08:39:48.000Z") }, { lat: 36.997, lon: -173.1132, time: new Date("2015-07-21T08:54:48.000Z") }, { lat: 36.997, lon: -173.1026, time: new Date("2015-07-21T08:56:44.000Z") }, { lat: 36.9989, lon: -172.6891, time: new Date("2015-07-21T10:09:47.000Z") }, { lat: 36.9998, lon: -172.6057, time: new Date("2015-07-21T10:24:43.000Z") }, { lat: 37.0008, lon: -172.5294, time: new Date("2015-07-21T10:38:24.000Z") }, { lat: 36.9985, lon: -171.9632, time: new Date("2015-07-21T12:18:36.000Z") }, { lat: 36.9987, lon: -171.3015, time: new Date("2015-07-21T14:16:26.000Z") }, { lat: 36.9986, lon: -171.243, time: new Date("2015-07-21T14:26:59.000Z") }, { lat: 36.9988, lon: -170.7611, time: new Date("2015-07-21T15:54:13.000Z") }, { lat: 36.9899, lon: -169.6493, time: new Date("2015-07-21T19:13:35.000Z") }, { lat: 36.9892, lon: -169.6303, time: new Date("2015-07-21T19:16:59.000Z") }, { lat: 36.9874, lon: -169.4918, time: new Date("2015-07-21T19:41:42.000Z") }, { lat: 36.9873, lon: -169.4769, time: new Date("2015-07-21T19:44:23.000Z") }, { lat: 36.9793, lon: -169.0786, time: new Date("2015-07-21T20:54:59.000Z") }, { lat: 36.9749, lon: -168.9341, time: new Date("2015-07-21T21:20:54.000Z") }, { lat: 36.9695, lon: -168.6802, time: new Date("2015-07-21T22:06:01.000Z") }, { lat: 36.9688, lon: -168.6517, time: new Date("2015-07-21T22:11:00.000Z") }, { lat: 36.9569, lon: -168.1103, time: new Date("2015-07-21T23:44:48.000Z") }, { lat: 36.9555, lon: -167.9974, time: new Date("2015-07-22T00:04:24.000Z") }, { lat: 36.9549, lon: -167.9503, time: new Date("2015-07-22T00:12:36.000Z") }, { lat: 36.9467, lon: -167.5421, time: new Date("2015-07-22T01:24:00.000Z") }, { lat: 36.944, lon: -167.3991, time: new Date("2015-07-22T01:48:42.000Z") }, { lat: 36.9347, lon: -166.9667, time: new Date("2015-07-22T03:03:24.000Z") }, { lat: 36.9334, lon: -166.8682, time: new Date("2015-07-22T03:20:11.000Z") }, { lat: 36.9215, lon: -166.4042, time: new Date("2015-07-22T04:41:24.000Z") }, { lat: 36.9119, lon: -165.9747, time: new Date("2015-07-22T05:57:05.000Z") }, { lat: 36.9107, lon: -165.6576, time: new Date("2015-07-22T06:52:59.000Z") }, { lat: 36.8956, lon: -165.1447, time: new Date("2015-07-22T08:24:12.000Z") }, { lat: 36.8621, lon: -163.7089, time: new Date("2015-07-22T12:43:23.000Z") }, { lat: 36.8572, lon: -163.3172, time: new Date("2015-07-22T13:53:12.000Z") }, { lat: 36.8222, lon: -161.866, time: new Date("2015-07-22T18:11:18.000Z") }, { lat: 36.8163, lon: -161.7338, time: new Date("2015-07-22T18:35:05.000Z") }, { lat: 36.8003, lon: -161.3489, time: new Date("2015-07-22T19:43:59.000Z") }, { lat: 36.7928, lon: -160.9541, time: new Date("2015-07-22T20:54:43.000Z") }, { lat: 36.7911, lon: -160.8105, time: new Date("2015-07-22T21:20:12.000Z") }, { lat: 36.7878, lon: -160.4637, time: new Date("2015-07-22T22:21:46.000Z") }, { lat: 36.7865, lon: -160.2891, time: new Date("2015-07-22T22:52:23.000Z") }, { lat: 36.7791, lon: -160.0233, time: new Date("2015-07-22T23:40:00.000Z") }, { lat: 36.7627, lon: -159.6817, time: new Date("2015-07-23T00:41:17.000Z") }, { lat: 36.7534, lon: -159.515, time: new Date("2015-07-23T01:11:24.000Z") }, { lat: 36.7504, lon: -159.463, time: new Date("2015-07-23T01:20:47.000Z") }, { lat: 36.7281, lon: -159.1815, time: new Date("2015-07-23T02:11:48.000Z") }, { lat: 36.727, lon: -159.1637, time: new Date("2015-07-23T02:15:00.000Z") }, { lat: 36.7139, lon: -158.919, time: new Date("2015-07-23T02:59:00.000Z") }, { lat: 36.6944, lon: -158.6402, time: new Date("2015-07-23T03:49:36.000Z") }, { lat: 36.6277, lon: -157.8061, time: new Date("2015-07-23T06:22:59.000Z") }, { lat: 36.5958, lon: -157.4115, time: new Date("2015-07-23T07:34:47.000Z") }, { lat: 36.5945, lon: -157.3974, time: new Date("2015-07-23T07:37:23.000Z") }, { lat: 36.583, lon: -157.2779, time: new Date("2015-07-23T07:59:30.000Z") }, { lat: 36.5776, lon: -157.2188, time: new Date("2015-07-23T08:10:20.000Z") }, { lat: 36.5475, lon: -156.901, time: new Date("2015-07-23T09:09:24.000Z") }, { lat: 36.5386, lon: -156.8056, time: new Date("2015-07-23T09:26:49.000Z") }, { lat: 36.5223, lon: -156.6294, time: new Date("2015-07-23T09:59:11.000Z") }, { lat: 36.4451, lon: -155.5804, time: new Date("2015-07-23T13:12:35.000Z") }, { lat: 36.4296, lon: -155.4323, time: new Date("2015-07-23T13:40:00.000Z") }, { lat: 36.3535, lon: -154.9035, time: new Date("2015-07-23T15:19:12.000Z") }, { lat: 36.2268, lon: -153.7948, time: new Date("2015-07-23T18:41:06.000Z") }, { lat: 36.2095, lon: -153.6654, time: new Date("2015-07-23T19:04:48.000Z") }, { lat: 36.192, lon: -153.5409, time: new Date("2015-07-23T19:27:40.000Z") }, { lat: 36.1722, lon: -153.409, time: new Date("2015-07-23T19:51:54.000Z") }, { lat: 36.1464, lon: -153.2267, time: new Date("2015-07-23T20:25:18.000Z") }, { lat: 36.1365, lon: -153.1366, time: new Date("2015-07-23T20:41:47.000Z") }, { lat: 36.1251, lon: -153.0222, time: new Date("2015-07-23T21:02:42.000Z") }, { lat: 36.1129, lon: -152.9057, time: new Date("2015-07-23T21:24:00.000Z") }, { lat: 36.0823, lon: -152.659, time: new Date("2015-07-23T22:09:04.000Z") }, { lat: 36.0366, lon: -152.2929, time: new Date("2015-07-23T23:15:48.000Z") }, { lat: 36.0251, lon: -152.2054, time: new Date("2015-07-23T23:31:37.000Z") }, { lat: 36.0174, lon: -152.1459, time: new Date("2015-07-23T23:42:24.000Z") }, { lat: 35.9653, lon: -151.7278, time: new Date("2015-07-24T00:58:37.000Z") }, { lat: 35.9596, lon: -151.6789, time: new Date("2015-07-24T01:07:30.000Z") }, { lat: 35.9509, lon: -151.6069, time: new Date("2015-07-24T01:20:36.000Z") }, { lat: 35.8961, lon: -151.2021, time: new Date("2015-07-24T02:34:01.000Z") }, { lat: 35.8785, lon: -151.0732, time: new Date("2015-07-24T02:57:18.000Z") }, { lat: 35.7223, lon: -150.0141, time: new Date("2015-07-24T06:11:23.000Z") }, { lat: 35.7178, lon: -149.9895, time: new Date("2015-07-24T06:16:00.000Z") }, { lat: 35.6928, lon: -149.8554, time: new Date("2015-07-24T06:41:00.000Z") }, { lat: 35.6867, lon: -149.821, time: new Date("2015-07-24T06:47:23.000Z") }, { lat: 35.615, lon: -149.4733, time: new Date("2015-07-24T07:53:00.000Z") }, { lat: 35.5895, lon: -149.3465, time: new Date("2015-07-24T08:17:06.000Z") }, { lat: 35.581, lon: -149.3044, time: new Date("2015-07-24T08:25:06.000Z") }, { lat: 35.5643, lon: -149.2223, time: new Date("2015-07-24T08:40:36.000Z") }, { lat: 35.5198, lon: -148.9856, time: new Date("2015-07-24T09:24:27.000Z") }, { lat: 35.4568, lon: -148.6482, time: new Date("2015-07-24T10:26:59.000Z") }, { lat: 35.3579, lon: -148.1326, time: new Date("2015-07-24T12:03:41.000Z") }, { lat: 35.2822, lon: -147.742, time: new Date("2015-07-24T13:16:59.000Z") }, { lat: 35.1819, lon: -147.2174, time: new Date("2015-07-24T14:55:36.000Z") }, { lat: 34.9964, lon: -146.2406, time: new Date("2015-07-24T17:57:13.000Z") }, { lat: 34.9952, lon: -146.2331, time: new Date("2015-07-24T17:58:36.000Z") }, { lat: 34.9877, lon: -146.1917, time: new Date("2015-07-24T18:06:23.000Z") }, { lat: 34.9114, lon: -145.7946, time: new Date("2015-07-24T19:21:31.000Z") }, { lat: 34.894, lon: -145.7166, time: new Date("2015-07-24T19:36:35.000Z") }, { lat: 34.894, lon: -145.7166, time: new Date("2015-07-24T19:36:36.000Z") }, { lat: 34.8846, lon: -145.675, time: new Date("2015-07-24T19:44:35.000Z") }, { lat: 34.8559, lon: -145.5452, time: new Date("2015-07-24T20:09:39.000Z") }, { lat: 34.8528, lon: -145.531, time: new Date("2015-07-24T20:12:37.000Z") }, { lat: 34.7852, lon: -145.2019, time: new Date("2015-07-24T21:15:42.000Z") }, { lat: 34.7508, lon: -145.0179, time: new Date("2015-07-24T21:50:52.000Z") }, { lat: 34.7203, lon: -144.8573, time: new Date("2015-07-24T22:21:01.000Z") }, { lat: 34.689, lon: -144.6955, time: new Date("2015-07-24T22:52:12.000Z") }, { lat: 34.6212, lon: -144.3432, time: new Date("2015-07-24T23:59:41.000Z") }, { lat: 34.5896, lon: -144.183, time: new Date("2015-07-25T00:29:48.000Z") }, { lat: 34.5843, lon: -144.1566, time: new Date("2015-07-25T00:34:48.000Z") }, { lat: 34.5255, lon: -143.86, time: new Date("2015-07-25T01:30:41.000Z") }, { lat: 34.485, lon: -143.6563, time: new Date("2015-07-25T02:09:12.000Z") }, { lat: 34.4835, lon: -143.6488, time: new Date("2015-07-25T02:10:37.000Z") }, { lat: 34.388, lon: -143.161, time: new Date("2015-07-25T03:42:24.000Z") }, { lat: 34.2856, lon: -142.6644, time: new Date("2015-07-25T05:20:24.000Z") }, { lat: 34.2045, lon: -142.2916, time: new Date("2015-07-25T06:33:24.000Z") }, { lat: 34.172, lon: -142.1554, time: new Date("2015-07-25T07:00:24.000Z") }, { lat: 34.1455, lon: -142.0046, time: new Date("2015-07-25T07:29:34.000Z") }, { lat: 34.1134, lon: -141.8124, time: new Date("2015-07-25T08:06:30.000Z") }, { lat: 34.0649, lon: -141.5236, time: new Date("2015-07-25T09:02:29.000Z") }, { lat: 34.0626, lon: -141.5113, time: new Date("2015-07-25T09:04:47.000Z") }, { lat: 34.0539, lon: -141.4648, time: new Date("2015-07-25T09:13:48.000Z") }, { lat: 33.9423, lon: -140.8708, time: new Date("2015-07-25T11:10:24.000Z") }, { lat: 33.8652, lon: -140.4814, time: new Date("2015-07-25T12:27:42.000Z") }, { lat: 33.6453, lon: -139.5646, time: new Date("2015-07-25T15:31:24.000Z") }, { lat: 33.4136, lon: -138.7462, time: new Date("2015-07-25T18:17:12.000Z") }, { lat: 33.3958, lon: -138.6834, time: new Date("2015-07-25T18:28:47.000Z") }, { lat: 33.3716, lon: -138.6008, time: new Date("2015-07-25T18:43:48.000Z") }, { lat: 33.3692, lon: -138.5918, time: new Date("2015-07-25T18:45:24.000Z") }, { lat: 33.3539, lon: -138.539, time: new Date("2015-07-25T18:55:01.000Z") }, { lat: 33.2581, lon: -138.2144, time: new Date("2015-07-25T19:53:24.000Z") }, { lat: 33.2432, lon: -138.1667, time: new Date("2015-07-25T20:02:07.000Z") }, { lat: 33.2101, lon: -138.0596, time: new Date("2015-07-25T20:21:36.000Z") }, { lat: 33.0146, lon: -137.367, time: new Date("2015-07-25T22:27:37.000Z") }, { lat: 32.98, lon: -137.2385, time: new Date("2015-07-25T22:51:00.000Z") }, { lat: 32.9021, lon: -136.9785, time: new Date("2015-07-25T23:38:24.000Z") }, { lat: 32.8493, lon: -136.8068, time: new Date("2015-07-26T00:09:49.000Z") }, { lat: 32.825, lon: -136.7276, time: new Date("2015-07-26T00:24:24.000Z") }, { lat: 32.7402, lon: -136.456, time: new Date("2015-07-26T01:14:36.000Z") }, { lat: 32.7369, lon: -136.4453, time: new Date("2015-07-26T01:16:35.000Z") }, { lat: 32.6833, lon: -136.2768, time: new Date("2015-07-26T01:48:01.000Z") }, { lat: 32.5677, lon: -135.9446, time: new Date("2015-07-26T02:50:48.000Z") }, { lat: 32.3599, lon: -135.1826, time: new Date("2015-07-26T05:10:35.000Z") }, { lat: 32.3164, lon: -135.0133, time: new Date("2015-07-26T05:41:06.000Z") }, { lat: 32.2213, lon: -134.6441, time: new Date("2015-07-26T06:47:41.000Z") }, { lat: 32.1778, lon: -134.4919, time: new Date("2015-07-26T07:15:12.000Z") }, { lat: 32.1724, lon: -134.4733, time: new Date("2015-07-26T07:18:35.000Z") }, { lat: 32.1007, lon: -134.2224, time: new Date("2015-07-26T08:03:59.000Z") }, { lat: 31.9561, lon: -133.6972, time: new Date("2015-07-26T09:39:36.000Z") }, { lat: 31.8007, lon: -133.1601, time: new Date("2015-07-26T11:19:05.000Z") }, { lat: 31.6813, lon: -132.7648, time: new Date("2015-07-26T12:31:34.000Z") }, { lat: 31.4972, lon: -132.2505, time: new Date("2015-07-26T14:08:18.000Z") }, { lat: 31.3888, lon: -131.5305, time: new Date("2015-07-26T16:14:42.000Z") }, { lat: 31.3088, lon: -131.28, time: new Date("2015-07-26T17:00:54.000Z") }, { lat: 31.2708, lon: -131.1805, time: new Date("2015-07-26T17:20:00.000Z") }, { lat: 31.2397, lon: -131.0982, time: new Date("2015-07-26T17:35:46.000Z") }, { lat: 31.2395, lon: -131.0976, time: new Date("2015-07-26T17:35:54.000Z") }, { lat: 31.2032, lon: -131.0078, time: new Date("2015-07-26T17:53:24.000Z") }, { lat: 31.1113, lon: -130.7738, time: new Date("2015-07-26T18:38:30.000Z") }, { lat: 31.0996, lon: -130.7423, time: new Date("2015-07-26T18:44:23.000Z") }, { lat: 31.0771, lon: -130.6822, time: new Date("2015-07-26T18:55:42.000Z") }, { lat: 31.0282, lon: -130.5425, time: new Date("2015-07-26T19:21:54.000Z") }, { lat: 31.0124, lon: -130.4897, time: new Date("2015-07-26T19:31:56.000Z") }, { lat: 30.9525, lon: -130.2943, time: new Date("2015-07-26T20:08:05.000Z") }, { lat: 30.8455, lon: -129.9623, time: new Date("2015-07-26T21:09:16.000Z") }, { lat: 30.7871, lon: -129.791, time: new Date("2015-07-26T21:40:48.000Z") }, { lat: 30.5919, lon: -129.2681, time: new Date("2015-07-26T23:18:25.000Z") }, { lat: 30.5405, lon: -129.1336, time: new Date("2015-07-26T23:43:48.000Z") }, { lat: 30.4527, lon: -128.9041, time: new Date("2015-07-27T00:27:48.000Z") }, { lat: 30.3418, lon: -128.6196, time: new Date("2015-07-27T01:21:48.000Z") }, { lat: 30.2664, lon: -128.4219, time: new Date("2015-07-27T01:59:24.000Z") }, { lat: 30.2606, lon: -128.4071, time: new Date("2015-07-27T02:02:11.000Z") }, { lat: 29.972, lon: -127.6554, time: new Date("2015-07-27T04:25:48.000Z") }, { lat: 29.8505, lon: -127.3382, time: new Date("2015-07-27T05:26:24.000Z") }, { lat: 29.7831, lon: -127.1631, time: new Date("2015-07-27T06:00:00.000Z") }, { lat: 29.7053, lon: -126.9633, time: new Date("2015-07-27T06:38:23.000Z") }, { lat: 29.6593, lon: -126.8438, time: new Date("2015-07-27T07:01:05.000Z") }, { lat: 29.4876, lon: -126.3763, time: new Date("2015-07-27T08:29:31.000Z") }, { lat: 29.2821, lon: -125.8675, time: new Date("2015-07-27T10:07:59.000Z") }, { lat: 29.1686, lon: -125.5749, time: new Date("2015-07-27T11:04:25.000Z") }, { lat: 29.1452, lon: -125.5143, time: new Date("2015-07-27T11:16:01.000Z") }, { lat: 29.0643, lon: -125.2947, time: new Date("2015-07-27T11:58:07.000Z") }, { lat: 29.0131, lon: -125.1654, time: new Date("2015-07-27T12:23:31.000Z") }, { lat: 28.9838, lon: -125.0918, time: new Date("2015-07-27T12:37:54.000Z") }, { lat: 28.9745, lon: -125.0684, time: new Date("2015-07-27T12:42:31.000Z") }, { lat: 28.9425, lon: -124.9886, time: new Date("2015-07-27T12:58:19.000Z") }, { lat: 28.9224, lon: -124.9372, time: new Date("2015-07-27T13:08:36.000Z") }, { lat: 28.9085, lon: -124.9018, time: new Date("2015-07-27T13:15:37.000Z") }, { lat: 28.8928, lon: -124.8621, time: new Date("2015-07-27T13:23:30.000Z") }, { lat: 28.7815, lon: -124.5864, time: new Date("2015-07-27T14:18:13.000Z") }, { lat: 28.7753, lon: -124.5703, time: new Date("2015-07-27T14:21:24.000Z") }, { lat: 28.7509, lon: -124.5072, time: new Date("2015-07-27T14:33:46.000Z") }, { lat: 28.6859, lon: -124.3404, time: new Date("2015-07-27T15:06:36.000Z") }, { lat: 28.6644, lon: -124.286, time: new Date("2015-07-27T15:17:13.000Z") }, { lat: 28.6549, lon: -124.2624, time: new Date("2015-07-27T15:21:49.000Z") }, { lat: 28.6088, lon: -124.1452, time: new Date("2015-07-27T15:45:01.000Z") }, { lat: 28.5033, lon: -123.8793, time: new Date("2015-07-27T16:37:55.000Z") }, { lat: 28.4199, lon: -123.6781, time: new Date("2015-07-27T17:17:54.000Z") }, { lat: 28.3977, lon: -123.6261, time: new Date("2015-07-27T17:28:19.000Z") }, { lat: 28.3787, lon: -123.5812, time: new Date("2015-07-27T17:37:18.000Z") }, { lat: 28.3576, lon: -123.531, time: new Date("2015-07-27T17:47:18.000Z") }, { lat: 28.3359, lon: -123.4798, time: new Date("2015-07-27T17:57:31.000Z") }, { lat: 28.3221, lon: -123.4469, time: new Date("2015-07-27T18:03:58.000Z") }, { lat: 28.2369, lon: -123.2363, time: new Date("2015-07-27T18:45:31.000Z") }, { lat: 28.1839, lon: -123.0889, time: new Date("2015-07-27T19:14:19.000Z") }, { lat: 28.1794, lon: -123.076, time: new Date("2015-07-27T19:16:48.000Z") }, { lat: 28.1213, lon: -122.911, time: new Date("2015-07-27T19:48:25.000Z") }, { lat: 28.0136, lon: -122.6117, time: new Date("2015-07-27T20:47:35.000Z") }, { lat: 27.9209, lon: -122.3842, time: new Date("2015-07-27T21:32:36.000Z") }, { lat: 27.9028, lon: -122.34, time: new Date("2015-07-27T21:41:24.000Z") }, { lat: 27.7887, lon: -122.0578, time: new Date("2015-07-27T22:37:18.000Z") }, { lat: 27.7087, lon: -121.8509, time: new Date("2015-07-27T23:18:01.000Z") }, { lat: 27.7075, lon: -121.8479, time: new Date("2015-07-27T23:18:37.000Z") }, { lat: 27.6117, lon: -121.6077, time: new Date("2015-07-28T00:06:24.000Z") }, { lat: 27.5165, lon: -121.3666, time: new Date("2015-07-28T00:54:49.000Z") }, { lat: 27.4905, lon: -121.3011, time: new Date("2015-07-28T01:08:00.000Z") }, { lat: 27.3219, lon: -120.9094, time: new Date("2015-07-28T02:28:00.000Z") }, { lat: 27.2993, lon: -120.8606, time: new Date("2015-07-28T02:38:01.000Z") }, { lat: 27.2776, lon: -120.8132, time: new Date("2015-07-28T02:47:42.000Z") }, { lat: 27.238, lon: -120.7243, time: new Date("2015-07-28T03:05:49.000Z") }, { lat: 27.1231, lon: -120.4705, time: new Date("2015-07-28T03:57:31.000Z") }, { lat: 27.1018, lon: -120.424, time: new Date("2015-07-28T04:07:01.000Z") }, { lat: 27.0411, lon: -120.2924, time: new Date("2015-07-28T04:33:48.000Z") }, { lat: 26.8049, lon: -119.7833, time: new Date("2015-07-28T06:16:48.000Z") }, { lat: 26.646, lon: -119.4343, time: new Date("2015-07-28T07:26:37.000Z") }, { lat: 26.6298, lon: -119.3983, time: new Date("2015-07-28T07:33:49.000Z") }, { lat: 26.462, lon: -119.021, time: new Date("2015-07-28T08:49:18.000Z") }, { lat: 26.4398, lon: -118.97, time: new Date("2015-07-28T08:59:23.000Z") }, { lat: 26.2294, lon: -118.4821, time: new Date("2015-07-28T10:35:24.000Z") }, { lat: 26.1073, lon: -118.2137, time: new Date("2015-07-28T11:29:17.000Z") }, { lat: 26.0665, lon: -118.1324, time: new Date("2015-07-28T11:46:00.000Z") }, { lat: 25.8585, lon: -117.7042, time: new Date("2015-07-28T13:12:49.000Z") }, { lat: 25.7651, lon: -117.5114, time: new Date("2015-07-28T13:52:01.000Z") }, { lat: 25.5979, lon: -117.1779, time: new Date("2015-07-28T15:02:11.000Z") }, { lat: 25.3677, lon: -116.7326, time: new Date("2015-07-28T16:37:37.000Z") }, { lat: 25.3438, lon: -116.6852, time: new Date("2015-07-28T16:47:48.000Z") }, { lat: 25.3203, lon: -116.6388, time: new Date("2015-07-28T16:57:48.000Z") }, { lat: 25.2958, lon: -116.5907, time: new Date("2015-07-28T17:08:13.000Z") }, { lat: 25.2802, lon: -116.5602, time: new Date("2015-07-28T17:14:49.000Z") }, { lat: 25.2517, lon: -116.5034, time: new Date("2015-07-28T17:27:00.000Z") }, { lat: 25.2259, lon: -116.4518, time: new Date("2015-07-28T17:38:01.000Z") }, { lat: 25.2018, lon: -116.4049, time: new Date("2015-07-28T17:47:49.000Z") }, { lat: 25.1806, lon: -116.3626, time: new Date("2015-07-28T17:56:36.000Z") }, { lat: 25.1012, lon: -116.205, time: new Date("2015-07-28T18:28:13.000Z") }, { lat: 25.099, lon: -116.2005, time: new Date("2015-07-28T18:29:03.000Z") }, { lat: 25.0261, lon: -116.0511, time: new Date("2015-07-28T18:58:49.000Z") }, { lat: 24.9991, lon: -115.9924, time: new Date("2015-07-28T19:10:30.000Z") }, { lat: 24.8589, lon: -115.6769, time: new Date("2015-07-28T20:14:49.000Z") }, { lat: 24.8247, lon: -115.6001, time: new Date("2015-07-28T20:30:25.000Z") }, { lat: 24.751, lon: -115.4517, time: new Date("2015-07-28T21:01:41.000Z") }, { lat: 24.6155, lon: -115.1864, time: new Date("2015-07-28T21:57:37.000Z") }, { lat: 24.512, lon: -114.9804, time: new Date("2015-07-28T22:41:01.000Z") }, { lat: 24.4822, lon: -114.9155, time: new Date("2015-07-28T22:54:25.000Z") }, { lat: 24.4301, lon: -114.8026, time: new Date("2015-07-28T23:17:25.000Z") }, { lat: 24.4101, lon: -114.7622, time: new Date("2015-07-28T23:25:37.000Z") }, { lat: 24.246, lon: -114.4374, time: new Date("2015-07-29T00:31:48.000Z") }, { lat: 23.8936, lon: -113.7221, time: new Date("2015-07-29T02:57:30.000Z") }, { lat: 23.8677, lon: -113.6704, time: new Date("2015-07-29T03:08:13.000Z") }, { lat: 23.8448, lon: -113.6242, time: new Date("2015-07-29T03:17:55.000Z") }, { lat: 23.8214, lon: -113.5766, time: new Date("2015-07-29T03:27:49.000Z") }, { lat: 23.8001, lon: -113.5339, time: new Date("2015-07-29T03:36:55.000Z") }, { lat: 23.7048, lon: -113.3559, time: new Date("2015-07-29T04:15:41.000Z") }, { lat: 23.6072, lon: -113.1513, time: new Date("2015-07-29T04:59:47.000Z") }, { lat: 23.4843, lon: -112.8914, time: new Date("2015-07-29T05:55:18.000Z") }, { lat: 23.4764, lon: -112.8767, time: new Date("2015-07-29T05:58:36.000Z") }, { lat: 23.4741, lon: -112.8726, time: new Date("2015-07-29T05:59:29.000Z") }, { lat: 23.424, lon: -112.7802, time: new Date("2015-07-29T06:19:36.000Z") }, { lat: 23.1327, lon: -112.1992, time: new Date("2015-07-29T08:23:59.000Z") }, { lat: 23, lon: -111.9337, time: new Date("2015-07-29T09:21:19.000Z") }, { lat: 22.9946, lon: -111.9229, time: new Date("2015-07-29T09:23:37.000Z") }, { lat: 22.8822, lon: -111.6986, time: new Date("2015-07-29T10:11:53.000Z") }, { lat: 22.6364, lon: -111.2085, time: new Date("2015-07-29T11:55:17.000Z") }, { lat: 22.388, lon: -110.7129, time: new Date("2015-07-29T13:39:40.000Z") }, { lat: 22.1433, lon: -110.2159, time: new Date("2015-07-29T15:25:17.000Z") }, { lat: 22.0016, lon: -109.961, time: new Date("2015-07-29T16:21:05.000Z") }, { lat: 21.8817, lon: -109.74, time: new Date("2015-07-29T17:09:04.000Z") }, { lat: 21.7687, lon: -109.5259, time: new Date("2015-07-29T17:55:28.000Z") }, { lat: 21.6156, lon: -109.27, time: new Date("2015-07-29T18:54:09.000Z") }, { lat: 21.6116, lon: -109.2638, time: new Date("2015-07-29T18:55:39.000Z") }, { lat: 21.3516, lon: -108.8163, time: new Date("2015-07-29T20:38:19.000Z") }, { lat: 21.0893, lon: -108.3539, time: new Date("2015-07-29T22:23:22.000Z") }, { lat: 20.9254, lon: -108.069, time: new Date("2015-07-29T23:29:12.000Z") }, { lat: 20.8286, lon: -107.9019, time: new Date("2015-07-30T00:07:23.000Z") }, { lat: 20.8272, lon: -107.8993, time: new Date("2015-07-30T00:08:00.000Z") }, { lat: 20.3086, lon: -106.9725, time: new Date("2015-07-30T02:37:55.000Z") }, { lat: 20.0554, lon: -106.5225, time: new Date("2015-07-30T04:20:47.000Z") }, { lat: 20.0151, lon: -106.4538, time: new Date("2015-07-30T04:36:56.000Z") }, { lat: 19.7775, lon: -106.0706, time: new Date("2015-07-30T06:06:46.000Z") }, { lat: 19.7751, lon: -106.0667, time: new Date("2015-07-30T06:07:41.000Z") }, { lat: 19.5073, lon: -105.6019, time: new Date("2015-07-30T07:54:05.000Z") }, { lat: 19.3732, lon: -105.3534, time: new Date("2015-07-30T08:51:47.000Z") }, { lat: 19.2655, lon: -105.1617, time: new Date("2015-07-30T09:36:53.000Z") }, { lat: 19.2024, lon: -105.0516, time: new Date("2015-07-30T10:03:06.000Z") }, { lat: 19.1694, lon: -104.9843, time: new Date("2015-07-30T10:18:24.000Z") }, { lat: 19.1536, lon: -104.9383, time: new Date("2015-07-30T10:28:13.000Z") }, { lat: 19.1396, lon: -104.8911, time: new Date("2015-07-30T10:38:12.000Z") }, { lat: 19.1255, lon: -104.8435, time: new Date("2015-07-30T10:48:19.000Z") }, { lat: 19.1123, lon: -104.7965, time: new Date("2015-07-30T10:58:25.000Z") }, { lat: 19.0993, lon: -104.751, time: new Date("2015-07-30T11:08:18.000Z") }, { lat: 19.0855, lon: -104.705, time: new Date("2015-07-30T11:18:13.000Z") }, { lat: 19.0719, lon: -104.658, time: new Date("2015-07-30T11:28:18.000Z") }, { lat: 19.0592, lon: -104.6112, time: new Date("2015-07-30T11:38:19.000Z") }, { lat: 19.0497, lon: -104.566, time: new Date("2015-07-30T11:48:12.000Z") }, { lat: 19.0408, lon: -104.5212, time: new Date("2015-07-30T11:58:01.000Z") }, { lat: 19.0326, lon: -104.4742, time: new Date("2015-07-30T12:08:13.000Z") }, { lat: 19.0255, lon: -104.4286, time: new Date("2015-07-30T12:18:01.000Z") }, { lat: 19.0243, lon: -104.3842, time: new Date("2015-07-30T12:27:48.000Z") }, { lat: 19.0433, lon: -104.3599, time: new Date("2015-07-30T12:37:46.000Z") }, { lat: 19.0581, lon: -104.3448, time: new Date("2015-07-30T12:49:14.000Z") }, { lat: 19.0676, lon: -104.3262, time: new Date("2015-07-30T12:58:55.000Z") }, { lat: 19.0606, lon: -104.3051, time: new Date("2015-07-30T13:09:05.000Z") }, { lat: 19.0693, lon: -104.2933, time: new Date("2015-07-30T13:18:55.000Z") }, { lat: 19.0753, lon: -104.2909, time: new Date("2015-07-30T13:28:45.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T13:38:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T13:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T13:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:05:22.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:26:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:38:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T14:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:26:22.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:38:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T15:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:26:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:35:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:47:22.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T16:56:22.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:26:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:35:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T17:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:26:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:35:24.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:47:32.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T18:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:26:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:38:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T19:56:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:26:24.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:35:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:47:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T20:56:24.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T21:08:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T21:17:23.000Z") }, { lat: 19.0762, lon: -104.2905, time: new Date("2015-07-30T21:26:23.000Z") }, { lat: 19.0735, lon: -104.2923, time: new Date("2015-07-30T21:38:23.000Z") }, { lat: 19.061, lon: -104.302, time: new Date("2015-07-30T21:48:31.000Z") }, { lat: 19.0674, lon: -104.3171, time: new Date("2015-07-30T21:58:00.000Z") }, { lat: 19.0724, lon: -104.3383, time: new Date("2015-07-30T22:07:50.000Z") }, { lat: 19.0532, lon: -104.3822, time: new Date("2015-07-30T22:18:57.000Z") }, { lat: 19.0132, lon: -104.3945, time: new Date("2015-07-30T22:28:33.000Z") }, { lat: 18.9684, lon: -104.3819, time: new Date("2015-07-30T22:38:03.000Z") }, { lat: 18.9235, lon: -104.35, time: new Date("2015-07-30T22:49:03.000Z") }, { lat: 18.884, lon: -104.3221, time: new Date("2015-07-30T22:58:39.000Z") }, { lat: 18.8454, lon: -104.2933, time: new Date("2015-07-30T23:08:09.000Z") }, { lat: 18.8064, lon: -104.2631, time: new Date("2015-07-30T23:17:50.000Z") }, { lat: 18.767, lon: -104.2306, time: new Date("2015-07-30T23:27:57.000Z") }, { lat: 18.7364, lon: -104.205, time: new Date("2015-07-30T23:35:51.000Z") }, { lat: 18.3372, lon: -103.8919, time: new Date("2015-07-31T01:16:38.000Z") }, { lat: 18.142, lon: -103.7096, time: new Date("2015-07-31T02:09:55.000Z") }, { lat: 18.0344, lon: -103.4627, time: new Date("2015-07-31T03:01:26.000Z") }, { lat: 18.0128, lon: -103.4156, time: new Date("2015-07-31T03:11:07.000Z") }, { lat: 17.9276, lon: -103.2361, time: new Date("2015-07-31T03:47:55.000Z") }, { lat: 17.9183, lon: -103.2166, time: new Date("2015-07-31T03:51:55.000Z") }, { lat: 17.8642, lon: -103.103, time: new Date("2015-07-31T04:15:26.000Z") }, { lat: 17.791, lon: -102.9477, time: new Date("2015-07-31T04:47:51.000Z") }, { lat: 17.7885, lon: -102.9424, time: new Date("2015-07-31T04:48:57.000Z") }, { lat: 17.566, lon: -102.4375, time: new Date("2015-07-31T06:33:02.000Z") }, { lat: 17.4165, lon: -102.1157, time: new Date("2015-07-31T07:39:26.000Z") }, { lat: 17.3372, lon: -101.9445, time: new Date("2015-07-31T08:14:42.000Z") }, { lat: 17.1099, lon: -101.4439, time: new Date("2015-07-31T10:02:00.000Z") }, { lat: 16.989, lon: -101.187, time: new Date("2015-07-31T10:57:02.000Z") }, { lat: 16.8939, lon: -100.9759, time: new Date("2015-07-31T11:42:00.000Z") }, { lat: 16.7161, lon: -100.5833, time: new Date("2015-07-31T13:07:39.000Z") }, { lat: 16.7025, lon: -100.5549, time: new Date("2015-07-31T13:13:51.000Z") }, { lat: 16.6806, lon: -100.5086, time: new Date("2015-07-31T13:23:51.000Z") }, { lat: 16.6469, lon: -100.4374, time: new Date("2015-07-31T13:39:15.000Z") }, { lat: 16.6281, lon: -100.3978, time: new Date("2015-07-31T13:47:51.000Z") }, { lat: 16.6063, lon: -100.3517, time: new Date("2015-07-31T13:57:50.000Z") }, { lat: 16.5837, lon: -100.3036, time: new Date("2015-07-31T14:08:15.000Z") }, { lat: 16.5645, lon: -100.2622, time: new Date("2015-07-31T14:17:15.000Z") }, { lat: 16.5407, lon: -100.2108, time: new Date("2015-07-31T14:28:26.000Z") }, { lat: 16.5192, lon: -100.165, time: new Date("2015-07-31T14:38:27.000Z") }, { lat: 16.4978, lon: -100.1198, time: new Date("2015-07-31T14:48:27.000Z") }, { lat: 16.4757, lon: -100.0734, time: new Date("2015-07-31T14:58:39.000Z") }, { lat: 16.4533, lon: -100.0261, time: new Date("2015-07-31T15:09:03.000Z") }, { lat: 16.4375, lon: -99.9933, time: new Date("2015-07-31T15:16:15.000Z") }, { lat: 16.4138, lon: -99.9434, time: new Date("2015-07-31T15:27:03.000Z") }, { lat: 16.392, lon: -99.8972, time: new Date("2015-07-31T15:36:57.000Z") }, { lat: 16.3706, lon: -99.8515, time: new Date("2015-07-31T15:46:32.000Z") }, { lat: 16.3554, lon: -99.8188, time: new Date("2015-07-31T15:53:21.000Z") }, { lat: 16.3227, lon: -99.7485, time: new Date("2015-07-31T16:07:51.000Z") }, { lat: 16.3006, lon: -99.7001, time: new Date("2015-07-31T16:17:51.000Z") }, { lat: 16.2231, lon: -99.5233, time: new Date("2015-07-31T16:53:57.000Z") }, { lat: 16.1962, lon: -99.4615, time: new Date("2015-07-31T17:06:38.000Z") }, { lat: 15.9836, lon: -99.0031, time: new Date("2015-07-31T18:43:56.000Z") }, { lat: 15.7558, lon: -98.4975, time: new Date("2015-07-31T20:29:50.000Z") }, { lat: 15.7466, lon: -98.4764, time: new Date("2015-07-31T20:34:15.000Z") }, { lat: 15.7229, lon: -98.4262, time: new Date("2015-07-31T20:44:56.000Z") }, { lat: 15.7172, lon: -98.414, time: new Date("2015-07-31T20:47:33.000Z") }, { lat: 15.5541, lon: -98.0222, time: new Date("2015-07-31T22:09:14.000Z") }, { lat: 15.5458, lon: -97.9926, time: new Date("2015-07-31T22:15:03.000Z") }, { lat: 15.4055, lon: -97.4646, time: new Date("2015-07-31T23:57:32.000Z") }, { lat: 15.4038, lon: -97.4584, time: new Date("2015-07-31T23:58:44.000Z") }, { lat: 15.2589, lon: -96.9342, time: new Date("2015-08-01T01:40:31.000Z") }, { lat: 15.1936, lon: -96.7084, time: new Date("2015-08-01T02:25:02.000Z") }, { lat: 15.1034, lon: -96.4056, time: new Date("2015-08-01T03:25:43.000Z") }, { lat: 15.0465, lon: -96.2137, time: new Date("2015-08-01T04:04:50.000Z") }, { lat: 15.0426, lon: -96.2003, time: new Date("2015-08-01T04:07:37.000Z") }, { lat: 14.9612, lon: -95.8879, time: new Date("2015-08-01T05:11:55.000Z") }, { lat: 14.8464, lon: -95.3987, time: new Date("2015-08-01T06:52:43.000Z") }, { lat: 14.7553, lon: -95.061, time: new Date("2015-08-01T08:05:15.000Z") }, { lat: 14.7163, lon: -94.9136, time: new Date("2015-08-01T08:38:25.000Z") }, { lat: 14.6053, lon: -94.4323, time: new Date("2015-08-01T10:23:01.000Z") }, { lat: 14.4568, lon: -93.9356, time: new Date("2015-08-01T12:11:55.000Z") }, { lat: 14.3432, lon: -93.4783, time: new Date("2015-08-01T13:51:50.000Z") }, { lat: 14.1996, lon: -92.9632, time: new Date("2015-08-01T15:35:12.000Z") }, { lat: 14.1917, lon: -92.9362, time: new Date("2015-08-01T15:40:24.000Z") }, { lat: 14.1705, lon: -92.8648, time: new Date("2015-08-01T15:54:23.000Z") }, { lat: 14.1554, lon: -92.8157, time: new Date("2015-08-01T16:03:44.000Z") }, { lat: 14.0398, lon: -92.3894, time: new Date("2015-08-01T17:22:18.000Z") }, { lat: 13.8829, lon: -91.8228, time: new Date("2015-08-01T19:05:53.000Z") }, { lat: 13.8252, lon: -91.548, time: new Date("2015-08-01T19:56:57.000Z") }, { lat: 13.8086, lon: -91.4489, time: new Date("2015-08-01T20:15:36.000Z") }, { lat: 13.8, lon: -91.2584, time: new Date("2015-08-01T20:51:26.000Z") }, { lat: 13.7994, lon: -91.0724, time: new Date("2015-08-01T21:28:14.000Z") }, { lat: 13.7994, lon: -91.0243, time: new Date("2015-08-01T21:38:27.000Z") }, { lat: 13.7997, lon: -90.9786, time: new Date("2015-08-01T21:48:15.000Z") }, { lat: 13.8005, lon: -90.9323, time: new Date("2015-08-01T21:58:08.000Z") }, { lat: 13.8014, lon: -90.8853, time: new Date("2015-08-01T22:08:09.000Z") }, { lat: 13.8049, lon: -90.8386, time: new Date("2015-08-01T22:18:03.000Z") }, { lat: 13.8294, lon: -90.8002, time: new Date("2015-08-01T22:27:51.000Z") }, { lat: 13.8611, lon: -90.7624, time: new Date("2015-08-01T22:38:14.000Z") }, { lat: 13.9003, lon: -90.7661, time: new Date("2015-08-01T22:48:20.000Z") }, { lat: 13.9132, lon: -90.7752, time: new Date("2015-08-01T22:58:36.000Z") }, { lat: 13.9187, lon: -90.7882, time: new Date("2015-08-01T23:09:06.000Z") }, { lat: 13.9244, lon: -90.7884, time: new Date("2015-08-01T23:17:48.000Z") }, { lat: 13.927, lon: -90.7884, time: new Date("2015-08-01T23:27:57.000Z") }, { lat: 13.9283, lon: -90.7881, time: new Date("2015-08-01T23:37:57.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-01T23:46:57.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-01T23:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:46:57.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T00:55:57.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T01:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T02:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T02:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T02:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T02:37:58.000Z") }, { lat: 13.9284, lon: -90.7879, time: new Date("2015-08-02T02:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T02:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T03:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T03:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T03:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T03:37:58.000Z") }, { lat: 13.9284, lon: -90.7879, time: new Date("2015-08-02T03:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T03:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T04:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T05:55:59.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T06:55:59.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:07:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:25:59.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T07:55:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:04:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:16:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:25:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:37:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:46:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T08:58:58.000Z") }, { lat: 13.9284, lon: -90.788, time: new Date("2015-08-02T09:04:58.000Z") }, { lat: 13.9245, lon: -90.788, time: new Date("2015-08-02T09:18:01.000Z") }, { lat: 13.9216, lon: -90.7883, time: new Date("2015-08-02T09:27:51.000Z") }, { lat: 13.9188, lon: -90.787, time: new Date("2015-08-02T09:38:11.000Z") }, { lat: 13.9108, lon: -90.7727, time: new Date("2015-08-02T09:48:12.000Z") }, { lat: 13.8839, lon: -90.7398, time: new Date("2015-08-02T09:58:08.000Z") }, { lat: 13.8532, lon: -90.7038, time: new Date("2015-08-02T10:08:08.000Z") }, { lat: 13.8206, lon: -90.6668, time: new Date("2015-08-02T10:18:37.000Z") }, { lat: 13.7897, lon: -90.6319, time: new Date("2015-08-02T10:28:38.000Z") }, { lat: 13.7333, lon: -90.5679, time: new Date("2015-08-02T10:46:36.000Z") }, { lat: 13.7279, lon: -90.562, time: new Date("2015-08-02T10:48:18.000Z") }, { lat: 13.42, lon: -90.2062, time: new Date("2015-08-02T12:28:54.000Z") }, { lat: 13.095, lon: -89.8358, time: new Date("2015-08-02T14:13:00.000Z") }, { lat: 12.9986, lon: -89.7233, time: new Date("2015-08-02T14:45:14.000Z") }, { lat: 12.9787, lon: -89.6997, time: new Date("2015-08-02T14:51:56.000Z") }, { lat: 12.7793, lon: -89.465, time: new Date("2015-08-02T15:58:24.000Z") }, { lat: 12.7497, lon: -89.4313, time: new Date("2015-08-02T16:08:44.000Z") }, { lat: 12.4621, lon: -89.0992, time: new Date("2015-08-02T17:46:07.000Z") }, { lat: 12.4552, lon: -89.0908, time: new Date("2015-08-02T17:48:33.000Z") }, { lat: 12.3666, lon: -88.9874, time: new Date("2015-08-02T19:30:50.000Z") }, { lat: 12.3719, lon: -88.9884, time: new Date("2015-08-02T19:53:43.000Z") }, { lat: 12.3789, lon: -88.9891, time: new Date("2015-08-02T20:42:44.000Z") }, { lat: 12.2842, lon: -88.8963, time: new Date("2015-08-02T21:15:06.000Z") }, { lat: 12.2701, lon: -88.8812, time: new Date("2015-08-02T21:19:36.000Z") }, { lat: 12.2283, lon: -88.8347, time: new Date("2015-08-02T21:33:48.000Z") }, { lat: 11.9635, lon: -88.5253, time: new Date("2015-08-02T23:03:00.000Z") }, { lat: 11.6594, lon: -88.1773, time: new Date("2015-08-03T00:44:00.000Z") }, { lat: 11.5527, lon: -88.0561, time: new Date("2015-08-03T01:19:11.000Z") }, { lat: 11.3861, lon: -87.8681, time: new Date("2015-08-03T02:12:59.000Z") }, { lat: 11.3293, lon: -87.8052, time: new Date("2015-08-03T02:30:59.000Z") }, { lat: 11.2448, lon: -87.7085, time: new Date("2015-08-03T02:59:18.000Z") }, { lat: 11.213, lon: -87.6698, time: new Date("2015-08-03T03:10:14.000Z") }, { lat: 11.0189, lon: -87.4318, time: new Date("2015-08-03T04:16:42.000Z") }, { lat: 10.9396, lon: -87.3384, time: new Date("2015-08-03T04:43:59.000Z") }, { lat: 10.7161, lon: -87.0975, time: new Date("2015-08-03T05:55:00.000Z") }, { lat: 10.7146, lon: -87.0959, time: new Date("2015-08-03T05:55:29.000Z") }, { lat: 10.5678, lon: -86.927, time: new Date("2015-08-03T06:43:59.000Z") }, { lat: 10.5622, lon: -86.9205, time: new Date("2015-08-03T06:45:47.000Z") }, { lat: 10.382, lon: -86.7135, time: new Date("2015-08-03T07:44:00.000Z") }, { lat: 10.3661, lon: -86.6959, time: new Date("2015-08-03T07:49:05.000Z") }, { lat: 10.0691, lon: -86.3553, time: new Date("2015-08-03T09:24:35.000Z") }, { lat: 9.7377, lon: -85.9739, time: new Date("2015-08-03T11:12:47.000Z") }, { lat: 9.7316, lon: -85.9667, time: new Date("2015-08-03T11:14:47.000Z") }, { lat: 9.2758, lon: -85.4587, time: new Date("2015-08-03T13:44:24.000Z") }, { lat: 9.0932, lon: -85.2533, time: new Date("2015-08-03T14:42:40.000Z") }, { lat: 8.9451, lon: -85.0858, time: new Date("2015-08-03T15:29:53.000Z") }, { lat: 8.7765, lon: -84.8886, time: new Date("2015-08-03T16:24:09.000Z") }, { lat: 8.4583, lon: -84.5215, time: new Date("2015-08-03T18:05:33.000Z") }, { lat: 8.4348, lon: -84.4953, time: new Date("2015-08-03T18:12:51.000Z") }, { lat: 8.4295, lon: -84.4895, time: new Date("2015-08-03T18:14:53.000Z") }, { lat: 8.4285, lon: -84.4884, time: new Date("2015-08-03T18:15:11.000Z") }, { lat: 8.1251, lon: -84.1327, time: new Date("2015-08-03T19:50:59.000Z") }, { lat: 8.104, lon: -84.1084, time: new Date("2015-08-03T19:57:36.000Z") }, { lat: 8.0942, lon: -84.0971, time: new Date("2015-08-03T20:00:41.000Z") }, { lat: 7.8171, lon: -83.6894, time: new Date("2015-08-03T21:41:12.000Z") }, { lat: 7.8087, lon: -83.6749, time: new Date("2015-08-03T21:44:36.000Z") }, { lat: 7.5722, lon: -83.2435, time: new Date("2015-08-03T23:25:23.000Z") }, { lat: 7.569, lon: -83.2375, time: new Date("2015-08-03T23:26:47.000Z") }, { lat: 7.5605, lon: -83.222, time: new Date("2015-08-03T23:30:23.000Z") }, { lat: 7.3577, lon: -82.8514, time: new Date("2015-08-04T00:55:05.000Z") }, { lat: 7.3302, lon: -82.8011, time: new Date("2015-08-04T01:06:11.000Z") }, { lat: 7.318, lon: -82.7785, time: new Date("2015-08-04T01:11:24.000Z") }, { lat: 7.2594, lon: -82.667, time: new Date("2015-08-04T01:37:46.000Z") }, { lat: 7.2125, lon: -82.5742, time: new Date("2015-08-04T01:59:29.000Z") }, { lat: 7.0861, lon: -82.3272, time: new Date("2015-08-04T02:55:59.000Z") }, { lat: 7.0383, lon: -82.2409, time: new Date("2015-08-04T03:16:19.000Z") }, { lat: 6.9937, lon: -82.1615, time: new Date("2015-08-04T03:34:47.000Z") }, { lat: 6.9064, lon: -81.8865, time: new Date("2015-08-04T04:36:00.000Z") }, { lat: 6.906, lon: -81.8666, time: new Date("2015-08-04T04:40:05.000Z") }, { lat: 6.8993, lon: -81.3763, time: new Date("2015-08-04T06:21:59.000Z") }, { lat: 6.8993, lon: -81.3482, time: new Date("2015-08-04T06:27:48.000Z") }, { lat: 6.9014, lon: -80.8876, time: new Date("2015-08-04T08:04:47.000Z") }, { lat: 6.9017, lon: -80.8711, time: new Date("2015-08-04T08:08:17.000Z") }, { lat: 6.9023, lon: -80.8429, time: new Date("2015-08-04T08:14:17.000Z") }, { lat: 7.1012, lon: -80.0007, time: new Date("2015-08-04T11:33:35.000Z") }, { lat: 7.2903, lon: -79.814, time: new Date("2015-08-04T12:36:47.000Z") }, { lat: 7.4266, lon: -79.6837, time: new Date("2015-08-04T13:20:57.000Z") }, { lat: 7.6192, lon: -79.4981, time: new Date("2015-08-04T14:22:35.000Z") }, { lat: 7.683, lon: -79.4379, time: new Date("2015-08-04T14:44:31.000Z") }, { lat: 7.7514, lon: -79.3755, time: new Date("2015-08-04T15:04:23.000Z") }, { lat: 8.1224, lon: -79.3551, time: new Date("2015-08-04T16:27:30.000Z") }, { lat: 8.1697, lon: -79.3547, time: new Date("2015-08-04T16:37:46.000Z") }, { lat: 8.2178, lon: -79.354, time: new Date("2015-08-04T16:47:44.000Z") }, { lat: 8.263, lon: -79.353, time: new Date("2015-08-04T16:57:16.000Z") }, { lat: 8.3043, lon: -79.355, time: new Date("2015-08-04T17:06:07.000Z") }, { lat: 8.3671, lon: -79.3619, time: new Date("2015-08-04T17:19:18.000Z") }, { lat: 8.4043, lon: -79.3658, time: new Date("2015-08-04T17:27:47.000Z") }, { lat: 8.4615, lon: -79.3716, time: new Date("2015-08-04T17:39:18.000Z") }, { lat: 8.5055, lon: -79.3729, time: new Date("2015-08-04T17:48:39.000Z") }, { lat: 8.556, lon: -79.3743, time: new Date("2015-08-04T17:59:00.000Z") }, { lat: 8.6044, lon: -79.3764, time: new Date("2015-08-04T18:09:06.000Z") }, { lat: 8.6509, lon: -79.3862, time: new Date("2015-08-04T18:19:00.000Z") }, { lat: 8.6896, lon: -79.3964, time: new Date("2015-08-04T18:28:54.000Z") }, { lat: 8.7278, lon: -79.4069, time: new Date("2015-08-04T18:39:01.000Z") }, { lat: 8.7643, lon: -79.417, time: new Date("2015-08-04T18:48:48.000Z") }, { lat: 8.8008, lon: -79.4273, time: new Date("2015-08-04T18:58:50.000Z") }, { lat: 8.8433, lon: -79.4394, time: new Date("2015-08-04T19:08:47.000Z") }, { lat: 8.8753, lon: -79.4493, time: new Date("2015-08-04T19:18:45.000Z") }, { lat: 8.8872, lon: -79.47, time: new Date("2015-08-04T19:28:26.000Z") }, { lat: 8.8911, lon: -79.4812, time: new Date("2015-08-04T19:38:36.000Z") }, { lat: 8.893, lon: -79.4793, time: new Date("2015-08-04T19:48:16.000Z") }, { lat: 8.8926, lon: -79.4807, time: new Date("2015-08-04T19:57:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T20:07:31.000Z") }, { lat: 8.8925, lon: -79.4807, time: new Date("2015-08-04T20:16:19.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-04T20:27:39.000Z") }, { lat: 8.8925, lon: -79.4807, time: new Date("2015-08-04T20:37:27.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T20:46:34.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T20:57:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T21:06:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T21:18:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T21:27:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T21:37:46.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-04T21:45:38.000Z") }, { lat: 8.8925, lon: -79.4808, time: new Date("2015-08-04T21:57:39.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-04T22:07:15.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-04T22:16:19.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-04T22:28:30.000Z") }, { lat: 8.8923, lon: -79.4808, time: new Date("2015-08-04T22:36:39.000Z") }, { lat: 8.8923, lon: -79.4808, time: new Date("2015-08-04T22:48:38.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-04T22:58:36.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-04T23:07:33.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-04T23:16:27.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-04T23:27:39.000Z") }, { lat: 8.8922, lon: -79.4807, time: new Date("2015-08-04T23:37:34.000Z") }, { lat: 8.8923, lon: -79.4808, time: new Date("2015-08-04T23:48:39.000Z") }, { lat: 8.8924, lon: -79.4807, time: new Date("2015-08-04T23:58:31.000Z") }, { lat: 8.8923, lon: -79.4808, time: new Date("2015-08-05T00:07:40.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-05T00:18:39.000Z") }, { lat: 8.8924, lon: -79.4808, time: new Date("2015-08-05T00:27:39.000Z") }, { lat: 8.8923, lon: -79.4808, time: new Date("2015-08-05T00:37:17.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-05T00:46:18.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-05T00:57:39.000Z") }, { lat: 8.8923, lon: -79.4807, time: new Date("2015-08-05T01:06:39.000Z") }, { lat: 8.8922, lon: -79.4807, time: new Date("2015-08-05T01:15:39.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T01:27:40.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T01:37:27.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T01:45:40.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T01:57:39.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T02:07:11.000Z") }, { lat: 8.8922, lon: -79.4806, time: new Date("2015-08-05T02:16:13.000Z") }, { lat: 8.8922, lon: -79.4806, time: new Date("2015-08-05T02:27:39.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T02:37:13.000Z") }, { lat: 8.8922, lon: -79.4805, time: new Date("2015-08-05T02:46:16.000Z") }, { lat: 8.8921, lon: -79.4805, time: new Date("2015-08-05T02:58:29.000Z") }, { lat: 8.8921, lon: -79.4805, time: new Date("2015-08-05T03:06:39.000Z") }, { lat: 8.8921, lon: -79.4805, time: new Date("2015-08-05T03:15:39.000Z") }, { lat: 8.8922, lon: -79.4807, time: new Date("2015-08-05T03:27:39.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T03:36:39.000Z") }, { lat: 8.8922, lon: -79.4805, time: new Date("2015-08-05T03:45:40.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T03:57:39.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T04:06:40.000Z") }, { lat: 8.8921, lon: -79.4806, time: new Date("2015-08-05T04:15:39.000Z") }, { lat: 8.8921, lon: -79.4805, time: new Date("2015-08-05T04:27:39.000Z") }, { lat: 8.8921, lon: -79.4804, time: new Date("2015-08-05T04:36:40.000Z") }, { lat: 8.8921, lon: -79.4803, time: new Date("2015-08-05T04:45:40.000Z") }, { lat: 8.8921, lon: -79.4805, time: new Date("2015-08-05T04:57:39.000Z") }, { lat: 8.8921, lon: -79.4804, time: new Date("2015-08-05T05:06:39.000Z") }, { lat: 8.8921, lon: -79.4804, time: new Date("2015-08-05T05:15:40.000Z") }, { lat: 8.8922, lon: -79.4804, time: new Date("2015-08-05T05:27:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T05:36:39.000Z") }, { lat: 8.8922, lon: -79.4804, time: new Date("2015-08-05T05:45:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T05:57:39.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T06:06:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T06:18:40.000Z") }, { lat: 8.8921, lon: -79.4802, time: new Date("2015-08-05T06:27:40.000Z") }, { lat: 8.8923, lon: -79.4803, time: new Date("2015-08-05T06:37:12.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T06:48:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T06:57:39.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T07:08:06.000Z") }, { lat: 8.8923, lon: -79.4802, time: new Date("2015-08-05T07:15:40.000Z") }, { lat: 8.8923, lon: -79.4803, time: new Date("2015-08-05T07:27:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T07:37:15.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T07:46:24.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T07:57:40.000Z") }, { lat: 8.8922, lon: -79.4803, time: new Date("2015-08-05T08:06:40.000Z") }, { lat: 8.8921, lon: -79.4803, time: new Date("2015-08-05T08:16:26.000Z") }, { lat: 8.8922, lon: -79.4802, time: new Date("2015-08-05T08:27:39.000Z") }, { lat: 8.8926, lon: -79.4797, time: new Date("2015-08-05T08:36:39.000Z") }, { lat: 8.8927, lon: -79.4794, time: new Date("2015-08-05T08:45:40.000Z") }, { lat: 8.8924, lon: -79.4792, time: new Date("2015-08-05T08:57:39.000Z") }, { lat: 8.8928, lon: -79.4791, time: new Date("2015-08-05T09:06:40.000Z") }, { lat: 8.8943, lon: -79.4898, time: new Date("2015-08-05T09:17:59.000Z") }, { lat: 8.8873, lon: -79.5199, time: new Date("2015-08-05T09:27:53.000Z") }, { lat: 8.9114, lon: -79.5394, time: new Date("2015-08-05T09:37:59.000Z") }, { lat: 8.9305, lon: -79.5547, time: new Date("2015-08-05T09:48:00.000Z") }, { lat: 8.9468, lon: -79.5677, time: new Date("2015-08-05T09:57:51.000Z") }, { lat: 8.9637, lon: -79.5745, time: new Date("2015-08-05T10:08:10.000Z") }, { lat: 8.9751, lon: -79.5785, time: new Date("2015-08-05T10:17:59.000Z") }, { lat: 8.9837, lon: -79.5817, time: new Date("2015-08-05T10:27:58.000Z") }, { lat: 8.9892, lon: -79.5851, time: new Date("2015-08-05T10:38:09.000Z") }, { lat: 8.9918, lon: -79.5876, time: new Date("2015-08-05T10:48:09.000Z") }, { lat: 8.9926, lon: -79.5883, time: new Date("2015-08-05T10:58:08.000Z") }, { lat: 8.9935, lon: -79.5891, time: new Date("2015-08-05T11:08:09.000Z") }, { lat: 8.9954, lon: -79.591, time: new Date("2015-08-05T11:17:59.000Z") }, { lat: 8.9958, lon: -79.5913, time: new Date("2015-08-05T11:27:50.000Z") }, { lat: 8.9979, lon: -79.5934, time: new Date("2015-08-05T11:38:09.000Z") }, { lat: 8.9979, lon: -79.5935, time: new Date("2015-08-05T11:47:59.000Z") }, { lat: 8.9997, lon: -79.5952, time: new Date("2015-08-05T11:57:49.000Z") }, { lat: 9.0031, lon: -79.5985, time: new Date("2015-08-05T12:08:09.000Z") }, { lat: 9.0082, lon: -79.6039, time: new Date("2015-08-05T12:18:00.000Z") }, { lat: 9.0125, lon: -79.6084, time: new Date("2015-08-05T12:28:10.000Z") }, { lat: 9.0143, lon: -79.6102, time: new Date("2015-08-05T12:38:09.000Z") }, { lat: 9.0162, lon: -79.6124, time: new Date("2015-08-05T12:48:10.000Z") }, { lat: 9.0169, lon: -79.6132, time: new Date("2015-08-05T12:57:59.000Z") }, { lat: 9.0173, lon: -79.6136, time: new Date("2015-08-05T13:08:00.000Z") }, { lat: 9.0211, lon: -79.6179, time: new Date("2015-08-05T13:18:00.000Z") }, { lat: 9.0283, lon: -79.6304, time: new Date("2015-08-05T13:27:51.000Z") }, { lat: 9.0371, lon: -79.6423, time: new Date("2015-08-05T13:37:28.000Z") }, { lat: 9.0468, lon: -79.6501, time: new Date("2015-08-05T13:46:26.000Z") }, { lat: 9.0582, lon: -79.6592, time: new Date("2015-08-05T13:57:49.000Z") }, { lat: 9.0697, lon: -79.672, time: new Date("2015-08-05T14:07:49.000Z") }, { lat: 9.0855, lon: -79.6788, time: new Date("2015-08-05T14:17:03.000Z") }, { lat: 9.0987, lon: -79.686, time: new Date("2015-08-05T14:26:08.000Z") }, { lat: 9.1107, lon: -79.6958, time: new Date("2015-08-05T14:37:19.000Z") }, { lat: 9.1158, lon: -79.7105, time: new Date("2015-08-05T14:46:41.000Z") }, { lat: 9.1194, lon: -79.7321, time: new Date("2015-08-05T14:58:41.000Z") }, { lat: 9.1215, lon: -79.7528, time: new Date("2015-08-05T15:07:34.000Z") }, { lat: 9.1142, lon: -79.7701, time: new Date("2015-08-05T15:17:30.000Z") }, { lat: 9.1203, lon: -79.7986, time: new Date("2015-08-05T15:29:01.000Z") }, { lat: 9.1408, lon: -79.8094, time: new Date("2015-08-05T15:39:12.000Z") }, { lat: 9.1566, lon: -79.8127, time: new Date("2015-08-05T15:49:10.000Z") }, { lat: 9.1658, lon: -79.8199, time: new Date("2015-08-05T15:58:40.000Z") }, { lat: 9.1742, lon: -79.8296, time: new Date("2015-08-05T16:08:21.000Z") }, { lat: 9.1827, lon: -79.8403, time: new Date("2015-08-05T16:18:30.000Z") }, { lat: 9.184, lon: -79.8549, time: new Date("2015-08-05T16:28:31.000Z") }, { lat: 9.1828, lon: -79.8712, time: new Date("2015-08-05T16:38:30.000Z") }, { lat: 9.1883, lon: -79.8824, time: new Date("2015-08-05T16:48:20.000Z") }, { lat: 9.1949, lon: -79.8942, time: new Date("2015-08-05T16:56:45.000Z") }, { lat: 9.2049, lon: -79.9117, time: new Date("2015-08-05T17:07:37.000Z") }, { lat: 9.2189, lon: -79.9227, time: new Date("2015-08-05T17:17:49.000Z") }, { lat: 9.2378, lon: -79.9194, time: new Date("2015-08-05T17:29:11.000Z") }, { lat: 9.2467, lon: -79.9157, time: new Date("2015-08-05T17:39:09.000Z") }, { lat: 9.2534, lon: -79.9181, time: new Date("2015-08-05T17:48:50.000Z") }, { lat: 9.2555, lon: -79.9222, time: new Date("2015-08-05T17:58:29.000Z") }, { lat: 9.2575, lon: -79.922, time: new Date("2015-08-05T18:08:29.000Z") }, { lat: 9.2607, lon: -79.9229, time: new Date("2015-08-05T18:18:10.000Z") }, { lat: 9.261, lon: -79.9232, time: new Date("2015-08-05T18:27:59.000Z") }, { lat: 9.2647, lon: -79.9237, time: new Date("2015-08-05T18:38:02.000Z") }, { lat: 9.2657, lon: -79.9237, time: new Date("2015-08-05T18:47:50.000Z") }, { lat: 9.2687, lon: -79.9235, time: new Date("2015-08-05T18:57:09.000Z") }, { lat: 9.2711, lon: -79.9232, time: new Date("2015-08-05T19:07:30.000Z") }, { lat: 9.2716, lon: -79.9231, time: new Date("2015-08-05T19:17:50.000Z") }, { lat: 9.2743, lon: -79.9227, time: new Date("2015-08-05T19:29:10.000Z") }, { lat: 9.2749, lon: -79.9226, time: new Date("2015-08-05T19:39:01.000Z") }, { lat: 9.2771, lon: -79.9223, time: new Date("2015-08-05T19:48:49.000Z") }, { lat: 9.2775, lon: -79.9223, time: new Date("2015-08-05T19:58:30.000Z") }, { lat: 9.2884, lon: -79.9208, time: new Date("2015-08-05T20:08:20.000Z") }, { lat: 9.3115, lon: -79.9183, time: new Date("2015-08-05T20:18:10.000Z") }, { lat: 9.341, lon: -79.9191, time: new Date("2015-08-05T20:29:17.000Z") }, { lat: 9.3611, lon: -79.9197, time: new Date("2015-08-05T20:39:16.000Z") }, { lat: 9.3922, lon: -79.9197, time: new Date("2015-08-05T20:49:01.000Z") }, { lat: 9.4051, lon: -79.8963, time: new Date("2015-08-05T20:58:53.000Z") }, { lat: 9.3726, lon: -79.8956, time: new Date("2015-08-05T21:08:45.000Z") }, { lat: 9.3652, lon: -79.8894, time: new Date("2015-08-05T21:18:25.000Z") }, { lat: 9.367, lon: -79.8861, time: new Date("2015-08-05T21:28:05.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T21:38:07.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T21:48:05.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T21:56:43.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-05T22:06:00.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T22:17:49.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T22:26:42.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T22:38:41.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-05T22:47:36.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-05T22:56:43.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T23:08:00.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-05T23:17:55.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-05T23:27:06.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T23:38:45.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T23:46:58.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-05T23:56:52.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-06T00:08:00.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-06T00:17:51.000Z") }, { lat: 9.3675, lon: -79.885, time: new Date("2015-08-06T00:26:48.000Z") }, { lat: 9.3675, lon: -79.8851, time: new Date("2015-08-06T00:38:00.000Z") }, { lat: 9.3663, lon: -79.8901, time: new Date("2015-08-06T00:48:20.000Z") }, { lat: 9.3779, lon: -79.8969, time: new Date("2015-08-06T00:58:12.000Z") }, { lat: 9.3979, lon: -79.8969, time: new Date("2015-08-06T01:08:00.000Z") }, { lat: 9.4332, lon: -79.8842, time: new Date("2015-08-06T01:17:57.000Z") }, { lat: 9.4775, lon: -79.8599, time: new Date("2015-08-06T01:29:03.000Z") }, { lat: 9.5135, lon: -79.8333, time: new Date("2015-08-06T01:39:03.000Z") }, { lat: 9.5461, lon: -79.8051, time: new Date("2015-08-06T01:48:45.000Z") }, { lat: 9.5791, lon: -79.7769, time: new Date("2015-08-06T01:58:33.000Z") }, { lat: 9.613, lon: -79.7478, time: new Date("2015-08-06T02:08:44.000Z") }, { lat: 9.6468, lon: -79.7188, time: new Date("2015-08-06T02:18:48.000Z") }, { lat: 9.6797, lon: -79.6912, time: new Date("2015-08-06T02:28:47.000Z") }, { lat: 9.7099, lon: -79.6669, time: new Date("2015-08-06T02:37:47.000Z") }, { lat: 9.7435, lon: -79.6324, time: new Date("2015-08-06T02:48:49.000Z") }, { lat: 9.7592, lon: -79.5938, time: new Date("2015-08-06T02:57:58.000Z") }, { lat: 9.7735, lon: -79.5587, time: new Date("2015-08-06T03:06:19.000Z") }, { lat: 9.7907, lon: -79.5143, time: new Date("2015-08-06T03:16:41.000Z") }, { lat: 9.8092, lon: -79.4665, time: new Date("2015-08-06T03:27:45.000Z") }, { lat: 9.8227, lon: -79.4309, time: new Date("2015-08-06T03:36:05.000Z") }, { lat: 9.8395, lon: -79.3858, time: new Date("2015-08-06T03:46:39.000Z") }, { lat: 9.8526, lon: -79.349, time: new Date("2015-08-06T03:55:15.000Z") }, { lat: 9.8729, lon: -79.29, time: new Date("2015-08-06T04:08:51.000Z") }, { lat: 9.9795, lon: -78.9966, time: new Date("2015-08-06T05:16:38.000Z") }, { lat: 9.9966, lon: -78.9524, time: new Date("2015-08-06T05:27:00.000Z") }, { lat: 10.0062, lon: -78.9281, time: new Date("2015-08-06T05:31:36.000Z") }, { lat: 10.0267, lon: -78.8745, time: new Date("2015-08-06T05:43:42.000Z") }, { lat: 10.0338, lon: -78.855, time: new Date("2015-08-06T05:48:05.000Z") }, { lat: 10.163, lon: -78.4964, time: new Date("2015-08-06T07:09:00.000Z") }, { lat: 10.1697, lon: -78.4785, time: new Date("2015-08-06T07:13:12.000Z") }, { lat: 10.1805, lon: -78.4494, time: new Date("2015-08-06T07:20:25.000Z") }, { lat: 10.3252, lon: -78.0531, time: new Date("2015-08-06T08:51:54.000Z") }, { lat: 10.3383, lon: -78.0173, time: new Date("2015-08-06T09:00:12.000Z") }, { lat: 10.6312, lon: -77.2348, time: new Date("2015-08-06T12:03:59.000Z") }, { lat: 10.6656, lon: -77.1458, time: new Date("2015-08-06T12:23:42.000Z") }, { lat: 10.6856, lon: -77.094, time: new Date("2015-08-06T12:35:47.000Z") }, { lat: 10.7043, lon: -77.046, time: new Date("2015-08-06T12:46:41.000Z") }, { lat: 10.7866, lon: -76.8317, time: new Date("2015-08-06T13:34:48.000Z") }, { lat: 10.818, lon: -76.7506, time: new Date("2015-08-06T13:53:05.000Z") }, { lat: 10.9102, lon: -76.5197, time: new Date("2015-08-06T15:49:30.000Z") }, { lat: 11.0579, lon: -76.0788, time: new Date("2015-08-06T17:34:58.000Z") }, { lat: 11.0623, lon: -76.0679, time: new Date("2015-08-06T17:37:30.000Z") }, { lat: 11.069, lon: -76.0509, time: new Date("2015-08-06T17:41:39.000Z") }, { lat: 11.1192, lon: -75.9271, time: new Date("2015-08-06T18:10:24.000Z") }, { lat: 11.2335, lon: -75.6035, time: new Date("2015-08-06T19:22:50.000Z") }, { lat: 11.2886, lon: -75.4515, time: new Date("2015-08-06T19:57:47.000Z") }, { lat: 11.3775, lon: -75.2113, time: new Date("2015-08-06T21:05:02.000Z") }, { lat: 11.3826, lon: -75.1978, time: new Date("2015-08-06T21:08:01.000Z") }, { lat: 11.3844, lon: -75.1933, time: new Date("2015-08-06T21:09:01.000Z") }, { lat: 11.5513, lon: -74.7527, time: new Date("2015-08-06T22:46:31.000Z") }, { lat: 11.556, lon: -74.7392, time: new Date("2015-08-06T22:49:26.000Z") }, { lat: 11.7342, lon: -74.2549, time: new Date("2015-08-07T00:33:53.000Z") }, { lat: 11.7684, lon: -74.1631, time: new Date("2015-08-07T00:54:08.000Z") }, { lat: 11.8453, lon: -73.9238, time: new Date("2015-08-07T01:45:29.000Z") }, { lat: 11.9051, lon: -73.7599, time: new Date("2015-08-07T02:20:37.000Z") }, { lat: 11.9145, lon: -73.7282, time: new Date("2015-08-07T02:27:42.000Z") }, { lat: 12.0853, lon: -73.2807, time: new Date("2015-08-07T04:04:20.000Z") }, { lat: 12.1245, lon: -73.1873, time: new Date("2015-08-07T04:24:55.000Z") }, { lat: 12.1887, lon: -73.0338, time: new Date("2015-08-07T04:58:25.000Z") }, { lat: 12.3845, lon: -72.5052, time: new Date("2015-08-07T06:54:31.000Z") }, { lat: 12.6326, lon: -71.8277, time: new Date("2015-08-07T09:26:21.000Z") }, { lat: 12.6404, lon: -71.6175, time: new Date("2015-08-07T11:00:14.000Z") }];

			it('real advanced gps usecase (time baser insert filtering)', done => {

				type GpsPosition = { lat: number, lon: number, time: Date };

				const InsertionHandler = class implements ICompressedJsonCollectionHandler<GpsPosition> {

					public buffer: GpsPosition[] = [];
					private isAlteringInternal = false;

					//private compactedMin: Date = new Date(Date.now() + 31536000000);
					private compactedMax: Date = new Date(0);
					private bufferMin: Date = null;
					private bufferMax: Date = null;

					private add(items: GpsPosition[], collection: CompressedCollection<GpsPosition>) {
						this.isAlteringInternal = true;
						collection.add(items);
						this.isAlteringInternal = true;
					}

					insert(items: GpsPosition[], collection: CompressedCollection<GpsPosition>): GpsPosition[] {

						if (this.isAlteringInternal)
							return items;

						items.forEach(item => this.buffer.push(item));

						this.buffer.sort(collection.definition.sort);

						this.bufferMin = this.buffer[0].time;
						this.bufferMax = this.buffer[this.buffer.length - 1].time;

						if (this.bufferMin < this.compactedMax) {
							// Here a reset is needed somehow, items should not be added in this manner but you never know.. 
							// Copy added items => reset cache => add all old + buffer?
							throw new Error('Not implemented exception');
						}

						if (this.bufferMax.getTime() - this.bufferMin.getTime() > 3600000 * 2) {
							collection.remove(this.buffer);
							const lastAddedItem = collection.items[collection.items.length - 1];
							collection.remove(lastAddedItem);

							const allCandidates = (lastAddedItem != null ? [lastAddedItem] : []).concat(this.buffer);
							//const roundedCandidates = allCandidates.map(c => c.time + )

							this.add(allCandidates, collection);

						}

						return items;
					};
				};

				const sort = (a: GpsPosition, b: GpsPosition): -1 | 0 | 1 => a.time < b.time ? -1 : a.time > b.time ? 1 : 0;


				const data: GpsPosition[] = gpsTestData.slice(1, 10);

				const definition = {
					sort: sort,
					insertionHandler: new InsertionHandler(),
					properties: {
						time: { encoding: EncodingType.DIFF, type: 'date', factor: 0.0001 },
						lat: { encoding: EncodingType.DIFF, decimalDigits: 4 },
						lon: { encoding: EncodingType.DIFF, decimalDigits: 4 }
					}
				};

				new CompressedCollection<GpsPosition>(definition, data);

				//const decompressedItems = CompressedCollection.decompress<GpsPosition>(collection.compressedJson);
				//console.log('Collection items: ', collection.items);
				//console.log('Collection state: ', collection.compressedJson);
				//console.log('Decompressed items: ', decompressedItems);

				//const dataJson = JSON.stringify(data);
				//const compressedJson = JSON.stringify(collection.compressedJson);
				//console.log('Compression ratio (char count ): ', compressedJson.length, '/', dataJson.length, '=', compressedJson.length / dataJson.length);

				//Should.equal(collection.items.length, data.length, 'Collection contains wrong number of items.');

				done();
			});

		});
	});
});
