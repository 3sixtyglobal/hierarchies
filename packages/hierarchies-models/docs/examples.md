# Hierarchies Models Examples

This package provides interfaces and types for working with federations, properties, accreditations, and connector factories in digital asset hierarchies.

## HierarchiesConnectorFactory

```typescript
import { HierarchiesConnectorFactory } from '@twin.org/hierarchies-models';

// Register a connector implementation
HierarchiesConnectorFactory.register('custom', () => new CustomHierarchiesConnector());

// Create a connector instance
const connector = HierarchiesConnectorFactory.create('custom');
```

## IHierarchiesConnector

```typescript
import type { IHierarchiesConnector, IProperty } from '@twin.org/hierarchies-models';

async function addProperty(
  connector: IHierarchiesConnector,
  federationId: string,
  property: IProperty
) {
  await connector.propertyAdd('controller-1', federationId, property);
}

async function getFederation(connector: IHierarchiesConnector, federationId: string) {
  const federation = await connector.federationGet(federationId);
  console.log(federation.id); // "fed-123"
}
```

## IFederation

```typescript
import type { IFederation } from '@twin.org/hierarchies-models';

function printRootAuthorities(federation: IFederation) {
  federation.rootAuthorities.forEach(auth => {
    console.log(auth.id); // "root-1"
  });
}
```

## IProperty

```typescript
import type { IProperty, IPropertyValue } from '@twin.org/hierarchies-models';
import { PropertyType } from '@twin.org/hierarchies-models';

const property: IProperty = {
  name: 'access.level',
  allowedValues: [{ type: PropertyType.String, value: 'admin' }]
};

const value: IPropertyValue = { type: PropertyType.String, value: 'admin' };
console.log(property.allowedValues?.[0].value); // "admin"
```

## IAccreditation

```typescript
import type { IAccreditation, IProperty } from '@twin.org/hierarchies-models';

const accreditation: IAccreditation = {
  permissionId: 'perm-1',
  accreditedBy: 'authority-1',
  properties: [{ name: 'access.level', allowedValues: [{ type: 'String', value: 'admin' }] }]
};
console.log(accreditation.accreditedBy); // "authority-1"
```
