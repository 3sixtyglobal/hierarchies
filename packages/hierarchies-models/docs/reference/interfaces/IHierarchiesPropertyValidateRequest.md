# Interface: IHierarchiesPropertyValidateRequest

Request to validate a property for a federation.

## Properties

### pathParams {#pathparams}

> **pathParams**: `object`

The request path parameters.

#### federationId

> **federationId**: `string`

The id of the federation.

***

### body {#body}

> **body**: `object`

The request data.

#### accreditedById

> **accreditedById**: `string`

The accredited by id.

#### propertyName

> **propertyName**: `string`

The property name to validate.

#### propertyValue

> **propertyValue**: [`IPropertyValue`](IPropertyValue.md)

The property value to validate.
