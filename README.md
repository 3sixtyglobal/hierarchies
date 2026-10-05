# TWIN Hierarchies

Hierarchies provides modular components for building, integrating, and extending digital asset hierarchy workflows. The repository enables teams to compose, connect, and orchestrate service, client, and connector layers using a shared contract for interoperability. Its structure supports both rapid prototyping and production-grade extension, allowing placeholder integrations to be swapped for full implementations as requirements evolve.

## Packages

- [hierarchies-models](packages/hierarchies-models/README.md) - Shared interfaces, request and response models, and connector contracts.
- [hierarchies-connector-iota](packages/hierarchies-connector-iota/README.md) - IOTA-backed connector for network operations and on-ledger state.
- [hierarchies-connector-entity-storage](packages/hierarchies-connector-entity-storage/README.md) - Entity storage connector for local persistence and test-oriented workflows.
- [hierarchies-service](packages/hierarchies-service/README.md) - Service orchestration with REST route generation.
- [hierarchies-rest-client](packages/hierarchies-rest-client/README.md) - HTTP client for calling service endpoints from applications.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-hierarchies](https://github.com/iotaledger/twin-hierarchies) repository.
