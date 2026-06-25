# Interface: IHierarchiesAccreditationAddRequest

Request to add an accreditation to a federation.

## Properties

### pathParams {#pathparams}

> **pathParams**: `object`

The request path parameters.

#### federationId

> **federationId**: `string`

The id of the federation.

***

### body {#body}

> **body**: `Omit`\<[`IAccreditation`](IAccreditation.md), `"permissionId"`\>

The request data.
