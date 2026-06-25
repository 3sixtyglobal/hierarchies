# Interface: IHierarchiesConnector

Interface describing a hierarchies connector.

## Extends

- `IComponent`

## Methods

### federationCreate() {#federationcreate}

> **federationCreate**(`controllerIdentity`, `rootAuthorities?`): `Promise`\<`string`\>

Creates a new federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller creating the federation.

##### rootAuthorities?

`string`[]

The root authorities to be included in the federation.

#### Returns

`Promise`\<`string`\>

The ID of the created federation.

***

### federationGet() {#federationget}

> **federationGet**(`federationId`, `options?`): `Promise`\<[`IFederation`](IFederation.md)\>

Retrieves a federation by its ID.

#### Parameters

##### federationId

`string`

The ID of the federation to retrieve.

##### options?

Options for retrieving the federation.

###### includeRevokedProperties?

`boolean`

Whether to include revoked properties in the retrieved federation, defaults to false.

#### Returns

`Promise`\<[`IFederation`](IFederation.md)\>

The federation with the specified ID.

***

### authorityAdd() {#authorityadd}

> **authorityAdd**(`controllerIdentity`, `federationId`, `accountId`): `Promise`\<`string`\>

Adds a new authority to an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller adding the authority.

##### federationId

`string`

The ID of the federation to which the authority will be added.

##### accountId

`string`

The account ID of the authority to be added.

#### Returns

`Promise`\<`string`\>

The id of the authority.

***

### authorityRemove() {#authorityremove}

> **authorityRemove**(`controllerIdentity`, `federationId`, `accountId`): `Promise`\<`void`\>

Removes an authority from an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller removing the authority.

##### federationId

`string`

The ID of the federation from which the authority will be removed.

##### accountId

`string`

The account ID of the authority to be removed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the authority has been removed.

***

### propertyAdd() {#propertyadd}

> **propertyAdd**(`controllerIdentity`, `federationId`, `property`): `Promise`\<`void`\>

Adds a new property to an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller adding the property.

##### federationId

`string`

The ID of the federation to which the property will be added.

##### property

[`IProperty`](IProperty.md)

The property to be added.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been added.

***

### propertyRemove() {#propertyremove}

> **propertyRemove**(`controllerIdentity`, `federationId`, `propertyName`): `Promise`\<`void`\>

Removes a property from an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller removing the property.

##### federationId

`string`

The ID of the federation from which the property will be removed.

##### propertyName

`string`

The name of the property to be removed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been removed.

***

### propertyGet() {#propertyget}

> **propertyGet**(`federationId`, `propertyName`): `Promise`\<[`IProperty`](IProperty.md)\>

Gets a property from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the property will be retrieved.

##### propertyName

`string`

The name of the property to be retrieved.

#### Returns

`Promise`\<[`IProperty`](IProperty.md)\>

A promise that resolves with the property.

***

### propertiesGet() {#propertiesget}

> **propertiesGet**(`federationId`, `options?`): `Promise`\<[`IProperty`](IProperty.md)[]\>

Gets all properties from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the properties will be retrieved.

##### options?

Options for retrieving the properties.

###### includeRevokedProperties?

`boolean`

Whether to include revoked properties in the retrieved properties, defaults to false.

#### Returns

`Promise`\<[`IProperty`](IProperty.md)[]\>

A promise that resolves with the properties.

***

### propertyValidate() {#propertyvalidate}

> **propertyValidate**(`federationId`, `accreditedById`, `propertyName`, `propertyValue`): `Promise`\<`boolean`\>

Validates property for an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which the property will be validated.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### propertyName

`string`

The name of the property to be validated.

##### propertyValue

[`IPropertyValue`](IPropertyValue.md)

The value of the property to be validated.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves with a boolean indicating whether the property is valid.

***

### propertiesValidate() {#propertiesvalidate}

> **propertiesValidate**(`federationId`, `accreditedById`, `propertiesToValidate`): `Promise`\<`boolean`\>

Validates properties for an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which the properties will be validated.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

##### propertiesToValidate

The properties to be validated.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves with a boolean indicating whether the properties are valid.

***

### accreditationToAttestAdd() {#accreditationtoattestadd}

> **accreditationToAttestAdd**(`controllerIdentity`, `federationId`, `accreditation`): `Promise`\<`string`\>

Adds a new accreditation to attest to an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller adding the accreditation.

##### federationId

`string`

The ID of the federation to which the accreditation will be added.

##### accreditation

`Omit`\<[`IAccreditation`](IAccreditation.md), `"permissionId"`\>

The accreditation to be added.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

***

### accreditationToAttestRemove() {#accreditationtoattestremove}

> **accreditationToAttestRemove**(`controllerIdentity`, `federationId`, `accreditedById`, `permissionId`): `Promise`\<`void`\>

Removes an accreditation to attest from an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller removing the accreditation.

##### federationId

`string`

The ID of the federation from which the accreditation will be removed.

##### accreditedById

`string`

The ID of the entity that granted the accreditation to be removed.

##### permissionId

`string`

The ID of the accreditation to be removed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

***

### accreditationToAttestGet() {#accreditationtoattestget}

> **accreditationToAttestGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<[`IAccreditation`](IAccreditation.md)\>

Get accreditation to attest to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to be retrieved.

#### Returns

`Promise`\<[`IAccreditation`](IAccreditation.md)\>

A promise that resolves with the accreditation.

***

### accreditationsToAttestGet() {#accreditationstoattestget}

> **accreditationsToAttestGet**(`federationId`, `accreditedById`): `Promise`\<[`IAccreditation`](IAccreditation.md)[]\>

Gets accreditations to attest to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditations.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<[`IAccreditation`](IAccreditation.md)[]\>

A promise that resolves with the accreditations.

***

### accreditationToAccreditAdd() {#accreditationtoaccreditadd}

> **accreditationToAccreditAdd**(`controllerIdentity`, `federationId`, `accreditation`): `Promise`\<`string`\>

Adds a new accreditation to accredit to an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller adding the accreditation.

##### federationId

`string`

The ID of the federation to which the accreditation will be added.

##### accreditation

`Omit`\<[`IAccreditation`](IAccreditation.md), `"permissionId"`\>

The accreditation to be added.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

***

### accreditationToAccreditRemove() {#accreditationtoaccreditremove}

> **accreditationToAccreditRemove**(`controllerIdentity`, `federationId`, `accreditedById`, `permissionId`): `Promise`\<`void`\>

Removes an accreditation to accredit from an existing federation.

#### Parameters

##### controllerIdentity

`string`

The identity of the controller removing the accreditation.

##### federationId

`string`

The ID of the federation from which the accreditation will be removed.

##### accreditedById

`string`

The ID of the entity that granted the accreditation to be removed.

##### permissionId

`string`

The ID of the accreditation to be removed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

***

### accreditationToAccreditGet() {#accreditationtoaccreditget}

> **accreditationToAccreditGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<[`IAccreditation`](IAccreditation.md)\>

Get accreditation to accredit to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to be retrieved.

#### Returns

`Promise`\<[`IAccreditation`](IAccreditation.md)\>

A promise that resolves with the accreditation.

***

### accreditationsToAccreditGet() {#accreditationstoaccreditget}

> **accreditationsToAccreditGet**(`federationId`, `accreditedById`): `Promise`\<[`IAccreditation`](IAccreditation.md)[]\>

Gets accreditations to accredit to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditations.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<[`IAccreditation`](IAccreditation.md)[]\>

A promise that resolves with the accreditations.
