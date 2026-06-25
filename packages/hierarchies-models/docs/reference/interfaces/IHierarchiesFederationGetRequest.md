# Interface: IHierarchiesFederationGetRequest

Request to get a federation.

## Properties

### pathParams {#pathparams}

> **pathParams**: `object`

The request path parameters.

#### federationId

> **federationId**: `string`

The id of the federation to get.

***

### query? {#query}

> `optional` **query?**: `object`

The request query parameters.

#### includeRevokedProperties?

> `optional` **includeRevokedProperties?**: `string`

Whether to include revoked properties in the retrieved federation, defaults to false.
