# Interface: IProperty

Represents a named property with optional allowed values, a condition, and a validity timespan.

## Properties

### name {#name}

> **name**: `string`

The property name, can be dotted form.

***

### allowedValues? {#allowedvalues}

> `optional` **allowedValues?**: [`IPropertyValue`](IPropertyValue.md)[]

The allowed values for this property, if empty, any value is allowed.

***

### condition? {#condition}

> `optional` **condition?**: [`IPropertyCondition`](IPropertyCondition.md)

The condition for this property.

***

### timespan? {#timespan}

> `optional` **timespan?**: [`ITimespan`](ITimespan.md)

The timespan for this property.
