# Hierarchies REST Client Examples

This package provides a REST client for interacting with federations, authorities, and properties via HTTP endpoints. The examples below use the in-built enums and types for clarity and correctness.

## Creating a REST Client

```typescript
import { HierarchiesRestClient } from '@twin.org/hierarchies-rest-client';

const client = new HierarchiesRestClient({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
});
```

## Creating a Federation

```typescript
const federationId = await client.federationCreate(['root-authority-1']);
console.log(federationId); // "urn:..."
```

## Adding a Property Using PropertyType Enum

```typescript
import { PropertyType } from '@twin.org/hierarchies-models';

const property = {
  name: 'access.level',
  allowedValues: [{ type: PropertyType.String, value: 'admin' }]
};
await client.propertyAdd('federation-id', property);
```

## Adding and Removing an Authority

```typescript
const authorityId = await client.authorityAdd('federation-id', 'account-2');
await client.authorityRemove('federation-id', 'account-2');
```

federation.rootAuthorities.forEach(auth => {
federation.governance.properties.forEach(prop => {
federation.rootAuthorities.forEach(auth => {
console.log(auth.accountId); // "account-1"
});
federation.governance.properties.forEach(prop => {
console.log(prop.name); // "access.level"
});

## Getting a Federation and Its Properties

```typescript
const federation = await client.federationGet('federation-id');
federation.rootAuthorities.forEach(auth => {
  console.log(auth.accountId); // "account-1"
});
federation.governance.properties.forEach(prop => {
  console.log(prop.name); // "access.level"
});
```
