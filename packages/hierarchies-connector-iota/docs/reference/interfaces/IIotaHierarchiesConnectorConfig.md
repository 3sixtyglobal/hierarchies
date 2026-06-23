# Interface: IIotaHierarchiesConnectorConfig

Configuration for the IOTA Hierarchies Connector.

## Extends

- `IIotaConfig`

## Properties

### accountAddressIndex? {#accountaddressindex}

> `optional` **accountAddressIndex?**: `number`

The wallet account index to use when performing hierarchies operations.

#### Default

```ts
0
```

***

### walletAddressIndex? {#walletaddressindex}

> `optional` **walletAddressIndex?**: `number`

The wallet address index to use when performing hierarchies operations.

#### Default

```ts
0
```

***

### enableCostLogging? {#enablecostlogging}

> `optional` **enableCostLogging?**: `boolean`

Enable cost logging.

#### Default

```ts
false
```

#### Overrides

`IIotaConfig.enableCostLogging`
