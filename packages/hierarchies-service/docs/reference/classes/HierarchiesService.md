# Class: HierarchiesService

Service for hierarchies operations.

## Implements

- `IHierarchiesComponent`

## Constructors

### Constructor

> **new HierarchiesService**(`options?`): `HierarchiesService`

Create a new instance of HierarchiesService.

#### Parameters

##### options?

[`IHierarchiesServiceConstructorOptions`](../interfaces/IHierarchiesServiceConstructorOptions.md)

The constructor options.

#### Returns

`HierarchiesService`

#### Throws

GeneralError If no connectors are registered.

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

> **federationCreate**(`rootAuthorities?`, `namespace?`, `controllerIdentity?`): `Promise`\<`string`\>

Creates a new federation.

#### Parameters

##### rootAuthorities?

`string`[]

The root authorities to be included in the federation.

##### namespace?

`string`

The namespace of the connector to use for the federation, defaults to component configured namespace.

##### controllerIdentity?

`string`

The identity of the controller creating the federation.

#### Returns

`Promise`\<`string`\>

The ID of the created federation.

#### Implementation of

`IHierarchiesComponent.federationCreate`

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

`IHierarchiesComponent.federationGet`

***

### authorityAdd() {#authorityadd}

> **authorityAdd**(`federationId`, `accountId`, `controllerIdentity?`): `Promise`\<`string`\>

Adds a new authority to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation to which the authority will be added.

##### accountId

`string`

The account ID of the authority to be added.

##### controllerIdentity?

`string`

The identity of the controller adding the authority.

#### Returns

`Promise`\<`string`\>

The id of the authority.

#### Implementation of

`IHierarchiesComponent.authorityAdd`

***

### authorityRemove() {#authorityremove}

> **authorityRemove**(`federationId`, `accountId`, `controllerIdentity?`): `Promise`\<`void`\>

Removes an authority from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the authority will be removed.

##### accountId

`string`

The account ID of the authority to be removed.

##### controllerIdentity?

`string`

The identity of the controller removing the authority.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the authority has been removed.

#### Implementation of

`IHierarchiesComponent.authorityRemove`

***

### propertyAdd() {#propertyadd}

> **propertyAdd**(`federationId`, `property`, `controllerIdentity?`): `Promise`\<`void`\>

Adds a new property to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation to which the property will be added.

##### property

`IProperty`

The property to be added.

##### controllerIdentity?

`string`

The identity of the controller adding the property.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been added.

#### Implementation of

`IHierarchiesComponent.propertyAdd`

***

### propertyRemove() {#propertyremove}

> **propertyRemove**(`federationId`, `propertyName`, `controllerIdentity?`): `Promise`\<`void`\>

Removes a property from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the property will be removed.

##### propertyName

`string`

The name of the property to be removed.

##### controllerIdentity?

`string`

The identity of the controller removing the property.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the property has been removed.

#### Implementation of

`IHierarchiesComponent.propertyRemove`

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

`IHierarchiesComponent.propertyGet`

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

`IHierarchiesComponent.propertiesGet`

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

`IHierarchiesComponent.propertyValidate`

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

`IHierarchiesComponent.propertiesValidate`

***

### accreditationToAttestAdd() {#accreditationtoattestadd}

> **accreditationToAttestAdd**(`federationId`, `accreditation`, `controllerIdentity?`): `Promise`\<`string`\>

Adds a new accreditation to attest to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation to which the accreditation will be added.

##### accreditation

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to be added.

##### controllerIdentity?

`string`

The identity of the controller adding the accreditation.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesComponent.accreditationToAttestAdd`

***

### accreditationToAttestRemove() {#accreditationtoattestremove}

> **accreditationToAttestRemove**(`federationId`, `accreditedById`, `permissionId`, `controllerIdentity?`): `Promise`\<`void`\>

Removes an accreditation to attest from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the accreditation will be removed.

##### accreditedById

`string`

The ID of the entity that granted the accreditation to be removed.

##### permissionId

`string`

The ID of the accreditation to be removed.

##### controllerIdentity?

`string`

The identity of the controller removing the accreditation.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

#### Implementation of

`IHierarchiesComponent.accreditationToAttestRemove`

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

`IHierarchiesComponent.accreditationToAttestGet`

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

`IHierarchiesComponent.accreditationsToAttestGet`

***

### accreditationToAccreditAdd() {#accreditationtoaccreditadd}

> **accreditationToAccreditAdd**(`federationId`, `accreditation`, `controllerIdentity?`): `Promise`\<`string`\>

Adds a new accreditation to accredit to an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation to which the accreditation will be added.

##### accreditation

`Omit`\<`IAccreditation`, `"permissionId"`\>

The accreditation to be added.

##### controllerIdentity?

`string`

The identity of the controller adding the accreditation.

#### Returns

`Promise`\<`string`\>

The ID of the added accreditation.

#### Implementation of

`IHierarchiesComponent.accreditationToAccreditAdd`

***

### accreditationToAccreditRemove() {#accreditationtoaccreditremove}

> **accreditationToAccreditRemove**(`federationId`, `accreditedById`, `permissionId`, `controllerIdentity?`): `Promise`\<`void`\>

Removes an accreditation to accredit from an existing federation.

#### Parameters

##### federationId

`string`

The ID of the federation from which the accreditation will be removed.

##### accreditedById

`string`

The ID of the entity that granted the accreditation to be removed.

##### permissionId

`string`

The ID of the accreditation to be removed.

##### controllerIdentity?

`string`

The identity of the controller removing the accreditation.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the accreditation has been removed.

#### Implementation of

`IHierarchiesComponent.accreditationToAccreditRemove`

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

`IHierarchiesComponent.accreditationToAccreditGet`

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

`IHierarchiesComponent.accreditationsToAccreditGet`
