# Interface: IGovernance

Represents a governance entity in a federation hierarchy.
Governance entities are trusted entities that can accredit or revoke delegations.

## Properties

### id {#id}

> **id**: `string`

Unique identifier for the governance entity.

***

### accreditationsToAccredit {#accreditationstoaccredit}

> **accreditationsToAccredit**: `object`

Map of accredited-by ID to the list of accreditations that grant the right to accredit others.

#### Index Signature

\[`id`: `string`\]: [`IAccreditation`](IAccreditation.md)[]

***

### accreditationsToAttest {#accreditationstoattest}

> **accreditationsToAttest**: `object`

Map of accredited-by ID to the list of accreditations that grant the right to attest properties.

#### Index Signature

\[`id`: `string`\]: [`IAccreditation`](IAccreditation.md)[]

***

### properties {#properties}

> **properties**: [`IProperty`](IProperty.md)[]

The set of properties this governance entity covers.
