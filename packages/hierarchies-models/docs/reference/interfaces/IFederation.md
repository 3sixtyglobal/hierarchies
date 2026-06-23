# Interface: IFederation

Represents a federation, which is a group of entities forming a trust hierarchy.
Federations define the root authorities and the schema for properties they manage.

## Properties

### id {#id}

> **id**: `string`

Unique identifier for the federation.

***

### rootAuthorities {#rootauthorities}

> **rootAuthorities**: [`IRootAuthority`](IRootAuthority.md)[]

List of root authority IDs associated with this federation.

***

### revokedRootAuthorities {#revokedrootauthorities}

> **revokedRootAuthorities**: `string`[]

Account IDs of root authorities that have been revoked and are no longer trusted.

***

### governance {#governance}

> **governance**: [`IGovernance`](IGovernance.md)

The governance entity that manages accreditations and attestations within the federation.
