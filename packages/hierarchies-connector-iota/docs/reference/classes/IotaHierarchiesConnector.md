# Class: IotaHierarchiesConnector

IOTA connector for hierarchies.

## Implements

- `IHierarchiesConnector`

## Constructors

### Constructor

> **new IotaHierarchiesConnector**(`options`): `IotaHierarchiesConnector`

Create a new instance of IotaHierarchiesConnector.

#### Parameters

##### options

[`IIotaHierarchiesConnectorConstructorOptions`](../interfaces/IIotaHierarchiesConnectorConstructorOptions.md)

The options for the connector.

#### Returns

`IotaHierarchiesConnector`

## Properties

### NAMESPACE {#namespace}

> `readonly` `static` **NAMESPACE**: `string` = `"iota"`

The namespace supported by the connector.

***

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IHierarchiesConnector.className`

***

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

#### Implementation of

`IHierarchiesConnector.federationCreate`

***

### federationGet() {#federationget}

> **federationGet**(`federationId`, `options?`): `Promise`\<`IFederation`\>

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

`Promise`\<`IFederation`\>

The federation with the specified ID.

#### Implementation of

`IHierarchiesConnector.federationGet`

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

#### Implementation of

`IHierarchiesConnector.authorityAdd`

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

#### Implementation of

`IHierarchiesConnector.authorityRemove`

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

`IProperty`

The property to be added.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been added.

#### Implementation of

`IHierarchiesConnector.propertyAdd`

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

#### Implementation of

`IHierarchiesConnector.propertyRemove`

***

### propertyGet() {#propertyget}

> **propertyGet**(`federationId`, `propertyName`): `Promise`\<`IProperty`\>

Gets a property from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the property will be retrieved.

##### propertyName

`string`

The name of the property to be retrieved.

#### Returns

`Promise`\<`IProperty`\>

A promise that resolves with the property.

#### Implementation of

`IHierarchiesConnector.propertyGet`

***

### propertiesGet() {#propertiesget}

> **propertiesGet**(`federationId`, `options?`): `Promise`\<`IProperty`[]\>

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

`Promise`\<`IProperty`[]\>

A promise that resolves with the properties.

#### Implementation of

`IHierarchiesConnector.propertiesGet`

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

`IPropertyValue`

The value of the property to be validated.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves with a boolean indicating whether the property is valid.

#### Implementation of

`IHierarchiesConnector.propertyValidate`

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

#### Implementation of

`IHierarchiesConnector.propertiesValidate`

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

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to be added.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesConnector.accreditationToAttestAdd`

***

### accreditationToAttestGet() {#accreditationtoattestget}

> **accreditationToAttestGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`IAccreditation`\>

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

`Promise`\<`IAccreditation`\>

A promise that resolves with the accreditation.

#### Implementation of

`IHierarchiesConnector.accreditationToAttestGet`

***

### accreditationsToAttestGet() {#accreditationstoattestget}

> **accreditationsToAttestGet**(`federationId`, `accreditedById`): `Promise`\<`IAccreditation`[]\>

Gets accreditations to attest to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditations.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<`IAccreditation`[]\>

A promise that resolves with the accreditations.

#### Implementation of

`IHierarchiesConnector.accreditationsToAttestGet`

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

#### Implementation of

`IHierarchiesConnector.accreditationToAttestRemove`

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

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to be added.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesConnector.accreditationToAccreditAdd`

***

### accreditationToAccreditGet() {#accreditationtoaccreditget}

> **accreditationToAccreditGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`IAccreditation`\>

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

`Promise`\<`IAccreditation`\>

A promise that resolves with the accreditation.

#### Implementation of

`IHierarchiesConnector.accreditationToAccreditGet`

***

### accreditationsToAccreditGet() {#accreditationstoaccreditget}

> **accreditationsToAccreditGet**(`federationId`, `accreditedById`): `Promise`\<`IAccreditation`[]\>

Gets accreditations to accredit to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation for which to get the accreditations.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<`IAccreditation`[]\>

A promise that resolves with the accreditations.

#### Implementation of

`IHierarchiesConnector.accreditationsToAccreditGet`

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

#### Implementation of

`IHierarchiesConnector.accreditationToAccreditRemove`
