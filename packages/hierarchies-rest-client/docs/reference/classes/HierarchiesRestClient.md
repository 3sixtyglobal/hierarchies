# Class: HierarchiesRestClient

Client for performing hierarchies operations through to REST endpoints.

## Extends

- `BaseRestClient`

## Implements

- `IHierarchiesComponent`

## Constructors

### Constructor

> **new HierarchiesRestClient**(`config`): `HierarchiesRestClient`

Create a new instance of HierarchiesRestClient.

#### Parameters

##### config

`IBaseRestClientConfig`

The configuration for the client.

#### Returns

`HierarchiesRestClient`

#### Overrides

`BaseRestClient.constructor`

## Properties

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

`IHierarchiesComponent.className`

***

### federationCreate() {#federationcreate}

> **federationCreate**(`rootAuthorities?`, `namespace?`): `Promise`\<`string`\>

Create a new federation.

#### Parameters

##### rootAuthorities?

`string`[]

The root authorities to be included in the federation.

##### namespace?

`string`

The namespace of the connector to use for the federation, defaults to component configured namespace.

#### Returns

`Promise`\<`string`\>

The ID of the created federation.

#### Implementation of

`IHierarchiesComponent.federationCreate`

***

### federationGet() {#federationget}

> **federationGet**(`federationId`, `options?`): `Promise`\<`IFederation`\>

Get a federation by its ID.

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

The federation object.

#### Implementation of

`IHierarchiesComponent.federationGet`

***

### authorityAdd() {#authorityadd}

> **authorityAdd**(`federationId`, `accountId`): `Promise`\<`string`\>

Add a new authority to a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accountId

`string`

The account ID of the authority to add.

#### Returns

`Promise`\<`string`\>

The ID of the added authority.

#### Implementation of

`IHierarchiesComponent.authorityAdd`

***

### authorityRemove() {#authorityremove}

> **authorityRemove**(`federationId`, `accountId`): `Promise`\<`void`\>

Remove an authority from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accountId

`string`

The account ID of the authority to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the authority has been removed.

#### Implementation of

`IHierarchiesComponent.authorityRemove`

***

### propertyAdd() {#propertyadd}

> **propertyAdd**(`federationId`, `property`): `Promise`\<`void`\>

Add a property to a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### property

`IProperty`

The property to add.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been added.

#### Implementation of

`IHierarchiesComponent.propertyAdd`

***

### propertyRemove() {#propertyremove}

> **propertyRemove**(`federationId`, `propertyName`): `Promise`\<`void`\>

Remove a property from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### propertyName

`string`

The name of the property to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been removed.

#### Implementation of

`IHierarchiesComponent.propertyRemove`

***

### propertyGet() {#propertyget}

> **propertyGet**(`federationId`, `propertyName`): `Promise`\<`IProperty`\>

Get a property from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### propertyName

`string`

The name of the property to get.

#### Returns

`Promise`\<`IProperty`\>

The property object.

#### Implementation of

`IHierarchiesComponent.propertyGet`

***

### propertiesGet() {#propertiesget}

> **propertiesGet**(`federationId`, `options?`): `Promise`\<`IProperty`[]\>

Get all properties from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### options?

Optional parameters for the request.

###### includeRevokedProperties?

`boolean`

Whether to include revoked properties in the retrieved properties, defaults to false.

#### Returns

`Promise`\<`IProperty`[]\>

The array of properties.

#### Implementation of

`IHierarchiesComponent.propertiesGet`

***

### propertyValidate() {#propertyvalidate}

> **propertyValidate**(`federationId`, `accreditedById`, `propertyName`, `propertyValue`): `Promise`\<`boolean`\>

Validate a property for a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### propertyName

`string`

The name of the property to validate.

##### propertyValue

`IPropertyValue`

The value of the property to validate.

#### Returns

`Promise`\<`boolean`\>

True if valid, false otherwise.

#### Implementation of

`IHierarchiesComponent.propertyValidate`

***

### propertiesValidate() {#propertiesvalidate}

> **propertiesValidate**(`federationId`, `accreditedById`, `propertiesToValidate`): `Promise`\<`boolean`\>

Validate multiple properties for a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

##### propertiesToValidate

The properties to validate.

#### Returns

`Promise`\<`boolean`\>

True if all are valid, false otherwise.

#### Implementation of

`IHierarchiesComponent.propertiesValidate`

***

### accreditationToAttestAdd() {#accreditationtoattestadd}

> **accreditationToAttestAdd**(`federationId`, `accreditation`): `Promise`\<`string`\>

Add an accreditation to attest to a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditation

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to add.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesComponent.accreditationToAttestAdd`

***

### accreditationToAttestRemove() {#accreditationtoattestremove}

> **accreditationToAttestRemove**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`void`\>

Remove an accreditation to attest from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

#### Implementation of

`IHierarchiesComponent.accreditationToAttestRemove`

***

### accreditationToAttestGet() {#accreditationtoattestget}

> **accreditationToAttestGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`IAccreditation`\>

Get an accreditation to attest from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to get.

#### Returns

`Promise`\<`IAccreditation`\>

The accreditation object.

#### Implementation of

`IHierarchiesComponent.accreditationToAttestGet`

***

### accreditationsToAttestGet() {#accreditationstoattestget}

> **accreditationsToAttestGet**(`federationId`, `accreditedById`): `Promise`\<`IAccreditation`[]\>

Get all accreditations to attest from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<`IAccreditation`[]\>

The array of accreditations.

#### Implementation of

`IHierarchiesComponent.accreditationsToAttestGet`

***

### accreditationToAccreditAdd() {#accreditationtoaccreditadd}

> **accreditationToAccreditAdd**(`federationId`, `accreditation`): `Promise`\<`string`\>

Add an accreditation to accredit to a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditation

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to add.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesComponent.accreditationToAccreditAdd`

***

### accreditationToAccreditRemove() {#accreditationtoaccreditremove}

> **accreditationToAccreditRemove**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`void`\>

Remove an accreditation to accredit from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

#### Implementation of

`IHierarchiesComponent.accreditationToAccreditRemove`

***

### accreditationToAccreditGet() {#accreditationtoaccreditget}

> **accreditationToAccreditGet**(`federationId`, `accreditedById`, `permissionId`): `Promise`\<`IAccreditation`\>

Get an accreditation to accredit from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditation.

##### permissionId

`string`

The ID of the accreditation to get.

#### Returns

`Promise`\<`IAccreditation`\>

The accreditation object.

#### Implementation of

`IHierarchiesComponent.accreditationToAccreditGet`

***

### accreditationsToAccreditGet() {#accreditationstoaccreditget}

> **accreditationsToAccreditGet**(`federationId`, `accreditedById`): `Promise`\<`IAccreditation`[]\>

Get all accreditations to accredit from a federation.

#### Parameters

##### federationId

`string`

The ID of the federation.

##### accreditedById

`string`

The ID of the entity that granted the accreditations.

#### Returns

`Promise`\<`IAccreditation`[]\>

The array of accreditations.

#### Implementation of

`IHierarchiesComponent.accreditationsToAccreditGet`
