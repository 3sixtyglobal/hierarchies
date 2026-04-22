# Hierarchies Connector IOTA Examples

This package provides a connector for managing federations, authorities, and properties on the IOTA network. The examples below use the in-built enums and types for clarity and correctness.

## Creating a Connector

```typescript
import { IotaHierarchiesConnector } from "@twin.org/hierarchies-connector-iota";
import { PropertyType } from "@twin.org/hierarchies-models";

const connector = new IotaHierarchiesConnector({
  config: {
    clientOptions: { nodes: ["https://api.testnet.iota.cafe"] },
    vaultMnemonicId: "test-mnemonic",
    network: "testnet"
  }
});
```

## Creating a Federation

```typescript
const federationId = await connector.federationCreate("controller-identity");
console.log(federationId); // "urn:iota:federation:..."
```

## Adding a Property Using PropertyType Enum

```typescript
import { PropertyType } from "@twin.org/hierarchies-models";

const property = {
  name: "access.level",
  allowedValues: [{ type: PropertyType.String, value: "admin" }]
};
await connector.propertyAdd("controller-identity", federationId, property);
```

## Adding and Removing an Authority

```typescript
const authorityId = await connector.authorityAdd("controller-identity", federationId, "account-2");
await connector.authorityRemove("controller-identity", federationId, "account-2");
```

## Getting a Federation and Its Properties

```typescript
const federation = await connector.federationGet(federationId);
federation.rootAuthorities.forEach(auth => {
  console.log(auth.accountId); // "account-1"
});
federation.governance.properties.forEach(prop => {
  console.log(prop.name); // "access.level"
});
```
