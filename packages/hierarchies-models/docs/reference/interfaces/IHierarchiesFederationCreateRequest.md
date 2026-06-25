# Interface: IHierarchiesFederationCreateRequest

Request to create a federation.

## Properties

### body {#body}

> **body**: `object`

The request data.

#### rootAuthorities?

> `optional` **rootAuthorities?**: `string`[]

The root authorities to be included in the federation.

#### namespace?

> `optional` **namespace?**: `string`

The namespace of the connector to use for the federation, defaults to component configured namespace.
