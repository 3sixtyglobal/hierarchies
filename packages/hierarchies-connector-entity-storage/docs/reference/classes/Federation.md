# Class: Federation

Class describing a federation record.

## Constructors

### Constructor

> **new Federation**(): `Federation`

#### Returns

`Federation`

## Properties

### id {#id}

> **id**: `string`

The identity of the federation record.

***

### rootAuthorities {#rootauthorities}

> **rootAuthorities**: `IRootAuthority`[]

List of root authority IDs associated with this federation.

***

### revokedRootAuthorities {#revokedrootauthorities}

> **revokedRootAuthorities**: `string`[]

Account IDs of root authorities that have been revoked and are no longer trusted.

***

### governance {#governance}

> **governance**: `IGovernance`

The governance entity that manages accreditations and attestations within the federation.

***

### controllerIdentity {#controlleridentity}

> **controllerIdentity**: `string`

The controller identity.
