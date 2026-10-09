# Hierarchies Connector IOTA

This package is designed to provide a connector for Hierarchies that integrates with the IOTA network. It plays a crucial role in enabling distributed ledger integration and network-based operations, allowing applications to interact with IOTA-backed state and metadata. Its implementation reflects a focus on semantic clarity and interoperability.

## Installation

```shell
npm install @3sixty/hierarchies-connector-iota
```

## Docker

To perform testing of this component it may be necessary to launch a local instance to communicate with.

```shell
docker run -d --name 3sixty-gas-station-test -p 6379:6379 -p 9527:9527 -p 9184:9184 -e IOTA_NODE_URL="https://grpc.testnet.iota.cafe" -e GAS_STATION_AUTH="qEyCL6d9BKKFl/tfDGAKeGFkhUlf7FkqiGV7Xw4JUsI=" -e GAS_STATION_KEYPAIR="..." ghcr.io/3sixtyglobal/3sixty-gas-station-test:latest
```

To generate `GAS_STATION_KEYPAIR` see <https://github.com/3sixtyglobal/dlt/blob/main/packages/dlt-iota/README.md>

## Examples

Usage of the APIs is shown in the examples [docs/examples.md](docs/examples.md)

## Changelog

The changes between each version can be found in [docs/changelog.md](docs/changelog.md)

## Origin

This package is derived from the original [iotaledger/twin-hierarchies](https://github.com/iotaledger/twin-hierarchies/tree/next/packages/hierarchies-connector-iota) repository.
