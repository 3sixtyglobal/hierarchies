// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntityStorageHierarchiesConnectorConfig } from "./IEntityStorageHierarchiesConnectorConfig.js";

/**
 * Options for the entity storage hierarchies connector constructor.
 */
export interface IEntityStorageHierarchiesConnectorConstructorOptions {
	/**
	 * The entity storage type for federation data.
	 * @default federation
	 */
	federationEntityStorageType?: string;

	/**
	 * The wallet connector type.
	 * @default wallet
	 */
	walletConnectorType?: string;

	/**
	 * The logging component type.
	 */
	loggingComponentType?: string;

	/**
	 * The configuration for the entity storage hierarchies connector.
	 */
	config?: IEntityStorageHierarchiesConnectorConfig;
}
