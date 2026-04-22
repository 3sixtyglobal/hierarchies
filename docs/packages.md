# Hierarchies Packages

## hierarchies-models

The package serves as a foundational component within the repository. Its primary purpose is to define shared interfaces, request and response models, and connector contracts. By doing so, it enables other packages to build upon a consistent and reliable base. This package is integral to ensuring that common functionality is centralised and reusable across the ecosystem.

- [README](../packages/hierarchies-models/README.md)
- [Examples](../packages/hierarchies-models/docs/examples.md)
- [Changelog](../packages/hierarchies-models/docs/changelog.md)

## hierarchies-connector-iota

This package is designed to provide a connector for Hierarchies that integrates with the IOTA network. It plays a crucial role in enabling distributed ledger integration and network-based operations, allowing applications to interact with IOTA-backed state and metadata. Its implementation reflects a focus on semantic clarity and interoperability.

- [README](../packages/hierarchies-connector-iota/README.md)
- [Examples](../packages/hierarchies-connector-iota/docs/examples.md)
- [Changelog](../packages/hierarchies-connector-iota/docs/changelog.md)

## hierarchies-connector-entity-storage

This package is designed to provide an entity storage connector for Hierarchies, supporting local persistence and test-oriented workflows. It is ideal for development and integration testing scenarios where a live network dependency is not required. Its implementation ensures that placeholder integrations can be used and swapped for full implementations as requirements evolve.

- [README](../packages/hierarchies-connector-entity-storage/README.md)
- [Examples](../packages/hierarchies-connector-entity-storage/docs/examples.md)
- [Changelog](../packages/hierarchies-connector-entity-storage/docs/changelog.md)

## hierarchies-service

This package delivers the service orchestration layer for Hierarchies, exposing REST route definitions for API integration. It centralises connector usage behind a consistent interface, supporting decoupled application logic and streamlined workflow composition. This approach helps teams maintain clear separation of concerns and enables scalable integration patterns.

- [README](../packages/hierarchies-service/README.md)
- [Examples](../packages/hierarchies-service/docs/examples.md)
- [Changelog](../packages/hierarchies-service/docs/changelog.md)

## hierarchies-rest-client

This package provides a client for calling Hierarchies service endpoints from applications and automation scripts. It streamlines integration for downstream applications by exposing a clear API for service operations while preserving compatibility with the shared contracts.

- [README](../packages/hierarchies-rest-client/README.md)
- [Examples](../packages/hierarchies-rest-client/docs/examples.md)
- [Changelog](../packages/hierarchies-rest-client/docs/changelog.md)
