# Hierarchies Service Examples

This package provides a service for orchestrating federations, authorities, and properties using registered connectors. The examples below use the in-built enums and types for clarity and correctness.

## Creating a Service

```typescript
import { HierarchiesService } from '@twin.org/hierarchies-service';

const service = new HierarchiesService();
```

## Creating a Federation

```typescript
const federationId = await service.federationCreate(['root-authority-1']);
console.log(federationId); // "urn:..."
```

## Adding a Property Using PropertyType Enum

```typescript
import { PropertyType } from '@twin.org/hierarchies-models';

const property = {
  name: 'access.level',
  allowedValues: [{ type: PropertyType.String, value: 'admin' }]
};
await service.propertyAdd('federation-id', property);
```

## Adding and Removing an Authority

```typescript
const authorityId = await service.authorityAdd('federation-id', 'account-2');
await service.authorityRemove('federation-id', 'account-2');
```

## Getting a Federation and Its Properties

```typescript
const federation = await service.federationGet('federation-id');
federation.rootAuthorities.forEach(auth => {
  console.log(auth.accountId); // "account-1"
});
federation.governance.properties.forEach(prop => {
  console.log(prop.name); // "access.level"
});
```
