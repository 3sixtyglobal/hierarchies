# Interface: IHierarchiesPropertiesValidateRequest

Request to validate properties for a federation.

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

#### propertiesToValidate

> **propertiesToValidate**: `object`

The properties to validate.

##### Index Signature

\[`propertyName`: `string`\]: [`IPropertyValue`](IPropertyValue.md)
