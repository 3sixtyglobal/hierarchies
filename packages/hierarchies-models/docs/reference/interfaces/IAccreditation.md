# Interface: IAccreditation

Represents an accreditation, which is a collection of properties granted by an accreditor.

## Properties

### permissionId {#permissionid}

> **permissionId**: `string`

Unique identifier for the accreditation.

***

### accreditedBy {#accreditedby}

> **accreditedBy**: `string`

The identifier of the entity that granted the accreditation.

***

### properties {#properties}

> **properties**: [`IProperty`](IProperty.md)[]

Properties associated with this accreditation.
