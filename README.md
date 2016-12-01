# compressed-json-collection
A compressed collection used to manage and cache large sets of similar JSON objects. 

### What this **is**
 * A collection with basic query abilities
 * A collection that generates and maintains a compressed state of the collection for passing over http or similar as JSON.
 * A basic cache for large amounts of similar data objects that should be exposed as JSON.

### What this is **not**
 * A collection that has a smaller memory footprint than a normal javascript array

## Usage (typescript example)

```typescript
// So you have some data:
interface IData { id: number: name: string; status: 'ACTIVE' | 'PASSIVE' | 'ARCHIVED'; joined: Date }
var data: IData = [
	{ id: 1234, name: 'John Doe', status: 'ACTIVE', joined: new Date() },
	{ id: 4321, name: 'Jane Doe', status: 'ACTIVE', joined: new Date() },
				.
				.
				.
	{ id: 9999, name: 'Last Name', status: 'PASSIVE', joined: new Date() },
];

// Provide a definition for the properties on the data items that should be included
// in the compressed collection. Here you define how and if each property should be 
// compressed.
const definition: ICompressedJsonCollectionDefinition<IData> = { 
	properties: { 
		id: { encoding: EncodingType.DIFF },
		name: { encoding: EncodingType.RAW },
		status: {encoding: EncodingType.RUNLENGTH },
		joined: { encoding: EncodingType.DIFF, type: 'date' }
	} 
};

// Create a compressed collection with some (optional) initial data and the definition
const collection = new CompressedCollection<IData>(definition, data);

// Possibly add some data
collection.add({ id: 3232, name: 'Some Guy', status: 'ARCHIVED', joined: new Date() });
collection.add([
	{ id: 2323, name: 'Some Girl', status: 'ACTIVE', joined: new Date() },
	{ id: 4141, name: 'Some other Guy', status: 'PASSIVE', joined: new Date() }
]);

// Possibly remove some data... 
collection.remove(data[1]);      // ...by reference
collection.removeByIndex(3);     // ...by index
collection.removeByIndex(6, 10); // ...from index to index

// Retrieve the whole compressed collection...
var compressed data = collection.compressedJson;

// ...or query for a compressed subset of the data:
var compressedSubset: collection.query((item: IData) => item.status === 'ACTIVE');

// Decompress compressed data ()
var decompressedData = CompressedCollection.decompress<IData>(compressedSubset);
```


## The definition explained
How the collection works is defined with the `ICompressedJsonCollectionDefinition<T>` passed to the constructor of the `CompressedCollection`.

*The definition interface:*
```typescript
export interface ICompressedJsonCollectionDefinition<T> {
	insertionHandler?: ((item: T) => boolean) | ICompressedJsonCollectionHandler<T>;
	sort?: (itemA: T, itemB: T) => -1 | 0 | 1;
	properties: { [key: string]: EncodingDefinition };
}
```

### insertionHandler
The insertion handler is an optional function or object (e.g. class) that is used to evaluate each item that is added to the collection. 

*The insertionHandler function option:* `(item: T) => boolean`

The **function** form of the insertion handler will receive the item being evaluated for insertion and is expected to return true if the item should be inserted or false if it should be rejected. 

*Example:*  
```typescript
// Only allow items with a non null date property 'time' with a date succeeding 'timeThreshold'
const timeThreshold = new Date('1995-12-17T03:24:00');
const myInsertionHandler = (item:  {time: Date }) => item.time != null && item.time > timeThreshold;   
```

*The insertionHandler object/class option:* `ICompressedJsonCollectionHandler<T>`

The **object/class** `insertionHandler` is an advanced option that comes with great freedom. It can be used to create advanced collection that processes the data on insertion in more advanced ways, like having a buffer, performing advanced preprocessing or dynamically re-encode parts of the collection on input.

Unlike the **function** version of the insertion handler the **class/object** version returns objects that should be inserted in to the collection. The handler get passed all items being inserted to the collection and should return items that should be added. If multiple items are added att the same time all of them will be sent to the handler in one array, unlike the function version that will be passed one at a time.  

*Example:*  
```typescript
interface DataType { timeStamp: Date; position: { x: number, y: number }; };
class myAdvancedInsertionHandler implements ICompressedJsonCollectionHandler<DataType> {

	insert(items: DataType[], collection: CompressedJsonCollection<DataType>): DataType[] {
		// Performe some processing, store things in a buffer, filter or alter the data... 
		const result = this.processData(items);

		// you can even remove some items from the collection if needed
		collection.removeByIndex(42);

		// ...and return items that should be added to the collection.  
		return result;
	}

	private processData(items: DataType[]): DataType[] { /* ... */ }
}
``` 

### sort
The definition sort function is an optional way of turning the collection in to an ordered collection, each item added to the collection will be sorted in to place on insertion. 

*Example:*  
```typescript
const sort = (a, b): -1 | 0 | 1 => a.val < b.val ? -1 : a.val > b.val 
```

*NOTE:* Ordering can have a huge impact when performing diff based compression. When encrypting series of GPS positions for example, better compression is achieved if sorting the positions in a useful way (e.g. based on time or distance). 

### properties
The properties of the definitions define the properties to be included in the resulting compressed collection. The types available are defined by the interfaces: 

```typescript
export interface RunLengthEncodingDefinition extends EncodingDefinition {
	encoding: EncodingType.RUNLENGTH;
	values?: string[]; // possible values
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
```

*RunLengthEncodingDefinition*

The run length encoding type is useful for properties that has a limited set of possible values, like string constants or enums converted to strings or integers for example. 

*KeyFrameDiffEncodingDefinition*

The key frame encoding type is useful for dates or numeric parameters. It achieves high compression rates when used with a fixed number of decimal digits (all numbers will be converted to `decimalDigits` number of decimal digits), and is especially good for parameters with a limited numeric range. If the target parameter is a data set the type to 'date', the type 'number' is default.  


*RawEncodingDefinition*

The raw type is useful for including parameters that should not be compressed in the resulting collection. The parameter will not be compresed or alered in anny way.  